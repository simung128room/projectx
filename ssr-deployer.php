<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(0);
set_time_limit(900); 
session_start();
date_default_timezone_set('Asia/Bangkok');

// --- DirectAdmin Configuration (To be filled by admin) ---
$da_host       = "https://dasg1.hostypanel.com:2222"; 
$da_user       = "user host web";                          
$da_pass       = "pass host web";                      

$current_host  = filter_var($_SERVER['HTTP_HOST'], FILTER_SANITIZE_URL);
$host_parts    = explode('.', $current_host);
if (count($host_parts) >= 2) {
    $base_domain = implode('.', array_slice($host_parts, -2));
} else {
    $base_domain = "apexstore.xyz";
}

$sys_data_dir  = __DIR__ . '/storage_system_data';
$binding_file  = $sys_data_dir . '/active_deployments.json';

if (!is_dir($sys_data_dir)) {
    @mkdir($sys_data_dir, 0777, true);
    @file_put_contents($sys_data_dir . '/.htaccess', "Deny from all");
}

function get_secure_client_ip() {
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ip_array = explode(',', $_SERVER[$header]);
            $ip = trim($ip_array[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
        }
    }
    return $_SERVER['REMOTE_ADDR'];
}

$client_ip    = get_secure_client_ip();
$deployment_db = file_exists($binding_file) ? json_decode(file_get_contents($binding_file), true) : [];
$has_deployed  = isset($deployment_db[$client_ip]);

function call_directadmin_api($endpoint, $payload) {
    global $da_host, $da_user, $da_pass;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $da_host . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, $da_user . ":" . $da_pass);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 90);
    $output = curl_exec($ch);
    curl_close($ch);
    parse_str($output, $result);
    return $result;
}

function purge_old_subdomain_files($path) {
    if (!is_dir($path)) return;
    $items = array_diff(scandir($path), ['.', '..']);
    foreach ($items as $item) {
        $current_item = $path . '/' . $item;
        if (is_dir($current_item)) {
            purge_old_subdomain_files($current_item);
            @rmdir($current_item);
        } else {
            @unlink($current_item);
        }
    }
    clearstatcache();
}

function upload_clone_to_subdomain($source, $destination, &$files_done = 0, &$folders_done = 0) {
    if (!is_dir($source)) return false;
    if (!is_dir($destination)) {
        @mkdir($destination, 0755, true);
        $folders_done++;
    }
    $dir_handle = opendir($source);
    if (!$dir_handle) return false;
    while (false !== ($file = readdir($dir_handle))) {
        if ($file != '.' && $file != '..') {
            $src_file = $source . '/' . $file;
            $dst_file = $destination . '/' . $file;
            if (is_dir($src_file)) {
                upload_clone_to_subdomain($src_file, $dst_file, $files_done, $folders_done);
            } else {
                if (@copy($src_file, $dst_file)) {
                    @chmod($dst_file, 0644);
                    $files_done++;
                }
            }
        }
    }
    closedir($dir_handle);
    return true;
}

function generate_secure_password($length = 12) {
    $pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $pass = '';
    $max = strlen($pool) - 1;
    for ($i = 0; $i < $length; $i++) {
        $pass .= $pool[random_int(0, $max)];
    }
    return $pass;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'process_deployment') {
    header('Content-Type: application/json');
    $start_execution_time = microtime(true);
    
    if ($has_deployed) {
        echo json_encode(['status' => 'error', 'message' => 'คุณเคยดำเนินการติดตั้งระบบไปแล้ว จำกัดสิทธิ์ 1 เว็บไซต์ต่อ 1 ไอพีผู้ใช้งาน']);
        exit;
    }

    $subdomain = preg_replace('/[^a-zA-Z0-9-]/', '', strtolower($_POST['subdomain']));
    if (empty($subdomain)) {
        echo json_encode(['status' => 'error', 'message' => 'กรุณากรอกชื่อซับโดเมนภาษาอังกฤษหรือตัวเลขให้ถูกต้อง']);
        exit;
    }

    call_directadmin_api("/CMD_API_SUBDOMAINS", [
        'action' => 'create', 'domain' => $base_domain, 'subdomain' => $subdomain
    ]);
    sleep(4); 
    $subdomain_folder_name = $subdomain . '.' . $base_domain;
    $domain_root_directory = dirname(__DIR__, 1);
    $subdomain_root_path = $domain_root_directory . '/' . $subdomain_folder_name . '/public_html';
    
    if (!is_dir($subdomain_root_path)) {
        $subdomain_root_path = dirname(__DIR__, 1) . '/' . $subdomain;
        if (!is_dir($subdomain_root_path)) {
            $subdomain_root_path = dirname(__DIR__, 2) . '/' . $subdomain_folder_name . '/public_html';
        }
    }
    if (!is_dir($subdomain_root_path)) {
        @mkdir($subdomain_root_path, 0755, true);
    }

    purge_old_subdomain_files($subdomain_root_path);

    $source_data_folder = __DIR__ . '/data';
    $total_files_copied = 0;
    $total_folders_copied = 0;

    if (!is_dir($source_data_folder)) {
        echo json_encode(['status' => 'error', 'message' => 'ไม่พบโฟลเดอร์ข้อมูลหลักชื่อ data ในพาธปัจจุบัน กรุณาตรวจสอบการอัปโหลด']);
        exit;
    }

    $upload_status = upload_clone_to_subdomain($source_data_folder, $subdomain_root_path, $total_files_copied, $total_folders_copied);
    if (!$upload_status || $total_files_copied === 0) {
        echo json_encode(['status' => 'error', 'message' => 'ไม่สามารถเขียนย้ายไฟล์เว็บลงในโฟลเดอร์โดเมนเป้าหมายได้ กรุณาตรวจสอบ Permission']);
        exit;
    }

    $db_ident = substr($subdomain, 0, 14); 
    $db_password_generated = generate_secure_password(14);
    
    call_directadmin_api("/CMD_API_DATABASES", [
        'action' => 'create',
        'name' => $db_ident,
        'user' => $db_ident,
        'passwd' => $db_password_generated,
        'passwd2' => $db_password_generated
    ]);
    
    $final_db_name = $da_user . "_" . $db_ident;
    $final_db_user = $final_db_name;

    $random_admin_password = generate_secure_password(10);
    $sql_file_dump = $source_data_folder . '/xwormsv1.sql'; 
    $sql_error = "";
    $executed_queries_count = 0;

    if (file_exists($sql_file_dump)) {
        try {
            try {
                $pdo = new PDO("mysql:host=localhost;dbname=$final_db_name;charset=utf8mb4", $final_db_user, $db_password_generated);
            } catch (PDOException $e) {
                $pdo = new PDO("mysql:host=127.0.0.1;dbname=$final_db_name;charset=utf8mb4", $final_db_user, $db_password_generated);
            }
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0); 
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql_raw_data = file_get_contents($sql_file_dump);
            $sql_raw_data = preg_replace('/USE `.*?`;/', '', $sql_raw_data);
            $sql_raw_data = preg_replace('/CREATE DATABASE IF NOT EXISTS `.*?`;/', '', $sql_raw_data);
            $queries_array = explode(";\n", $sql_raw_data);
            foreach ($queries_array as $raw_query) {
                $clean_query = trim($raw_query);
                if (!empty($clean_query)) {
                    if ($pdo->exec($clean_query) !== false) {
                        $executed_queries_count++;
                    }
                }
            }
            $secure_md5_hash = md5($random_admin_password);
            $stmt = $pdo->prepare("UPDATE users SET username = 'admin', password = :p WHERE id = 1");
            $stmt->execute([':p' => $secure_md5_hash]);
        } catch (PDOException $pdo_error) {
            $sql_error = $pdo_error->getMessage();
        }
    } else {
        $sql_error = "ไม่พบไฟล์ฐานข้อมูล xwormsv1.sql ในโฟลเดอร์คลังข้อมูลต้นฉบับ";
    }

    $target_config_files = [
        $subdomain_root_path . '/a_func.php',
        $subdomain_root_path . '/system/a_func.php'
    ];
    
    foreach ($target_config_files as $config_filepath) {
        if (file_exists($config_filepath)) {
            $config_content = file_get_contents($config_filepath);
            $config_content = preg_replace('/\$host\s*=\s*[\'"].*?[\'"];/i', '$host = "localhost";', $config_content);
            $config_content = preg_replace('/\$db_user\s*=\s*[\'"].*?[\'"];/i', '$db_user = "' . $final_db_user . '";', $config_content);
            $config_content = preg_replace('/\$db_pass\s*=\s*[\'"].*?[\'"];/i', '$db_pass = "' . $db_password_generated . '";', $config_content);
            $config_content = preg_replace('/\$db\s*=\s*[\'"].*?[\'"];/i', '$db = "' . $final_db_name . '";', $config_content);
            file_put_contents($config_filepath, $config_content);
            @chmod($config_filepath, 0644);
        }
    }

    $end_execution_time = microtime(true);
    $total_seconds_duration = round($end_execution_time - $start_execution_time, 2);

    $subdomain_final_url = "http://" . $subdomain . "." . $base_domain . "/";
    $report_payload = [
        'subdomain'          => $subdomain,
        'base_domain'        => $base_domain,
        'website_url'        => $subdomain_final_url,
        'admin_user'         => 'admin',
        'admin_pass'         => $random_admin_password,
        'sql_status'         => empty($sql_error) ? 'Success' : 'Error: ' . $sql_error,
        'copied_files_num'   => $total_files_copied,
        'copied_folders_num' => $total_folders_copied,
        'sql_queries_num'    => $executed_queries_count,
        'time_taken'         => $total_seconds_duration . " วินาที"
    ];
    
    $deployment_db[$client_ip] = $report_payload;
    file_put_contents($binding_file, json_encode($deployment_db, JSON_PRETTY_PRINT));

    echo json_encode(['status' => 'success', 'payload' => $report_payload]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APEX STORE — ระบบติดตั้งร้านค้าสำเร็จรูปอัตโนมัติ</title>
    <!-- Tailwind CSS 3.4.15 via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"IBM Plex Sans Thai"', '"Space Grotesk"', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    },
                    colors: {
                        brand: {
                            bg: '#07070a',
                            surface: '#0d0d12',
                            card: '#12121a',
                            border: 'rgba(255,255,255,0.08)',
                            primary: '#6d28d9',
                            secondary: '#a78bfa',
                            emerald: '#059669',
                            rose: '#e11d48'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #07070a;
            color: #f1f0ff;
        }
        .text-glow {
            text-shadow: 0 0 15px rgba(167, 139, 250, 0.4);
        }
        .card-glow {
            box-shadow: 0 0 40px -10px rgba(109, 40, 217, 0.15);
        }
        .brut-border {
            border: 2px solid rgba(255, 255, 255, 0.08);
        }
        .brut-border:focus-within {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
        }
    </style>
</head>
<body class="font-sans antialiased min-height-screen flex flex-col justify-between items-center py-10 px-4">
    <!-- Top Decorative Glow -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    <div class="fixed bottom-0 right-10 w-[200px] h-[200px] bg-purple-950/15 rounded-full blur-[100px] pointer-events-none -z-10"></div>

    <div class="w-full max-w-lg my-auto space-y-8 relative z-10">
        <!-- Brand Header Section -->
        <div class="text-center space-y-3">
            <div class="inline-flex items-center gap-3 bg-brand-card px-4 py-2 rounded-full border border-brand-border/40 shadow-xl">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                    <i class="fa-solid fa-server"></i>
                </div>
                <div class="text-left">
                    <h1 class="font-mono text-xl font-black uppercase tracking-wider text-white">APEX <span class="text-brand-secondary text-glow">DEPLOY</span></h1>
                    <p class="text-[10px] text-zinc-500 font-mono tracking-widest uppercase leading-none">Subdomain Engine v2.5</p>
                </div>
            </div>
            <p class="text-zinc-400 text-xs tracking-wider uppercase font-semibold">ระบบเปิดฟรีกดรับได้ทันที สะดวก รวดเร็ว ออโต้ 24 ชม.</p>
        </div>

        <!-- Main Card Block -->
        <div class="bg-brand-card/95 backdrop-blur-md rounded-[2rem] border border-white/10 p-8 md:p-10 card-glow relative overflow-hidden">
            <!-- Glowing line top -->
            <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80"></div>

            <?php if ($has_deployed): ?>
            <!-- Deployed History View -->
            <div class="space-y-6 text-center animate-in fade-in duration-300">
                <div class="w-16 h-16 bg-purple-950/30 border-2 border-purple-500 rounded-full flex items-center justify-center text-purple-400 text-3xl mx-auto shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-black text-white">พบประวัติการติดตั้งของคุณแล้ว</h2>
                    <p class="text-zinc-400 text-xs mt-2 font-medium">เพื่อความปลอดภัยและเสถียร จำกัดสิทธิ์ 1 เว็บไซต์ต่อผู้ดูแลระบบ 1 ไอพี</p>
                </div>

                <div class="bg-brand-surface border border-brand-border rounded-2xl p-5 text-left font-mono text-xs space-y-4">
                    <div class="flex items-center justify-between border-b border-white/5 pb-3">
                        <span class="text-zinc-500"><i class="fa-solid fa-link text-zinc-600 mr-1.5 w-4 text-center"></i> ลิงก์ร้านค้า</span>
                        <a href="<?php echo htmlspecialchars($deployment_db[$client_ip]['website_url']); ?>" target="_blank" class="text-brand-secondary hover:underline font-bold select-all overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] text-right"><?php echo htmlspecialchars($deployment_db[$client_ip]['website_url']); ?></a>
                    </div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-3">
                        <span class="text-zinc-500"><i class="fa-solid fa-user-shield text-zinc-600 mr-1.5 w-4 text-center"></i> บัญชีแอดมิน</span>
                        <span class="text-white font-bold select-all">admin</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-500"><i class="fa-solid fa-key text-zinc-600 mr-1.5 w-4 text-center"></i> รหัสผ่านเริ่มต้น</span>
                        <span class="bg-purple-900/30 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-black select-all">admin</span>
                    </div>
                </div>

                <a href="<?php echo htmlspecialchars($deployment_db[$client_ip]['website_url']); ?>" target="_blank" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3.5 transition-all shadow-[0_10px_25px_-5px_rgba(109,40,217,0.4)] hover:-translate-y-0.5">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> เข้าสู่หน้าจัดการร้านค้า
                </a>
            </div>

            <?php else: ?>
            <!-- Build Form View -->
            <div id="formView" class="space-y-6">
                <div class="border-b border-white/5 pb-4">
                    <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-500"><i class="fa-solid fa-gear-code mr-1.5 text-zinc-600"></i> Domain Configuration</span>
                    <h3 class="text-xl font-extrabold text-white mt-1">ตั้งค่าความต้องการระบบ</h3>
                </div>

                <div id="errorBox" class="hidden bg-red-950/30 border-2 border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 font-medium text-xs">
                    <i class="fa-solid fa-circle-exclamation mt-0.5 shrink-0"></i>
                    <span id="errorText"></span>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider">ชื่อซับโดเมนร้านค้าที่คุณต้องการ</label>
                    <div class="flex bg-brand-surface rounded-xl border border-brand-border focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/20 overflow-hidden transition-all duration-300">
                        <input 
                            type="text" 
                            id="subdomainInput" 
                            placeholder="ตัวอย่าง: myshop, masterstore" 
                            maxlength="20" 
                            class="flex-1 bg-transparent px-4 py-3.5 text-white font-bold text-sm focus:outline-none"
                            autocomplete="off" 
                            autocorrect="off" 
                            spellcheck="false"
                        >
                        <div class="bg-purple-900/20 text-brand-secondary px-4 flex items-center font-mono text-xs font-bold border-l border-brand-border shrink-0 select-none">
                            .<?php echo htmlspecialchars($base_domain); ?>
                        </div>
                    </div>
                    <p class="text-[10px] text-zinc-500 leading-relaxed">
                        * เฉพาะภาษาอังกฤษตัวเล็ก (a-z) และตัวเลข (0-9) เท่านั้น ห้ามเว้นวรรค
                    </p>
                </div>

                <div class="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4.5 flex gap-3.5">
                    <i class="fa-solid fa-circle-info text-indigo-400 mt-1 shrink-0"></i>
                    <div class="text-xs text-zinc-400 leading-relaxed font-medium">
                        เว็บร้านค้าจะถูกเพิ่มเข้าโดเมน <span class="text-brand-secondary font-bold font-mono"><?php echo htmlspecialchars($base_domain); ?></span> ติดตามการทำงานเรียลไทม์ และระบบพร้อมเข้าใช้งานทันทีหลังเสร็จสิ้น
                    </div>
                </div>

                <button type="button" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_25px_-5px_rgba(109,40,217,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50" id="deployBtn" onclick="startDeploy()">
                    <i class="fa-solid fa-rocket"></i> เริ่มระบบติดตั้งอัตโนมัติ
                </button>
            </div>

            <!-- Loader Tracking View -->
            <div id="loaderView" class="hidden space-y-8 py-4 animate-in fade-in duration-300">
                <div class="text-center space-y-4">
                    <div class="relative w-16 h-16 mx-auto">
                        <div class="absolute inset-0 rounded-full border-4 border-brand-border/40"></div>
                        <div class="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-indigo-400 animate-spin"></div>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-white">กำลังติดตั้งฐานระบบจัดเต็ม</h3>
                        <p class="text-zinc-500 text-xs font-semibold mt-1">กรุณาห้ามปิดหน้านี้ ใช้เวลาประมาณ 10-20 วินาที...</p>
                    </div>
                </div>

                <!-- Step-by-Step State Panel -->
                <div class="bg-zinc-950/40 border border-brand-border rounded-2xl p-5 space-y-4 font-medium text-xs">
                    <div class="flex items-center gap-3.5" id="s1">
                        <div class="w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0 step-indicator">
                            <i class="fa-solid fa-circle-notch fa-spin text-purple-400"></i>
                        </div>
                        <span class="text-zinc-200 step-lbl font-semibold">สร้างซับโดเมนอินเตอร์เน็ตบนเซิร์ฟเวอร์</span>
                    </div>
                    <div class="flex items-center gap-3.5" id="s2">
                        <div class="w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0 step-indicator">2</div>
                        <span class="text-zinc-500 step-lbl">คัดลอกไฟล์ต้นแบบเว็บเข้าโฟลเดอร์ระบุงาน</span>
                    </div>
                    <div class="flex items-center gap-3.5" id="s3">
                        <div class="w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0 step-indicator">3</div>
                        <span class="text-zinc-500 step-lbl">สร้างฐานข้อมูล Relational MySQL</span>
                    </div>
                    <div class="flex items-center gap-3.5" id="s4">
                        <div class="w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0 step-indicator">4</div>
                        <span class="text-zinc-500 step-lbl">นำเข้าข้อมูลตารางระบบระบบหลังบ้าน</span>
                    </div>
                    <div class="flex items-center gap-3.5" id="s5">
                        <div class="w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0 step-indicator">5</div>
                        <span class="text-zinc-500 step-lbl">ตั้งค่าไฟล์เชื่อมต่อ API ซิสเต็ม</span>
                    </div>
                </div>
            </div>

            <!-- Success Outcome Panel -->
            <div id="successView" class="hidden space-y-6 text-center animate-in fade-in duration-500">
                <div class="w-16 h-16 bg-emerald-950/30 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-black text-white">ติดตั้งเว็บไซต์โดเมนสำเร็จแล้ว!</h2>
                    <p class="text-emerald-400 text-xs mt-2 font-bold uppercase tracking-wider">WEB SHOP SYSTEM READY FOR USE</p>
                </div>

                <div class="bg-brand-surface border border-brand-border rounded-2xl p-5 text-left font-mono text-xs space-y-3.5">
                    <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span class="text-zinc-500"><i class="fa-solid fa-earth-asia mr-1.5 text-zinc-600"></i> ลิงก์ร้านค้าของคุณ</span>
                        <span class="text-brand-secondary font-bold select-all text-right overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" id="r_url"></span>
                    </div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span class="text-zinc-500"><i class="fa-solid fa-user-shield mr-1.5 text-zinc-600"></i> บัญชีแอดมิน</span>
                        <span class="text-white font-bold select-all">admin</span>
                    </div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span class="text-zinc-500"><i class="fa-solid fa-key mr-1.5 text-zinc-600"></i> รหัสผ่าน</span>
                        <span class="bg-purple-900/30 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-black select-all" id="r_pass"></span>
                    </div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span class="text-zinc-500"><i class="fa-solid fa-copy mr-1.5 text-zinc-600"></i> คัดลอกไฟล์เสร็จสิ้น</span>
                        <span class="text-emerald-400 font-bold" id="r_files"></span>
                    </div>
                    <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span class="text-zinc-500"><i class="fa-solid fa-database mr-1.5 text-zinc-600"></i> รันคำสั่ง SQL</span>
                        <span class="text-emerald-400 font-bold" id="r_queries"></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-500"><i class="fa-regular fa-clock mr-1.5 text-zinc-600"></i> ระยะเวลาที่ใช้</span>
                        <span class="text-zinc-200 font-bold" id="r_time"></span>
                    </div>
                </div>

                <a href="#" target="_blank" id="r_link" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
                    <i class="fa-solid fa-arrow-up-right-from-square animated-bounce"></i> เข้าสู่หน้าเว็บไซต์ของคุณ
                </a>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Page Footer -->
    <p class="text-center text-[11px] text-zinc-600 mt-8 font-mono select-none tracking-widest uppercase relative z-10">
        APEX DEPLOYER · AUTO BUILD ENGINE · 2026
    </p>

    <script>
    function setStep(stepNum, state) {
        const el = document.getElementById('s' + stepNum);
        if (!el) return;
        
        const indicator = el.querySelector('.step-indicator');
        const lbl = el.querySelector('.step-lbl');
        
        if (state === 'active') {
            el.classList.add('bg-purple-950/15');
            indicator.className = "w-5 h-5 rounded-full bg-purple-950 border border-purple-500/50 text-[10px] text-purple-400 flex items-center justify-center shrink-0 animated-spin-slow";
            indicator.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            lbl.className = "text-white font-semibold";
        } else if (state === 'done') {
            el.classList.remove('bg-purple-950/15');
            indicator.className = "w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 text-[10px] text-emerald-400 flex items-center justify-center shrink-0";
            indicator.innerHTML = '<i class="fa-solid fa-check"></i>';
            lbl.className = "text-zinc-400 line-through decoration-white/10 decoration-2";
        } else {
            el.classList.remove('bg-purple-950/15');
            indicator.className = "w-5 h-5 rounded-full bg-brand-surface border border-brand-border text-[9px] text-zinc-500 flex items-center justify-center shrink-0";
            indicator.innerHTML = stepNum;
            lbl.className = "text-zinc-500";
        }
    }

    function showError(msg) {
        const box = document.getElementById('errorBox');
        document.getElementById('errorText').textContent = msg;
        box.classList.remove('hidden');
    }

    function startDeploy() {
        const val = document.getElementById('subdomainInput').value.trim();
        if (!val) { showError('กรุณาระบุชื่อซับโดเมนช็อปของคุณ'); return; }
        if (!/^[a-z0-9-]+$/.test(val)) { showError('ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษตัวเล็ก (a-z) ตัวเลข (0-9) และขีดกลาง (-)'); return; }

        document.getElementById('formView').classList.add('hidden');
        document.getElementById('loaderView').classList.remove('hidden');

        // Simulated steps with timed transitions while fetch runs
        setTimeout(() => { setStep(1, 'done'); setStep(2, 'active'); }, 2000);
        setTimeout(() => { setStep(2, 'done'); setStep(3, 'active'); }, 5000);
        setTimeout(() => { setStep(3, 'done'); setStep(4, 'active'); }, 7500);
        setTimeout(() => { setStep(4, 'done'); setStep(5, 'active'); }, 10000);

        const fd = new FormData();
        fd.append('action', 'process_deployment');
        fd.append('subdomain', val);

        fetch('', { method: 'POST', body: fd })
            .then(r => {
                if (!r.ok) throw new Error('Network response not ok');
                return r.json();
            })
            .then(data => {
                document.getElementById('loaderView').classList.add('hidden');
                if (data.status === 'success') {
                    setStep(5, 'done');
                    const p = data.payload;
                    document.getElementById('r_url').textContent = p.website_url;
                    document.getElementById('r_pass').textContent = p.admin_pass;
                    document.getElementById('r_files').textContent = p.copied_files_num + ' ไฟล์';
                    document.getElementById('r_queries').textContent = p.sql_queries_num + ' คำสั่งสำเร็จ';
                    document.getElementById('r_time').textContent = p.time_taken;
                    
                    const lnk = document.getElementById('r_link');
                    lnk.href = p.website_url;
                    
                    document.getElementById('successView').classList.remove('hidden');
                } else {
                    showError(data.message);
                    document.getElementById('formView').classList.remove('hidden');
                }
            })
            .catch(() => {
                document.getElementById('loaderView').classList.add('hidden');
                showError('เกิดข้อผิดพลาดในการติดตั้งเชื่อมเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
                document.getElementById('formView').classList.remove('hidden');
            });
    }

    document.getElementById('subdomainInput')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') startDeploy();
    });
    </script>
</body>
</html>

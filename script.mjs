import fs from "fs";

let content = fs.readFileSync("src/App.tsx", "utf-8");

// 1. Remove checker imports & lazy loads
content = content.replace(/const CheckerLogsView = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/  import\("\.\/components\/CheckerLogsView"\)\.then\(\(module\) => \(\{\n    default: module\.CheckerLogsView,\n  \}\)\)\n\);\n/g, "");

content = content.replace(/const ApiProxyGenTool = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/  import\("\.\/components\/ApiProxyGenTool"\)\.then\(\(module\) => \(\{\n    default: module\.ApiProxyGenTool,\n  \}\)\)\n\);\n/g, "");

content = content.replace(/const AutoDeployTool = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/  import\("\.\/components\/AutoDeployTool"\)\.then\(\(module\) => \(\{\n    default: module\.AutoDeployTool,\n  \}\)\)\n\);\n/g, "");

content = content.replace(/const ProxyFreeTool = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/  import\("\.\/components\/ProxyFreeTool"\)\.then\(\(module\) => \(\{\n    default: module\.ProxyFreeTool,\n  \}\)\)\n\);\n/g, "");

content = content.replace(/const ToolsView = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/const toolsImport = \(\) => import\("\.\/components\/ToolsView"\);\n/g, "");

content = content.replace(/const TwoFAGenerator = lazy\([\s\S]*?\}\)\);\n/g, "");
content = content.replace(/  import\("\.\/components\/TwoFAGenerator"\)\.then\(\(module\) => \(\{\n    default: module\.TwoFAGenerator,\n  \}\)\)\n\);\n/g, "");

// Replace types
content = content.replace(/    \| "checker_logs"\n/g, "");
content = content.replace(/    \| "telegram_catcher"\n/g, "");
content = content.replace(/    \| "discord_catcher"\n/g, "");
content = content.replace(/    \| "discord_on"\n/g, "");
content = content.replace(/    \| "discord_badge"\n/g, "");
content = content.replace(/    \| "two_fa_generator"\n/g, "");
content = content.replace(/    \| "proxy_free"\n/g, "");
content = content.replace(/    \| "tools"\n/g, "");
content = content.replace(/    \| "api_proxy_gen"\n/g, "");
content = content.replace(/    \| "auto_deploy"\n/g, "");

// In validViews array
content = content.replace(/"checker_logs", /g, "");
content = content.replace(/"telegram_catcher", /g, "");
content = content.replace(/"discord_catcher", /g, "");
content = content.replace(/"discord_on", /g, "");
content = content.replace(/"discord_badge", /g, "");
content = content.replace(/"two_fa_generator", /g, "");
content = content.replace(/"proxy_free", /g, "");
content = content.replace(/"tools", /g, "");

content = content.replace(/        "checker_logs",\n/g, "");
content = content.replace(/        "telegram_catcher",\n/g, "");
content = content.replace(/        "discord_catcher",\n/g, "");
content = content.replace(/        "discord_on",\n/g, "");
content = content.replace(/        "discord_badge",\n/g, "");
content = content.replace(/        "two_fa_generator",\n/g, "");
content = content.replace(/        "proxy_free",\n/g, "");
content = content.replace(/        "tools",\n/g, "");
content = content.replace(/        "api_proxy_gen",\n/g, "");
content = content.replace(/        "auto_deploy",\n/g, "");


// Removes switches
content = content.replace(/      case "checker_logs": return "Checker Logs";\n/g, "");
content = content.replace(/      case "tools": return "ชุดเครื่องมือ";\n/g, "");
content = content.replace(/      case "telegram_catcher": return "ดักซองเทเลแกรม";\n/g, "");
content = content.replace(/      case "discord_catcher": return "ดักซองดิสคอร์ด";\n/g, "");
content = content.replace(/      case "discord_on": return "รันโทเค่นดิสคอร์ด";\n/g, "");
content = content.replace(/      case "discord_badge": return "รับตราอัตโนมัติ";\n/g, "");
content = content.replace(/      case "two_fa_generator": return "สร้างรหัส 2FA";\n/g, "");
content = content.replace(/      case "proxy_free": return "พร็อกซี่ฟรี \(Proxy\)";\n/g, "");
content = content.replace(/      case "api_proxy_gen": return "API Proxy";\n/g, "");
content = content.replace(/      case "auto_deploy": return "ระบบโคลนเว็บไซต์ร้านค้า";\n/g, "");


// LocalStorage clears
content = content.replace(/\s*localStorage\.getItem\(`checker.*?;\n/g, "");
content = content.replace(/\s*localStorage\.removeItem\(`checker.*?;\n/g, "");
content = content.replace(/\s*localStorage\.setItem\(`checker.*?;\n/g, "");

// Remove the UTILITIES section in desktop and mobile sidebars
let utilRegex = /\{\/\* Tools \*\/\}\s*\{user && \(\s*<div>\s*<div\s*className="px-3 mb-2 text-\[10px\] font-semibold text-zinc-500 tracking-wider flex items-center justify-between cursor-pointer"\s*onClick=\{\(\) => setIsDesktopToolsOpen\(!isDesktopToolsOpen\)\}\s*>\s*<span>UTILITIES<\/span>\s*<motion\.div\s*animate=\{\{ rotate: isDesktopToolsOpen \? 180 : 0 \}\}\s*transition=\{\{ duration: 0\.2 \}\}\s*>\s*<ChevronDown className="w-3\.5 h-3\.5" \/>\s*<\/motion\.div>\s*<\/div>\s*<AnimatePresence>\s*\{isDesktopToolsOpen && \(\s*<motion\.div\s*initial=\{\{ height: 0, opacity: 0 \}\}\s*animate=\{\{ height: "auto", opacity: 1 \}\}\s*exit=\{\{ height: 0, opacity: 0 \}\}\s*transition=\{\{ duration: 0\.2, ease: "easeInOut" \}\}\s*className="overflow-hidden"\s*>\s*<div className="flex flex-col gap-0\.5">\s*\{\["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"\]\.map\(str => \{\s*const \[vid, lbl\] = str\.split\(':'\);\s*return \(\s*<button key=\{vid\} onClick=\{\(\) => setActiveView\(vid\)\} className=\{\`w-full flex items-center gap-3 px-3 py-1\.5 rounded-md transition-all \$\{activeView === vid \? "bg-white\/\[0\.06\] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white\/\[0\.04\]"\}\`\}>\s*<ArrowUpRight className="w-4 h-4" \/> \{lbl\}\s*<\/button>\s*\);\s*\}\)\}\s*<\/div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>\s*<\/div>\s*\)\}/g;
content = content.replace(utilRegex, "");

let utilMobileRegex = /\{\/\* Tools \*\/\}\s*\{user && \(\s*<div>\s*<div\s*className="px-3 mb-2 text-\[10px\] font-semibold text-zinc-500 tracking-wider flex items-center justify-between cursor-pointer"\s*onClick=\{\(\) => setIsMobileToolsOpen\(!isMobileToolsOpen\)\}\s*>\s*<span>UTILITIES<\/span>\s*<motion\.div\s*animate=\{\{ rotate: isMobileToolsOpen \? 180 : 0 \}\}\s*transition=\{\{ duration: 0\.2 \}\}\s*>\s*<ChevronDown className="w-3\.5 h-3\.5" \/>\s*<\/motion\.div>\s*<\/div>\s*<AnimatePresence>\s*\{isMobileToolsOpen && \(\s*<motion\.div\s*initial=\{\{ height: 0, opacity: 0 \}\}\s*animate=\{\{ height: "auto", opacity: 1 \}\}\s*exit=\{\{ height: 0, opacity: 0 \}\}\s*transition=\{\{ duration: 0\.2, ease: "easeInOut" \}\}\s*className="overflow-hidden"\s*>\s*<div className="flex flex-col gap-0\.5">\s*\{\["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"\]\.map\(str => \{\s*const \[vid, lbl\] = str\.split\(':'\);\s*return \(\s*<button key=\{vid\} onClick=\{\(\) => \{ setActiveView\(vid\); setIsMobileMenuOpen\(false\); window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\); \}\} className=\{\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \$\{activeView === vid \? "bg-white\/\[0\.06\] text-white font-medium" : "text-zinc-400 hover:text-white"\}\`\}>\s*<ArrowUpRight className="w-4 h-4" \/> \{lbl\}\s*<\/button>\s*\);\s*\}\)\}\s*<\/div>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>\s*<\/div>\s*\)\}/g;
content = content.replace(utilMobileRegex, "");

// Now remove the components that were rendered in the App
content = content.replace(/\{\(activeView as string\) === "checker_logs" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<CheckerLogsView[\s\S]*?\/>\n/g, "");

content = content.replace(/\{\(activeView as string\) === "tools" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<ToolsView[\s\S]*?\/>\n/g, "");

content = content.replace(/\{\(activeView as string\) === "api_proxy_gen" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<ApiProxyGenTool[\s\S]*?\/>\n/g, "");

content = content.replace(/\{\(activeView as string\) === "two_fa_generator" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<TwoFAGenerator[\s\S]*?\/>\n/g, "");

content = content.replace(/\{\(activeView as string\) === "proxy_free" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<ProxyFreeTool[\s\S]*?\/>\n/g, "");

content = content.replace(/\{\(activeView as string\) === "auto_deploy" && \([\s\S]*?\}\)\n/g, "");
content = content.replace(/<AutoDeployTool[\s\S]*?\/>\n/g, "");

// A generic regex for the literal strings of the views
content = content.replace(/\{\(\s*activeView === "checker_logs"\s*\)[\s\S]*?\/>\s*\)\s*\}/g, "");
content = content.replace(/\{\(\s*activeView === "api_proxy_gen"\s*\)[\s\S]*?\/>\s*\)\s*\}/g, "");
content = content.replace(/\{\(\s*activeView === "two_fa_generator"\s*\)[\s\S]*?\/>\s*\)\s*\}/g, "");
content = content.replace(/\{\(\s*activeView === "proxy_free"\s*\)[\s\S]*?\/>\s*\)\s*\}/g, "");
content = content.replace(/\{\(\s*activeView === "auto_deploy"\s*\)[\s\S]*?\/>\s*\)\s*\}/g, "");

// Look for placeholders for telegram_catcher etc.
content = content.replace(/\{\(\["telegram_catcher", "discord_catcher", "discord_on", "discord_badge"\]\.includes\(activeView as string\)\) && \(\s*<div className="p-8 text-center text-zinc-400">\s*\[\] กำลังพัฒนาระบบนี้\.\.\.\s*<\/div>\s*\)\}/g, "");

fs.writeFileSync("src/App.tsx", content, "utf-8");


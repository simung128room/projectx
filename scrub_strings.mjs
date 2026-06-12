import fs from "fs";
let content = fs.readFileSync("src/App.tsx", "utf-8");

// Remove Bot import
content = content.replace(/Bot,\s*/g, "");

// Remove ComboTextarea component if exists
content = content.replace(/function ComboTextarea[\s\S]*?\}\n/g, "");

// Remove proxy from validViews
content = content.replace(/"checker_logs", /g, "");
content = content.replace(/"api_proxy_gen", /g, "");
content = content.replace(/"proxy_free", /g, "");
content = content.replace(/"tools", /g, "");

// Remove proxy product categories
content = content.replace(/\{ id: "proxy", name: "พร็อกซีเซสชั่นขั้นสูง", title: "พร็อกซีเซสชั่นขั้นสูง" \}/g, "");

// Remove mapping of catchers in mobile
content = content.replace(/\{id: "telegram_catcher"[\s\S]*?\},/g, "");
content = content.replace(/\{id: "discord_catcher"[\s\S]*?\},/g, "");
content = content.replace(/\{id: "discord_on"[\s\S]*?\},/g, "");
content = content.replace(/\{id: "two_fa_generator".*?\},/g, "");
content = content.replace(/\{id: "proxy_free".*?\},/g, "");
content = content.replace(/"telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"/g, "");


// Remove localStorage of checker
content = content.replace(/const savedLogs = localStorage\.getItem\(`checker_logs_main`\);\n/g, "");
content = content.replace(/const savedUserPlan = localStorage\.getItem\(`checker_userplan_main`\);\n/g, "");
content = content.replace(/const savedDailyUsage = localStorage\.getItem\(`checker_usage_main`\);\n/g, "");
content = content.replace(/const savedLastDate = localStorage\.getItem\(`checker_lastdate_main`\);\n/g, "");
content = content.replace(/localStorage\.removeItem\(`checker_.*?\);\n/g, "");
content = content.replace(/localStorage\.setItem\(`checker_.*?\);\n/g, "");

// Remove view title map
content = content.replace(/case "telegram_catcher": return "ดักซองเทเลแกรม";\n/g, "");
content = content.replace(/case "discord_catcher": return "ดักซองดิสคอร์ด";\n/g, "");
content = content.replace(/case "discord_on": return "รันโทเค่นดิสคอร์ด";\n/g, "");
content = content.replace(/case "discord_badge": return "รับตราอัตโนมัติ";\n/g, "");
content = content.replace(/case "two_fa_generator": return "สร้างรหัส 2FA";\n/g, "");
content = content.replace(/case "proxy_free": return "พร็อกซี่ฟรี \(Proxy\)";\n/g, "");

// Remove checker logs view conditional
content = content.replace(/\{\(activeView as string\) === "checker_logs" && \([\s\S]*?<CheckerLogsView[\s\S]*?\}\)/, "");

// Remove strings mentioning botnet, proxy etc
content = content.replace(/เพื่อใช้เป็นหลักฐานและป้องกันเหตุโจมตีระบบ \(DDoS\/BotNet\)/g, "เพื่อใช้เป็นหลักฐานและป้องกันเหตุโจมตีระบบ");
content = content.replace(/สำหรับการใช้เครื่องมือ Checkers ใดๆ ก็ตามบนเว็บไซต์/g, "");
content = content.replace(/โดยไม่สูญเสียความแม่นยำ พร้อมเทคโนโลยีคัดกรอง Proxy/g, "โดยไม่สูญเสียความแม่นยำ");
content = content.replace(/และขับเคลื่อนเซิร์ฟเวอร์ด้วย Proxy ป้องกันการรุกล้ำ/g, "");
content = content.replace(/\{\[ \]\.map\(str => \{[\s\S]*?\}\)\}\s*\<\/div>/g, ""); // Remove the empty map that causes errors

fs.writeFileSync("src/App.tsx", content, "utf-8");

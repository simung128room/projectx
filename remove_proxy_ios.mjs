import fs from "fs";
let content = fs.readFileSync("src/App.tsx", "utf-8");

content = content.replace(/ \| "proxy_ff_ios"\n/g, "");

fs.writeFileSync("src/App.tsx", content, "utf-8");

import fs from "fs";
let content = fs.readFileSync("src/App.tsx", "utf-8");

// Wipe out lines 1063 to 1371 roughly (all checker logic)
const startMarkerRegex = /const checkSingle = async \([\s\S]*?const \[useCustomCursor/m;
content = content.replace(startMarkerRegex, "const [useCustomCursor");

fs.writeFileSync("src/App.tsx", content, "utf-8");

import fs from "fs";
import path from "path";

function processClassString(classStr) {
  if (!classStr) return classStr;
  
  const classes = classStr.split(/\s+/);
  const newClasses = [];
  let hasCard = false;
  
  for (const c of classes) {
    if (c.startsWith("rounded-") || c.includes("shadow-")) continue;
    
    if (c.startsWith("bg-[#")) {
      newClasses.push("bg-card");
      hasCard = true;
    } else if (c === "border-white/10" || c === "border-white/5" || c === "border-white/20") {
      newClasses.push("border-border");
      newClasses.push("border-2");
    } else if (c.startsWith("text-zinc-")) {
      newClasses.push("text-muted-foreground");
    } else if (c.startsWith("bg-blue-") || c.startsWith("bg-purple-") || c.startsWith("bg-emerald-")) {
      newClasses.push("bg-primary");
      newClasses.push("text-primary-foreground");
    } else {
      newClasses.push(c);
    }
  }
  
  if (hasCard && !newClasses.includes("brut-card")) {
    newClasses.push("brut-card");
  }
  
  return [...new Set(newClasses)].join(" ");
}

function processFile(filepath) {
  let content = fs.readFileSync(filepath, "utf-8");
  
  // replace className="..."
  content = content.replace(/className="([^"]+)"/g, (match, p1) => {
    return `className="${processClassString(p1)}"`;
  });
  
  // replace className={`...`}
  // simplified replacement for template literals, won't handle variable interpolation perfectly but will replace static strings inside it
  content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
    return `className={\`${processClassString(p1)}\`}`;
  });

  fs.writeFileSync(filepath, content, "utf-8");
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      processFile(p);
    }
  }
}

walk("src");

const fs = require("fs");

function fixFile(p) {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, "utf-8");
  
  // Fix quotes
  c = c.replace(/text-white : 'bg-zinc-200/g, "text-white' : 'bg-zinc-200");
  c = c.replace(/cursor-not-allowed \}/g, "cursor-not-allowed' }");
  
  fs.writeFileSync(p, c);
}

fixFile("src/components/ProductDetailView.tsx");

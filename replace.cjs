const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-zinc-900/g, 'bg-red-600');
  content = content.replace(/hover:bg-zinc-800/g, 'hover:bg-red-700');
  content = content.replace(/shadow-zinc-900\/10/g, 'shadow-red-600\/20');
  content = content.replace(/shadow-zinc-900\/20/g, 'shadow-red-600\/30');
  content = content.replace(/border-zinc-900/g, 'border-red-600');
  content = content.replace(/group-hover:bg-zinc-900/g, 'group-hover:bg-red-600');
  
  content = content.replace(/bg-red-600\/40/g, 'bg-black/40');
  content = content.replace(/bg-red-600\/50/g, 'bg-black/50');
  content = content.replace(/bg-red-600\/90/g, 'bg-black/90');

  fs.writeFileSync(filePath, content, 'utf8');
}

replaceInFile('src/App.tsx');
replaceInFile('src/components/HomeView.tsx');
replaceInFile('src/components/AuthView.tsx');

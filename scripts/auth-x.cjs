const fs = require('fs');
const file = 'src/components/modals/AuthModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className={\`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 \${authMode === 'login' ? 'bg-primary/10' : 'bg-primary/10'}\`}></div>`;
const replacement = target + `
      <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full p-1.5 z-20">
        <X className="w-4 h-4" />
      </button>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Added X');
} else {
  console.log('Target not found');
}

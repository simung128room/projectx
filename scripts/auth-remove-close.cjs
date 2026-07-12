const fs = require('fs');
const file = 'src/components/modals/AuthModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<button 
          type="button"
          onClick={onClose}
          className="w-full text-muted-foreground hover:text-muted-foreground/80 text-[10px] font-medium uppercase tracking-widest mt-4"
        >
          ปิดหน้าต่าง
        </button>`;

content = content.replace(target, '');
// Handle slight variations in spacing
content = content.replace(/<button \s*type="button"\s*onClick=\{onClose\}\s*className="w-full text-muted-foreground[^>]+>\s*ปิดหน้าต่าง\s*<\/button>/g, '');

fs.writeFileSync(file, content);
console.log('Removed text close button');

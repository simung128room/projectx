const fs = require('fs');

const files = [
  'src/components/admin/ProductManagerModal.tsx',
  'src/components/admin/AddStockModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace colors
  content = content.replace(/border-\[\#374151\]/g, 'border-border');
  content = content.replace(/bg-\[\#364153\]\/10/g, 'bg-primary/10');
  content = content.replace(/text-\[\#364153\]/g, 'text-primary');
  content = content.replace(/focus:border-\[\#364153\]/g, 'focus:border-primary');
  content = content.replace(/focus:ring-\[\#364153\]\/50/g, 'focus:ring-primary/50');
  content = content.replace(/border-\[\#364153\]\/50/g, 'border-primary/50');
  content = content.replace(/bg-\[\#364153\]/g, 'bg-primary');
  content = content.replace(/hover:bg-\[\#364153\]\/90/g, 'hover:bg-primary/90');
  content = content.replace(/hover:bg-\[\#364153\]/g, 'hover:bg-primary/90');

  // Form inputs radii
  content = content.replace(/className="w-full bg-card border border-border border px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary\/50 transition-all text-sm"/g,
    'className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"');
    
  // Buttons
  content = content.replace(/className="flex-1 py-3\.5 bg-primary text-foreground text-sm font-semibold hover:bg-primary\/90 transition-all shadow-md shadow-primary\/20"/g,
    'className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"');
    
  content = content.replace(/className="flex-1 py-3\.5 bg-muted text-foreground text-sm font-semibold hover:bg-muted\/80 transition-all"/g,
    'className="flex-1 py-3.5 bg-muted rounded-xl text-foreground text-sm font-semibold hover:bg-muted/80 transition-all"');

  // Wrapper - wait it's a slide-in drawer on mobile/desktop, so it might not need rounded-2xl if it's attached to the edge. Let's see.
  // className="bg-card border-none sm:border-l border-[#374151] border w-full sm:max-w-md h-full relative overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
  content = content.replace(/className="bg-card border-none sm:border-l border-border border w-full sm:max-w-md h-full relative overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"/g,
    'className="bg-card border-none sm:border-l border-border w-full sm:max-w-md h-full relative overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300 sm:shadow-2xl"');

  fs.writeFileSync(file, content);
});
console.log('Restyled Admin Modals');

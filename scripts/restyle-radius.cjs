const fs = require('fs');

const files = [
  'src/components/modals/AuthModal.tsx',
  'src/components/modals/KeyModal.tsx',
  'src/components/modals/PolicyModals.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // AuthModal
  if(file.includes('AuthModal')) {
    content = content.replace(/className="w-full max-w-sm bg-card border border-border  p-8 animate-in fade-in zoom-in duration-300 overflow-hidden relative "/g, 
    'className="w-full max-w-sm bg-card border border-border p-8 rounded-2xl shadow-xl shadow-black/50 animate-in fade-in zoom-in duration-300 overflow-hidden relative"');
    
    // Auth inputs
    content = content.replace(/className="w-full bg-card border border-border  py-3\.5 pl-12 pr-4 outline-none focus:border-primary\/50 transition-all font-sans text-sm "/g,
    'className="w-full bg-input border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-sans text-sm"');
    
    // Auth tabs
    content = content.replace(/className="flex p-1 bg-card mb-6 relative z-10 border border-border  "/g,
    'className="flex p-1 bg-muted rounded-xl mb-6 relative z-10 border border-border/50"');
    
    // Auth tabs buttons
    content = content.replace(/className={`flex-1 py-2 text-xs font-medium transition-all \$\{authMode === 'login' \? 'bg-primary\/20 text-primary' : 'text-muted-foreground\/80 hover:text-foreground'\}`}/g,
    'className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === \'login\' ? \'bg-card text-primary shadow-sm border border-border/50\' : \'text-muted-foreground hover:text-foreground\'}`}');
    
    content = content.replace(/className={`flex-1 py-2 text-xs font-medium transition-all \$\{authMode === 'signup' \? 'bg-primary\/20 text-primary' : 'text-muted-foreground\/80 hover:text-foreground'\}`}/g,
    'className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === \'signup\' ? \'bg-card text-primary shadow-sm border border-border/50\' : \'text-muted-foreground hover:text-foreground\'}`}');

    // Submit button
    content = content.replace(/className={`w-full py-4 mt-6 text-sm font-medium transition-all flex items-center justify-center gap-2 \$\{ authMode === 'login' \? 'bg-primary hover:bg-primary\/90' : 'bg-primary\/80 hover:bg-primary\/90' \} disabled:opacity-50 disabled:cursor-not-allowed`}/g,
    'className={`w-full py-4 mt-6 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed`}');

    // Turnstile modal inside AuthModal
    content = content.replace(/className="bg-card border border-border  p-6 sm:p-8 max-w-sm w-full relative overflow-hidden flex flex-col items-center "/g,
    'className="bg-card border border-border p-6 sm:p-8 rounded-2xl max-w-sm w-full relative overflow-hidden flex flex-col items-center"');
    
    content = content.replace(/className="w-full bg-primary hover:bg-primary\/90 text-foreground font-medium py-3\.5 transition-all mb-4 text-xs"/g,
    'className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3.5 rounded-xl transition-all mb-4 text-xs"');
  }

  // KeyModal
  if(file.includes('KeyModal')) {
    content = content.replace(/className="bg-card border-border  border border-primary\/25 p-6 sm:p-8 max-w-lg w-full relative overflow-hidden my-8 "/g,
    'className="bg-card border border-border shadow-xl shadow-black/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full relative overflow-hidden my-8"');
    
    // KeyModal Crown Icon background
    content = content.replace(/className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 border border-primary\/20"/g,
    'className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 rounded-2xl"');
    
    // Input
    content = content.replace(/className="w-full bg-card border border-border  py-3 pl-10 pr-4 text-sm focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground disabled:opacity-50"/g,
    'className="w-full bg-input border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground disabled:opacity-50"');
    
    // Submit button
    content = content.replace(/className="w-full from-primary to-primary\/80 hover:from-primary\/90 hover:to-primary text-foreground font-medium py-3\.5 transition-all mt-4 disabled:opacity-50"/g,
    'className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium py-3.5 transition-all mt-4 disabled:opacity-50 shadow-lg shadow-primary/20"');
    
    // Discord button
    content = content.replace(/className="mt-4 inline-flex items-center gap-2 px-6 py-2\.5 bg-card hover:bg-\[\#4752C4\] text-foreground text-sm font-medium transition-all hover:scale-105 "/g,
    'className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-card border border-border rounded-xl hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white text-foreground text-sm font-medium transition-all hover:scale-105"');
    
    // Close button
    content = content.replace(/className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors bg-card hover:bg-muted p-2 z-20 "/g,
    'className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full p-2 z-20"');
  }

  // PolicyModals
  if(file.includes('PolicyModals')) {
    content = content.replace(/className="bg-card border border-border p-6 sm:p-8 max-w-3xl w-full max-h-\[90vh\] flex flex-col relative"/g,
    'className="bg-card border border-border rounded-2xl shadow-xl shadow-black/50 p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col relative"');
  }

  fs.writeFileSync(file, content);
});
console.log('Restyled Modals with border-radius and shadows');

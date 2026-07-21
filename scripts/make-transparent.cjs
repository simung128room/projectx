const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/HomeView.tsx',
  'src/components/ProductCard.tsx',
  'src/components/AuthView.tsx',
  'src/components/CategoriesView.tsx',
  'src/components/CategoryProductsView.tsx',
  'src/components/ContactView.tsx',
  'src/components/HistoryLogsView.tsx',
  'src/components/HistoryView.tsx',
  'src/components/LogCategoriesView.tsx',
  'src/components/MyOrdersView.tsx',
  'src/components/PopupBanner.tsx',
  'src/components/ProductDetailView.tsx',
  'src/components/ProfileView.tsx',
  'src/components/RedeemKeyView.tsx',
  'src/components/SearchView.tsx',
  'src/components/SettingsView.tsx',
  'src/components/WalletView.tsx'
];

const replacements = [
  { from: /bg-\[\#1a1f35\]/g, to: 'bg-white/5 backdrop-blur-md' },
  { from: /bg-\[\#0a0e1a\]/g, to: 'bg-black/20 backdrop-blur-lg' },
  { from: /bg-\[\#111827\]/g, to: 'bg-black/40 backdrop-blur-md' },
  { from: /border-\[\#1e293b\]/g, to: 'border-white/10' },
  { from: /border-\[\#334155\]/g, to: 'border-white/20' },
  { from: /text-\[\#f1f5f9\]/g, to: 'text-white' },
  { from: /text-slate-400/g, to: 'text-white/60' },
  { from: /text-slate-300/g, to: 'text-white/70' },
  { from: /text-slate-200/g, to: 'text-white/80' },
  { from: /text-slate-500/g, to: 'text-white/40' },
  { from: /bg-gradient-to-b from-\[\#140b2e\] to-\[\#0a0e1a\]/g, to: 'bg-transparent' }, // clear the hero solid background
  { from: /bg-gradient-to-b from-\[\#1a1f35\] to-\[\#0a0e1a\]/g, to: 'bg-white/5 backdrop-blur-lg' }
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;
    replacements.forEach(rule => {
      if (rule.from.test(content)) {
        content = content.replace(rule.from, rule.to);
        updated = true;
      }
    });
    if (updated) {
      fs.writeFileSync(file, content);
      console.log('Updated ' + file);
    }
  }
});

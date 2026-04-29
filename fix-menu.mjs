import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<button onClick=\{\(\) => setActiveView\('dashboard'\)\} className=\{`\$\{activeView === 'dashboard'.*?\}\} flex items-center gap-2`}><Home className="w-4 h-4"\/> หน้าเช็คไอดี<\/button>/g,
  `<button onClick={() => setActiveView('home')} className={\`\${activeView === 'home' ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'hover:text-cyan-400 transition-colors'} flex items-center gap-2`}><Home className="w-4 h-4"/> หน้าแรก</button>
   <button onClick={() => setActiveView('dashboard')} className={\`\${activeView === 'dashboard' ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'hover:text-cyan-400 transition-colors'} flex items-center gap-2`}><Activity className="w-4 h-4"/> หน้าเช็คไอดี</button>`
);

content = content.replace(
  /const \[activeView, setActiveView\] = useState\<'dashboard' \| 'admin' \| 'profile' \| 'logs' \| 'settings'\>\('dashboard'\);/g,
  `const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'admin' | 'profile' | 'logs' | 'settings'>('home');`
);

content = content.replace(
  /\<a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2"\>\<ShoppingCart className="w-4 h-4"\/\> ร้านค้า\<\/a\>/g,
  ''
);

content = content.replace(
  /\<button onClick=\{\(\) => \{ setActiveView\('dashboard'\); setIsMobileMenuOpen\(false\); \}\} className=\{`w-full px-4 py-3 text-left text-sm rounded-xl font-medium transition-colors flex items-center gap-3 \$\{activeView === 'dashboard'.*?\}\}\`\>\n.*\<Home className="w-4 h-4"\/\> หน้าเช็คไอดี\n.*?\<\/button\>/g,
  `<button onClick={() => { setActiveView('home'); setIsMobileMenuOpen(false); }} className={\`w-full px-4 py-3 text-left text-sm rounded-xl font-medium transition-colors flex items-center gap-3 \${activeView === 'home' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}\`}>
    <Home className="w-4 h-4"/> หน้าแรก
  </button>
  <button onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} className={\`w-full px-4 py-3 text-left text-sm rounded-xl font-medium transition-colors flex items-center gap-3 \${activeView === 'dashboard' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}\`}>
    <Activity className="w-4 h-4"/> หน้าเช็คไอดี
  </button>`
);

content = content.replace(
  /\<a href="#" className="w-full px-4 py-3 text-left text-sm rounded-xl font-medium text-zinc-400 hover:bg-white\/5 hover:text-white transition-colors flex items-center gap-3"\>\n.*?\<ShoppingCart className="w-4 h-4"\/\> ร้านค้า\n.*?\<\/a\>/g,
  ''
);

fs.writeFileSync('src/App.tsx', content);

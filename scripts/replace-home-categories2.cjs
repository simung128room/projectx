const fs = require('fs');
const file = 'src/components/HomeView.tsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = '{/* Categories Tab Selector */}';
const endStr = '<AnimatePresence mode="popLayout">';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

const newTabs = `{/* Categories Tab Selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all border cursor-pointer shadow-sm \${
              activeCategory === 'all'
                ? 'bg-teal-500/10 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(0,212,170,0.15)]'
                : 'bg-[#1a1f35] text-slate-400 border-[#1e293b] hover:border-teal-500/50 hover:text-slate-200'
            }\`}
          >
            <span>✨</span>
            <span>ทั้งหมด ({products.length})</span>
          </button>
          {categories.map((c: any) => {
            const count = products.filter((p: any) => p.category === c.id || p.category === c.name || p.category === c.title).length;
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            // Simple hash for emoji if no obvious match
            const emojis = ['💎', '🎮', '💳', '🎁', '🚀', '🔥', '👑', '🌟'];
            const hash = String(c.title).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const defaultEmoji = emojis[Math.abs(hash) % emojis.length];
            
            return (
              <button
                key={c.id || c.name}
                onClick={() => setActiveCategory(c.id || c.name || c.title)}
                className={\`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all border cursor-pointer shadow-sm \${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(0,212,170,0.15)]'
                    : 'bg-[#1a1f35] text-slate-400 border-[#1e293b] hover:border-teal-500/50 hover:text-slate-200'
                }\`}
              >
                <span>{defaultEmoji}</span>
                <span>{c.title}</span>
                <span className={\`text-[11px] px-2 py-0.5 rounded-full font-mono transition-colors \${isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-[#111827] text-slate-500'}\`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        `;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newTabs + content.substring(endIdx);
  fs.writeFileSync(file, content);
  console.log('Replaced category tabs');
} else {
  console.log('Could not find category tabs bounds');
}

const fs = require('fs');

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// The new navbar HTML logic
// Left: Logo
// Middle (desktop): Menu links
// Right (desktop): Search bar (input), login button
// Mobile: Hamburger, Logo, Search icon

const newNavbar = `        {/* QUIXYSHOP Navbar */}
        <nav className="relative top-0 z-50 w-full bg-[#0a0e1a]/85 backdrop-blur-md border-b border-[#1e293b] sticky">
          <div className="container mx-auto flex h-[72px] items-center px-4 relative justify-between gap-4">
            
            {/* Mobile Hamburger (left on mobile, hidden on desktop) */}
            <div className="flex md:hidden items-center z-[1001] relative">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 outline-none select-none relative w-10 h-10 flex items-center justify-center cursor-pointer bg-[#1a1f35] border border-[#1e293b] rounded-lg hover:border-teal-500/50" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="เมนู"
              >
                <div className="w-[18px] h-[10px] relative select-none">
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-[2px] bg-zinc-300 absolute top-0 left-0 origin-center rounded-full"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-[2px] bg-zinc-300 absolute top-[4px] left-0 origin-center rounded-full"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-[2px] bg-zinc-300 absolute bottom-0 left-0 origin-center rounded-full"
                  />
                </div>
              </button>
            </div>

            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group z-[1001]" 
              onClick={() => { setActiveView('home'); window.scrollTo(0,0); }}
            >
              <img 
                src="https://i.postimg.cc/23R21z5h/file-0000000058c07207a33e20ff92690f16.png" 
                alt="QUIXYSHOP Logo" 
                className="h-[40px] w-[40px] md:h-[44px] md:w-[44px] rounded-[10px] object-cover border-2 border-transparent bg-gradient-to-br from-blue-500 to-teal-500 p-[1px] transition-transform group-hover:scale-105" 
              />
              <span className="font-bold text-[20px] tracking-tight font-display hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">QUIXYSHOP</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <button onClick={() => { setActiveView('home'); window.scrollTo(0,0); }} className={\`text-[15px] font-medium transition-colors \${activeView === 'home' ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'}\`}>หน้าแรก</button>
              <button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className={\`text-[15px] font-medium transition-colors \${activeView === 'categories' ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'}\`}>ร้านค้า</button>
              <button onClick={() => { if (!user) { setActiveView('login'); } else { setActiveView('wallet'); } }} className={\`text-[15px] font-medium transition-colors \${activeView === 'wallet' ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'}\`}>เติมเงิน</button>
              <button onClick={() => { window.open('#', '_blank'); }} className="text-[15px] font-medium text-slate-400 hover:text-teal-400 transition-colors">ซื้อเบอร์ sms</button>
            </div>

            {/* Right side controls */}
            <div className="flex flex-1 md:flex-none items-center justify-end z-[1001] gap-3">
              <div className="hidden lg:flex relative w-[220px]">
                <Search className="w-[16px] h-[16px] text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="ค้นหาเกม / บัตรเติมเงิน..." 
                  className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-full py-2 pl-9 pr-4 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-colors"
                  onClick={() => setShowSearchPopup(true)}
                  readOnly
                />
              </div>
              
              <button 
                onClick={() => setShowSearchPopup(true)}
                className="lg:hidden text-slate-400 hover:text-white transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-[#1a1f35] border border-[#1e293b] rounded-lg"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {!user ? (
                <button 
                  onClick={() => setActiveView('login')}
                  className="px-5 py-2 md:py-2 md:px-6 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-medium text-[14px] shadow-[0_0_15px_rgba(20,184,166,0.4)] transition-all transform hover:scale-105 outline-none whitespace-nowrap"
                >
                  เข้าสู่ระบบ
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-[13px] font-bold text-white">{user.displayName || 'User'}</span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-teal-400">
                      <Wallet className="w-3 h-3" />
                      {user.balance.toFixed(2)} ฿
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileProfilePopupOpen(!isMobileProfilePopupOpen)}
                    className="w-10 h-10 rounded-full border-2 border-teal-500/50 bg-[#1a1f35] overflow-hidden flex items-center justify-center relative cursor-pointer"
                  >
                    {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-[18px] h-[18px] text-teal-400" />}
                  </button>
                </div>
              )}
            </div>
            
            {/* Desktop profile dropdown popup logic is unchanged below this section */}
          </div>
        </nav>`;

const startIdx = content.indexOf('{/* XENOBUX STORE Navbar */}');
const endIdx = content.indexOf('{/* Universal Sidebar Drawer */}');
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newNavbar + '\n        ' + content.substring(endIdx);
  fs.writeFileSync(file, content);
  console.log('Replaced Navbar');
} else {
  console.log('Could not find Navbar bounds');
}

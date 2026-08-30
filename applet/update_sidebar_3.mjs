import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace desktop sidebar
const desktopRegex = /\{\/\* Desktop Sidebar \*\/\}.*?(?=\{\/\* Main Content Area \*\/\})/s;

const desktopReplacement = `{/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#000000] border-r border-[#1e1e1e] h-screen sticky top-0 shrink-0 overflow-y-auto no-scrollbar z-[70] select-none text-[13px]">
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-4 w-full flex flex-col justify-start shrink-0">
          <div className="flex items-center gap-3 w-full">
            <img
              src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png"
              alt="APEXSTORE Logo"
              className="h-8 object-contain cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        <div className="flex-1 px-3 space-y-6 pb-8">
          
          {/* Main Menu */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">NAVIGATION</div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => { setActiveView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${activeView === "home" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                <Home className="w-4 h-4" /> หน้าแรก
              </button>
              <button onClick={() => { setActiveView("categories"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${(activeView === "categories" || activeView === "category_products") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                <ShoppingCart className="w-4 h-4" /> สินค้าทั้งหมด
              </button>
              <button onClick={() => { setActiveView(user ? "wallet" : "login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${activeView === "wallet" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                <Wallet className="w-4 h-4" /> เติมเงิน
              </button>
              <button onClick={() => { setActiveView(user ? "history" : "login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${(activeView === "history" || activeView === "my_orders") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                <History className="w-4 h-4" /> ประวัติการสั่งซื้อ
              </button>
              <button onClick={() => { setShowSearchPopup(true); }} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]">
                <Search className="w-4 h-4" /> ค้นหาสินค้า
              </button>
            </div>
          </div>

          {/* Account */}
          {user ? (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
              <div className="px-3">
                 <div className="p-3 bg-[#09090b] border border-[#1e1e1e] rounded-md flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-900 flex items-center justify-center text-white font-semibold shadow-sm shrink-0 text-base">
                         {userPlan?.username ? userPlan.username.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U")}
                      </div>
                      <div className="flex flex-col overflow-hidden leading-tight justify-center h-10">
                         <span className="text-white font-medium text-sm truncate flex items-center gap-1.5">
                            {userPlan?.username || user?.email?.split("@")[0]}
                         </span>
                         <span className="text-zinc-500 text-xs truncate flex items-center gap-1 mt-0.5">
                            {userPlan?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />} 
                            {userPlan?.isPremium ? 'Premium Member' : 'Member'}
                         </span>
                      </div>
                    </div>
                    <div className="bg-[#141416] border border-[#1e1e1e] rounded-md p-2 flex justify-between items-center text-xs mt-1">
                        <span className="text-zinc-400">ยอดเงินคงเหลือ</span>
                        <span className="font-mono text-[#10b981] font-medium">{Math.floor(userPlan?.balance || 0).toLocaleString()} ฿</span>
                    </div>
                    
                    <button onClick={() => { setActiveView("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center gap-2 py-1.5 mt-1 bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] text-zinc-300 hover:text-white rounded transition-colors text-xs font-medium">
                       <Settings className="w-3.5 h-3.5" /> จัดการบัญชี
                    </button>
                 </div>
              </div>
            </div>
          ) : (
             <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
              <div className="flex flex-col gap-2 px-3">
                <button onClick={() => { setActiveView("login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center py-1.5 bg-white text-black font-medium rounded-md transition-all active:scale-95">เข้าสู่ระบบ</button>
                <button onClick={() => { setActiveView("signup"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center py-1.5 bg-[#111] text-white font-medium rounded-md border border-[#222] transition-all hover:bg-[#222] active:scale-95">สมัครสมาชิก</button>
              </div>
             </div>
          )}

          {/* Tools */}
          {user && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">UTILITIES</div>
              <div className="flex flex-col gap-0.5">
                {["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"].map(str => {
                   const [vid, lbl] = str.split(':');
                   return (
                     <button key={vid} onClick={() => setActiveView(vid)} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${activeView === vid ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                       <ArrowUpRight className="w-4 h-4" /> {lbl}
                     </button>
                   );
                })}
              </div>
            </div>
          )}

          {/* Custom Pages */}
          {user && customPages && customPages.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">PAGES</div>
              <div className="flex flex-col gap-0.5">
                {customPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => { setSelectedPage(page); setActiveView("custom_page"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{page.title.replace(/^#+\\s*/, "")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin / Logout */}
          {user && (
            <div>
              <div className="h-px bg-[#1e1e1e] mb-3 mt-1 mx-3" />
              <div className="flex flex-col gap-0.5">
                {isAdmin && (
                  <button onClick={() => { setActiveView("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all \${activeView === "admin" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}\`}>
                    <ShieldCheck className="w-4 h-4" /> จัดการระบบ
                  </button>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-red-500/80 hover:text-red-500 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
`;

content = content.replace(desktopRegex, desktopReplacement);

// Replace mobile menu items inside AnimatePresence > motion.div > {/* Menu Items */}
const mobileRegex = /\{\/\* Menu Items \*\/\}.*?(?=<div className="flex-grow min-h-\[40px\]" \/>)/s;

const mobileReplacement = `{/* Menu Items */}
                <div className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar pb-8 mt-6 select-none text-[13px]">
                  
                  {/* Main Menu */}
                  <div>
                    <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">NAVIGATION</div>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => { setActiveView("home"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${activeView === "home" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                        <Home className="w-4 h-4" /> หน้าแรก
                      </button>
                      <button onClick={() => { setActiveView("categories"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${(activeView === "categories" || activeView === "category_products") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                        <ShoppingCart className="w-4 h-4" /> สินค้าทั้งหมด
                      </button>
                      <button onClick={() => { setActiveView(user ? "wallet" : "login"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${activeView === "wallet" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                        <Wallet className="w-4 h-4" /> เติมเงิน
                      </button>
                      <button onClick={() => { setActiveView(user ? "history" : "login"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${(activeView === "history" || activeView === "my_orders") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                        <History className="w-4 h-4" /> ประวัติการสั่งซื้อ
                      </button>
                      <button onClick={() => { setShowSearchPopup(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-zinc-400 hover:text-white">
                        <Search className="w-4 h-4" /> ค้นหาสินค้า
                      </button>
                    </div>
                  </div>

                  {/* Account */}
                  {user ? (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
                      <div className="px-3">
                         <div className="p-3 bg-[#09090b] border border-[#1e1e1e] rounded-md flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-900 flex items-center justify-center text-white font-semibold shadow-sm shrink-0 text-base">
                                 {userPlan?.username ? userPlan.username.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U")}
                              </div>
                              <div className="flex flex-col overflow-hidden leading-tight justify-center h-10">
                                 <span className="text-white font-medium text-sm truncate flex items-center gap-1.5">
                                    {userPlan?.username || user?.email?.split("@")[0]}
                                 </span>
                                 <span className="text-zinc-500 text-xs truncate flex items-center gap-1 mt-0.5">
                                    {userPlan?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />} 
                                    {userPlan?.isPremium ? 'Premium Member' : 'Member'}
                                 </span>
                              </div>
                            </div>
                            <div className="bg-[#141416] border border-[#1e1e1e] rounded-md p-2 flex justify-between items-center text-xs mt-1">
                                <span className="text-zinc-400">ยอดเงินคงเหลือ</span>
                                <span className="font-mono text-[#10b981] font-medium">{Math.floor(userPlan?.balance || 0).toLocaleString()} ฿</span>
                            </div>
                            
                            <button onClick={() => { setActiveView("settings"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center gap-2 py-1.5 mt-1 bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] text-zinc-300 hover:text-white rounded transition-colors text-xs font-medium">
                               <Settings className="w-3.5 h-3.5" /> จัดการบัญชี
                            </button>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
                      <div className="flex flex-col gap-2 px-3 pb-2">
                        <button onClick={() => { setActiveView("login"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-2 bg-white text-black font-medium rounded-md transition-all active:scale-95">เข้าสู่ระบบ</button>
                        <button onClick={() => { setActiveView("signup"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-2 bg-[#111] text-white font-medium rounded-md border border-[#222] transition-all hover:bg-[#222] active:scale-95">สมัครสมาชิก</button>
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {user && (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">UTILITIES</div>
                      <div className="flex flex-col gap-0.5">
                        {["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"].map(str => {
                          const [vid, lbl] = str.split(':');
                          return (
                            <button key={vid} onClick={() => { setActiveView(vid); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${activeView === vid ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                              <ArrowUpRight className="w-4 h-4" /> {lbl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Pages */}
                  {user && customPages && customPages.length > 0 && (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">PAGES</div>
                      <div className="flex flex-col gap-0.5">
                        {customPages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => { setSelectedPage(page); setActiveView("custom_page"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate">{page.title.replace(/^#+\\s*/, "")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin / Logout */}
                  {user && (
                    <div>
                      <div className="h-px bg-[#1e1e1e] mb-3 mt-1 mx-3" />
                      <div className="flex flex-col gap-0.5">
                        {isAdmin && (
                          <button onClick={() => { setActiveView("admin"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all \${activeView === "admin" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}\`}>
                            <ShieldCheck className="w-4 h-4" /> จัดการระบบ
                          </button>
                        )}
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-red-500/80 hover:text-red-500 hover:bg-red-500/10">
                          <LogOut className="w-4 h-4" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
`;

content = content.replace(mobileRegex, mobileReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');

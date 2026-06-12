import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* Account \/ Action Segment \*\/\}.*?(?=\{\/\* User dropdown list \*\/\})\{\/\* User dropdown list \*\/\}.*?(?=\<\/\div\>\s*\)\s*:\s*\(\s*\<div className="flex flex-col gap-2 shrink-0"\>)/s;

// Honestly regex is risky across that many lines. Let's do it like this:
// I'll grab the substring of the file and replace it.

const startMarker = '{/* Account / Action Segment */}';
const endMarker = '                  )}';
const startIdx = content.indexOf(startMarker);
const searchContentAfter = content.substring(startIdx);
// Find the end marker that closes the ternary {user ? ( ... ) : ( ... )}
// The ternary ends at class "grid grid-cols-2 gap-3 mt-1.5" ... wait, the endMarker '                 )}' occurs at line 2894.

console.log("Found start:", startIdx !== -1);

let endIdx = content.indexOf('                </div>\n\n                <div className="flex-grow min-h-[40px]" />', startIdx);
console.log("Found end:", endIdx !== -1);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `{/* Account / Action Segment */}
                <div className="px-5 mt-6 pb-6">
                  {user ? (
                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex items-center gap-2 py-1.5 mb-2 select-none px-2">
                        <span className="w-1 h-3 rounded-full bg-[#10b981]" />
                        <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest font-sans">
                          ข้อมูลบัญชี • ACCOUNT
                        </span>
                      </div>

                      <div className="mb-4 p-4 rounded-xl bg-[#09090b] border border-[#1e1e1e] flex flex-col gap-4 shrink-0 relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10 w-full cursor-pointer h-10" onClick={() => { setActiveView("profile"); setIsMobileMenuOpen(false); }}>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full border border-[#222] shrink-0 overflow-hidden bg-[#000]">
                              <img
                                src={getAvatarUrl(user?.id || userPlan?.username || user?.email?.split("@")[0] || "guest")}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col items-start pt-0.5">
                              <p className="text-[15px] font-medium text-white mb-1 leading-none tracking-wide">
                                {userPlan?.username || user?.email?.split("@")[0]}
                              </p>
                              {userPlan?.isPremium ? (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-widest leading-none h-[18px]">
                                  <Crown className="w-[10px] h-[10px] text-amber-500" /> PREMIUM
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/[0.08] text-[8px] font-bold uppercase tracking-wider h-[18px] leading-none">
                                  <User className="w-2.5 h-2.5" /> {getUserRank(userPlan, user)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        </div>
                        
                        <div className="flex items-center gap-3 bg-[#050505] p-3.5 rounded-xl border border-[#151515] relative z-10 w-full mt-1">
                          <div className="w-8 h-8 rounded-full bg-[#151515] flex items-center justify-center shrink-0">
                            <Coins className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-medium text-zinc-500 mb-0.5 font-sans tracking-wide">
                              ยอดเงินคงเหลือ
                            </span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[17px] font-semibold text-white leading-none">
                                {userPlan?.balance ? Math.floor(userPlan.balance).toLocaleString() : "0"}
                              </span>
                              <span className="text-[13px] font-semibold text-[#10b981] leading-none">
                                ฿
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col bg-[#09090b] rounded-xl border border-[#1e1e1e] overflow-hidden mb-6">
                        <button onClick={() => { setActiveView("settings"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3.5 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <Settings className="w-4 h-4 text-zinc-400 shrink-0" /> การตั้งค่าผู้ใช้
                        </button>
                        <button onClick={() => { setActiveView("wallet_history"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3.5 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <Wallet className="w-4 h-4 text-zinc-400 shrink-0" /> ประวัติเติมเงิน
                        </button>

                        <div className="h-px bg-[#1e1e1e] w-full" />

                        <div className="px-4 pb-2 pt-4 text-[11px] font-bold text-zinc-500 font-sans">
                          เครื่องมือบอทย่อย / BOT UTILITIES
                        </div>

                        <button onClick={() => { setActiveView("telegram_catcher"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" /> ดักซองเทเลแกรม
                        </button>
                        <button onClick={() => { setActiveView("discord_catcher"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" /> ดักซองดิสคอร์ด
                        </button>
                        <button onClick={() => { setActiveView("discord_on"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" /> รันโทเค่นดิสคอร์ด
                        </button>
                        <button onClick={() => { setActiveView("discord_badge"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-[#10b981] shrink-0" /> รับตราอัตโนมัติ
                        </button>
                        <button onClick={() => { setActiveView("two_fa_generator"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" /> สร้างรหัส 2FA
                        </button>
                        <button onClick={() => { setActiveView("proxy_free"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 pt-3 pb-4 text-[13px] font-medium transition-all text-zinc-300 hover:text-white hover:bg-white/[0.04]">
                          <ArrowUpRight className="w-4 h-4 text-zinc-500 shrink-0" /> พร็อกซี่ฟรี (Proxy)
                        </button>

                        <div className="h-px bg-[#1e1e1e] w-full" />
                        
                        <div className="pt-2 pb-2">
                          {isAdmin && (
                            <button onClick={() => { setActiveView("admin"); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-[#ff4444] hover:bg-[#ff4444]/10">
                              <ShieldCheck className="w-4 h-4 text-[#ff4444] shrink-0" /> จัดการระบบหลังบ้าน
                            </button>
                          )}
                          <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 text-[13px] font-medium transition-all text-[#ff4444] hover:bg-[#ff4444]/10">
                            <LogOut className="w-4 h-4 text-[#ff4444] shrink-0" /> ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col bg-[#09090b] rounded-xl border border-[#1e1e1e] overflow-hidden p-4 mt-8">
                      <button onClick={() => { setActiveView("login"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2 mb-2 bg-white text-black text-[12px] font-bold rounded-lg transition-all active:scale-95">
                        <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
                      </button>
                      <button onClick={() => { setActiveView("signup"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 py-2 bg-[#111] text-white text-[12px] font-bold rounded-lg border border-[#222] transition-all hover:bg-[#222] active:scale-95">
                        <UserPlus className="w-4 h-4" /> สมัครสมาชิก
                      </button>
                    </div>
                  )}
`;
  
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/App.tsx', content, 'utf8');
} else {
  console.log("Could not find markers.");
}

import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const checkerUI = \`
        {activeView === 'dashboard' && (
          <div>
            {/* Page Header */}
            <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                  APEX CHECK <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">BY APEX STUDIO</span>
                </h1>
                <p className="text-zinc-400 mt-2 text-sm">เครื่องมือเช็คไอดีเกมอัตโนมัติ แม่นยำ ปลอดภัย 100%</p>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-bold tracking-wide">SYSTEM ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Combo & Controls */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                      <ListChecks className="w-5 h-5 text-cyan-400" /> นำเข้าข้อมูล <span className="text-xs text-zinc-500 font-mono">({combo ? combo.trim().split('\\n').length : 0} รายการ)</span>
                    </h2>
                    <div className="flex gap-2 relative z-10">
                      <button 
                        onClick={async () => {
                          const { value: url } = await Swal.fire({
                            title: 'ดึงข้อมูลจาก URL (Pastebin/Link)',
                            input: 'url',
                            inputPlaceholder: 'https://pastebin.com/raw/...',
                            showCancelButton: true,
                            confirmButtonText: 'ดึงข้อมูล',
                            cancelButtonText: 'ยกเลิก',
                            background: '#09090b',
                            color: '#fff'
                          });
                          if (url) {
                            try {
                              Swal.showLoading();
                              const res = await axios.get(url);
                              if (res.data) {
                                setCombo(res.data);
                                Swal.fire({ title: 'สำเร็จ', text: \`ดึงข้อมูลสำเร็จ \${res.data.trim().split('\\n').length} รายการ\`, icon: 'success', timer: 2000, background: '#09090b', color: '#fff' });
                              }
                            } catch (err) {
                              Swal.fire({ title: 'ล้มเหลว', text: 'ไม่สามารถเชื่อมต่อ URL ได้', icon: 'error', background: '#09090b', color: '#fff' });
                            }
                          }
                        }} 
                        className="bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Home className="w-3.5 h-3.5" /> ดึง URL
                      </button>
                      <label className="cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" /> ไฟล์ .txt
                        <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> รายชื่อไอดี
                      </label>
                      <textarea
                        value={combo}
                        onChange={(e) => setCombo(e.target.value)}
                        className="w-full bg-[#09090b] border border-white/10 rounded-2xl p-5 text-sm font-mono focus:border-cyan-500 outline-none resize-none h-48"
                        placeholder="user:pass\\nuser|pass"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" /> ตั้งค่า Proxy (Bypass 403)
                      </label>
                      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5 h-48 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <select 
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2 text-[10px] outline-none"
                            onChange={(e) => {
                              if (e.target.value) setProxy(e.target.value);
                            }}
                          >
                            <option value="">เลือกจากประวัติ / VIP</option>
                            {proxyHistory.map((h, i) => (
                              <option key={i} value={h}>{h.substring(0, 30)}...</option>
                            ))}
                            {userPlan?.isPremium && (
                              <option value="VIP_PROXY_POOL_123">[VIP] Proxy Pool</option>
                            )}
                          </select>
                          <button 
                            onClick={() => saveProxy(proxy)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold px-3 py-1 rounded-xl"
                          >
                            บันทึก
                          </button>
                        </div>
                        <textarea 
                          value={proxy}
                          onChange={(e) => setProxy(e.target.value)}
                          placeholder="IP:PORT@USER:PASS"
                          className="w-full flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all font-mono placeholder:text-zinc-700 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 relative z-10">
                    <button
                      onClick={startCheck}
                      disabled={running}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      <Play className="w-5 h-5" fill="currentColor" /> เริ่มตรวจสอบไอดี
                    </button>
                    <button
                      onClick={stopCheck}
                      disabled={!running}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/50 hover:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                    >
                      <Square className="w-4 h-4" fill="currentColor" /> หยุดการตรวจสอบ
                    </button>
                  </div>
                </div>

                {/* Stats Dashboard */}
                <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl">
                  <h3 className="text-sm font-bold text-zinc-400 mb-5">ภาพรวมผลลัพธ์</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                      <Check className="text-green-500 mb-2 w-7 h-7" />
                      <span className="text-3xl font-bold text-white mb-1 font-mono">{validAccounts.length}</span>
                      <span className="text-xs text-zinc-500 font-medium">สำเร็จ (VALID)</span>
                    </div>
                    <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                      <X className="text-red-500 mb-2 w-7 h-7" />
                      <span className="text-3xl font-bold text-white mb-1 font-mono">{invalidCount}</span>
                      <span className="text-xs text-zinc-500 font-medium">ไม่ผ่าน (INVALID)</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button onClick={exportClean} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-sm">บันทึกปกติน (CLEAN)</button>
                    <button onClick={exportAllValid} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold text-sm w-full">บันทึกที่ผ่านทั้งหมด (ALL VALID)</button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Terminal Log */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#151518]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-[450px] flex flex-col shadow-xl">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Terminal className="text-cyan-400 w-5 h-5" /> บันทึกการทำงานสด <span className="text-xs text-zinc-500 ml-2">(LIVE LOG)</span>
                    </h3>
                    <button onClick={clearLog} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium">เคลียร์ LOG</button>
                  </div>
                  <div ref={logDivRef} className="flex-1 bg-[#09090b] border border-white/5 p-5 rounded-2xl text-xs font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 space-y-2">
                    {logs.length === 0 && <div className="text-zinc-600 italic">ยังไม่มีบันทึก...</div>}
                    {logs.map(log => (
                      <div key={log.id} className={\`\${log.colorClass} flex items-start gap-2 break-all\`}>
                        <span className="shrink-0 text-gray-500">[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {validAccounts.length > 0 && (
                  <div className="bg-[#151518]/80 border border-white/5 rounded-3xl p-6 shadow-xl">
                    <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ผลลัพธ์ที่สำเร็จ <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-sm">{validAccounts.length}</span>
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
                      {validAccounts.map((acc, idx) => (
                        <div key={idx} className="bg-[#09090b] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-emerald-400" />
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase">UID: {acc.uid} | {acc.region}</div>
                                <div className="text-white font-mono font-bold text-base">{acc.account}</div>
                              </div>
                            </div>
                            <div className="text-[11px] text-zinc-300 font-mono bg-zinc-800 px-3 py-1.5 rounded-xl border border-white/5">PASS: {acc.password}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-white/5 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">สถานะไอดี</div>
                              {acc.isClean ? 
                                <span className="text-xs text-emerald-400 font-bold"><Shield className="w-3.5 h-3.5 inline" /> CLEAN</span> : 
                                <span className="text-xs text-amber-500 font-bold">🔗 BOUND</span>
                              }
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Level.</div>
                              <span className="text-xs text-white font-bold">{acc.level}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono text-right bg-white/5 px-2 py-1 rounded-md ml-auto">
                            CHECKED_AT: {acc.cleanAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
\`;

content = content.replace(
  /<div className="p-8 text-white text-center">\\s*<h2 className="text-xl font-bold mb-4">Hello World<\\/h2>\\s*<p className="text-zinc-500">Welcome to APEX STUDIO Checker<\\/p>\\s*<\\/div>/,
  checkerUI
);

fs.writeFileSync('src/App.tsx', content);
console.log("Restored checker UI");

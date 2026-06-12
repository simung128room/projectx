import React, { useState } from 'react';
import { Globe, Copy, CheckCircle, Code, RefreshCcw, FileJson, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'motion/react';

export const ApiProxyGenTool: React.FC = () => {
  const [protocol, setProtocol] = useState<string>('all');
  const [format, setFormat] = useState<string>('txt');
  const [showApi, setShowApi] = useState(false);
  
  const generateApiUrl = () => {
    if (protocol === 'all') {
      return `https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.${format}`;
    }
    return `https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/${protocol}/data.${format}`;
  };

  const codeSnippets = {
    python: `import requests\nimport time\n\nAPI_URL = "${generateApiUrl()}"\n\ndef get_proxies():\n    try:\n        res = requests.get(API_URL)\n        return res.text.split("\\n")\n    except:\n        return []\n\n# วนลูปดึงข้อมูลทุกๆ 0.1 วินาที\nwhile True:\n    proxies = get_proxies()\n    print(f"Loaded {len(proxies)} proxies")\n    time.sleep(0.1)`,
    nodejs: `const axios = require('axios');\n\nconst API_URL = "${generateApiUrl()}";\n\nasync function getProxies() {\n    try {\n        const { data } = await axios.get(API_URL);\n        return data.split('\\n');\n    } catch (e) {\n        return [];\n    }\n}\n\n// วนลูปดึงข้อมูลทุกๆ 0.1 วินาที\nsetInterval(async () => {\n    const proxies = await getProxies();\n    console.log(\`Loaded \${proxies.length} proxies\`);\n}, 100);`,
    curl: `watch -n 0.1 curl -s "${generateApiUrl()}"`
  };

  const [activeTab, setActiveTab] = useState<'python' | 'nodejs' | 'curl'>('python');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกสำเร็จ',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      background: '#121212',
      color: '#fff'
    });
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in duration-300">
      <div>
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <Globe className="w-8 h-8 text-[#10b981]" />
          API Proxy Generator
        </h2>
        <p className="text-muted-foreground mt-2">
          สร้าง API ลิงก์สำหรับดึง Proxy ไปใช้งานกับโปรแกรมของคุณ อัปเดตเรียลไทม์ (ดึงทุก 0.1 วิได้)
        </p>
      </div>

      <div className="bg-card border border-border  p-6 ">
        <h3 className="text-lg font-bold text-white mb-4">การตั้งค่า API</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">โปรโตคอล (Protocol)</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'http', 'socks4', 'socks5'].map((p) => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`py-2 px-4 text-sm font-bold border transition-all ${protocol === p ? 'bg-[#10b981]/20 border-zinc-500 text-[#10b981]' : 'bg-[#18181B] border-border  text-muted-foreground hover:bg-[#121212] hover:text-white'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">รูปแบบข้อมูล (Format)</label>
            <div className="grid grid-cols-2 gap-2">
              {['txt', 'json'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 px-4 text-sm font-bold border transition-all ${format === f ? 'bg-[#10b981]/20 border-emerald-500 text-[#10b981]' : 'bg-[#18181B] border-border  text-muted-foreground hover:bg-[#121212] hover:text-white'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowApi(true)}
          className="mt-6 w-full bg-primary text-primary-foreground hover:bg-[#10b981] text-white font-bold py-3 border border-zinc-500/50 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" /> สร้าง API Link
        </button>
      </div>

      <AnimatePresence>
        {showApi && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-card border border-zinc-500/30 p-6 relative overflow-hidden ">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary text-primary-foreground"></div>
              <h3 className="text-lg font-bold text-white mb-2">API URL ของคุณ</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input 
                  type="text" 
                  readOnly 
                  value={generateApiUrl()}
                  className="w-full flex-1 bg-black/50 border border-border  py-3 px-4 text-[#10b981] font-mono text-sm focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(generateApiUrl())}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-[#10b981]/30 text-[#10b981] py-3 px-6 border border-zinc-500/30 transition-all font-bold flex items-center justify-center gap-2 shrink-0"
                >
                  <Copy className="w-4 h-4" /> คัดลอกลิงก์
                </button>
              </div>
            </div>

            <div className="bg-card border border-border  overflow-hidden ">
              <div className="bg-card px-4 py-3 sm:px-6 sm:py-4 border-b border-border  flex flex-col sm:flex-row sm:items-center justify-between gap-3 ">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 whitespace-nowrap">
                  <Code className="w-4 h-4 text-muted-foreground" /> ตัวอย่างโค้ด (ดึงทุก 0.1 วิ)
                </h3>
                <div className="flex bg-black/50 p-1 border border-border  gap-1 shrink-0">
                  {['python', 'nodejs', 'curl'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all ${activeTab === tab ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 relative group">
                <button 
                  onClick={() => copyToClipboard(codeSnippets[activeTab])}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-card hover:bg-white/10 border border-border  p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-muted-foreground hover:text-white "
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre className="font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed overflow-x-auto p-2">
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
            </div>
            
            <div className="bg-primary text-primary-foreground border border-emerald-500/20 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#10b981] mb-1">คำแนะนำการดึงข้อมูลความเร็วสูง</h4>
                <p className="text-xs text-[#10b981]/80 leading-relaxed">
                  เมื่อใช้งานลูปความเร็วสูง (0.1 วินาที) แนะนำให้ใช้ .txt format เพื่อการประมวลผลที่รวดเร็วที่สุด การตั้ง Timeout ในการเชื่อมต่อก็สำคัญ เพื่อป้องกันไม่ให้ Threads/Memory ค้างเมื่อการเชื่อมต่อมีความล่าช้า
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

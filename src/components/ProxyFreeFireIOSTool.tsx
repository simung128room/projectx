import React from "react";
import { motion } from "motion/react";
import { Copy, Shield, ShieldCheck, Download, ExternalLink, Server } from "lucide-react";
import Swal from "sweetalert2";

export const ProxyFreeFireIOSTool: React.FC = () => {
  const serverIp = "162.220.167.141";
  const port = "9090";
  const certLink = "https://www.mediafire.com/file/o2ggqnmvxsiu6ya/BFUN+IOS+PROXY+💀.cer/file";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "คัดลอกสำเร็จ",
      text: `คัดลอก ${label} แล้ว`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      background: "#3B82F6",
      color: "#fff",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            PROXY FREE FIRE IOS
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg leading-relaxed">
            พร็อกซี่สำหรับใช้งานกับ Free Fire บนระบบ iOS พร้อมไฟล์ Certificate เชื่อมต่อเพื่อใช้งานได้ทันที
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Server Info Card */}
        <div className="bg-card border border-border border-2 p-8 relative overflow-hidden flex flex-col justify-between brut-card">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary text-primary-foreground blur-[60px] pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">การเชื่อมต่อ</h3>
                <p className="text-sm text-muted-foreground">SERVER & PORT</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card p-4 border border-border border-2 flex items-center justify-between brut-card">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground mb-1 tracking-wider">SERVER (IP)</div>
                  <div className="text-white font-mono text-lg">{serverIp}</div>
                </div>
                <button 
                  onClick={() => copyToClipboard(serverIp, "Server IP")}
                  className="w-10 h-10 bg-card hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all brut-card"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-card p-4 border border-border border-2 flex items-center justify-between brut-card">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground mb-1 tracking-wider">PORT</div>
                  <div className="text-white font-mono text-lg">{port}</div>
                </div>
                <button 
                  onClick={() => copyToClipboard(port, "Port")}
                  className="w-10 h-10 bg-card hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-all brut-card"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="bg-card border border-border border-2 p-8 relative overflow-hidden flex flex-col justify-between brut-card">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-primary text-primary-foreground blur-[60px] pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary text-primary-foreground text-blue-600 flex items-center justify-center border border-emerald-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">ใบรับรอง</h3>
                <p className="text-sm text-muted-foreground">CERTIFICATE FILE</p>
              </div>
            </div>

            <div className="bg-card p-6 border border-border border-2 brut-card">
              <div className="flex flex-col items-center text-center">
                <Download className="w-10 h-10 text-muted-foreground mb-3" />
                <div className="text-sm font-medium text-muted-foreground mb-1">BFUN IOS PROXY 💀.cer</div>
                <div className="text-xs text-muted-foreground mb-6">ไฟล์ใบรับรองสำหรับติดตั้งในเครื่อง iOS</div>
                
                <a 
                  href={certLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary text-primary-foreground hover:bg-blue-700 text-white py-3 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> ดาวน์โหลดจาก Mediafire
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-primary text-primary-foreground border border-blue-500/20 p-6 mt-8">
        <h3 className="text-blue-400 font-bold mb-2">วิธีติดตั้งเบื้องต้น (iOS)</h3>
        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2 leading-relaxed">
          <li>เชื่อมต่อ Wi-Fi ที่ต้องการใช้งานและเข้าไปที่ตั้งค่ากำหนดค่า Proxy ของ Wi-Fi เป็น Manual</li>
          <li>ใส่ Server IP (<span className="text-white font-mono">{serverIp}</span>) และ Port (<span className="text-white font-mono">{port}</span>)</li>
          <li>ดาวน์โหลดไฟล์ Certificate จากเครื่องมือนี้และทำการติดตั้ง Profile</li>
          <li>ไปที่ Settings &gt; General &gt; About &gt; Certificate Trust Settings และเปิดสวิตช์อนุญาตสำหรับ Certificate ที่เพิ่งติดตั้ง</li>
          <li>เข้าเกมใช้งานได้ทันที</li>
        </ol>
      </div>
    </div>
  );
};

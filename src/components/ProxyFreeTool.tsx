import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Globe,
  Copy,
  CheckCircle,
  RefreshCcw,
  Download,
  Shield,
} from "lucide-react";
import Swal from "sweetalert2";

interface ProxyStats {
  http: number;
  socks4: number;
  socks5: number;
  total: number;
  lastUpdated: string;
}

export const ProxyFreeTool: React.FC = () => {
  const [proxies, setProxies] = useState<{
    http: string[];
    socks4: string[];
    socks5: string[];
  }>({
    http: [],
    socks4: [],
    socks5: [],
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProxyStats>({
    http: 0,
    socks4: 0,
    socks5: 0,
    total: 0,
    lastUpdated: "-",
  });
  const [activeTab, setActiveTab] = useState<
    "all" | "http" | "socks4" | "socks5"
  >("all");

  const fetchProxies = async () => {
    setLoading(true);
    try {
      const fetchList = async (protocol: string) => {
        const res = await fetch(
          `https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/${protocol}/data.txt`,
        );
        if (!res.ok) return [];
        const text = await res.text();
        return text.split("\n").filter((p) => p.trim() !== "");
      };

      const [httpProxies, socks4Proxies, socks5Proxies] = await Promise.all([
        fetchList("http"),
        fetchList("socks4"),
        fetchList("socks5"),
      ]);

      setProxies({
        http: httpProxies,
        socks4: socks4Proxies,
        socks5: socks5Proxies,
      });

      setStats({
        http: httpProxies.length,
        socks4: socks4Proxies.length,
        socks5: socks5Proxies.length,
        total: httpProxies.length + socks4Proxies.length + socks5Proxies.length,
        lastUpdated: new Date().toLocaleTimeString("th-TH"),
      });
    } catch (error) {
      console.error("Failed to fetch proxies:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดไม่สำเร็จ",
        text: "ไม่สามารถดึงข้อมูล Proxy จาก Github ได้",
        background: "#0B0F14",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProxies();
  }, []);

  const getDisplayList = () => {
    if (activeTab === "http") return proxies.http;
    if (activeTab === "socks4") return proxies.socks4;
    if (activeTab === "socks5") return proxies.socks5;
    return [...proxies.http, ...proxies.socks4, ...proxies.socks5];
  };

  const currentList = getDisplayList();

  const copyToClipboard = () => {
    const text = currentList.join("\n");
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: "success",
      title: "คัดลอกสำเร็จ",
      text: `คัดลอก ${currentList.length} proxies แล้ว`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      background: "#1E90FF",
      color: "#fff",
    });
  };

  const downloadFile = () => {
    const text = currentList.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proxifly-${activeTab}-proxies.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#1E90FF]" />
            Free Proxy List (Proxifly)
          </h2>
          <p className="text-zinc-400 mt-2 flex items-center gap-4">
            <span>
              ดึงข้อมูล Proxy แจกฟรีอัตโนมัติจาก Github:
              proxifly/free-proxy-list
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchProxies}
            disabled={loading}
            className="bg-black/50 border border-white/10 hover:bg-white/5 text-zinc-300 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "ALL PROXIES", count: stats.total, color: "text-white" },
          { label: "HTTP/HTTPS", count: stats.http, color: "text-blue-400" },
          { label: "SOCKS4", count: stats.socks4, color: "text-purple-400" },
          { label: "SOCKS5", count: stats.socks5, color: "text-emerald-400" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#0a0d12] border border-white/5 p-6 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full transform translate-x-16 -translate-y-16 group-hover:bg-[#1E90FF]/10 transition-colors"></div>
            <p className="text-xs font-bold text-zinc-500 mb-2 tracking-wider">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black ${stat.color}`}>
                {loading ? "..." : stat.count.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-zinc-500">IPs</span>
            </div>
            {idx === 0 && (
              <div className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                อัพเดทล่าสุด: {stats.lastUpdated}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#0a0d12] border border-white/5 rounded-3xl overflow-hidden flex flex-col">
        <div className="border-b border-white/5">
          <div className="flex px-4 pt-4 overflow-x-auto hide-scrollbar">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "http", label: "HTTP / HTTPS" },
              { id: "socks4", label: "SOCKS4" },
              { id: "socks5", label: "SOCKS5" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#1E90FF] text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#1E90FF]" />
              <span className="text-sm font-bold text-white">
                รายการ Proxy ({currentList.length})
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={currentList.length === 0}
                className="bg-black border border-white/10 hover:bg-white/5 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> Copy All
              </button>
              <button
                onClick={downloadFile}
                disabled={currentList.length === 0}
                className="bg-[#1E90FF]/10 text-[#1E90FF] hover:bg-[#1E90FF]/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Download .txt
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] bg-black border border-white/10 rounded-2xl p-4 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                <RefreshCcw className="w-8 h-8 animate-spin mb-3 text-[#1E90FF]" />
                <p className="font-bold">กำลังดึงข้อมูล...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-medium">
                ไม่พบข้อมูล
              </div>
            ) : (
              <textarea
                readOnly
                value={currentList.join("\n")}
                spellCheck={false}
                className="w-full h-full bg-transparent text-xs font-mono text-zinc-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-700"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

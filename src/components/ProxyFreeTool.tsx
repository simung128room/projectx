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
        background: "#0B0D0F",
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
      background: "#3B82F6",
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
            <Globe className="w-8 h-8 text-blue-600" />
            Free Proxy List
          </h2>
          <p className="text-zinc-400 mt-2 flex items-center gap-2">
            อัปเดต Proxy อัตโนมัติจาก{" "}
            <span className="px-2 py-1 bg-[#050505]/10 rounded-lg text-xs font-mono text-white">
              proxifly/free-proxy-list
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchProxies}
            disabled={loading}
            className="bg-purple-600/10 text-blue-600 border border-[#3B82F6]/20 hover:bg-purple-600/20 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            ซิงค์ข้อมูลล่าสุด
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "ALL PROXIES",
            count: stats.total,
            color: "text-white",
            bg: "from-zinc-800/50 to-zinc-900/50",
          },
          {
            label: "HTTP/HTTPS",
            count: stats.http,
            color: "text-blue-400",
            bg: "from-blue-900/20 to-black",
          },
          {
            label: "SOCKS4",
            count: stats.socks4,
            color: "text-blue-600",
            bg: "from-purple-900/20 to-black",
          },
          {
            label: "SOCKS5",
            count: stats.socks5,
            color: "text-blue-600",
            bg: "from-emerald-900/20 to-black",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`${stat.bg} border border-white/10 p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-colors`}
          >
            <p className="text-xs font-bold text-zinc-500 mb-2 tracking-widest">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black ${stat.color}`}>
                {loading ? "..." : stat.count.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-zinc-500">IPs</span>
            </div>
            {idx === 0 && (
              <div className="mt-4 text-xs font-medium text-blue-600 flex items-center gap-1.5 bg-blue-600/10 w-max px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                อัปเดต: {stats.lastUpdated}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="border-b border-white/10 bg-[#050505]/50">
          <div className="flex overflow-x-auto hide-scrollbar px-2 pt-2">
            {[
              { id: "all", label: "ทั้งหมด (All)" },
              { id: "http", label: "HTTP / HTTPS" },
              { id: "socks4", label: "SOCKS4" },
              { id: "socks5", label: "SOCKS5" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#3B82F6] text-blue-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#121212]"
                } rounded-t-xl`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-white">
                พร้อมใช้งาน:{" "}
                <span className="text-blue-600">
                  {currentList.length.toLocaleString()}
                </span>{" "}
                รายการ
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={downloadFile}
                disabled={currentList.length === 0}
                className="flex-1 sm:flex-none justify-center bg-[#121212] hover:bg-[#1e1e1e] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> บันทึกไฟล์ (.txt)
              </button>
              <button
                onClick={copyToClipboard}
                disabled={currentList.length === 0}
                className="flex-1 sm:flex-none justify-center bg-purple-600 hover:bg-[#166BCC] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-lg/25"
              >
                <Copy className="w-4 h-4" /> คัดลอกทั้งหมด
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] h-[500px] bg-[#050505] border border-white/10 rounded-2xl p-4 overflow-hidden relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-[#050505]/50 z-10">
                <RefreshCcw className="w-10 h-10 animate-spin mb-4 text-blue-600" />
                <p className="font-bold tracking-wide">กำลังรวบรวม IP...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-medium">
                ไม่มีโปรโตคอลนี้ในขณะนี้
              </div>
            ) : null}

            <textarea
              readOnly
              value={currentList.join("\n")}
              spellCheck={false}
              className="absolute inset-0 w-full h-full p-6 bg-transparent text-[13px] leading-[1.8] font-mono text-zinc-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

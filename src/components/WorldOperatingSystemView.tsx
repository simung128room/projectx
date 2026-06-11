import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Activity,
  Cpu,
  Globe,
  Database,
  Shield,
  MessageSquare,
  Bot,
  Package,
  Coins,
  Send,
  X,
  Maximize2,
  Minus,
  RefreshCw,
  Clock,
  HardDrive,
  Users,
  Search,
  ShoppingCart,
  ChevronRight,
  Info,
  Server,
  Network
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { Product, Category } from "../types";
import Swal from "sweetalert2";

interface WorldOperatingSystemViewProps {
  products: Product[];
  categories: Category[];
  userPlan: any;
  user: any;
  setActiveView: (view: any) => void;
  onProductClick: (id: string) => void;
  onPurchase: (product: Product, qty: number) => void;
}

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: string;
  height: string;
  icon: any;
}

export const WorldOperatingSystemView: React.FC<WorldOperatingSystemViewProps> = ({
  products = [],
  categories = [],
  userPlan,
  user,
  setActiveView,
  onProductClick,
  onPurchase,
}) => {
  // Navigation back is simple
  const balance = userPlan?.balance || 0;
  const username = userPlan?.username || user?.email?.split("@")[0] || "operator-09";

  // System status states
  const [latency, setLatency] = useState(14);
  const [cpuUsage, setCpuUsage] = useState(42);
  const [ramUsage, setRamUsage] = useState(58);
  const [streamBytes, setStreamBytes] = useState(982.5);
  const [systemUptime, setSystemUptime] = useState("02:14:45");
  const [selectedNode, setSelectedNode] = useState<string>("SG-01");
  const [activeTab, setActiveTab] = useState<"all" | "premium_app" | "gaming_id" | "proxy">("all");

  // Dynamic values
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(64, prev + (Math.random() > 0.5 ? 2 : -2))));
      setCpuUsage(prev => Math.max(15, Math.min(85, prev + (Math.random() > 0.5 ? 4 : -4))));
      setRamUsage(prev => Math.max(50, Math.min(75, prev + (Math.random() > 0.5 ? 1 : -1))));
      setStreamBytes(prev => Math.max(100, prev + (Math.random() > 0.5 ? 12.5 : -12.5)));
    }, 3000);

    const uptimeInterval = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setSystemUptime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  // Window Management
  const [windows, setWindows] = useState<WindowState[]>([
    {
      id: "diagnostics",
      title: "System Diagnostics & Analytics",
      isOpen: true,
      isMinimized: false,
      x: 40,
      y: 90,
      width: "500px",
      height: "360px",
      icon: Activity,
    },
    {
      id: "node_monitor",
      title: "Node Network Overlay Map",
      isOpen: true,
      isMinimized: false,
      x: 580,
      y: 90,
      width: "600px",
      height: "360px",
      icon: Globe,
    },
    {
      id: "storefront",
      title: "Monochrome License Core",
      isOpen: true,
      isMinimized: false,
      x: 40,
      y: 480,
      width: "680px",
      height: "340px",
      icon: Package,
    },
    {
      id: "terminal_logs",
      title: "Raw Account Checker Output",
      isOpen: false,
      isMinimized: false,
      x: 740,
      y: 480,
      width: "440px",
      height: "340px",
      icon: Terminal,
    },
  ]);

  // AI Assistant sidebar state
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { role: "model", text: "WOS-09 Virtual Agent initialized. Operators can query node state, proxy specifications, or ask for account checkout codes." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  // Send message to Express backend os-assistant
  const handleSendAiMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customPrompt.trim()) return;

    const userMsg = customPrompt;
    setCustomPrompt("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await axios.post("/api/os-assistant", {
        message: userMsg,
        history: chatHistory
      });

      setChatHistory(prev => [...prev, { role: "model", text: res.data.text || "No response received." }]);
    } catch (err: any) {
      console.error("AI assistant message failed:", err);
      setChatHistory(prev => [
        ...prev,
        { role: "model", text: "Error: Failed to connect to Central Core processing. Verify GEMINI_API_KEY inside workspace." }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Node latency list
  const nodeRegistry = [
    { id: "SG-01", country: "Singapore", location: "Southeast Asia", ping: "14ms", load: "34%", status: "OPTIMIZED", ip: "103.22.45.109" },
    { id: "HK-01", country: "Hong Kong", location: "East Asia", ping: "28ms", load: "78%", status: "HIGH_TRAFFIC", ip: "119.231.12.5" },
    { id: "DE-03", country: "Frankfurt", location: "Western Europe", ping: "162ms", load: "12%", status: "STABLE", ip: "85.214.99.30" },
    { id: "US-02", country: "Oregon", location: "West US", ping: "210ms", load: "22%", status: "STABLE", ip: "34.105.12.4" }
  ];

  const getLogStream = () => {
    return [
      `[INFO] [${systemUptime}] sg_checker node status OK`,
      `[SUCCESS] Account validated successfully via SG-01 Proxy (lat: 14ms)`,
      `[TRAFFIC] Routed package: user4501 -> proxy_node-> verified`,
      `[INFO] Database transaction completed securely (Block-ID: 709A)`,
      `[SECURITY] Anti-intrusion firewall fully operational`,
      `[MONITOR] Singapore latency: 14ms | load: 34%`,
    ];
  };

  // Window actions
  const toggleWindow = (id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          return { ...w, isOpen: !w.isOpen, isMinimized: false };
        }
        return w;
      })
    );
  };

  const setWindowMinimized = (id: string, min: boolean) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: min } : w))
    );
  };

  // Drag simulation helpers
  const handleDragDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const targetWin = windows.find(w => w.id === id);
    if (!targetWin) return;
    
    const startX = e.clientX - targetWin.x;
    const startY = e.clientY - targetWin.y;
    
    const handleMouseMove = (mvEvent: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 300, mvEvent.clientX - startX));
      const newY = Math.max(50, Math.min(window.innerHeight - 200, mvEvent.clientY - startY));
      
      setWindows(prev =>
        prev.map(w => (w.id === id ? { ...w, x: newX, y: newY } : w))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === "all") return true;
    if (activeTab === "premium_app") return p.category?.toLowerCase()?.includes("แอป") || p.category?.toLowerCase()?.includes("app");
    if (activeTab === "gaming_id") return p.category?.toLowerCase()?.includes("เกม") || p.category?.toLowerCase()?.includes("id");
    if (activeTab === "proxy") return p.category?.toLowerCase()?.includes("proxy") || p.category?.toLowerCase()?.includes("พร็อก");
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black font-mono overflow-hidden relative select-none">
      
      {/* MONOCHROME WORLD MAP GRAPHIC WALLPAPER */}
      <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none">
        {/* Futuristic world map stylized illustration inside dark canvas */}
        <svg viewBox="0 0 1000 500" className="w-full h-full object-cover">
          {/* Background matrix dot grid */}
          <pattern id="dotpattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dotpattern)" />
          
          {/* Abstract stylized continents */}
          <path d="M150,150 Q180,120 220,130 T280,180 T300,220 T210,240 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          <path d="M480,100 Q550,80 600,120 T680,180 T750,230 T600,320 T520,240 T460,180 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          <path d="M220,260 Q270,300 320,380 T260,420 T180,340 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          <path d="M780,240 Q840,220 890,260 T820,380 T750,300 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
          
          {/* Scanning orbital cyber grids */}
          <circle cx="220" cy="180" r="12" stroke="#ffffff" fill="none" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: "5s" }} />
          <circle cx="580" cy="120" r="12" stroke="#ffffff" fill="none" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: "7s" }} />
          <circle cx="780" cy="280" r="12" stroke="#ffffff" fill="none" strokeWidth="0.5" className="animate-ping" style={{ animationDuration: "4s" }} />
        </svg>
      </div>

      {/* HORIZONTAL GLITCH SCAN LINES */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-white/5 opacity-50 animate-pulse pointer-events-none z-10" />

      {/* TOP COMPREHENSIVE STATUS BAR */}
      <header className="absolute inset-x-0 top-0 h-11 bg-black border-b border-white/10 flex items-center justify-between px-4 z-40 select-none">
        
        {/* Left systems ident */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-black tracking-widest text-white uppercase">
              STORETH // OS-X9
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 border-l border-white/10 pl-4">
            <span className="text-[10px] text-white/50 uppercase">UPTIME:</span>
            <span className="text-[10px] text-white font-mono">{systemUptime}</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 pl-2">
            <span className="text-[10px] text-white/50 uppercase">OPERATOR:</span>
            <span className="text-[10px] text-zinc-300 font-bold">{username}</span>
          </div>
        </div>

        {/* Middle timezone high-precision indicators */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-[10px] tracking-widest flex items-center gap-1">
            <span className="text-white/40">SG:</span>
            <span className="font-bold text-white">14ms</span>
          </div>
          <div className="text-[10px] tracking-widest flex items-center gap-1">
            <span className="text-white/40">CPU:</span>
            <span className="font-bold text-white font-mono">{cpuUsage}%</span>
          </div>
          <div className="text-[10px] tracking-widest flex items-center gap-1">
            <span className="text-white/40">RAM:</span>
            <span className="font-bold text-white font-mono">{ramUsage}%</span>
          </div>
        </div>

        {/* Right menu exits */}
        <div className="flex items-center gap-3">
          <div className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 text-white rounded font-bold font-mono">
            ฿ {Math.floor(balance).toLocaleString()}
          </div>
          <button
            onClick={() => setActiveView("home")}
            className="text-[10px] font-black uppercase text-black bg-white hover:bg-zinc-200 border border-white px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5"
          >
            ❌ CLOSE OS
          </button>
        </div>
      </header>

      {/* STUNNING FLOATING GLASS PANELS / WORKSPACE WINDOWS */}
      <main className="absolute inset-0 pt-11 pb-24 overflow-hidden z-20">
        {windows.map((win) => {
          if (!win.isOpen || win.isMinimized) return null;
          const WinIcon = win.icon;

          return (
            <div
              key={win.id}
              style={{
                position: "absolute",
                left: `${win.x}px`,
                top: `${win.y}px`,
                width: win.width,
                height: win.height,
              }}
              className="bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl flex flex-col pointer-events-auto rounded z-30 group"
            >
              {/* Header section which acts as drag handler */}
              <div
                onMouseDown={(e) => handleDragDown(win.id, e)}
                className="bg-zinc-950 border-b border-white/10 px-3 py-2 flex items-center justify-between cursor-move text-white/50 select-none hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <WinIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black tracking-wider uppercase text-white font-mono">
                    {win.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setWindowMinimized(win.id, true)}
                    className="w-4 h-4 rounded hover:bg-neutral-800 flex items-center justify-center text-xs text-zinc-400 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleWindow(win.id)}
                    className="w-4 h-4 rounded hover:bg-red-950/80 hover:text-red-300 flex items-center justify-center text-xs text-zinc-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Body Content of Windows */}
              <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-zinc-700">
                
                {/* 1. Diagnostics Panel */}
                {win.id === "diagnostics" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="border border-white/10 bg-zinc-950/60 p-3 rounded">
                        <span className="text-[9px] text-white/40 font-bold block mb-1 uppercase">CPU CORE ALLOCATION</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold font-mono text-white">{cpuUsage}%</span>
                          <span className="text-[9px] text-emerald-400 font-bold">STABLE</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 mt-2 rounded-full overflow-hidden">
                          <div className="bg-white h-full transition-all duration-300" style={{ width: `${cpuUsage}%` }} />
                        </div>
                      </div>

                      <div className="border border-white/10 bg-zinc-950/60 p-3 rounded">
                        <span className="text-[9px] text-white/40 font-bold block mb-1 uppercase">RAM OCCUPATION</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold font-mono text-white">{ramUsage}%</span>
                          <span className="text-[9px] text-white/40">16.0 GB</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 mt-2 rounded-full overflow-hidden">
                          <div className="bg-white h-full transition-all duration-300" style={{ width: `${ramUsage}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="border border-white/10 bg-zinc-950/30 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-white/40 font-bold block uppercase">NETWORK LOAD LOGS (BYTES/SEC)</span>
                        <span className="text-[9px] text-white">{streamBytes.toFixed(1)} kB/s</span>
                      </div>
                      <div className="h-16 flex items-end gap-1 border-b border-white/15 pb-1">
                        {[40, 25, 30, 45, 60, 50, 40, 35, 90, 85, 30, 40, 50, 60, 42].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="bg-white/40 hover:bg-white flex-1 transition-all h-full"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/50">
                      <span>Neural Gateway Link</span>
                      <span className="text-white">OPERATIONAL</span>
                    </div>
                  </div>
                )}

                {/* 2. Node Map Panel */}
                {win.id === "node_monitor" && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-bold">
                      Select target mainframe node cluster to monitor live latency metrics and routing.
                    </p>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {nodeRegistry.map((nd) => (
                        <button
                          key={nd.id}
                          onClick={() => setSelectedNode(nd.id)}
                          className={`p-2.5 rounded border text-left transition-all ${
                            selectedNode === nd.id
                              ? "bg-white text-black border-white"
                              : "bg-zinc-950/65 border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black">{nd.id}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${nd.status === "OPTIMIZED" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                          </div>
                          <span className="text-[9px] block opacity-65 truncate font-bold mt-1.5">{nd.country}</span>
                        </button>
                      ))}
                    </div>

                    {selectedNode && (
                      <div className="border border-white/10 bg-zinc-950/60 p-3 rounded space-y-2">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-[10px] font-bold text-white">CLUSTER INFO // {selectedNode}</span>
                          <span className="text-[10px] font-mono text-white/50">{nodeRegistry.find(n => n.id === selectedNode)?.ip}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          <div>
                            <span className="text-white/40 block">Latent Ping:</span>
                            <span className="text-white font-bold">{nodeRegistry.find(n => n.id === selectedNode)?.ping}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block">Server Load:</span>
                            <span className="text-white font-bold">{nodeRegistry.find(n => n.id === selectedNode)?.load}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block">Traffic Route:</span>
                            <span className="text-white font-bold text-emerald-400 uppercase">{nodeRegistry.find(n => n.id === selectedNode)?.status}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Product Store Panel */}
                {win.id === "storefront" && (
                  <div className="space-y-4">
                    {/* Catalog tabs */}
                    <div className="flex items-center gap-1 border-b border-white/10 pb-2 overflow-x-auto">
                      {[
                        { id: "all", label: "ALL LICENSES" },
                        { id: "premium_app", label: "PREMIUM WEB" },
                        { id: "gaming_id", label: "GAME ACCOUNTS" },
                        { id: "proxy", label: "SECURE PROXIES" }
                      ].map((tb) => (
                        <button
                          key={tb.id}
                          onClick={() => setActiveTab(tb.id as any)}
                          className={`px-3 py-1 text-[10px] font-bold border rounded whitespace-nowrap transition-all uppercase ${
                            activeTab === tb.id
                              ? "bg-white text-black border-white"
                              : "bg-transparent border-white/10 text-white/50 hover:text-white"
                          }`}
                        >
                          {tb.label}
                        </button>
                      ))}
                    </div>

                    {/* Products Grid list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          className="border border-white/10 bg-zinc-950/60 p-3 rounded hover:border-white/20 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2.5">
                              <h4 className="text-[11px] font-black text-white truncate max-w-[210px]" title={p.name}>
                                {p.name}
                              </h4>
                              <span className="text-[10px] font-mono shrink-0 font-bold text-white">฿{Math.floor(p.price)}</span>
                            </div>
                            <p className="text-[9px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {p.description || "No cyber description provided."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-white/5">
                            <span className="text-[9px] text-zinc-500">
                              STOCK: <strong className="text-white">{p.stock}</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => onProductClick(p.id)}
                                className="px-2.5 py-1 text-[9px] border border-white/20 hover:border-white text-zinc-300 rounded uppercase font-bold"
                              >
                                View Specs
                              </button>
                              <button
                                onClick={() => onPurchase(p, 1)}
                                className="px-2.5 py-1 text-[9px] bg-white text-black hover:bg-neutral-200 rounded uppercase font-black"
                              >
                                Checkout
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Terminal Logs Panel */}
                {win.id === "terminal_logs" && (
                  <div className="space-y-3 font-mono">
                    <div className="bg-black/90 text-zinc-300 p-2.5 rounded border border-white/10 h-64 overflow-auto scrollbar-thin space-y-1.5 text-[10px] select-text">
                      {getLogStream().map((log, lidx) => (
                        <div key={lidx} className="leading-relaxed">
                          <span className="text-zinc-500 mr-2">&gt;</span>
                          {log}
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5 text-white/40 mt-1">
                        <span>&gt;</span>
                        <span className="w-1.5 h-3 bg-white/60 animate-pulse inline-block" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </main>

      {/* AI CHAT CORE SIDEBAR SLEEVE */}
      <AnimatePresence>
        {isAiSidebarOpen && (
          <>
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer pointer-events-auto"
            />

            {/* Panel drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-80 md:w-96 bg-zinc-950 border-l border-white/10 z-55 flex flex-col justify-between text-white shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    WOS-09 ADVANCED COGNITIVE FRAME
                  </span>
                </div>
                <button
                  onClick={() => setIsAiSidebarOpen(false)}
                  className="w-7 h-7 hover:bg-white/5 rounded border border-transparent hover:border-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Stream Area */}
              <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 bg-zinc-950 text-xs leading-relaxed">
                {chatHistory.map((ch, cidx) => (
                  <div
                    key={cidx}
                    className={`flex flex-col space-y-1 ${
                      ch.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold font-mono">
                      {ch.role === "user" ? "operator" : "central intelligence"}
                    </span>
                    <div
                      className={`p-3 rounded max-w-[85%] select-text leading-relaxed font-sans ${
                        ch.role === "user"
                          ? "bg-white text-black font-semibold rounded-tr-none"
                          : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-none font-medium"
                      }`}
                    >
                      {ch.text}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex flex-col space-y-1 items-start">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">WOS-09 PROCESSING</span>
                    <div className="bg-zinc-900 border border-white/5 p-3 rounded rounded-tl-none flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Input section */}
              <form onSubmit={handleSendAiMessage} className="p-4 border-t border-white/10 bg-black">
                <div className="flex items-center gap-2 bg-zinc-950 border border-white/15 focus-within:border-white rounded px-3 py-2.5 transition-all">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Input cognitive neural vector prompt..."
                    className="flex-1 bg-transparent border-none text-zinc-100 focus:outline-none focus:ring-0 placeholder:text-zinc-550 outline-none font-bold"
                  />
                  <button
                    type="submit"
                    className="text-white hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* SYSTEM BOTTOM DECORATION DOCK - FUTURISTIC LAUNCHER */}
      <footer className="absolute inset-x-0 bottom-5 h-16 z-35 flex justify-center pointer-events-none select-none">
        <div className="bg-black/90 backdrop-blur-md border border-white/15 px-4 h-full rounded-2xl flex items-center justify-center gap-3.5 pointer-events-auto shadow-2xl relative select-none">
          
          {/* Diagnostic status icon to toggle window */}
          <button
            onClick={() => toggleWindow("diagnostics")}
            className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer relative group"
            title="Diagnostics"
          >
            <Activity className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              DIAGNOSTICS
            </span>
          </button>

          {/* Node Overlay icon */}
          <button
            onClick={() => toggleWindow("node_monitor")}
            className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer relative group"
            title="Node Mapping"
          >
            <Globe className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              NODES MAP
            </span>
          </button>

          {/* License storefront core */}
          <button
            onClick={() => toggleWindow("storefront")}
            className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer relative group"
            title="License Store"
          >
            <Package className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              LICENSES
            </span>
          </button>

          {/* Raw Account Checker Terminal trigger */}
          <button
            onClick={() => toggleWindow("terminal_logs")}
            className="w-11 h-11 rounded-xl bg-zinc-950 border border-white/10 hover:border-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer relative group"
            title="Terminal Outputs"
          >
            <Terminal className="w-5 h-5" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              LIVE OUTPUTS
            </span>
          </button>

          {/* Divider */}
          <div className="w-[1px] h-8 bg-white/10 self-center" />

          {/* AI Cognitive Assistant panel trigger */}
          <button
            onClick={() => setIsAiSidebarOpen(prev => !prev)}
            className={`w-11 h-11 rounded-xl border hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer relative group ${
              isAiSidebarOpen
                ? "bg-white text-black border-white"
                : "bg-zinc-950 text-zinc-400 border-white/10 hover:border-white hover:text-white"
            }`}
            title="AI Brain Core"
          >
            <Bot className="w-5 h-5" />
            {/* Unread dot indicator */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
              NEURAL AI
            </span>
          </button>

        </div>
      </footer>

    </div>
  );
};

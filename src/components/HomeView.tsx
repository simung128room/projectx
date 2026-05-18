import Swal from "sweetalert2";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CategoryCard } from "./CategoryCard";
import {
  ShoppingCart,
  Package,
  Wallet,
  Phone,
  History,
  ChevronRight,
  Bell,
  Users,
  Activity,
  Star,
  ArrowLeft,
  Key,
  LogIn,
  UserPlus,
  TrendingUp,
  Globe,
  Layers,
  BarChart3,
  User,
  Box,
  CreditCard,
  Headset,
} from "lucide-react";
import { Product, SiteStats, Category } from "../types";
import { AnimatedScroll } from "./AnimatedScroll";
import { Marquee } from "./Marquee";

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  stats: SiteStats;
  user?: any;
  siteSettings?: any;
  purchaseHistory?: any[];
  setActiveView: (view: any) => void;
  onProductClick: (id: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

const DEFAULT_BANNERS = ["https://img2.pic.in.th/-71_20260516210303.png"];

const NumberTicker = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const currentDisplay = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === prevValue.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startValue = currentDisplay.current;
    const targetValue = value || 0;

    if (targetValue <= 0) {
      setDisplayValue(targetValue);
      currentDisplay.current = targetValue;
      prevValue.current = targetValue;
      return;
    }

    let startTimestamp: number;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const nextValue = Math.floor(
        startValue + easeProgress * (targetValue - startValue),
      );
      setDisplayValue(nextValue);
      currentDisplay.current = nextValue;

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        prevValue.current = targetValue;
      }
    };
    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
};

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  stats,
  user,
  siteSettings,
  purchaseHistory,
  setActiveView,
  onProductClick,
  onSelectCategory,
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState(stats);
  const [isProductLoading, setIsProductLoading] = useState(false);

  const bannersToUse =
    siteSettings?.banners && siteSettings.banners.length > 0
      ? siteSettings.banners
      : DEFAULT_BANNERS;

  const handleProductSelect = (product: Product | null) => {
    if (product) {
      setIsProductLoading(true);
      setTimeout(() => {
        onProductClick(product.id);
        setIsProductLoading(false);
      }, 300); // reduced delay for better UX
    }
  };

  // Sync with props
  useEffect(() => {
    setRealtimeStats(stats);
  }, [stats]);

  const totalStock = Array.isArray(products)
    ? products.reduce((sum, product) => {
        // If stock is "unlimited" (represented by 99999 or more), we don't count it towards the total stock
        return sum + (product.stock >= 99999 ? 0 : product.stock);
      }, 0)
    : 0;

  useEffect(() => {
    if (bannersToUse.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannersToUse.length]);

  if (isProductLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#0a0d12]/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ x: -60, y: -30, opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
            className="text-5xl sm:text-6xl font-black text-white tracking-tighter mix-blend-multiply"
          >
            A
          </motion.div>
          <motion.div
            initial={{ x: 60, y: 30, opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              bounce: 0.5,
              delay: 0.1,
            }}
            className="text-5xl sm:text-6xl font-black text-[#1E90FF] tracking-tighter mix-blend-multiply"
          >
            X
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 font-sans text-white mt-2 sm:mt-4">
      {/* Banner carousel */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[4/1] rounded-3xl overflow-hidden shadow-sm border border-white/5 bg-[#0a0d12]">
          <AnimatePresence>
            <motion.img
              key={currentBanner}
              src={
                bannersToUse[currentBanner % (bannersToUse.length || 1)] ||
                undefined
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </AnimatedScroll>

      {/* Admin Announcement */}
      <AnimatedScroll delay={100} direction="right">
        <div className="border border-white/10 bg-[#0A0D12] rounded-xl py-2.5 px-4 flex items-center gap-2 relative overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 z-10">
            <Bell className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-white text-sm">ประกาศ</span>
            <span className="text-white/30 text-sm mx-1">|</span>
          </div>
          <div className="flex-1 relative z-10 overflow-hidden min-w-0">
            <Marquee
              text="ยินดีต้อนรับสู่ APEX STUDIO ระบบอัตโนมัติ 24 ชม. | สมัครสมาชิกวันนี้รับโปรพิเศษ"
              speed={15}
              className="text-zinc-300 text-sm font-medium"
            />
          </div>
        </div>
      </AnimatedScroll>

      {/* Real-time Stats */}
      <AnimatedScroll delay={200} direction="left">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Users */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center text-left transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-cyan-500/10">
              <Users className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                ผู้ใช้งาน
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-300">
                  <NumberTicker
                    value={
                      (realtimeStats?.users || 0) +
                      (siteSettings?.stats_users_offset || 0)
                    }
                  />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">คน</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Categories */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center text-left transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-purple-500/10">
              <Box className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                หมวดหมู่
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <NumberTicker value={categories ? categories.length : 0} />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">รายการ</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Available */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-emerald-500/10">
              <Layers className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                พร้อมจำหน่าย
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-300">
                  <NumberTicker value={totalStock} />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Stat 4: Sales (Transactions) */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-center text-left transition-all duration-300 hover:border-[#1E90FF]/50 hover:shadow-[0_0_25px_rgba(30,144,255,0.15)] hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-[#1E90FF]/10">
              <ShoppingCart className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                ยอดขาย
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(30,144,255,0.4)] transition-all duration-300">
                  <NumberTicker
                    value={
                      (realtimeStats?.sales || 0) +
                      (siteSettings?.stats_sales_offset || 0)
                    }
                  />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">ครั้ง</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Grid Menu Icons */}
      <AnimatedScroll delay={200} direction="right">
        <div
          className={`grid gap-4 ${user ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-4"}`}
        >
          {[
            {
              icon: Package,
              label: "สินค้าทั้งหมด",
              id: "Store",
              desc: "หมวดหมู่สินค้า",
              color: "blue",
              action: () => {
                setActiveView("categories");
                window.scrollTo({ top: 0, behavior: "smooth" });
              },
            },
            {
              icon: Wallet,
              label: "เติมเงิน",
              id: "Topup",
              desc: "เพิ่มเครดิต",
              color: "blue",
              action: () => {
                if (!user) {
                  Swal.fire({
                    icon: "warning",
                    title: "กรุณาเข้าสู่ระบบ",
                    text: "โปรดเข้าสู่ระบบก่อนทำการเติมเงิน",
                    confirmButtonColor: "#1E90FF",
                    background: "#0B0F14",
                    color: "#fff",
                  });
                } else {
                  setActiveView("wallet");
                }
              },
            },
            {
              icon: Headset,
              label: "ติดต่อเรา",
              id: "Contact",
              desc: "ติดต่อแอดมิน",
              color: "blue",
              action: () => setActiveView("contact"),
            },
            {
              icon: History,
              label: "ประวัติการใช้งาน",
              id: "History",
              desc: "ประวัติของคุณ",
              color: "blue",
              action: () => {
                if (!user) {
                  Swal.fire({
                    icon: "warning",
                    title: "กรุณาเข้าสู่ระบบ",
                    text: "โปรดเข้าสู่ระบบก่อนดูประวัติการใช้งาน",
                    confirmButtonColor: "#1E90FF",
                    background: "#0B0F14",
                    color: "#fff",
                  });
                } else {
                  setActiveView("history");
                }
              },
            },
          ].map((item, i) => {
            return (
              <button
                key={i}
                onClick={item.action}
                className="group relative overflow-hidden rounded-[24px] bg-[#1a1d24] border border-[#2a2d35] p-[1px] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none active:scale-95"
              >
                <div className="relative flex h-full min-h-[140px] flex-col justify-between rounded-[22px] bg-[#111318] px-5 py-5 transition-colors duration-300 group-hover:bg-[#1a1d24]">
                  {/* Background Decor Icon */}
                  <div className="absolute -bottom-6 -right-6 opacity-[0.02] text-white transition-all duration-500 group-hover:-rotate-[-15deg] group-hover:scale-125 group-hover:text-[#1a9fff] group-hover:opacity-[0.08] pointer-events-none">
                    <item.icon className="h-32 w-32" />
                  </div>

                  {/* Header (Icon + Arrow) */}
                  <div className="flex items-start justify-between relative z-10 w-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#1a1d24] border border-[#2a2d35] text-[#1a9fff] transition-all duration-500 group-hover:scale-110 group-hover:border-[#1a9fff]/30 group-hover:bg-[#1a9fff]/10 group-hover:shadow-[0_0_20px_rgba(26,159,255,0.2)]">
                      <item.icon className="h-5 w-5" />
                    </div>

                    {/* Hover Arrow Indicator */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-transparent transition-all duration-500 group-hover:bg-[#1a9fff]/10 group-hover:text-[#1a9fff] -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="relative z-10 flex flex-col items-start mt-4 w-full">
                    <span className="text-base sm:text-[17px] font-bold text-[#e5e7eb] tracking-tight transition-colors duration-300 group-hover:text-[#1a9fff]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 text-[11px] font-medium text-[#9ca3af] tracking-wide">
                      {item.desc}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </AnimatedScroll>

      {/* Categories Section */}
      <AnimatedScroll delay={220} direction="left">
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a7fe6]/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  หมวดหมู่แนะนำ
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  สินค้าแนะนำสำหรับคุณ
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
            >
              ดูเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {categories &&
              categories.slice(0, 3).map((cat, i) => {
                const catProducts = products.filter((p) => p.category === cat.name);
                let priceRangeStr = "ไม่ทราบราคา";
                let itemCountDesc = `${catProducts.length} รายการ`;

                if (catProducts.length > 0) {
                  const prices = catProducts.map((p) => p.price);
                  const minP = Math.min(...prices);
                  const maxP = Math.max(...prices);
                  priceRangeStr = minP === maxP ? `฿${minP.toLocaleString()}` : `฿${minP.toLocaleString()} - ฿${maxP.toLocaleString()}`;
                }

                return (
                  <CategoryCard
                    key={cat.id}
                    title={cat.title}
                    label="หมวดหมู่"
                    itemCountDesc={itemCountDesc}
                    priceRangeStr={catProducts.length > 0 ? priceRangeStr : undefined}
                    bgImage={cat.bannerUrl || undefined}
                    index={i}
                    onClick={() => onSelectCategory(cat.name)}
                    accentColor="#1E90FF"
                    glowColor="rgba(30,144,255,0.6)"
                    gradientFrom="#0a1f3a"
                  />
                );
              })}
          </div>
        </div>
      </AnimatedScroll>

      {/* Latest Products Feed */}
      <AnimatedScroll delay={235} direction="left">
        <div className="pt-8 w-full overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-zinc-900">
             <div>
               <h2 className="text-lg font-bold text-white leading-tight">รายการสั่งชื้อสินค้าล่าสุด</h2>
               <p className="text-[11px] text-[#1E90FF] font-medium mt-0.5">สินค้าที่ลูกค้าเพิ่งซื้อ 10 รายการล่าสุด</p>
             </div>
          </div>

          <div className="flex overflow-hidden relative w-full translate-z-0">
            <motion.div 
              className="flex gap-4 pr-4 w-max shrink-0 hover:[animation-play-state:paused]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 40, repeat: Infinity, repeatType: "loop" }}
            >
              {[...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1,2,3,4,5]), ...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1,2,3,4,5])].map((purchase: any, index) => {
                const i = index % 10;
                let isDummy = typeof purchase === 'number';
                const dummyProduct = isDummy ? products[i % (products.length || 1)] : null;
                const matchedProduct = !isDummy ? products.find(p => p.name === purchase.productName) : null;
                
                let minsAgo = Math.floor(Math.random() * 5) + i * 2 + 1; 
                if (!isDummy && purchase.date) {
                  const diffMinutes = Math.floor((Date.now() - new Date(purchase.date).getTime()) / 60000);
                  if (diffMinutes >= 0) minsAgo = diffMinutes;
                }
                let timeStr = `${minsAgo} นาทีที่แล้ว`;
                if (!isDummy && purchase.date && minsAgo >= 60) {
                   if (minsAgo < 1440) timeStr = `${Math.floor(minsAgo / 60)} ชั่วโมงที่แล้ว`;
                   else timeStr = `${Math.floor(minsAgo / 1440)} วันที่แล้ว`;
                }

                return (
                  <div 
                    key={index}
                    className="shrink-0 w-[240px] sm:w-[280px] bg-[#111318] border border-[#2a2d35] p-3 rounded-2xl flex gap-4 transition-all cursor-default hover:border-[#1a9fff]/40 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#1a1d24] border border-[#2a2d35] shrink-0 overflow-hidden relative">
                      {(matchedProduct?.imageUrl || dummyProduct?.imageUrl) ? (
                        <img src={matchedProduct?.imageUrl || dummyProduct?.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1a9fff]"><ShoppingCart className="w-6 h-6"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-[13px] font-bold text-[#e5e7eb] truncate">
                        {!isDummy && purchase.username ? purchase.username.substring(0, 2) + '***' : 'Us***'} ซื้อแล้ว
                      </div>
                      <div className="text-xs text-[#9ca3af] truncate mt-0.5">
                        {!isDummy ? purchase.productName : (dummyProduct?.name || 'สินค้าพรีเมียม')}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-[#e5e7eb]">
                          {!isDummy ? purchase.amount || 1 : 1} ชิ้น
                        </span>
                        <span className="text-[10px] text-[#6b7280] font-medium">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Featured Products */}
      <AnimatedScroll delay={250} direction="right">
        <div id="products" className="pt-12">
          <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a7fe6]/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  สินค้าแนะนำสำหรับคุณ
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  สินค้าทั่วไป
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
            >
              ดูเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-[#0B0F14] border border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group"
              >
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-[#1E90FF] tracking-tighter mb-1">
                          APEXSTORETH
                        </div>
                        <div className="text-white text-xs font-bold leading-tight">
                          PREVIEW
                          <br />
                          1500×1500
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className="absolute inset-0 bg-[#1E90FF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] cursor-pointer"
                    onClick={() => onProductClick(product.id)}
                  >
                    <div className="bg-[#0B0F14]/80 text-[#1E90FF] border border-[#1E90FF]/30 backdrop-blur-md p-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-[#1E90FF] text-white font-bold rounded-full px-4 py-1.5 text-xs">
                        สินค้าหมด
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-0.5">
                    {product.originalPrice &&
                      product.price &&
                      product.originalPrice > product.price && (
                        <span className="text-[10px] text-zinc-400 line-through">
                          ฿{(product.originalPrice || 0).toLocaleString()}
                        </span>
                      )}
                    <div className="text-[#1E90FF] font-bold text-sm">
                      ฿{(product.price || 0).toLocaleString()}
                    </div>
                  </div>

                  {product.stock <= 0 ? (
                    <button className="w-full mt-3 bg-[#1E90FF]/20 text-[#1E90FF] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                      <Package className="w-3.5 h-3.5" /> สินค้าหมด
                    </button>
                  ) : (
                    <button
                      onClick={() => onProductClick(product.id)}
                      className="w-full mt-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl py-2.5 text-xs font-bold transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อสินค้า
                    </button>
                  )}

                  <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-400 animate-pulse" : "bg-zinc-200"}`}
                    ></span>
                    คงเหลือ{" "}
                    {product.stock >= 999999
                      ? "ไม่จำกัด"
                      : `${product.stock} ชิ้น`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedScroll>
    </div>
  );
};

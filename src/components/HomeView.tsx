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
      onProductClick(product.id);
    }
  };

  // Sync with props
  useEffect(() => {
    setRealtimeStats(stats);
  }, [stats]);

  const stockOverride = siteSettings?.stats_stock_override;
  const totalStock =
    stockOverride !== undefined && stockOverride !== null
      ? Number(stockOverride)
      : realtimeStats?.stock || 0;

  useEffect(() => {
    if (bannersToUse.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannersToUse.length]);

  return (
    <div className="space-y-6 pb-24 font-sans text-white mt-2 sm:mt-4">
      {/* Banner carousel */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[4/1] rounded-xl overflow-hidden shadow-sm border border-white/5 bg-[#0a0d12]">
          <AnimatePresence>
            <motion.img loading="lazy"
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
              text="ยินดีต้อนรับสู่ระบบอัตโนมัติ 24 ชม. | สมัครสมาชิกวันนี้รับโปรพิเศษ"
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
          <div className="group relative p-6 rounded-xl border border-white/5 bg-[#0a0d12] shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-cyan-500/10">
              <Users className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                ผู้ใช้งาน
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg transition-all duration-300">
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
          <div className="group relative p-6 rounded-xl border border-white/5 bg-[#0a0d12] shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-purple-500/10">
              <Box className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                หมวดหมู่
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg transition-all duration-300">
                  <NumberTicker value={categories ? categories.length : 0} />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">รายการ</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Available */}
          <div className="group relative p-6 rounded-xl border border-white/5 bg-[#0a0d12] shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-emerald-500/10">
              <Layers className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                พร้อมจำหน่าย
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg transition-all duration-300">
                  <NumberTicker value={totalStock} />
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Stat 4: Sales (Transactions) */}
          <div className="group relative p-6 rounded-xl border border-white/5 bg-[#0a0d12] shadow-lg hover:-translate-y-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-[#3B82F6]/10">
              <ShoppingCart className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">
                ยอดขาย
              </span>
              <div className="flex items-baseline gap-2">
                <motion.span className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg transition-all duration-300">
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
                    confirmButtonColor: "#3B82F6",
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
              label: "ประวัติสั่งซื้อ",
              id: "History",
              desc: "ประวัติของคุณ",
              color: "blue",
              action: () => {
                if (!user) {
                  Swal.fire({
                    icon: "warning",
                    title: "กรุณาเข้าสู่ระบบ",
                    text: "โปรดเข้าสู่ระบบก่อนดูประวัติสั่งซื้อ",
                    confirmButtonColor: "#3B82F6",
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#1a1d24] border border-[#2a2d35] text-[#1a9fff] transition-all duration-500 group-hover:scale-110 group-hover:border-[#1a9fff]/30 group-hover:bg-[#1a9fff]/10 group-hover:shadow-lg">
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
              <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-lg shadow-lg/20">
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
                const catProducts = products.filter(
                  (p) => p.category === cat.name,
                );
                let priceRangeStr = "ไม่ทราบราคา";
                let itemCountDesc = `${catProducts.length} รายการ`;

                if (catProducts.length > 0) {
                  const prices = catProducts.map((p) => p.price);
                  const minP = Math.min(...prices);
                  const maxP = Math.max(...prices);
                  priceRangeStr =
                    minP === maxP
                      ? `฿${minP.toLocaleString()}`
                      : `฿${minP.toLocaleString()} - ฿${maxP.toLocaleString()}`;
                }

                return (
                  <CategoryCard
                    key={cat.id}
                    title={cat.title}
                    label="หมวดหมู่"
                    itemCountDesc={itemCountDesc}
                    priceRangeStr={
                      catProducts.length > 0 ? priceRangeStr : undefined
                    }
                    bgImage={cat.bannerUrl || undefined}
                    index={i}
                    onClick={() => onSelectCategory(cat.name)}
                    accentColor="#3B82F6"
                    glowColor="rgba(59,130,246,0.6)"
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
              <h2 className="text-lg font-bold text-white leading-tight">
                รายการสั่งชื้อสินค้าล่าสุด
              </h2>
              <p className="text-[11px] text-[#3B82F6] font-medium mt-0.5">
                สินค้าที่ลูกค้าเพิ่งซื้อ 10 รายการล่าสุด
              </p>
            </div>
          </div>

          <div className="flex overflow-hidden relative w-full translate-z-0">
            <motion.div
              className="flex gap-4 pr-4 w-max shrink-0 hover:[animation-play-state:paused]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 40,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              {[
                ...(purchaseHistory && purchaseHistory.length > 0
                  ? purchaseHistory.slice(0, 10)
                  : [1, 2, 3, 4, 5]),
                ...(purchaseHistory && purchaseHistory.length > 0
                  ? purchaseHistory.slice(0, 10)
                  : [1, 2, 3, 4, 5]),
              ].map((purchase: any, index) => {
                const i = index % 10;
                let isDummy = typeof purchase === "number";
                const dummyProduct = isDummy
                  ? products[i % (products.length || 1)]
                  : null;
                const matchedProduct = !isDummy
                  ? products.find((p) => p.name === purchase.productName)
                  : null;

                let minsAgo = Math.floor(Math.random() * 5) + i * 2 + 1;
                if (!isDummy && purchase.date) {
                  const diffMinutes = Math.floor(
                    (Date.now() - new Date(purchase.date).getTime()) / 60000,
                  );
                  if (diffMinutes >= 0) minsAgo = diffMinutes;
                }
                let timeStr = `${minsAgo} นาทีที่แล้ว`;
                if (!isDummy && purchase.date && minsAgo >= 60) {
                  if (minsAgo < 1440)
                    timeStr = `${Math.floor(minsAgo / 60)} ชั่วโมงที่แล้ว`;
                  else timeStr = `${Math.floor(minsAgo / 1440)} วันที่แล้ว`;
                }

                return (
                  <div
                    key={index}
                    className="shrink-0 w-[240px] sm:w-[280px] bg-[#111318] border border-[#2a2d35] p-3 rounded-2xl flex gap-4 transition-all cursor-default hover:border-[#1a9fff]/40 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#1a1d24] border border-[#2a2d35] shrink-0 overflow-hidden relative">
                      {matchedProduct?.imageUrl || dummyProduct?.imageUrl ? (
                        <img loading="lazy"
                          src={
                            matchedProduct?.imageUrl || dummyProduct?.imageUrl
                          }
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1a9fff]">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-[13px] font-bold text-[#e5e7eb] truncate">
                        {!isDummy && purchase.username
                          ? purchase.username.substring(0, 2) + "***"
                          : "Us***"}{" "}
                        ซื้อแล้ว
                      </div>
                      <div className="text-xs text-[#9ca3af] truncate mt-0.5">
                        {!isDummy
                          ? purchase.productName
                          : dummyProduct?.name || "สินค้าพรีเมียม"}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-bold text-[#e5e7eb]">
                          {!isDummy ? purchase.amount || 1 : 1} ชิ้น
                        </span>
                        <span className="text-[10px] text-[#6b7280] font-medium">
                          {timeStr}
                        </span>
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
        <div id="products" className="pt-12 relative">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#3B82F6]/10 rounded-full  pointer-events-none mix-blend-screen"></div>
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 from-[#3B82F6] to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white fill-white/20" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  สินค้าแนะนำสำหรับคุณ
                </h2>
                <p className="text-xs text-[#3B82F6] font-medium tracking-wide uppercase mt-1">
                  Premium & Highly Recommended
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 "
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 relative z-10">
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="bg-[#0A0D12]/80  border border-white/10 rounded-xl overflow-hidden hover:shadow-lg/40 transition-all duration-300 h-full flex flex-col group"
              >
                <div className="aspect-[4/3] bg-zinc-900 relative overflow-hidden p-2">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative">
                      {product.tag && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full z-10 shadow-lg border border-white/20 uppercase tracking-widest">
                          {product.tag}
                        </div>
                      )}
                      {product.imageUrl ? (
                        <img loading="lazy"
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center from-zinc-800 to-zinc-900 border border-white/5">
                          <div className="text-center">
                            <div className="text-[10px] font-black text-[#3B82F6] tracking-tighter mb-1">APEXSTORE</div>
                            <div className="text-white text-xs font-bold leading-tight">NO<br/>IMAGE</div>
                          </div>
                        </div>
                      )}
                  </div>
                  <div
                    className="absolute inset-0 bg-[#0A0D12]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop- cursor-pointer rounded-2xl m-2"
                    onClick={() => onProductClick(product.id)}
                  >
                    <div className="bg-[#3B82F6] text-white shadow-lg p-3 rounded-full scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 transform">
                      <ShoppingCart className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  {product.stock <= 0 && (
                    <div className="absolute inset-2 bg-black/60  flex items-center justify-center z-10 rounded-2xl">
                      <span className="bg-red-500 text-white font-bold rounded-lg px-4 py-1.5 text-xs tracking-wider shadow-lg">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  {/* Premium Badge */}
                  <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-black/60  rounded-lg border border-white/10 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[9px] font-bold text-white tracking-widest uppercase">แนะนำ</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-2 mb-2 group-hover:text-[#3B82F6] transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <div className="flex items-end justify-between">
                        <div>
                            {product.originalPrice && product.price && product.originalPrice > product.price && (
                                <div className="text-[10px] text-zinc-500 line-through mb-0.5">
                                ฿{(product.originalPrice || 0).toLocaleString()}
                                </div>
                            )}
                            <div className="text-[#3B82F6] font-black text-lg leading-none">
                                ฿{(product.price || 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] text-zinc-500 font-medium">คงเหลือ</div>
                           <div className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {product.stock >= 999999 ? "ไม่จำกัด" : `${product.stock} ชิ้น`}
                           </div>
                        </div>
                    </div>

                    {product.stock <= 0 ? (
                      <button className="w-full bg-zinc-800/50 text-zinc-500 border border-zinc-800 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <Package className="w-4 h-4" /> สินค้าหมด
                      </button>
                    ) : (
                      <button
                        onClick={() => onProductClick(product.id)}
                        className="w-full from-[#3B82F6] to-cyan-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> สั่งซื้อเลย
                      </button>
                    )}
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

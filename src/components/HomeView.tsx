import Swal from "sweetalert2";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Shield,
  Zap,
  Sparkles,
  Filter,
  Check,
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

interface SmoothScrollSectionProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}

const SmoothScrollSection: React.FC<SmoothScrollSectionProps> = ({
  children,
  direction = "up",
  delay = 0,
  className = "",
}) => {
  let initialX = 0;
  let initialY = 0;

  if (direction === "left") initialX = -45;
  else if (direction === "right") initialX = 45;
  else if (direction === "up") initialY = 35;
  else if (direction === "down") initialY = -35;

  return (
    <motion.div
      initial={{ opacity: 0, x: initialX, y: initialY, filter: "blur(3px)", scale: 0.98 }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)", scale: 1 }}
      viewport={{ once: false, amount: 0.05, margin: "0px 0px -40px 0px" }}
      transition={{
        type: "spring",
        stiffness: 95,
        damping: 18,
        delay: delay / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const DEFAULT_BANNERS = ["https://img1.pic.in.th/images/-81_20260601213128.png"];
const BANNER_WIDTH = 2100;
const BANNER_HEIGHT = 500;

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
      setDisplayValue(0);
      currentDisplay.current = 0;
      prevValue.current = 0;
      return;
    }

    let startTimestamp: number;
    const duration = 1500;
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
  products = [],
  categories = [],
  stats,
  user,
  siteSettings,
  purchaseHistory = [],
  setActiveView,
  onProductClick,
  onSelectCategory,
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState(stats);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Fallback checks to prevent array mapping crashes
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);
  const safeCategories = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);
  const safePurchaseHistory = useMemo(() => (Array.isArray(purchaseHistory) ? purchaseHistory : []), [purchaseHistory]);

  const bannersToUse = useMemo(() => {
    return siteSettings?.banners && siteSettings.banners.length > 0
      ? siteSettings.banners
      : DEFAULT_BANNERS;
  }, [siteSettings?.banners]);

  // Sync with props stats safely
  useEffect(() => {
    if (stats) {
      setRealtimeStats(stats);
    }
  }, [stats]);

  const totalSales = siteSettings?.stats_sales_override !== undefined && siteSettings?.stats_sales_override !== null 
    ? Number(siteSettings.stats_sales_override) 
    : (realtimeStats?.sales || 0);

  const totalMembers = siteSettings?.stats_users_override !== undefined && siteSettings?.stats_users_override !== null
    ? Number(siteSettings.stats_users_override)
    : (realtimeStats?.users || 0);

  const totalStockAvailable = useMemo(() => {
    return safeProducts.reduce((acc, p) => acc + (Math.max(0, p.stock || 0)), 0);
  }, [safeProducts]);

  // Automated Banner Carousel transition
  useEffect(() => {
    if (bannersToUse.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [bannersToUse.length]);

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
  };

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + bannersToUse.length) % bannersToUse.length);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    let result = [...safeProducts];

    // Filter by stock state
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Filter by categories / tag pills
    if (activeTab === "all") {
      return result;
    } else if (activeTab === "sale") {
      return result.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (activeTab === "popular") {
      return result.filter(p => p.isPopular || p.tag?.toLowerCase().includes("hot") || p.tag?.toLowerCase().includes("best"));
    } else {
      return result.filter(p => p.category === activeTab);
    }
  }, [safeProducts, activeTab, inStockOnly]);

  return (
    <div className="w-full overflow-hidden space-y-8 pb-32 font-sans text-white bg-[#05070d] mt-1 sm:mt-2 max-w-[2100px] mx-auto px-4 md:px-6">
      
      {/* 1. Elegant Banner Carousel with dynamic navigation overlay */}
      <SmoothScrollSection direction="left" delay={50} className="w-full">
        <div className="relative mx-auto w-full max-w-[2100px] aspect-[21/5] rounded-2xl overflow-hidden group border border-blue-500/30 bg-black shadow-[0_0_35px_rgba(0,102,255,0.22)]" style={{ maxHeight: `${BANNER_HEIGHT}px` }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                loading="lazy"
                src={bannersToUse[currentBanner % bannersToUse.length]}
                alt="Highlight banner 2100 x 500"
                width={BANNER_WIDTH}
                height={BANNER_HEIGHT}
                className="w-full h-full object-cover object-center bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-blue-950/20" />
            </motion.div>
          </AnimatePresence>

          {/* Interactive Arrow Controls */}
          {bannersToUse.length > 1 && (
            <>
              <button
                onClick={handlePrevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-blue-400/40 flex items-center justify-center text-white hover:text-white hover:bg-blue-600/90 hover:border-blue-300 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Previous banner"
              >
                <ArrowLeft className="w-5 h-5 pointer-events-none" />
              </button>
              <button
                onClick={handleNextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 border border-blue-400/40 flex items-center justify-center text-white hover:text-white hover:bg-blue-600/90 hover:border-blue-300 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5 pointer-events-none" />
              </button>
            </>
          )}

          {/* Dot Pagination indicators */}
          {bannersToUse.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {bannersToUse.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentBanner % bannersToUse.length === idx 
                      ? "bg-[#0066ff] w-6 shadow-[0_0_8px_#0066ff]" 
                      : "bg-white/60 hover:bg-white w-1.5"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </SmoothScrollSection>

      {/* 2. Announcement Marquee Bar with gradient glow */}
      <SmoothScrollSection delay={50} direction="right" className="w-full">
        <div className="bg-black/75 backdrop-blur-md rounded-xl border border-blue-500/25 py-3 px-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#0066ff] to-cyan-500" />
          <div className="flex items-center gap-2.5 shrink-0 z-10 text-[#0066ff]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066ff]"></span>
            </span>
            <Bell className="w-4.5 h-4.5 text-white" />
            <span className="font-bold text-white text-xs uppercase tracking-wider bg-blue-950/80 px-2 py-0.5 rounded">
              ANNOUNCEMENT
            </span>
          </div>
          <span className="text-blue-200/60 font-light select-none">|</span>
          <div className="flex-1 overflow-hidden min-w-0 z-10">
            <Marquee
              text="🎉 ยินดีต้อนรับสู่ระบบสั่งซื้ออัตโนมัติจัดส่งทันที 24 ชั่วโมง | ระบบเติมเงิน TrueMoney & TrueWallet ปลอดภัย มั่นใจได้ 100% | พบปัญหาการใช้งานติดต่อฝ่ายสนับสนุนได้ตลอดเวลา"
              speed={16}
              className="text-white/85 font-medium text-xs sm:text-sm"
            />
          </div>
        </div>
      </SmoothScrollSection>

      {/* 3. High-Contrast Gamer Stats Cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        
        {/* Card 1: Total Sales */}
        <SmoothScrollSection direction="left" delay={50} className="w-full">
          <div className="relative overflow-hidden bg-[#0b1020]/90 rounded-2xl p-4 sm:p-5 border border-blue-500/20 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_22px_rgba(0,102,255,0.18)] group transition-all duration-300 flex items-center gap-4 h-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-blue-100/70 uppercase tracking-wider mb-0.5">ยอดสั่งซื้อทั้งหมด</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg sm:text-2xl font-black text-white leading-none">
                  <NumberTicker value={totalSales} />
                </span>
                <span className="text-[9px] font-bold text-emerald-400 leading-none">ครั้ง</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-blue-200">
              <ShoppingCart className="w-24 h-24" />
            </div>
          </div>
        </SmoothScrollSection>

        {/* Card 2: Total Stock */}
        <SmoothScrollSection direction="right" delay={100} className="w-full">
          <div className="relative overflow-hidden bg-[#0b1020]/90 rounded-2xl p-4 sm:p-5 border border-blue-500/20 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_22px_rgba(0,102,255,0.18)] group transition-all duration-300 flex items-center gap-4 h-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-blue-100/70 uppercase tracking-wider mb-0.5">พร้อมจำหน่าย</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg sm:text-2xl font-black text-white leading-none">
                  <NumberTicker value={totalStockAvailable} />
                </span>
                <span className="text-[9px] font-bold text-cyan-400 leading-none">รายการ</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-blue-200">
              <Package className="w-24 h-24" />
            </div>
          </div>
        </SmoothScrollSection>

        {/* Card 3: Total Members */}
        <SmoothScrollSection direction="left" delay={150} className="w-full">
          <div className="relative overflow-hidden bg-[#0b1020]/90 rounded-2xl p-4 sm:p-5 border border-blue-500/20 shadow-sm hover:border-blue-400/60 hover:shadow-[0_0_22px_rgba(0,102,255,0.18)] group transition-all duration-300 flex items-center gap-4 h-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-blue-100/70 uppercase tracking-wider mb-0.5">ครอบครัวสมาชิก</p>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg sm:text-2xl font-black text-white leading-none">
                  <NumberTicker value={totalMembers} />
                </span>
                <span className="text-[9px] font-bold text-amber-400 leading-none">ผู้ใช้</span>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-blue-200">
              <Users className="w-24 h-24" />
            </div>
          </div>
        </SmoothScrollSection>

        {/* Card 4: Wallet Balance (Interactive to wallet trigger) */}
        <SmoothScrollSection direction="right" delay={200} className="w-full">
          <div 
            onClick={() => setActiveView("wallet")}
            className="cursor-pointer relative overflow-hidden bg-[#0b1020]/90 rounded-2xl p-4 sm:p-5 border border-blue-500/20 hover:border-blue-500/40 shadow-sm hover:shadow-[0_0_15px_rgba(0,102,255,0.15)] group transition-all duration-300 flex items-center gap-4 h-full"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0066ff]/15 border border-[#0066ff]/35 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Wallet className="w-5 h-5 text-[#66a3ff]" />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-[10px] sm:text-xs font-semibold text-blue-300 uppercase tracking-wider mb-0.5">กระเป๋าเงินของคุณ</p>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-blue-300 leading-none mr-0.5">฿</span>
                <span className="text-lg sm:text-2xl font-black text-white leading-none">
                  {user ? (user.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
              </div>
            </div>
            <div className="absolute right-3 top-3 bg-[#0066ff]/10 text-[#66a3ff] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </SmoothScrollSection>

      </div>

      {/* 4. Service Advantage Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmoothScrollSection direction="left" delay={50} className="w-full">
          <div className="flex items-start gap-3.5 p-5 bg-white/70 border border-zinc-200 rounded-2xl h-full mb-0">
            <div className="p-2.5 rounded-xl bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#66a3ff]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">ระบบจัดส่งด่วนอัตโนมัติ</h4>
              <p className="text-xs text-blue-100/70 leading-relaxed">ได้รับสินค้า คีย์ ใบเสร็จ ทันทีผ่านหน้าเว็บและประวัติส่วนตัว ตลอด 24 ชม.</p>
            </div>
          </div>
        </SmoothScrollSection>

        <SmoothScrollSection direction="up" delay={100} className="w-full">
          <div className="flex items-start gap-3.5 p-5 bg-white/70 border border-zinc-200 rounded-2xl h-full mb-0">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">ธรรมาภิบาลและความปลอดภัย</h4>
              <p className="text-xs text-blue-100/70 leading-relaxed">ข้อมูลและสิทธิ์ของสมาชิกถูกปกป้องด้วยฐานข้อมูลที่มีความปลอดภัยสูงสุด</p>
            </div>
          </div>
        </SmoothScrollSection>

        <SmoothScrollSection direction="right" delay={150} className="w-full">
          <div className="flex items-start gap-3.5 p-5 bg-white/70 border border-zinc-200 rounded-2xl h-full mb-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">รับประกันสินค้าทุกรายการ</h4>
              <p className="text-xs text-blue-100/70 leading-relaxed">สินค้าทุกคีย์ใช้งานได้จริง มีปัญหาเครมได้รวดเร็วผ่านเจ้าหน้าที่เทคนิค</p>
            </div>
          </div>
        </SmoothScrollSection>
      </div>

      {/* 5. Recommended Categories Grid */}
      <div className="space-y-5">
        <SmoothScrollSection direction="left" delay={50} className="w-full">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 border border-zinc-300 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">หมวดหมู่แนะนํา</h2>
                <p className="text-xs text-blue-100/70 font-medium">แยกประเภทสินค้าตามแพลตฟอร์มของคุณ</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-white px-4 py-2 border border-zinc-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              ดูหมวดหมู่ทั้งหมด <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </SmoothScrollSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeCategories.length === 0 ? (
            <SmoothScrollSection direction="up" delay={100} className="col-span-full">
              <div className="py-12 text-center text-blue-100/70 text-xs border border-dashed border-zinc-300 rounded-2xl">
                ไม่พบหมวดหมู่สินค้าในขณะนี้
              </div>
            </SmoothScrollSection>
          ) : (
            safeCategories.slice(0, 3).map((cat, i) => {
              const catProducts = safeProducts.filter(
                p => p.category === cat.id || p.category === cat.name || p.category === cat.title
              );
              
              let priceRangeStr = "ไม่ทราบราคา";
              let itemCountDesc = `${catProducts.length} รายการในร้าน`;

              if (catProducts.length > 0) {
                const prices = catProducts.map(p => p.price);
                const minP = Math.min(...prices);
                const maxP = Math.max(...prices);
                priceRangeStr = minP === maxP
                  ? `฿${minP.toLocaleString()}`
                  : `฿${minP.toLocaleString()} - ฿${maxP.toLocaleString()}`;
              }

              return (
                <SmoothScrollSection 
                  key={cat.id} 
                  direction={i % 2 === 0 ? "left" : "right"} 
                  delay={i * 100} 
                  className="w-full"
                >
                  <CategoryCard
                    title={cat.title}
                    label="STORETH"
                    itemCountDesc={itemCountDesc}
                    priceRangeStr={catProducts.length > 0 ? priceRangeStr : undefined}
                    bgImage={cat.bannerUrl || undefined}
                    index={i}
                    onClick={() => onSelectCategory(cat.name)}
                    accentColor="#0066ff"
                    glowColor="rgba(0, 102, 255, 0.2)"
                    gradientFrom="transparent"
                  />
                </SmoothScrollSection>
              );
            })
          )}
        </div>
      </div>

      {/* 6. Live Purchase Activity Ticker */}
      <SmoothScrollSection delay={50} direction="right" className="w-full">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Live Order Stream (คำสั่งซื้อล่าสุด)
            </span>
          </div>

          <div className="flex overflow-hidden relative w-full select-none">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Seamless Horizontal Flow */}
            <motion.div
              className="flex gap-4 pr-4 w-max shrink-0 hover:[animation-play-state:paused]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                ease: "linear",
                duration: 35,
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              {[
                ...(safePurchaseHistory.length > 0
                  ? safePurchaseHistory.slice(0, 8)
                  : [1, 2, 3, 4, 5]),
                ...(safePurchaseHistory.length > 0
                  ? safePurchaseHistory.slice(0, 8)
                  : [1, 2, 3, 4, 5]),
              ].map((purchase: any, index) => {
                const isDummy = typeof purchase === "number";
                const i = index % 8;
                const dummyProduct = isDummy && safeProducts.length > 0
                  ? safeProducts[i % safeProducts.length]
                  : null;
                const matchedProduct = !isDummy
                  ? safeProducts.find(p => p.name === purchase.productName)
                  : null;

                let minsAgo = i * 3 + 2;
                if (!isDummy && purchase.date) {
                  const diffMinutes = Math.floor(
                    (Date.now() - new Date(purchase.date).getTime()) / 60000
                  );
                  if (diffMinutes >= 0) minsAgo = diffMinutes;
                }
                let timeStr = `${minsAgo} นาทีที่แล้ว`;
                if (!isDummy && purchase.date && minsAgo >= 60) {
                  if (minsAgo < 1440)
                    timeStr = `${Math.floor(minsAgo / 60)} ชม.ที่แล้ว`;
                  else timeStr = `${Math.floor(minsAgo / 1440)} วันที่แล้ว`;
                }

                const displayedProductName = !isDummy
                  ? purchase.productName
                  : (dummyProduct?.name || "Premium Game License Key");

                const clientUsername = !isDummy && purchase.username
                  ? purchase.username.length > 4
                    ? purchase.username.substring(0, 3) + "***"
                    : purchase.username + "***"
                  : "Member***";

                const imageUrl = matchedProduct?.imageUrl || dummyProduct?.imageUrl;

                return (
                  <div
                    key={index}
                    className="shrink-0 w-[260px] sm:w-[300px] bg-white/70 border border-zinc-200 p-3 rounded-2xl flex gap-3 transition-colors duration-300 hover:border-[#0066ff]/20 hover:bg-white/90 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0 overflow-hidden relative">
                      {imageUrl ? (
                        <img 
                          loading="lazy"
                          src={imageUrl}
                          alt="Product thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-200/60">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-between">
                        <span className="truncate text-blue-600">{clientUsername}</span>
                        <span className="text-[9px] text-[#66a3ff] bg-[#0066ff]/10 px-1.5 py-0.2 rounded font-mono shrink-0">SUCCESS</span>
                      </div>
                      <div className="text-[11px] text-white truncate font-semibold mt-0.5">
                        {displayedProductName}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-blue-100/70 text-[10px] font-medium">สั่งซื้อเสร็จสิ้น</span>
                        <span className="text-blue-100/70 font-mono text-[9px]">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </SmoothScrollSection>

      {/* 7. Featured Products Grid (with interactive filter tabs) */}
      <div id="products-showcase" className="pt-6 relative">
        
        {/* Header Action Section */}
        <SmoothScrollSection direction="left" delay={50} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-300 mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-zinc-100 border border-zinc-300 rounded-xl flex items-center justify-center text-amber-500 shadow-md">
                <Star className="w-5.5 h-5.5 fill-amber-500/20" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">คลังเก็บสินค้าดิจิทัล</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0066ff]">Premium Selection Products</span>
              </div>
            </div>

            {/* In-Stock Filter Checkbox */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={inStockOnly} 
                  onChange={(e) => setInStockOnly(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#0066ff] peer-checked:after:bg-white"></div>
                <span className="ml-2 text-xs font-bold text-blue-200/60 select-none">
                  แสดงเฉพาะที่มีของ
                </span>
              </label>
            </div>
          </div>
        </SmoothScrollSection>

        {/* Interactive filter pills row */}
        <SmoothScrollSection direction="right" delay={100} className="w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-zinc-800 text-white border-zinc-800"
                  : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-white"
              }`}
            >
              <Filter className="w-3.5 h-3.5" /> ทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                activeTab === "popular"
                  ? "bg-[#0066ff] text-white border-[#0066ff] shadow-[0_4px_12px_rgba(0,102,255,0.25)]"
                  : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-white"
              }`}
            >
              🔥 แนะนำยอดฮิต
            </button>
            <button
              onClick={() => setActiveTab("sale")}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border flex items-center gap-1.5 ${
                activeTab === "sale"
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                  : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-white"
              }`}
            >
              🏷️ ลดคุ้มแนะนํา
            </button>

            {/* Categories filter pills */}
            {safeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  activeTab === cat.name
                    ? "bg-[#0066ff] text-white border-[#0066ff]"
                    : "bg-zinc-100 border-zinc-300 text-zinc-600 hover:text-white"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </SmoothScrollSection>

        {/* Product Items Display Grid */}
        <SmoothScrollSection direction="up" delay={150} className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 mt-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-50">
                <Package className="w-10 h-10 text-zinc-450 mx-auto mb-3" />
                <p className="text-blue-200/60 font-bold text-sm">ไม่พบรายการสินค้าที่ค้นหา</p>
                <p className="text-blue-100/70 text-xs mt-1">กรุณาลองเปลี่ยนแถบประเภทหรือเปิดเมนูตัวเลือกอื่น</p>
                <button
                  onClick={() => { setActiveTab("all"); setInStockOnly(false); }}
                  className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white hover:bg-zinc-800"
                >
                  คืนค่าเริ่มต้น
                </button>
              </div>
            ) : (
              filteredProducts.map((product, i) => {
                const discountPct = product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
                
                const isSpecialHot = product.isPopular || product.tag?.toLowerCase().includes("hot") || product.tag?.toLowerCase().includes("best");

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.97, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: "easeOut" }}
                    className="flex flex-col bg-white/70 border border-zinc-200 rounded-2xl overflow-hidden hover:scale-[1.02] hover:border-[#0066ff]/30 hover:shadow-md group transition-all duration-300 h-full"
                  >
                    
                    {/* Thumbnail & Badges Container */}
                    <div className="aspect-square bg-zinc-50 relative overflow-hidden p-2 group-hover:bg-zinc-100 transition-colors duration-300">
                      
                      {/* Interactive Tags Row */}
                      <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-2 pointer-events-none">
                        <div className="flex flex-col gap-1 items-start">
                          {isSpecialHot && (
                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                              POPULAR
                            </span>
                          )}
                          {product.tag && !isSpecialHot && (
                            <span className="bg-[#0066ff] text-white font-bold text-[9px] px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                              {product.tag}
                            </span>
                          )}
                        </div>

                        {discountPct > 0 && (
                          <div className="bg-emerald-500 text-white font-black text-xs px-2 py-0.5 rounded shadow-lg uppercase tracking-wider flex items-center">
                            -{discountPct}%
                          </div>
                        )}
                      </div>

                      {/* Sold Out / Out Of Stock Mask */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-10">
                          <span className="bg-red-500 text-white font-black rounded-xl px-4 py-1.5 text-[10px] tracking-widest shadow-xl border border-red-400/20 animate-pulse">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}

                      {/* Product Visual */}
                      <div className="w-full h-full rounded-xl overflow-hidden relative bg-zinc-50">
                        {product.imageUrl ? (
                          <img
                            loading="lazy"
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center border border-zinc-200 opacity-50 bg-zinc-100">
                            <Box className="w-8 h-8 text-blue-100/70 mb-1" />
                            <span className="text-[10px] font-bold text-blue-100/70 uppercase tracking-widest">STORETH</span>
                          </div>
                        )}
                      </div>

                      {/* Hover action button overlay */}
                      {product.stock > 0 && (
                        <div 
                          onClick={() => onProductClick(product.id)}
                          className="cursor-pointer absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
                        >
                          <span className="bg-white text-black font-extrabold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform">
                            รายละเอียดสินค้า
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta/Description Text */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white/70">
                      
                      {/* Name / Category */}
                      <div className="mb-2">
                        <span className="text-[9px] font-bold text-blue-100/70 uppercase tracking-wider block mb-0.5">
                          {product.category || "General Digital"}
                        </span>
                        <h3 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-2 h-9 sm:h-10 group-hover:text-blue-600 transition-colors duration-200">
                          {product.name}
                        </h3>
                      </div>

                      {/* Price Grid representation */}
                      <div className="mt-auto pt-4 flex items-end justify-between border-t border-white/5">
                        
                        {/* Prices block */}
                        <div className="min-w-0 flex flex-col">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <span className="text-[10px] text-blue-200/60 line-through leading-none mb-1">
                              ฿{(product.originalPrice || 0).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[10px] text-transparent leading-none mb-1">.</span>
                          )}
                          <span className="text-white font-extrabold text-sm sm:text-base leading-none tracking-tight flex items-baseline gap-0.5 font-mono">
                            <span className="text-xs text-blue-400">฿</span>
                            {(product.price || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Stock Balance bar status */}
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-blue-100/70 font-bold block leading-none mb-1 uppercase tracking-wider">คงเหลือ</span>
                          <span className={`text-[10px] font-black leading-none ${product.stock > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                            {product.stock >= 999999 ? "INFINITE" : `${product.stock} ชิ้น`}
                          </span>
                        </div>
                      </div>

                      {/* Full-width Instant Action Trigger */}
                      <div className="mt-4">
                        {product.stock <= 0 ? (
                          <button
                            disabled
                            className="w-full bg-zinc-200 text-blue-100/70 rounded-xl py-2.5 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <Package className="w-3.5 h-3.5" /> สินค้าหมด
                          </button>
                        ) : (
                          <button
                            onClick={() => onProductClick(product.id)}
                            className="w-full bg-zinc-800 hover:bg-[#0066ff] border border-zinc-300 hover:border-[#0066ff] text-white hover:text-white rounded-xl py-2.5 text-xs font-extrabold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[0_4px_12px_rgba(0,102,255,0.25)]"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อด่วน
                          </button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </SmoothScrollSection>
      </div>
    </div>
  );
};

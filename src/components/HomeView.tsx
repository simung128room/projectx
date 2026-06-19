import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Product, SiteStats, Category } from "../types";
import { ShoppingCart, Package, Users, ChevronRight, Zap, Star, Clock, LayoutGrid, History, MessageSquare, Coins, Bell } from "lucide-react";
import { motion } from "motion/react";
import { formatProductName } from "../utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Animated Number Generator ───────────────────────────────────────────────

interface AnimatedNumberProps {
  value: number;
  accent: string;
}

function AnimatedNumber({ value, accent }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue === 0 && prevValueRef.current === 0 ? 0 : prevValueRef.current;
    const endValue = value;
    const duration = 1500; // Duration in ms

    setIsAnimating(true);
    prevValueRef.current = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutExpo for extremely smooth progression
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (endValue - startValue) * easeProgress);
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value]);

  return (
    <span 
      className={`inline-block font-mono tracking-tight transition-colors duration-200 ${
        isAnimating ? "scale-105" : "scale-100"
      }`}
      style={{ 
        color: isAnimating ? "#ffffff" : "inherit",
        textShadow: isAnimating ? `0 0 16px ${accent}, 0 0 4px ${accent}` : "none",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {displayValue.toLocaleString()}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  accent,
  subtext,
  actionButton,
  delay = 0,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  accent: string;
  subtext?: string;
  actionButton?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-white/45 border border-gray-200 rounded-2xl p-6 overflow-hidden group hover:border-[#3b82f6]/35 transition-all duration-300"
    >
      {/* Subtle glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-15 transition-opacity duration-500 blur-xl pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase font-display">{label}</p>
        {actionButton}
      </div>
 
      <p className="text-3xl font-extrabold text-white tracking-tight leading-none mt-2 flex items-baseline gap-1.5 font-display">
        {typeof value === "number" ? (
          <AnimatedNumber value={value} accent={accent} />
        ) : (
          value
        )}
        {unit && <span className="text-xs font-semibold text-gray-500 font-sans">{unit}</span>}
      </p>
 
      {subtext && (
        <p className="text-[10px] text-zinc-600 mt-2.5 font-mono font-medium">{subtext}</p>
      )}
 
      <div className="absolute bottom-4 right-4 opacity-10 text-zinc-650 group-hover:opacity-20 group-hover:scale-105 duration-305 transition-all pointer-events-none">
        <Icon className="w-9 h-9" />
      </div>
    </motion.div>
  );
}
 
// ─── Shortcut Button ──────────────────────────────────────────────────────────
 
interface ShortcutBtnProps {
  label: string;
  subLabel: string;
  icon: React.ElementType;
  colorClass: string;
  glowColor: string;
  onClick: () => void;
  delay?: number;
}
 
function ShortcutBtn({
  label,
  subLabel,
  icon: Icon,
  colorClass,
  glowColor,
  onClick,
  delay = 0,
}: ShortcutBtnProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ type: "spring", stiffness: 350, damping: 30, delay }}
      onClick={onClick}
      className="relative overflow-hidden text-left bg-white/45 border border-gray-200 hover:border-[#3b82f6/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 w-full group cursor-pointer"
    >
      {/* Dynamic Glow */}
      <div
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowColor }}
      />
      
      {/* Icon Frame */}
      <div className={`p-3.5 rounded-xl bg-white/[0.02] border border-gray-200 group-hover:border-transparent group-hover:bg-gray-100/60 transition-all duration-300 ${colorClass} shrink-0`}>
        <Icon className="w-5 h-5 font-semibold" />
      </div>
 
      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase font-display">{label}</span>
        <span className="text-[10px] text-gray-500 group-hover:text-gray-600 transition-colors duration-300 tracking-normal truncate mt-1 font-medium font-mono">{subLabel}</span>
      </div>
 
      {/* Decorative arrow */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-300 text-gray-500 group-hover:text-[#3b82f6] shrink-0 transition-all">
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );
}

// ─── Category Chip ────────────────────────────────────────────────────────────

function CategoryChip({
  cat,
  products,
  onClick,
  delay = 0,
}: {
  cat: Category;
  products: Product[];
  onClick: () => void;
  delay?: number;
}) {
  const catProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter(
      (p) => p && (p.category === cat.id || p.category === cat.name || p.category === cat.title)
    );
  }, [products, cat]);

  const productCount = catProducts.length;

  const prices = useMemo(() => {
    return catProducts
      .map(p => Number(p?.price ?? 0))
      .filter(price => !isNaN(price) && price >= 0);
  }, [catProducts]);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const priceRangeStr = prices.length > 0
    ? (minPrice === maxPrice 
        ? `฿${minPrice.toLocaleString()}` 
        : `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`)
    : "฿0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-[#3b82f6]/35 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-[#3b82f6]/5"
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-white"
        style={{ aspectRatio: '1 / 1' }}
      >
            {cat.bannerUrl || (catProducts[0] && catProducts[0].imageUrl) ? (
          <img
            src={cat.bannerUrl || catProducts[0]?.imageUrl}
            alt={cat.name || cat.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-50 group-hover:opacity-75"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://archive.org/download/placeholder-image/placeholder-image.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-white opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <h3 className="text-base sm:text-lg font-bold text-black px-0.5 tracking-wide uppercase truncate mb-1 font-display group-hover:text-[#3b82f6] transition-colors">
          {cat.name || cat.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mt-4 pt-4 border-t border-gray-200">
          {/* Item Count */}
          <span className="text-gray-500 flex items-center gap-1.5 uppercase font-medium tracking-wider font-sans">
            <Package className="w-4 h-4 text-gray-400 shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-[#3b82f6] font-bold font-mono">{productCount}</span> รายการ</span>
          </span>
          
          {/* Price Range */}
          <span className="text-[#3b82f6] font-mono font-bold tracking-wider text-xs bg-[#3b82f6]/5 px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            {priceRangeStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onClick,
  delay = 0,
}: {
  product: Product;
  onClick: () => void;
  delay?: number;
}) {
  const [imgError, setImgError] = useState(false);
  
  const name = product?.name || "";
  const imageUrl = product?.imageUrl || "";
  const hasImage = imageUrl && imageUrl.trim() !== "" && !imgError;
  const price = Number(product?.price ?? 0);
  const stock = Number(product?.stock ?? 0);
  const originalPrice = product?.originalPrice ? Number(product.originalPrice) : null;

  const discount =
    originalPrice && price < originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const isHot = price > 100 || (discount !== null && discount >= 20) || stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-[#3b82f6]/35 transition-all duration-300 flex flex-col shadow-lg hover:shadow-[#3b82f6]/5"
    >
      {/* Image area with corner ribbon */}
      <div className="relative aspect-square w-full bg-white overflow-hidden shrink-0">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={formatProductName(name)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center select-none bg-gray-50">
            <div className="text-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 font-medium px-3 line-clamp-2">{formatProductName(name)}</p>
            </div>
          </div>
        )}

        {/* Diagonal "Best Seller" ribbon in image corner */}
        {isHot && (
          <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none z-10">
            <div className="absolute top-3 -right-6 bg-white text-[#3b82f6] text-[9px] font-bold uppercase py-1 w-24 text-center transform rotate-45 shadow-md border-b border-gray-200 font-display">
              Best Seller
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 opacity-40" />

        {/* Discount Badge on left */}
        {discount !== null && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-md">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-3 group-hover:text-[#3b82f6] transition-colors font-sans">
          {formatProductName(name)}
        </h3>

        {/* "ราคาสินค้า" subtle label */}
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1 font-display">ราคาสินค้า</span>

        {/* Price row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {originalPrice && price < originalPrice ? (
            <span className="text-xs text-red-500/80 line-through font-mono font-medium">฿{originalPrice.toLocaleString()}</span>
          ) : null}
          
          <span className="text-base font-bold text-black tracking-tight font-mono">
            ฿{price.toLocaleString()}
          </span>

          {stock > 0 ? (
            <span className="ml-auto bg-green-50 text-green-600 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded-xl leading-none select-none">
              พร้อมจำหน่าย
            </span>
          ) : (
            <span className="ml-auto bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-xl leading-none select-none">
              สินค้าหมด
            </span>
          )}
        </div>

        {/* Buy Button */}
        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 bg-[#3b82f6]/5 hover:bg-[#3b82f6] text-[#3b82f6] hover:text-white border border-gray-200 hover:border-transparent py-2.5 rounded-xl text-xs font-bold transition-all duration-300 mt-auto shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          สั่งซื้อสินค้า
        </button>

        {/* Stock Row Box */}
        <div className="mt-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-semibold uppercase tracking-widest leading-none">
          <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>คงเหลือ <span className="text-black font-bold font-mono">{stock.toLocaleString()}</span> ชิ้น</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  stats,
  user,
  siteSettings,
  setActiveView,
  onProductClick,
  onSelectCategory,
}) => {
  const [latestPurchases, setLatestPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await axios.get("/api/latest-purchases");
        if (res.data && Array.isArray(res.data)) {
          const cleaned = res.data.map((p: any) => {
            let name = p.productName;
            try {
              if (typeof name === 'string' && name.trim().startsWith('{')) {
                const parsed = JSON.parse(name);
                name = parsed.n || parsed.name || name;
              }
            } catch (e) {}
            return { ...p, productName: name };
          });
          setLatestPurchases(cleaned);
        }
      } catch (e) {
        // silently fail or log
      }
    };
    fetchPurchases();
    
    // Refresh every 30s
    const intv = setInterval(fetchPurchases, 30000);
    return () => clearInterval(intv);
  }, []);

  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);
  const recommendedProducts = useMemo(() => {
    let inStock = safeProducts.filter(p => Number(p.stock) > 0);
    if (inStock.length > 0) return inStock.slice(0, 6);
    return safeProducts.slice(0, 8);
  }, [safeProducts]);

  const totalSales =
    siteSettings?.stats_sales_override != null
      ? Number(siteSettings.stats_sales_override)
      : (stats?.sales ?? 0) + (siteSettings?.stats_sales_offset ? Number(siteSettings.stats_sales_offset) : 0);

  const totalMembers =
    siteSettings?.stats_users_override != null
      ? Number(siteSettings.stats_users_override)
      : (stats?.users ?? 0) + (siteSettings?.stats_users_offset ? Number(siteSettings.stats_users_offset) : 0);

  const totalStock = useMemo(() => {
    if (siteSettings?.stats_stock_override != null) return Number(siteSettings.stats_stock_override);
    const calculated = safeProducts.reduce((acc, p) => acc + Math.max(0, p.stock ?? 0), 0);
    return calculated + (siteSettings?.stats_stock_offset ? Number(siteSettings.stats_stock_offset) : 0);
  }, [safeProducts, siteSettings]);

  const totalCategories = siteSettings?.stats_categories_override != null 
    ? Number(siteSettings.stats_categories_override) 
    : categories.length + (siteSettings?.stats_categories_offset ? Number(siteSettings.stats_categories_offset) : 0);

  const getRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (isNaN(diffMs)) return dateStr;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 1) return "เมื่อสักครู่";
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs} ชั่วโมงที่แล้ว`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
      return date.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const marqueeItems = useMemo(() => {
    if (!latestPurchases || latestPurchases.length === 0) return [];
    let items = [...latestPurchases];
    while (items.length < 10) {
      items = [...items, ...latestPurchases];
    }
    return [...items, ...items];
  }, [latestPurchases]);

  return (
    <div className="w-full min-h-screen bg-white text-black font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24 pt-6">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative overflow-hidden rounded-md border border-gray-200 mb-3 bg-white group w-full"
          style={{ aspectRatio: '1 / 1' }}
        >
          {/* Background Image with referral policy */}
          <img
            src="https://img2.pic.in.th/IMG_7177176d5344301b32a1.png"
            alt={siteSettings?.site_title || "ร้านค้า"}
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
        </motion.div>

        {/* ── Announcement Bar ── */}
        {((siteSettings?.announcement_text ?? `ยินดีต้อนรับทุกท่านเข้าสู่ ${siteSettings?.site_title || 'ร้านค้าของเรา'} จำหน่ายไอดีราคาถูก | มีปัญหาติดต่อแอดมิน`).trim() !== '') && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.2 }}
            className="mb-8 flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-2.5 overflow-hidden"
          >
            <div className="flex items-center justify-center bg-red-500/10 px-2.5 py-1.5 rounded-md border border-red-500/20 text-red-500 shrink-0 mr-3 shadow-sm gap-1.5 font-semibold text-xs select-none">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>ประกาศ</span>
            </div>
            <div className="flex-1 overflow-hidden relative" style={{ minWidth: 0 }}>
              <div className="text-sm font-semibold text-gray-800 tracking-wide pt-0.5 animate-marquee-css inline-block whitespace-nowrap">
                {siteSettings?.announcement_text ?? `ยินดีต้อนรับทุกท่านเข้าสู่ ${siteSettings?.site_title || 'ร้านค้าของเรา'} จำหน่ายไอดีราคาถูก | มีปัญหาติดต่อแอดมิน`}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="สมาชิกทั้งหมด"
            value={totalMembers}
            unit="คน"
            icon={Users}
            accent="rgba(99,102,241,0.4)"
            delay={0.1}
          />
          <StatCard
            label="พร้อมจำหน่าย"
            value={totalStock}
            unit="ชิ้น"
            icon={Package}
            accent="rgba(245,158,11,0.4)"
            delay={0.2}
          />
          <StatCard
            label="หมวดหมู่ทั้งหมด"
            value={totalCategories}
            unit="หมวดหมู่"
            icon={LayoutGrid}
            accent="rgba(16,185,129,0.4)"
            delay={0.3}
          />
          <StatCard
            label="ยอดขาย"
            value={totalSales}
            unit="บาท"
            icon={ShoppingCart}
            accent="rgba(239,68,68,0.4)"
            delay={0.4}
          />
        </div>

        {/* ── Quick Shortcut Buttons ── */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <ShortcutBtn
              label="สั่งซื้อสินค้า"
              subLabel="GO SHOPPING"
              icon={ShoppingCart}
              colorClass="text-[#3b82f6] group-hover:bg-[#3b82f6]/10 group-hover:text-blue-300"
              glowColor="rgba(16,185,129,0.15)"
              onClick={() => setActiveView("categories")}
              delay={0.1}
            />
            <ShortcutBtn
              label="ประวัติสั่งซื้อ"
              subLabel="ORDER HISTORY"
              icon={History}
              colorClass="text-[#3b82f6] group-hover:bg-[#3b82f6]/10 group-hover:text-blue-300"
              glowColor="rgba(99,102,241,0.15)"
              onClick={() => setActiveView("order_history")}
              delay={0.2}
            />
            <ShortcutBtn
              label="ติดต่อ ADMIN"
              subLabel="CONTACT ADMIN"
              icon={MessageSquare}
              colorClass="text-rose-450 group-hover:bg-rose-500/10 group-hover:text-rose-350"
              glowColor="rgba(244,63,94,0.15)"
              onClick={() => setActiveView("contact")}
              delay={0.3}
            />
            <ShortcutBtn
              label="เติมเงิน TOPUP"
              subLabel="TOPUP WALLET"
              icon={Coins}
              colorClass="text-amber-400 group-hover:bg-amber-500/10 group-hover:text-amber-300"
              glowColor="rgba(245,158,11,0.15)"
              onClick={() => setActiveView("wallet")}
              delay={0.4}
            />
          </div>
        </section>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-semibold text-black tracking-tight uppercase">หมวดหมู่แนะนำ</h2>
              </div>
              <button
                className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1 font-semibold"
                onClick={() => setActiveView("categories")}
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((cat, idx) => (
                <CategoryChip key={cat.id} cat={cat} products={products} onClick={() => onSelectCategory(cat.id)} delay={idx * 0.1} />
              ))}
            </div>
          </section>
        )}

        {/* ── Divider Strip ── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full h-2 rounded-full bg-white/[0.04] mb-10"
        />

        {/* ── Latest Purchases ── */}
        <section className="mb-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4 bg-gray-50 px-1.5 py-1.5 rounded-md border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#3b82f6] " />
              <h2 className="text-sm font-semibold text-black tracking-wider uppercase">รายการสั่งซื้อล่าสุด (REAL-TIME UPDATES)</h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-[#3b82f6] tracking-widest bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-ping" />
              <span>LIVE</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full overflow-hidden"
          >
            {/* Ambient vignette masks */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-white z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-white z-10 pointer-events-none" />

            {latestPurchases.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm font-medium flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 rounded-md">
                <Package className="w-5 h-5 text-gray-300" />
                ยังไม่มีผู้มีประวัติการสั่งซื้อล่าสุดในตอนนี้
              </div>
            ) : (
              <div className="w-full overflow-hidden flex py-1">
                <div className="animate-marquee-scroll flex gap-4 pr-4">
                  {marqueeItems.map((p, idx) => {
                    const matchedProduct = safeProducts.find(
                      (prod) => prod.name === p.productName
                    );
                    const imageUrl =
                      matchedProduct?.imageUrl ||
                      "https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png";

                    return (
                      <div
                        key={`${p.dbId || idx}-${idx}`}
                        className="w-[280px] h-[68px] shrink-0 bg-white border border-gray-200 hover:border-blue-500/30 rounded-md px-3 py-2 flex items-center justify-between gap-3 transition-colors duration-250 select-none shadow-sm hover:shadow-sm"
                      >
                        {/* Thumb & detail */}
                        <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
                          {/* Image Wrapper */}
                          <div className="w-10 h-10 rounded-md shrink-0 bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-0.5 shadow-inner">
                            <img
                              src={imageUrl}
                              alt=""
                              className="w-full h-full object-cover rounded"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png";
                              }}
                              loading="lazy"
                            />
                          </div>

                          {/* Detail summary */}
                          <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-xs font-semibold text-black tracking-wide truncate leading-snug">
                              {p.productName}
                            </span>
                            <span className="text-[10px] text-gray-600 mt-0.5">
                              ซื้อ: <span className="text-[#3b82f6] font-semibold font-mono">+{p.quantity}</span> ชิ้น
                            </span>
                            <span className="text-[9px] text-[#888] font-mono font-medium truncate mt-0.5">
                              {getRelativeTime(p.date)}
                            </span>
                          </div>
                        </div>

                        {/* Price point */}
                        <div className="flex flex-col items-end shrink-0 pl-1 border-l border-gray-200">
                          <span className="text-xs font-semibold text-[#3b82f6] font-mono tracking-tight leading-none mb-1">
                            ฿{p.price}
                          </span>
                          <span className="text-[8px] font-semibold text-[#3b82f6]/50 bg-[#3b82f6]/5 border border-blue-500/10 px-1 py-0.25 rounded font-mono tracking-widest uppercase">
                            PAID
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Divider Strip ── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full h-2 rounded-full bg-gray-100 mb-10"
        />

        {/* ── Products ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-5"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-yellow fill-neon-yellow " />
              <div>
                <h2 className="text-base font-semibold text-black tracking-tight uppercase">สินค้าแนะนำ</h2>
                <p className="text-xs text-gray-500 mt-0.5">ของดี มีจำกัด รีบเป็นเจ้าของ</p>
              </div>
            </div>
            <button
              className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1 font-semibold"
              onClick={() => setActiveView("categories")}
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {recommendedProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              ร้านค้ายังไม่ได้เพิ่มสินค้าเข้ามาในระบบ
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {recommendedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} delay={idx * 0.05} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

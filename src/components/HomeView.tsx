import React, { useState, useEffect, useMemo, useRef } from "react";
import { Product, SiteStats, Category } from "../types";
import { ShoppingCart, Package, Users, ChevronRight, Zap, Star, Clock, LayoutGrid, History, MessageSquare, Coins } from "lucide-react";
import { motion } from "motion/react";

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

// ─── Ticker (animated sale feed) ─────────────────────────────────────────────

const RECENT_SALES = [
  { user: "อ***ร", product: "ROV สุ่มไอดีเทพ",      price: 0.99, time: "1 นาที" },
  { user: "ก***ย", product: "ROV ของคุ้มระดับกลาง",  price: 35,   time: "2 นาที" },
  { user: "ส***น", product: "ROV ไอดีระดับสูง",      price: 89,   time: "5 นาที" },
  { user: "ป***ก", product: "ROV สกินหายาก",         price: 120,  time: "8 นาที" },
  { user: "น***ต", product: "ROV แพ็กเกจพรีเมียม",  price: 199,  time: "12 นาที" },
];

function SaleTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % RECENT_SALES.length);
        setVisible(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const sale = RECENT_SALES[index];

  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        LIVE
      </span>
      <div
        className="flex items-center gap-2 text-sm transition-all duration-400"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-6px)",
        }}
      >
        <span className="font-semibold text-white/80">{sale.user}</span>
        <span className="text-white/40">ซื้อ</span>
        <span className="text-white truncate max-w-[160px] sm:max-w-none">{sale.product}</span>
        <span className="shrink-0 font-bold text-amber-400">฿{sale.price.toFixed(2)}</span>
        <span className="shrink-0 text-white/30 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" /> {sale.time}
        </span>
      </div>
    </div>
  );
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
      className={`inline-block font-mono tracking-tight transition-all duration-300 ${
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
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="relative bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5 overflow-hidden group hover:border-white/[0.12] transition-colors duration-300">
      {/* Subtle glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: accent }}
      />
      <p className="text-xs text-white/40 font-medium tracking-wide uppercase mb-2">{label}</p>
      <p className="text-3xl font-black text-white tracking-tight leading-none">
        {typeof value === "number" ? (
          <AnimatedNumber value={value} accent={accent} />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-white/30 mt-1">{unit}</p>
      <div className="absolute bottom-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <Icon className="w-10 h-10 text-white" />
      </div>
    </div>
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
}

function ShortcutBtn({
  label,
  subLabel,
  icon: Icon,
  colorClass,
  glowColor,
  onClick,
}: ShortcutBtnProps) {
  return (
    <motion.button
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative overflow-hidden text-left bg-[#0d0d0d] border border-white/[0.06] hover:border-white/[0.14] rounded-xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 w-full group cursor-pointer"
    >
      {/* Dynamic Glow */}
      <div
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ background: glowColor }}
      />
      
      {/* Icon Frame */}
      <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] group-hover:border-transparent group-hover:scale-105 duration-300 ${colorClass} shrink-0`}>
        <Icon className="w-5 h-5 font-bold" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-black text-white tracking-wider uppercase">{label}</span>
        <span className="text-[10px] text-white/30 group-hover:text-white/50 duration-300 tracking-normal truncate mt-0.5 font-bold font-mono">{subLabel}</span>
      </div>

      {/* Decorative arrow */}
      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-white/40 shrink-0">
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
}: {
  cat: Category;
  products: Product[];
  onClick: () => void;
}) {
  const productCount = products.filter(
    (p) => p.category === cat.id || p.category === cat.name || p.category === cat.title
  ).length;

  return (
    <button
      onClick={onClick}
      className="relative group overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0d0d] hover:border-white/20 transition-all duration-300 active:scale-[0.98] text-left w-full aspect-[21/5] cursor-pointer"
    >
      {cat.bannerUrl ? (
        <>
          <img
            src={cat.bannerUrl}
            alt={cat.name || cat.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-[1.02] transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
      )}
      <div className="absolute inset-0 p-4 sm:p-[20px] flex flex-col justify-between z-10 select-none">
        <div>
          {/* ชื่อหมวดหมู่ */}
          <span className="text-sm sm:text-lg md:text-xl font-black text-white tracking-widest uppercase truncate block">
            {cat.name || cat.title}
          </span>
          
          {/* แถบสั้นยาว */}
          <div className="w-8 group-hover:w-20 h-[3px] bg-neon-green transition-all duration-300 mt-1.5 sm:mt-2 rounded-full" />
        </div>

        <div className="flex items-center justify-between mt-auto">
          {/* มีสินค้าทั้งหมด # รายการ */}
          <span className="text-[10px] sm:text-xs text-white/50 group-hover:text-white/80 transition-colors uppercase font-bold tracking-wider flex items-center gap-1.5 sm:gap-2">
            <Package className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-neon-green font-black font-mono">{productCount}</span> รายการ</span>
          </span>

          {/* [ ไอคอน ] */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/5 group-hover:bg-neon-green/15 group-hover:border-neon-green/35 flex items-center justify-center shrink-0 transition-all duration-300">
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-neon-green group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = product.imageUrl && product.imageUrl.trim() !== "" && !imgError;

  const discount =
    product.originalPrice && product.price < product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const isHot = product.price > 100 || (discount !== null && discount >= 20);

  return (
    <div className="group relative bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.14] transition-all duration-300 flex flex-col">
      {/* Image area */}
      <div className="relative aspect-square w-full bg-[#111] overflow-hidden shrink-0">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <div className="text-center">
              <Package className="w-8 h-8 text-white/10 mx-auto mb-1" />
              <p className="text-[10px] text-white/20 font-medium px-3 line-clamp-2">{product.name}</p>
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {isHot && (
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Zap className="w-2.5 h-2.5" /> ขายดี
            </span>
          )}
          {!isHot && (
            <span className="inline-flex items-center gap-1 bg-white/10 text-white/70 border border-white/10 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5" /> แนะนำ
            </span>
          )}
        </div>

        {discount !== null && (
          <div className="absolute top-2.5 right-2.5 bg-red-500/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-1 mb-1 group-hover:text-white/90 transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-white/40 line-clamp-2 mb-3 flex-1 leading-relaxed">
          {product.description}
        </p>

        {/* Price row */}
        <div className="flex flex-wrap items-baseline gap-2 mb-2">
          <span className="text-[15px] font-black text-white">฿{product.price.toFixed(2)}</span>
          {product.originalPrice && product.price < product.originalPrice && (
            <>
              <span className="text-[11px] text-white/30 line-through">฿{product.originalPrice.toFixed(2)}</span>
            </>
          )}
        </div>

        {/* Discount Badge below product (แอดมินตั้งจากราคาเดิมได้) */}
        {discount !== null && (
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 text-red-400 text-[10px] sm:text-[11px] font-extrabold px-2 py-1 border border-red-500/20 shadow-sm">
              🔥 ลดราคาพิเศษ {discount}%
            </span>
          </div>
        )}

        {/* Stock */}
        <p className="text-[10px] text-white/30 font-medium mb-3">
          คงเหลือ {product.stock.toLocaleString()} ชิ้น
        </p>

        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] active:bg-white/[0.07] active:scale-[0.98] text-white border border-white/[0.08] hover:border-white/20 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          ดูสินค้า
        </button>
      </div>
    </div>
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
  const safeProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const totalSales =
    siteSettings?.stats_sales_override != null
      ? Number(siteSettings.stats_sales_override)
      : stats?.sales ?? 0;

  const totalMembers =
    siteSettings?.stats_users_override != null
      ? Number(siteSettings.stats_users_override)
      : stats?.users ?? 0;

  const totalStock = useMemo(
    () => safeProducts.reduce((acc, p) => acc + Math.max(0, p.stock ?? 0), 0),
    [safeProducts]
  );

  return (
    <div className="w-full min-h-screen bg-[#070707] text-white font-sans antialiased">
      {/* Live ticker bar */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070707]/90 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-4xl mx-auto">
          <SaleTicker />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 pt-6">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] mb-8 min-h-[160px] sm:min-h-[220px] bg-[#0d0d0d]">
          <img
            src="https://i.postimg.cc/pVnngYLx/apex-storeth-v4-resized.png"
            alt="APEX STORE"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="สมาชิกทั้งหมด"
            value={totalMembers}
            unit="คน"
            icon={Users}
            accent="rgba(99,102,241,0.4)"
          />
          <StatCard
            label="พร้อมจำหน่าย"
            value={totalStock}
            unit="ชิ้น"
            icon={Package}
            accent="rgba(245,158,11,0.4)"
          />
          <StatCard
            label="หมวดหมู่ทั้งหมด"
            value={categories.length}
            unit="หมวดหมู่"
            icon={LayoutGrid}
            accent="rgba(16,185,129,0.4)"
          />
          <StatCard
            label="ยอดขาย"
            value={totalSales}
            unit="ครั้ง"
            icon={ShoppingCart}
            accent="rgba(239,68,68,0.4)"
          />
        </div>

        {/* ── Quick Shortcut Buttons ── */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <ShortcutBtn
              label="สั่งซื้อสินค้า"
              subLabel="GO SHOPPING"
              icon={ShoppingCart}
              colorClass="text-emerald-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-300"
              glowColor="rgba(16,185,129,0.15)"
              onClick={() => setActiveView("categories")}
            />
            <ShortcutBtn
              label="ประวัติสั่งซื้อ"
              subLabel="ORDER HISTORY"
              icon={History}
              colorClass="text-indigo-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-300"
              glowColor="rgba(99,102,241,0.15)"
              onClick={() => setActiveView("order_history")}
            />
            <ShortcutBtn
              label="ติดต่อ ADMIN"
              subLabel="CONTACT ADMIN"
              icon={MessageSquare}
              colorClass="text-rose-450 group-hover:bg-rose-500/10 group-hover:text-rose-350"
              glowColor="rgba(244,63,94,0.15)"
              onClick={() => setActiveView("contact")}
            />
            <ShortcutBtn
              label="เติมเงิน TOPUP"
              subLabel="TOPUP WALLET"
              icon={Coins}
              colorClass="text-amber-400 group-hover:bg-amber-500/10 group-hover:text-amber-300"
              glowColor="rgba(245,158,11,0.15)"
              onClick={() => setActiveView("wallet")}
            />
          </div>
        </section>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-neon-green" />
                <h2 className="text-base font-black text-white tracking-tight uppercase">หมวดหมู่แนะนำ</h2>
              </div>
              <button
                className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 font-semibold"
                onClick={() => setActiveView("categories")}
              >
                ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.slice(0, 4).map((cat) => (
                <CategoryChip key={cat.id} cat={cat} products={products} onClick={() => onSelectCategory(cat.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Products ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-yellow fill-neon-yellow animate-pulse" />
              <div>
                <h2 className="text-base font-black text-white tracking-tight uppercase">สินค้าแนะนำ</h2>
                <p className="text-xs text-white/30 mt-0.5">ของดี มีจำกัด รีบเป็นเจ้าของ</p>
              </div>
            </div>
            <button
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 font-semibold"
              onClick={() => setActiveView("categories")}
            >
              ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {safeProducts.length === 0 ? (
            <div className="text-center py-20 text-white/30 text-sm">
              ยังไม่มีสินค้าในขณะนี้
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {safeProducts.map((p) => (
                <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

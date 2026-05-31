import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CategoryCard } from "./CategoryCard";
import {
  ShoppingCart,
  Package,
  Wallet,
  ChevronRight,
  Bell,
  Users,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Clock,
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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
      const nextValue = Math.floor(startValue + easeProgress * (targetValue - startValue));
      setDisplayValue(nextValue);
      currentDisplay.current = nextValue;
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        prevValue.current = targetValue;
      }
    };
    rafRef.current = window.requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
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

  // Pre-generate stable random offsets to avoid re-render flicker from Math.random() in JSX
  const stableRandMins = React.useMemo(
    () => Array.from({ length: 10 }, (_, i) => Math.floor(Math.random() * 5) + i * 2 + 1),
    []
  );

  const bannersToUse =
    siteSettings?.banners && siteSettings.banners.length > 0
      ? siteSettings.banners
      : DEFAULT_BANNERS;

  useEffect(() => { setRealtimeStats(stats); }, [stats]);

  useEffect(() => {
    if (bannersToUse.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannersToUse.length]);

  const salesVal = siteSettings?.stats_sales_override ?? (realtimeStats?.sales || 0);
  const usersVal = siteSettings?.stats_users_override ?? (realtimeStats?.users || 0);
  const liveStock = products?.reduce((acc, p) => acc + Math.max(0, p.stock || 0), 0) || 0;

  const statCards = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "ยอดขายทั้งหมด",
      value: <NumberTicker value={salesVal} />,
      suffix: "ออเดอร์",
      color: "from-violet-500 to-purple-600",
      border: "border-violet-500/20",
      glow: "shadow-violet-500/10",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "สินค้าพร้อมจำหน่าย",
      value: <NumberTicker value={liveStock} />,
      suffix: "ชิ้น",
      color: "from-blue-500 to-cyan-500",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/10",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "สมาชิกทั้งหมด",
      value: <NumberTicker value={usersVal} />,
      suffix: "คน",
      color: "from-emerald-500 to-teal-500",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      label: "ยอดเงินของคุณ",
      value: <>฿ {user ? (user.balance || 0).toLocaleString() : "0"}</>,
      suffix: "บาท",
      color: "from-amber-500 to-orange-500",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
      onClick: () => setActiveView("wallet"),
      clickable: true,
    },
  ];

  const trustBadges = [
    { icon: <Zap className="w-3.5 h-3.5" />, text: "ส่งทันที 24 ชม." },
    { icon: <Shield className="w-3.5 h-3.5" />, text: "ปลอดภัย 100%" },
    { icon: <Clock className="w-3.5 h-3.5" />, text: "ระบบอัตโนมัติ" },
  ];

  return (
    <div className="w-full overflow-hidden space-y-8 pb-24 font-sans text-white mt-2 sm:mt-4 max-w-7xl mx-auto px-1">

      {/* ─── Banner ─── */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[16/6] sm:aspect-[25/9] md:aspect-[4/1] rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-[#0d0d0d]">
          <AnimatePresence>
            <motion.img
              loading="lazy"
              key={currentBanner}
              src={bannersToUse[currentBanner % (bannersToUse.length || 1)] || undefined}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          {/* overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          {/* banner dots */}
          {bannersToUse.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {bannersToUse.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentBanner ? "bg-white w-4" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      </AnimatedScroll>

      {/* ─── Announcement bar ─── */}
      <AnimatedScroll delay={80} direction="right">
        <div className="border border-white/5 bg-white/[0.03] rounded-xl py-2.5 px-4 flex items-center gap-3 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center gap-2 shrink-0">
            <Bell className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-white text-xs">ประกาศ</span>
            <span className="text-white/10 text-sm">|</span>
          </div>
          <div className="flex-1 relative overflow-hidden min-w-0">
            <Marquee
              text="ยินดีต้อนรับสู่ระบบอัตโนมัติ 24 ชม. | สมัครสมาชิกวันนี้รับโปรพิเศษ | สินค้าพร้อมส่งทันที ไม่ต้องรอ"
              speed={15}
              className="text-white/50 text-xs font-medium"
            />
          </div>
          {/* trust badges */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {trustBadges.map((b, i) => (
              <div key={i} className="flex items-center gap-1 text-white/40 text-[10px] font-medium">
                <span className="text-violet-400">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </AnimatedScroll>

      {/* ─── Stat Cards ─── */}
      <AnimatedScroll delay={160} direction="up">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={card.clickable ? { scale: 0.97 } : {}}
              onClick={card.onClick}
              className={`relative bg-[#0d0d0d] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 border ${card.border} shadow-lg ${card.glow} ${card.clickable ? "cursor-pointer" : ""} overflow-hidden group transition-all duration-200`}
            >
              {/* subtle gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none`} />
              
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                  {card.icon}
                </div>
                {card.clickable && (
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                )}
              </div>
              
              <div>
                <p className="text-[10px] sm:text-xs text-white/40 font-medium mb-1 truncate">{card.label}</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-none truncate">
                  {card.value}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">{card.suffix}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedScroll>

      {/* ─── Categories ─── */}
      <AnimatedScroll delay={200} direction="left">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">หมวดหมู่สินค้า</h2>
              <p className="text-[11px] text-white/30 mt-0.5">เลือกหมวดหมู่ที่คุณต้องการ</p>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg"
            >
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {categories?.slice(0, 3).map((cat, i) => {
              const catProducts = products.filter(
                (p) => p.category === cat.id || p.category === cat.name || p.category === cat.title
              );
              const prices = catProducts.map((p) => p.price);
              const minP = Math.min(...prices);
              const maxP = Math.max(...prices);
              const priceRangeStr = catProducts.length > 0
                ? (minP === maxP ? `฿${minP.toLocaleString()}` : `฿${minP.toLocaleString()} - ฿${maxP.toLocaleString()}`)
                : undefined;

              return (
                <CategoryCard
                  key={cat.id}
                  title={cat.title}
                  label="หมวดหมู่"
                  itemCountDesc={`${catProducts.length} รายการ`}
                  priceRangeStr={priceRangeStr}
                  bgImage={cat.bannerUrl || undefined}
                  index={i}
                  onClick={() => onSelectCategory(cat.name)}
                  accentColor="#9b59f5"
                  glowColor="transparent"
                  gradientFrom="#111111"
                />
              );
            })}
          </div>
        </div>
      </AnimatedScroll>

      {/* ─── Live purchase feed ─── */}
      <AnimatedScroll delay={220} direction="up">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">รายการซื้อล่าสุด</h2>
              <p className="text-[11px] text-white/30 mt-0.5">ลูกค้าที่ซื้อสินค้าล่าสุด</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="flex overflow-hidden relative w-full">
            <motion.div
              className="flex gap-3 pr-3 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 40, repeat: Infinity, repeatType: "loop" }}
            >
              {[
                ...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1, 2, 3, 4, 5]),
                ...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1, 2, 3, 4, 5]),
              ].map((purchase: any, index) => {
                const i = index % 10;
                const isDummy = typeof purchase === "number";
                const dummyProduct = isDummy ? products[i % (products.length || 1)] : null;
                const matchedProduct = !isDummy ? products.find((p) => p.name === purchase.productName) : null;

                let minsAgo = stableRandMins[i % 10];
                if (!isDummy && purchase.date) {
                  const diff = Math.floor((Date.now() - new Date(purchase.date).getTime()) / 60000);
                  if (diff >= 0) minsAgo = diff;
                }
                let timeStr = `${minsAgo} นาทีที่แล้ว`;
                if (!isDummy && purchase.date && minsAgo >= 60) {
                  timeStr = minsAgo < 1440 ? `${Math.floor(minsAgo / 60)} ชม.` : `${Math.floor(minsAgo / 1440)} วัน`;
                }
                const imgUrl = matchedProduct?.imageUrl || dummyProduct?.imageUrl;
                const name = isDummy ? dummyProduct?.name || "สินค้าพรีเมียม" : purchase.productName;
                const username = !isDummy && purchase.username ? purchase.username.substring(0, 2) + "***" : "Us***";

                return (
                  <div
                    key={index}
                    className="shrink-0 w-[220px] sm:w-[260px] bg-[#0d0d0d] border border-white/5 p-3 rounded-xl flex gap-3 hover:border-white/10 transition-all"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/5 shrink-0 overflow-hidden">
                      {imgUrl ? (
                        <img loading="lazy" src={imgUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                      <p className="text-xs font-semibold text-white truncate">{username} ซื้อแล้ว</p>
                      <p className="text-[11px] text-white/40 truncate">{name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-bold text-emerald-400">{!isDummy ? purchase.amount || 1 : 1} ชิ้น</span>
                        <span className="text-[10px] text-white/25">{timeStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </AnimatedScroll>

      {/* ─── Featured Products ─── */}
      <AnimatedScroll delay={240} direction="up">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 text-white fill-white/30" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">สินค้าแนะนำ</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Premium & Recommended</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("categories")}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-lg"
            >
              ดูทั้งหมด <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                onClick={() => product.stock > 0 && onProductClick(product.id)}
              >
                {/* image */}
                <div className="aspect-square bg-[#111] relative overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      loading="lazy"
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  {/* badges */}
                  {product.tag && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg z-10">
                      {product.tag}
                    </span>
                  )}
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 z-10">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> แนะนำ
                  </span>
                  {/* sold out */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                      <span className="bg-red-500 text-white font-black rounded-lg px-4 py-1.5 text-xs tracking-widest shadow-xl">SOLD OUT</span>
                    </div>
                  )}
                </div>

                {/* info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                  <h3 className="font-semibold text-white text-[12px] sm:text-sm leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex items-end justify-between">
                      <div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-[10px] text-white/25 line-through">
                            ฿{product.originalPrice.toLocaleString()}
                          </p>
                        )}
                        <p className="text-base sm:text-lg font-black text-violet-400 leading-none">
                          ฿{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/25 mb-0.5">คงเหลือ</p>
                        <p className={`text-[11px] font-bold ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {product.stock >= 999999 ? "∞" : product.stock}
                        </p>
                      </div>
                    </div>

                    {product.stock <= 0 ? (
                      <div className="w-full bg-white/5 text-white/25 border border-white/5 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <Package className="w-3.5 h-3.5" /> หมดแล้ว
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อเลย
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

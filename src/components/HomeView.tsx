import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShoppingCart,
  Package,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign,
  Sparkles,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Product, SiteStats, Category } from "../types";

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

export const HomeView: React.FC<HomeViewProps> = ({
  products = [],
  categories = [],
  stats,
  user,
  setActiveView,
  onProductClick,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Safeguards
  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);
  const safeCategories = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);

  // Featured / Hot Products
  const hotProducts = useMemo(() => {
    return safeProducts.filter(p => p.isPopular || p.tag?.toLowerCase().includes("hot") || p.tag?.toLowerCase().includes("best")).slice(0, 4);
  }, [safeProducts]);

  // Filtered Products based on search and selected tag
  const filteredProducts = useMemo(() => {
    let result = safeProducts;
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== "all") {
      result = result.filter(p => {
        if (selectedTag === "instock") return p.stock > 0;
        return p.category === selectedTag;
      });
    }

    return result;
  }, [safeProducts, searchQuery, selectedTag]);

  return (
    <div id="home-view-container" className="w-full pb-32 font-sans text-white bg-[#05070d] px-4 md:px-8 space-y-10 max-w-[1400px] mx-auto">
      
      {/* 1. Welcoming Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1224] via-[#090d1a] to-[#04060c] border border-white/5 p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl mt-4"
      >
        <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent opacity-50" />
        
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ยินดีต้อนรับสู่ระบบร้านค้าโฉมใหม่</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            ค้นหาดิจิทัลโปรดักส์ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">ที่ดีที่สุดสำหรับคุณ</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            เลือกซื้อไอเทม โค้ดเกม บริการ ซอฟต์แวร์ และสินค้าพรีเมียมต่าง ๆ ได้อย่างสะดวก รวดเร็ว พร้อมการจัดส่งแบบอัตโนมัติ 24 ชั่วโมง
          </p>
        </div>

        {/* User Balance Wallet Card */}
        <div className="w-full md:w-auto min-w-[280px] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 z-10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-xs text-zinc-400 font-bold">
            <span>โปรไฟล์ของคุณ</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
              ONLINE
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">ยินดีต้อนรับคุณ,</p>
            <p className="text-sm font-black text-white truncate max-w-[200px]">
              {user ? (user.username || user.email || "ผู้ใช้งานนิรนาม") : "กรุณาเข้าสู่ระบบ"}
            </p>
          </div>

          <div className="border-t border-white/5 my-3" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-black tracking-wider leading-none mb-1">ยอดเงินคงเหลือ</p>
              <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
                ฿{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            
            <button 
              onClick={() => setActiveView("wallet")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>เติมเงิน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Mini Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "สินค้าทั้งหมด", value: safeProducts.length, icon: Package, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/10" },
          { label: "หมวดหมู่บริการ", value: safeCategories.length, icon: Layers, color: "text-purple-400", bg: "bg-purple-500/5 border-purple-500/10" },
          { label: "จำหน่ายแล้ว", value: stats?.sales || 0, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
          { label: "การเติมเงินสำเร็จ", value: stats?.topups || 0, icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`p-4 rounded-2xl border ${item.bg} flex items-center gap-3`}
          >
            <div className={`p-2.5 rounded-xl bg-white/5 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-400 font-medium leading-none mb-1">{item.label}</p>
              <p className="text-lg font-black text-white">{item.value.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Browse Categories Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-extrabold text-white">เลือกซื้อตามหมวดหมู่</h2>
          </div>
          <button 
            onClick={() => setActiveView("categories")}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>ดูทั้งหมด</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeCategories.map((cat, idx) => {
            const catImg = cat.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";
            return (
              <motion.div
                key={cat.id || idx}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => {
                  onSelectCategory(cat.id || cat.name);
                  setActiveView("category_products");
                }}
                className="group relative h-28 rounded-2xl overflow-hidden border border-white/5 cursor-pointer flex flex-col justify-end p-4 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${catImg})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="relative z-10">
                  <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{cat.title || cat.name}</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{cat.subtitle || "หมวดหมู่สินค้ายอดนิยม"}</p>
                </div>
              </motion.div>
            );
          })}
          {safeCategories.length === 0 && (
            <div className="col-span-full text-center py-6 border border-dashed border-white/10 rounded-2xl text-zinc-500 text-xs">
              ไม่มีหมวดหมู่บริการในระบบ ณ ขณะนี้
            </div>
          )}
        </div>
      </div>

      {/* 4. Products Shop Grid */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">รายการสินค้าพรีเมียม</h2>
            <p className="text-xs text-zinc-400">เลือกชมสินค้าที่คุณต้องการ จัดส่งด่วนทางอีเมลหรือประวัติการสั่งซื้อทันที</p>
          </div>

          {/* Controls: Search & Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-60 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-zinc-900 border border-white/10 rounded-xl text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold transition-all cursor-pointer"
            >
              <option value="all">สินค้าทั้งหมด</option>
              <option value="instock">แสดงที่มีสินค้า</option>
              {safeCategories.map(cat => (
                <option key={cat.id} value={cat.id || cat.name}>{cat.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -3 }}
                className="bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300"
              >
                {/* Image aspect-square container */}
                <div 
                  onClick={() => onProductClick(product.id)}
                  className="aspect-square bg-zinc-950 p-3 relative cursor-pointer overflow-hidden flex items-center justify-center border-b border-white/5"
                >
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60"} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {product.isPopular && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
                        HOT
                      </span>
                    )}
                    {product.tag && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-wider">
                        {product.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info and Purchase */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 
                      onClick={() => onProductClick(product.id)}
                      className="text-sm font-bold text-white hover:text-blue-400 cursor-pointer line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
                      {product.description || "ไม่มีคำอธิบายสำหรับสินค้านี้"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Price and Stock strip */}
                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-zinc-500 line-through block leading-none mb-0.5">
                            ฿{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-base font-black text-blue-400">
                          ฿{product.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 block leading-none mb-1 font-bold">สถานะ</span>
                        <span className={`text-[10px] font-bold ${isOutOfStock ? "text-red-400" : "text-emerald-400"}`}>
                          {isOutOfStock ? "สินค้าหมด" : `คลัง: ${product.stock} ชิ้น`}
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    {isOutOfStock ? (
                      <button
                        disabled
                        className="w-full py-2 bg-zinc-800 text-zinc-500 cursor-not-allowed text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" /> สินค้าหมดชั่วคราว
                      </button>
                    ) : (
                      <button
                        onClick={() => onProductClick(product.id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อเลย
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-16 border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
              <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400">ไม่พบรายการสินค้าที่ค้นหา</p>
              <p className="text-[10px] text-zinc-500 mt-1">กรุณาลองเปลี่ยนแถบประเภท ตัวกรอง หรือพิมพ์คำอื่น</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Frequently Asked Questions (Premium addition for brand-new perfect start) */}
      <div className="border-t border-white/5 pt-10 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-extrabold text-white">คำถามที่พบบ่อย (FAQs)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { q: "ฉันจะได้รับสินค้าได้อย่างไรหลังชำระเงินสำเร็จ?", a: "ระบบของเราจัดส่งวัตถุดิบและคีย์สินค้าแบบอัตโนมัติ 24 ชม. คุณสามารถตรวจสอบข้อมูลการจัดส่งได้ทันทีที่หน้าประวัติการสั่งซื้อ" },
            { q: "ถ้าหากเกิดปัญหาระหว่างการใช้งาน ต้องติดต่อช่องทางไหน?", a: "มีทีมช่วยเหลือดูแลผ่านช่องทางแอดมินหลังบ้าน หรือกดเลือกหน้าติดต่อเราเพื่อติดต่อเจ้าหน้าที่ได้โดยตรง" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {item.q}
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed pl-3.5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

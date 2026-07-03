import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateGradient } from '../utils';

interface SearchViewProps {
  products: any[];
  onClose: () => void;
  onProductClick: (id: string) => void;
  isOpen: boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({ products, onClose, onProductClick, isOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
      setSearchQuery("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
    (p.details && p.details.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl bg-foreground border border-zinc-200 shadow-2xl rounded-3xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]"
          >
            {/* Header / Search Input */}
            <div className="p-4 border-b border-zinc-100 flex items-center gap-3.5 bg-foreground select-none">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-1" />
              <input 
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสินค้า..."
                className="flex-1 bg-transparent border-none outline-none text-base font-bold text-zinc-800 placeholder:text-muted-foreground"
              />
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 flex items-center justify-center text-muted-foreground/80 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="p-5 flex-1 overflow-y-auto no-scrollbar bg-slate-50/40">
              {searchQuery && filteredProducts.length === 0 ? (
                <div className="text-center py-16 select-none">
                  <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-zinc-700 mb-1">ไม่พบสินค้าที่คุณต้องการ</h3>
                  <p className="text-muted-foreground text-xs">ลองพิมพ์ชื่อสินค้าอื่นๆ หรือเว้นวรรคดูอีกครั้ง</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-16 select-none">
                  <Search className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                  <p className="text-muted-foreground text-xs font-bold tracking-wide">พิมพ์ชื่อสินค้า หรือข้อมูลที่คุณต้องการค้นหาที่นี่</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        onProductClick(product.id);
                        onClose();
                      }}
                      className="bg-foreground border border-[#e2e8f0] rounded-2xl p-4 cursor-pointer hover:border-[#3b82f6]/40 hover:shadow-md transition-all flex gap-3.5 items-center group shadow-sm"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-50 border border-[#e2e8f0]">
                        {product.imageUrl && product.imageUrl.trim() !== "" ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 w-full h-full items-center justify-center"
                          style={{ 
                            display: (!product.imageUrl || product.imageUrl.trim() === "") ? 'flex' : 'none',
                            background: generateGradient(product.name || product.id)
                          }}
                        >
                          <span className="text-xl font-extrabold text-foreground mix-blend-overlay opacity-60">
                            {(product.name || "P")[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#1e1e20] truncate mb-1.5 group-hover:text-[#3b82f6] transition-colors">{product.name}</div>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-blue-600 font-mono text-sm">
                            ฿{product.price > 0 ? product.price.toLocaleString() : "ฟรี"}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-muted-foreground/80 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-cardmerald-500"></div>
                              มีของ {product.stock} ชิ้น
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full text-[10px]">หมด</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

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
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-3xl bg-[#0a0a0a] border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]"
          >
            {/* Header / Search Input */}
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-3 bg-[#111]">
              <Search className="w-5 h-5 text-zinc-500 flex-shrink-0" />
              <input 
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาสินค้า..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-zinc-500"
              />
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Area */}
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar bg-[#0a0a0a]">
              {searchQuery && filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">ไม่พบสินค้า</h3>
                  <p className="text-zinc-500 text-sm">ลองใช้คำค้นหาอื่นดูอีกครั้ง</p>
                </div>
              ) : !searchQuery ? (
                <div className="text-center py-16">
                  <p className="text-zinc-500 text-sm">พิมพ์ชื่อสินค้าที่คุณต้องการค้นหา</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        onProductClick(product.id);
                        onClose();
                      }}
                      className="bg-[#111] border border-white/[0.05] rounded-xl p-3 cursor-pointer hover:border-white/[0.15] hover:bg-white/[0.02] transition-all flex gap-3 items-center group"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0 bg-zinc-900 border border-white/[0.05]">
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
                          <span className="text-xl font-black text-white mix-blend-overlay opacity-60">
                            {(product.name || "P")[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate mb-1">{product.name}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-neon-yellow font-bold">
                            ฿{product.price > 0 ? product.price.toLocaleString() : "ฟรี"}
                          </span>
                          {product.stock > 0 ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 relative">
                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                              </div>
                              สต็อก {product.stock}
                            </span>
                          ) : (
                            <span className="text-red-500">หมดชั่วคราว</span>
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

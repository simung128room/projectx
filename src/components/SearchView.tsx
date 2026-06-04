import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { generateGradient } from '../utils';

interface SearchViewProps {
  products: any[];
  onBack: () => void;
  onProductClick: (id: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ products, onBack, onProductClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
    (p.details && p.details.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto w-full"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-card border border-border border-2 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors brut-card"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full bg-card border border-border border-2 py-3 pl-12 pr-4 outline-none focus:border-[#1D4ED8]/50 focus:bg-[#050505] transition-colors text-white placeholder:text-zinc-500 brut-card"
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-4">
        {searchQuery && filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border border-2 brut-card">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">ไม่พบสินค้า</h3>
            <p className="text-muted-foreground">ไม่พบสินค้าที่ตรงกับ "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="bg-card border border-border border-2 p-4 cursor-pointer hover:border-white/10 transition-all group overflow-hidden relative flex flex-col h-full brut-card"
              >
                {product.imageUrl && product.imageUrl.trim() !== "" ? (
                  <div className="w-full aspect-video overflow-hidden mb-4 relative bg-card border border-border border-2 brut-card">
                    <img loading="lazy" src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      className="w-full h-full flex items-center justify-center absolute inset-0 opacity-80"
                      style={{ 
                        display: 'none',
                        background: generateGradient(product.name || product.id)
                      }}
                    >
                      <span className="text-5xl font-black text-white mix-blend-overlay opacity-60">
                        {(product.name || "P")[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full aspect-video overflow-hidden mb-4 relative bg-card flex items-center justify-center border border-border border-2 group-hover:border-white/10 opacity-80 transition-all brut-card"
                    style={{ background: generateGradient(product.name || product.id) }}
                  >
                     <span className="text-5xl font-black text-white mix-blend-overlay opacity-60">
                        {(product.name || "P")[0].toUpperCase()}
                     </span>
                  </div>
                )}
                
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors flex-1">{product.name}</h3>
                
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-border border-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">ราคา</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-blue-600 font-medium text-sm">฿</span>
                      <span className="text-xl font-black text-white leading-none">{(product.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">คงเหลือ</span>
                     <span className="text-sm font-bold text-blue-500">{product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

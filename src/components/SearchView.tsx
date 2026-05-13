import React, { useState } from 'react';
import { Search, ArrowLeft, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchViewProps {
  products: any[];
  onBack: () => void;
  onProductClick: (id: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ products, onBack, onProductClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.details && p.details.toLowerCase().includes(searchQuery.toLowerCase()))
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
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full bg-[#12161E] border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white placeholder:text-zinc-500"
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-4">
        {searchQuery && filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#0B0F14] border border-white/5 rounded-3xl">
            <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">ไม่พบสินค้า</h3>
            <p className="text-zinc-500">ไม่พบสินค้าที่ตรงกับ "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="bg-[#0B0F14] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-white/10 hover:shadow-lg transition-all group overflow-hidden relative flex flex-col h-full"
              >
                {product.image ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 relative bg-zinc-900 border border-white/5">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 relative bg-zinc-900 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                     <ShoppingCart className="w-8 h-8 text-zinc-700" />
                  </div>
                )}
                
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 leading-tight group-hover:text-[#1E90FF] transition-colors flex-1">{product.name}</h3>
                
                <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">ราคา</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#1E90FF] font-medium text-sm">฿</span>
                      <span className="text-xl font-black text-white leading-none">{(product.price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">คงเหลือ</span>
                     <span className="text-sm font-bold text-emerald-500">{product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด'}</span>
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

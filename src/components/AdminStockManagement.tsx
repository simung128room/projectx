import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Database, Trash2, Edit2, ArrowLeft, Search, Package, LayoutGrid, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminStockManagement({ products, categories, setProducts }: any) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockItems, setStockItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ITEMS_PER_PAGE = 50;

  const productsByCategory = useMemo(() => {
    return categories.map((cat: any) => ({
      ...cat,
      products: products.filter((p: any) => p.category === cat.id || p.category === cat.name || p.category === cat.title)
    })).filter((cat: any) => cat.products.length > 0);
  }, [products, categories]);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      axios.get(`/api/products/${selectedProduct.id}/stock`)
        .then(res => {
           setStockItems(res.data.stockData || []);
        })
        .catch(err => {
           console.error("Failed to load stock data", err);
           Swal.fire({title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถโหลดข้อมูลสต็อกได้', icon: 'error', background: '#09090b', color: '#fff'});
        })
        .finally(() => {
           setLoading(false);
        });
      setPage(1);
      setSearchTerm("");
    }
  }, [selectedProduct]);

  const handleSaveAllStock = async (newStockItems: string[]) => {
      try {
         setLoading(true);
         const payload = { ...selectedProduct, stockData: newStockItems, stock: newStockItems.length };
         await axios.put(`/api/products/${selectedProduct.id}`, payload);
         
         const fresh = await axios.get(`/api/products/${selectedProduct.id}`);
         setStockItems(fresh.data.stockData || []);
         setSelectedProduct(fresh.data);
         if (setProducts) {
             setProducts((prev: any[]) => prev.map((p: any) => p.id === selectedProduct.id ? fresh.data : p));
         }

         Swal.fire({
           title: 'บันทึกสต็อกเรียบร้อย', 
           icon: 'success', 
           toast: true, 
           position: 'top-end', 
           showConfirmButton: false, 
           timer: 1500,
           background: '#09090b',
           color: '#fff'
         });
      } catch (err: any) {
         Swal.fire({title: 'เกิดข้อผิดพลาด', text: err.response?.data?.error || err.message || 'ไม่สามารถบันทึกสต็อกได้', icon: 'error', background: '#09090b', color: '#fff'});
      } finally {
         setLoading(false);
      }
  };

  const handleDelete = (originalIndex: number) => {
    Swal.fire({
      title: 'ลบแถวสต็อกใช่หรือไม่?',
      text: 'คุณกำลังจะลบสต็อกรายการนี้ออกจากฐานข้อมูลแบบถาวร',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#71717a'
    }).then((result) => {
      if (result.isConfirmed) {
         const newStock = [...stockItems];
         newStock.splice(originalIndex, 1);
         setStockItems(newStock);
         handleSaveAllStock(newStock);
      }
    });
  };

  const handleEdit = (originalIndex: number, val: string) => {
    Swal.fire({
      title: 'แก้ไขรายละเอียดรหัส/ลิงก์สต็อก',
      input: 'textarea',
      inputValue: val,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      background: '#09090b',
      color: '#fff',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#71717a'
    }).then((result) => {
      if (result.isConfirmed && result.value !== undefined) {
         const newStock = [...stockItems];
         newStock[originalIndex] = result.value;
         setStockItems(newStock);
         handleSaveAllStock(newStock);
      }
    });
  };

  if (selectedProduct) {
    const filteredStock = stockItems.map((item, originalIndex) => ({ item, originalIndex })).filter(x => x.item.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
    const paginated = filteredStock.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="p-2 border border-zinc-800 bg-zinc-900/60 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-md transition-colors"
                  title="กลับ"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                   <h2 className="text-base font-bold text-white flex items-center gap-2">
                       <Database className="w-4 h-4 text-[#3B82F6]" /> รายการสต็อก: {selectedProduct.name}
                   </h2>
                   <p className="text-zinc-500 text-xs">สต็อกทั้งหมด <span className="text-[#3B82F6] font-mono font-bold">{stockItems.length}</span> แถว (ค้นพบ {filteredStock.length} แถว)</p>
                </div>
            </div>
            <div className="w-full sm:w-64 relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="ค้นหารหัส หรือคีย์สต็อก..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-xs text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
                />
            </div>
         </div>
         
         <div className="bg-card border border-zinc-800 rounded-lg p-5 overflow-hidden shadow-sm">
              {loading ? (
                  <div className="text-center py-20">
                     <Loader2 className="animate-spin h-8 w-8 text-[#3B82F6] mx-auto mb-3" />
                     <p className="text-zinc-500 text-xs font-semibold">กำลังเชื่อมต่อฐานข้อมูลสต็อก...</p>
                  </div>
              ) : paginated.length === 0 ? (
                  <div className="text-center py-20 text-zinc-600">
                     <Database className="w-10 h-10 mx-auto mb-2 opacity-35" />
                     <p className="font-bold text-sm">ไม่พบรายการสต็อกสินค้าชิ้นนี้</p>
                     <p className="text-xs mt-1">กรุณากลับไปหน้า จัดการสินค้า และคลิกเพิ่มสต๊อกใหม่</p>
                  </div>
              ) : (
                 <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                     {paginated.map(({item, originalIndex}, idx) => (
                         <div key={idx} className="flex bg-zinc-950/40 p-3 border border-zinc-850 hover:border-zinc-800/80 items-center justify-between rounded-md transition-all group">
                             <span className="text-zinc-400 font-mono text-xs max-w-[80%] truncate select-all">{item}</span>
                             <div className="flex gap-2">
                                 <button 
                                   onClick={() => handleEdit(originalIndex, item)} 
                                   className="p-1.5 border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/60 rounded transition-all"
                                   title="แก้ไข"
                                 >
                                     <Edit2 className="w-3.5 h-3.5"/>
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(originalIndex)} 
                                   className="p-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/60 rounded transition-all"
                                   title="ลบแถวชิ้นนี้"
                                 >
                                     <Trash2 className="w-3.5 h-3.5"/>
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
              )}
         </div>

         {totalPages > 1 && (
            <div className="flex items-center gap-4 justify-between bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
               <button 
                 onClick={() => setPage(p => Math.max(1, p - 1))} 
                 disabled={page === 1} 
                 className="px-4 py-2 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
               >
                 ก่อนหน้า
               </button>
               <span className="text-zinc-500 text-xs font-bold font-mono">หน้า {page} / {totalPages}</span>
               <button 
                 onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                 disabled={page === totalPages} 
                 className="px-4 py-2 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
               >
                 ถัดไป
               </button>
            </div>
         )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-[#3B82F6]" /> จัดการคลังสต็อกหลังบ้าน
          </h2>
          <p className="text-xs text-zinc-500 mt-1">คุณสามารถดู ค้นหา คัดกรอง แก้ไข และลบแถวคีย์สต็อกของสินค้าทุกหมวดหมู่ได้อย่างสะดวกถ้วนทั่ว</p>
      </div>

      {productsByCategory.length === 0 ? (
          <div className="bg-card border border-zinc-800 p-12 text-center rounded-lg">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3 opacity-30" />
              <p className="text-zinc-500 text-sm font-semibold">ยังไม่มีรายการสินค้าผูกในหมวดหมู่ต่างๆ คลังจึงว่างเปล่า</p>
          </div>
      ) : (
          <div className="space-y-6">
              {productsByCategory.map((cat: any) => (
                 <div key={cat.id || cat.name} className="bg-card border border-zinc-800/80 rounded-lg p-5">
                    <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider mb-4 flex items-center gap-2 border-b border-zinc-850 pb-2.5">
                        <LayoutGrid className="w-4 h-4 text-[#3B82F6]" /> {cat.title || cat.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {cat.products.map((p: any) => {
                           const stockCount = p.stockData?.length || p.stock || 0;
                           return (
                               <div 
                                 key={p.id} 
                                 onClick={() => setSelectedProduct(p)} 
                                 className="p-4 bg-zinc-950/40 border border-zinc-850 hover:border-[#3B82F6]/60 cursor-pointer rounded-lg hover:bg-zinc-900/60 transition-all duration-200 flex items-center justify-between group"
                               >
                                  <div className="min-w-0 pr-2">
                                      <p className="font-bold text-zinc-300 text-xs group-hover:text-white transition-colors truncate">{p.name}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                                            stockCount > 0 
                                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          }`}>
                                              <Database className="w-2.5 h-2.5" /> มีสต็อก: {stockCount}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-md opacity-65 group-hover:opacity-100 group-hover:bg-[#3B82F6]/10 group-hover:border-[#3B82F6] transition-all shrink-0">
                                      <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-[#3B82F6]" />
                                  </div>
                               </div>
                           );
                       })}
                    </div>
                 </div>
              ))}
          </div>
      )}
    </div>
  );
}

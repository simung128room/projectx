import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Database, Trash2, Edit2, ArrowLeft, Search, Package, LayoutGrid } from "lucide-react";
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
      products: products.filter((p: any) => p.category === cat.id)
    })).filter((cat: any) => cat.products.length > 0);
  }, [products, categories]);

  useEffect(() => {
    if (selectedProduct) {
      // Products list usually strips stockData, so we must fetch it.
      if (!selectedProduct.stockData) {
        setLoading(true);
        axios.get(`/api/products/${selectedProduct.id}/stock`)
          .then(res => {
             setStockItems(res.data.stockData || []);
          })
          .catch(err => {
             console.error("Failed to load stock data", err);
             Swal.fire({title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถโหลดข้อมูลสต็อกได้', icon: 'error', background: '#121417', color: '#fff'});
          })
          .finally(() => {
             setLoading(false);
          });
      } else {
        setStockItems(selectedProduct.stockData || []);
      }
      setPage(1);
      setSearchTerm("");
    }
  }, [selectedProduct]);

  const handleSaveAllStock = async (newStockItems: string[]) => {
      try {
         setLoading(true);
         const payload = { ...selectedProduct, stockData: newStockItems, stock: newStockItems.length };
         const res = await axios.put(`/api/products/${selectedProduct.id}`, payload);
         
         const fresh = await axios.get(`/api/products/${selectedProduct.id}`);
         setStockItems(fresh.data.stockData || []);
         setSelectedProduct(fresh.data);
         if (setProducts) {
             setProducts((prev: any[]) => prev.map((p: any) => p.id === selectedProduct.id ? fresh.data : p));
         }

         Swal.fire({
           title: 'บันทึกสำเร็จ', 
           icon: 'success', 
           toast: true, 
           position: 'top-end', 
           showConfirmButton: false, 
           timer: 1500,
           background: '#121417',
           color: '#fff'
         });
      } catch (err: any) {
         Swal.fire({title: 'เกิดข้อผิดพลาด', text: err.message || 'ไม่สามารถบันทึกสต็อกได้', icon: 'error', background: '#121417', color: '#fff'});
      } finally {
         setLoading(false);
      }
  };

  const handleDelete = (originalIndex: number) => {
    Swal.fire({
      title: 'ต้องการลบใช่หรือไม่?',
      text: 'คุณกำลังจะลบสต็อก 1 แถว',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      background: '#0B0D0F',
      color: '#fff',
      confirmButtonColor: '#ef4444'
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
      title: 'แก้ไขข้อมูลสต็อก',
      input: 'textarea',
      inputValue: val,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      background: '#0B0D0F',
      color: '#fff',
      confirmButtonColor: '#2563EB'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
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
      <div className="animate-in fade-in zoom-in-95 duration-200">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-[#0B0D0F] border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-900" />
                </button>
                <div>
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       <Database className="w-5 h-5 text-[#2563EB]" /> สต็อก: {selectedProduct.name}
                   </h2>
                   <p className="text-gray-500 text-sm">ทั้งหมด {stockItems.length} รายการ (พบ {filteredStock.length} รายการ)</p>
                </div>
            </div>
            <div className="flex-1 max-w-sm relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="ค้นหาสต็อก..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-900 focus:border-[#2563EB] focus:outline-none transition-colors"
                />
            </div>
         </div>
         
         <div className="bg-[#0B0D0F] border border-gray-200 rounded-xl p-4 overflow-hidden">
             {loading ? (
                 <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลสต็อก...</p>
                 </div>
             ) : paginated.length === 0 ? (
                 <div className="text-center py-20">
                    <Database className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">ไม่พบรายการสต็อก</p>
                 </div>
             ) : (
                <div className="space-y-2">
                    {paginated.map(({item, originalIndex}, idx) => (
                        <div key={idx} className="flex bg-gray-100 p-4 rounded-xl border border-gray-200 items-center justify-between hover:border-gray-200 transition-colors group">
                            <span className="text-gray-700 font-mono text-xs max-w-[80%] truncate select-all">{item}</span>
                            <div className="flex gap-2 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(originalIndex, item)} className="p-2 bg-gray-50 border border-gray-200 hover:border-blue-500/50 hover:bg-blue-500/10 rounded-lg text-gray-600 hover:text-blue-400 transition-all">
                                    <Edit2 className="w-4 h-4"/>
                                </button>
                                <button onClick={() => handleDelete(originalIndex)} className="p-2 bg-gray-50 border border-gray-200 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-400 transition-all">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             )}
         </div>

         {totalPages > 1 && (
            <div className="flex items-center gap-4 justify-between bg-[#0B0D0F] border border-gray-200 rounded-2xl p-4 mt-4">
               <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-200 rounded-xl text-gray-900 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">ก่อนหน้า</button>
               <span className="text-gray-600 text-sm font-bold">หน้า {page} จาก {totalPages}</span>
               <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-200 rounded-xl text-gray-900 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">ถัดไป</button>
            </div>
         )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase tracking-wide">
              <Database className="w-6 h-6 text-[#2563EB]" /> จัดการสต็อกแยกหมวดหมู่
          </h2>
          <p className="text-gray-500 text-sm mt-2">คุณสามารถดู ค้นหา แก้ไข และลบสต็อกที่อยู่ข้างในสินค้าได้จากหน้านี้</p>
      </div>

      {productsByCategory.length === 0 ? (
          <div className="bg-[#0B0D0F] border border-gray-200 rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีสินค้าในระบบ</p>
          </div>
      ) : (
          <div className="space-y-6">
              {productsByCategory.map((cat: any) => (
                 <div key={cat.id} className="bg-[#0B0D0F] border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-blue-600" /> {cat.name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {cat.products.map((p: any) => {
                           const stockCount = p.stockData?.length || p.stock || 0;
                           return (
                               <div key={p.id} onClick={() => setSelectedProduct(p)} className="p-4 bg-gray-100 border border-gray-200 hover:border-[#3B82F6]/30 rounded-2xl cursor-pointer hover:bg-purple-600/5 transition-all flex items-center justify-between group">
                                  <div>
                                      <p className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{p.name}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                          <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${stockCount > 0 ? 'bg-blue-600/10 text-blue-600' : 'bg-red-500/10 text-red-400'}`}>
                                              <Database className="w-3 h-3" /> {stockCount}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:bg-purple-600 group-hover:border-[#3B82F6] transition-all">
                                      <Edit2 className="w-3 h-3 text-gray-600 group-hover:text-gray-900" />
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

import fs from 'fs';

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const storeUI = `
          {adminTab === 'store' && (
            <motion.div 
              key="store"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Site Stats */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" /> ตั้งค่าสถิติหน้าแรก</h3>
                  <button 
                    onClick={() => {
                        let currentUsers = siteStats.users;
                        let currentStock = siteStats.stock;
                        let currentSales = siteStats.sales;
                        Swal.fire({
                            title: 'แก้ไขสถิติ',
                            html: \`
                              <input id="swal-users" class="swal2-input" placeholder="ผู้ใช้งาน" value="\${currentUsers}">
                              <input id="swal-stock" class="swal2-input" placeholder="สต๊อกสินค้า" value="\${currentStock}">
                              <input id="swal-sales" class="swal2-input" placeholder="ยอดขาย" value="\${currentSales}">
                            \`,
                            focusConfirm: false,
                            background: '#09090b',
                            color: '#fff',
                            preConfirm: () => {
                              return {
                                users: parseInt((document.getElementById('swal-users') as HTMLInputElement).value),
                                stock: parseInt((document.getElementById('swal-stock') as HTMLInputElement).value),
                                sales: parseInt((document.getElementById('swal-sales') as HTMLInputElement).value)
                              }
                            }
                        }).then((result) => {
                            if (result.isConfirmed && setSiteStats) {
                                setSiteStats(result.value!);
                                Swal.fire({ title: 'บันทึกสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                            }
                        });
                    }}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.users.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.stock.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.sales.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-emerald-400" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => {
                        Swal.fire({
                            title: 'เพิ่มสินค้าใหม่',
                            html: \`
                              <input id="p-name" class="swal2-input" placeholder="ชื่อสินค้า">
                              <input id="p-desc" class="swal2-input" placeholder="รายละเอียด">
                              <input id="p-price" type="number" class="swal2-input" placeholder="ราคา">
                              <input id="p-img" class="swal2-input" placeholder="URL รูปภาพ">
                              <input id="p-stock" type="number" class="swal2-input" placeholder="จำนวนในสต๊อก">
                            \`,
                            focusConfirm: false,
                            background: '#09090b',
                            color: '#fff',
                            preConfirm: () => {
                              return {
                                id: Math.random().toString(36).substr(2, 9),
                                name: (document.getElementById('p-name') as HTMLInputElement).value,
                                description: (document.getElementById('p-desc') as HTMLInputElement).value,
                                price: parseInt((document.getElementById('p-price') as HTMLInputElement).value),
                                imageUrl: (document.getElementById('p-img') as HTMLInputElement).value,
                                stock: parseInt((document.getElementById('p-stock') as HTMLInputElement).value)
                              }
                            }
                        }).then((result) => {
                            if (result.isConfirmed && setProducts) {
                                setProducts([...products, result.value!]);
                                Swal.fire({ title: 'เพิ่มสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                            }
                        });
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-[#09090b] text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">สินค้า</th>
                        <th className="px-4 py-3">ราคา</th>
                        <th className="px-4 py-3">สต๊อก</th>
                        <th className="px-4 py-3 text-right rounded-r-xl">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 flex items-center gap-3">
                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                            <div>
                                <div className="text-white font-bold">{p.name}</div>
                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{p.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-emerald-400">฿{p.price.toLocaleString()}</td>
                          <td className="px-4 py-4">{p.stock}</td>
                          <td className="px-4 py-4 text-right">
                            <button 
                                onClick={() => {
                                    if(setProducts) {
                                        setProducts(products.filter(prod => prod.id !== p.id));
                                    }
                                }}
                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                          ยังไม่มีสินค้า
                      </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'keys' && (
`;

content = content.replace(`          {adminTab === 'keys' && (`, storeUI);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);

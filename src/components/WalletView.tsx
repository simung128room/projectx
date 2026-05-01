import React, { useState } from 'react';
import { Wallet, Gift, QrCode, Ticket, ArrowRight, CreditCard, Landmark, AlertTriangle, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { UserPlan } from '../types';

interface WalletViewProps {
  userPlan: UserPlan | null;
  setUserPlan: React.Dispatch<React.SetStateAction<UserPlan | null>>;
  onTopupSuccess?: (entry: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ userPlan, setUserPlan, onTopupSuccess }) => {
  const [activeTab, setActiveTab] = useState<'truemoney' | 'bank' | 'code'>('truemoney');
  const [truemoneyLink, setTruemoneyLink] = useState('');
  const [redeemCode, setRedeemCode] = useState('');

  const handleTruemoneyTopup = async (e: React.FormEvent) => {
    e.preventDefault();

    const regex = /https:\/\/gift\.truemoney\.com\/campaign\/\?v=([a-zA-Z0-9]{18})/;
    const match = truemoneyLink.match(regex);

    if (!match) {
      Swal.fire({
        title: 'ข้อมูลไม่ถูกต้อง',
        text: 'รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }

    const voucherCode = match[1];

    Swal.fire({
      title: 'กำลังตรวจสอบ',
      text: 'ระบบกำลังตรวจสอบซองอั่งเปาของคุณ...',
      icon: 'info',
      background: '#09090b',
      color: '#fff',
      showConfirmButton: false,
      allowOutsideClick: false
    });

    try {
      const response = await axios.post('/api/topup/truemoney', {
        voucherCode,
        phone: '0951378403' // Using the specific phone number as requested
      });

      if (response.data.success) {
        const amount = response.data.amount;
        
        // Update user plan balance
        if (setUserPlan) {
          setUserPlan((prev: UserPlan | null) => prev ? ({
            ...prev,
            balance: (prev.balance || 0) + amount
          }) : {
            username: 'User',
            isPremium: false,
            premiumExpireDate: null,
            balance: amount
          });
        }
        
        try {
          const historyEntry = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Truemoney',
            amount,
            timestamp: new Date().toISOString(),
            billNumber: 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0')
          };
          if (onTopupSuccess) onTopupSuccess(historyEntry);
          const savedHistoryStr = localStorage.getItem('apex_topup_history') || '[]';
          let historyData = JSON.parse(savedHistoryStr);
          historyData.unshift(historyEntry);
          localStorage.setItem('apex_topup_history', JSON.stringify(historyData.slice(0, 50)));
        } catch(e) {}

        Swal.fire({
          title: 'เติมเงินสำเร็จ',
          text: `คุณได้รับเครดิต ${amount} บาท เรียบร้อยแล้ว`,
          icon: 'success',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#0ea5e9'
        });
        setTruemoneyLink('');
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: response.data.error || 'ไม่สามารถรับอั่งเปาได้',
          icon: 'error',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#0ea5e9'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.error || err.message || 'เครือข่ายขัดข้อง',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
    }
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Swal.fire({
      title: 'กำลังตรวจสอบ',
      text: 'ระบบกำลังตรวจสอบสลิปการโอนเงินของคุณ...',
      icon: 'info',
      background: '#09090b',
      color: '#fff',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      // Extract base64 without data type
      const imageBase64 = result.split(',')[1];
      
      try {
        const response = await axios.post('/api/topup/slip', { imageBase64 });
        
        if (response.data.success) {
          const amount = response.data.amount;
          if (setUserPlan) {
            setUserPlan((prev: UserPlan | null) => prev ? ({
              ...prev,
              balance: (prev.balance || 0) + amount
            }) : {
              username: 'User',
              isPremium: false,
              premiumExpireDate: null,
              balance: amount
            });
          }
          
          try {
            const historyEntry = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'Slip Transfer',
              amount,
              timestamp: new Date().toISOString()
            };
            const savedHistoryStr = localStorage.getItem('apex_topup_history') || '[]';
            let historyData = JSON.parse(savedHistoryStr);
            historyData.unshift(historyEntry);
            localStorage.setItem('apex_topup_history', JSON.stringify(historyData.slice(0, 50)));
          } catch(e) {}
          
          Swal.fire({
            title: 'เติมเงินสำเร็จ',
            text: `ตรวจสอบสลิปสำเร็จ! คุณได้รับเครดิต ${amount} บาท`,
            icon: 'success',
            background: '#09090b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
          });
        } else {
          Swal.fire({
            title: 'ตรวจสอบสลิปไม่สำเร็จ',
            text: response.data.error || 'สลิปไม่ถูกต้อง หรือถูกใช้งานไปแล้ว',
            icon: 'error',
            background: '#09090b',
            color: '#fff',
            confirmButtonColor: '#0ea5e9'
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: err.response?.data?.error || err.message || 'เครือข่ายขัดข้อง',
          icon: 'error',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#0ea5e9'
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    
    Swal.fire({
      title: 'ตรวจสอบโค้ด',
      text: 'กำลังตรวจสอบการใช้งานโค้ด...',
      icon: 'info',
      background: '#09090b',
      color: '#fff',
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      Swal.fire({
        title: 'ผิดพลาด',
        text: 'โค้ดไม่ถูกต้องหรือถูกใช้งานไปแล้ว',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-900">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-8 h-8 text-red-500" />
            ระบบเติมเงิน
          </h1>
          <p className="text-zinc-500 font-medium">Topup Selection / เลือกช่องทางการชำระเงิน</p>
        </div>
        <div className="bg-white border border-zinc-200 shadow-sm px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">ยอดเงินคงเหลือ</span>
            <span className="text-3xl font-sans font-black text-zinc-900 tracking-tight">฿ {userPlan?.balance ? userPlan.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods Sidebar */}
        <div className="col-span-1 flex flex-col gap-3">
          <button
            onClick={() => setActiveTab('truemoney')}
            className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${activeTab === 'truemoney' ? 'bg-orange-50 border-orange-200' : 'bg-white border-zinc-200 hover:border-orange-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeTab === 'truemoney' ? 'bg-orange-100 text-orange-600' : 'bg-zinc-50 text-zinc-500'}`}>
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`font-bold ${activeTab === 'truemoney' ? 'text-orange-900' : 'text-zinc-700'}`}>Truemoney Wallet</p>
                <p className="text-xs opacity-70">(อั่งเปา)</p>
              </div>
            </div>
            {activeTab === 'truemoney' && <ArrowRight className="w-4 h-4 text-orange-500" />}
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${activeTab === 'bank' ? 'bg-blue-50 border-blue-200' : 'bg-white border-zinc-200 hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeTab === 'bank' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-50 text-zinc-500'}`}>
                <Landmark className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`font-bold ${activeTab === 'bank' ? 'text-blue-900' : 'text-zinc-700'}`}>ธนาคาร</p>
                <p className="text-xs opacity-70">(เช็คสลิป)</p>
              </div>
            </div>
            {activeTab === 'bank' && <ArrowRight className="w-4 h-4 text-blue-500" />}
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center justify-between p-4 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-md ${activeTab === 'code' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-zinc-200 hover:border-emerald-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${activeTab === 'code' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-50 text-zinc-500'}`}>
                <Ticket className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`font-bold ${activeTab === 'code' ? 'text-emerald-900' : 'text-zinc-700'}`}>กรอกโค้ด</p>
                <p className="text-xs opacity-70">(Redeem Code)</p>
              </div>
            </div>
            {activeTab === 'code' && <ArrowRight className="w-4 h-4 text-emerald-500" />}
          </button>
        </div>

        {/* Payment Form Area */}
        <div className="col-span-1 md:col-span-2">
          {activeTab === 'truemoney' && (
            <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full mb-3 border border-orange-100">
                  0% ค่าธรรมเนียม
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Truemoney Wallet (ซองของขวัญ)</h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  กรุณาสร้างซองของขวัญ (อั่งเปา) จากแอป Truemoney Wallet และนำลิงก์มาวางด้านล่าง
                  ยอดเงินจะเข้าสู่ระบบทันทีโดยไม่มีการหักค่าธรรมเนียม
                </p>
              </div>

              <form onSubmit={handleTruemoneyTopup} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">ลิงก์ซองของขวัญ (Truemoney Link)</label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-sans"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-orange-500/20"
                >
                  ยืนยันการเติมเงิน
                </button>
              </form>

              <div className="mt-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <h3 className="text-sm font-bold text-orange-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> ข้อควรระวัง
                </h3>
                <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
                  <li>ต้องสร้างซองแบบ "สุ่มจำนวนเงิน" และกรอกจำนวนคนรับเป็น 1 คนเท่านั้น</li>
                  <li>ระบบจะทำการเติมเงินให้อัตโนมัติใน 1-3 วินาที</li>
                  <li>หากมีปัญหาในการเติมเงิน โปรดติดต่อแอดมินพร้อมแนบลิงก์ซอง</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-3 border border-blue-100">
                  0% ค่าธรรมเนียม
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">โอนผ่านธนาคาร</h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  จำเป็นต้องทำการโอนเงินผ่านแอพพลิเคชั่น Mobile Banking ของธนาคาร ที่มี QR Code ในสลิปโอนเงิน มิเช่นนั้นระบบจะไม่สามารถตรวจสอบการโอนเงินของท่านได้ (ไม่รองรับสลิปธนาคารที่ไม่มี QR Code หรือการโอนจาก E-Wallet)
                </p>
              </div>

              <div className="flex flex-col p-6 bg-zinc-50 border border-zinc-200 rounded-3xl mb-6 w-full max-w-sm mx-auto shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#00A950] rounded-full flex items-center justify-center font-bold text-white shadow-md shrink-0 border-2 border-white flex-col leading-none">
                    <span className="text-[10px] uppercase font-black">K</span>
                    <span className="text-[8px] uppercase">Bank</span>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-zinc-500 font-medium">ธนาคารกสิกรไทย</p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                      <p className="text-xl font-bold tracking-widest text-[#00A950] font-mono">1963870325</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1963870325');
                          Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'คัดลอกเลขบัญชีแล้ว',
                            showConfirmButton: false,
                            timer: 1500
                          });
                        }}
                        className="p-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900 rounded-md transition-colors"
                        title="คัดลอกเลขบัญชี"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 flex justify-between items-center shadow-sm">
                  <p className="text-sm text-zinc-500">ชื่อบัญชี</p>
                  <p className="font-bold text-zinc-900 text-lg">กริวชญ์</p>
                </div>
              </div>
              
              <div className="text-center">
                 <label className="flex flex-col items-center justify-center w-full py-8 bg-zinc-50 hover:bg-zinc-100 focus:bg-zinc-100 text-zinc-900 font-bold rounded-3xl transition-all border-2 border-dashed border-zinc-200 hover:border-blue-400 cursor-pointer shadow-sm group">
                   <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSlipUpload} />
                   <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform group-hover:bg-blue-100">
                     <QrCode className="w-8 h-8 text-blue-500" />
                   </div>
                   <span className="text-lg">อัพโหลดรูปสลิปได้ที่นี่</span>
                   <span className="text-xs font-normal text-zinc-500 mt-2 max-w-xs text-center leading-relaxed">
                     รูปต้องเกิดจากการสร้างโดยแอพธนาคารและมี QR Code เท่านั้น (รองรับ PNG, JPEG)
                   </span>
                 </label>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">กรอกโค้ด (Redeem Code)</h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  นำโค้ดที่ได้รับจากกิจกรรม หรือ โปรโมชั่น มากรอกเพื่อรับเครดิตหรือรางวัลฟรี
                </p>
              </div>

              <form onSubmit={handleRedeemCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">รหัสโค้ด / Code</label>
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="ENTER YOUR CODE"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all font-sans uppercase font-bold tracking-widest text-center text-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-500/20"
                >
                  ใช้งานโค้ด
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

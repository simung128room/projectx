import React, { useState } from 'react';
import { Wallet, Gift, QrCode, ArrowRight, Landmark, AlertTriangle, Copy, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { UserPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface WalletViewProps {
  userPlan: UserPlan | null;
  setUserPlan: React.Dispatch<React.SetStateAction<UserPlan | null>>;
  onTopupSuccess?: (entry: any) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ userPlan, setUserPlan, onTopupSuccess }) => {
  const [openModal, setOpenModal] = useState<'truemoney' | 'bank' | null>(null);
  const [truemoneyLink, setTruemoneyLink] = useState('');

  const handleTruemoneyTopup = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLink = truemoneyLink.trim();
    let voucherCode = '';
    
    // Check if it's a direct hash or a potential TrueMoney link
    if (trimmedLink.length >= 10) {
      if (/^[a-zA-Z0-9]+$/.test(trimmedLink)) {
        voucherCode = trimmedLink;
      } else if (trimmedLink.includes('truemoney.com') || trimmedLink.includes('?v=')) {
        voucherCode = trimmedLink;
      }
    }

    if (!voucherCode) {
      Swal.fire({
        title: 'ข้อมูลไม่ถูกต้อง',
        text: 'รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง กรุณาใช้ลิงก์ที่ถูกต้องหรือกรอกเฉพาะรหัสอั่งเปา',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      });
      return;
    }

    setOpenModal(null); // Close modal on submit
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
        voucherCode
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
            username: userPlan?.username || 'Unknown',
            type: 'Truemoney',
            method: 'ซองของขวัญ (Gift Link)',
            amount,
            status: 'success',
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

    setOpenModal(null); // Close modal on submit
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

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-900">
      <div className="mb-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-200">
          <Wallet className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">ระบบเติมเงินอัตโนมัติ</h1>
          <p className="text-zinc-500 font-medium">เลือกช่องทางการเติมเงินที่คุณสะดวกที่สุด</p>
        </div>
        <div className="bg-white border border-zinc-200 shadow-sm px-6 py-4 rounded-3xl flex items-center justify-center gap-4 mt-2">
          <div className="flex flex-col text-center">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">ยอดเงินคงเหลือของคุณ</span>
            <span className="text-4xl font-sans font-black text-zinc-900 tracking-tight">
              ฿ {userPlan?.balance ? userPlan.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Card 1: TrueMoney */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> ตรวจสอบอัตโนมัติ
            </span>
          </div>
          <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
            <img src="https://img1.pic.in.th/images/IMG_6162.png" alt="TrueMoney Wallet" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-3">ซองอั่งเปา</h2>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed px-4">
            เติมเงินผ่านคิวอาร์โค้ดหรือลิงก์ซองของขวัญ TrueMoney Wallet สะดวก รวดเร็ว
          </p>
          <button
            onClick={() => setOpenModal('truemoney')}
            className="w-full mt-auto py-4 bg-[#FF8C19] hover:bg-[#E67D16] text-white font-bold rounded-2xl transition-all shadow-md shadow-[#FF8C19]/20 flex items-center justify-center gap-2 group-hover:-translate-y-1"
          >
            เลือก <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Card 2: Bank Slip */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> ตรวจสอบอัตโนมัติ
            </span>
          </div>
          <div className="w-24 h-24 mb-6 group-hover:scale-110 transition-transform duration-300">
            <img src="https://img2.pic.in.th/IMG_6164.png" alt="Bank Transfer" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-3">สลิปโอนเงิน</h2>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed px-4">
            อัพโหลดสลิปธนาคารพร้อม QR Code เพื่อเติมเงินเข้าระบบ ใช้งานง่าย รวดเร็ว
          </p>
          <button
            onClick={() => setOpenModal('bank')}
            className="w-full mt-auto py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 group-hover:-translate-y-1"
          >
            เลือก <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openModal === 'truemoney' && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden relative shadow-2xl p-6 sm:p-8"
            >
              <button 
                onClick={() => setOpenModal(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mb-8 pt-4">
                <div className="w-24 h-24 mb-4">
                  <img src="https://img1.pic.in.th/images/IMG_6162.png" alt="TrueMoney Wallet" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">รับเงินผ่านซองของขวัญ</h3>
                <p className="text-zinc-500 font-medium text-sm mt-1">TrueMoney Wallet</p>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                  <div className="text-sm">
                    <span className="font-bold block mb-1">ไม่มีนโยบายคืนเงิน</span>
                    โปรดตรวจสอบความถูกต้องก่อนกดเติมเงิน หากทำการเติมเงินแล้ว จะไม่สามารถขอรับเงินคืนได้ในทุกกรณี
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 text-orange-800">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-orange-500" />
                  <div className="text-sm">
                    <span className="font-bold block mb-1">ค่าธรรมเนียมการเติมเงิน 2.9%</span>
                    ตัวอย่าง: เติมเงิน 100 บาท จะได้รับ 97.10 บาทเข้าสู่ระบบ
                  </div>
                </div>

                <form onSubmit={handleTruemoneyTopup} className="mt-8 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">ลิงก์ซองของขวัญ</label>
                    <input
                      type="text"
                      value={truemoneyLink}
                      onChange={(e) => setTruemoneyLink(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-orange-500/25 text-lg flex items-center justify-center gap-2"
                  >
                    เติมเงิน
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {openModal === 'bank' && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            >
              <button 
                onClick={() => setOpenModal(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 p-2 rounded-full z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center mb-8 pt-4">
                <div className="w-24 h-24 mb-4">
                  <img src="https://img2.pic.in.th/IMG_6164.png" alt="Bank Transfer" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">อัพโหลดสลิปโอนเงิน</h3>
                <p className="text-zinc-500 font-medium text-sm mt-1">Bank Transfer Slip</p>
              </div>

              <div className="space-y-6">
                {/* ข้อมูลบัญชีสีชมพู */}
                <div className="bg-pink-50 border border-pink-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
                    <p className="text-xs font-bold text-pink-500 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-pink-100">โอนเงินเข้าบัญชีนี้</p>
                    <div className="flex bg-white shadow-sm border border-zinc-100 rounded-full pr-4 p-1 gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-[#00A950] flex items-center justify-center text-white text-xs font-black">K</div>
                      <span className="font-bold text-zinc-900 text-sm">ธนาคารกสิกรไทย</span>
                    </div>
                    <p className="font-bold text-zinc-900 text-xl tracking-tight">กรวิชญ์ มาตขาว</p>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm mt-2">
                      <span className="text-2xl sm:text-3xl font-black text-pink-600 font-mono tracking-wider select-all">1963870325</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1963870325');
                          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกเลขบัญชีแล้ว', showConfirmButton: false, timer: 1500 });
                        }}
                        className="ml-2 p-2.5 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl transition-all shadow-sm border border-pink-100 active:scale-95"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* โซนอัพโหลดสลิป */}
                <label className="flex flex-col items-center justify-center w-full py-12 bg-zinc-50 hover:bg-purple-50 text-zinc-900 rounded-3xl transition-all border-2 border-dashed border-zinc-200 hover:border-purple-300 cursor-pointer group relative overflow-hidden shadow-sm">
                   <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSlipUpload} />
                   <div className="w-20 h-20 bg-white shadow-md border border-zinc-100 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 relative z-10 text-purple-600">
                     <QrCode className="w-10 h-10" />
                   </div>
                   <span className="text-xl font-black relative z-10 text-zinc-900 group-hover:text-purple-700 transition-colors">คลิกเพื่ออัพโหลดรูปสลิป</span>
                   <span className="text-sm text-zinc-500 mt-2 relative z-10 font-medium bg-white px-3 py-1 rounded-full border border-zinc-100">รองรับ PNG, JPEG (ที่มี QR Code เท่านั้น)</span>
                </label>

                {/* ขั้นตอนวิธีใช้ */}
                <div className="bg-white border text-left border-zinc-100 p-5 rounded-3xl shadow-sm">
                  <h4 className="font-black text-zinc-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> ขั้นตอนการใช้งาน</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] sm:text-sm text-zinc-600 font-medium">
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">1</div> คัดลอกเลขบัญชี</div>
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">2</div> เปิดแอปธนาคาร</div>
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">3</div> โอนเงินเข้าบัญชี</div>
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">4</div> บันทึกสลิป</div>
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">5</div> กลับมาที่หน้านี้</div>
                    <div className="flex items-start gap-2"><div className="w-5 h-5 shrink-0 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">6</div> อัพโหลดสลิป</div>
                  </div>
                </div>

                {/* หมายเหตุ */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-[13px] font-medium leading-relaxed">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                  สลิปการโอนเงินจะถูกตรวจสอบโดยอัตโนมัติ กรุณาไม่อัพโหลดสลิปซ้ำ หรือสลิปที่ไม่มี QR Code เพื่อป้องกันการถูกแบน
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


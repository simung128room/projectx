import React, { useState } from 'react';
import { Gift, ArrowRight, Landmark, AlertTriangle, Copy, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { UserPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface WalletViewProps {
  userPlan: UserPlan | null;
  setUserPlan: React.Dispatch<React.SetStateAction<UserPlan | null>>;
  onTopupSuccess?: (entry: any) => void;
  userId?: string | null;
}

type TopupView = 'main' | 'truemoney' | 'bank';

export const WalletView: React.FC<WalletViewProps> = ({ userPlan, setUserPlan, onTopupSuccess, userId }) => {
  const [activeView, setActiveView] = useState<TopupView>('main');
  const [truemoneyLink, setTruemoneyLink] = useState('');

  const handleTruemoneyTopup = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedLink = truemoneyLink.trim();
    let voucherCode = '';
    
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

    setActiveView('main');
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
        uid: userId
      });

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
          const topup = response.data.topup;
          const historyEntry = {
            id: topup ? topup.id : Math.random().toString(36).substr(2, 9),
            username: topup?.userId || userPlan?.username || 'Unknown',
            type: 'topup',
            method: 'ซองของขวัญ (Gift Link)',
            amount: topup ? topup.amount : amount,
            status: 'success',
            date: topup ? topup.date : new Date().toISOString(),
            billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
            money: topup ? topup.amount : amount,
            title: topup ? topup.title : 'เติมเงินสำเร็จ',
            image: topup ? topup.image : 'https://img1.pic.in.th/images/IMG_6162.png'
          };
          if (onTopupSuccess) onTopupSuccess(historyEntry);
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

    setActiveView('main');
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
        const response = await axios.post('/api/topup/slip', { imageBase64, uid: userId });
        
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
            const topup = response.data.topup;
            const historyEntry = {
              id: topup ? topup.id : Math.random().toString(36).substr(2, 9),
              type: 'topup',
              method: 'สแกนสลิป (SlipOK)',
              amount: topup ? topup.amount : amount,
              username: topup?.userId || userPlan?.username || 'Unknown',
              status: 'success',
              date: topup ? topup.date : new Date().toISOString(),
              billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
              money: topup ? topup.amount : amount,
              title: topup ? topup.title : 'เติมเงินสำเร็จ',
              image: topup ? topup.image : 'https://img2.pic.in.th/IMG_6166.png'
            };
            if (onTopupSuccess) onTopupSuccess(historyEntry);
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
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans text-white min-h-screen">
        {activeView === 'main' && (
        <>
          <div className="mb-10 flex flex-col items-start gap-4">
            <div>
              <h1 className="text-3xl font-black mb-2 tracking-tight">ช่องทางการชำระเงิน</h1>
              <p className="text-muted-foreground font-medium text-left">เลือกช่องทางการเติมเงินที่คุณสะดวกที่สุด</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: TrueMoney */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
              className="bg-card border border-border border-2 p-6 sm:p-8 flex flex-col items-center text-center transition-all group relative overflow-hidden cursor-pointer brut-card"
              onClick={() => setActiveView('truemoney')}
            >
              <div className="w-24 h-24 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">TrueMoney Wallet (อังเปา)</h2>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed px-4">
                เติมเงินผ่านคิวอาร์โค้ดหรือลิงก์ซองของขวัญ TrueMoney Wallet สะดวก รวดเร็ว ไม่มีค่าธรรมเนียม
              </p>
            </motion.div>

            {/* Card 2: Bank Slip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
              className="bg-card border border-border border-2 p-6 sm:p-8 flex flex-col items-center text-center transition-all group relative overflow-hidden cursor-pointer brut-card"
              onClick={() => setActiveView('bank')}
            >
              <div className="w-24 h-24 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6164.png" alt="Bank Transfer" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">ธนาคาร เช็คสลิป</h2>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed px-4">
                อัพโหลดสลิปธนาคารกสิกรไทย เพื่อเติมเงินเข้าระบบอัตโนมัติ ไม่มีค่าธรรมเนียม
              </p>
            </motion.div>
          </div>
        </>
      )}

      {activeView === 'truemoney' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl mx-auto bg-card overflow-hidden border border-border border-2 p-6 sm:p-8 brut-card"
        >
          <button 
            onClick={() => setActiveView('main')}
            className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-bold text-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-32 mb-4">
              <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border border-2 p-4 flex items-center gap-3 text-muted-foreground brut-card">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold">ไม่มีค่าธรรมเนียม / ระบบอัตโนมัติ</span>
            </div>

            <div className="bg-card border border-border border-2 p-4 px-5 text-center brut-card">
              <p className="text-xs text-muted-foreground font-bold leading-relaxed">โปรดตรวจสอบลิงก์ให้ถูกต้องก่อนกดยันยืน (ไม่คืนเงินทุกกรณี)</p>
            </div>

            <form onSubmit={handleTruemoneyTopup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">ลิงค์อังเปา / Share link</label>
                <input
                  type="text"
                  value={truemoneyLink}
                  onChange={(e) => setTruemoneyLink(e.target.value)}
                  placeholder="กรอกลิงค์"
                  className="w-full bg-card border-2 border-border p-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#2563EB] focus:bg-[#0B0D0F] transition-all font-sans font-bold brut-card"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground hover:bg-[#2563EB] text-white font-black transition-all"
              >
                เติมเงิน
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {activeView === 'bank' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl mx-auto bg-card overflow-hidden border border-border border-2 p-6 sm:p-8 brut-card"
        >
          <button 
            onClick={() => setActiveView('main')}
            className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
          </button>
          


          <div className="space-y-6">
            <div className="bg-card border-2 border-border p-6 text-center space-y-4 brut-card">
                <div className="flex bg-primary text-primary-foreground text-white px-6 py-2 gap-3 items-center w-fit mx-auto">
                  <span className="font-black text-sm tracking-wide">ธนาคารกสิกรไทย</span>
                </div>
                
                <div className="pt-2">
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1.5">Account Number</p>
                   <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl font-black text-white font-mono tracking-tighter select-all">1963870325</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1963870325');
                          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกเลขบัญชีแล้ว', showConfirmButton: false, timer: 1500 });
                        }}
                        className="p-3 bg-primary text-primary-foreground text-white hover:bg-[#2563EB] transition-all active:scale-95"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                <div className="pt-5 border-t border-border border-2 flex flex-col items-center">
                   <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Account Name</p>
                   <p className="text-2xl font-black text-white">กรวิชญ์</p>
                </div>
            </div>

            <div className="bg-card border border-border border-2 p-4 text-center brut-card">
                <p className="text-xs text-muted-foreground font-bold leading-relaxed">ใช้แอปธนาคารโอนเงินเข้าบัญชีด้านบน แล้วแนบสลิปเพื่อตรวจสอบ</p>
            </div>

            <div className="pt-4 flex flex-col items-center w-full">
              <label className="flex flex-col items-center justify-center w-full py-10 bg-card hover:bg-[#121212] transition-all border-2 border-dashed border-border hover:border-[#3B82F6] cursor-pointer group active:scale-[0.98] relative z-10 brut-card">
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSlipUpload} />
                  <div className="w-28 h-28 mb-4 group-hover:scale-110 transition-transform">
                     <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6164.png" alt="KBank" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                     <span className="text-lg font-black text-white block leading-none">อัปโหลดรูปสลิปได้ที่นี่</span>
                     <span className="text-sm text-muted-foreground font-bold mt-2 block">รองรับ PNG, JPEG</span>
                  </div>
              </label>
            </div>

            <div className="bg-primary text-primary-foreground border-2 border-border p-5 flex gap-4 items-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-wide leading-tight">สลิปต้องมี QR Code เท่านั้น</p>
                  <p className="text-[11px] text-[#2563EB]/80 font-bold mt-1 leading-relaxed">ระบบไม่รองรับ Wallet หรือสลิปที่ไม่มี QR Code ทุกกรณี หากโอนผิดไม่คืนเงิน</p>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2.5 opacity-40">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">No Topup Fees / ไม่มีค่าธรรมเนียม</span>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </AnimatedScroll>
  );
};


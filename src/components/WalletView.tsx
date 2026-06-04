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
              <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">ช่องทางการชำระเงิน</h1>
              <p className="text-white/40 font-medium text-left">เลือกช่องทางการเติมเงินที่คุณสะดวกที่สุดเพื่อทำรายการ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: TrueMoney */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -5, borderColor: 'rgba(34,197,94,0.3)' }}
              className="bg-[#0c0c0c]/85 border border-white/[0.08] p-8 md:p-10 rounded-3xl flex flex-col items-center text-center transition-all group relative overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-green-500/[0.03]"
              onClick={() => setActiveView('truemoney')}
            >
              <div className="w-24 h-24 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">TrueMoney Wallet (อั่งเปา)</h2>
              <p className="text-white/50 text-sm mb-3 leading-relaxed px-4 font-medium">
                เติมเงินผ่านคิวอาร์โค้ดหรือลิงก์ซองของขวัญ TrueMoney Wallet สะดวก รวดเร็ว ตรวจสอบของรางวัลอัตโนมัติ
              </p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-neon-green font-mono font-bold uppercase tracking-wider group-hover:bg-neon-green/10 group-hover:border-neon-green/30 transition-all">
                GIFT LINK TOPUP
              </div>
            </motion.div>

            {/* Card 2: Bank Slip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -5, borderColor: 'rgba(34,197,94,0.3)' }}
              className="bg-[#0c0c0c]/85 border border-white/[0.08] p-8 md:p-10 rounded-3xl flex flex-col items-center text-center transition-all group relative overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-green-500/[0.03]"
              onClick={() => setActiveView('bank')}
            >
              <div className="w-24 h-24 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6164.png" alt="Bank Transfer" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">ธนาคาร เช็คสลิป</h2>
              <p className="text-white/50 text-sm mb-3 leading-relaxed px-4 font-medium">
                โอนเงินเข้าบัญชีธนาคารกสิกรไทย แล้วอัปโหลดรูปภาพสลิป มีระบบสแกนตรวจสอบอัจฉริยะ ตลอด 24 ชม.
              </p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-neon-green font-mono font-bold uppercase tracking-wider group-hover:bg-neon-green/10 group-hover:border-neon-green/30 transition-all">
                BANK SLIP SCANNER
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeView === 'truemoney' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl mx-auto bg-[#0a0a0a]/90 backdrop-blur border border-white/[0.08] p-6 sm:p-10 rounded-3xl shadow-2xl relative"
        >
          <button 
            onClick={() => setActiveView('main')}
            className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-neon-green" /> ย้อนกลับ
          </button>
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-32 h-32 mb-4">
              <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-black text-white">เติมเงินผ่านซองของขวัญ</h2>
            <p className="text-white/40 text-xs mt-1.5 font-medium">นำลิงก์ซองของขวัญจากแอปทรูมันนี่วอลเล็ทมาเติมเข้าสู่แอปพลิเคชัน</p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111] border border-white/[0.06] p-4 rounded-2xl flex items-center gap-3 text-white/70">
              <ShieldCheck className="w-5 h-5 text-neon-green shrink-0" />
              <span className="text-xs sm:text-sm font-bold tracking-wider">ระบบตรวจสอบและเติมเงินอัตโนมัติ รวดเร็ว 100%</span>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl text-center">
              <p className="text-xs text-rose-450 font-bold leading-relaxed">โปรดตรวจสอบลิงก์ให้ถูกต้องและพิมพ์ให้ตรงกับความเป็นจริงก่อนกดตกลง</p>
            </div>

            <form onSubmit={handleTruemoneyTopup} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2.5 ml-1">ลิงค์อั่งเปาทรูมันนี่ / Truemoney Gift Link</label>
                <input
                  type="text"
                  value={truemoneyLink}
                  onChange={(e) => setTruemoneyLink(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 focus:bg-[#0c0c0c] transition-all font-sans font-bold"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-neon-green hover:bg-neon-green/90 text-black font-black tracking-widest uppercase transition-all duration-200 shadow-lg shadow-neon-green/10 hover:shadow-neon-green/20 cursor-pointer active:scale-[0.98]"
              >
                ยืนยันการเติมเงิน
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {activeView === 'bank' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl mx-auto bg-[#0a0a0a]/90 backdrop-blur border border-white/[0.08] p-6 sm:p-10 rounded-3xl shadow-2xl relative"
        >
          <button 
            onClick={() => setActiveView('main')}
            className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-neon-green" /> ย้อนกลับ
          </button>
          
          <div className="space-y-6">
            <div className="bg-white/[0.01] border border-white/[0.06] p-6 rounded-3xl text-center space-y-4">
                <div className="flex bg-[#008000]/10 border border-[#008000]/30 text-[#00A82D] px-6 py-2.5 gap-2.5 items-center w-fit mx-auto rounded-full font-bold text-xs select-none">
                  <Landmark className="w-4 h-4" />
                  <span>ธนาคารกสิกรไทย (K-BANK)</span>
                </div>
                
                <div className="pt-2">
                   <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1.5">Account Number / เลขบัญชี</p>
                   <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest select-all">196-3-87032-5</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('1963870325');
                          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'คัดลอกเลขบัญชีแล้ว', showConfirmButton: false, timer: 1500 });
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[#00A82D] hover:text-white transition-all active:scale-95 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                   </div>
                </div>

                <div className="pt-5 border-t border-white/[0.05] flex flex-col items-center">
                   <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">Account Name / ชื่อบัญชี</p>
                   <p className="text-xl sm:text-2xl font-black text-white">นาย กรวิชญ์</p>
                </div>
            </div>

            {/* Sandbox Informative UI */}
            <div className="bg-neon-green/[0.03] border border-neon-green/15 p-4 rounded-2xl text-center select-none shadow-inner shadow-black/40">
                <p className="text-xs text-neon-green/90 font-black tracking-wide leading-relaxed mb-1 flex items-center justify-center gap-1.5 uppercase">
                  <span>★ ACTIVED SANDBOX TESTING MODE ★</span>
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed font-semibold">
                  ระบบจำลองสลิปทำงานอยู่ ท่านสามารถบันทึกรูป QR Code ด้านบน หรืออัปโหลดสิ่งใดๆ ลงช่องแนบสลิปด้านล่าง ระบบจะอนุมัติทดสอบวงเงินเครดิตให้โดยอัตโนมัติทันที ฿150 - ฿1,500 บาท โดยไม่ต้องโอนจริง!
                </p>
            </div>

            <div className="bg-[#0d0d0d]/80 border border-white/[0.06] p-4 rounded-2xl text-center">
                <p className="text-xs text-white/50 font-medium leading-relaxed">ใช้แอปพลิเคชันธนาคารสแกนและทำการโอนเงิน จากนั้นนำภาพสลิปที่สำเร็จแล้วอัปโหลดลงช่องด้านล่าง</p>
            </div>

            <div className="pt-2 flex flex-col items-center w-full">
              <label className="flex flex-col items-center justify-center w-full py-10 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] transition-all border-2 border-dashed border-white/[0.08] hover:border-neon-green/30 cursor-pointer group active:scale-[0.99] relative z-10 shadow-lg">
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleSlipUpload} />
                  <div className="w-24 h-24 mb-4 group-hover:scale-105 transition-transform">
                     <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6164.png" alt="KBank" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center px-4">
                     <span className="text-lg font-black text-white block leading-none">อัปโหลดสลิปธนาคารของท่าน</span>
                     <span className="text-xs text-white/30 font-bold mt-2.5 block">คลิก หรือลากไฟล์ภาพสลิปมาวางที่นี่ (รองรับ PNG, JPEG)</span>
                  </div>
              </label>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl flex gap-4 items-start select-none">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-450 uppercase tracking-wide leading-tight">เงื่อนไขและข้อควรระวังสำคัญ</p>
                  <p className="text-[11px] text-white/40 font-medium mt-1 leading-relaxed">
                    สลิปต้องมี QR Code ที่ชัดเจนและสามารถสแกนได้ ไม่รองรับ Wallet ยี่ห้ออื่นหรือสลิปของธนาคารที่ไม่ใช่ไทย กรุณาตรวจสอบให้ครบถ้วนก่อนส่งเข้าระบบ
                  </p>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 select-none opacity-40">
              <ShieldCheck className="w-4 h-4 text-neon-green" />
              <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em]">No Deposit Fees • Realtime Automatic Slip Scanning System</span>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </AnimatedScroll>
  );
};


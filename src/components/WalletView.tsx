import React, { useState, useRef } from 'react';
import { 
  Gift, 
  ArrowRight, 
  Landmark, 
  AlertTriangle, 
  Copy, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft,
  Wallet,
  QrCode,
  Coins,
  UploadCloud,
  ChevronRight,
  Info,
  ExternalLink,
  BookOpen,
  FileText,
  User,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';
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
  siteSettings?: any;
}

type TopupView = 'main' | 'truemoney' | 'bank';

export const WalletView: React.FC<WalletViewProps> = ({ userPlan, setUserPlan, onTopupSuccess, userId, siteSettings }) => {
  const [activeView, setActiveView] = useState<TopupView>('main');
  const [truemoneyLink, setTruemoneyLink] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bankName = siteSettings?.bank_name || 'ธนาคารกสิกรไทย';
  const bankAccountNumber = siteSettings?.bank_account_number || '196-3-87032-5';
  const bankAccountHolder = siteSettings?.bank_account_holder || 'นาย กรวิชญ์';
  const bankQrImage = siteSettings?.bank_qr_image || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin)}`;

  const handleCopyAccount = () => {
    setIsCopying(true);
    const digitsOnly = bankAccountNumber.replace(/[-\s]/g, '');
    navigator.clipboard.writeText(digitsOnly);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกเลขที่บัญชีแล้ว!',
      showConfirmButton: false,
      timer: 1500,
      background: '#09090b',
      color: '#fff'
    });

    setTimeout(() => {
      setIsCopying(false);
    }, 2000);
  };

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
        text: 'รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง กรุณาตรวจสอบรหัสซองอั่งเปาของคุณอีกครั้ง',
        icon: 'error',
        background: '#070709',
        color: '#fff',
        confirmButtonColor: '#ff6600'
      });
      return;
    }

    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังเสร็จสิ้นการตรวจสอบ',
      text: 'ระบบความปลอดภัยกำลังเชื่อมต่อและดึงข้อมูลลิงก์ซองอั่งเปา...',
      icon: 'info',
      background: '#070709',
      color: '#fff',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
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
          title: 'เติมเงินสำเร็จ!',
          text: `คุณได้รับเครดิตจำนวน ฿${amount.toLocaleString()} เติมเข้ากระเป๋าเงินของคุณเรียบร้อยแล้ว`,
          icon: 'success',
          background: '#070709',
          color: '#fff',
          confirmButtonColor: '#10b981'
        });
        setTruemoneyLink('');
        setActiveView('main');
      } else {
        Swal.fire({
          title: 'ตรวจสอบล้มเหลว',
          text: response.data.error || 'ซองอั่งเปาหมดอายุ ถูกใช้ไปแล้ว หรือไม่ถูกต้อง',
          icon: 'error',
          background: '#070709',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการตรวจสอบ',
        text: err.response?.data?.error || err.message || 'การเชื่อมต่อระบบขัดข้อง กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        background: '#070709',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const processSlipFile = async (file: File) => {
    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังสแกนสลิปธนาคาร',
      text: 'ระบบสแกน SlipOK อัจฉริยะกำลังวิเคราะห์ QR Code และทำรายการตรวจสอบยอดโอน...',
      icon: 'info',
      background: '#070709',
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
            title: 'เติมเงินสำเร็จแล้ว!',
            text: `ตรวจสอบสลิปสำเร็จ! ได้รับเครดิตเรียบร้อย ฿${amount.toLocaleString()} บาท`,
            icon: 'success',
            background: '#070709',
            color: '#fff',
            confirmButtonColor: '#10b981'
          });
          setActiveView('main');
        } else {
          Swal.fire({
            title: 'สแกนสลิปไม่สำเร็จ',
            text: response.data.error || 'ข้อมูลสลิปนี้ไม่ถูกต้อง หรือเคยมีการเคลมเครดิตไปก่อนหน้านี้สำเร็จแล้ว',
            icon: 'error',
            background: '#070709',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'สแกนสลิปขัดข้อง',
          text: err.response?.data?.error || err.message || 'เครือข่ายขัดข้อง กรุณาลองส่งใหม่อีกซักครู่',
          icon: 'error',
          background: '#070709',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setIsVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSlipFile(file);
    }
    e.target.value = ''; // Reset
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      processSlipFile(file);
    } else if (file) {
      Swal.fire({
        title: 'เฉพาะไฟล์รูปภาพหลักเท่านั้น',
        text: 'กรุณาอัปโหลดสลิปธนาคารในรูปแบบไฟล์ PNG หรือ JPEG เท่านั้น',
        icon: 'warning',
        background: '#070709',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 font-sans text-white min-h-screen">
        
        {/* Sleek Progress Header */}
        <div className="mb-8 p-6 bg-zinc-950/40 border border-white/[0.05] rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Wallet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black font-mono tracking-widest text-zinc-500 uppercase">CURRENT ACCOUNT BALANCE</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  ฿{(userPlan?.balance || 0).toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400 font-mono">บาท (THB)</span>
              </div>
            </div>
          </div>

          {/* Interactive Steps Visual Indicator */}
          <div className="flex items-center justify-start md:justify-center gap-2 select-none overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center gap-2 font-semibold">
              <div className={`w-6 h-6 text-[10px] rounded-full border flex items-center justify-center font-bold font-mono ${
                activeView === 'main' 
                  ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                  : 'bg-zinc-900 border-zinc-700 text-emerald-400'
              }`}>
                {activeView !== 'main' ? <CheckCircle className="w-3.5 h-3.5" /> : '1'}
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-bold whitespace-nowrap ${activeView === 'main' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                1. เลือกช่องทาง
              </span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-800 shrink-0" />

            <div className="flex items-center gap-2 font-semibold">
              <div className={`w-6 h-6 text-[10px] rounded-full border flex items-center justify-center font-bold font-mono ${
                activeView !== 'main' && !isVerifying
                  ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}>
                {isVerifying ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : '2'}
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-bold whitespace-nowrap ${activeView !== 'main' && !isVerifying ? 'text-emerald-400' : 'text-zinc-500'}`}>
                2. ดำเนินการชำระเงิน
              </span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-zinc-800 shrink-0" />

            <div className="flex items-center gap-2 font-semibold">
              <div className={`w-6 h-6 text-[10px] rounded-full border-2 flex items-center justify-center font-bold font-mono ${
                isVerifying 
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-700'
              }`}>
                {isVerifying ? '...' : '3'}
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-bold whitespace-nowrap ${isVerifying ? 'text-amber-400' : 'text-zinc-600'}`}>
                3. ดึงยอดเรียลไทม์
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div className="text-center max-w-xl mx-auto mb-10 select-none">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black tracking-widest rounded-full uppercase">
                  ระบบเติมเงินอัตโนมัติ
                </span>
                <h1 className="text-3xl md:text-4xl font-black mt-3 leading-tight tracking-tight">
                  ช่องทางการชำระเงิน
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm mt-2.5 max-w-md mx-auto leading-relaxed">
                  เลือกช่องทางการชำระเงินที่สะดวกสบายเพื่อเติมเครดิตเข้าสู่บัญชีของคุณทันที
                </p>
              </div>

              {/* Cards layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                
                {/* Method 1: TrueMoney Wallet */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.012 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => setActiveView('truemoney')}
                  className="bg-zinc-950/50 hover:bg-[#09090b]/90 border border-white/[0.06] hover:border-[#ff6600]/30 p-8 rounded-[2rem] flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-xl hover:shadow-[0_20px_45px_rgba(255,102,0,0.06)]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6600]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#ff6600]/10 transition-colors" />
                  
                  {/* Top Header Badge */}
                  <div className="self-end px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/15 text-[9px] font-mono font-black rounded-lg tracking-widest uppercase">
                    AUTO 100%
                  </div>

                  <div className="my-6">
                    <div className="w-24 h-24 mx-auto mb-5 translate-y-2 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(255,102,0,0.2)]" />
                    </div>
                    <h3 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
                       TrueMoney Gift Link
                    </h3>
                    <p className="text-zinc-400 text-xs mt-3 leading-relaxed px-2 font-medium max-w-sm">
                      เติมเครดิตผ่านซองของขวัญทรูมันนี่ สะดวก ประมวลผลรวดเร็วแบบเรซซิ่ง รับผลตอบรางวัลสมบูรณ์จาก API
                    </p>
                  </div>

                  {/* Bullet features */}
                  <div className="w-full bg-zinc-950/60 border border-white/[0.03] p-4 rounded-2xl flex flex-col gap-2 items-start text-xs font-semibold text-zinc-400 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ประมวลผลดึงเครดิตใน 3 วินาที</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ไม่มีการหักค่าบริการธรรมเนียมใดๆ</span>
                    </div>
                  </div>

                  {/* Button call out */}
                  <div className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff6600]/20 to-[#ff6600]/5 hover:from-[#ff6600] hover:to-[#ff8c40] text-[#ff6600] group-hover:text-black border border-[#ff6600]/25 group-hover:border-transparent font-black tracking-widest text-xs uppercase transition-all duration-300 shadow-md">
                    ใช้ช่องทางอั่งเปา (REDEEM LINK)
                  </div>
                </motion.div>

                {/* Method 2: Bank Slip Scanner */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.012 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  onClick={() => setActiveView('bank')}
                  className="bg-zinc-950/50 hover:bg-[#09090b]/90 border border-white/[0.06] hover:border-emerald-500/30 p-8 rounded-[2rem] flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-xl hover:shadow-[0_20px_45px_rgba(16,185,129,0.06)]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                  {/* Top Header Badge */}
                  <div className="self-end px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[9px] font-mono font-black rounded-lg tracking-widest uppercase">
                    SLIP SCAN
                  </div>

                  <div className="my-6">
                    <div className="w-24 h-24 mx-auto mb-5 translate-y-2 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6164.png" alt="Bank Transfer" className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.2)]" />
                    </div>
                    <h3 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
                      ธนาคาร เช็คสลิปคิวอาร์
                    </h3>
                    <p className="text-zinc-400 text-xs mt-3 leading-relaxed px-2 font-medium max-w-sm">
                      โอนเงินผ่านพอร์ทัลบัญชีธนาคารและทำการสแกนรูปสลิป มีระบบตรวจสอบอัจฉริยะลึกถึงฐานข้อมูล 24 ชม.
                    </p>
                  </div>

                  {/* Bullet features */}
                  <div className="w-full bg-zinc-950/60 border border-white/[0.03] p-4 rounded-2xl flex flex-col gap-2 items-start text-xs font-semibold text-zinc-400 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ตรวจสอบยอดเงินโอนเข้าบัญชีโดยอัตโนมัติ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>อนุมัติเครดิตทันที ไม่ต้องรอดึงแอดมิน</span>
                    </div>
                  </div>

                  {/* Button call out */}
                  <div className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 group-hover:text-black border border-emerald-500/25 group-hover:border-transparent font-black tracking-widest text-xs uppercase transition-all duration-300 shadow-md">
                    โอนผ่านธนาคาร (BANK SLIP SCAN)
                  </div>
                </motion.div>

              </div>

              {/* Security Shield Note */}
              <div className="max-w-xl mx-auto bg-zinc-950/20 border border-white/[0.03] p-4 rounded-xl flex gap-3 items-center select-none">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs text-white/95 font-extrabold uppercase tracking-wide">ระบบเติมเงินอัตโนมัติปลอดภัย 100%</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                    ทำธุรกรรมได้อย่างรวดเร็วและปลอดภัย บันทึกประวัติแม่นยำด้วยระบบอัตโนมัติ
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'truemoney' && (
            <motion.div
              key="truemoney"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto bg-[#070709]/95 backdrop-blur-2xl border border-white/[0.07] p-6 sm:p-10 rounded-[2.5rem] shadow-3xl relative overflow-hidden"
            >
              {/* Subtle visual glow */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#ff6600]/5 rounded-full blur-[60px] pointer-events-none" />

              <button 
                onClick={() => setActiveView('main')}
                className="mb-6 flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors font-black text-xs uppercase tracking-wider bg-zinc-900/40 hover:bg-zinc-900 border border-white/[0.03] px-3.5 py-2 rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#ff6600]" /> กลับหน้าช่องทางหลัก
              </button>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 mb-3 filter drop-shadow-[0_8px_16px_rgba(255,102,0,0.15)] select-none">
                  <img loading="lazy" src="https://img1.pic.in.th/images/IMG_6172.png" alt="TrueMoney Wallet" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-2xl font-black text-white">ซองของขวัญ TrueMoney Wallet</h2>
                <p className="text-zinc-500 text-xs mt-1.5 max-w-sm leading-relaxed">
                  นำลิงก์เคลมซองอั่งเปา (e-Gift Link) ความปลอดภัยสูงจาก TrueMoney มาตรวจสอบและรับเงินเป็นเครดิตในเสี้ยววินาที
                </p>
              </div>

              {/* Accordion Tutorial Box */}
              <div className="border border-white/[0.05] rounded-2.5xl overflow-hidden bg-black/20 mb-6">
                <button
                  type="button"
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="w-full py-4 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#ff6600]" />
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-300">วิธีสร้างและหาลิงก์ซองของขวัญ</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isGuideOpen ? 'rotate-90 text-white' : ''}`} />
                </button>

                {isGuideOpen && (
                  <div className="p-5 border-t border-white/[0.04] bg-zinc-950/40 text-xs text-zinc-400 space-y-3.5 select-none animate-in fade-in duration-300">
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded bg-[#ff6600]/10 border border-[#ff6600]/25 text-[#ff6600] flex items-center justify-center font-black shrink-0">1</span>
                      <p className="leading-relaxed">เข้าสู่แอปพลิเคชัน <b>TrueMoney Wallet</b> และจิ้มตัวเลือก <b>"ส่งซองของขวัญ"</b></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded bg-[#ff6600]/10 border border-[#ff6600]/25 text-[#ff6600] flex items-center justify-center font-black shrink-0">2</span>
                      <p className="leading-relaxed">ป้อนจำนวนของเงินที่อยากสุ่ม/เติม และเปลี่ยนโหมดกรอกผู้รับซองเป็น <b>"เก็บรอบเดียว/รับร่วมกัน"</b></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded bg-[#ff6600]/10 border border-[#ff6600]/25 text-[#ff6600] flex items-center justify-center font-black shrink-0">3</span>
                      <p className="leading-relaxed">กำหนดจำกัดจำนวนผู้เข้าเติมซองสูงสุด <b>"1 คน"</b></p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded bg-[#ff6600]/10 border border-[#ff6600]/25 text-[#ff6600] flex items-center justify-center font-black shrink-0">4</span>
                      <p className="leading-relaxed">คัดลอกลิงก์ซองของขวัญ (https://gift.truemoney.com/...) นำมากรอกเคลมด้านล่างได้ทันที</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Input */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5 ml-1 select-none">
                    TRUEMONEY GIFT LINK / ลิงก์อั่งเปา
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={truemoneyLink}
                      onChange={(e) => setTruemoneyLink(e.target.value)}
                      placeholder="https://gift.truemoney.com/campaign/?v=..."
                      className="w-full bg-zinc-950/60 border border-white/[0.07] focus:border-[#ff6600]/50 rounded-2xl p-4 pr-12 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-all font-sans font-bold"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Gift className="w-4 h-4 text-[#ff6600]" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 rounded-2xl bg-[#ff6600] hover:bg-[#ff8025] disabled:translate-y-0 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black tracking-widest uppercase transition-all duration-300 shadow-xl shadow-[#ff6600]/15 hover:shadow-[#ff6600]/25 cursor-pointer active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>กำลังส่งตรวจสอบคอยสักครู่...</span>
                    </span>
                  ) : 'ตรวจสอบและเติมเคดิต'}
                </button>
              </form>

              {/* Quick warning banner */}
              <div className="mt-6 flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl select-none">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-bold">
                  โปรดจำไว้ว่าระบบรองรับเฉพาะลิงก์ซองของขวัญทรูมันนี่จริงเท่านั้น ลิงก์ปลอมหรือลิ้งค์สแกนขัดข้อง อาจถูกบันทึกระบบรักษาความปลอดภัย IP ล็อคเพื่อความปลอดภัย
                </p>
              </div>
            </motion.div>
          )}

          {activeView === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto bg-[#070709]/95 backdrop-blur-2xl border border-white/[0.07] p-6 sm:p-10 rounded-[2.5rem] shadow-3xl relative overflow-hidden"
            >
              {/* Subtle visual glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

              <button 
                onClick={() => setActiveView('main')}
                className="mb-8 flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors font-black text-xs uppercase tracking-wider bg-zinc-900/40 hover:bg-zinc-900 border border-white/[0.03] px-3.5 py-2 rounded-xl"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" /> กลับหน้าช่องทางหลัก
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left bank details column (7 columns) */}
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Premium Bank Card Mockup */}
                  <div className="relative w-full aspect-[1.58/1] rounded-[2rem] bg-gradient-to-br from-zinc-900 via-zinc-950 to-neutral-900 p-6 flex flex-col justify-between border border-white/[0.05] shadow-2xl overflow-hidden group select-none select-all-active">
                    {/* Glowing effect inside card */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#10b981]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    
                    {/* Card Brand Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-md">
                          <Landmark className="w-5.25 h-5.25 text-[#10b981]" />
                        </div>
                        <div>
                          <span className="text-white text-[10px] font-black tracking-widest block uppercase font-mono">{bankName}</span>
                          <span className="text-zinc-400 text-[8px] font-mono leading-none">ช่องทางชำระเงินธนาคาร</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 select-none">
                        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                        <span className="text-[8px] tracking-widest font-black text-emerald-200">ACTIVE PORTAL</span>
                      </div>
                    </div>

                    {/* Chip illustration */}
                    <div className="w-10 h-7 bg-gradient-to-br from-[#e0a96d] to-[#b37d4e] rounded-md border border-white/10 shadow-inner translate-y-1" />

                    {/* Account number block */}
                    <div className="my-2 relative group-item">
                      <p className="text-[8px] text-zinc-500 font-black tracking-widest uppercase mb-1">ACCOUNT NUMBER / เลขบัญชี</p>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xl sm:text-2xl font-mono font-black text-white tracking-widest select-all">
                          {bankAccountNumber}
                        </span>
                        
                        <button 
                          onClick={handleCopyAccount}
                          className={`p-2.5 rounded-xl transition-all border shrink-0 ${
                            isCopying 
                              ? 'bg-emerald-400 text-black border-transparent' 
                              : 'bg-white/5 text-emerald-300 hover:bg-white/15 border-white/5 active:scale-90 cursor-pointer'
                          }`}
                          title="คัดลอกเลขบัญชี"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Footer: Holder name */}
                    <div className="flex items-end justify-between border-t border-white/5 pt-3">
                      <div>
                        <p className="text-[7px] text-zinc-500 font-black tracking-widest uppercase">ACCOUNT HOLDER / ชื่อบัญชี</p>
                        <p className="text-sm font-extrabold text-white tracking-wide mt-0.5 select-all">{bankAccountHolder}</p>
                      </div>
                      
                      <div className="text-[10px] font-black text-white/55 font-mono tracking-widest select-none">
                        PREMIUM
                      </div>
                    </div>
                  </div>

                  {/* Detailed cautions warnings */}
                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex gap-3.5 items-start select-none">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-rose-400 uppercase tracking-widest">เงื่อนไขการตรวจสอบสลิป</p>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                        รูปภาพสลิปจริงต้องมีตราสัญลักษณ์ QR Code มีรายละเอียดธุรกรรมชัดเจนที่สามารถแสกนตรวจสอบย้อนหลัง หากพยายามแฮคระบบบ่อยครั้งอาจถูกแบนคีย์ทันที
                      </p>
                    </div>
                  </div>

                </div>

                {/* Right Bank upload column (5 columns) */}
                <div className="md:col-span-5 space-y-6">
                  
                  {/* Drag & Drop slip box */}
                  <div className="relative">
                    <input 
                      type="file" 
                      id="slip-upload-file"
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/png, image/jpeg, image/jpg" 
                      onChange={handleSlipUpload}
                      disabled={isVerifying}
                    />
                    
                    <label 
                      htmlFor="slip-upload-file"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center w-full py-14 rounded-[2.25rem] transition-all duration-300 border-2 border-dashed relative shadow-xl ${
                        isDragActive 
                          ? 'bg-emerald-500/10 border-emerald-400 scale-[0.99] shadow-emerald-500/5' 
                          : 'bg-zinc-950 hover:bg-zinc-950/80 border-white/[0.08] hover:border-emerald-500/30 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      <div className="w-16 h-16 mb-4 rounded-2xl bg-zinc-900 border border-white/[0.04] flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
                        <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-emerald-400 animate-bounce' : 'text-zinc-500'}`} />
                      </div>
                      
                      <div className="text-center px-4">
                        <span className="text-sm font-black text-white block leading-none">
                          {isVerifying ? 'กำลังสแกนสลิป...' : 'ส่งตรวจสลิปโอนเงิน'}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold mt-2.5 block leading-relaxed max-w-[200px] mx-auto">
                          คลิกที่นี่ หรือดากรูปภาพมาวาง (PNG, JPEG, JPG)
                        </span>
                      </div>
                    </label>
                  </div>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

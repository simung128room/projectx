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
  Clock,
  X,
  Camera,
  Lightbulb,
  Mail,
  Check,
  Percent
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
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Take values from site settings or default to user's realistic values
  const bankName = siteSettings?.bank_name || 'ธนาคารของคุณ';
  const bankAccountNumber = siteSettings?.bank_account_number || '000-0-00000-0';
  const bankAccountHolder = siteSettings?.bank_account_holder || 'ชื่อบัญชีร้านค้า';

  const handleCopyAccount = () => {
    setIsCopying(true);
    const digitsOnly = bankAccountNumber.replace(/[-\s]/g, '');
    navigator.clipboard.writeText(digitsOnly);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกเลขบัญชีสำเร็จ!',
      showConfirmButton: false,
      timer: 1500,
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
      }
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
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
      return;
    }

    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังตรวจสอบซองอั่งเปา',
      text: 'ระบบกำลังดึงยอดเงินและตรวจสอบความถูกต้องแบบอัตโนมัติ...',
      icon: 'info',
      background: '#ffffff',
      color: '#1f2937',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
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
            method: 'ซองอั่งเปา (Angpao Link)',
            amount: topup ? topup.amount : amount,
            status: 'success',
            date: topup ? topup.date : new Date().toISOString(),
            billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
            money: topup ? topup.amount : amount,
            title: topup ? topup.title : 'เติมเงินผ่านซองอังเปาสำเร็จ',
            image: 'https://img1.pic.in.th/images/IMG_6172.png'
          };
          if (onTopupSuccess) onTopupSuccess(historyEntry);
        } catch(e: any) {
    console.error("Caught error:", e);
    const msg = e?.response?.data?.error || e?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    Swal.fire({ 
      icon: 'error', 
      title: 'เกิดข้อผิดพลาด', 
      text: msg, 
      confirmButtonColor: '#ef4444', 
      background: '#ffffff', 
      color: '#1f2937',
      customClass: {
        popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
      }
    });
  }

        Swal.fire({
          title: 'เติมเงินสำเร็จ!',
          text: `คุณได้รับเครดิตจำนวน ฿${amount.toLocaleString()} เติมเข้ากระเป๋าเงินของคุณเรียบร้อยแล้ว`,
          icon: 'success',
          background: '#ffffff',
          color: '#1f2937',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
          }
        });
        setTruemoneyLink('');
        setActiveView('main');
      } else {
        Swal.fire({
          title: 'ตรวจสอบล้มเหลว',
          text: response.data.error || 'ซองอั่งเปาหมดอายุ ถูกใช้ไปแล้ว หรือไม่ถูกต้อง',
          icon: 'error',
          background: '#ffffff',
          color: '#1f2937',
          confirmButtonColor: '#ff2c2c',
          customClass: {
            popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
          }
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการตรวจสอบ',
        text: err.response?.data?.error || err.message || 'การเชื่อมต่อระบบขัดข้อง กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const processSlipFile = async (file: File) => {
    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังตรวจสอบสลิปโอนเงิน',
      text: 'ระบบกำลังดึงสถิติวิเคราะห์ QR Code ยอดการทำธุรกรรมโมบายแบงกิ้ง...',
      icon: 'info',
      background: '#ffffff',
      color: '#1f2937',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
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
              method: 'อัพโหลดสลิปธนาคาร (Bank Transfer/Slip)',
              amount: topup ? topup.amount : amount,
              username: topup?.userId || userPlan?.username || 'Unknown',
              status: 'success',
              date: topup ? topup.date : new Date().toISOString(),
              billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
              money: topup ? topup.amount : amount,
              title: topup ? topup.title : 'สแกนสลิปโอนเงินสำเร็จ',
              image: 'https://img1.pic.in.th/images/IMG_6164.png'
            };
            if (onTopupSuccess) onTopupSuccess(historyEntry);
          } catch(e: any) {
    console.error("Caught error:", e);
    const msg = e?.response?.data?.error || e?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: msg,
      confirmButtonColor: '#ef4444',
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
      }
    });
  }
          
          Swal.fire({
            title: 'ตรวจสอบสำเร็จ!',
            text: `ระบบทำการตรวจสอบสลิปโอนเงินเรียบร้อย ได้รับเครดิต ฿${amount.toLocaleString()} บาท`,
            icon: 'success',
            background: '#ffffff',
            color: '#1f2937',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
            }
          });
          setSelectedFile(null);
          setFilePreview(null);
          setActiveView('main');
        } else {
          Swal.fire({
            title: 'ตรวจสอบไม่สำเร็จ',
            text: response.data.error || 'ข้อมูลสลิปนี้ไม่ถูกต้อง หรือสลิปเคยถูกใช้งานรับเครดิตไปแล้ว',
            icon: 'error',
            background: '#ffffff',
            color: '#1f2937',
            confirmButtonColor: '#ff2c2c',
            customClass: {
              popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
            }
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'การส่งสลิปล้มเหลว',
          text: err.response?.data?.error || err.message || 'ระบบวิเคราะห์สลิปขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลัง',
          icon: 'error',
          background: '#ffffff',
          color: '#1f2937',
          confirmButtonColor: '#ff2c2c',
          customClass: {
            popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
          }
        });
      } finally {
        setIsVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      Swal.fire({
        title: 'ไฟล์ประเภทรูปภาพเท่านั้น',
        text: 'กรุณาเลือกหรือวางเฉพาะไฟล์รูปภาพสลิป PNG, JPG หรือ JPEG',
        icon: 'warning',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
    }
  };

  const executeSlipUpload = () => {
    if (selectedFile) {
      processSlipFile(selectedFile);
    } else {
      Swal.fire({
        title: 'ไม่พบไฟล์รูปภาพ',
        text: 'กรุณาอัปโหลดหรือเลือกไฟล์รูปภาพหลักสลิปธนาคารก่อนกดยืนยัน',
        icon: 'warning',
        background: '#ffffff',
        color: '#1f2937',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-xl mx-auto px-6 py-8 font-sans bg-[#f8fafc] border border-zinc-200/60 rounded-[32px] text-zinc-800 relative z-10 select-none shadow-sm mt-4">
        
        {/* Decorative ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-full pointer-events-none overflow-hidden select-none -z-10">
          <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
        </div>

        <AnimatePresence mode="wait">
          
          {/* ────── MAIN VIEW ────── */}
          {activeView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-left mt-4 mb-2">
                <h1 className="text-2xl font-black text-[#1e1e20] tracking-tight">
                  ช่องทางชำระเงิน
                </h1>
                <p className="text-zinc-500 text-sm font-medium mt-1">
                  เลือกวิธีการเติมเงินที่คุณต้องการ
                </p>
              </div>

              {/* Account Balance Banner */}
              <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <span className="text-zinc-500 font-bold text-sm">ยอดเงินในบัญชี:</span>
                <span className="text-[#13c2c2] font-black text-2xl tracking-tight">
                  ฿{(userPlan?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Option 1: Slip Checking / PromptPay */}
              <div className="bg-white border border-zinc-200/70 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-zinc-800 tracking-tight">PromptPay (เช็คสลิป)</h3>
                    </div>
                    <p className="text-zinc-400 text-xs font-bold leading-relaxed">
                      เติมเงินผ่าน PromptPay ได้อย่างสะดวกและรวดเร็ว
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    พร้อมใช้งาน
                  </span>
                  <button
                    onClick={() => setActiveView('bank')}
                    className="text-xs font-black text-zinc-700 hover:text-blue-600 flex items-center gap-1 transition-colors cursor-pointer group"
                  >
                    ไปยังหน้าเติมเงิน <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Option 2: Angpao envelope */}
              <div className="bg-white border border-zinc-200/70 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-zinc-800 tracking-tight">ซองอั่งเปา</h3>
                    </div>
                    <p className="text-zinc-400 text-xs font-bold leading-relaxed">
                      เติมเงินด้วยซองอั่งเปา TrueMoney
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    พร้อมใช้งาน
                  </span>
                  <button
                    onClick={() => setActiveView('truemoney')}
                    className="text-xs font-black text-zinc-700 hover:text-amber-500 flex items-center gap-1 transition-colors cursor-pointer group"
                  >
                    ไปยังหน้าเติมเงิน <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* ────── TRUEMONEY WALLET MODE ────── */}
          {activeView === 'truemoney' && (
            <motion.div
              key="truemoney"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-[24px] relative overflow-hidden shadow-xl space-y-6"
            >
              {/* Back & Close header row */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveView('main')}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </button>
                <button 
                  onClick={() => setActiveView('main')}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3.5 pt-2">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <Gift className="w-5.5 h-5.5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-800 tracking-tight">เติมเงินซองอั่งเปา</h2>
                  <p className="text-xs text-zinc-400 font-bold mt-0.5">กรอกลิงก์ของขวัญ TrueMoney Wallet</p>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-4 text-red-600">
                  <h4 className="text-xs font-black flex items-center gap-1.5 select-none uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> โปรดทราบเงื่อนไข
                  </h4>
                  <p className="text-[11px] font-bold leading-relaxed mt-1.5 text-red-500/85">
                    ห้ามนำลิงก์อั่งเปาที่สแกนแล้วหรือลิงก์เปล่ามากรอก การจงใจโกงอาจโดนระงับบัญชี
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 text-amber-600">
                  <h4 className="text-xs font-black flex items-center gap-1.5 select-none uppercase tracking-wide">
                    <Percent className="w-4 h-4 text-amber-500 shrink-0" /> ค่าธรรมเนียม
                  </h4>
                  <p className="text-[11px] font-bold leading-relaxed mt-1.5 text-amber-500/85 font-sans">
                    หักค่าธรรมเนียมของผู้ให้บริการ TrueMoney Wallet ในการโอนเข้า 2.9% ของยอดจริง
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-4 font-sans">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-zinc-500">
                    ลิงก์ซองอั่งเปากล่องของขวัญ (Angpao Link)
                  </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-slate-50 border border-zinc-200 rounded-xl focus:border-amber-500 focus:bg-white px-4 py-3.5 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none transition-all font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> ยืนยันตรวจสอบ & เติมเงิน
                </button>
              </form>

              <div className="text-center font-mono text-[10px] text-zinc-400 pt-2 font-bold tracking-wider">
                TLS SECURED END-TO-END VOUCHER CHECKER
              </div>
            </motion.div>
          )}

          {/* ────── BANK TRANSFER SLIP MODE ────── */}
          {activeView === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-[24px] relative overflow-hidden space-y-6 shadow-xl"
            >
              {/* Back & Close row */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveView('main')}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </button>
                <button 
                  onClick={() => setActiveView('main')}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3.5 font-sans">
                <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Landmark className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-800 tracking-tight">โอนผ่านธนาคาร & เช็คสลิป</h2>
                  <p className="text-xs text-zinc-400 font-bold mt-0.5">ยอดเงินเข้ากระเป๋าทันที ไม่มีค่าบริการ 0%</p>
                </div>
              </div>

              {/* Bank Display card */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3.5 border border-zinc-100">
                <h4 className="text-xs font-black text-blue-600 flex items-center gap-1.5 select-none uppercase tracking-wide">
                  <Coins className="w-4 h-4 text-blue-500" /> บัญชีรับฝากสโตร์ (สแกน/โอนเงิน)
                </h4>
                
                <div className="text-xs space-y-2.5 text-zinc-700 font-bold">
                  <div className="flex justify-between items-center gap-2 border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400">ธนาคาร:</span>
                    <span className="text-zinc-800 font-black">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 border-b border-zinc-100 pb-2">
                    <span className="text-zinc-400">ผู้รับเงิน:</span>
                    <span className="text-zinc-800 font-black">{bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 pt-0.5">
                    <span className="text-zinc-400">เลขที่บัญชี:</span>
                    <div className="flex items-center gap-2">
                      <span className="bg-white px-3 py-1 border border-zinc-200 rounded-lg text-sm font-black select-all text-zinc-800 text-right tracking-wider">{bankAccountNumber}</span>
                      <button 
                        onClick={handleCopyAccount}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isCopying 
                            ? 'bg-blue-600 text-white border-transparent' 
                            : 'bg-white hover:bg-slate-100 text-zinc-400 hover:text-zinc-700 border-zinc-200'
                        }`}
                        title="คลิกเพื่อคัดลอกบัญชี"
                      >
                        {isCopying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop slip upload field */}
              <div className="relative">
                <input 
                  type="file" 
                  id="slip-image-upload"
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                  disabled={isVerifying}
                />
                
                <label 
                  htmlFor="slip-image-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full min-h-[170px] p-6 rounded-2xl transition-all duration-200 border-2 border-dashed relative cursor-pointer ${
                    isDragActive 
                      ? 'bg-blue-50/30 border-blue-500 scale-[0.99]' 
                      : 'bg-slate-50 hover:bg-slate-100/50 border-zinc-200 hover:border-blue-500/50'
                  }`}
                >
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-3 w-full animate-in zoom-in-95 duration-150">
                      <div className="w-24 h-32 bg-zinc-900 rounded-xl overflow-hidden relative shadow-md">
                        <img src={filePreview} alt="Slip" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] text-white py-1 text-center font-bold">
                          เปลี่ยนรูปภาพ
                        </div>
                      </div>
                      <span className="text-xs font-black text-blue-600 max-w-[200px] truncate">
                        {selectedFile?.name || 'สลิปพร้อมสแกน'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2 select-none text-center">
                      <div className="w-12 h-12 bg-white flex items-center justify-center mb-3 rounded-xl shadow-sm border border-zinc-100">
                        <Camera className="w-6 h-6 text-blue-500" />
                      </div>
                      <span className="text-sm font-black text-blue-600">
                        อัปโหลดสลิป หรือ ถ่ายภาพหลักฐาน
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold mt-2 max-w-[280px] leading-relaxed block">
                        พิมพ์/สแกนสลิปโอนที่มี QR Code ครบถ้วน (ไม่เกิน 30MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Instructions Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 text-blue-600">
                  <p className="text-xs font-black flex items-center gap-1.5 mb-2 select-none uppercase tracking-wide">
                    <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" /> ขั้นตอนทำรายการ
                  </p>
                  <p className="text-[11px] font-bold text-blue-500/85 leading-relaxed font-sans">
                    โอนผ่านแอปพลิเคชัน จากนั้นเซฟรูปสลิปแล้วอัปโหลดไฟล์ที่นี่ ระบบจะใช้เวลาเช็คสลิป 3 - 10 วินาที
                  </p>
                </div>

                <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4 text-amber-600">
                  <p className="text-xs font-black flex items-center gap-1.5 mb-2 select-none uppercase tracking-wide">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" /> ข้อควรระวัง
                  </p>
                  <p className="text-[11px] font-bold text-amber-500/85 leading-relaxed font-sans">
                    รูปสลิปซ้ำจะไม่อนุมัติ กรุณาโอนและระบุยอดให้ตรง หากสลิปมีปัญหาสามารถติดต่อผู้พัฒนาเพื่อช่วยเหลือ
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={executeSlipUpload}
                  disabled={isVerifying || !selectedFile}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none"
                >
                  <UploadCloud className="w-4.5 h-4.5 shrink-0" /> ตรวจสอบสลิป & อนุมัติยอดยืนยัน
                </button>
                
                <p className="text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1 hover:text-zinc-500 cursor-default">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> สแกนใบเสร็จจาก SlipOK API ครอบคลุมแอปธนาคารไทยทั้งหมด
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

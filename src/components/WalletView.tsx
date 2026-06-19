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
      background: '#09090b',
      color: '#ffffff',
      customClass: {
        popup: 'border border-#1f2937'
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
        background: '#09090b',
        color: '#ffffff',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'border border-#1f2937'
        }
      });
      return;
    }

    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังตรวจสอบซองอั่งเปา',
      text: 'ระบบกำลังดึงยอดเงินและตรวจสอบความถูกต้องแบบอัตโนมัติ...',
      icon: 'info',
      background: '#09090b',
      color: '#ffffff',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'border border-#1f2937'
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
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444', background: '#09090b', color: '#fff' });
  }

        Swal.fire({
          title: 'เติมเงินสำเร็จ!',
          text: `คุณได้รับเครดิตจำนวน ฿${amount.toLocaleString()} เติมเข้ากระเป๋าเงินของคุณเรียบร้อยแล้ว`,
          icon: 'success',
          background: '#09090b',
          color: '#ffffff',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'border border-#1f2937'
          }
        });
        setTruemoneyLink('');
        setActiveView('main');
      } else {
        Swal.fire({
          title: 'ตรวจสอบล้มเหลว',
          text: response.data.error || 'ซองอั่งเปาหมดอายุ ถูกใช้ไปแล้ว หรือไม่ถูกต้อง',
          icon: 'error',
          background: '#09090b',
          color: '#ffffff',
          confirmButtonColor: '#ff2c2c',
          customClass: {
            popup: 'border border-#1f2937'
          }
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการตรวจสอบ',
        text: err.response?.data?.error || err.message || 'การเชื่อมต่อระบบขัดข้อง กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        background: '#09090b',
        color: '#ffffff',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'border border-#1f2937'
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
      background: '#09090b',
      color: '#ffffff',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'border border-#1f2937'
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
    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444', background: '#09090b', color: '#fff' });
  }
          
          Swal.fire({
            title: 'ตรวจสอบสำเร็จ!',
            text: `ระบบทำการตรวจสอบสลิปโอนเงินเรียบร้อย ได้รับเครดิต ฿${amount.toLocaleString()} บาท`,
            icon: 'success',
            background: '#09090b',
            color: '#ffffff',
            confirmButtonColor: '#3b82f6',
            customClass: {
              popup: 'border border-#1f2937'
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
            background: '#09090b',
            color: '#ffffff',
            confirmButtonColor: '#ff2c2c',
            customClass: {
              popup: 'border border-#1f2937'
            }
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'การส่งสลิปล้มเหลว',
          text: err.response?.data?.error || err.message || 'ระบบวิเคราะห์สลิปขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลัง',
          icon: 'error',
          background: '#09090b',
          color: '#ffffff',
          confirmButtonColor: '#ff2c2c',
          customClass: {
            popup: 'border border-#1f2937'
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
        background: '#09090b',
        color: '#ffffff',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'border border-#1f2937'
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
        background: '#09090b',
        color: '#ffffff',
        confirmButtonColor: '#ff2c2c',
        customClass: {
          popup: 'border border-#1f2937'
        }
      });
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-xl mx-auto px-4 py-8 font-sans min-h-screen text-white relative z-10">
        
        {/* Subtle high-tech circular glows mirroring kaitunshop premium visual design */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-full pointer-events-none overflow-hidden select-none -z-10">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-[#3b82f6]/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-[20%] left-[-20%] w-[250px] h-[250px] bg-[#7c3aed]/5 rounded-full blur-[60px]" />
        </div>

        {/* ── Header Card: Current Balance Glassmorphic Widget ── */}
        <div className="mb-8 relative overflow-hidden bg-[#1c1c1e]/40 backdrop-blur-3xl saturate-150 border border-white/[0.05] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group rounded-[32px] shadow-2xl">
          {/* Subtle line background decoration inside wallet stats card */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-#3b82f6 to-transparent opacity-65 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/15 text-[#3b82f6] flex items-center justify-center shrink-0">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 tracking-wider">ช่องกระเป๋าเงินของคุณ</p>
              <p className="text-3xl font-bold text-white mt-1 flex items-baseline gap-1">
                ฿{(userPlan?.balance || 0).toLocaleString()} <span className="text-sm text-zinc-400 font-medium">บาท</span>
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#3b82f6]/15 text-[#3b82f6] text-xs font-semibold flex items-center gap-2 rounded-full select-none self-start sm:self-center shadow-lg">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse" />
            <span>พร้อมเติมเงินเข้าระบบ</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ────── MAIN VIEW ────── */}
          {activeView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
                  <Coins className="w-8 h-8 text-[#3b82f6]" /> ช่องทางการชำระเงิน
                </h1>
                <p className="text-zinc-400 text-sm font-medium mt-3 max-w-sm mx-auto leading-relaxed">
                  เลือกวิธีการชำระเงินที่คุณสะดวกเพื่อรับเครดิตในระบบแบบอัปเดตทันใจ
                </p>
              </div>

              {/* Option 1: TrueMoney Wallet */}
              <div className="group relative bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/[0.05] p-6 lg:p-8 rounded-[28px] transition-all duration-500 overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#fca211]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start justify-between gap-5 relative z-10">
                  <div className="flex items-start gap-5">
                    {/* Orange-Yellow brand envelope icon */}
                    <div className="w-16 h-16 rounded-[20px] bg-[#fca211]/15 flex items-center justify-center shrink-0 shadow-inner">
                      <Gift className="w-8 h-8 text-[#fca211]" />
                    </div>

                    <div className="space-y-2">
                       <div className="flex items-center gap-2 flex-wrap">
                         <h3 className="text-xl font-bold text-white tracking-tight">ซองอั่งเปา (Angpao Link)</h3>
                         <span className="px-2.5 py-1 bg-[#fca211]/20 text-[#fca211] text-[10px] font-bold tracking-wider rounded-full">
                           AUTO
                         </span>
                       </div>
                       <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                         TrueMoney Wallet • กรอกลิงก์ซองของขวัญอั่งเปาเพื่อรับเงินเข้ากระเป๋าบัญชี
                       </p>
                       <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium pb-2">
                         <Percent className="w-4 h-4" /> 
                         <span>หักค่าธรรมเนียมเพียง 2.9%</span>
                       </div>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 bg-[#2c2c2e]/60 border border-white/[0.05] text-zinc-300 text-[11px] font-bold uppercase tracking-wider rounded-full select-none shrink-0 self-start sm:self-center shadow-sm">
                    Online
                  </span>
                </div>

                <div className="mt-4 relative z-10">
                  <button
                    onClick={() => setActiveView('truemoney')}
                    className="w-full py-4 rounded-[16px] bg-[#fca211] hover:bg-[#e0910f] text-black font-bold text-sm flex items-center justify-center gap-2 transition-transform duration-200 cursor-pointer active:scale-[0.98] shadow-lg"
                  >
                    เริ่มเติมเงิน <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Option 2: Bank Slip Scanner */}
              <div className="group relative bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/[0.05] p-6 lg:p-8 rounded-[28px] transition-all duration-500 overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start justify-between gap-5 relative z-10">
                  <div className="flex items-start gap-5">
                    {/* Emerald bank landmark icon */}
                    <div className="w-16 h-16 rounded-[20px] bg-[#3b82f6]/15 flex items-center justify-center shrink-0 shadow-inner">
                      <Landmark className="w-8 h-8 text-[#3b82f6]" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold text-white tracking-tight">โอนเงินธนาคาร (เช็คสลิป)</h3>
                        <span className="px-2.5 py-1 bg-[#3b82f6]/20 text-[#3b82f6] text-[10px] font-bold tracking-wider rounded-full">
                          AUTO
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                        โอนเข้าธนาคารร้านค้าแล้วอัปโหลดสลิปนำไปสแกนรวดเร็วผ่านธนาคารโดยไม่มีค่าบริการ
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#3b82f6] font-medium pb-2">
                        <CheckCircle className="w-4 h-4" /> 
                        <span>ฟรีไม่มีค่าบริการ 0%</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 bg-[#2c2c2e]/60 border border-white/[0.05] text-[#3b82f6] text-[11px] font-bold uppercase tracking-wider rounded-full select-none shrink-0 self-start sm:self-center shadow-sm">
                    ฟรี 0%
                  </span>
                </div>

                <div className="mt-4 relative z-10">
                  <button
                    onClick={() => setActiveView('bank')}
                    className="w-full py-4 rounded-[16px] bg-[#3b82f6] hover:bg-[#0ea5e9] hover:bg-[#0d9668] text-black font-bold text-sm flex items-center justify-center gap-2 transition-transform duration-200 cursor-pointer active:scale-[0.98] shadow-lg"
                  >
                    เริ่มเติมเงิน <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Security info disclaimer badge */}
              <div className="p-5 rounded-[20px] bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/[0.05] flex gap-4 text-zinc-400 select-none shadow-md">
                <ShieldCheck className="w-6 h-6 text-[#3b82f6] shrink-0" />
                <p className="text-xs leading-relaxed font-medium">
                  ธุรกรรมทางการเงินทั้งหมดดำเนินรายการอย่างเป็นสัดส่วน ปลอดภัย 100% ภายใต้นโยบาย Zero-Data Retention ความเป็นส่วนตัวของลูกค้าเป็นความสำคัญอันดับหนึ่งของเรา
                </p>
              </div>

            </motion.div>
          )}

          {/* ────── TRUEMONEY WALLET MODE ────── */}
          {activeView === 'truemoney' && (
            <motion.div
              key="truemoney"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-10 rounded-[32px] relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#fca211]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Back button */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
                title="ย้อนกลับ"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#fca211]/15 flex items-center justify-center shrink-0">
                  <Gift className="w-7 h-7 text-[#fca211]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">เติมเงินซองอั่งเปา</h2>
                  <p className="text-sm text-zinc-400 font-medium mt-1">กรอกลิงก์ของขวัญ TrueMoney Wallet</p>
                </div>
              </div>

              {/* Warning Alerts inside gorgeous styled grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#ef4444]/10 rounded-[20px] p-5 text-[#ef4444]">
                  <h4 className="text-sm font-bold flex items-center gap-2 select-none uppercase tracking-wide">
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> โปรดทราบเงื่อนไข
                  </h4>
                  <p className="text-xs font-medium leading-relaxed mt-2 text-zinc-300">
                    ห้ามนำลิงก์อั่งเปาที่สแกนแล้วหรือลิงก์เปล่ามากรอก การละเมิดนโยบายจะถูกแบนถาวร
                  </p>
                </div>

                <div className="bg-[#fca211]/10 rounded-[20px] p-5 text-[#fca211]">
                  <h4 className="text-sm font-bold flex items-center gap-2 select-none uppercase tracking-wide">
                    <Percent className="w-5 h-5 shrink-0" /> ค่าธรรมเนียม
                  </h4>
                  <p className="text-xs font-medium leading-relaxed mt-2 text-zinc-300">
                    เนื่องจากผู้ให้บริการระบบชำระเงิน มีการคิดค่าธรรมเนียม <strong className="text-[#fca211]">2.9%</strong> ของยอดเติมจริง
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-zinc-300 ml-1">
                    ลิงก์ซองอั่งเปา (Angpao Link)
                  </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-[#121212]/50 border-none rounded-[20px] focus:ring-2 focus:ring-[#fca211] focus:bg-[#121212]/80 p-5 text-white text-base placeholder:text-zinc-600 focus:outline-none transition-all shadow-inner font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-5 rounded-[20px] bg-[#fca211] hover:bg-[#e0910f] disabled:bg-[#3a3a3c] disabled:text-zinc-500 text-black font-bold text-sm uppercase transition-transform duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> ยืนยันตรวจสอบ & เติมเงิน
                </button>
              </form>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-zinc-500 text-xs font-semibold select-none text-center">
                <span>GATEWAY: TRUEMONEY_ANGPAO</span>
                <span className="hidden sm:block">•</span>
                <span>SECURE TRANSACTION VIA TLS</span>
              </div>
            </motion.div>
          )}

          {/* ────── BANK TRANSFER SLIP MODE ────── */}
          {activeView === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-[#1c1c1e]/40 backdrop-blur-xl border border-white/[0.05] p-6 sm:p-10 rounded-[32px] relative overflow-hidden space-y-8 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Back button */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
                title="ย้อนกลับ"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-[20px] bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
                  <Landmark className="w-7 h-7 text-[#3b82f6]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">โอนผ่านธนาคาร & ยืนยันสลิป</h2>
                  <p className="text-sm text-zinc-400 font-medium mt-1">รับยอดทันที ไม่หักค่าบริการ 0%</p>
                </div>
              </div>

              {/* Cyber Display bank account card */}
              <div className="bg-[#2c2c2e]/60 rounded-[24px] p-6 space-y-5 select-text relative overflow-hidden shadow-lg border border-white/[0.05]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />
                
                <h4 className="text-sm font-bold text-[#3b82f6] flex items-center gap-2 select-none uppercase tracking-wide">
                  <Coins className="w-5 h-5 text-[#3b82f6]" /> บัญชีรับฝากสโตร์ (ธนาคารผู้รับเงิน)
                </h4>
                
                <div className="text-sm space-y-4 text-zinc-300 font-medium">
                  <div className="flex justify-between items-baseline gap-2 border-b border-white/[0.05] pb-3">
                    <span className="text-zinc-500 select-none">สถาบันธนาคาร:</span>
                    <span className="font-bold text-white text-base">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2 border-b border-white/[0.05] pb-3">
                    <span className="text-zinc-500 select-none">นามผู้ถือบัญชี:</span>
                    <span className="font-bold text-white text-base">{bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-zinc-500 select-none">เลขที่บัญชี:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-lg text-white font-mono tracking-wider select-all">{bankAccountNumber}</span>
                      <button 
                        onClick={handleCopyAccount}
                        className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm ${
                          isCopying 
                            ? 'bg-[#3b82f6] text-black border-transparent' 
                            : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white border-transparent'
                        }`}
                        title="คลิกเพื่อคัดลอกบัญชี"
                      >
                        {isCopying ? <Check className="w-4 h-4 animate-in zoom-in duration-100" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag and Drop upload block with scanned guides */}
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
                  className={`flex flex-col items-center justify-center w-full min-h-[200px] p-8 rounded-[24px] transition-all duration-300 border-2 border-dashed border-white/10 relative cursor-pointer ${
                    isDragActive 
                      ? 'bg-[#3b82f6]/5 border-#3b82f6 scale-[0.99] shadow-inner' 
                      : 'bg-[#1c1c1e]/40 hover:border-[#3b82f6/50 hover:bg-[#2c2c2e]/60'
                  }`}
                >

                  {filePreview ? (
                    <div className="flex flex-col items-center gap-4 w-full my-1 animate-in zoom-in-95 duration-200">
                      <div className="w-32 h-40 bg-black/40 rounded-2xl overflow-hidden relative shadow-lg">
                        <img src={filePreview} alt="Slip" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[10px] text-zinc-300 py-1.5 text-center font-bold">
                          เปลี่ยนไฟล์รูป
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#3b82f6] max-w-[280px] truncate">
                        {selectedFile?.name || 'สลิปพร้อมสแกน'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 select-none">
                      <div className="w-16 h-16 bg-white/[0.05] flex items-center justify-center mb-4 rounded-[20px] shadow-sm animate-pulse">
                        <Camera className="w-8 h-8 text-[#3b82f6]" />
                      </div>
                      <span className="text-base font-bold text-[#3b82f6] block">
                        ถ่ายรูป หรือ เลือกไฟล์สลิปของคุณ
                      </span>
                      <span className="text-xs text-zinc-500 font-medium mt-3 text-center px-4 max-w-sm leading-relaxed">
                        ระบบรองรับสลิปโอนเงินที่มี QR Code (ไม่เกิน 30MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Custom Accordion Instructions Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#3b82f6]/10 rounded-[20px] p-5 select-none text-[#3b82f6]">
                  <p className="text-sm font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
                    <Info className="w-5 h-5 text-[#3b82f6] shrink-0" /> ขั้นตอนทำเงิน
                  </p>
                  <div className="text-xs font-medium space-y-2 text-zinc-300 leading-relaxed">
                    <p>1. คัดลอกเลขบัญชี โอนเงินตามยอดที่ต้องการ</p>
                    <p>2. บันทึกและรูปถ่ายสลิปธุรกรรมอย่างชัดเจน</p>
                    <p>3. กดยืนยันปุ่มสแกนด้านล่าง</p>
                  </div>
                </div>

                <div className="bg-[#fca211]/10 rounded-[20px] p-5 select-none text-[#fca211]">
                  <p className="text-sm font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
                    <AlertTriangle className="w-5 h-5 text-[#fca211] shrink-0" /> ข้อจำกัด
                  </p>
                  <div className="text-xs font-medium space-y-2 text-zinc-300 leading-relaxed">
                    <p>• รูปภาพสลิปที่ใช้ซ้ำแล้ว จะไม่แปรยอดอีก</p>
                    <p>• ตรวจเช็คชื่อผู้รับปลายทางให้ตรง</p>
                    <p>• ไม่สามารถถอนทรัพย์คืนได้ในทุกกรณี</p>
                  </div>
                </div>
              </div>

              {/* Confirm submit buttons */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={executeSlipUpload}
                  disabled={isVerifying || !selectedFile}
                  className="w-full py-5 rounded-[20px] bg-[#3b82f6] hover:bg-[#0d9668] disabled:bg-[#3a3a3c] disabled:text-zinc-500 text-black font-bold text-sm uppercase transition-transform duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg"
                >
                  <UploadCloud className="w-5 h-5 shrink-0" /> ยืนยันสแกนตรวจสอบสลิป
                </button>
                
                <p className="text-xs text-zinc-500 font-medium flex items-center justify-center gap-2 select-none text-center pt-2">
                  <Lightbulb className="w-4 h-4 text-[#fca211] shrink-0 animate-bounce" /> สลิปจะได้รับการตรวจจับรายละเอียด อนุมัติยอดทันใจคุณ
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

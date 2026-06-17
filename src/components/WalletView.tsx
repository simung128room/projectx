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
        popup: 'border border-[#1e1e1e]'
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
          popup: 'border border-[#1e1e1e]'
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
        popup: 'border border-[#1e1e1e]'
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
        } catch(e) { console.error("Caught error:", e); }

        Swal.fire({
          title: 'เติมเงินสำเร็จ!',
          text: `คุณได้รับเครดิตจำนวน ฿${amount.toLocaleString()} เติมเข้ากระเป๋าเงินของคุณเรียบร้อยแล้ว`,
          icon: 'success',
          background: '#09090b',
          color: '#ffffff',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'border border-[#1e1e1e]'
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
            popup: 'border border-[#1e1e1e]'
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
          popup: 'border border-[#1e1e1e]'
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
        popup: 'border border-[#1e1e1e]'
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
          } catch(e) { console.error("Caught error:", e); }
          
          Swal.fire({
            title: 'ตรวจสอบสำเร็จ!',
            text: `ระบบทำการตรวจสอบสลิปโอนเงินเรียบร้อย ได้รับเครดิต ฿${amount.toLocaleString()} บาท`,
            icon: 'success',
            background: '#09090b',
            color: '#ffffff',
            confirmButtonColor: '#10b981',
            customClass: {
              popup: 'border border-[#1e1e1e]'
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
              popup: 'border border-[#1e1e1e]'
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
            popup: 'border border-[#1e1e1e]'
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
          popup: 'border border-[#1e1e1e]'
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
          popup: 'border border-[#1e1e1e]'
        }
      });
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-xl mx-auto px-4 py-8 font-sans min-h-screen text-white relative z-10">
        
        {/* Subtle high-tech circular glows mirroring kaitunshop premium visual design */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-full pointer-events-none overflow-hidden select-none -z-10">
          <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[350px] h-[350px] bg-[#10b981]/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-[20%] left-[-20%] w-[250px] h-[250px] bg-[#7c3aed]/5 rounded-full blur-[60px]" />
        </div>

        {/* ── Header Card: Current Balance Glassmorphic Widget ── */}
        <div className="mb-8 relative overflow-hidden bg-[#0a0a0c]/60 backdrop-blur-2xl saturate-150 border border-[#1e1e1e] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group rounded-xl">
          {/* Subtle line background decoration inside wallet stats card */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-65 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 tracking-widest uppercase">ช่องกระเป๋าเงินของคุณ</p>
              <p className="text-2xl font-bold text-white mt-1.5 flex items-baseline gap-1 font-mono">
                ฿{(userPlan?.balance || 0).toLocaleString()} <span className="text-xs text-zinc-400 font-sans font-medium">บาท</span>
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-semibold flex items-center gap-2 select-none self-start sm:self-center">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
            <span>พร้อมเติมเงินเข้าระบบ</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ────── MAIN VIEW ────── */}
          {activeView === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8 text-[#10b981]" /> ช่องทางการชำระเงิน
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                  เลือกวิธีการชำระเงินที่คุณสะดวกเพื่อรับเครดิตในระบบแบบอัปเดตทันใจ
                </p>
              </div>

              {/* Option 1: TrueMoney Wallet */}
              <div className="group relative bg-[#09090b]/80 border border-[#1e1e1e] hover:border-[#fca211]/30 p-6 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-[4px] h-full bg-[#fca211] opacity-60 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fca211]/2 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    {/* Orange-Yellow brand envelope icon */}
                    <div className="w-14 h-14 bg-[#fca211]/10 border border-[#fca211]/30 flex items-center justify-center shrink-0 shadow-inner">
                      <Gift className="w-8 h-8 text-[#fca211]" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white tracking-tight">ซองอั่งเปา (Angpao Link)</h3>
                        <span className="px-2 py-0.5 bg-[#fca211]/10 text-[#fca211] border border-[#fca211]/25 text-[9px] font-semibold tracking-wide rounded">
                          AUTO
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                        TrueMoney Wallet • กรอกลิงก์ซองของขวัญอั่งเปาเพื่อรับเงินเข้ากระเป๋าบัญชี
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold">
                        <Percent className="w-3.5 h-3.5 text-zinc-500" /> 
                        <span>หักค่าธรรมเนียมเพียง 2.9%</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-zinc-800/50 border border-[#1e1e1e] text-zinc-400 text-[10px] font-semibold uppercase tracking-wider rounded select-none shrink-0 self-start sm:self-center">
                    Online
                  </span>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setActiveView('truemoney')}
                    className="w-full py-3 bg-[#fca211]/10 hover:bg-[#fca211] text-[#fca211] hover:text-black border border-[#fca211]/20 hover:border-transparent font-semibold tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    เริ่มเติมเงิน <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Option 2: Bank Slip Scanner */}
              <div className="group relative bg-[#09090b]/80 border border-[#1e1e1e] hover:border-[#10b981]/30 p-6 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-[4px] h-full bg-[#10b981] opacity-60 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/2 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    {/* Emerald bank landmark icon */}
                    <div className="w-14 h-14 bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center shrink-0 shadow-inner">
                      <Landmark className="w-8 h-8 text-[#10b981]" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white tracking-tight">โอนเงินธนาคาร (เช็คสลิปอัตโนมัติ)</h3>
                        <span className="px-2 py-0.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 text-[9px] font-semibold tracking-wide rounded">
                          AUTO
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                        โอนเข้าธนาคารร้านค้าแล้วอัปโหลดสลิปนำไปสแกนรวดเร็วผ่านธนาคารโดยไม่มีค่าบริการ
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#10b981] font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> 
                        <span>ฟรีไม่มีค่าบริการ 0%</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-zinc-800/50 border border-[#1e1e1e] text-[#10b981] text-[10px] font-semibold uppercase tracking-wider rounded select-none shrink-0 self-start sm:self-center">
                    ฟรี 0%
                  </span>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setActiveView('bank')}
                    className="w-full py-3 bg-[#10b981]/10 hover:bg-[#10b981] text-[#10b981] hover:text-black border border-[#10b981]/20 hover:border-transparent font-semibold tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    เริ่มเติมเงิน <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Security info disclaimer badge */}
              <div className="p-4 bg-[#09090b]/40 border border-[#1e1e1e] flex gap-3 text-zinc-400 select-none">
                <ShieldCheck className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">
                  ธุรกรรมทางการเงินทั้งหมดดำเนินรายการอย่างเป็นสัดส่วน ปลอดภัย 100% ภายใต้นโยบาย Zero-Data Retention ความเป็นส่วนตัวของลูกค้าเป็นความสำคัญอันดับหนึ่งของเรา
                </p>
              </div>

            </motion.div>
          )}

          {/* ────── TRUEMONEY WALLET MODE ────── */}
          {activeView === 'truemoney' && (
            <motion.div
              key="truemoney"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-[#09090b] border border-[#1e1e1e] p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Back button */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 p-2 bg-[#121212] hover:bg-[#222222] border border-[#1e1e1e] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
                title="ย้อนกลับ"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6 border-b border-[#1e1e1e] pb-5 pl-1">
                <div className="w-10 h-10 bg-[#fca211]/10 border border-[#fca211]/20 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-[#fca211]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">เติมเงินผ่านซองอั่งเปา</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">กรอกลิงก์ของขวัญอั่งเปา TrueMoney Wallet</p>
                </div>
              </div>

              {/* Warning Alerts inside gorgeous styled grid */}
              <div className="space-y-4 mb-6">
                <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 p-4 text-[#ef4444]">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5 select-none uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" /> โปรดทราบเงื่อนไข
                  </h4>
                  <p className="text-[11px] font-medium leading-relaxed mt-2 text-zinc-300">
                    ห้ามนำลิงก์อั่งเปาที่สแกนแล้วหรือลิงก์เปล่ามากรอก การจงใจโกงหรือสร้างความสับสนต่อเซิร์ฟเวอร์อาจทำให้ท่านสูญสิทธิ์การเป็นสมาชิกสโตร์ทันที ทางเราไม่มีนโยบายการคืนเงินในทุกกรณี
                  </p>
                </div>

                <div className="bg-[#fca211]/5 border border-[#fca211]/20 p-4 text-[#fca211]">
                  <h4 className="text-xs font-semibold flex items-center gap-1.5 select-none uppercase tracking-wide">
                    <Percent className="w-4 h-4 shrink-0" /> ค่าธรรมเนียมการทำรายการ
                  </h4>
                  <p className="text-[11px] font-medium leading-relaxed mt-2 text-zinc-300">
                    เนื่องจากผู้ให้บริการระบบชำระเงิน มีการกำหนดเงื่อนไขในการประมวลผล จึงส่งผลให้ระบบมีความจำเป็นต้องหักค่าบริการธรรมเนียมจำนวน <strong className="text-[#fca211] font-mono">2.9%</strong> ของยอดเติมจริงที่ได้รับจากซองของขวัญ
                  </p>
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300 tracking-wider uppercase ml-1">
                    ลิงก์ซองอั่งเปา (Angpao Link)
                  </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-[#121212]/50 border border-[#1e1e1e] focus:border-[#fca211] focus:bg-[#121212] p-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-all font-medium font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 bg-[#fca211] hover:bg-[#e0910f] disabled:bg-[#1a1a24] disabled:text-zinc-600 disabled:border-transparent text-black font-semibold tracking-widest text-xs uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> ยืนยันตรวจสอบ & เติมเงิน
                </button>
              </form>

              <div className="mt-8 pt-4 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-1 text-zinc-600 text-[10px] font-mono select-none">
                <span>GATEWAY: TRUEMONEY_ANGPAO</span>
                <span>SECURE TRANSACTION VIA TLS</span>
              </div>
            </motion.div>
          )}

          {/* ────── BANK TRANSFER SLIP MODE ────── */}
          {activeView === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-[#09090b] border border-[#1e1e1e] p-6 sm:p-8 relative overflow-hidden space-y-6"
            >
              {/* Back button */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 p-2 bg-[#121212] hover:bg-[#222222] border border-[#1e1e1e] text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
                title="ย้อนกลับ"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 border-b border-[#1e1e1e] pb-5 pl-1">
                <div className="w-10 h-10 bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-[#10b981]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">โอนผ่านธนาคาร & เช็คสลิป</h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">อัปโหลดสลิปสแกน QR Code ตรวจสอบยอดเงินชั่วครู่</p>
                </div>
              </div>

              {/* Cyber Display bank account card */}
              <div className="bg-[#121212] border border-[#1e1e1e] p-5 space-y-4 select-text relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-full blur-xl pointer-events-none" />
                
                <h4 className="text-xs font-bold text-[#10b981] flex items-center gap-1.5 select-none uppercase tracking-widest pl-0.5">
                  <Coins className="w-4 h-4 text-[#10b981]" /> บัญชีรับฝากสโตร์ (ธนาคารผู้รับเงิน)
                </h4>
                
                <div className="text-xs space-y-3.5 text-zinc-300">
                  <div className="flex justify-between items-baseline gap-2 border-b border-[#1e1e1e] pb-2.5">
                    <span className="text-zinc-500 font-medium select-none">สถาบันธนาคาร:</span>
                    <span className="font-semibold text-white text-sm">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2 border-b border-[#1e1e1e] pb-2.5">
                    <span className="text-zinc-500 font-medium select-none">นามผู้ถือบัญชี:</span>
                    <span className="font-semibold text-white text-sm">{bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-zinc-500 font-medium select-none">เลขที่บัญชี:</span>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-white font-mono tracking-wider select-all">{bankAccountNumber}</span>
                      <button 
                        onClick={handleCopyAccount}
                        className={`p-1.5 border transition-all shrink-0 cursor-pointer ${
                          isCopying 
                            ? 'bg-[#10b981] text-black border-transparent' 
                            : 'bg-[#09090b] hover:bg-[#121212] text-zinc-400 hover:text-white border-[#1e1e1e]'
                        }`}
                        title="คลิกเพื่อคัดลอกบัญชี"
                      >
                        {isCopying ? <Check className="w-3.5 h-3.5 animate-in zoom-in duration-100" /> : <Copy className="w-3.5 h-3.5" />}
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
                  className={`flex flex-col items-center justify-center w-full min-h-[180px] p-6 rounded-none transition-all duration-300 border-2 border-dashed relative cursor-pointer ${
                    isDragActive 
                      ? 'bg-[#10b981]/5 border-[#10b981] scale-[0.99] shadow-inner' 
                      : 'bg-[#121212]/30 border-[#1e1e1e] hover:border-[#10b981]/50 hover:bg-[#121212]/50'
                  }`}
                >
                  {/* Neon retro corner photo crop style overlays */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-zinc-600 group-hover:border-[#10b981]" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-600 group-hover:border-[#10b981]" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-600 group-hover:border-[#10b981]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-zinc-600 group-hover:border-[#10b981]" />

                  {filePreview ? (
                    <div className="flex flex-col items-center gap-3 w-full my-1 animate-in zoom-in-95 duration-200">
                      <div className="w-24 h-32 bg-[#09090b] border border-[#1e1e1e] overflow-hidden relative shadow-md">
                        <img src={filePreview} alt="Slip" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 text-[9px] text-zinc-400 py-1 text-center font-sans">
                          เปลี่ยนไฟล์รูป
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#10b981] max-w-[280px] truncate">
                        {selectedFile?.name || 'สลิปพร้อมสแกน'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                        SIZE: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4 select-none">
                      <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 mb-3 rounded-full shadow-inner animate-pulse">
                        <Camera className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="text-sm font-semibold text-[#10b981] block">
                        📷 คลิก หรือลากวางไฟล์รูปถ่ายสลิป
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium mt-2 text-center px-4 max-w-sm leading-relaxed">
                        ระบบรองรับสลิปโอนเงินที่มี QR Code ได้สูงสุดถึง 30MB
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Custom Accordion Instructions Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#10b981]/5 border border-[#10b981]/15 p-4 rounded-none select-none text-[#10b981]">
                  <p className="text-xs font-bold flex items-center gap-1.5 mb-2.5 uppercase tracking-wider pl-0.5">
                    <Info className="w-4 h-4 text-[#10b981] shrink-0" /> ขั้นตอนทำเงิน
                  </p>
                  <div className="text-[11px] font-medium space-y-2 text-zinc-300 leading-relaxed font-sans">
                    <p>1. คัดลอกเลขบัญชี โอนเงินตามยอดที่ต้องการ</p>
                    <p>2. บันทึกและรูปถ่ายสลิปธุรกรรมอย่างชัดเจน</p>
                    <p>3. กดอัปโหลดรูปผ่านช่องจำกัดกรอบด้านบน</p>
                    <p>4. กดปุ่ม "ยืนยันนำเสนอสลิป" ด้านล่าง</p>
                  </div>
                </div>

                <div className="bg-[#fca211]/5 border border-[#fca211]/15 p-4 rounded-none select-none text-[#fca211]">
                  <p className="text-xs font-bold flex items-center gap-1.5 mb-2.5 uppercase tracking-wider pl-0.5">
                    <AlertTriangle className="w-4 h-4 text-[#fca211] shrink-0" /> ข้อจำกัด
                  </p>
                  <div className="text-[11px] font-medium space-y-2 text-zinc-300 leading-relaxed font-sans">
                    <p>• รูปภาพสลิปที่ผ่านการใช้ซ้ำแล้ว จะไม่แปรยอดอีก</p>
                    <p>• ตรวจเช็คยอดเงินและชื่อผู้รับปลายทางให้ตรง</p>
                    <p>• บิลการฝากจะอิงเวลาตามธนาคารแห่งประเทศไทย</p>
                    <p>• โครงข่ายเป็นระบบปิด ไม่สามารถถอนทรัพย์คืนได้</p>
                  </div>
                </div>
              </div>

              {/* Confirm submit buttons */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={executeSlipUpload}
                  disabled={isVerifying || !selectedFile}
                  className="w-full py-4 bg-[#10b981] hover:bg-[#0d9668] disabled:bg-[#111c18] disabled:text-zinc-600 disabled:border-transparent text-black font-semibold tracking-widest text-xs uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <UploadCloud className="w-4 h-4 shrink-0" /> ยืนยันสแกนตรวจสอบสลิป
                </button>
                
                <p className="text-[10px] text-zinc-500 font-medium flex items-center justify-center gap-1.5 select-none text-center">
                  <Lightbulb className="w-3.5 h-3.5 text-[#fca211] shrink-0 animate-bounce" /> สลิปจะได้รับการตรวจจับรายละเอียด อนุมัติยอดทันใจคุณ
                </p>
              </div>

              {/* Footer text */}
              <div className="pt-4 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-center justify-between gap-1 text-zinc-600 text-[10px] font-mono select-none">
                <span>GATEWAY: BANK_SLIP_EMBEDDED</span>
                <span>VERIFY BY SCAN_QR API SECURE</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

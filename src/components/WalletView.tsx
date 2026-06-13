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
  Check
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
      title: 'คัดลอกเลขบัญชีสโตร์สำเร็จ!',
      showConfirmButton: false,
      timer: 1500,
      background: '#ffffff',
      color: '#1e293b'
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
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
      });
      return;
    }

    setIsVerifying(true);
    Swal.fire({
      title: 'กำลังตรวจสอบซองอั่งเปา',
      text: 'ระบบกำลังดึงยอดเงินและตรวจสอบความถูกต้องแบบอัตโนมัติ...',
      icon: 'info',
      background: '#ffffff',
      color: '#1e293b',
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
          background: '#ffffff',
          color: '#1e293b',
          confirmButtonColor: '#e31a22'
        });
        setTruemoneyLink('');
        setActiveView('main');
      } else {
        Swal.fire({
          title: 'ตรวจสอบล้มเหลว',
          text: response.data.error || 'ซองอั่งเปาหมดอายุ ถูกใช้ไปแล้ว หรือไม่ถูกต้อง',
          icon: 'error',
          background: '#ffffff',
          color: '#1e293b',
          confirmButtonColor: '#e31a22'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการตรวจสอบ',
        text: err.response?.data?.error || err.message || 'การเชื่อมต่อระบบขัดข้อง กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
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
      color: '#1e293b',
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
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#e31a22'
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
            color: '#1e293b',
            confirmButtonColor: '#e31a22'
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'การส่งสลิปล้มเหลว',
          text: err.response?.data?.error || err.message || 'ระบบวิเคราะห์สลิปขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งในภายหลัง',
          icon: 'error',
          background: '#ffffff',
          color: '#1e293b',
          confirmButtonColor: '#e31a22'
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
        title: 'ไฟล์ประเภทของรูปภาพเท่านั้น',
        text: 'กรุณาเลือกหรือวางเฉพาะไฟล์รูปภาพสลิป PNG, JPG หรือ JPEG',
        icon: 'warning',
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
      });
    }
  };

  const executeSlipUpload = () => {
    if (selectedFile) {
      processSlipFile(selectedFile);
    } else {
      Swal.fire({
        title: 'ไม่พบไฟล์รูปภาพ',
        text: 'กรุณาอัพโหลดหรือเลือกไฟล์รูปภาพหลักสลิปธนาคารก่อนกดยืนยัน',
        icon: 'warning',
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
      });
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-lg sm:max-w-xl mx-auto px-4 py-8 font-sans min-h-screen text-slate-800 relative z-10">
        
        {/* Subtle decorative background curves to match kiddy store visual identity */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-full pointer-events-none overflow-hidden select-none -z-10">
          <svg className="absolute top-0 left-0 w-full opacity-10" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,50 Q100,10 200,120 T500,20" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5"></path>
            <path d="M-50,250 Q120,180 250,310 T450,220" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"></path>
            <circle cx="200" cy="80" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6"></circle>
          </svg>
        </div>

        {/* Current Balance & User Display Widget */}
        <div className="mb-6 bg-white border border-slate-100 rounded-md p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-md flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">ยอดคงเหลือในกระเป๋าของคุณ</p>
              <p className="text-xl font-semibold text-slate-800 mt-0.5">
                ฿{(userPlan?.balance || 0).toLocaleString()} <span className="text-xs text-slate-400 font-semibold">บาท</span>
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-md text-xs font-medium flex items-center gap-1.5 select-none ">
            <span className="w-2 h-2 bg-[#10b981] rounded-full" />
            <span>พร้อมเติมเงิน</span>
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
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Header Visual Icon from mockups */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 relative shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                  ช่องทางการชำระเงิน
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 max-w-sm">
                  เลือกช่องทางที่ต้องการเพื่อเติมเงินเข้าบัญชีของคุณ
                </p>
              </div>

              {/* Red-framed Option 1: TrueMoney Wallet */}
              <motion.div
                
                className="bg-white border border-slate-100 p-6 rounded-md shadow-sm flex flex-col space-y-5 transition-colors duration-200 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Styled TrueMoney Wallet Simulated Logo */}
                  <div className="w-14 h-14 rounded-md bg-[#f52b2b] flex items-center justify-center relative shadow-md shrink-0 select-none">
                    <div className="w-7 h-7 rounded-full bg-yellow-400 border-[2.5px] border-[#f52b2b] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 h-2 bg-[#d11c1c] rounded-sm" />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">ซองอั่งเปา</h3>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-semibold tracking-wide rounded-md">
                        ตรวจสอบอัตโนมัติ
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      True Money Wallet • ใช้ลิงก์ซองอั่งเปาเพื่อเติมเงิน
                    </p>
                    <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-red-400 shrink-0" /> เหมาะสำหรับผู้ใช้ TrueMoney Wallet
                    </p>
                  </div>
                </div>

                {/* Status Badge from mock */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-md p-3 select-none">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-500 font-semibold tracking-wide">พร้อมใช้งาน</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">คลิกเพื่อเริ่มเติมเงิน</p>
                  </div>
                </div>

                {/* Crimson Select Button */}
                <button
                  onClick={() => setActiveView('truemoney')}
                  className="w-full py-3 rounded-md bg-[#e31a22] hover:bg-[#bc131a] active:scale-[0.99] text-white font-semibold tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-colors duration-200 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> เลือก
                </button>
              </motion.div>

              {/* Purple-framed Option 2: Bank Slip Scanner */}
              <motion.div
                
                className="bg-white border border-slate-100 p-6 rounded-md shadow-sm flex flex-col space-y-5 transition-colors duration-200 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Styled Purple Doc Logo */}
                  <div className="w-14 h-14 rounded-md bg-[#7c3aed] flex items-center justify-center relative shadow-md shrink-0 select-none">
                    <FileText className="w-7 h-7 text-white" />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-semibold text-slate-800">สลิปโอนเงิน</h3>
                      <span className="px-2 py-0.5 bg-purple-50 text-zinc-600 border border-[#1e1e1e] text-[9px] font-semibold tracking-wide rounded-md">
                        ตรวจสอบอัตโนมัติ
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Bank Transfer Slip • อัปโหลดสลิปโอนเงินเพื่อเติมเงิน
                    </p>
                    <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> รองรับการโอนผ่านทุกธนาคาร
                    </p>
                  </div>
                </div>

                {/* Status Badge from mock */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-md p-3 select-none">
                  <div className="w-8 h-8 rounded-full bg-purple-50 border border-[#1e1e1e] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#7c3aed] font-semibold tracking-wide">พร้อมใช้งาน</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">คลิกเพื่อเริ่มเติมเงิน</p>
                  </div>
                </div>

                {/* Crimson Select Button */}
                <button
                  onClick={() => setActiveView('bank')}
                  className="w-full py-3 rounded-md bg-[#e31a22] hover:bg-[#bc131a] active:scale-[0.99] text-white font-semibold tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-colors duration-200 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> เลือก
                </button>
              </motion.div>

              {/* Mobile Domain Footer Visual from kiddyxstore mockup */}
              <div className="pt-6 border-t border-slate-100 text-center select-none text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                {siteSettings?.site_title || 'APEX STORE'}
              </div>
            </motion.div>
          )}

          {/* ────── TRUEMONEY WALLET MODE ────── */}
          {activeView === 'truemoney' && (
            <motion.div
              key="truemoney"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[2rem] shadow-md relative overflow-hidden"
            >
              {/* Close X marker on top right */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 w-8 h-8 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Sub-view Header */}
              <div className="flex items-start gap-3.5 mb-6 border-b border-slate-100 pb-5">
                <div className="w-12 h-12 rounded-full bg-[#fca211] flex items-center justify-center text-white text-lg font-semibold font-sans shadow-md shrink-0">
                  T
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">ซองอั่งเปา</h2>
                  <p className="text-xs text-slate-400 font-medium leading-none mt-1">True Money Wallet</p>
                </div>
              </div>

              {/* Red-border Warning Card: หมายเหตุ */}
              <div className="bg-rose-50 border border-rose-100 rounded-md p-4 mb-4 select-none">
                <p className="text-xs font-semibold text-rose-600">หมายเหตุ</p>
                <p className="text-[11px] text-rose-500 font-medium leading-relaxed mt-1">
                  การเติมเงินนี้ ไม่สามารถใช้กับระบบ API ได้ กรุณาตรวจสอบเลขบัญชีก่อนโอนทุกครั้ง ทางเว็บไซต์ไม่มีนโยบายคืนเงินไม่ว่ากรณีใดๆทั้งสิ้น
                </p>
              </div>

              {/* Yellow-border Warning Card: แจ้งเตือนค่าธรรมเนียม */}
              <div className="bg-amber-50 border border-amber-100 rounded-md p-4 mb-6 select-none">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> แจ้งเตือนค่าธรรมเนียม
                </p>
                <p className="text-[11px] text-amber-700 font-medium leading-normal mt-1">
                  ระบบจะหักค่าธรรมเนียม 2.9% จากยอดเติม angpa
                </p>
              </div>

              {/* Interactive Submit Form */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2 ml-1">
                    ลิงก์ซองอั่งเปา
                  </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-md p-3.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-md bg-[#e31a22] hover:bg-[#bc131a] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold tracking-widest uppercase transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Wallet className="w-4 h-4 shrink-0" /> เติมเงิน
                </button>
              </form>

              {/* Footer Domain Text */}
              <div className="mt-8 text-center select-none text-slate-300 text-[9px] font-semibold uppercase tracking-widest">
                {siteSettings?.site_title || 'APEX STORE'}
              </div>
            </motion.div>
          )}

          {/* ────── BANK TRANSFER SLIP MODE ────── */}
          {activeView === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[2rem] shadow-md relative overflow-hidden space-y-6"
            >
              {/* Close X marker on top right */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 w-8 h-8 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer animate-in duration-100"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Sub-view Header */}
              <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
                <div className="w-12 h-12 rounded-md bg-[#e31a22]/10 flex items-center justify-center border border-red-500/20 shrink-0">
                  <FileText className="w-6 h-6 text-[#e31a22]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">อัพโหลดสลิปโอนเงิน</h2>
                  <p className="text-xs text-slate-400 font-medium leading-none mt-1">Bank Transfer/Slip</p>
                </div>
              </div>

              {/* Bank Metadata display box */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-md p-5 space-y-3.5 select-text relative">
                <h4 className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 select-none">
                  <Landmark className="w-4 h-4 text-rose-500" /> ข้อมูลบัญชีธนาคาร
                </h4>
                
                <div className="text-xs font-semibold space-y-2.5 text-slate-700">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-400 select-none">ธนาคาร:</span>
                    <span className="font-semibold text-slate-800">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-400 select-none">ชื่อบัญชี:</span>
                    <span className="font-semibold text-slate-800">{bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 relative">
                    <span className="text-slate-400 select-none">เลขบัญชี:</span>
                    <div className="flex items-center gap-2 pr-1">
                      <span className="font-semibold text-sm text-slate-800 font-mono tracking-wider">{bankAccountNumber}</span>
                      <button 
                        onClick={handleCopyAccount}
                        className={`p-1.5 rounded-md border transition-all shrink-0 ${
                          isCopying 
                            ? 'bg-[#10b981] text-white border-transparent' 
                            : 'bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                        }`}
                        title="คลิกเพื่อคัดลอกเลขบัญชี"
                      >
                        {isCopying ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop slip upload element from screenshots (dashed pink/red) */}
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
                  className={`flex flex-col items-center justify-center w-full min-h-[160px] p-6 rounded-md transition-colors duration-200  border-dashed relative cursor-pointer ${
                    isDragActive 
                      ? 'bg-rose-50 border-red-400 scale-[0.99]' 
                      : 'bg-white hover:bg-slate-50/50 border-red-200 hover:border-red-400'
                  }`}
                >
                  {/* Real slip image preview thumbnail after choosing file */}
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-24 h-24 rounded-md border border-red-100 overflow-hidden relative group/preview">
                        <img src={filePreview} alt="Slip Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[9px] text-white py-0.5 text-center font-medium">
                          คลิกค้างเปลี่ยนรูป
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-rose-500 max-w-[250px] truncate">
                        {selectedFile?.name || 'สลิปพร้อมตรวจสอบ'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        (ขนาด: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-red-500 mb-2.5 shadow-inner">
                        <Camera className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-red-500 block">
                        📷 คลิกเพื่อเลือกรูปสลิป
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-1.5 text-center px-4 max-w-sm">
                        รองรับไฟล์รูปภาพทุกประเภท (ไม่เกิน 30MB)
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Light green: วิธีใช้ (Instruction Block) */}
              <div className="bg-[#10b981]/5 border border-[#10b981]/20 p-4 rounded-md select-none text-[#10b981]">
                <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-[#10b981] shrink-0" /> วิธีใช้
                </p>
                <div className="text-[11px] font-medium space-y-1.5 text-white/70 leading-relaxed">
                  <p>1. โอนเงินไปยังบัญชีธนาคารที่แสดงด้านบน</p>
                  <p>2. ถ่ายรูปสลิปโอนเงินให้ชัดเจน</p>
                  <p>3. อัพโหลดรูปสลิปในช่องด้านบน</p>
                  <p>4. กดปุ่ม "อัพโหลดสลิป"</p>
                  <p>5. ระบบจะประมวลผลและดึงจำนวนเงินจากสลิปอัตโนมัติ</p>
                  <p>6. ระบบจะเติมเงินให้อัตโนมัติ</p>
                </div>
              </div>

              {/* Yellow warning: หมายเหตุ */}
              <div className="bg-amber-550/5 border border-amber-500/10 p-4 rounded-md select-none text-amber-500 font-medium">
                <p className="text-xs font-semibold flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> หมายเหตุ
                </p>
                <div className="text-[11px] space-y-1.5 text-white/70 leading-normal">
                  <p>• กรุณาตรวจสอบข้อมูลบัญชีให้ถูกต้องก่อนโอน</p>
                  <p>• สลิปที่ใช้แล้วจะไม่สามารถใช้ซ้ำได้</p>
                  <p>• ชื่อผู้รับเงินต้องตรงกับบัญชีที่แสดง</p>
                  <p>• ทางเว็บไซต์ไม่มีนโยบายคืนเงิน</p>
                </div>
              </div>

              {/* Final Confirm Execute button */}
              <div className="space-y-3.5">
                <button
                  onClick={executeSlipUpload}
                  disabled={isVerifying || !selectedFile}
                  className="w-full py-3.5 rounded-md bg-[#e31a22] hover:bg-[#bc131a] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border border-transparent text-white font-semibold tracking-widest uppercase transition-colors duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <UploadCloud className="w-4 h-4" /> อัพโหลดสลิป
                </button>
                
                <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5 select-none text-center">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0" /> ระบบจะตรวจสอบและเติมเงินให้อัตโนมัติ
                </p>
              </div>

              {/* Footer Domain Text */}
              <div className="pt-2 text-center select-none text-slate-300 text-[9px] font-semibold uppercase tracking-widest">
                {siteSettings?.site_title || 'APEX STORE'}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

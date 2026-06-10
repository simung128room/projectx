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
  const bankName = siteSettings?.bank_name || '';
  const bankAccountNumber = siteSettings?.bank_account_number || '000-0-00000-0';
  const bankAccountHolder = siteSettings?.bank_account_holder || '';

  const handleCopyAccount = () => {
    setIsCopying(true);
    const digitsOnly = bankAccountNumber.replace(/[-\s]/g, '');
    navigator.clipboard.writeText(digitsOnly);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: '!',
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
        title: '',
        text: ' ',
        icon: 'error',
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
      });
      return;
    }

    setIsVerifying(true);
    Swal.fire({
      title: '',
      text: '...',
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
            method: ' (Angpao Link)',
            amount: topup ? topup.amount : amount,
            status: 'success',
            date: topup ? topup.date : new Date().toISOString(),
            billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
            money: topup ? topup.amount : amount,
            title: topup ? topup.title : '',
            image: 'https://img1.pic.in.th/images/IMG_6172.png'
          };
          if (onTopupSuccess) onTopupSuccess(historyEntry);
        } catch(e) {}

        Swal.fire({
          title: '!',
          text: ` ${amount.toLocaleString()} Wallet`,
          icon: 'success',
          background: '#ffffff',
          color: '#1e293b',
          confirmButtonColor: '#e31a22'
        });
        setTruemoneyLink('');
        setActiveView('main');
      } else {
        Swal.fire({
          title: '',
          text: response.data.error || '  ',
          icon: 'error',
          background: '#ffffff',
          color: '#1e293b',
          confirmButtonColor: '#e31a22'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: '',
        text: err.response?.data?.error || err.message || ' ',
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
      title: '',
      text: ' QR Code ...',
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
              method: ' (Bank Transfer/Slip)',
              amount: topup ? topup.amount : amount,
              username: topup?.userId || userPlan?.username || 'Unknown',
              status: 'success',
              date: topup ? topup.date : new Date().toISOString(),
              billNumber: topup ? 'T-' + topup.id.split('-')[0].toUpperCase() : 'T-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
              money: topup ? topup.amount : amount,
              title: topup ? topup.title : '',
              image: 'https://img1.pic.in.th/images/IMG_6164.png'
            };
            if (onTopupSuccess) onTopupSuccess(historyEntry);
          } catch(e) {}
          
          Swal.fire({
            title: '!',
            text: `  ${amount.toLocaleString()} `,
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
            title: '',
            text: response.data.error || ' ',
            icon: 'error',
            background: '#ffffff',
            color: '#1e293b',
            confirmButtonColor: '#e31a22'
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: '',
          text: err.response?.data?.error || err.message || ' ',
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
        title: '',
        text: ' PNG, JPG  JPEG',
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
        title: '',
        text: '',
        icon: 'warning',
        background: '#ffffff',
        color: '#1e293b',
        confirmButtonColor: '#e31a22'
      });
    }
  };

  return (<AnimatedScroll direction="up" hideOnScroll={true}>
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
        <div className="mb-6 bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase"></p>
              <p className="text-xl font-black text-slate-800 mt-0.5">
                {(userPlan?.balance || 0).toLocaleString()}<span className="text-xs text-slate-400 font-semibold"></span>
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-xs font-bold flex items-center gap-1.5 select-none animate-pulse">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span></span>
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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  </h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1.5 max-w-sm">
                  </p>
              </div>

              {/* Red-framed Option 1: TrueMoney Wallet */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col space-y-5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Styled TrueMoney Wallet Simulated Logo */}
                  <div className="w-14 h-14 rounded-2xl bg-[#f52b2b] flex items-center justify-center relative shadow-md shrink-0 select-none">
                    <div className="w-7 h-7 rounded-full bg-yellow-400 border-[2.5px] border-[#f52b2b] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 h-2 bg-[#d11c1c] rounded-sm" />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-800"></h3>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black tracking-wide rounded-md">
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      True Money Wallet •</p>
                    <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-red-400 shrink-0" /> TrueMoney Wallet</p>
                  </div>
                </div>

                {/* Status Badge from mock */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 select-none">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-500 font-extrabold tracking-wide"></p>
                    <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5"></p>
                  </div>
                </div>

                {/* Crimson Select Button */}
                <button
                  onClick={() => setActiveView('truemoney')}
                  className="w-full py-3 rounded-xl bg-[#e31a22] hover:bg-[#bc131a] active:scale-[0.99] text-white font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> </button>
              </motion.div>

              {/* Purple-framed Option 2: Bank Slip Scanner */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col space-y-5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  {/* Styled Purple Doc Logo */}
                  <div className="w-14 h-14 rounded-2xl bg-[#7c3aed] flex items-center justify-center relative shadow-md shrink-0 select-none">
                    <FileText className="w-7 h-7 text-white" />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-800"></h3>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 text-[9px] font-black tracking-wide rounded-md">
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                      Bank Transfer Slip •</p>
                    <p className="text-slate-400 text-[10px] font-semibold flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5 text-purple-400 shrink-0" /> </p>
                  </div>
                </div>

                {/* Status Badge from mock */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 select-none">
                  <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#7c3aed] font-extrabold tracking-wide"></p>
                    <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5"></p>
                  </div>
                </div>

                {/* Crimson Select Button */}
                <button
                  onClick={() => setActiveView('bank')}
                  className="w-full py-3 rounded-xl bg-[#e31a22] hover:bg-[#bc131a] active:scale-[0.99] text-white font-black tracking-widest text-xs uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> </button>
              </motion.div>

              {/* Mobile Domain Footer Visual from kiddyxstore mockup */}
              <div className="pt-6 border-t border-slate-100 text-center select-none text-slate-400 text-[10px] font-black uppercase tracking-widest">
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
              className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden"
            >
              {/* Close X marker on top right */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Sub-view Header */}
              <div className="flex items-start gap-3.5 mb-6 border-b border-slate-100 pb-5">
                <div className="w-12 h-12 rounded-full bg-[#fca211] flex items-center justify-center text-white text-lg font-black font-sans shadow-md shrink-0">
                  T
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800"></h2>
                  <p className="text-xs text-slate-400 font-bold leading-none mt-1">True Money Wallet</p>
                </div>
              </div>

              {/* Red-border Warning Card:  */}<div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-4 select-none">
                <p className="text-xs font-black text-rose-600"></p>
                <p className="text-[11px] text-rose-500 font-bold leading-relaxed mt-1">
                  API</p>
              </div>

              {/* Yellow-border Warning Card:  */}<div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 select-none">
                <p className="text-xs font-black text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> </p>
                <p className="text-[11px] text-amber-700 font-bold leading-normal mt-1">
                  2.9%  angpa</p>
              </div>

              {/* Interactive Submit Form */}
              <form onSubmit={handleTruemoneyTopup} className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1">
                    </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl p-3.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none transition-all font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-xl bg-[#e31a22] hover:bg-[#bc131a] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Wallet className="w-4 h-4 shrink-0" /> </button>
              </form>

              {/* Footer Domain Text */}
              <div className="mt-8 text-center select-none text-slate-300 text-[9px] font-black uppercase tracking-widest">
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
              className="bg-white border border-slate-100 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden space-y-6"
            >
              {/* Close X marker on top right */}
              <button 
                onClick={() => setActiveView('main')}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer animate-in duration-100"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Sub-view Header */}
              <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
                <div className="w-12 h-12 rounded-xl bg-[#e31a22]/10 flex items-center justify-center border border-red-500/20 shrink-0">
                  <FileText className="w-6 h-6 text-[#e31a22]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800"></h2>
                  <p className="text-xs text-slate-400 font-bold leading-none mt-1">Bank Transfer/Slip</p>
                </div>
              </div>

              {/* Bank Metadata display box */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-5 space-y-3.5 select-text relative">
                <h4 className="text-xs font-black text-rose-700 flex items-center gap-1.5 select-none">
                  <Landmark className="w-4 h-4 text-rose-500" /> </h4>
                
                <div className="text-xs font-semibold space-y-2.5 text-slate-700">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-400 select-none">:</span>
                    <span className="font-extrabold text-slate-800">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-400 select-none">:</span>
                    <span className="font-extrabold text-slate-800">{bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 relative">
                    <span className="text-slate-400 select-none">:</span>
                    <div className="flex items-center gap-2 pr-1">
                      <span className="font-black text-sm text-slate-800 font-mono tracking-wider">{bankAccountNumber}</span>
                      <button 
                        onClick={handleCopyAccount}
                        className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                          isCopying 
                            ? 'bg-emerald-500 text-white border-transparent' 
                            : 'bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-700 border-slate-200'
                        }`}
                        title=""
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
                  className={`flex flex-col items-center justify-center w-full min-h-[160px] p-6 rounded-3xl transition-all duration-300 border-2 border-dashed relative cursor-pointer ${
                    isDragActive 
                      ? 'bg-rose-50 border-red-400 scale-[0.99]' 
                      : 'bg-white hover:bg-slate-50/50 border-red-200 hover:border-red-400'
                  }`}
                >
                  {/* Real slip image preview thumbnail after choosing file */}
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="w-24 h-24 rounded-xl border border-red-100 overflow-hidden relative group/preview">
                        <img src={filePreview} alt="Slip Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-[9px] text-white py-0.5 text-center font-bold">
                          </div>
                      </div>
                      <span className="text-xs font-black text-rose-500 max-w-[250px] truncate">
                        {selectedFile?.name || ''}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        (: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-red-500 mb-2.5 shadow-inner">
                        <Camera className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-red-500 block">
                        📷</span>
                      <span className="text-[10px] text-slate-400 font-bold mt-1.5 text-center px-4 max-w-sm">
                        ( 30MB)</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Light blue:  (Instruction Block) */}<div className="bg-blue-50/80 border border-blue-100 p-4 rounded-2xl select-none text-blue-700">
                <p className="text-xs font-black flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" /> </p>
                <div className="text-[11px] font-bold space-y-1.5 text-blue-600/90 leading-relaxed">
                  <p>1.</p>
                  <p>2.</p>
                  <p>3.</p>
                  <p>4.  ""</p>
                  <p>5.</p>
                  <p>6.</p>
                </div>
              </div>

              {/* Yellow warning:  */}<div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl select-none text-amber-800 font-bold">
                <p className="text-xs font-black flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> </p>
                <div className="text-[11px] space-y-1.5 text-amber-700 leading-normal">
                  <p>•</p>
                  <p>•</p>
                  <p>•</p>
                  <p>•</p>
                </div>
              </div>

              {/* Final Confirm Execute button */}
              <div className="space-y-3.5">
                <button
                  onClick={executeSlipUpload}
                  disabled={isVerifying || !selectedFile}
                  className="w-full py-3.5 rounded-xl bg-[#e31a22] hover:bg-[#bc131a] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 border border-transparent text-white font-black tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <UploadCloud className="w-4 h-4" /> </button>
                
                <p className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1.5 select-none text-center">
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500 shrink-0" /> </p>
              </div>

              {/* Footer Domain Text */}
              <div className="pt-2 text-center select-none text-slate-300 text-[9px] font-black uppercase tracking-widest">
                {siteSettings?.site_title || 'APEX STORE'}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </AnimatedScroll>
  );
};

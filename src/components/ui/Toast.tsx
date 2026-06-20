import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, ShoppingBag } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '../../lib/toastStore';

const Toast: React.FC<{ toast: ToastType; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#364153]" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-[#364153]" />,
    payment: <ShoppingBag className="w-5 h-5 text-[#364153]" />
  };

  const bgColors = {
    success: 'bg-[#050505] border-emerald-500/20 shadow-emerald-500/5',
    error: 'bg-[#050505] border-red-500/20 shadow-red-500/5',
    warning: 'bg-[#050505] border-amber-500/20 shadow-amber-500/5',
    info: 'bg-[#050505] border-[#364153]/20 shadow-sm/5',
    payment: 'bg-[#050505] border-[#374151]/20 shadow-purple-500/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className={`relative flex items-center min-w-[280px] max-w-sm gap-4 p-4 pr-10 border bg-opacity-95 transition-all ${bgColors[toast.type]}`}
    >
      <div className="shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex flex-col">
        {toast.title && <span className="text-[13px] font-semibold text-white leading-tight mb-0.5 uppercase tracking-wide">{toast.title}</span>}
        <p className="text-muted-foreground text-xs sm:text-[13px] font-medium leading-relaxed">{toast.message}</p>
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

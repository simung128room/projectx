import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StopConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionId: string;
  remainingText: string;
}

export const StopConfirmModal: React.FC<StopConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sessionId,
  remainingText
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#141517] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-prompt">
            ยืนยันการหยุดเซสชัน #{sessionId}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            เซสชันนี้ยังมีเวลาเหลืออีก <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{remainingText}</span> หากคุณหยุดการทำงาน คอนเทนเนอร์จะถูกปิดและปลดล็อกทันที
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-2xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 rounded-2xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors cursor-pointer"
          >
            หยุดเซสชัน
          </button>
        </div>
      </div>
    </div>
  );
};

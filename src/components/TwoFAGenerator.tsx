import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Clock,
  Key as KeyIcon,
  AlertCircle
} from "lucide-react";
import * as OTPAuth from "otpauth";
import { motion, AnimatePresence } from "motion/react";

interface TwoFAResult {
  secret: string;
  code: string;
}

export function TwoFAGenerator() {
  const [secretsInput, setSecretsInput] = useState("");
  const [results, setResults] = useState<TwoFAResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeftGlobal, setTimeLeftGlobal] = useState(30);

  const generateCodes = useCallback(() => {
    if (!secretsInput.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const lines = secretsInput.split("\n").filter(line => line.trim().length > 0);
    const newResults: TwoFAResult[] = [];
    let hasError = false;

    lines.forEach(line => {
      const secretStr = line.trim().replace(/\s/g, "");
      try {
        const totp = new OTPAuth.TOTP({
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secretStr)
        });
        const code = totp.generate();
        newResults.push({ secret: secretStr, code });
      } catch (err) {
        hasError = true;
      }
    });

    setResults(newResults);
    if (hasError && newResults.length === 0) {
      setError("Secret Key ไม่ถูกต้อง (ต้องเป็น Base32)");
    } else {
      setError(null);
    }
  }, [secretsInput]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeLeftGlobal(remaining);
      
      if (results.length > 0) {
        generateCodes();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [generateCodes, results.length]);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearAll = () => {
    setSecretsInput("");
    setResults([]);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0b0f14]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <ShieldCheck className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">2FA Generator</h2>
              <p className="text-indigo-400/80 text-sm font-medium">สร้างรหัส OTP จาก Secret Key</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm">สร้างรหัสสำหรับการยืนยันตัวตนแบบสองขั้นตอน (Two-Factor Authentication)</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-zinc-300 text-sm font-bold flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-indigo-400" />
                2FA Secret
              </label>
              <button 
                onClick={clearAll}
                className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างข้อมูล
              </button>
            </div>
            <textarea
              value={secretsInput}
              onChange={(e) => setSecretsInput(e.target.value)}
              placeholder="กรอก Secret Key หลายตัวได้ โดยแยกบรรทัด"
              className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-all placeholder:text-zinc-600 font-mono text-sm leading-relaxed"
            />
            <button
              onClick={generateCodes}
              disabled={!secretsInput.trim()}
              className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Generate OTP
            </button>
          </div>

          {/* Results Section */}
          <AnimatePresence mode="popLayout">
            {results.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-zinc-400 text-xs font-black uppercase tracking-widest">รหัสที่สร้างสำเร็จ</h3>
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    เปลี่ยนรหัสใน {timeLeftGlobal} วินาที
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, idx) => (
                    <motion.div
                      key={`${idx}-${result.secret}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white/5 border border-white/5 rounded-3xl p-5 hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all relative overflow-hidden"
                    >
                      {/* Timer Progress Bar */}
                      <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/30" style={{ width: '100%' }}>
                        <motion.div 
                          className="h-full bg-indigo-500" 
                          animate={{ width: `${(timeLeftGlobal / 30) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 text-[10px] font-mono break-all line-clamp-1 pr-8">
                            {result.secret}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-3xl font-black text-white tracking-[0.2em] font-mono">
                            {result.code.slice(0, 3)} {result.code.slice(3)}
                          </span>
                          <button
                            onClick={() => handleCopy(result.code, idx)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                              copiedIndex === idx 
                                ? "bg-emerald-500 text-white" 
                                : "bg-white/10 text-white hover:bg-indigo-500"
                            }`}
                          >
                            {copiedIndex === idx ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {!results.length && !error && (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-600">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <KeyIcon className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">กรอก Secret Key เพื่อเริ่มสร้างรหัส OTP</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-black/20 border-t border-white/5">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            SECURE GENERATION • LOCAL ONLY
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0b0f14]/50 border border-white/5 rounded-3xl p-6">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            2FA คืออะไร?
          </h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            2FA (Two-Factor Authentication) คือการยืนยันตัวตนแบบสองขั้นตอน เพื่อความปลอดภัยสูงสุดของบัญชีของคุณ รหัสจะเปลี่ยนไปทุกๆ 30 วินาที
          </p>
        </div>
        <div className="bg-[#0b0f14]/50 border border-white/5 rounded-3xl p-6">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            ความปลอดภัย
          </h4>
          <p className="text-zinc-400 text-xs leading-relaxed">
            รหัส 2FA ถูกสร้างขึ้นบนบราวเซอร์ของคุณโดยตรง (Client-side) ไม่มีการส่ง Secret Key ไปยังเซิร์ฟเวอร์ของเรา ข้อมูลของคุณปลอดภัย 100%
          </p>
        </div>
      </div>
    </div>
  );
}

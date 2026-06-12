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
        className="bg-card border border-border  overflow-hidden "
      >
        {/* Header */}
        <div className="p-8 border-b border-border  from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-[#10b981]/20 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7 text-[#10b981]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">2FA Generator</h2>
              <p className="text-[#10b981]/80 text-sm font-medium">สร้างรหัส OTP จาก Secret Key</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">สร้างรหัสสำหรับการยืนยันตัวตนแบบสองขั้นตอน (Two-Factor Authentication)</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-muted-foreground text-sm font-bold flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-[#10b981]" />
                2FA Secret
              </label>
              <button 
                onClick={clearAll}
                className="text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างข้อมูล
              </button>
            </div>
            <textarea
              value={secretsInput}
              onChange={(e) => setSecretsInput(e.target.value)}
              placeholder="กรอก Secret Key หลายตัวได้ โดยแยกบรรทัด"
              className="w-full h-40 bg-card border border-border  p-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-all placeholder:text-zinc-500 font-mono text-sm leading-relaxed "
            />
            <div className="h-px bg-card my-2 " />
            <button
              onClick={generateCodes}
              disabled={!secretsInput.trim()}
              className="w-full h-14 bg-[#10b981] hover:bg-[#10b981] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3"
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
                  <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">รหัสที่สร้างสำเร็จ</h3>
                  <div className="flex items-center gap-2 text-[#10b981] text-xs font-bold">
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
                      className="group bg-card border border-border  p-5 hover:bg-[#050505]/[0.08] hover:border-emerald-500/30 transition-all relative overflow-hidden "
                    >
                      {/* Timer Progress Bar */}
                      <div className="absolute bottom-0 left-0 h-1 bg-[#10b981]/30" style={{ width: '100%' }}>
                        <motion.div 
                          className="h-full bg-[#10b981]" 
                          animate={{ width: `${(timeLeftGlobal / 30) * 100}%` }}
                          transition={{ duration: 1, ease: "linear" }}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[10px] font-mono break-all line-clamp-1 pr-8">
                            {result.secret}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-3xl font-semibold text-white tracking-[0.2em] font-mono">
                            {result.code.slice(0, 3)} {result.code.slice(3)}
                          </span>
                          <button
                            onClick={() => handleCopy(result.code, idx)}
                            className={`w-12 h-12 flex items-center justify-center transition-all ${ copiedIndex === idx ? "bg-[#10b981] text-white" : "bg-[#050505]/10 text-white hover:bg-[#10b981]" }`}
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
              className="p-4 bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {!results.length && !error && (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-20 h-20 bg-card flex items-center justify-center mb-4 ">
                <KeyIcon className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium">กรอก Secret Key เพื่อเริ่มสร้างรหัส OTP</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-card border-t border-border  ">
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" />
            SECURE GENERATION • LOCAL ONLY
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border  p-6 ">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#10b981]" />
            2FA คืออะไร?
          </h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            2FA (Two-Factor Authentication) คือการยืนยันตัวตนแบบสองขั้นตอน เพื่อความปลอดภัยสูงสุดของบัญชีของคุณ รหัสจะเปลี่ยนไปทุกๆ 30 วินาที
          </p>
        </div>
        <div className="bg-card border border-border  p-6 ">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#10b981]" />
            ความปลอดภัย
          </h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            รหัส 2FA ถูกสร้างขึ้นบนบราวเซอร์ของคุณโดยตรง (Client-side) ไม่มีการส่ง Secret Key ไปยังเซิร์ฟเวอร์ของเรา ข้อมูลของคุณปลอดภัย 100%
          </p>
        </div>
      </div>
    </div>
  );
}

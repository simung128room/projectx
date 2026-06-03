import React, { ErrorInfo } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a real production app, send this to Sentry or similar service
    console.error("Global Error Boundary caught:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#06080B] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0B0D0F] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10  rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10  rounded-full"></div>
            
            <div className="relative z-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-8 text-red-500 shadow-lg shadow-red-500/5">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-black text-white mb-4 tracking-tight">เกิดข้อผิดพลาด</h1>
                <p className="text-zinc-500 text-sm leading-relaxed mb-10">
                    ขออภัย ระบบขัดข้องกะทันหัน ข้อมูลข้อผิดพลาดถูกส่งไปยังทีมพัฒนาแล้ว โปรดลองใหม่อีกครั้งหรือกลับหน้าหลัก
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={this.handleReload}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-[#1D4ED8] text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] shadow-lg shadow-lg/25 uppercase tracking-wider"
                    >
                        <RefreshCcw className="w-4 h-4" /> รีเฟรชหน้านี้
                    </button>
                    <button
                        onClick={this.handleGoHome}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#050505]/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-2xl font-bold text-sm transition-all"
                    >
                        <Home className="w-4 h-4" /> กลับสู่หน้าหลัก
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Reference ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
        <div className="min-h-screen bg-card flex items-center justify-center p-6 font-sans ">
          <div className="max-w-md w-full bg-card border border-[#374151]  p-10 text-center relative overflow-hidden ">
            {/* Background Decoration */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary text-primary-foreground"></div>
            
            <div className="relative z-10">
                <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center mx-auto mb-8 text-red-500">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                
                <h1 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">เกิดข้อผิดพลาด</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-10">
                    ขออภัย ระบบขัดข้องกะทันหัน ข้อมูลข้อผิดพลาดถูกส่งไปยังทีมพัฒนาแล้ว โปรดลองใหม่อีกครั้งหรือกลับหน้าหลัก
                </p>

                {this.state.error && (
                  <div className="text-left bg-red-500/10 border border-red-500/20 rounded p-4 mb-6 overflow-auto max-h-60 font-mono text-xs text-red-400">
                    <div className="font-bold mb-1">Error: {this.state.error.message}</div>
                    <pre className="whitespace-pre-wrap text-[10px] opacity-80">{this.state.error.stack}</pre>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={this.handleReload}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-foreground font-semibold text-sm transition-all active:scale-[0.98] uppercase tracking-wider"
                    >
                        <RefreshCcw className="w-4 h-4" /> รีเฟรชหน้านี้
                    </button>
                    <button
                        onClick={this.handleGoHome}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-card hover:bg-card/10 text-muted-foreground hover:text-foreground font-medium text-sm transition-all "
                    >
                        <Home className="w-4 h-4" /> กลับสู่หน้าหลัก
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-[#374151]  text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
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

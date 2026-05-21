import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    fetch('/api/log_error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'react_error', message: error.message, stack: error.stack, componentStack: errorInfo.componentStack })
    }).catch(console.log);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-4">ระบบเกิดข้อผิดพลาด</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            ขออภัย มีบางอย่างผิดปกติที่ฝั่งไคลเอนต์
            กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง
          </p>
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-left w-full max-w-2xl mb-8 overflow-auto">
            <code className="text-sm text-red-400 font-mono">
              {this.state.error?.message}
            </code>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            รีเฟรชหน้าเว็บ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

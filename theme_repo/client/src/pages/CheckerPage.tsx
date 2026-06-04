import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Upload, FileText, X, Zap, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ParsedAccount {
  email: string;
  password: string;
}

export default function CheckerPage() {
  const [, navigate] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedAccounts, setParsedAccounts] = useState<ParsedAccount[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [concurrency, setConcurrency] = useState(10);
  const [showPreview, setShowPreview] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseMutation = trpc.checker.parseAccounts.useMutation();
  const startMutation = trpc.checker.startSession.useMutation();

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".txt")) {
      toast.error("Only .txt files are supported");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }

    const content = await file.text();
    setFileName(file.name);

    try {
      const result = await parseMutation.mutateAsync({ content });
      setParsedAccounts(result.accounts);
      const defaultName = file.name.replace(".txt", "") + "_" + new Date().toISOString().slice(0, 10);
      setSessionName(defaultName);
      toast.success(`Parsed ${result.total} accounts from file`);
    } catch (e) {
      toast.error("Failed to parse file");
    }
  }, [parseMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleStart = async () => {
    if (parsedAccounts.length === 0) { toast.error("No accounts to check"); return; }
    if (!sessionName.trim()) { toast.error("Session name is required"); return; }

    setIsStarting(true);
    try {
      const result = await startMutation.mutateAsync({
        sessionName: sessionName.trim(),
        accounts: parsedAccounts,
        concurrency,
      });
      toast.success(`Session started! Checking ${parsedAccounts.length} accounts...`);
      navigate(`/session/${result.sessionId}`);
    } catch (e) {
      toast.error("Failed to start session");
      setIsStarting(false);
    }
  };

  const handleClear = () => {
    setParsedAccounts([]);
    setFileName(null);
    setSessionName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="section-label mb-2">ACCOUNT CHECKER</p>
          <h1 className="text-4xl font-black tracking-tight">
            UPLOAD<br />
            <span className="text-neon-green">& FIRE</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            Upload a .txt file with email:password format. One account per line.
          </p>
        </div>

        {/* Upload zone */}
        <div
          className={`border-2 transition-all duration-150 cursor-pointer ${
            isDragging
              ? "border-neon-green bg-neon-green/5"
              : parsedAccounts.length > 0
              ? "border-foreground"
              : "border-border hover:border-muted-foreground"
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !parsedAccounts.length && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />

          {parsedAccounts.length > 0 ? (
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <FileText size={24} className="text-neon-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-mono font-bold text-foreground">{fileName}</p>
                  <p className="font-mono text-sm text-neon-green mt-1">
                    {parsedAccounts.length.toLocaleString()} accounts parsed
                  </p>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    Ready to check — configure settings below
                  </p>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleClear(); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center gap-4 text-center">
              <Upload size={32} className={isDragging ? "text-neon-green" : "text-muted-foreground"} />
              <div>
                <p className="font-mono font-bold text-foreground">DROP FILE HERE</p>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  or click to browse — .txt files only
                </p>
              </div>
              <div className="border border-border px-3 py-1">
                <p className="font-mono text-xs text-muted-foreground">
                  FORMAT: <span className="text-foreground">email@domain.com:password</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {parsedAccounts.length > 0 && (
          <div className="border border-border">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              onClick={() => setShowPreview(!showPreview)}
            >
              <div className="flex items-center gap-2">
                <span className="section-label">PREVIEW</span>
                <span className="font-mono text-xs text-muted-foreground">
                  ({Math.min(parsedAccounts.length, 20)} of {parsedAccounts.length})
                </span>
              </div>
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showPreview && (
              <div className="border-t border-border overflow-auto max-h-48">
                <table className="brut-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>EMAIL</th>
                      <th>PASSWORD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedAccounts.slice(0, 20).map((acc, i) => (
                      <tr key={i}>
                        <td className="text-muted-foreground w-12">{i + 1}</td>
                        <td className="text-foreground">{acc.email}</td>
                        <td className="text-muted-foreground">{"•".repeat(Math.min(acc.password.length, 12))}</td>
                      </tr>
                    ))}
                    {parsedAccounts.length > 20 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted-foreground py-3">
                          ... and {parsedAccounts.length - 20} more accounts
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Config */}
        {parsedAccounts.length > 0 && (
          <div className="space-y-6">
            <p className="section-label">SESSION CONFIGURATION</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session name */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-muted-foreground">SESSION NAME</label>
                <input
                  className="brut-input"
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  placeholder="my-check-session"
                />
              </div>

              {/* Concurrency */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-muted-foreground">
                  CONCURRENCY — <span className="text-foreground">{concurrency} threads</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={concurrency}
                    onChange={e => setConcurrency(Number(e.target.value))}
                    className="flex-1 accent-white h-1 cursor-pointer"
                  />
                  <span className="font-mono text-sm font-bold w-8 text-right">{concurrency}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>1 (safe)</span>
                  <span>50 (max)</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 border border-neon-yellow/30 p-4 bg-neon-yellow/5">
              <AlertTriangle size={14} className="text-neon-yellow mt-0.5 flex-shrink-0" />
              <p className="font-mono text-xs text-neon-yellow">
                Higher concurrency = faster checking but higher proxy failure rate. Recommended: 10–20 threads.
              </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-px bg-border">
              {[
                { label: "ACCOUNTS", value: parsedAccounts.length.toLocaleString() },
                { label: "CONCURRENCY", value: `${concurrency}x` },
                { label: "EST. TIME", value: `~${Math.ceil(parsedAccounts.length / concurrency / 3)}s` },
              ].map(item => (
                <div key={item.label} className="bg-background p-4 text-center">
                  <p className="section-label mb-1">{item.label}</p>
                  <p className="font-mono font-black text-2xl text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Launch button */}
            <button
              onClick={handleStart}
              disabled={isStarting || !sessionName.trim()}
              className="brut-btn brut-btn-primary w-full py-4 text-sm"
            >
              {isStarting ? (
                <>
                  <span className="animate-spin">◌</span>
                  INITIALIZING...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  LAUNCH CHECK SESSION — {parsedAccounts.length.toLocaleString()} ACCOUNTS
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Download, StopCircle, ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Zap } from "lucide-react";

type AccountStatus = "valid" | "invalid" | "locked" | "blocked" | "timeout" | "error" | "pending";

interface LiveResult {
  id: number;
  email: string;
  status: AccountStatus;
  balance: number;
  verified: boolean;
  country: string;
  message: string;
  proxyUsed: string;
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const map: Record<AccountStatus, { label: string; cls: string }> = {
    valid: { label: "VALID", cls: "text-neon-green border-neon-green" },
    invalid: { label: "INVALID", cls: "text-neon-red border-neon-red" },
    locked: { label: "LOCKED", cls: "text-neon-yellow border-neon-yellow" },
    blocked: { label: "BLOCKED", cls: "text-neon-purple border-neon-purple" },
    timeout: { label: "TIMEOUT", cls: "text-muted-foreground border-muted-foreground" },
    error: { label: "ERROR", cls: "text-muted-foreground border-muted-foreground" },
    pending: { label: "PENDING", cls: "text-muted-foreground/50 border-muted-foreground/30" },
  };
  const { label, cls } = map[status] ?? map.error;
  return <span className={`brut-tag ${cls}`}>{label}</span>;
}

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const [liveResults, setLiveResults] = useState<LiveResult[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const liveRef = useRef<HTMLDivElement>(null);

  const { data: progress, refetch: refetchProgress } = trpc.checker.getProgress.useQuery(
    { sessionId },
    { refetchInterval: isPolling ? 1000 : false, enabled: !!sessionId }
  );

  const { data: validAccounts } = trpc.checker.getValidAccounts.useQuery(
    { sessionId },
    { refetchInterval: isPolling ? 3000 : 5000, enabled: !!sessionId }
  );

  const cancelMutation = trpc.checker.cancelSession.useMutation();
  const exportQuery = trpc.checker.exportValidAccounts.useQuery(
    { sessionId },
    { enabled: false }
  );

  // Stop polling when done
  useEffect(() => {
    if (progress?.status === "completed" || progress?.status === "cancelled") {
      setIsPolling(false);
    }
  }, [progress?.status]);

  // Update live results from progress
  useEffect(() => {
    if (progress?.recentResults && progress.recentResults.length > 0) {
      setLiveResults(prev => {
        const newItems = progress.recentResults.filter(
          r => !prev.some(p => p.id === r.id)
        ) as LiveResult[];
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev].slice(0, 100);
      });
    }
  }, [progress?.recentResults]);

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ sessionId });
    toast.warning("Session cancelled");
    setIsPolling(false);
  };

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data) {
      const blob = new Blob([result.data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valid_accounts_session_${sessionId}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.count} valid accounts`);
    }
  };

  const pct = progress && progress.total > 0
    ? Math.round((progress.checked / progress.total) * 100)
    : 0;

  const speed = progress && progress.elapsedMs > 0
    ? ((progress.checked / progress.elapsedMs) * 1000).toFixed(1)
    : "0.0";

  const isRunning = progress?.status === "running";
  const isDone = progress?.status === "completed" || progress?.status === "cancelled";

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft size={12} /> BACK TO DASHBOARD
            </button>
            <p className="section-label mb-1">SESSION #{sessionId}</p>
            <h1 className="text-3xl font-black tracking-tight">
              {isRunning ? (
                <span className="text-neon-green">RUNNING<span className="animate-blink">_</span></span>
              ) : progress?.status === "completed" ? (
                <span>COMPLETED</span>
              ) : progress?.status === "cancelled" ? (
                <span className="text-neon-red">CANCELLED</span>
              ) : (
                <span className="text-muted-foreground">LOADING...</span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <button onClick={handleCancel} className="brut-btn brut-btn-danger">
                <StopCircle size={12} />
                CANCEL
              </button>
            )}
            {(isDone || (progress?.valid ?? 0) > 0) && (
              <button onClick={handleExport} className="brut-btn brut-btn-success">
                <Download size={12} />
                EXPORT VALID ({progress?.valid ?? 0})
              </button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-border">
          {[
            { label: "TOTAL", value: progress?.total ?? 0, cls: "text-foreground" },
            { label: "CHECKED", value: progress?.checked ?? 0, cls: "text-foreground" },
            { label: "VALID", value: progress?.valid ?? 0, cls: "text-neon-green" },
            { label: "INVALID", value: progress?.invalid ?? 0, cls: "text-neon-red" },
            { label: "ERRORS", value: progress?.errors ?? 0, cls: "text-muted-foreground" },
            { label: "BALANCE", value: `$${(progress?.totalBalance ?? 0).toFixed(0)}`, cls: "text-neon-yellow", raw: true },
          ].map(item => (
            <div key={item.label} className="bg-background p-4">
              <p className="section-label mb-1">{item.label}</p>
              <p className={`font-mono font-black text-2xl ${item.cls}`}>
                {item.raw ? item.value : (item.value as number).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">PROGRESS</span>
              {isRunning && (
                <span className="font-mono text-xs text-muted-foreground">
                  {speed} acc/sec · {progress?.activeProxyCount ?? 0} proxies active
                </span>
              )}
            </div>
            <span className="font-mono text-sm font-bold text-foreground">{pct}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-xs text-muted-foreground">
            <span>{progress?.checked ?? 0} checked</span>
            <span>{(progress?.total ?? 0) - (progress?.checked ?? 0)} remaining</span>
          </div>
        </div>

        {/* Two column: live feed + valid accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live feed */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="section-label">LIVE FEED</p>
              {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />}
            </div>
            <div
              ref={liveRef}
              className="border border-border overflow-auto"
              style={{ height: "360px" }}
            >
              {liveResults.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-mono text-xs text-muted-foreground">
                    {isRunning ? "Waiting for results..." : "No live results"}
                  </p>
                </div>
              ) : (
                <table className="brut-table">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th>EMAIL</th>
                      <th>STATUS</th>
                      <th>BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveResults.map((r, i) => (
                      <tr key={r.id} className={`animate-slide-in-up ${i === 0 && isRunning ? "bg-foreground/5" : ""}`}>
                        <td className="text-foreground text-xs truncate max-w-[160px]">{r.email}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td className={r.balance > 0 ? "text-neon-green font-bold" : "text-muted-foreground"}>
                          {r.balance > 0 ? `$${r.balance.toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Valid accounts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="section-label">VALID ACCOUNTS</p>
                <span className="font-mono text-xs text-neon-green font-bold">
                  {validAccounts?.length ?? 0}
                </span>
              </div>
              {(validAccounts?.length ?? 0) > 0 && (
                <button onClick={handleExport} className="font-mono text-xs text-neon-green hover:underline flex items-center gap-1">
                  <Download size={10} /> EXPORT .TXT
                </button>
              )}
            </div>
            <div className="border border-border overflow-auto" style={{ height: "360px" }}>
              {!validAccounts || validAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  {isRunning ? (
                    <>
                      <Zap size={24} className="text-muted-foreground/30" />
                      <p className="font-mono text-xs text-muted-foreground">Checking in progress...</p>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} className="text-muted-foreground/30" />
                      <p className="font-mono text-xs text-muted-foreground">No valid accounts found</p>
                    </>
                  )}
                </div>
              ) : (
                <table className="brut-table">
                  <thead className="sticky top-0 bg-background">
                    <tr>
                      <th>EMAIL</th>
                      <th>BALANCE</th>
                      <th>VER.</th>
                      <th>COUNTRY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validAccounts.map(acc => (
                      <tr key={acc.id}>
                        <td className="text-foreground text-xs truncate max-w-[140px]">{acc.email}</td>
                        <td className={`font-bold ${(acc.balance ?? 0) > 0 ? "text-neon-green" : "text-muted-foreground"}`}>
                          ${(acc.balance ?? 0).toFixed(2)}
                        </td>
                        <td>
                          {acc.verified ? (
                            <CheckCircle size={12} className="text-neon-green" />
                          ) : (
                            <XCircle size={12} className="text-muted-foreground/40" />
                          )}
                        </td>
                        <td className="text-muted-foreground text-xs">{acc.country ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Proxy status */}
        {isRunning && (
          <div className="flex items-center gap-6 border border-border p-4">
            <p className="section-label">PROXY STATUS</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
              <span className="font-mono text-xs text-foreground">{progress?.activeProxyCount ?? 0} active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-red" />
              <span className="font-mono text-xs text-muted-foreground">{progress?.failedProxyCount ?? 0} failed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">
                {progress?.elapsedMs ? `${(progress.elapsedMs / 1000).toFixed(0)}s elapsed` : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

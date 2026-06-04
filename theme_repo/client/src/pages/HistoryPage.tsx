import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Trash2, ArrowRight, Download, History } from "lucide-react";

export default function HistoryPage() {
  const utils = trpc.useUtils();
  const { data: sessions, isLoading } = trpc.checker.listSessions.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const deleteMutation = trpc.checker.deleteSession.useMutation({
    onSuccess: () => {
      utils.checker.listSessions.invalidate();
      toast.success("Session deleted");
    },
  });

  const exportQuery = trpc.checker.exportValidAccounts.useQuery(
    { sessionId: 0 },
    { enabled: false }
  );

  const [exportingId, setExportingId] = useState<number | null>(null);

  const handleExport = async (sessionId: number) => {
    setExportingId(sessionId);
    try {
      const result = await utils.checker.exportValidAccounts.fetch({ sessionId });
      if (result.content) {
        const blob = new Blob([result.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `valid_accounts_session_${sessionId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${result.count} valid accounts`);
      } else {
        toast.warning("No valid accounts to export");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this session and all its data?")) {
      deleteMutation.mutate({ sessionId: id });
    }
  };

  const statusColor = (status: string) => {
    if (status === "running") return "text-neon-green border-neon-green";
    if (status === "completed") return "text-muted-foreground border-muted-foreground";
    if (status === "cancelled") return "text-neon-red border-neon-red";
    return "text-muted-foreground border-muted-foreground";
  };

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <p className="section-label mb-2">SESSION HISTORY</p>
          <h1 className="text-4xl font-black tracking-tight">
            ALL<br />
            <span className="text-neon-yellow">SESSIONS</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2">
            {sessions?.length ?? 0} sessions recorded
          </p>
        </div>

        {/* Table */}
        <div className="border border-border">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="font-mono text-xs text-muted-foreground animate-pulse">LOADING...</p>
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <History size={32} className="text-muted-foreground/30 mx-auto" />
              <p className="font-mono text-xs text-muted-foreground">NO SESSIONS YET</p>
              <Link href="/checker">
                <button className="brut-btn">START FIRST SESSION</button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="brut-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>SESSION NAME</th>
                    <th>STATUS</th>
                    <th>TOTAL</th>
                    <th>VALID</th>
                    <th>INVALID</th>
                    <th>ERRORS</th>
                    <th>BALANCE</th>
                    <th>RATE</th>
                    <th>CREATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => {
                    const rate = session.checkedAccounts > 0
                      ? ((session.validAccounts / session.checkedAccounts) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <tr key={session.id}>
                        <td className="text-muted-foreground font-mono">#{session.id}</td>
                        <td className="text-foreground font-bold max-w-[160px] truncate">
                          {session.sessionName}
                        </td>
                        <td>
                          <span className={`brut-tag ${statusColor(session.status)}`}>
                            {session.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-mono text-muted-foreground">{session.totalAccounts}</td>
                        <td className="font-mono text-neon-green font-bold">{session.validAccounts}</td>
                        <td className="font-mono text-neon-red">{session.invalidAccounts}</td>
                        <td className="font-mono text-muted-foreground">{session.errorAccounts}</td>
                        <td className="font-mono text-neon-yellow font-bold">
                          ${(session.totalBalance ?? 0).toFixed(2)}
                        </td>
                        <td className="font-mono text-muted-foreground">{rate}%</td>
                        <td className="font-mono text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Link href={`/session/${session.id}`}>
                              <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowRight size={12} />
                              </button>
                            </Link>
                            {session.validAccounts > 0 && (
                              <button
                                onClick={() => handleExport(session.id)}
                                disabled={exportingId === session.id}
                                className="p-1.5 text-neon-green hover:text-neon-green/70 transition-colors"
                              >
                                <Download size={12} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(session.id)}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 text-muted-foreground hover:text-neon-red transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {sessions && sessions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {[
              {
                label: "TOTAL SESSIONS",
                value: sessions.length,
                cls: "text-foreground",
              },
              {
                label: "TOTAL CHECKED",
                value: sessions.reduce((s, x) => s + x.checkedAccounts, 0).toLocaleString(),
                cls: "text-foreground",
                raw: true,
              },
              {
                label: "TOTAL VALID",
                value: sessions.reduce((s, x) => s + x.validAccounts, 0).toLocaleString(),
                cls: "text-neon-green",
                raw: true,
              },
              {
                label: "TOTAL BALANCE",
                value: `$${sessions.reduce((s, x) => s + (x.totalBalance ?? 0), 0).toFixed(2)}`,
                cls: "text-neon-yellow",
                raw: true,
              },
            ].map(item => (
              <div key={item.label} className="bg-background p-6">
                <p className="section-label mb-2">{item.label}</p>
                <p className={`font-mono font-black text-2xl ${item.cls}`}>
                  {item.raw ? item.value : (item.value as number).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

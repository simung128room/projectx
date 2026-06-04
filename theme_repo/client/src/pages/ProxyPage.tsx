import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Globe, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export default function ProxyPage() {
  const { data: proxyData, refetch, isRefetching } = trpc.proxy.getStats.useQuery(undefined, {
    refetchInterval: 15000,
  });
  const { data: proxyList } = trpc.proxy.getList.useQuery();

  const stats = proxyData?.stats ?? [];
  const totalProxies = proxyList?.total ?? 0;
  const activeCount = proxyData?.activeCount ?? 0;
  const failedCount = proxyData?.failedCount ?? 0;
  const unknownCount = totalProxies - stats.length;

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="section-label mb-2">PROXY NETWORK</p>
            <h1 className="text-4xl font-black tracking-tight">
              ROTATING<br />
              <span className="text-neon-blue">PROXIES</span>
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="brut-btn"
          >
            <RefreshCw size={12} className={isRefetching ? "animate-spin" : ""} />
            REFRESH
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { label: "TOTAL PROXIES", value: totalProxies, cls: "text-foreground" },
            { label: "ACTIVE", value: activeCount, cls: "text-neon-green" },
            { label: "FAILED", value: failedCount, cls: "text-neon-red" },
            { label: "UNTESTED", value: Math.max(0, unknownCount), cls: "text-muted-foreground" },
          ].map(item => (
            <div key={item.label} className="bg-background p-6">
              <p className="section-label mb-2">{item.label}</p>
              <p className={`font-mono font-black text-3xl ${item.cls}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Proxy table */}
        <div className="space-y-3">
          <p className="section-label">PROXY STATUS TABLE</p>
          <div className="border border-border overflow-auto">
            {stats.length === 0 ? (
              <div className="p-12 text-center">
                <Globe size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-mono text-xs text-muted-foreground">
                  No proxy usage data yet. Start a check session to populate.
                </p>
              </div>
            ) : (
              <table className="brut-table">
                <thead>
                  <tr>
                    <th>PROXY ADDRESS</th>
                    <th>STATUS</th>
                    <th>SUCCESS</th>
                    <th>FAILED</th>
                    <th>SUCCESS RATE</th>
                    <th>LAST USED</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(proxy => {
                    const total = proxy.successCount + proxy.failCount;
                    const rate = total > 0 ? ((proxy.successCount / total) * 100).toFixed(0) : "—";
                    return (
                      <tr key={proxy.id}>
                        <td className="font-mono text-xs text-foreground">{proxy.proxyAddress}</td>
                        <td>
                          <span className={`brut-tag ${
                            proxy.lastStatus === "active"
                              ? "text-neon-green border-neon-green"
                              : proxy.lastStatus === "failed"
                              ? "text-neon-red border-neon-red"
                              : "text-muted-foreground border-muted-foreground"
                          }`}>
                            {proxy.lastStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-neon-green font-mono">{proxy.successCount}</td>
                        <td className="text-neon-red font-mono">{proxy.failCount}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-track w-16">
                              <div
                                className="progress-fill"
                                style={{
                                  width: total > 0 ? `${(proxy.successCount / total) * 100}%` : "0%",
                                  background: Number(rate) > 50
                                    ? "var(--color-neon-green)"
                                    : "var(--color-neon-red)"
                                }}
                              />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{rate}%</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground font-mono text-xs">
                          {proxy.lastUsed
                            ? new Date(proxy.lastUsed).toLocaleTimeString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Full proxy list */}
        <div className="space-y-3">
          <p className="section-label">FULL PROXY LIST ({totalProxies})</p>
          <div className="border border-border p-4 max-h-64 overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {(proxyList?.proxies ?? []).map(proxy => {
                const stat = stats.find(s => s.proxyAddress === proxy);
                return (
                  <div key={proxy} className="flex items-center gap-1.5">
                    {stat?.lastStatus === "active" ? (
                      <CheckCircle size={10} className="text-neon-green flex-shrink-0" />
                    ) : stat?.lastStatus === "failed" ? (
                      <XCircle size={10} className="text-neon-red flex-shrink-0" />
                    ) : (
                      <Clock size={10} className="text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className="font-mono text-xs text-muted-foreground truncate">{proxy}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

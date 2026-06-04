import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Zap, ArrowRight, Clock, CheckCircle, XCircle, DollarSign, Globe, Activity } from "lucide-react";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === display) return;
    const diff = value - display;
    const step = Math.ceil(Math.abs(diff) / 20);
    const timer = setInterval(() => {
      setDisplay(prev => {
        const next = diff > 0 ? Math.min(prev + step, value) : Math.max(prev - step, value);
        if (next === value) clearInterval(timer);
        return next;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

export default function Dashboard() {
  const { data: globalStats, refetch: refetchStats } = trpc.stats.getGlobal.useQuery(undefined, {
    refetchInterval: 3000,
  });
  const { data: sessions } = trpc.checker.listSessions.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const { data: proxyData } = trpc.proxy.getStats.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const runningSession = sessions?.find(s => s.status === "running");
  const recentSessions = sessions?.slice(0, 5) ?? [];

  const totalChecked = Number(globalStats?.totalChecked ?? 0);
  const totalValid = Number(globalStats?.totalValid ?? 0);
  const totalBalance = Number(globalStats?.totalBalance ?? 0);
  const totalSessions = Number(globalStats?.totalSessions ?? 0);
  const successRate = totalChecked > 0 ? ((totalValid / totalChecked) * 100).toFixed(1) : "0.0";

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Hero header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="section-label mb-2">SYSTEM STATUS — OPERATIONAL</p>
            <h1 className="text-5xl font-black tracking-tight leading-none text-foreground">
              EXNESS<br />
              <span className="text-neon-green">KILLER</span>
            </h1>
            <p className="mt-3 font-mono text-sm text-muted-foreground max-w-md">
              High-performance account verification system. Concurrent checking with rotating proxy network.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            {runningSession ? (
              <Link href={`/session/${runningSession.id}`}>
                <button className="brut-btn brut-btn-success animate-pulse">
                  <Activity size={12} />
                  SESSION RUNNING
                  <ArrowRight size={12} />
                </button>
              </Link>
            ) : (
              <Link href="/checker">
                <button className="brut-btn brut-btn-primary">
                  <Zap size={12} />
                  NEW CHECK SESSION
                  <ArrowRight size={12} />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {/* Total Checked */}
          <div className="brut-card bg-background p-6">
            <p className="section-label mb-3">TOTAL CHECKED</p>
            <p className="stat-number text-4xl text-foreground">
              <AnimatedNumber value={totalChecked} />
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              across {totalSessions} sessions
            </p>
          </div>

          {/* Valid Accounts */}
          <div className="brut-card bg-background p-6">
            <p className="section-label mb-3">VALID ACCOUNTS</p>
            <p className="stat-number text-4xl text-neon-green">
              <AnimatedNumber value={totalValid} />
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              {successRate}% success rate
            </p>
          </div>

          {/* Total Balance */}
          <div className="brut-card bg-background p-6">
            <p className="section-label mb-3">TOTAL BALANCE</p>
            <p className="stat-number text-4xl text-neon-yellow">
              $<AnimatedNumber value={Math.floor(totalBalance)} />
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              across valid accounts
            </p>
          </div>

          {/* Proxy Network */}
          <div className="brut-card bg-background p-6">
            <p className="section-label mb-3">PROXY NETWORK</p>
            <p className="stat-number text-4xl text-neon-blue">
              <AnimatedNumber value={proxyData?.totalProxies ?? 66} />
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              {proxyData?.activeCount ?? 0} active / {proxyData?.failedCount ?? 0} failed
            </p>
          </div>
        </div>

        {/* Running session banner */}
        {runningSession && (
          <Link href={`/session/${runningSession.id}`}>
            <div className="border-2 border-neon-green p-4 flex items-center justify-between cursor-pointer hover:bg-neon-green/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="font-mono text-sm font-bold text-neon-green">ACTIVE SESSION</span>
                <span className="font-mono text-xs text-muted-foreground">— {runningSession.sessionName}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-xs text-muted-foreground">PROGRESS</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {runningSession.checkedAccounts}/{runningSession.totalAccounts}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-muted-foreground">VALID</p>
                  <p className="font-mono text-sm font-bold text-neon-green">{runningSession.validAccounts}</p>
                </div>
                <ArrowRight size={16} className="text-neon-green" />
              </div>
            </div>
          </Link>
        )}

        {/* Bottom grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="section-label">RECENT SESSIONS</p>
              <Link href="/history">
                <button className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  VIEW ALL <ArrowRight size={10} />
                </button>
              </Link>
            </div>
            <div className="border border-border">
              {recentSessions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-mono text-xs text-muted-foreground">NO SESSIONS YET</p>
                  <Link href="/checker">
                    <button className="brut-btn mt-4 text-xs">
                      <Zap size={10} />
                      START FIRST SESSION
                    </button>
                  </Link>
                </div>
              ) : (
                <table className="brut-table">
                  <thead>
                    <tr>
                      <th>SESSION</th>
                      <th>STATUS</th>
                      <th>CHECKED</th>
                      <th>VALID</th>
                      <th>BALANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map(session => (
                      <tr key={session.id} className="cursor-pointer" onClick={() => window.location.href = `/session/${session.id}`}>
                        <td className="text-foreground font-bold truncate max-w-[120px]">{session.sessionName}</td>
                        <td>
                          <span className={`brut-tag ${
                            session.status === "running" ? "text-neon-green border-neon-green" :
                            session.status === "completed" ? "text-muted-foreground" :
                            session.status === "cancelled" ? "text-neon-red border-neon-red" :
                            "text-muted-foreground"
                          }`}>
                            {session.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-muted-foreground">{session.checkedAccounts}/{session.totalAccounts}</td>
                        <td className="text-neon-green font-bold">{session.validAccounts}</td>
                        <td className="text-neon-yellow">${(session.totalBalance ?? 0).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <p className="section-label">SYSTEM INFO</p>
            <div className="border border-border divide-y divide-border">
              {[
                { label: "MAX CONCURRENCY", value: "50 threads", icon: Zap },
                { label: "PROXY POOL SIZE", value: `${proxyData?.totalProxies ?? 66} proxies`, icon: Globe },
                { label: "REQUEST TIMEOUT", value: "15 seconds", icon: Clock },
                { label: "CHECK METHOD", value: "Exness API v2", icon: Activity },
                { label: "VALID RATE (ALL TIME)", value: `${successRate}%`, icon: CheckCircle },
                { label: "TOTAL BALANCE FOUND", value: `$${totalBalance.toFixed(2)}`, icon: DollarSign },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <item.icon size={12} className="text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-6 flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Upload a <span className="text-foreground">email:password</span> .txt file to begin checking
          </p>
          <Link href="/checker">
            <button className="brut-btn brut-btn-primary">
              <Zap size={12} />
              LAUNCH CHECKER
              <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

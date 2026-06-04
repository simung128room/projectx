import { Link, useLocation } from "wouter";
import { LayoutDashboard, Zap, History, Globe, Terminal } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "DASHBOARD", icon: LayoutDashboard },
  { path: "/checker", label: "CHECKER", icon: Zap },
  { path: "/history", label: "HISTORY", icon: History },
  { path: "/proxies", label: "PROXIES", icon: Globe },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border flex-shrink-0">
        <div className="flex items-center h-14 px-6 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Terminal size={18} className="text-neon-green" />
            <span className="font-mono font-bold text-sm tracking-widest text-foreground">
              EXNESS<span className="text-neon-green">_</span>KILLER
            </span>
          </Link>

          <div className="h-4 w-px bg-border" />

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const isActive = item.path === "/"
                ? location === "/"
                : location.startsWith(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 ${
                      isActive
                        ? "text-background bg-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon size={12} />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              <span className="text-neon-green animate-blink">▮</span> ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

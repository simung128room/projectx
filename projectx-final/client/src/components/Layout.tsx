import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { LayoutDashboard, ShoppingBag, Wallet, Zap, History, Settings, LogOut, Terminal } from "lucide-react";
import { getLoginUrl } from "@/const";

const NAV_ITEMS = [
  { path: "/", label: "HOME", icon: LayoutDashboard },
  { path: "/shop", label: "SHOP", icon: ShoppingBag },
  { path: "/wallet", label: "WALLET", icon: Wallet },
  { path: "/tools", label: "TOOLS", icon: Zap },
  { path: "/checker-logs", label: "LOGS", icon: History },
];

const ADMIN_NAV_ITEMS = [
  { path: "/admin", label: "ADMIN", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border flex-shrink-0">
        <div className="flex items-center h-14 px-6 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Terminal size={18} className="text-neon-green" />
            <span className="font-mono font-bold text-sm tracking-widest text-foreground">
              PROJECT<span className="text-neon-green">X</span>
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

          {/* Admin nav (if user is admin) */}
          {isAuthenticated && user?.role === "admin" && (
            <>
              <div className="h-4 w-px bg-border" />
              <nav className="flex items-center gap-1">
                {ADMIN_NAV_ITEMS.map(item => {
                  const isActive = location.startsWith(item.path);
                  return (
                    <Link key={item.path} href={item.path}>
                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 ${
                          isActive
                            ? "text-background bg-neon-yellow"
                            : "text-neon-yellow hover:text-neon-green"
                        }`}
                      >
                        <item.icon size={12} />
                        {item.label}
                      </button>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 text-neon-red hover:text-neon-yellow"
                >
                  <LogOut size={12} />
                  LOGOUT
                </button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <button className="brut-btn brut-btn-primary text-xs">
                  LOGIN
                </button>
              </a>
            )}
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

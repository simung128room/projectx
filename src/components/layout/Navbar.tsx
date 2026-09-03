import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  Clock, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Menu, 
  X,
  LayoutDashboard,
  ShoppingBag,
  Gift,
  ChevronDown
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    user, 
    isLoggedIn, 
    logout, 
    theme, 
    setTheme, 
    setOpenTopUpModal,
    setAuthModalMode,
    setOpenCreateModal,
    activeRentals
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const activeRentCount = activeRentals.filter(r => r.status === 'active').length;

  // Streamlined, uncluttered 4 main nav items
  const mainNavItems = [
    { id: 'dashboard', label: 'Cloud AFK', icon: LayoutDashboard },
    { 
      id: 'marketplace', 
      label: 'ตลาดไอดี', 
      icon: ShoppingBag, 
      badge: activeRentCount > 0 ? `${activeRentCount} เช่าอยู่` : undefined 
    },
    { id: 'wallet', label: 'กระเป๋าเงิน', icon: Wallet },
    { id: 'history', label: 'ประวัติ', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentView(isLoggedIn ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden">
              <img 
                src="https://img2.pic.in.th/1000047587.png" 
                alt="MINICLOUD Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight font-prompt leading-none">
                MINICLOUD
              </div>
              <div className="text-[10px] text-neutral-400 font-medium mt-0.5">
                Cloud AFK & Market
              </div>
            </div>
          </button>

          {/* Desktop Nav Links - Clean & Minimal */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || (item.id === 'marketplace' && currentView === 'rentals');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Utility Bar */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Create Bot button */}
          {isLoggedIn && (
            <button
              onClick={() => setOpenCreateModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เริ่มบอท AFK</span>
            </button>
          )}

          {/* Wallet Balance Pill */}
          {isLoggedIn && (
            <button
              onClick={() => setOpenTopUpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white text-xs font-mono font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>{formatCurrency(user.walletBalance)}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold ml-0.5">+เติม</span>
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* User Profile / Auth Button */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <span className="text-xs font-semibold text-neutral-900 dark:text-white font-prompt hidden sm:inline">
                  {user.username}
                </span>
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-[11px] font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 pr-0.5" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141517] rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 z-50 text-xs"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="w-full px-3 py-2 rounded-xl text-left font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>ข้อมูลบัญชี</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('redeem')}
                    className="w-full px-3 py-2 rounded-xl text-left font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>แลกโค้ด / ซองของขวัญ</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('games')}
                    className="w-full px-3 py-2 rounded-xl text-left font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🎮</span>
                    <span>เกมที่รองรับทั้งหมด</span>
                  </button>
                  <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                  <button
                    onClick={logout}
                    className="w-full px-3 py-2 rounded-xl text-left font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode('login');
                setCurrentView('auth');
              }}
              className="px-4 py-1.5 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-xs"
            >
              เข้าสู่ระบบ
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-2xl flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer - Clean & Simple */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-[#09090b] space-y-1 text-xs">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-2xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

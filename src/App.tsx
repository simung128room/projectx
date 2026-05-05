import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Gamepad2, ListChecks, Play, Square, Check, X, Shield, Terminal, CheckCircle2, 
  Home, ShoppingCart, CreditCard, Phone, Upload, Key, Crown, LogOut, User, Gift, Lock,
  FileImage, Database, Globe, BarChart3, Settings, Activity, FileText, 
  AlertTriangle, Download, ChevronRight, Trash2, ShieldAlert, Plus, Ban, History, Search, Copy, Menu, Server, Package, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { supabase as auth } from './lib/supabase'; // auth here refers to supabase

axios.interceptors.request.use(async (config) => {
  const { data: { session } } = await auth.auth.getSession();
  if (session?.access_token) {
    try {
      const token = session.access_token;
      config.headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Error fetching token:', err);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
import jsQR from 'jsqr';

type SupabaseUser = any;
import { Turnstile } from '@marsidev/react-turnstile';
import { AccountResult, LogEntry, UserPlan } from './types';
import { ProfileView } from './components/ProfileView';
import { CategoriesView } from './components/CategoriesView';
import { KeyModal } from './components/modals/KeyModal';
import { AuthView } from './components/AuthView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { HomeView } from './components/HomeView';
import { ProductDetailView } from './components/ProductDetailView';
import { PageView } from './components/PageView';
import { HistoryLogsView } from './components/HistoryLogsView';
import { ContentFeedView } from './components/ContentFeedView';
import { AIChatView } from './components/AIChatView';
import { WalletView } from './components/WalletView';
import { RedeemKeyView } from './components/RedeemKeyView';
import { HistoryView } from './components/HistoryView';
import { CategoryProductsView } from './components/CategoryProductsView';
import { PopupBanner } from './components/PopupBanner';
import { Product, SiteStats, Category } from './types';
import { getAvatarUrl } from './lib/avatar';
import { ContactView } from './components/ContactView';


var TextPaint = `▒▄▀▄▒█▀▄▒██▀░▀▄▀
2
░█▀█░█▀▒░█▄▄░█▒█`;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  AUTH = 'auth'
}

function ElapsedTimeDisplay({ running, startTime }: { running: boolean, startTime: number | null }) {
  const [elapsedTime, setElapsedTime] = useState('00:00:00.000');

  useEffect(() => {
    let timer: any;
    if (running && startTime) {
      timer = setInterval(() => {
        const now = performance.now();
        const diff = now - startTime;
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        const ms = Math.floor(diff % 1000).toString().padStart(3, '0');
        setElapsedTime(`${hours}:${minutes}:${seconds}.${ms}`);
      }, 67);
    }
    return () => clearInterval(timer);
  }, [running, startTime]);

  if (elapsedTime === '00:00:00.000') return null;
  return (
    <div className="px-3 py-1 bg-zinc-50 rounded-full border border-zinc-200 text-xs font-mono text-zinc-600 font-bold">
      {elapsedTime}
    </div>
  );
}

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [siteSettings, setSiteSettings] = useState({ 
    site_name: 'APEX STUDIO',
    truewallet_phone: '0951378403',
    contact_line: '@apex_studio',
    popup_enabled: false,
    popup_img_url: '',
    popup_link: '',
    stats_users_offset: 1250,
    stats_sales_offset: 0
  });

  // Home Store State (Moved up to prevent TDZ)
  const defaultProducts: Product[] = [];

  const [products, setProducts] = useState<Product[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats>({ users: 0, stock: 0, sales: 0, topups: 0 });
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  const [threads, setThreads] = useState(5);
  const [firebaseKeys, setFirebaseKeys] = useState<any[]>([]);
  const [usedKeysHistory, setUsedKeysHistory] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<string>('overview');
  const [isIPBlocked, setIsIPBlocked] = useState(false);
  const [lastUsageDate, setLastUsageDate] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Navigation State
  const [activeView, setRawActiveView] = useState<'home' | 'categories' | 'category_products' | 'dashboard' | 'admin' | 'profile' | 'logs' | 'history' | 'settings' | 'ai_chat' | 'free_stuff' | 'premium_stuff' | 'contact' | 'login' | 'signup' | 'wallet' | 'redeem' | 'product_detail' | 'custom_page'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  const setActiveView = useCallback((view: any) => {
    if (activeView === view) return;
    setIsPageTransitioning(true);
    setTimeout(() => {
      setRawActiveView(view);
      setIsPageTransitioning(false);
    }, 600);
  }, [activeView]);

  const handleAdminLogin = useCallback((username: string) => {
    setIsAdmin(true);
    setAdminUsername(username);
    setUser({ id: 'admin', email: 'admin_apex@apex-studio.com', user_metadata: { name: 'Admin Apex' } } as any);
    setUserPlan({ username: 'Admin Apex', isPremium: true, premiumExpireDate: new Date(Date.now() + 86400000 * 365).toISOString(), balance: 9999999 } as any);
    setRawActiveView('home'); // Send admin to home or keep them wherever, but enable menus.
  }, []);
  const prevViewRef = useRef(activeView);

  useEffect(() => {
    if (prevViewRef.current !== activeView) {
      setIsPageTransitioning(true);
      const timer = setTimeout(() => {
        setIsPageTransitioning(false);
      }, 700);
      prevViewRef.current = activeView;
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }, [isAdmin]);

  const [combo, setCombo] = useState('');
  const comboRef = useRef('');
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const [validAccounts, setValidAccounts] = useState<AccountResult[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [totalChecked, setTotalChecked] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logDivRef = useRef<HTMLDivElement>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingTurnstileToken, setPendingTurnstileToken] = useState<string | null>(null);
  const [savedLinesToCheck, setSavedLinesToCheck] = useState<string[]>([]);
  const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
  const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : '0x4AAAAAADDurF1TEj8IRq9g';

  function handleDbError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: (window as any)._user?.id,
      },
      operationType,
      path
    };
    console.error('Database Error: ', JSON.stringify(errInfo));
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const [vipTab, setVipTab] = useState<'key'>('key');

  const [purchaseHistory, setPurchaseHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('apex_purchase_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [topupHistory, setTopupHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('apex_topup_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  useEffect(() => { localStorage.setItem('apex_topup_history', JSON.stringify(topupHistory.slice(0, 50))); }, [topupHistory]);

  const handlePurchase = async (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      Swal.fire({
        icon: 'error',
        title: 'สินค้าไม่เพียงพอ',
        text: 'สินค้าหน้านี้มีสต๊อกไม่พอสำหรับจำนวนที่คุณต้องการ',
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    const totalPrice = product.price * quantity;

    if (!userPlan || (userPlan.balance || 0) < totalPrice) {
      Swal.fire({
        icon: 'error',
        title: 'ยอดเงินไม่เพียงพอ',
        text: `กรุณาเติมเงินก่อนทำการสั่งซื้อสินค้า (ยอดรวม: ฿${totalPrice.toLocaleString()})`,
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    // Compute stock data and secrets BEFORE state update
    let currentStockData = product.stockData ? [...product.stockData] : [];
    let aggregatedSecrets: string[] = [];
    
    for (let i = 0; i < quantity; i++) {
      let secretData = `APEX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      if (currentStockData.length > 0) {
        secretData = currentStockData.shift() as string;
      }
      aggregatedSecrets.push(secretData);
    }

    const newHistoryItem = {
      id: Math.random().toString(36).substring(7),
      username: userPlan?.username || user?.email?.split('@')[0] || 'Unknown',
      productId: product.id,
      productName: `${product.name} (x${quantity})`,
      price: totalPrice,
      secretData: aggregatedSecrets.join('\n'),
      date: new Date().toISOString(),
      billNumber: 'B-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
      is_special: false
    };

    const updatedProductData = { 
      ...product, 
      stock: product.stock > 0 ? product.stock - quantity : 0, 
      stockData: currentStockData 
    };

    setProducts(prevProducts => prevProducts.map(p => p.id === product.id ? updatedProductData : p));

    // Async sync with backend
    if (updatedProductData) {
      try {
         await axios.put(`/api/products/${(updatedProductData as Product).id}`, updatedProductData);
      } catch (err) {
         console.warn("Failed to sync purchase with backend products DB:", err);
      }
    }

    // Deduct balance
    const newBalance = Math.max(0, (userPlan.balance || 0) - totalPrice);
    const updatedPlan = { ...userPlan, balance: newBalance };
    setUserPlan(updatedPlan);
    
    // Server-side balance sync if user logged in
    if (user) {
      await syncUserPlan(updatedPlan, user.uid);
    }
    
    // Add to history
    setPurchaseHistory(prev => [newHistoryItem, ...prev]);

    // Async sync with purchases backend
    axios.post('/api/purchases', newHistoryItem).catch(err => {
      console.warn("Failed to sync purchase record:", err);
    });

    // Create and auto download TXT file of purchased items, if quantity > 1
    if (quantity > 1) {
      const blob = new Blob([aggregatedSecrets.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `apex_order_${product.id}_x${quantity}_${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }

    // Update site stats for admin
    setSiteStats(prev => ({...prev, sales: prev.sales + totalPrice, stock: Math.max(0, prev.stock - quantity)}));

    // Show success and redirect
    if (quantity === 1) {
      setPurchasedItemReceipt({
        ...newHistoryItem,
        title: 'สั่งซื้อสำเร็จ',
        icon: ShoppingCart,
        bg: 'bg-emerald-500',
        color: 'text-white'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'สั่งซื้อสำเร็จ!',
        text: 'ระบบได้ดาวน์โหลดไฟล์คีย์/ข้อมูลสินค้าให้ท่านอัตโนมัติ (และสามารถตรวจสอบย้อนหลังได้ที่ประวัติการสั่งซื้อ)',
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        setActiveView('history');
      });
    }
  };

  const [isDBReady, setIsDBReady] = useState(false);
  const [dbErrorDetail, setDbErrorDetail] = useState<string | null>(null);
  const [purchasedItemReceipt, setPurchasedItemReceipt] = useState<any>(null);

  // Product + Stats loaders - No localStorage fallback, trust API
  useEffect(() => {
  }, []);

  const syncUserPlan = useCallback(async (newPlan: UserPlan | null, uid: string) => {
    if (!newPlan || !uid) return;
    try {
      await axios.post(`/api/users/${uid}`, newPlan);
    } catch (err) {
      console.error("Failed to sync user plan:", err);
    }
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    const { data: { subscription } } = auth.auth.onAuthStateChange(async (event, session) => {
const currentUser: any = session?.user || null;
if (currentUser) currentUser.uid = currentUser.id;
      setUser(currentUser);
      
      if (currentUser && !currentUser.isAnonymous && currentUser.email) {
        try {
          // Fetch user plan from backend
          const res = await axios.get(`/api/users/${currentUser.uid}`);
          if (res.data) {
            setUserPlan(res.data);
          } else {
            // First time user registration on backend
            const initialPlan = {
              username: currentUser.displayName || currentUser.email.split('@')[0],
              isPremium: false,
              premiumExpireDate: null,
              balance: 0,
              email: currentUser.email,
              role: currentUser.email === 'admin_apex@apex-studio.com' ? 'Admin' : 'Member'
            };
            setUserPlan(initialPlan);
            await axios.post(`/api/users/${currentUser.uid}`, initialPlan);
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
             const initialPlan = {
              username: currentUser.displayName || currentUser.email.split('@')[0],
              isPremium: false,
              premiumExpireDate: null,
              balance: 0,
              email: currentUser.email,
              role: currentUser.email === 'admin_apex@apex-studio.com' ? 'Admin' : 'Member'
            };
            setUserPlan(initialPlan);
            try {
              await axios.post(`/api/users/${currentUser.uid}`, initialPlan);
            } catch (postErr) {
              console.error("Failed to create initial user plan:", postErr);
            }
          } else {
            console.error("Auth sync error:", err);
          }
        }
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      console.log("Fetching all data from backend...");
      
      const fetchWithCatch = async (url: string) => {
        try {
          const res = await axios.get(url);
          return { data: res.data, error: null };
        } catch (e: any) {
          const errorMsg = e.response?.data?.error || e.message;
          console.error(`Fetch ERROR for ${url}:`, errorMsg);
          return { data: null, error: errorMsg };
        }
      };

      const [healthRes, keysRes, historyRes, ipsRes, settingsRes, productsRes, pagesRes, categoriesRes, statsRes, purchasesRes, topupsRes, usersRes] = await Promise.all([
        fetchWithCatch('/api/health'),
        fetchWithCatch('/api/license_keys'),
        fetchWithCatch('/api/used_keys'),
        fetchWithCatch('/api/blocked_ips'),
        fetchWithCatch('/api/settings'),
        fetchWithCatch('/api/products'),
        fetchWithCatch('/api/pages'),
        fetchWithCatch('/api/categories'),
        fetchWithCatch('/api/stats'),
        fetchWithCatch('/api/purchases'),
        fetchWithCatch('/api/topups'),
        fetchWithCatch('/api/users')
      ]);

      const healthData = healthRes.data;
      const keysData = keysRes.data;
      const historyData = historyRes.data;
      const ipsData = ipsRes.data;
      const settingsData = settingsRes.data;
      const productsData = productsRes.data;
      const pagesData = pagesRes.data;
      const categoriesData = categoriesRes.data;
      const statsData = statsRes.data;
      const purchasesData = purchasesRes.data;
      const topupsData = topupsRes.data;
      const usersData = usersRes.data;

      if (keysData) setFirebaseKeys(keysData);
      if (historyData) setUsedKeysHistory(historyData);
      if (ipsData) setBlockedIPs(ipsData);
      if (settingsData) setSiteSettings(settingsData);
      if (Array.isArray(productsData)) setProducts(productsData.length > 0 ? productsData : defaultProducts);
      if (Array.isArray(pagesData)) setCustomPages(pagesData);
      else if (pagesData && pagesData.data && Array.isArray(pagesData.data)) setCustomPages(pagesData.data);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
      if (statsData) setSiteStats({ users: statsData.users, stock: statsData.stock, sales: statsData.sales, topups: statsData.totalTopupsAmount });
      if (Array.isArray(purchasesData) && purchasesData.length > 0) setPurchaseHistory(purchasesData);
      if (Array.isArray(topupsData) && topupsData.length > 0) setTopupHistory(topupsData);
      if (Array.isArray(usersData)) setUsersList(usersData);
      
      if (!healthRes.error && !productsRes.error) {
        setIsDBReady(true);
        setDbErrorDetail(null);
      } else {
        setIsDBReady(false);
        if (healthRes.error) {
          let errorMsg: string = "Unknown Error";
          if (healthRes.error) {
            if (typeof healthRes.error === 'object') {
              errorMsg = (healthRes.error as any).message || JSON.stringify(healthRes.error);
            } else {
              errorMsg = String(healthRes.error);
            }
          }
          setDbErrorDetail(`Backend API ไม่ตอบสนอง (Offline): ${errorMsg}`);
        } else {
          setDbErrorDetail(`Firebase Error: ${productsRes.error || "Products DB Sync failed"}`);
        }
      }
    } catch (err: any) {
      console.error("Critical fetch error:", err);
    }
  }, []);

  // Backend API Listeners
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 5000);
    return () => clearInterval(timer);
  }, [fetchAllData]);

  // Check if current IP is blocked (from backend)
  useEffect(() => {
    if (!clientIp) return;
    const checkIP = async () => {
      try {
        const res = await axios.get(`/api/check_ip/${clientIp}`);
        if (res.data.blocked) {
          setIsIPBlocked(true);
        }
      } catch (err) {
        console.error("Error checking IP status:", err);
      }
    };
    checkIP();
  }, [clientIp]);

  // Load Data by IP
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        const ip = data.ip;
        setClientIp(ip);
        
        const savedCombo = localStorage.getItem(`checker_combo_${ip}`);
        const savedValid = localStorage.getItem(`checker_valid_${ip}`);
        const savedInvalid = localStorage.getItem(`checker_invalid_${ip}`);
        const savedTotal = localStorage.getItem(`checker_total_${ip}`);
        const savedLogs = localStorage.getItem(`checker_logs_${ip}`);
        const savedUserPlan = localStorage.getItem(`checker_userplan_${ip}`);
        const savedDailyUsage = localStorage.getItem(`checker_usage_${ip}`);
        const savedLastDate = localStorage.getItem(`checker_lastdate_${ip}`);

        const todayDate = new Date().toISOString().slice(0, 10);
        if (savedLastDate === todayDate) {
          setDailyUsage(Number(savedDailyUsage) || 0);
        } else {
          setDailyUsage(0);
        }
        setLastUsageDate(todayDate);

        if (savedUserPlan) setUserPlan(JSON.parse(savedUserPlan));

        if (savedCombo) setCombo(savedCombo);
        if (savedValid) setValidAccounts(JSON.parse(savedValid));
        if (savedInvalid) setInvalidCount(Number(savedInvalid));
        if (savedTotal) setTotalChecked(Number(savedTotal));
        
        if (savedLogs && JSON.parse(savedLogs).length > 0) {
          setLogs(JSON.parse(savedLogs));
        } else {
          console.log("Welcome to APEX STUDIO System");
          setLogs([{
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString('th-TH'),
            text: 'System Ready - Backend connected.',
            iconName: 'check',
            colorClass: 'text-green-500'
          }]);
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        setClientIp('offline_local');
        console.error("IP Check Failed", err);
        setIsLoaded(true);
      });
  }, []);

  // Sync combo to ref for high-speed access
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    if (running) {
      setStartTime(performance.now());
    } else {
      setStartTime(null);
    }
  }, [running]);

  // Save Data by IP (Logs and temporary stuff only)
  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_combo_${clientIp}`, combo);
  }, [combo, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_logs_${clientIp}`, JSON.stringify(logs.slice(-100))); // Keep last 100
  }, [logs, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_usage_${clientIp}`, dailyUsage.toString());
  }, [dailyUsage, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_lastdate_${clientIp}`, lastUsageDate);
  }, [lastUsageDate, isLoaded, clientIp]);

  // No superficial security - focus on data integrity instead
  useEffect(() => {
    // F12 blocks are easily bypassed, removed for better developer experience
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logDivRef.current) {
      logDivRef.current.scrollTop = logDivRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (text: string, iconName: string, colorClass: string = 'text-gray-300') => {
    setLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString('th-TH'),
        text,
        iconName,
        colorClass,
      }
    ]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const redeemKey = async (keyInput: string, usernameInput: string = 'ผู้ใช้งานทั่วไป') => {
    if (!keyInput) return;
    try {
      Swal.fire({
        title: 'กำลังตรวจสอบ...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: '#09090b',
        color: '#fff'
      });

      const keyResponse = await axios.get(`/api/validate_key/${keyInput.trim()}`);
      const keyData = keyResponse.data;

      if (keyData && keyData.status === 'active') {
        // 1. Mark key as used in backend
        await axios.patch(`/api/license_keys/${keyData.id}`, { status: 'used' });

        // 2. Add to history in backend
        await axios.post(`/api/used_keys`, {
          key: keyInput,
          ip: clientIp || 'Unknown',
          details: `Redeemed ${keyData.type} plan`
        });

        // 3. Update User Plan locally
        let days = 1;
        if (keyData.type === 'Week') days = 7;
        if (keyData.type === 'Month') days = 30;
        if (keyData.type === '3Month') days = 90;
        if (keyData.type === 'Year') days = 365;
        if (keyData.type === 'Lifetime') days = 9999;
        
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days);
        const newPlan = { ...userPlan, username: usernameInput, isPremium: true, premiumExpireDate: expireDate.toISOString() };
        setUserPlan(newPlan);
        
        if (user) {
          await syncUserPlan(newPlan, user.uid);
        }

        if (!user) {
          try {
            await auth.auth.signInAnonymously(); const error = null;
            if (error) console.error("Error signing in anonymously:", error);
          } catch (err) {
            console.error("Exception signing in anonymously:", err);
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'ยินดีด้วย!',
          text: `คุณได้รับสิทธิ์ระดับ ${keyData.type} เรียบร้อยแล้ว`,
          background: '#09090b',
          color: '#fff'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'กุญแจถูกใช้งานแล้ว',
          text: 'รหัสที่คุณกรอกถูกใช้งานไปก่อนหน้านี้แล้ว',
          background: '#09090b',
          color: '#fff'
        });
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบกุญแจนี้',
          text: 'รหัสที่คุณกรอกอาจจะผิด หรือถูกใช้งานไปแล้ว',
          background: '#09090b',
          color: '#fff'
        });
      } else {
        handleDbError(err, OperationType.WRITE, 'license_keys');
        Swal.fire('Error', 'การสื่อสารล้มเหลว: ' + (err.message || 'Unknown error'), 'error');
      }
    }
  };
  const handleLogoClick = () => {
    setActiveView('login');
  };



  const handleLogout = async () => {
    try {
      await auth.auth.signOut();
    } catch(err) {
      console.error("Logout error:", err);
    }
    setUserPlan(null);
    setUser(null);
    setActiveView('home');
    Swal.fire({
      icon: 'info',
      title: 'ออกจากระบบแล้ว',
      timer: 1500,
      showConfirmButton: false,
      background: '#09090b',
      color: '#fff'
    });
  };

  const resendVerification = async () => {
    if (user && !user.emailVerified && user.email) {
      try {
        await sendEmailVerification(user); const error = null;
        if (error) throw error;
        
        Swal.fire({
          icon: 'success',
          title: 'APEX STUDIO',
          text: 'ส่งลิงก์ยืนยันอีเมลเรียบร้อยแล้ว กรุณาตรวจสอบในกล่องข้อความของคุณ',
          background: '#ffffff',
          color: '#18181b',
          confirmButtonColor: '#ef4444'
        });
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'APEX STUDIO',
          text: err.message || 'เกิดข้อผิดพลาดในการส่งอีเมล',
          background: '#ffffff',
          color: '#18181b',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const addLicenseKey = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'สร้างคีย์ใหม่',
      html:
        '<select id="swal-input1" class="swal2-input bg-white border-zinc-200 text-zinc-900 w-full">' +
        '<option value="Day">1 วัน (Day)</option>' +
        '<option value="Week">7 วัน (Week)</option>' +
        '<option value="Month">1 เดือน (Month)</option>' +
        '<option value="3Month">3 เดือน (3 Months)</option>' +
        '<option value="Year">1 ปี (Year)</option>' +
        '<option value="Lifetime">ถาวร (Lifetime)</option>' +
        '</select>' +
        '<input id="swal-input2" class="swal2-input bg-white border-zinc-200 text-zinc-900 w-full" placeholder="จำนวนคีย์ (1-50)" type="number" value="1">',
      focusConfirm: false,
      background: '#ffffff',
      color: '#18181b',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLSelectElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    });

    if (formValues) {
      const [type, countStr] = formValues;
      const count = parseInt(countStr) || 1;
      
      try {
        const newKeys = [];
        for (let i = 0; i < count; i++) {
          const newKey = 'APEX-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          newKeys.push({
            key: newKey,
            plan: type,
            status: 'active',
            created_at: new Date().toISOString()
          });
        }
        await axios.post(`/api/license_keys/bulk`, { keys: newKeys });
        Swal.fire('สำเร็จ', `สร้างคีย์ ${count} รายการ สำเร็จ`, 'success');
      } catch (err) {
        handleDbError(err, OperationType.WRITE, 'license_keys');
        Swal.fire('Error', 'ไม่สามารถสร้างคีย์ได้: ' + (err as Error).message, 'error');
      }
    }
  };

  const blockIP = async () => {
    const { value: ipData } = await Swal.fire({
      title: 'บล็อค IP ผู้ใช้',
      html:
        '<input id="swal-ip" class="swal2-input bg-white border-zinc-200 text-zinc-900 w-full" placeholder="IP Address เช่น 1.1.1.1">' +
        '<input id="swal-reason" class="swal2-input bg-white border-zinc-200 text-zinc-900 w-full" placeholder="เหตุผลการบล็อค">',
      focusConfirm: false,
      background: '#ffffff',
      color: '#18181b',
      preConfirm: () => {
        return [
          (document.getElementById('swal-ip') as HTMLInputElement).value,
          (document.getElementById('swal-reason') as HTMLInputElement).value
        ]
      }
    });

    if (ipData) {
      const [ip, reason] = ipData;
      if (!ip) return;
      try {
        await axios.post(`/api/blocked_ips`, {
          ip,
          reason: reason || 'Violation of terms'
        });
        Swal.fire('สำเร็จ', `บล็อค IP ${ip} สำเร็จ`, 'success');
      } catch (err) {
        handleDbError(err, OperationType.WRITE, 'blocked_ips');
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบล็อคได้: ' + (err as Error).message, 'error');
      }
    }
  };

  const deleteKey = async (keyId: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณกำลังลบคีย์ " + keyId,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'ลบออก',
      background: '#ffffff',
      color: '#18181b'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/license_keys/${keyId}`);
        Swal.fire('ลบแล้ว', 'คีย์ถูกลบออกจากระบบแล้ว', 'success');
        setFirebaseKeys(prev => prev.filter(k => k.id !== keyId));
      } catch (err) {
        handleDbError(err, OperationType.DELETE, 'license_keys/' + keyId);
        Swal.fire('ข้อผิดพลาด', 'ลบไม่สำเร็จ: ' + (err as Error).message, 'error');
      }
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      await axios.delete(`/api/blocked_ips/${ip}`);
      Swal.fire('สำเร็จ', 'ปลดบล็อค IP เรียบร้อย', 'success');
      setBlockedIPs(prev => prev.filter(i => i.ip !== ip));
    } catch (err) {
      handleDbError(err, OperationType.DELETE, 'blocked_ips/' + ip);
      Swal.fire('ข้อผิดพลาด', 'ไม่สำเร็จ: ' + (err as Error).message, 'error');
    }
  };

  const checkSingle = async (acc: string, pass: string, index: number, cToken?: string | null) => {
    try {
      setTotalChecked(prev => prev + 1);
      addLog(`[${index+1}] กำลังทำ DataDome Bypass...`, 'shield', 'text-amber-400');
      
      const response = await axios.post(`/api/check`, { 
        account: acc, 
        password: pass,
        turnstileToken: cToken
      });
      const result = response.data;

      if (result.success) {
        addLog(`[${index+1}] SSO Authenticated! กำลังดึงข้อมูลเกม...`, 'key', 'text-cyan-400');
        const newResult: AccountResult = {
          ...result.data,
          cleanAt: new Date().toLocaleDateString('th-TH'),
          skins: result.data.skins || 0
        };
        
        setValidAccounts(prev => [newResult, ...prev]);
        addLog(`[${index+1}] สำเร็จ: ${acc} [UID: ${newResult.uid} | CODM Level: ${newResult.level}]`, 'check-circle', 'text-green-400 font-bold');
      } else {
        setInvalidCount(prev => prev + 1);
        let errorMsg = result.error || 'Check failed';
        if (typeof errorMsg === 'object') {
          try {
            errorMsg = JSON.stringify(errorMsg);
          } catch(e) {
            errorMsg = String(errorMsg);
          }
        }
        addLog(`[${index+1}] ไม่ผ่าน: ${acc} (${errorMsg})`, 'x', 'text-red-400');
      }
    } catch (err: any) {
      setInvalidCount(prev => prev + 1);
      console.error(`Check failed for ${acc}:`, err);
      let errMsg = err.response?.data?.error || err.message;
      if (typeof errMsg === 'object') {
        try {
          errMsg = JSON.stringify(errMsg);
        } catch(e) {
          errMsg = String(errMsg);
        }
      }
      addLog(`[${index+1}] ระบบขัดข้อง: ${acc} (${errMsg})`, 'x', 'text-red-500 font-bold');
    }
  };

  const startCheck = async () => {
    if (running) return;
    const text = comboRef.current;
    if (!text.trim()) {
      Swal.fire({ title: 'ข้อผิดพลาด', text: 'ไม่มี Combo', icon: 'error' });
      return;
    }

    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.includes(':'));
    if (lines.length === 0) {
      Swal.fire({ title: 'ข้อผิดพลาด', text: 'รูปแบบข้อมูลไม่ถูกต้อง (ต้องมี : )', icon: 'error' });
      return;
    }

    if (!user) {
      Swal.fire({ 
        title: 'ต้องเข้าสู่ระบบ', 
        text: 'กรุณาเข้าสู่ระบบก่อนเริ่มการทำงาน', 
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'เข้าสู่ระบบ'
      }).then((res) => {
        if (res.isConfirmed) setActiveView('login');
      });
      return;
    }

    const MAX_DAILY = 1000;
    const isPremium = userPlan?.isPremium;
    let linesToCheck = lines;

    if (!isPremium) {
      const remaining = MAX_DAILY - dailyUsage;
      if (remaining <= 0) {
        Swal.fire({ title: 'โควต้าเต็ม', text: 'คุณใช้งานครบ 1000 บรรทัดสำหรับวันนี้แล้ว โปรดอัปเกรด VIP เพื่อใช้งานไม่จำกัด', icon: 'error' });
        return;
      }
      if (lines.length > remaining) {
        linesToCheck = lines.slice(0, remaining);
        Swal.fire({ 
          title: 'จำกัดจำนวน (ผู้ใช้ฟรี)', 
          text: `คุณตรวจสอบได้อีก ${remaining} บรรทัดในวันนี้ ระบบจะทำการตรวจสอบเพียง ${remaining} บรรทัดแรก`, 
          icon: 'warning'
        });
      }
    }

    setSavedLinesToCheck(linesToCheck);
    
    // Always show Turnstile modal to fetch a real token, even for premium (Turnstile is invisible for good users)
    setPendingTurnstileToken(null);
    setShowTurnstileModal(true);
  };

  const executeCheck = async (token: string, linesArg: string[] = savedLinesToCheck) => {
    setRunning(true);
    runningRef.current = true;
    setValidAccounts([]);
    setInvalidCount(0);
    setTotalChecked(0);
    
    addLog(`เริ่มตรวจสอบ... ทั้งหมด ${linesArg.length} รายการ [DataDome Bypass: ACTIVE] Threads: ${threads}`, 'terminal', 'text-cyan-400');

    const pool = [...linesArg];
    let active = 0;
    
    const worker = async () => {
      while (pool.length > 0 && runningRef.current) {
        const line = pool.shift();
        if (!line) break;
        const index = linesArg.indexOf(line);
        let acc = '';
        let pass = '';
        const firstColon = line.indexOf(':');
        if (firstColon !== -1) {
          const parts = line.split(':');
          if (parts.length >= 3 && parts[1].includes('@')) {
             acc = parts[1];
             const secondColon = line.indexOf(':', firstColon + 1);
             pass = line.substring(secondColon + 1);
          } else {
             acc = parts[0];
             pass = line.substring(firstColon + 1);
          }
        }
        
        if (acc && pass) {
          active++;
          await checkSingle(acc.trim(), pass.trim(), index, token);
          if (!userPlan?.isPremium) {
            setDailyUsage(prev => prev + 1);
          }
          active--;
        }
      }
    };

    const workers = [];
    for (let i = 0; i < Math.min(threads, linesArg.length); i++) {
      workers.push(worker());
    }

    await Promise.all(workers);
    
    setRunning(false);
    runningRef.current = false;
    addLog('ตรวจสอบเสร็จสิ้น', 'check', 'text-green-400 font-bold');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'รองรับเฉพาะไฟล์ .txt เท่านั้น',
        icon: 'error'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCombo(prev => prev ? prev + '\n' + text : text);
      Swal.fire({
        title: 'สำเร็จ',
        text: 'นำเข้าข้อมูลจากไฟล์ .txt สำเร็จ',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const stopCheck = () => {
    if (!running) return;
    setRunning(false);
    runningRef.current = false;
    addLog('⛔ หยุดตามคำสั่ง', 'square', 'text-orange-400');
  };

  const clearLog = () => {
    setLogs([]);
  };

  const downloadFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportClean = () => {
    const data = validAccounts.filter(a => a.isClean);
    if (!data.length) return Swal.fire({ title: 'ข้อมูล', text: 'ไม่พบบัญชีปกติ (Clean)', icon: 'info' });
    downloadFile(`Clean_Accounts_${new Date().toISOString().slice(0, 10)}.txt`, data.map(a => `${a.account}:${a.password}`).join('\n'));
    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกไฟล์สำเร็จ', icon: 'success' });
  };

  const exportBound = () => {
    const data = validAccounts.filter(a => !a.isClean);
    if (!data.length) return Swal.fire({ title: 'ข้อมูล', text: 'ไม่พบบัญชีเชื่อมโยง (Bound)', icon: 'info' });
    downloadFile(`Bound_Accounts_${new Date().toISOString().slice(0, 10)}.txt`, data.map(a => `${a.account}:${a.password}`).join('\n'));
    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกไฟล์สำเร็จ', icon: 'success' });
  };

  const exportRov = () => {
    const data = validAccounts.filter(a => a.hasRov);
    if (!data.length) return Swal.fire({ title: 'ข้อมูล', text: 'ไม่พบบัญชี ROV', icon: 'info' });
    downloadFile(`ROV_Accounts_${new Date().toISOString().slice(0, 10)}.txt`, data.map(a => `${a.account}:${a.password} | Char: ${a.rovCharacter} | ${a.rovClean ? 'Clean' : 'Bound'}`).join('\n'));
    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกไฟล์สำเร็จ', icon: 'success' });
  };

  const exportAllValid = () => {
    if (!validAccounts.length) return Swal.fire({ title: 'คำเตือน', text: 'ไม่มีข้อมูลบัญชีที่ผ่าน', icon: 'warning' });
    const text = validAccounts.map(a => 
      `Account: ${a.account}:${a.password}\n` +
      `UID: ${a.uid} | Region: ${a.region} | Shells: ${a.shells}\n` +
      `Level: ${a.level} | Rank: ${a.rank} | Skins: ${a.skins}\n` +
      `Status: ${a.isClean ? 'Clean' : 'Bound'} | CODM: ${a.hasCodm ? 'Yes' : 'No'}\n` +
      `Security: Phone Bound:${a.phoneBound ? 'Yes' : 'No'} | Email:${a.emailVerified ? 'Verified' : 'Not Verified'} | FB:${a.fbLinked ? 'Yes' : 'No'}\n` +
      `Other Games: ${a.otherGames.join(', ') || 'None'}\n` +
      `Checked At: ${a.cleanAt}\n` +
      `------------------------------------------`
    ).join('\n');
    downloadFile(`All_Valid_Detailed_${new Date().toISOString().slice(0, 10)}.txt`, text);
    Swal.fire({ title: 'สำเร็จ', text: 'บันทึกไฟล์รายละเอียดสำเร็จ', icon: 'success' });
  };

  const downloadValidDetail = () => {
    if (!validAccounts.length) return Swal.fire({ title: 'ข้อมูล', text: 'ไม่มีข้อมูลบัญชีที่ผ่าน', icon: 'info' });
    const content = JSON.stringify(validAccounts, null, 2);
    downloadFile(`Apex_Database_Export_${new Date().toISOString().slice(0, 10)}.json`, content);
    Swal.fire({
      title: 'สำเร็จ',
      text: 'ส่งออกฐานข้อมูลสำเร็จ',
      icon: 'success',
      background: '#09090b',
      color: '#fff'
    });
  };



  if (isIPBlocked) return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-red-500 mb-4 uppercase tracking-tighter">Access Revoked</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
           ที่อยู่ IP ของคุณ ({clientIp}) ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEX STUDIO
        </p>
        <div className="bg-black/50 rounded-2xl p-4 text-[10px] text-zinc-500 font-mono mb-8">
           Error Code: APEX_SECURITY_BLOCK_L4
        </div>
        <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl text-xs font-bold transition-all">
           TRY RECONNECTING
        </button>
      </div>
    </div>
  );

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 font-sans">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-zinc-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="Logo" className="w-10 h-10 object-contain absolute opacity-70 grayscale brightness-0" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-zinc-900 text-lg font-bold tracking-widest animate-pulse">กำลังโหลดข้อมูล...</div>
        <div className="text-zinc-400 text-xs font-medium tracking-wider uppercase">APEX STUDIO</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-900 font-sans selection:bg-cyan-500/30 flex relative">
      <PopupBanner 
        enabled={siteSettings?.popup_enabled ?? false} 
        imgUrl={siteSettings?.popup_img_url ?? ''} 
        linkUrl={siteSettings?.popup_link ?? ''} 
      />
      {/* Page Transition Overlay */}
      {isPageTransitioning && (
        <div className="fixed inset-0 z-[200] bg-zinc-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 border-[3px] border-zinc-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-24 h-24 border-[3px] border-t-zinc-800 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="Logo" className="w-12 h-12 object-contain absolute opacity-70 grayscale brightness-0" />
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-black text-zinc-800 tracking-tight animate-pulse">กำลังโหลดข้อมูล...</h2>
              <p className="text-zinc-500 text-sm font-medium mt-1">โปรดรอสักครู่</p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Minimal) */}
      <aside className="hidden lg:flex flex-col w-72 fixed h-screen top-0 left-0 bg-white border-r border-zinc-200 z-40 p-6 overflow-y-auto">
         <div className="mb-10 flex items-center justify-center">
            <img 
              src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" 
              alt="APEX STUDIO TH" 
              className="h-9 object-contain cursor-pointer active:scale-95 transition-transform select-none drop-shadow-sm brightness-0" 
              onClick={handleLogoClick}
            />
         </div>
         <div className="flex-1 space-y-1">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 pl-3">เมนูหลัก</div>
            <button onClick={() => setActiveView('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'home' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
              <Home className="w-5 h-5"/> หน้าแรก
            </button>
            <button onClick={() => { setActiveView('categories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'categories' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
              <ShoppingCart className="w-5 h-5"/> สินค้าทั้งหมด
            </button>
            {user && (
              <>
                <button onClick={() => setActiveView('wallet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'wallet' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                  <Wallet className="w-5 h-5"/> เติมเงิน
                </button>
                <button onClick={() => setActiveView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'history' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                  <History className="w-5 h-5"/> ประวัติการสั่งซื้อ
                </button>
              </>
            )}
            <button onClick={() => { setActiveView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'contact' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
              <Phone className="w-5 h-5"/> ติดต่อปัญหา
            </button>

            {(user && customPages && customPages.length > 0) && (
              <>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-6 mb-3 pl-3">หน้าอื่นๆ</div>
                {customPages.map(page => (
                  <button 
                    key={page.id}
                    onClick={() => {
                      setSelectedPage(page);
                      setActiveView('custom_page');
                    }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'custom_page' && selectedPage?.id === page.id ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
                  >
                    <FileText className="w-5 h-5"/> {page.title}
                  </button>
                ))}
              </>
            )}

            {user && (
              <>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 mt-10 pl-3">เครื่องมืออื่นๆ</div>
                {isAdmin && (
                  <button onClick={() => setActiveView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'}`}>
                    <ShieldAlert className="w-5 h-5"/> จัดการหลังบ้าน
                  </button>
                )}
                <button onClick={() => setActiveView('redeem')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'redeem' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                  <Key className="w-5 h-5"/> เปิดใช้งานคีย์
                </button>
                <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'dashboard' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                   <Gamepad2 className="w-5 h-5" /> ตรวจสอบไอดี
                </button>
                <button onClick={() => setActiveView('ai_chat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'ai_chat' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                   <Server className="w-5 h-5" /> คุยกับไอเอ๋อ (AI)
                </button>
                <button onClick={() => setActiveView('free_stuff')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'free_stuff' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                   <Gift className="w-5 h-5" /> แจกของฟรี
                </button>
                <button onClick={() => setActiveView('premium_stuff')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'premium_stuff' ? 'bg-amber-100 text-amber-800' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'}`}>
                   <Crown className="w-5 h-5" /> ของเติมของโคตรดี!!
                </button>
              </>
            )}
         </div>

         {/* Bottom User Profile */}
         <div className="pt-6 border-t border-zinc-100 mt-6 flex flex-col gap-3 shrink-0">
           {user ? (
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 bg-zinc-50 p-4 rounded-3xl border border-zinc-200">
                 <div className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={getAvatarUrl(userPlan?.username || user?.email?.split('@')[0] || 'guest')} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                 <div className="flex flex-col truncate flex-1 leading-tight">
                   {userPlan?.isPremium && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5"><Crown className="w-3 h-3 inline mr-1 -mt-0.5"/>PREMIUM</span>}
                   <span className="text-sm font-bold text-zinc-900 truncate">{user.isAnonymous ? 'ผู้ใช้งานทั่วไป' : user.email}</span>
                   <span className="text-xs text-zinc-600 flex items-center gap-1 font-sans font-bold mt-0.5"><Wallet className="w-3 h-3"/> ฿{userPlan?.balance ? userPlan.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</span>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setActiveView('profile')} className="py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-2xl text-xs font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-colors flex items-center justify-center gap-2"><Settings className="w-4 h-4"/>โปรไฟล์</button>
                 <button onClick={handleLogout} className="py-2.5 bg-white border border-zinc-200 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2"><LogOut className="w-4 h-4"/>ออก</button>
               </div>
             </div>
           ) : (
             <div className="flex flex-col gap-2">
               <button onClick={() => setActiveView('login')} className="w-full py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-colors shadow-m">เข้าสู่ระบบ</button>
               <button onClick={() => setActiveView('signup')} className="w-full py-3.5 bg-white border border-zinc-200 text-zinc-900 rounded-2xl text-sm font-bold hover:bg-zinc-50 transition-colors">สมัครสมาชิก</button>
             </div>
           )}
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0 overflow-x-hidden relative">
        {/* Mobile Top Navbar */}
        <nav className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 h-[72px] flex items-center justify-between px-4 sm:px-6 overflow-hidden">
          <img 
            src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" 
            alt="APEX STUDIO TH" 
            className="h-8 sm:h-10 object-contain cursor-pointer brightness-0 shrink-0" 
            onClick={() => setActiveView('home')}
          />
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
              onClick={() => setActiveView('search')} 
              className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 active:scale-95 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => user ? setActiveView('profile') : setActiveView('login')} 
              className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 active:scale-95 transition-all overflow-hidden"
            >
              {user ? (
                <img 
                  src={getAvatarUrl(encodeURIComponent(userPlan?.username || user?.email?.split('@')[0] || 'guest'))} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
                  <User className="w-5 h-5" />
                </div>
              )}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white active:scale-95 transition-all shadow-sm"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed top-0 left-0 h-[100dvh] w-[280px] bg-white border-r border-zinc-200 shadow-2xl z-50 flex flex-col"
              >
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between min-h-[72px]">
                  <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="APEX STUDIO TH" className="h-8 object-contain brightness-0" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center text-zinc-400 bg-zinc-50 rounded-xl hover:bg-zinc-100 hover:text-zinc-600 active:scale-95 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 flex flex-col gap-2 flex-1 overflow-y-auto pt-2 scrollbar-none">
                  {!user && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button onClick={() => { setActiveView('login'); setIsMobileMenuOpen(false); }} className="py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-m">เข้าสู่ระบบ</button>
                      <button onClick={() => { setActiveView('signup'); setIsMobileMenuOpen(false); }} className="py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-50 transition-colors">สมัครสมาชิก</button>
                    </div>
                  )}

                  <div className="py-2">
                    <div className="flex items-center gap-3 mb-2 px-2">
                      <div className="flex-1 h-px bg-zinc-200"></div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center shrink-0">เมนูหลัก</p>
                      <div className="flex-1 h-px bg-zinc-200"></div>
                    </div>
                    <button onClick={() => { setActiveView('home'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'home' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                      <Home className="w-4 h-4"/> หน้าแรก
                    </button>
                    <button onClick={() => { setActiveView('categories'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'categories' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                      <ShoppingCart className="w-4 h-4"/> สินค้าทั้งหมด
                    </button>
                    {user && (
                      <>
                        <button onClick={() => { setActiveView('wallet'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'wallet' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                          <Wallet className="w-4 h-4"/> เติมเงิน
                        </button>
                        <button onClick={() => { setActiveView('history'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'history' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                          <History className="w-4 h-4"/> ประวัติการสั่งซื้อ
                        </button>
                      </>
                    )}
                    <button onClick={() => { setActiveView('contact'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'contact' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                      <Phone className="w-4 h-4"/> ติดต่อปัญหา
                    </button>
                  </div>

                  {(user && customPages && customPages.length > 0) && (
                    <div className="py-2 border-t border-zinc-50">
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="flex-1 h-px bg-zinc-200"></div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center shrink-0">หน้าอื่นๆ</p>
                        <div className="flex-1 h-px bg-zinc-200"></div>
                      </div>
                      {customPages.map(page => (
                        <button 
                          key={page.id}
                          onClick={() => {
                            setSelectedPage(page);
                            setActiveView('custom_page');
                            setIsMobileMenuOpen(false);
                          }} 
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'custom_page' && selectedPage?.id === page.id ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
                        >
                          <FileText className="w-4 h-4"/> {page.title}
                        </button>
                      ))}
                    </div>
                  )}
                
                  {user && (
                    <div className="py-2 border-t border-zinc-50">
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="flex-1 h-px bg-zinc-200"></div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center shrink-0">เครื่องมือ</p>
                        <div className="flex-1 h-px bg-zinc-200"></div>
                      </div>
                      <button onClick={() => { setActiveView('redeem'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'redeem' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                        <Key className="w-4 h-4"/> เปิดใช้งานคีย์
                      </button>
                      <button onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'dashboard' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                         <Gamepad2 className="w-4 h-4" /> ตรวจสอบไอดี
                      </button>
                      <button onClick={() => { setActiveView('free_stuff'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'free_stuff' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                         <Gift className="w-4 h-4" /> แจกของฟรี
                      </button>
                      <button onClick={() => { setActiveView('premium_stuff'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'premium_stuff' ? 'bg-amber-100 text-amber-800' : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'}`}>
                         <Crown className="w-4 h-4" /> ของเติมของโคตรดี!!
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setActiveView('admin'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'admin' ? 'bg-red-50 text-red-600' : 'text-red-600 hover:bg-red-50 hover:text-red-700'}`}>
                          <ShieldAlert className="w-4 h-4"/> จัดการหลังบ้าน
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {user && (
                  <div className="p-4 border-t border-zinc-100 space-y-3">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-red-600/20">
                        <img 
                          src={getAvatarUrl(encodeURIComponent(userPlan?.username || user?.email?.split('@')[0] || 'guest'))} 
                          alt="avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-zinc-900 truncate uppercase tracking-tight">{user.isAnonymous ? 'ผู้ใช้งานทั่วไป' : (userPlan?.username || user.email?.split('@')[0])}</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">฿{userPlan?.balance ? userPlan.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</p>
                      </div>
                      <button 
                        onClick={() => { setActiveView('profile'); setIsMobileMenuOpen(false); }}
                        className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all active:scale-95"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
                    >
                       <LogOut className="w-4 h-4" />
                       ออกจากระบบ
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Verification Banner Removed */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24 w-full flex-1 flex flex-col">
        {activeView === 'categories' && (
          <CategoriesView 
            categories={categories}
            products={products}
            onBack={() => setActiveView('home')}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('category_products');
            }}
          />
        )}

        {activeView === 'category_products' && selectedCategory && (
          <CategoryProductsView 
            category={selectedCategory}
            categories={categories}
            products={products}
            onBack={() => setActiveView('categories')}
            onProductClick={(id) => {
              setSelectedProductId(id);
              setActiveView('product_detail');
            }}
          />
        )}

        {activeView === 'home' && (
          <HomeView 
            products={products} 
            categories={categories}
            stats={siteStats} 
            user={user} 
            purchaseHistory={purchaseHistory} 
            setActiveView={setActiveView} 
            onProductClick={(id) => {
              setSelectedProductId(id);
              setActiveView('product_detail');
            }} 
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveView('category_products');
            }}
          />
        )}

        {activeView === 'product_detail' && selectedProductId && (
          <ProductDetailView
            product={products.find(p => p.id === selectedProductId)!}
            user={user}
            onBack={() => setActiveView('home')}
            handlePurchase={async (p, q) => {
              await handlePurchase(p, q);
            }}
            setActiveView={setActiveView}
          />
        )}

        {activeView === 'contact' && <ContactView onBack={() => setActiveView('home')} facebookLink={siteSettings?.contact_line} />}
        {activeView === 'custom_page' && selectedPage && (
          <PageView 
            page={selectedPage} 
            onBack={() => setActiveView('home')} 
          />
        )}

        {activeView === 'login' && <AuthView initialMode="login" setActiveView={setActiveView} onAdminLogin={handleAdminLogin} />}
        {activeView === 'signup' && <AuthView initialMode="signup" setActiveView={setActiveView} />}

        {activeView === 'profile' && (
          <ProfileView 
            user={user} 
            userPlan={userPlan} 
            setUserPlan={setUserPlan} 
            clientIp={clientIp} 
            setActiveView={setActiveView} 
            handleLogout={handleLogout} 
          />
        )}

        {activeView === 'ai_chat' && <AIChatView />}
        {activeView === 'logs' && <HistoryLogsView usedKeysHistory={usedKeysHistory} purchaseHistory={purchaseHistory} />}
        {activeView === 'history' && <HistoryView purchaseHistory={purchaseHistory} topupHistory={topupHistory} usedKeysHistory={usedKeysHistory} />}
        {activeView === 'wallet' && <WalletView userPlan={userPlan} setUserPlan={setUserPlan} userId={user?.uid} onTopupSuccess={(entry) => {
           setTopupHistory(prev => [entry, ...prev]);
           setSiteStats(prev => ({...prev, topups: (prev.topups || 0) + (entry.amount || entry.money || 0)}));
        }} />}
        {activeView === 'free_stuff' && <ContentFeedView type="free" isAdmin={isAdmin} isPremiumUser={userPlan?.isPremium || false} />}
        {activeView === 'premium_stuff' && <ContentFeedView type="premium" isAdmin={isAdmin} isPremiumUser={userPlan?.isPremium || false} />}

        {activeView === 'admin' && isAdmin && (
          <AdminDashboard
            totalChecked={totalChecked}
            validAccounts={validAccounts}
            firebaseKeys={firebaseKeys}
            usedKeysHistory={usedKeysHistory}
            blockedIPs={blockedIPs}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            isDBReady={isDBReady}
            dbErrorDetail={dbErrorDetail}
            adminUsername={adminUsername}
            setIsAdmin={setIsAdmin}
            addLicenseKey={addLicenseKey}
            blockIP={blockIP}
            deleteKey={deleteKey}
            unblockIP={unblockIP}
            products={products}
            setProducts={setProducts}
            siteStats={siteStats}
            setSiteStats={setSiteStats}
            customPages={customPages}
            setCustomPages={setCustomPages}
            categories={categories}
            setCategories={setCategories}
            usersList={usersList}
            onRefreshData={fetchAllData}
          />
        )}

        {activeView === 'redeem' && (
          <RedeemKeyView 
            redeemKey={redeemKey} 
            userEmail={user?.email || 'Guest'}
            isLoggedIn={!!user}
            onLoginClick={() => setActiveView('login')}
            onBack={() => setActiveView('home')} 
            onGoToStore={() => {
              setActiveView('home');
              setTimeout(() => {
                const element = document.getElementById('products');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          />
        )}

        {activeView === 'dashboard' && (
          <>
            {/* Minimal Dashboard Header */}
            <div className="mb-8 relative rounded-3xl bg-white border border-zinc-100 shadow-sm overflow-hidden flex flex-col items-center justify-center py-16 text-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-32 bg-red-50 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="px-4 py-1.5 rounded-full border border-red-100 bg-red-50 text-xs font-bold text-red-600 tracking-widest uppercase flex items-center gap-2 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  System Online
                </div>
                
                <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight select-none">
                  ระบบตรวจสอบไอดี
                </h1>
                
                <p className="mt-4 text-sm text-zinc-600 bg-zinc-50 px-6 py-2 rounded-full border border-zinc-200 inline-block font-medium">
                  ระบบตรวจสอบด้วยความแม่นยำสูง
                </p>
              </div>
            </div>

            {/* Top Stats Row (Minimal Style) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">สำเร็จ (VALID)</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{validAccounts.length}</span>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">ไม่ผ่าน (INVALID)</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{invalidCount}</span>
                </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">ปกติ (CLEAN)</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{validAccounts.filter(a => a.isClean).length}</span>
                </div>
              </div>
            </div>

            <div className="flex mb-8">
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
                <Gamepad2 className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">CODM: {validAccounts.filter(a => a.hasCodm).length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Gamepad2 className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">ROV</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{validAccounts.filter(a => a.hasRov).length}</span>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">ROV CLEAN</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{validAccounts.filter(a => a.hasRov && a.rovClean).length}</span>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                  <X className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">ROV NOT CLEAN</span>
                  <span className="text-3xl font-black text-zinc-900 leading-none">{validAccounts.filter(a => a.hasRov && !a.rovClean).length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Combo & Controls */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Input Card */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-lg font-bold flex items-center gap-3 text-zinc-900">
                        นำข้อมูลเข้าสู่ระบบ
                      </h2>
                      <span className="bg-zinc-100 px-3 py-1 rounded-full text-xs text-red-600 font-bold">
                        {combo.trim() ? combo.trim().split('\n').length : 0} รายการ
                      </span>
                    </div>
                    
                    <div className="flex grid grid-cols-2 gap-3 relative z-10 w-full">
                      <button 
                        onClick={async () => {
                          const { value: url } = await Swal.fire({
                            title: 'ดึงข้อมูลจาก URL',
                            input: 'url',
                            inputPlaceholder: 'https://pastebin.com/raw/...',
                            showCancelButton: true,
                            confirmButtonText: 'ดึงข้อมูล',
                            cancelButtonText: 'ยกเลิก'
                          });
                          if (url) {
                            try {
                              Swal.showLoading();
                              const res = await axios.get(url);
                              if (res.data) {
                                setCombo(res.data);
                                Swal.close();
                                Swal.fire({
                                   title: 'สำเร็จ', 
                                   text: `ดึงข้อมูลสำเร็จ ${res.data.trim().split('\n').length} รายการ`, 
                                   icon: 'success',
                                   timer: 2000
                                });
                              }
                            } catch (err) {
                              Swal.fire('ล้มเหลว', 'ไม่สามารถเชื่อมต่อ URL ได้', 'error');
                            }
                          }
                        }} 
                        className="bg-zinc-50 hover:bg-zinc-100 py-3 rounded-2xl border border-zinc-200 text-[11px] font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all w-full"
                      >
                        <Home className="w-4 h-4" /> ดึงจากแพลตฟอร์ม
                      </button>
                      
                      <label className="cursor-pointer bg-red-50 hover:bg-red-100 py-3 rounded-2xl border border-red-200 text-[11px] font-bold text-red-600 flex items-center justify-center gap-2 transition-all w-full">
                        <Upload className="w-4 h-4" /> อัปโหลดไฟล์ (.txt)
                        <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} ref={fileInputRef} />
                      </label>
                    </div>
                  </div>

                  <div className="relative z-10 mb-6">
                    <textarea
                      value={combo}
                      onChange={(e) => setCombo(e.target.value)}
                      rows={12}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-sm font-mono text-zinc-900 focus:border-red-400 focus:ring-1 focus:ring-red-400/30 outline-none resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-300 placeholder:text-zinc-400 h-[280px]"
                      placeholder="user:pass&#10;user|pass"
                      spellCheck="false"
                    />
                  </div>

                  <div className="flex flex-col gap-3 relative z-10 pt-2 border-t border-zinc-100 mt-2">
                    <button
                      onClick={startCheck}
                      disabled={running}
                      className="w-full bg-red-600 text-white hover:bg-red-500 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/20"
                    >
                      <Play className="w-5 h-5 flex-shrink-0" fill="currentColor" /> เริ่มตรวจสอบ
                    </button>
                    <button
                      onClick={stopCheck}
                      disabled={!running}
                      className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Square className="w-4 h-4" fill="currentColor" /> โหมดยกเลิก
                    </button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                  <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Download className="w-4 h-4" /> ส่งออกผลลัพธ์
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 pb-3">
                      <button onClick={exportClean} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"><Shield className="w-3.5 h-3.5" /> บันทึกปกติ</button>
                      <button onClick={exportBound} className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5" /> บันทึกมีเชื่อม</button>
                    </div>
                    <button onClick={exportRov} className="bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 py-3 rounded-2xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-1.5 shadow-sm mb-3">
                      <Gamepad2 className="w-4 h-4" /> บันทึก ROV (ทั้งหมด)
                    </button>
                    <button onClick={exportAllValid} className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-1.5 shadow-sm">
                      <ListChecks className="w-4 h-4" /> บันทึกทั้งหมด (ALL VALID)
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Panel: Terminal Log & Results */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 sm:p-7 h-[450px] flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Terminal className="w-64 h-64 text-zinc-900" />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-5 border-b border-zinc-100 gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg flex items-center gap-3 text-zinc-900">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center">
                          <Terminal className="text-zinc-500 w-4 h-4" />
                        </div>
                        บันทึกเรียลไทม์
                      </h3>
                      <div className="flex items-center gap-2">
                        <ElapsedTimeDisplay running={running} startTime={startTime} />
                        <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[10px] font-bold text-red-600 uppercase tracking-widest">
                          Secured Mode
                        </div>
                      </div>
                    </div>
                    <button onClick={clearLog} className="px-4 py-2 bg-white hover:bg-zinc-50 rounded-full text-xs font-bold text-zinc-500 transition-colors border border-zinc-200 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> ล้างข้อความ
                    </button>
                  </div>
                  
                  <div ref={logDivRef} className="flex-1 bg-zinc-50 border border-zinc-200 p-6 rounded-2xl text-[13px] font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-300">
                    {logs.length === 0 && (
                      <div className="text-zinc-400 flex flex-col items-center justify-center h-full gap-4 opacity-70">
                        <Terminal className="w-12 h-12" />
                        <span>ระบบพร้อมทำงาน รอรับข้อมูล...</span>
                      </div>
                    )}
                    {logs.map(log => {
                      // Adjust log colors for light mode
                      let lightModeColor = 'text-zinc-600';
                      if(log.colorClass.includes('emerald') || log.colorClass.includes('green')) lightModeColor = 'text-emerald-600';
                      else if (log.colorClass.includes('red')) lightModeColor = 'text-red-500';
                      else if (log.colorClass.includes('cyan') || log.colorClass.includes('amber')) lightModeColor = 'text-amber-500';

                      return (
                        <div key={log.id} className={`${lightModeColor} mb-2 flex items-start gap-3 break-all whitespace-pre-wrap leading-relaxed`}>
                          <span className="shrink-0 text-zinc-400 font-medium">[{log.time}]</span>
                          <span className="flex-1">
                            <div className="flex items-start">
                              {log.iconName === 'shield' && <Shield className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'terminal-pulse' && <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 animate-pulse mt-1" />}
                              {log.iconName === 'terminal' && <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'check-circle' && <CheckCircle2 className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'x' && <X className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'check' && <Check className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'square' && <Square className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              {log.iconName === 'crown' && <Crown className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                              <span className="flex-1 font-medium">{log.text}</span>
                            </div>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {validAccounts.length > 0 && (
                  <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-5 border-b border-zinc-100">
                      <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        ผลลัพธ์ที่สำเร็จ
                        <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold ml-2 border border-zinc-200">{validAccounts.length}</span>
                      </h3>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 pr-3">
                      {validAccounts.map((acc, idx) => (
                        <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-5 hover:border-emerald-200 transition-all hover:bg-white relative overflow-hidden group hover:shadow-md hover:shadow-black/5">
                      
                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Check className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-white inline-block px-2 py-0.5 rounded-md border border-zinc-100 mb-1">UID: {acc.uid} | {acc.region}</div>
                            <div className="text-zinc-900 font-bold font-mono text-base sm:text-lg">
                               {acc.account} {acc.codmNickname && acc.codmNickname !== 'N/A' && <span className="text-blue-500 ml-2">({acc.codmNickname})</span>}
                             </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(`${acc.account}:${acc.password}`);
                               Swal.fire({
                                 toast: true,
                                 position: 'top-end',
                                 icon: 'success',
                                 title: 'คัดลอกบัญชีแล้ว!',
                                 showConfirmButton: false,
                                 timer: 1500,
                                 background: '#10b981',
                                 color: '#fff'
                               });
                             }}
                             className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2"
                           >
                             <Copy className="w-3 h-3" /> คัดลอก
                           </button>
                           <div className="px-3 py-1.5 bg-white rounded-xl border border-zinc-200 text-[11px] text-zinc-700 font-mono font-bold shadow-sm">PASS: {acc.password}</div>
                           <div className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[11px] font-black italic">LV. {acc.level}</div>
                           <div className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[11px] font-black uppercase">{acc.rank}</div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-zinc-200 py-4 relative z-10 bg-white/50 px-2 rounded-xl">
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">สถานะไอดี</div>
                          {acc.isClean ? 
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> CLEAN (ปกติ)</span> : 
                            <span className="text-xs text-amber-600 font-bold flex items-center gap-1.5">
                              🔗 BOUND (
                                {[
                                  acc.emailVerified ? 'Email' : null,
                                  acc.phoneBound ? 'Phone' : null,
                                  acc.fbLinked ? 'Facebook' : null,
                                  acc.idCardBound ? 'ID Card' : null
                                ].filter(Boolean).join(', ') || 'Connected'}
                              )
                            </span>
                          }
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">ID Card / Phone</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${(acc.idCardBound || acc.phoneBound) ? 'text-amber-500' : 'text-zinc-500'}`}>
                             {acc.idCardBound ? 'ID CARD BOUND' : (acc.phoneBound ? 'PHONE BOUND' : 'NOT BOUND')}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Email Verified</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${acc.emailVerified ? 'text-emerald-500' : 'text-zinc-500'}`}>
                             {acc.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Facebook</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${acc.fbLinked ? 'text-blue-500' : 'text-zinc-500'}`}>
                             {acc.fbLinked ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
                          </span>
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="text-[10px] text-zinc-500 font-bold mr-1">เกมอื่นๆ:</div>
                           {acc.otherGames.length > 0 ? acc.otherGames.map((g, gi) => (
                             <span key={gi} className="px-2 py-0.5 bg-white text-zinc-600 rounded-md text-[9px] border border-zinc-200 uppercase font-bold">{g}</span>
                           )) : <span className="text-[9px] text-zinc-400 italic">ไม่พบประวัติเกมอื่น</span>}
                           {acc.hasCodm && (
                             <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[9px] font-bold uppercase flex items-center gap-1"><Gamepad2 className="w-2.5 h-2.5" /> CODM ACTIVE</span>
                           )}
                           {acc.hasRov && (
                             <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
                               <Gamepad2 className="w-2.5 h-2.5" /> ROV ACTIVE
                               {acc.rovCharacter && acc.rovCharacter !== 'N/A' && ` - ${acc.rovCharacter}`}
                             </span>
                           )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono bg-white border border-zinc-200 px-2 py-1 rounded-md">
                          Checked: {acc.cleanAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pb-6 w-full text-[10px] text-zinc-400 font-medium">
          <div className="flex items-center gap-2">
            <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt={siteSettings.site_name} className="h-4 object-contain brightness-0 hover:opacity-50 transition-opacity cursor-pointer" />
            <p>&copy; {new Date().getFullYear()} {siteSettings.site_name} TH. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-zinc-800 transition-colors">นโยบายความเป็นส่วนตัว</button>
            <span className="text-zinc-200 hidden sm:inline">•</span>
            <button onClick={() => setShowTerms(true)} className="hover:text-zinc-800 transition-colors">ข้อกำหนดการใช้งาน</button>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-zinc-900 flex items-center gap-2">
              <Shield className="w-6 h-6 shrink-0 text-red-500" /> นโยบายความเป็นส่วนตัว (Privacy Policy)
            </h2>
            <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-600 scrollbar-thin scrollbar-thumb-zinc-300 flex-1">
              <p><strong>อัปเดตล่าสุด:</strong> 25 เมษายน 2569</p>
              
              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ไม่มีข้อมูล Combo (อีเมล:รหัสผ่าน) ถูกส่งไปยังเซิร์ฟเวอร์ใด ๆ</li>
                  <li>การตรวจสอบทั้งหมดทำงานแบบ Client-Side (ในเบราว์เซอร์ของคุณเท่านั้น)</li>
                  <li>ไม่มี Cookie, Local Storage, หรือ Session Storage ที่เก็บข้อมูลสำคัญ</li>
                  <li>ข้อมูลทั้งหมดจะหายไปเมื่อคุณปิดหรือรีเฟรชหน้าเว็บ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-2">2. การใช้งานข้อมูล</h3>
                <p>ข้อมูลที่คุณวางในช่อง Combo จะถูกใช้เพื่อการจำลองการตรวจสอบบัญชี <strong>ภายในเบราว์เซอร์ของคุณเท่านั้น</strong> และจะไม่ถูกเก็บหรือส่งต่อไปยังบุคคลที่สาม</p>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-2">3. การรักษาความปลอดภัย</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ใช้มาตรการ Anti-DevTools เพื่อป้องกันการดึงข้อมูล</li>
                  <li>ปิดการใช้งาน Right-Click และ Keyboard Shortcuts ที่อาจเปิดเผยโค้ด</li>
                  <li>ไม่มีการเชื่อมต่ออินเทอร์เน็ตเมื่อทำการตรวจสอบ (ยกเว้นโหลดไลบรารี)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-2">4. สิทธิของผู้ใช้</h3>
                <p className="mb-1">คุณมีสิทธิ์ที่จะ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>หยุดการตรวจสอบได้ตลอดเวลา</li>
                  <li>ลบข้อมูลทั้งหมดโดยการรีเฟรชหน้าเว็บ</li>
                  <li>ไม่ให้ข้อมูล Combo หากไม่ต้องการ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-2">5. ข้อจำกัดความรับผิดชอบ</h3>
                <p className="text-red-500 mb-2 font-medium">เครื่องมือนี้เป็นเครื่องมือจำลอง (Simulation Tool) เพื่อการศึกษาเท่านั้น ไม่มีส่วนเกี่ยวข้องกับเครือข่ายเซิร์ฟเวอร์ใด ๆ อย่างเป็นทางการ</p>
                <p>ผู้พัฒนาไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดจากการใช้งาน</p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-100 text-right">
              <button 
                onClick={() => setShowPrivacy(false)} 
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-8 rounded-2xl transition-colors w-full sm:w-auto"
              >
                เข้าใจและยอมรับ
              </button>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm font-sans animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-900">
              <ListChecks className="w-6 h-6 shrink-0 text-red-500" /> ข้อกำหนดการใช้งาน
            </h2>
            <div className="space-y-4 text-sm text-zinc-600">
              <p>1. เครื่องมือนี้ใช้เพื่อการศึกษา อย่างปลอดภัย และตรวจสอบสถานะบัญชีของตนเองที่ได้รับอนุญาตเท่านั้น</p>
              <p>2. ห้ามนำไปใช้ในทางที่ผิดกฎหมายหรือละเมิดสิทธิของผู้อื่น</p>
              <p>3. ผู้ใช้ต้องรับผิดชอบต่อผลจากการใช้งานเครื่องมือนี้ด้วยตนเอง</p>
              <p>4. ผู้พัฒนาไม่รับประกันความถูกต้อง 100% ของผลการตรวจสอบ (เป็นการจำลอง)</p>
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mt-6">
                <p className="text-red-600 font-bold">5. การใช้งานอาจขัดกับข้อกำหนดการให้บริการของแพลตฟอร์มปลายทาง</p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-zinc-100 text-right">
              <button 
                onClick={() => setShowTerms(false)} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-2xl transition-colors w-full sm:w-auto"
              >
                ยอมรับข้อกำหนด
              </button>
            </div>
          </div>
        </div>
      )}

      <KeyModal
        show={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        vipTab={vipTab}
        redeemKey={redeemKey}
        userEmail={user?.email}
      />

      {/* Turnstile Modal */}
      {showTurnstileModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[70] backdrop-blur-sm font-sans animate-in zoom-in-95 duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl mb-2 flex items-center justify-center w-full h-[80px] overflow-hidden">
              <div className="h-[65px] w-full max-w-[300px] overflow-hidden flex items-start justify-center">
                {TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => {
                      setPendingTurnstileToken(token);
                      setShowTurnstileModal(false);
                      executeCheck(token, savedLinesToCheck).catch(console.error);
                    }}
                  />
                ) : (
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl text-center text-[10px] font-bold">
                    ยังไม่ได้ตั้งค่า VITE_TURNSTILE_SITE_KEY<br/>Bypass Mode Active
                  </div>
                )}
              </div>
            </div>
            {!TURNSTILE_SITE_KEY && (
              <button
                onClick={() => {
                  setShowTurnstileModal(false);
                  executeCheck("bypass", savedLinesToCheck).catch(console.error);
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm mb-4"
              >
                ดำเนินการต่อ (Bypass)
              </button>
            )}
            <button 
              onClick={() => setShowTurnstileModal(false)}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-widest mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {purchasedItemReceipt && (
        <ReceiptModal 
          selectedItem={purchasedItemReceipt} 
          setSelectedItem={(item) => {
             setPurchasedItemReceipt(item);
             // When modal is manually closed
             if (!item) {
               setActiveView('history');
             }
          }} 
        />
      )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}


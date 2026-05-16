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
  BarChart3,
  Settings,
  Activity,
  FileText,
  AlertTriangle,
  Download,
  ChevronRight,
  ChevronDown,
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
  MessageSquare,
  Bot,
  Image as ImageIcon,
  LogIn,
  UserPlus,
  ArrowUpRight,
  Zap,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Swal from "sweetalert2";
import axios from "axios";
import { supabase as auth } from "./lib/supabase"; // auth here refers to supabase

import jsQR from "jsqr";

type SupabaseUser = any;
import { Turnstile } from "@marsidev/react-turnstile";
import { Analytics } from "@vercel/analytics/react";
import { AccountResult, LogEntry, UserPlan } from "./types";
import { KeyModal } from "./components/modals/KeyModal";
import { ReceiptModal } from "./components/modals/ReceiptModal";
import { PopupBanner } from "./components/PopupBanner";
import { Product, SiteStats, Category } from "./types";
import { getAvatarUrl } from "./lib/avatar";

const ProfileView = lazy(() =>
  import("./components/ProfileView").then((module) => ({
    default: module.ProfileView,
  })),
);
const CategoriesView = lazy(() =>
  import("./components/CategoriesView").then((module) => ({
    default: module.CategoriesView,
  })),
);
const AuthView = lazy(() =>
  import("./components/AuthView").then((module) => ({
    default: module.AuthView,
  })),
);
const AdminDashboard = lazy(() =>
  import("./components/AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const HomeView = lazy(() =>
  import("./components/HomeView").then((module) => ({
    default: module.HomeView,
  })),
);
const ProductDetailView = lazy(() =>
  import("./components/ProductDetailView").then((module) => ({
    default: module.ProductDetailView,
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
const DiscordCatcherTool = lazy(() =>
  import("./components/DiscordCatcherTool").then((module) => ({
    default: module.DiscordCatcherTool,
  })),
);
const DiscordBadgeTool = lazy(() =>
  import("./components/DiscordBadgeTool").then((module) => ({
    default: module.DiscordBadgeTool,
  })),
);
const DiscordTokenOnTool = lazy(() =>
  import("./components/DiscordTokenOnTool").then((module) => ({
    default: module.DiscordTokenOnTool,
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
const HistoryView = lazy(() =>
  import("./components/HistoryView").then((module) => ({
    default: module.HistoryView,
  })),
);
const CheckerLogsView = lazy(() =>
  import("./components/CheckerLogsView").then((module) => ({
    default: module.CheckerLogsView,
  })),
);
const CategoryProductsView = lazy(() =>
  import("./components/CategoryProductsView").then((module) => ({
    default: module.CategoryProductsView,
  })),
);
const SearchView = lazy(() =>
  import("./components/SearchView").then((module) => ({
    default: module.SearchView,
  })),
);
const ContactView = lazy(() =>
  import("./components/ContactView").then((module) => ({
    default: module.ContactView,
  })),
);
const TelegramCatcherTool = lazy(() =>
  import("./components/TelegramCatcherTool").then((module) => ({
    default: module.TelegramCatcherTool,
  })),
);
const LogCategoriesView = lazy(() =>
  import("./components/LogCategoriesView").then((module) => ({
    default: module.LogCategoriesView,
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
    <div className="px-3 py-1 bg-[#0a0d12] rounded-full border border-white/10 text-xs font-mono text-zinc-400 font-bold">
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
      className={`w-full bg-[#0a0d12] border border-white/10 rounded-2xl p-5 text-sm font-mono text-white focus:border-[#1E90FF]/50 focus:ring-1 focus:ring-[#1E90FF]/30 outline-none resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-300 placeholder:text-zinc-400 h-[280px] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
  const [siteSettings, setSiteSettings] = useState({
    site_name: "APEX STUDIO",
    truewallet_phone: "",
    contact_line: "https://www.facebook.com/share/18emwBsqUf/?mibextid=wwXIfr",
    popup_enabled: false,
    popup_img_url: "",
    popup_link: "",
    stats_users_offset: 1278,
    stats_sales_offset: 0,
    spotify_url: "",
    spotify_autoplay: false
  });

  const [isMusicExpanded, setIsMusicExpanded] = useState(false);

  // Home Store State (Moved up to prevent TDZ)
  const defaultProducts: Product[] = [];

  const [products, setProducts] = useState<Product[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    users: 0,
    stock: 0,
    sales: 0,
    topups: 0,
  });
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
    | "admin"
    | "profile"
    | "logs"
    | "checker_logs"
    | "history"
    | "settings"
    | "contact"
    | "login"
    | "signup"
    | "wallet"
    | "redeem"
    | "product_detail"
    | "custom_page"
    | "log_categories"
    | "vip_logs"
    | "free_logs";
  const [activeView, setRawActiveView] = useState<ViewType>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "all",
  );
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);

  const setActiveView = useCallback(
    (view: any) => {
      if (activeView === view) return;
      setIsPageTransitioning(true);
      setTimeout(() => {
        window.history.pushState(null, "", "/" + view);
        setRawActiveView(view);
        setIsPageTransitioning(false);
      }, 600);
    },
    [activeView],
  );

  // Handle URL pathname routing
  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname.replace("/", "");
      if (path === "") path = "home";

      // Routing aliases
      if (path === "register") path = "signup";
      if (path === "topup") path = "wallet";
      if (path === "store") path = "categories";

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
      ];

      if (path && validViews.includes(path)) {
        if (path !== activeView) {
          setRawActiveView(path as any);
        }
      } else if (path === "home" && activeView !== "home") {
        setRawActiveView("home");
      }
    };

    // Initial check on mount
    handlePopState();

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeView]);

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
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingTurnstileToken, setPendingTurnstileToken] = useState<
    string | null
  >(null);
  const [savedLinesToCheck, setSavedLinesToCheck] = useState<string[]>([]);
  const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
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

  const [purchaseHistory, setPurchaseHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("apex_purchase_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [topupHistory, setTopupHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("apex_topup_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });


  useEffect(() => {
    localStorage.setItem(
      "apex_topup_history",
      JSON.stringify(topupHistory.slice(0, 50)),
    );
  }, [topupHistory]);

  const handlePurchase = async (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
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

    try {
      const res = await axios.post("/api/buy", {
        productId: product.id,
        quantity,
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
        link.download = `apex_order_${product.id}_x${quantity}_${new Date().toISOString().slice(0, 10)}.txt`;
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
            bg: "bg-emerald-500",
            color: "text-white",
          });
        }
      });
    } catch (err: any) {
      console.error("Purchase error:", err);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text:
          err.response?.data?.error ||
          "ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่",
        confirmButtonColor: "#dc2626",
      });
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

  const fetchAllData = useCallback(async () => {
    try {
      console.log("Fetching all data from backend...");

      const fireAndSet = async (url: string, setter: (data: any) => void) => {
        try {
          const res = await axios.get(url);
          if (res.data) setter(res.data);
          return { error: null };
        } catch (e: any) {
          const status = e.response?.status;
          const errorMsg = e.response?.data?.error || e.message;
          if (status !== 401 && status !== 403 && status !== 404) {
            console.error(`Fetch ERROR for ${url}:`, errorMsg);
          }
          return { error: errorMsg };
        }
      };

      // Critical Initial Data Fast Path
      fireAndSet("/api/stats", (data) => {
        setSiteStats({
          users: data.users,
          stock: data.stock,
          sales: data.sales,
          topups: data.totalTopupsAmount,
          totalOrders: data.totalOrders,
        });
      });
      fireAndSet("/api/products", (data) => {
        if (Array.isArray(data))
          setProducts(data.length > 0 ? data : defaultProducts);
      });
      fireAndSet("/api/categories", (data) => {
        if (Array.isArray(data)) setCategories(data);
      });

      // Secondary Data
      fireAndSet("/api/settings", (data) => setSiteSettings(data));
      fireAndSet("/api/pages", (data) => {
        if (Array.isArray(data)) setCustomPages(data);
        else if (data && data.data && Array.isArray(data.data))
          setCustomPages(data.data);
      });
      fireAndSet("/api/logs-system", (data) => {
        if (data && Array.isArray(data.categories)) {
          setLogCategories(data.categories.filter((c: any) => c.isVisible));
        }
      });

      // Admin endpoints Check
      if (isAdmin) {
        fireAndSet("/api/license_keys", setLicenseKeys);
        fireAndSet("/api/used_keys", setUsedKeysHistory);
        fireAndSet("/api/blocked_ips", setBlockedIPs);
        fireAndSet("/api/purchases", (data) => {
          if (Array.isArray(data) && data.length > 0) setPurchaseHistory(data);
        });
        fireAndSet("/api/topups", (data) => {
          if (Array.isArray(data) && data.length > 0) setTopupHistory(data);
        });
        fireAndSet("/api/users", (data) => {
          if (Array.isArray(data)) setUsersList(data);
        });
      }

      // Health check for DB readiness
      axios
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
    } catch (err: any) {
      console.error("Critical fetch error:", err);
    }
  }, [isAdmin]);

  // Backend API Listeners
  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 60000);
    return () => clearInterval(timer);
  }, [fetchAllData]);

  // App Init & check IP
  useEffect(() => {
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
        console.log("Welcome to APEX STUDIO System");
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

      setIsLoaded(true); // Load instantly from local storage

      try {
        const res = await axios.get("/api/health");
        const ip = res.data.clientIp || "Unknown";
        setClientIp(ip);
      } catch (err) {
        setClientIp("offline_local");
        console.error("IP Check Failed", err);
      }
    };
    initApp();
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
    colorClass: string = "text-gray-300",
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
        '<select id="swal-input1" class="swal2-input bg-[#0B0F14] border-white/10 text-white w-full">' +
        '<option value="Day">1 วัน (Day)</option>' +
        '<option value="Week">7 วัน (Week)</option>' +
        '<option value="Month">1 เดือน (Month)</option>' +
        '<option value="3Month">3 เดือน (3 Months)</option>' +
        '<option value="Year">1 ปี (Year)</option>' +
        '<option value="Lifetime">ถาวร (Lifetime)</option>' +
        "</select>" +
        '<input id="swal-input2" class="swal2-input bg-[#0B0F14] border-white/10 text-white w-full" placeholder="จำนวนคีย์ (1-50)" type="number" value="1">',
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
            "APEX-" +
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
        '<input id="swal-ip" class="swal2-input bg-[#0B0F14] border-white/10 text-white w-full" placeholder="IP Address เช่น 1.1.1.1">' +
        '<input id="swal-reason" class="swal2-input bg-[#0B0F14] border-white/10 text-white w-full" placeholder="เหตุผลการบล็อค">',
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
          <div><span class="text-zinc-500">คีย์ทั้งหมด:</span> <span class="font-bold text-[#1E90FF]">${totalAll}</span> รายการ</div>
          <div><span class="text-zinc-500">ยังไม่ได้ใช้:</span> <span class="font-bold text-emerald-500">${totalActive}</span> รายการ</div>
          <div><span class="text-zinc-500">ใช้แล้ว:</span> <span class="font-bold text-amber-500">${totalUsed}</span> รายการ</div>
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
  ) => {
    try {
      setTotalChecked((prev) => prev + 1);
      addLog(
        `[${index + 1}] กำลังทำ DataDome Bypass...`,
        "shield",
        "text-amber-400",
      );

      const response = await axios.post(`/api/check`, {
        account: acc,
        password: pass,
        turnstileToken: cToken,
      });
      const result = response.data;

      if (result.success) {
        addLog(
          `[${index + 1}] SSO Authenticated! กำลังดึงข้อมูลเกม...`,
          "key",
          "text-cyan-400",
        );
        const newResult: AccountResult = {
          ...result.data,
          cleanAt: new Date().toLocaleDateString("th-TH"),
          skins: result.data.skins || 0,
        };

        setValidAccounts((prev) => [newResult, ...prev]);
        addLog(
          `[${index + 1}] สำเร็จ: ${acc} [UID: ${newResult.uid}]`,
          "check-circle",
          "text-green-400 font-bold",
        );
      } else {
        let errorMsg = result.error || "Check failed";
        if (typeof errorMsg === "object") {
          try {
            errorMsg = JSON.stringify(errorMsg);
          } catch (e) {
            errorMsg = String(errorMsg);
          }
        }

        const isRateLimit =
          typeof errorMsg === "string" &&
          (errorMsg.includes("error_too_many_requests") ||
            errorMsg.includes("Too many requests") ||
            errorMsg.includes("(403)"));

        if (!isRateLimit) {
          setInvalidCount((prev) => prev + 1);
          addLog(
            `[${index + 1}] ไม่ผ่าน: ${acc} (${errorMsg})`,
            "x",
            "text-[#1E90FF]",
          );
        } else {
          addLog(
            `[${index + 1}] แนะนำให้หยุดพัก: ${acc} (ถูกจำกัด IP ชั่วคราว / Rate Limit)`,
            "alert-triangle",
            "text-amber-400",
          );
          setRunning(false);
          runningRef.current = false;
        }
      }
    } catch (err: any) {
      setInvalidCount((prev) => prev + 1);
      console.error(`Check failed for ${acc}:`, err);
      let errMsg = err.response?.data?.error || err.message;
      if (typeof errMsg === "object") {
        try {
          errMsg = JSON.stringify(errMsg);
        } catch (e) {
          errMsg = String(errMsg);
        }
      }
      addLog(
        `[${index + 1}] ระบบขัดข้อง: ${acc} (${errMsg})`,
        "x",
        "text-[#1a7fe6] font-bold",
      );
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

    if (!user) {
      Swal.fire({
        title: "ต้องเข้าสู่ระบบ",
        text: "กรุณาเข้าสู่ระบบก่อนเริ่มการทำงาน",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "เข้าสู่ระบบ",
      }).then((res) => {
        if (res.isConfirmed) setActiveView("login");
      });
      return;
    }

    const MAX_DAILY = 100;
    const isPremium = userPlan?.isPremium;
    let linesToCheck = lines;

    if (!isPremium) {
      const remaining = MAX_DAILY - dailyUsage;
      if (remaining <= 0) {
        Swal.fire({
          title: "โควต้าเต็ม",
          text: "คุณใช้งานครบ 100 บรรทัดสำหรับวันนี้แล้ว โปรดอัปเกรด VIP สำหรับการตรวจแบบไม่มีจำกัด",
          icon: "error",
        });
        return;
      }
      if (lines.length > remaining) {
        linesToCheck = lines.slice(0, remaining);
        Swal.fire({
          title: "จำกัดจำนวน (ผู้ใช้ปกติ)",
          text: `คุณตรวจสอบได้อีก ${remaining} บรรทัดในวันนี้ ระบบจะทำการตรวจสอบเพียง ${remaining} บรรทัดแรกตามโควต้า`,
          icon: "warning",
        });
      }
    }

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
      "text-cyan-400",
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
          await checkSingle(acc.trim(), pass.trim(), index, token);
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
    addLog("ตรวจสอบเสร็จสิ้น", "check", "text-green-400 font-bold");
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

  if (isIPBlocked)
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#1a7fe6]/5 border border-[#1a7fe6]/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <ShieldAlert className="w-20 h-20 text-[#1a7fe6] mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-[#1a7fe6] mb-4 uppercase tracking-tighter">
            Access Revoked
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            ที่อยู่ IP ของคุณ ({clientIp})
            ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย
            หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEX STUDIO
          </p>
          <div className="bg-black/50 rounded-2xl p-4 text-[10px] text-zinc-500 font-mono mb-8">
            Error Code: APEX_SECURITY_BLOCK_L4
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#1E90FF] hover:bg-[#1a7fe6] text-white px-8 py-3 rounded-2xl text-xs font-bold transition-all"
          >
            TRY RECONNECTING
          </button>
        </div>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.05),transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center z-10"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#1E90FF]/30 rounded-full blur-2xl"
            />
            <div className="w-20 h-20 rounded-2xl bg-[#1E90FF]/10 border border-[#1E90FF]/30 flex items-center justify-center relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(30,144,255,0.2)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_40%,#1E90FF_100%)] opacity-70"
              />
              <div className="absolute inset-[2px] bg-[#0B0F14] rounded-[14px]" />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              >
                <Loader
                  className="w-8 h-8 text-[#1E90FF] relative z-10 drop-shadow-[0_0_8px_rgba(30,144,255,0.8)]"
                  strokeWidth={2.5}
                />
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a9fff] to-cyan-400 tracking-wider text-center drop-shadow-[0_0_15px_rgba(26,159,255,0.2)]"
            >
              APEXSTORETH
            </motion.span>
            <span className="text-[#1E90FF] text-[10px] font-bold tracking-[0.3em] uppercase bg-[#1E90FF]/10 px-3 py-1 rounded-full border border-[#1E90FF]/20">
              Loading System...
            </span>
          </motion.div>
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#0a0d12] text-white font-sans selection:bg-[#1E90FF]/30 flex flex-col lg:flex-row-reverse relative">
      <CustomCursor />
      <PopupBanner
        enabled={siteSettings?.popup_enabled ?? false}
        imgUrl={siteSettings?.popup_img_url ?? ""}
        linkUrl={siteSettings?.popup_link ?? ""}
      />
      {/* Page Transition Overlay */}
      {isPageTransitioning && (
        <div className="fixed inset-0 z-[200] bg-[#0a0d12]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Loader
              className="w-12 h-12 text-[#1E90FF] animate-spin"
              strokeWidth={2}
            />
          </motion.div>
        </div>
      )}

      {/* Desktop Sidebar (Minimal) - HIDDEN for top menu layout */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-[#0B0F14] border-l border-[#1E90FF]/10 h-screen sticky top-0 p-6 z-[60] overflow-y-auto no-scrollbar">
        <div className="mb-10 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer select-none flex items-center justify-center relative group"
            onClick={handleLogoClick}
          >
            <div className="absolute inset-0 bg-[#1E90FF]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-[26px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a9fff] to-cyan-400 tracking-wide drop-shadow-[0_0_15px_rgba(26,159,255,0.3)]">
              APEXSTORETH
            </span>
          </motion.div>
        </div>
        <div className="flex-1 space-y-1">
          {!user && (
            <div className="mb-6 flex flex-col font-sans px-2">
              {/* Main Button: Login */}
              <button
                onClick={() => setActiveView("login")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1A56DB] to-[#1E90FF] text-white py-3.5 px-4 rounded-[18px] font-semibold text-[15px] shadow-[0_2px_10px_rgba(30,144,255,0.1)] transition-transform active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                เข้าสู่ระบบ
              </button>

              {/* Thin Separator */}
              <div className="w-full flex items-center justify-center my-4">
                <div className="w-full h-[1px] bg-[#1A56DB]/30"></div>
              </div>

              {/* Secondary Button: Signup */}
              <button
                onClick={() => setActiveView("signup")}
                className="w-full flex items-center justify-center gap-2 border border-[#1E90FF]/30 hover:border-[#1E90FF]/60 hover:bg-[#1E90FF]/10 text-[#1E90FF] py-3.5 px-4 rounded-[18px] font-semibold text-[15px] transition-all active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                สมัครสมาชิก
              </button>
            </div>
          )}

          {/* Sidebar Menu Items */}
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 pl-3 mt-4">
            เมนูหลัก
          </div>
          <button
            onClick={() => setActiveView("home")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "home" ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
          >
            <Home className="w-5 h-5" /> หน้าแรก
          </button>
          <button
            onClick={() => {
              setActiveView(user ? "wallet" : "login");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "wallet" ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
          >
            <Wallet className="w-5 h-5" /> เติมเงิน
          </button>
          <button
            onClick={() => {
              setActiveView("categories");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "categories" ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
          >
            <ShoppingCart className="w-5 h-5" /> สินค้าทั้งหมด
          </button>

          {user && (
            <>
              <button
                onClick={() => setIsDesktopToolsOpen(!isDesktopToolsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-bold text-zinc-500 hover:bg-[#0a0d12] hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5" /> เครื่องมือ
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isDesktopToolsOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDesktopToolsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="flex flex-col gap-1 mt-1 pl-2 border-l border-white/5 ml-8">
                  <button
                    onClick={() => setActiveView("telegram_catcher")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeView === "telegram_catcher" ? "bg-[#2AABEE]/10 text-[#2AABEE] shadow-md shadow-[#2AABEE]/10" : "text-zinc-400 hover:bg-[#0a0d12] hover:text-white"}`}
                  >
                    Telegram Catcher
                  </button>
                  <button
                    onClick={() => setActiveView("discord_catcher")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeView === "discord_catcher" ? "bg-[#5865F2]/10 text-[#5865F2] shadow-md shadow-[#5865F2]/10" : "text-zinc-400 hover:bg-[#0a0d12] hover:text-white"}`}
                  >
                    Discord Catcher
                  </button>
                  <button
                    onClick={() => setActiveView("discord_on")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeView === "discord_on" ? "bg-[#5865F2]/10 text-[#5865F2] shadow-md shadow-[#5865F2]/10" : "text-zinc-400 hover:bg-[#0a0d12] hover:text-white"}`}
                  >
                    Discord Token Checker
                  </button>
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeView === "dashboard" ? "bg-[#1E90FF]/10 text-[#1E90FF] shadow-md shadow-[#1E90FF]/10" : "text-zinc-400 hover:bg-[#0a0d12] hover:text-white"}`}
                  >
                    Garena Checker
                  </button>
                  <button
                    onClick={() => setActiveView("discord_badge")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${activeView === "discord_badge" ? "bg-[#5865F2]/10 text-[#5865F2] shadow-md shadow-[#5865F2]/10" : "text-zinc-400 hover:bg-[#0a0d12] hover:text-white"}`}
                  >
                    Discord Badge Checker
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => {
              setActiveView(user ? "history" : "login");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "history" ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
          >
            <History className="w-5 h-5" /> ประวัติการใช้งาน
          </button>
          <button
            onClick={() => {
              setActiveView("contact");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "contact" ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
          >
            <Phone className="w-5 h-5" /> ติดต่อแอดมิน
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-red-500 hover:bg-red-500/10 mt-2"
            >
              <LogOut className="w-5 h-5" /> ออกจากระบบ
            </button>
          )}

          {user && customPages && customPages.length > 0 && (
            <>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-6 mb-3 pl-3">
                หน้าอื่นๆ
              </div>
              {customPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setSelectedPage(page);
                    setActiveView("custom_page");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-[#1E90FF] text-white shadow-md shadow-[#1E90FF]/20" : "text-zinc-500 hover:bg-[#0a0d12] hover:text-white"}`}
                >
                  <FileText className="w-5 h-5" />{" "}
                  {page.title.replace(/^#+\s*/, "")}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Bottom User Profile */}
        <div className="pt-6 border-t border-white/5 mt-6 flex flex-col gap-3 shrink-0">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-[#0a0d12] p-4 rounded-3xl border border-white/10">
                <div className="w-10 h-10 bg-[#0B0F14] border border-white/10 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={getAvatarUrl(
                      userPlan?.username ||
                        user?.email?.split("@")[0] ||
                        "guest",
                    )}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col truncate flex-1 leading-tight">
                  {userPlan?.isPremium && (
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">
                      <Crown className="w-3 h-3 inline mr-1 -mt-0.5" />
                      PREMIUM
                    </span>
                  )}
                  <span className="text-sm font-bold text-white truncate">
                    {user.isAnonymous ? "ผู้ใช้งานทั่วไป" : user.email}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1 font-sans font-bold mt-0.5">
                    <Wallet className="w-3 h-3" /> ฿
                    {userPlan?.balance
                      ? userPlan.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : "0.00"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveView("profile")}
                  className="py-2.5 bg-[#0B0F14] border border-white/10 text-zinc-400 rounded-2xl text-xs font-bold hover:bg-[#0a0d12] hover:border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  โปรไฟล์
                </button>
                <button
                  onClick={handleLogout}
                  className="py-2.5 bg-[#0B0F14] border border-white/10 text-[#1E90FF] rounded-2xl text-xs font-bold hover:bg-[#1E90FF]/10 hover:border-[#1E90FF]/30 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  ออก
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveView("login")}
                className="w-full py-3.5 bg-[#1E90FF] text-white rounded-2xl text-sm font-bold hover:bg-[#166bcc] transition-colors shadow-m"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => setActiveView("signup")}
                className="w-full py-3.5 bg-transparent border border-[#1E90FF]/30 text-[#1E90FF] hover:border-[#1E90FF]/60 hover:bg-[#1E90FF]/10 rounded-2xl text-sm font-bold transition-all"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        {/* Global Top Navbar */}
        <nav className="lg:hidden sticky top-0 z-[60] bg-[#111318] border-b border-[#2a2d35] h-[72px] w-full flex justify-center shadow-sm">
          <div className="flex items-center justify-between px-5 w-full relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer relative group"
              onClick={() => setActiveView("home")}
            >
              <div className="absolute inset-0 bg-[#1E90FF]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-[20px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a9fff] to-cyan-400 tracking-wide drop-shadow-[0_0_15px_rgba(26,159,255,0.3)]">
                APEXSTORETH
              </span>
            </motion.div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("search")}
                className="w-10 h-10 bg-[#1e2129] border border-[#2a2d35] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-10 h-10 rounded-xl bg-[#1e2129] border border-[#2a2d35] flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all relative overflow-hidden"
                aria-label="Menu"
              >
                <AnimatePresence mode="popLayout">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 relative z-10" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 relative z-10" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
              />
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="fixed top-0 right-0 bottom-0 w-[78%] max-w-[320px] bg-[#111318] shadow-2xl z-[71] flex flex-col lg:hidden"
              >
                {/* Menu Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 relative group"
                  >
                    <div className="absolute inset-0 bg-[#1E90FF]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-[20px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a9fff] to-cyan-400 tracking-wide drop-shadow-[0_0_15px_rgba(26,159,255,0.3)]">
                      APEXSTORETH
                    </span>
                  </motion.div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e2129] border border-white/5 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-2">
                  <div className="flex flex-col border-b border-white/5 pb-2 mb-2">
                    <button
                      onClick={() => {
                        setActiveView("home");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "home" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                    >
                      <Home className="w-5 h-5 shrink-0" />{" "}
                      <span className="font-semibold text-[15px]">หน้าแรก</span>
                    </button>
                    <button
                      onClick={() => {
                        !user
                          ? setActiveView("login")
                          : setActiveView("wallet");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "wallet" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                    >
                      <Wallet className="w-5 h-5 shrink-0" />{" "}
                      <span className="font-semibold text-[15px]">
                        เติมเงิน
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveView("categories");
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "categories" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                    >
                      <ShoppingCart className="w-5 h-5 shrink-0" />{" "}
                      <span className="font-semibold text-[15px]">สินค้าทั้งหมด</span>
                    </button>

                    {user && (
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            setIsMobileToolsOpen(!isMobileToolsOpen)
                          }
                          className="w-full flex items-center justify-between px-6 py-3.5 relative transition-colors text-zinc-400 hover:bg-[#1e2129] hover:text-white"
                        >
                          <div className="flex items-center gap-3">
                            <Bot className="w-5 h-5 shrink-0" />{" "}
                            <span className="font-semibold text-[15px]">
                              เครื่องมือ
                            </span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isMobileToolsOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out bg-black/20 ${isMobileToolsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
                        >
                          <div className="flex flex-col py-2">
                            <button
                              onClick={() => {
                                setActiveView("telegram_catcher");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 relative transition-colors ${activeView === "telegram_catcher" ? "text-[#1E90FF]" : "text-zinc-500 hover:text-white"}`}
                            >
                              <span className="font-medium text-[14px]">
                                Telegram Catcher
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveView("discord_catcher");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 relative transition-colors ${activeView === "discord_catcher" ? "text-[#1E90FF]" : "text-zinc-500 hover:text-white"}`}
                            >
                              <span className="font-medium text-[14px]">
                                Discord Catcher
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveView("discord_on");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 relative transition-colors ${activeView === "discord_on" ? "text-[#1E90FF]" : "text-zinc-500 hover:text-white"}`}
                            >
                              <span className="font-medium text-[14px]">
                                Token Checker
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveView("dashboard");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 relative transition-colors ${activeView === "dashboard" ? "text-[#1E90FF]" : "text-zinc-500 hover:text-white"}`}
                            >
                              <span className="font-medium text-[14px]">
                                Garena Checker
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveView("discord_badge");
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 pl-14 pr-6 py-3 relative transition-colors ${activeView === "discord_badge" ? "text-[#1E90FF]" : "text-zinc-500 hover:text-white"}`}
                            >
                              <span className="font-medium text-[14px]">
                                Badge Checker
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          setActiveView("history");
                          setIsMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "history" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                      >
                        <History className="w-5 h-5 shrink-0" />{" "}
                        <span className="font-semibold text-[15px]">
                          ประวัติการใช้งาน
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveView("profile");
                          setIsMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "profile" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                      >
                        <Settings className="w-5 h-5 shrink-0" />{" "}
                        <span className="font-semibold text-[15px]">
                          โปรไฟล์
                        </span>
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col border-b border-white/5 pb-2 mb-2">
                    <button
                      onClick={() => {
                        setActiveView("contact");
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "contact" ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                    >
                      <Phone className="w-5 h-5 shrink-0" />{" "}
                      <span className="font-semibold text-[15px]">
                        ติดต่อแอดมิน
                      </span>
                    </button>
                  </div>

                  {!user && (
                    <div className="px-6 py-4 flex flex-col gap-3 mt-auto border-t border-white/5 pt-6">
                      <button
                        onClick={() => {
                          setActiveView("login");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#1E90FF] hover:bg-[#166bcc] text-white py-3 px-4 rounded-xl font-bold text-[15px] transition-colors"
                      >
                        <LogIn className="w-5 h-5" />
                        เข้าสู่ระบบ
                      </button>

                      <button
                        onClick={() => {
                          setActiveView("signup");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 border border-[#1E90FF]/30 hover:bg-[#1e2129] text-[#1E90FF] py-3 px-4 rounded-xl font-bold text-[15px] transition-colors"
                      >
                        <UserPlus className="w-5 h-5" />
                        สมัครสมาชิก
                      </button>
                    </div>
                  )}

                  {user && customPages && customPages.length > 0 && (
                    <div className="flex flex-col border-b border-white/5 pb-2 mb-2">
                      {customPages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setSelectedPage(page);
                            setActiveView("custom_page");
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-[#0d1a2e] text-[#1E90FF] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#1E90FF] before:rounded-r-sm" : "text-zinc-400 hover:bg-[#1e2129] hover:text-white"}`}
                        >
                          <FileText className="w-5 h-5 shrink-0" />{" "}
                          <span className="font-semibold text-[15px] truncate">
                            {page.title.replace(/^#+\s*/, "")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {user && isAdmin && (
                    <div className="flex flex-col border-b border-white/5 pb-2 mb-2">
                      <button
                        onClick={() => {
                          setActiveView("admin");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-3.5 relative transition-colors ${activeView === "admin" ? "bg-purple-500/10 text-purple-400 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-purple-500 before:rounded-r-sm" : "text-purple-500/70 hover:bg-[#1e2129] hover:text-purple-400"}`}
                      >
                        <ShieldAlert className="w-5 h-5 shrink-0" />{" "}
                        <span className="font-semibold text-[15px]">
                          จัดการหลังบ้าน
                        </span>
                      </button>
                    </div>
                  )}

                  {user && (
                    <div className="px-5 pb-5 mt-auto pt-4 border-t border-white/5">
                      <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-md mb-4 bg-gradient-to-br from-[#1a1d24] to-[#111318]">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-3 mb-1">
                          <div className="w-12 h-12 rounded-full bg-[#1e2129] flex items-center justify-center shrink-0 border border-white/5 shadow-inner overflow-hidden">
                            <img
                              src={getAvatarUrl(
                                encodeURIComponent(
                                  userPlan?.username ||
                                    user?.email?.split("@")[0] ||
                                    "guest",
                                ),
                              )}
                              alt="avatar"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-bold text-white truncate">
                              {user.isAnonymous
                                ? "ผู้ใช้งานทั่วไป"
                                : userPlan?.username ||
                                  user.email?.split("@")[0]}
                            </p>
                            <p className="text-[12px] text-zinc-500 truncate">
                              {user.isAnonymous ? "Guest Account" : user.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#111318] rounded-xl p-2 h-[72px] flex flex-col items-center justify-center border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                            <span className="text-[10px] text-zinc-500 mb-1 w-full text-center uppercase tracking-wide">
                              ยอดเงินคงเหลือ
                            </span>
                            <span className="text-[16px] font-bold text-[#1E90FF] w-full text-center">
                              ฿
                              {userPlan?.balance
                                ? userPlan.balance.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })
                                : "0.00"}
                            </span>
                          </div>
                          <div className="bg-[#111318] rounded-xl p-2 h-[72px] flex flex-col items-center justify-center border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                            <span className="text-[10px] text-zinc-500 mb-1 w-full text-center uppercase tracking-wide">
                              สถานะผู้ใช้
                            </span>
                            <span className="text-[16px] font-bold text-emerald-400 w-full text-center">
                              {user.isAnonymous ? "GUEST" : "MEMBER"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-500/10 text-red-500 hover:bg-red-500/10 rounded-xl font-semibold text-[15px] transition-colors"
                      >
                        <LogOut className="w-5 h-5 shrink-0" />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Verification Banner Removed */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-24 w-full flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-[#1E90FF] border-t-transparent flex-shrink-0 animate-spin rounded-full"></div>
              </div>
            }
          >
            {activeView === "categories" && (
              <CategoriesView
                categories={categories}
                products={products}
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

            {activeView === "search" && (
              <SearchView
                products={products}
                onBack={() =>
                  window.history.length > 1
                    ? window.history.back()
                    : setActiveView("home")
                }
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
                user={user}
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
                facebookLink={siteSettings?.contact_line}
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
              />
            )}

            {activeView === "telegram_catcher" && (
              <TelegramCatcherTool userPlan={userPlan} />
            )}
            {activeView === "discord_catcher" && (
              <DiscordCatcherTool userPlan={userPlan} />
            )}
            {activeView === "discord_on" && (
              <DiscordTokenOnTool userPlan={userPlan} />
            )}
            {activeView === "discord_badge" && <DiscordBadgeTool />}
            {activeView === "logs" && (
              <HistoryLogsView
                usedKeysHistory={usedKeysHistory}
                purchaseHistory={purchaseHistory}
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
                purchaseHistory={purchaseHistory}
                topupHistory={topupHistory}
                usedKeysHistory={usedKeysHistory}
              />
            )}
            {activeView === "wallet" && (
              <WalletView
                userPlan={userPlan}
                setUserPlan={setUserPlan}
                userId={user?.uid}
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
                onRefreshData={fetchAllData}
              />
            )}

            {activeView === "dashboard" && (
              <>
                {/* Minimal Dashboard Header */}
                <div className="mb-8 relative rounded-3xl bg-[#0B0F14] border border-white/5 shadow-sm overflow-hidden flex flex-col items-center justify-center py-16 text-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-32 bg-[#1E90FF]/10 blur-[120px] rounded-full pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="px-4 py-1.5 rounded-full border border-white/10 bg-[#1E90FF]/10 text-xs font-bold text-[#1E90FF] tracking-widest uppercase flex items-center gap-2 mb-6">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E90FF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a7fe6]"></span>
                      </span>
                      System Online
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight select-none">
                      ระบบตรวจสอบไอดี
                    </h1>

                    <p className="mt-4 text-sm text-zinc-400 bg-[#0a0d12] px-6 py-2 rounded-full border border-white/10 inline-block font-medium">
                      ระบบตรวจสอบด้วยความแม่นยำสูง
                    </p>
                  </div>
                </div>

                {/* Top Stats Row (Minimal Style) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        สำเร็จ (VALID)
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {validAccounts.length}
                    </span>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1E90FF]/10 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4 text-[#1a7fe6]" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        ไม่ผ่าน (INVALID)
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {invalidCount}
                    </span>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        ปกติ (CLEAN)
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {validAccounts.filter((a) => a.isClean).length}
                    </span>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        ROV
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {validAccounts.filter((a) => a.hasRov).length}
                    </span>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        ROV CLEAN
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {
                        validAccounts.filter((a) => a.hasRov && a.rovClean)
                          .length
                      }
                    </span>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#1E90FF]/10 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4 text-[#1a7fe6]" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase truncate">
                        ROV NOT CLEAN
                      </span>
                    </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {
                        validAccounts.filter((a) => a.hasRov && !a.rovClean)
                          .length
                      }
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Panel: Combo & Controls */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Input Card */}
                    <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                      <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-center w-full">
                          <h2 className="text-lg font-bold flex items-center gap-3 text-white">
                            นำข้อมูลเข้าสู่ระบบ
                          </h2>
                          <span className="bg-[#121820] px-3 py-1 rounded-full text-xs text-[#1E90FF] font-bold">
                            {combo.trim() ? combo.trim().split("\n").length : 0}{" "}
                            รายการ
                          </span>
                        </div>

                        <div className="flex grid grid-cols-2 gap-3 relative z-10 w-full">
                          <button
                            onClick={async () => {
                              const { value: url } = await Swal.fire({
                                title: "ดึงข้อมูลจาก URL",
                                input: "url",
                                inputPlaceholder:
                                  "https://pastebin.com/raw/...",
                                showCancelButton: true,
                                confirmButtonText: "ดึงข้อมูล",
                                cancelButtonText: "ยกเลิก",
                              });
                              if (url) {
                                try {
                                  Swal.showLoading();
                                  const res = await axios.get(url);
                                  if (res.data) {
                                    setCombo(res.data);
                                    Swal.close();
                                    Swal.fire({
                                      title: "สำเร็จ",
                                      text: `ดึงข้อมูลสำเร็จ ${res.data.trim().split("\n").length} รายการ`,
                                      icon: "success",
                                      timer: 2000,
                                    });
                                  }
                                } catch (err) {
                                  Swal.fire(
                                    "ล้มเหลว",
                                    "ไม่สามารถเชื่อมต่อ URL ได้",
                                    "error",
                                  );
                                }
                              }
                            }}
                            className="bg-[#0a0d12] hover:bg-[#121820] py-3 rounded-2xl border border-white/10 text-[11px] font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all w-full"
                          >
                            <Home className="w-4 h-4" /> ดึงจากแพลตฟอร์ม
                          </button>

                          <label className="cursor-pointer bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 py-3 rounded-2xl border border-[#1E90FF]/30 text-[11px] font-bold text-[#1E90FF] flex items-center justify-center gap-2 transition-all w-full">
                            <Upload className="w-4 h-4" /> อัปโหลดไฟล์ (.txt)
                            <input
                              type="file"
                              accept=".txt"
                              className="hidden"
                              onChange={handleFileUpload}
                              ref={fileInputRef}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="relative z-10 mb-6">
                        <ComboTextarea
                          initialValue={combo}
                          onChangeDebounced={(val) => setCombo(val)}
                          disabled={false} // Users explicitly requested to be able to type while checking
                        />
                      </div>

                      <div className="flex flex-col gap-3 relative z-10 pt-2 border-t border-white/5 mt-2">
                        <button
                          onClick={startCheck}
                          disabled={running}
                          className="w-full bg-[#1E90FF] text-white hover:bg-[#1a7fe6] py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#1a7fe6]/20"
                        >
                          <Play
                            className="w-5 h-5 flex-shrink-0"
                            fill="currentColor"
                          />{" "}
                          เริ่มตรวจสอบ
                        </button>
                        <button
                          onClick={stopCheck}
                          disabled={!running}
                          className="w-full bg-[#0B0F14] hover:bg-[#0a0d12] border border-white/10 text-zinc-400 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Square className="w-4 h-4" fill="currentColor" />{" "}
                          โหมดยกเลิก
                        </button>
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                      <h3 className="text-xs font-bold text-zinc-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Download className="w-4 h-4" /> ส่งออกผลลัพธ์
                      </h3>
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3 pb-3">
                          <button
                            onClick={exportClean}
                            className="bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 border border-emerald-500/30 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5" /> บันทึกปกติ
                          </button>
                          <button
                            onClick={exportBound}
                            className="bg-amber-500/10 hover:bg-amber-100 text-amber-600 border border-amber-200 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" /> บันทึกมีเชื่อม
                          </button>
                        </div>
                        <button
                          onClick={exportRov}
                          className="bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 py-3 rounded-2xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-1.5 shadow-sm mb-3"
                        >
                          <Gamepad2 className="w-4 h-4" /> บันทึก ROV (ทั้งหมด)
                        </button>
                        <button
                          onClick={exportAllValid}
                          className="bg-[#1E90FF] hover:bg-[#166bcc] text-white py-3 rounded-2xl font-bold text-xs transition-colors w-full flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ListChecks className="w-4 h-4" /> บันทึกทั้งหมด (ALL
                          VALID)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel: Terminal Log & Results */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl p-6 sm:p-7 h-[450px] flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Terminal className="w-64 h-64 text-white" />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-5 border-b border-white/5 gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg flex items-center gap-3 text-white">
                            <div className="w-8 h-8 rounded-xl bg-[#121820] flex items-center justify-center">
                              <Terminal className="text-zinc-500 w-4 h-4" />
                            </div>
                            บันทึกเรียลไทม์
                          </h3>
                          <div className="flex items-center gap-2">
                            <ElapsedTimeDisplay
                              running={running}
                              startTime={startTime}
                            />
                            <div className="px-3 py-1 bg-[#1E90FF]/10 border border-[#1E90FF]/30 rounded-full text-[10px] font-bold text-[#1E90FF] uppercase tracking-widest">
                              Secured Mode
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={clearLog}
                          className="px-4 py-2 bg-[#0B0F14] hover:bg-[#0a0d12] rounded-full text-xs font-bold text-zinc-500 transition-colors border border-white/10 flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> ล้างข้อความ
                        </button>
                      </div>

                      <div
                        ref={logDivRef}
                        className="flex-1 bg-[#0a0d12] border border-white/10 p-6 rounded-2xl text-[13px] font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-300"
                      >
                        {logs.length === 0 && (
                          <div className="text-zinc-400 flex flex-col items-center justify-center h-full gap-4 opacity-70">
                            <Terminal className="w-12 h-12" />
                            <span>ระบบพร้อมทำงาน รอรับข้อมูล...</span>
                          </div>
                        )}
                        {logs.map((log) => {
                          // Adjust log colors for light mode
                          let lightModeColor = "text-zinc-400";
                          if (
                            log.colorClass.includes("emerald") ||
                            log.colorClass.includes("green")
                          )
                            lightModeColor = "text-emerald-600";
                          else if (log.colorClass.includes("red"))
                            lightModeColor = "text-[#1a7fe6]";
                          else if (
                            log.colorClass.includes("cyan") ||
                            log.colorClass.includes("amber")
                          )
                            lightModeColor = "text-amber-500";

                          return (
                            <div
                              key={log.id}
                              className={`${lightModeColor} mb-2 flex items-start gap-3 break-all whitespace-pre-wrap leading-relaxed`}
                            >
                              <span className="shrink-0 text-zinc-400 font-medium">
                                [{log.time}]
                              </span>
                              <span className="flex-1">
                                <div className="flex items-start">
                                  {log.iconName === "shield" && (
                                    <Shield className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "terminal-pulse" && (
                                    <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 animate-pulse mt-1" />
                                  )}
                                  {log.iconName === "terminal" && (
                                    <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "check-circle" && (
                                    <CheckCircle2 className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "x" && (
                                    <X className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "check" && (
                                    <Check className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "square" && (
                                    <Square className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  {log.iconName === "crown" && (
                                    <Crown className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />
                                  )}
                                  <span className="flex-1 font-medium">
                                    {log.text}
                                  </span>
                                </div>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {validAccounts.length > 0 && (
                      <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/5">
                          <h3 className="font-bold text-lg text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            ผลลัพธ์ที่สำเร็จ
                            <span className="bg-[#121820] text-zinc-400 px-3 py-1 rounded-full text-xs font-bold ml-2 border border-white/10">
                              {validAccounts.length}
                            </span>
                          </h3>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 pr-3">
                          {validAccounts.map((acc, idx) => (
                            <div
                              key={idx}
                              className="bg-[#0a0d12] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-5 hover:border-emerald-500/30 transition-all hover:bg-[#0B0F14] relative overflow-hidden group hover:shadow-md hover:shadow-black/5"
                            >
                              {/* Header Section */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-100">
                                    <Check className="w-6 h-6 text-emerald-500" />
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1 mb-1">
                                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-[#0B0F14] px-2 py-0.5 rounded-md border border-white/5">
                                        UID: {acc.uid} | {acc.region}
                                      </div>
                                      {acc.codmUid &&
                                        acc.codmNickname !== "N/A" && (
                                          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-[#0B0F14] px-2 py-0.5 rounded-md border border-white/5 flex gap-2">
                                            <span>CODM UID: {acc.codmUid}</span>{" "}
                                            {acc.codmOpenId && (
                                              <span>
                                                | OPENID: {acc.codmOpenId}
                                              </span>
                                            )}{" "}
                                            {acc.codmRegionFlag && (
                                              <span>
                                                | {acc.codmRegionFlag}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                    <div className="text-white font-bold font-mono text-base sm:text-lg">
                                      {acc.account}{" "}
                                      {acc.codmNickname &&
                                        acc.codmNickname !== "N/A" && (
                                          <span className="text-blue-500 ml-2">
                                            ({acc.codmNickname})
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `${acc.account}:${acc.password}`,
                                      );
                                      Swal.fire({
                                        toast: true,
                                        position: "top-end",
                                        icon: "success",
                                        title: "คัดลอกบัญชีแล้ว!",
                                        showConfirmButton: false,
                                        timer: 1500,
                                        background: "#10b981",
                                        color: "#fff",
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2"
                                  >
                                    <Copy className="w-3 h-3" /> คัดลอก
                                  </button>
                                  <div className="px-3 py-1.5 bg-[#0B0F14] rounded-xl border border-white/10 text-[11px] text-zinc-700 font-mono font-bold shadow-sm">
                                    PASS: {acc.password}
                                  </div>
                                  <div className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[11px] font-black italic">
                                    LV. {acc.level}
                                  </div>
                                  <div className="px-3 py-1.5 bg-amber-500/10 text-amber-600 border border-amber-100 rounded-xl text-[11px] font-black uppercase">
                                    {acc.rank}
                                  </div>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-white/10 py-4 relative z-10 bg-[#0B0F14]/50 px-2 rounded-xl">
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                    สถานะไอดี
                                  </div>
                                  {acc.isClean ? (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                                      <Shield className="w-3.5 h-3.5" /> CLEAN
                                      (ปกติ)
                                    </span>
                                  ) : (
                                    <span className="text-xs text-amber-600 font-bold flex items-center gap-1.5">
                                      🔗 BOUND (
                                      {[
                                        acc.emailVerified ? "Email" : null,
                                        acc.phoneBound ? "Phone" : null,
                                        acc.fbLinked ? "Facebook" : null,
                                        acc.idCardBound ? "ID Card" : null,
                                      ]
                                        .filter(Boolean)
                                        .join(", ") || "Connected"}
                                      )
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                    ID Card / Phone
                                  </div>
                                  <span
                                    className={`text-xs font-bold flex items-center gap-1.5 ${acc.idCardBound || acc.phoneBound ? "text-amber-500" : "text-zinc-500"}`}
                                  >
                                    {acc.idCardBound
                                      ? "ID CARD BOUND"
                                      : acc.phoneBound
                                        ? "PHONE BOUND"
                                        : "NOT BOUND"}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                    Email Verified
                                  </div>
                                  <span
                                    className={`text-xs font-bold flex items-center gap-1.5 ${acc.emailVerified ? "text-emerald-500" : "text-zinc-500"}`}
                                  >
                                    {acc.emailVerified
                                      ? "ยืนยันแล้ว"
                                      : "ยังไม่ยืนยัน"}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                    Facebook
                                  </div>
                                  <span
                                    className={`text-xs font-bold flex items-center gap-1.5 ${acc.fbLinked ? "text-blue-500" : "text-zinc-500"}`}
                                  >
                                    {acc.fbLinked
                                      ? "เชื่อมต่อแล้ว"
                                      : "ไม่ได้เชื่อมต่อ"}
                                  </span>
                                </div>
                              </div>

                              {/* Footer Section */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-[10px] text-zinc-500 font-bold mr-1">
                                    เกมอื่นๆ:
                                  </div>
                                  {acc.otherGames.length > 0 ? (
                                    acc.otherGames.map((g, gi) => (
                                      <span
                                        key={gi}
                                        className="px-2 py-0.5 bg-[#0B0F14] text-zinc-400 rounded-md text-[9px] border border-white/10 uppercase font-bold"
                                      >
                                        {g}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[9px] text-zinc-400 italic">
                                      ไม่พบประวัติเกมอื่น
                                    </span>
                                  )}
                                  {acc.hasRov && (
                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-100 rounded-md text-[9px] font-bold uppercase flex items-center gap-1">
                                      <Gamepad2 className="w-2.5 h-2.5" /> ROV
                                      ACTIVE
                                      {acc.rovCharacter &&
                                        acc.rovCharacter !== "N/A" &&
                                        ` - ${acc.rovCharacter}`}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-mono bg-[#0B0F14] border border-white/10 px-2 py-1 rounded-md">
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
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-16 pb-8 border-t border-[#1E90FF]/10 relative overflow-hidden bg-[#0A0D12]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#1E90FF]/50 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-zinc-500 mb-12 text-center md:text-center">
              {/* Brand & Intro */}
              <div className="col-span-1 md:col-span-1 flex flex-col items-center">
                <span className="text-xl font-black text-[#1E90FF] tracking-wide block mb-3 leading-none">
                  APEXSTORETH
                </span>
                <p
                  className="leading-relaxed mb-6 text-zinc-400 select-all cursor-text hover:text-white transition-colors"
                  title="คลิกเพื่อคัดลอก"
                >
                  APEXSTORETH | จำหน่ายสินค้าราคาถูก ปลอดภัย 100%
                </p>
              </div>

              {/* Links Group 1 */}
              <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-4 tracking-wider">
                  เกี่ยวกับเรา
                </h4>
                <ul className="space-y-3 flex flex-col items-center">
                  <li>
                    <button
                      onClick={() => setActiveView("home")}
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      สินค้าทั่วไป
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveView("premium")}
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      แอพพรีเมียม
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveView("vip")}
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      ยศ VIP
                    </button>
                  </li>
                </ul>
              </div>

              {/* Links Group 2 */}
              <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-4 tracking-wider">
                  เงื่อนไขการให้บริการ
                </h4>
                <ul className="space-y-3 flex flex-col items-center">
                  <li>
                    <button
                      onClick={() => setShowTerms(true)}
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      เงื่อนไขการให้บริการ
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowPrivacy(true)}
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        window.open(siteSettings?.contact_line, "_blank")
                      }
                      className="hover:text-[#1E90FF] transition-colors"
                    >
                      ติดต่อเรา
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact Group */}
              <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-4 tracking-wider">
                  ติดต่อเรา
                </h4>
                <ul className="space-y-3 flex flex-col items-center">
                  <li>
                    <button
                      onClick={() =>
                        window.open(siteSettings?.contact_line, "_blank")
                      }
                      className="flex items-center gap-2 hover:text-[#1E90FF] transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B900]"></div>
                      Line Official
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-zinc-400">
              <p>© {new Date().getFullYear()} เอเพ็กซ์สโตร์ — สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm font-sans animate-in fade-in duration-200">
            <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <Shield className="w-6 h-6 shrink-0 text-[#1a7fe6]" />{" "}
                นโยบายความเป็นส่วนตัว (Privacy Policy)
              </h2>
              <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-300 flex-1">
                <p>
                  <strong>อัปเดตล่าสุด:</strong>{" "}
                  {new Date().toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    1. ข้อมูลที่เราเก็บรวบรวม
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>ข้อมูล IP Address:</strong> เรามีการบันทึกที่อยู่
                      IP ของผู้ใช้งาน เพื่อวัตถุประสงค์ด้านความปลอดภัย
                      การป้องกันสแปม การโจมตีระบบ (DDoS)
                      และการแบนผู้ใช้อัตโนมัติ (IP Blocking)
                    </li>
                    <li>
                      <strong>ข้อมูลสถิติและการใช้งาน:</strong>{" "}
                      เราอาจเก็บข้อมูลพฤติกรรมการใช้งานในภาพรวม (Analytics)
                      เพื่อนำมาวิเคราะห์และปรับปรุงประสิทธิภาพระบบให้ดียิ่งขึ้น
                    </li>
                    <li>
                      <strong>ข้อมูล Combo (อีเมล/รหัสผ่าน):</strong> ระบบ{" "}
                      <strong>
                        ไม่มีการบันทึกหรือบันทึกข้อมูลรหัสผ่าน Combo
                        ตัวเต็มลงในฐานข้อมูลของเราเพื่อประโยชน์อื่นใด
                      </strong>{" "}
                      ข้อมูลในส่วนนี้จะถูกใช้เพื่อประมวลผลการจำลองในเบราว์เซอร์ของคุณ
                      หรือประมวลผลชั่วคราวและลบทิ้งทันที
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    2. คุกกี้ (Cookies) และ Local Storage
                  </h3>
                  <p>
                    เรามีการใช้งาน Local Storage
                    ในบราวเซอร์ของท่านเพื่อประโยชน์ในการจดจำการตั้งค่าระบบ,
                    จดจำประวัติการตรวจสอบชั่วคราว
                    ข้อมูลในส่วนนี้จะถูกเก็บอยู่ในเครื่องคอมพิวเตอร์
                    หรืออุปกรณ์ของคุณเอง
                    และไม่มีการดึงข้อมูลกลับมายังเซิร์ฟเวอร์ส่วนกลาง
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    3. การเปิดเผยข้อมูลแก่บุคคลที่สาม
                  </h3>
                  <p>
                    เราเคารพความเป็นส่วนตัวของคุณ{" "}
                    <strong>
                      เราจะไม่ขาย, แลกเปลี่ยน, หรือเปิดเผยข้อมูลเครดิต คีย์
                      หรือที่อยู่ IP ของคุณให้แก่บุคคลที่สาม
                    </strong>{" "}
                    โดยเด็ดขาด ยกเว้นในกรณีที่มีคำสั่งศาล
                    หรือต้องดำเนินการเพื่อปฏิบัติตามกฎหมาย
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    4. ยอมรับสถานะความปลอดภัย (Anti DevTools)
                  </h3>
                  <p className="mb-2">
                    ระบบมีการปรับใช้การบล็อคเครื่องมือสำหรับนักพัฒนาและการหน่วงแบบฟอร์มบางชนิด
                    ในการใช้งานเว็บไซต์ ถือว่าคุณยอมรับเงื่อนไขนี้
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    5. ข้อจำกัดความรับผิดชอบ
                  </h3>
                  <p className="text-[#1a7fe6] mb-2 font-medium">
                    เว็บไซต์เป็นเพียงเครื่องมือช่วยเหลือ
                    เครื่องมือจำลองเพื่อการตรวจสอบ (Simulation)
                    ไม่มีความเชื่อมโยงโดยตรงกับเซิร์ฟเวอร์ลิขสิทธิ์ใดๆ
                  </p>
                  <p>
                    ผู้พัฒนาไม่รับผิดชอบต่อความสูญเสีย ด้านตัวเงิน ข้อมูล
                    หรือตัวบัญชีจากการใช้งานเว็บไซต์
                    ซึ่งคุณต้องเป็นผู้นำไปใช้บนความเสี่ยงของคุณเอง
                  </p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 text-right">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 text-[#1E90FF] font-bold py-3 px-8 rounded-2xl transition-colors w-full sm:w-auto"
                >
                  เข้าใจและยอมรับ
                </button>
              </div>
            </div>
          </div>
        )}

        {showTerms && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm font-sans animate-in fade-in duration-200">
            <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <ListChecks className="w-6 h-6 shrink-0 text-[#1a7fe6]" />{" "}
                ข้อกำหนดการใช้งาน (Terms of Use)
              </h2>
              <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-300 flex-1">
                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    1. วัตถุประสงค์การใช้งานและตกลง
                  </h3>
                  <p>
                    เครื่องมือนี้จัดทำขึ้นเพื่อช่วยประหยัดเวลาในการตรวจสอบ บัญชี
                    รหัส หรือคีย์ต่างๆ{" "}
                    <strong>
                      ผู้ใช้จะต้องเป็นเจ้าของข้อมูลหรือได้รับอนุญาตในการตรวจสอบข้อมูลเหล่านี้เท่านั้น
                    </strong>{" "}
                    การนำเครื่องมือไปใช้งานในเชิงละเมิดสิทธิผู้อื่นถือเป็นความรับผิดชอบของคุณแต่เพียงผู้เดียว
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    2. ข้อห้ามและการละเมิดขั้นร้ายแรง
                  </h3>
                  <p className="mb-1">
                    ในระหว่างการใช้งานเว็บไซต์ คุณตกลงที่จะละเว้นการกระทำดังนี้:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>ห้ามดัดแปลง หรือเจาะระบบ:</strong>{" "}
                      ห้ามทำการทำวิศวกรรมย้อนกลับ (Reverse Engineering),
                      ซับเน็ตสแกนเนอร์, หรือพยายามเรียก API
                      ของระบบโดยตรงโดยไม่ผ่านหนาเว็บไซต์
                    </li>
                    <li>
                      <strong>ห้ามทำ DDoS/Bot Abuse:</strong>{" "}
                      ห้ามใช้สคริปต์อัตโนมัติ หุ่นยนต์เพื่อกระหน่ำยิง Request
                      ซึ่งอาจส่งผลเสียต่อการให้บริการส่วนรวม
                    </li>
                    <li>
                      <strong>ห้ามนำไปประกอบธุรกิจทุจริต:</strong>{" "}
                      ไม่คัดลอกบัญชีที่ไม่ใช่ของตนไปค้าขายอย่างละเมิดกฎหมาย
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    3. สิทธิ์การระงับการเข้าถึง (Ban/IP Block)
                  </h3>
                  <p>
                    ทีมงานขอสงวนสิทธิ์ในการระงับบัญชีผู้ใช้ บล็อก IP Address
                    หรือเพิกถอนสิทธิ์การใช้งาน (Ban) ในทันที
                    โดยไม่ต้องแจ้งให้ทราบล่วงหน้าและไม่ชดเชยค่าเสียหายใดๆ
                    หากเราตรวจพบพฤติการณ์ละเมิดด้านความปลอดภัย หรือมีปริมาณ
                    Request มากเกินกว่าที่ระบบรองรับ (Rate Limit)
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    4. การยกเว้นความรับผิดชอบ
                  </h3>
                  <p>
                    เราไม่รับประกัน 100%
                    ว่าผลลัพธ์ข้อมูลที่ตรวจสอบแล้วจะถูกต้องแม่นยำเสมอไป
                    และเว็บไซต์ไม่มีความเกี่ยวข้องใดๆ
                    หากบัญชีเป้าหมายของคุณถูกแบนจากแพลตฟอร์มต้นทาง{" "}
                    <strong>
                      (การใช้งานอาจขัดต่อ ToS ของผู้ให้บริการปลายทาง)
                    </strong>
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base mb-2">
                    5. การปรับปรุงและการเปลี่ยนแปลงข้อตกลง
                  </h3>
                  <p>
                    เราอาจพิจารณาปรับปรุงข้อกำหนดส่วนนี้โดยไม่จำเป็นต้องแจ้งให้คุณทราบล่วงหน้า
                    ในกรณีที่มีการคืนเงิน หรือปรับเปลี่ยนเครดิตในเว็บไซต์
                    จะถูกตัดสินโดยดุลพินิจสูงสุดของทีมงาน
                  </p>
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 text-right w-full">
                <button
                  onClick={() => setShowTerms(false)}
                  className="bg-[#1E90FF] hover:bg-[#166bcc] text-white font-bold py-3 px-8 rounded-2xl transition-colors w-full sm:w-auto"
                >
                  ข้าพเจ้ายอมรับข้อกำหนด
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
            <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative overflow-hidden flex flex-col items-center">
              <div className="bg-[#0a0d12] border border-white/5 rounded-2xl mb-2 relative overflow-hidden w-full h-[58px]">
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
                    <div className="p-3 bg-[#1E90FF]/20 text-[#1E90FF] rounded-xl text-center text-[10px] font-bold w-full mx-8">
                      ยังไม่ได้ตั้งค่า VITE_TURNSTILE_SITE_KEY (Bypass Mode
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
                  className="w-full bg-[#1E90FF] hover:bg-[#1a7fe6] text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm mb-4"
                >
                  ดำเนินการต่อ (Bypass)
                </button>
              )}
              <button
                onClick={() => setShowTurnstileModal(false)}
                className="text-[10px] font-bold text-zinc-400 hover:text-zinc-400 transition-colors uppercase tracking-widest mt-2"
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
                setActiveView("history");
              }
            }}
          />
        )}

        {/* Global Spotify Audio Player */}
        {siteSettings.spotify_url && (
          <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">
             <button 
               onClick={() => setIsMusicExpanded(!isMusicExpanded)}
               className={`w-12 h-12 rounded-2xl bg-[#0b0e14]/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-emerald-500 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isMusicExpanded ? 'rotate-90' : ''}`}
               title="เปิด/ปิด แถบเพลง"
             >
                <Music className="w-5 h-5" />
             </button>

             <div className={`transition-all duration-500 transform origin-bottom-right ${isMusicExpanded || siteSettings.spotify_autoplay ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-50 pointer-events-none'}`}>
                <div className="bg-[#0b0e14]/90 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl overflow-hidden w-[300px] h-[80px]">
                    <iframe 
                      src={siteSettings.spotify_url.includes('spotify.com/embed') 
                        ? siteSettings.spotify_url + (siteSettings.spotify_url.includes('?') ? '&' : '?') + 'autoplay=1'
                        : `https://open.spotify.com/embed/${siteSettings.spotify_url.split('spotify.com/')[1].split('?')[0]}?autoplay=1`
                      } 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                      className="rounded-xl"
                    ></iframe>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </>
  );
}

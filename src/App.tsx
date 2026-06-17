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
  Image as ImageIcon,
  LogIn,
  UserPlus,
  ArrowUpRight,
  Zap,
  Music,
  ShieldCheck,
  ShoppingBag,
  Bell,
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
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429
    );
  },
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
      !originalRequest.url?.includes("/api/signup") &&
      !originalRequest.url?.includes("/api/reset-password")
    ) {
      originalRequest._retry = true;
      try {
        const {
          data: { session },
          error: refreshError,
        } = await auth.auth.getSession();
        if (session?.access_token && !refreshError) {
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${session.access_token}`;
          originalRequest.headers["Authorization"] =
            `Bearer ${session.access_token}`;
          return axios(originalRequest);
        }
      } catch (refreshErr) {
        console.error("JWT Refresh failed:", refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

type SupabaseUser = any;
import { Turnstile } from "@marsidev/react-turnstile";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useToastStore } from "./lib/toastStore";
import { ToastContainer } from "./components/ui/Toast";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { UserPlan } from "./types";
const KeyModal = lazy(() =>
  import("./components/modals/KeyModal").then((m) => ({ default: m.KeyModal })),
);
const ReceiptModal = lazy(() =>
  import("./components/modals/ReceiptModal").then((m) => ({
    default: m.ReceiptModal,
  })),
);
const PopupBanner = lazy(() =>
  import("./components/PopupBanner").then((m) => ({ default: m.PopupBanner })),
);
import { Product, SiteStats, Category } from "./types";
import {
  PrivacyModal,
  TermsModal,
  ContactUsModal,
} from "./components/modals/PolicyModals";
import { PrivacyView, TermsView } from "./components/PolicyViews";
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

const ProfileView = lazy(() =>
  import("./components/ProfileView").then((m) => ({ default: m.ProfileView })),
);
const CategoriesView = lazy(() =>
  import("./components/CategoriesView").then((m) => ({
    default: m.CategoriesView,
  })),
);
const AuthView = lazy(() =>
  import("./components/AuthView").then((m) => ({ default: m.AuthView })),
);
const HomeView = lazy(() =>
  import("./components/HomeView").then((m) => ({ default: m.HomeView })),
);
const ProductDetailView = lazy(() =>
  import("./components/ProductDetailView").then((m) => ({
    default: m.ProductDetailView,
  })),
);
const MyOrdersView = lazy(() =>
  import("./components/MyOrdersView").then((m) => ({
    default: m.MyOrdersView,
  })),
);
const CategoryProductsView = lazy(() =>
  import("./components/CategoryProductsView").then((m) => ({
    default: m.CategoryProductsView,
  })),
);
const SearchView = lazy(() =>
  import("./components/SearchView").then((m) => ({ default: m.SearchView })),
);

import {
  SkeletonHomeLoader,
  SkeletonGenericLoader,
} from "./components/SkeletonLoader";

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
const ContactView = lazy(() =>
  import("./components/ContactView").then((module) => ({
    default: module.ContactView,
  })),
);
const settingsImport = () => import("./components/SettingsView");
const SettingsView = lazy(() =>
  settingsImport().then((module) => ({
    default: module.SettingsView,
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
    <div className="px-3 py-1 bg-[#09090b] border border-[#1e1e1e] border text-xs font-mono text-muted-foreground font-medium">
      {elapsedTime}
    </div>
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
      contact_line:
        "https://www.facebook.com/share/18emwBsqUf/?mibextid=wwXIfr",
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
      announcement_text:
        "ยินดีต้อนรับสู่ APEXSTORE ศูนย์รวมสินค้าไอดีและข้อเสนอยอดฮิต ระบบซื้อขายทำงานอัตโนมัติ 24 ชั่วโมง - กรณีมีปัญหาโปรดติดต่อแอดมิน",
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
      imageUrl:
        "https://play-lh.googleusercontent.com/rM1oIokbH_9EwF0mDtsmEPRN7Fh-XItK12oXYeU24QfI9gS-9rEch_7sA-C9oO0z4a8=w240-h480-rw",
      description:
        "ประวัติขาวสะอาด ไม่เคยโดนแบน ฮีโร่ครบ สกินเพียบพร้อมรูนเลเวล 90 ทุกสาย",
      isPopular: true,
    },
    {
      id: "netflix_4k",
      name: "Netflix Premium Ultra HD 4K (30 วัน - จอส่วนตัว)",
      price: 139,
      originalPrice: 199,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 12,
      soldCount: 945,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png",
      description:
        "ความละเอียด 4K HDR เสียงรอบทิศทาง ใช้งานส่วนตัว เสถียรสูง 100% ตลอดทั้งเดือน",
      isPopular: true,
    },
    {
      id: "youtube_premium",
      name: "YouTube Premium 4K (30 วัน - บัญชีส่วนตัวความปลอดภัยสูง)",
      price: 39,
      originalPrice: 69,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 24,
      soldCount: 1248,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg",
      description:
        "ไม่มีโฆษณาคั่นอย่างสมบูรณ์ เล่นขณะปิดหน้าจอได้ แถมบริการเสริม Youtube Music HQ",
      isPopular: true,
    },
    {
      id: "discord_nitro",
      name: "Discord Nitro Premium Gift (1 เดือน - บัญชีแท้ 100%)",
      price: 119,
      originalPrice: 320,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 8,
      soldCount: 231,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/c/ca/Discord_Color_Logo.svg",
      description:
        "รับบูสเซิร์ฟเวอร์ฟรี x2 สติกเกอร์เคลื่นไหว อีโมจิพิเศษทุกเซิร์ฟ และแชร์จอ 1080p 60fps",
      isPopular: true,
    },
    {
      id: "spotify_premium",
      name: "Spotify Premium Personal (30 วัน - ปลดล็อคเสียงระดับ Hi-Fi)",
      price: 29,
      originalPrice: 129,
      category: "แอปพรีเมียม / บันเทิง",
      stock: 18,
      soldCount: 412,
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
      description:
        "ดาวน์โหลดเพลงฟังแบบออฟไลน์ บิตเรตเสียงคมชัดสูงสุด 320kbps ข้ามเพลงแบบไร้ขีดจำกัด",
      isPopular: false,
    },
  ];

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("apex_products_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Caught error:", e);
    }
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
    } catch (e) {
      console.warn("Failed to parse apex_stats_cache", e);
      localStorage.removeItem("apex_stats_cache");
      return defaultStats;
    }
  });

  const [customPages, setCustomPages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("apex_pages_cache");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Failed to parse cache", e);
      return [];
    }
  });

  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("apex_categories_cache");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0)
          return sanitizeCategories(parsed);
      }
    } catch (e) {
      console.error("Caught error:", e);
    }
    return [
      {
        id: "premium_app",
        name: "แอปพรีเมียม / บันเทิง",
        title: "แอปพรีเมียม / บันเทิง",
      },
      { id: "gaming_id", name: "ไอดีเกมส์ยอดนิยม", title: "ไอดีเกมส์ยอดนิยม" },
      {
        id: "license_key",
        name: "คีย์ใบอนุญาต / โปรแกรม",
        title: "คีย์ใบอนุญาต / โปรแกรม",
      },
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
    | "admin"
    | "profile"
    | "logs"
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
    | "vip_logs"
    | "free_logs"
    | "my_orders"
    | "privacy"
    | "terms";

  const [language, setLanguage] = useState<"th" | "en">("th");

  const [activeView, setRawActiveView] = useState<ViewType>(() => {
    let path = window.location.pathname;
    if (path.startsWith("/accounts/signin")) return "login";

    let targetPath = path.replace("/", "");
    const parts = targetPath.split("/").filter(Boolean);
    if (parts[0] === "th" || parts[0] === "en") {
      targetPath = parts[1] || "home";
    }
    if (targetPath === "" || targetPath === "th" || targetPath === "en")
      return "home";

    const hostname = window.location.hostname;
    if (hostname.startsWith("account.")) return "login";
    if (hostname.startsWith("dash.")) return "dashboard";

    // Fallback views mapping handled in useEffect mostly, but initial load logic here:
    if (targetPath === "register") return "signup";
    if (targetPath === "topup") return "wallet";
    if (targetPath === "store") return "categories";

    const validViews = [
      "landing",
      "home",
      "search",
      "categories",
      "category_products",
      "dashboard",
      "admin",
      "profile",
      "logs",
      "history",
      "wallet_history",
      "order_history",
      "random_history",
      "settings",
      "contact",
      "login",
      "signup",
      "wallet",
      "redeem",
      "product_detail",
      "custom_page",
      "log_categories",
      "vip_logs",
      "free_logs",
      "my_orders",
    ];
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
        newPath = `/${language}${pathSuffix ? "/" + pathSuffix : ""}`;
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

      const parts = path.split("/").filter(Boolean);
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
        "admin",
        "profile",
        "logs",
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
        "my_orders",
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
        const p = products.find((prod) => prod.id === pid);
        if (p && activeView !== "product_detail") {
          setSelectedProductId(pid);
          setRawActiveView("product_detail");
          window.history.replaceState(
            null,
            "",
            "/product_detail?product=" + pid,
          );
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

  const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
  const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : null;

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
      duration: 3000,
    });
  };
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isDesktopToolsOpen, setIsDesktopToolsOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      timeout = setTimeout(() => {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }, 300);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const [vipTab, setVipTab] = useState<"key">("key");

  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);

  const [topupHistory, setTopupHistory] = useState<any[]>([]);

  const [purchasesNextCursor, setPurchasesNextCursor] = useState<string | null>(
    null,
  );
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
        opts.forEach((o) => {
          optionsObject[o] = o;
        });

        const result = await Swal.fire({
          title: "เลือกประเภทไอดีที่ต้องการ Pre-Order",
          input: "select",
          inputOptions: optionsObject,
          inputPlaceholder: "กรุณาเลือกประเภทไอดี...",
          showCancelButton: true,
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          inputValidator: (value) => {
            return !value ? "กรุณาเลือกประเภทไอดีเพื่อดำเนินการต่อ" : "";
          },
          background: "#09090b",
          color: "#fff",
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#27272a",
        });

        if (result.isDismissed || !result.value) {
          return; // Cancel purchase
        }
        selectedOption = result.value;
      } else {
        // Text input as fallback
        const result = await Swal.fire({
          title: "ระบุประเภทไอดีที่ต้องการ Pre-Order",
          input: "text",
          inputPlaceholder: "ระบุประเภทรหัส/ไอดี เช่น เลเวล 30, ไอดีสะอาด...",
          showCancelButton: true,
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          inputValidator: (value) => {
            return !value ? "กรุณาระบุรายละเอียดเพื่อดำเนินการต่อ" : "";
          },
          background: "#09090b",
          color: "#fff",
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#27272a",
        });

        if (result.isDismissed || !result.value) {
          return; // Cancel purchase
        }
        selectedOption = result.value;
      }
    }

    try {
      const idempotencyKey = `buy_${product.id}_${Date.now()}_${Math.random()}`;
      const res = await axios.post(
        "/api/buy",
        {
          productId: product.id,
          quantity,
          preOrderOption: selectedOption,
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
        },
      );
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
        axios
          .get("/api/products")
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
          })
          .catch(console.error);
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: errorMessage || "ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่",
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
      setIsAdmin(false);

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
              role: "Member",
            };
            setUserPlan(initialPlan);

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
              role: "Member",
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

      console.log("Fetching public data from backend...", {
        reqId: currentRequestId,
      });
      console.time(`fetchAllData-${currentRequestId}`);

      const publicAxios = axios.create();
      publicAxios.interceptors.request.use((config) => {
        if (config.headers) {
          if (
            "common" in config.headers &&
            typeof config.headers.common === "object" &&
            config.headers.common !== null
          ) {
            delete (config.headers.common as any)["Authorization"];
          }
          if ("Authorization" in config.headers) {
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
            return { data: null, error: "stale" };
          }

          return { data: res.data, error: null };
        } catch (e: any) {
          if (axios.isCancel(e)) return { data: null, error: "canceled" };
          if (currentRequestId !== fetchRequestId.current)
            return { data: null, error: "stale" };
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
        "/api/pages",
      ];

      const mainFetchPromise = Promise.all(
        publicEndpoints.map((url) =>
          publicAxios
            .get(url, { signal: controller.signal })
            .then((res) => ({ url, data: res.data, isCanceled: false }))
            .catch((err) => {
              if (axios.isCancel(err)) {
                return { url, data: null, isCanceled: true };
              }
              console.error(
                `Parallel fetch error for public endpoint ${url}:`,
                err,
              );
              return { url, data: null, isCanceled: false };
            }),
        ),
      ).then((results) => {
        if (currentRequestId !== fetchRequestId.current) return;

        for (const res of results) {
          if (res.isCanceled) continue;

          if (res.url === "/api/settings" && res.data) {
            setSiteSettings(res.data);
            try {
              localStorage.setItem(
                "apex_settings_cache",
                JSON.stringify(res.data),
              );
            } catch (e) {
              console.error("Caught error:", e);
            }
          } else if (
            res.url === "/api/products" &&
            res.data &&
            Array.isArray(res.data)
          ) {
            const finalProds = res.data;
            setProducts(finalProds);
            try {
              localStorage.setItem(
                "apex_products_cache",
                JSON.stringify(finalProds),
              );
            } catch (e) {
              console.error("Caught error:", e);
            }
          } else if (
            res.url === "/api/categories" &&
            res.data &&
            Array.isArray(res.data)
          ) {
            const sanitized = sanitizeCategories(res.data);
            setCategories(sanitized);
            try {
              localStorage.setItem(
                "apex_categories_cache",
                JSON.stringify(sanitized),
              );
            } catch (e) {
              console.error("Caught error:", e);
            }
          } else if (res.url === "/api/stats" && res.data) {
            const statsObj = {
              users: res.data.users,
              stock: res.data.stock,
              sales: res.data.sales,
              topups: res.data.totalTopupsAmount,
              totalOrders: res.data.totalOrders,
            };
            setSiteStats(statsObj);
            try {
              localStorage.setItem(
                "apex_stats_cache",
                JSON.stringify(statsObj),
              );
            } catch (e) {
              console.error("Caught error:", e);
            }
          } else if (res.url === "/api/pages" && res.data) {
            const d = res.data;
            const pagesToSet = Array.isArray(d)
              ? d
              : d.data && Array.isArray(d.data)
                ? d.data
                : [];
            setCustomPages(pagesToSet);
            try {
              localStorage.setItem(
                "apex_pages_cache",
                JSON.stringify(pagesToSet),
              );
            } catch (e) {
              console.error("Caught error:", e);
            }
          }
        }
      });

      // 2. Secondary Data & User Data
      const logsPromise = fetchApi("/api/logs-system").then((res) => {
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
        axios.get("/api/topups").catch(() => null),
      ]);
      if (usedKeysRes?.data) setUsedKeysHistory(usedKeysRes.data);
      if (purchasesRes?.data) {
        let purchaseData = Array.isArray(purchasesRes.data)
          ? purchasesRes.data
          : purchasesRes.data.data;
        if (Array.isArray(purchaseData)) {
          purchaseData = purchaseData.map((p: any) => {
            let name = p.productName;
            try {
              if (typeof name === 'string' && name.trim().startsWith('{')) {
                const parsed = JSON.parse(name);
                name = parsed.n || parsed.name || name;
              }
            } catch (e) {}
            return { ...p, productName: name };
          });
          setPurchaseHistory(purchaseData);
          if (purchasesRes.data.nextCursor) {
            setPurchasesNextCursor(purchasesRes.data.nextCursor);
          }
        }
      }
      if (topupsRes?.data && Array.isArray(topupsRes.data))
        setTopupHistory(topupsRes.data);
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
        axios.get("/api/users").catch(() => null),
      ]);
      if (licensesRes?.data) setLicenseKeys(licensesRes.data);
      if (blockedIpsRes?.data) setBlockedIPs(blockedIpsRes.data);
      if (usersRes?.data && Array.isArray(usersRes.data))
        setUsersList(usersRes.data);
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
      isAdmin ? fetchAdminData() : Promise.resolve(),
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
      const savedUserPlan = localStorage.getItem("checker_userplan_main");
      if (savedUserPlan) setUserPlan(JSON.parse(savedUserPlan));

      // Fast check if cache resources exist to bypass loading screen delays
      const hasCachedStats = !!localStorage.getItem("apex_stats_cache");
      const hasCachedProducts = !!localStorage.getItem("apex_products_cache");
      const hasCachedCategories = !!localStorage.getItem(
        "apex_categories_cache",
      );
      const isCacheAvailable =
        hasCachedStats && hasCachedProducts && hasCachedCategories;

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
          axios
            .get("/api/health")
            .then((res) => {
              const ip = res.data.clientIp || "Unknown";
              setClientIp(ip);
            })
            .catch((err) => {
              setClientIp("offline_local");
              console.error("IP Check Failed", err);
            }),
          fetchAllData(),
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

  const [useCustomCursor, setUseCustomCursor] = useState(() => {
    // Disable custom cursor automatically on touch devices (pointer: coarse)
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return false;
    }
    const saved = localStorage.getItem("apexstore_custom_cursor");
    return saved !== "false"; // default to true
  });

  const toggleCustomCursor = () => {
    setUseCustomCursor((prev) => {
      const next = !prev;
      localStorage.setItem("apexstore_custom_cursor", String(next));
      if (!next) {
        document.body.style.cursor = "auto";
        document.documentElement.style.cursor = "auto";
        // Remove style tag if existing
        const styleId = "custom-cursor-style-override";
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
      case "home":
        return "หน้าหลัก";
      case "categories":
        return "สินค้าทั้งหมด";
      case "category_products":
        return "หมวดหมู่สินค้า";
      case "product_detail":
        return "รายละเอียดสินค้า";
      case "wallet":
        return "เติมเงิน";
      case "my_orders":
        return "คำสั่งซื้อของฉัน";
      case "settings":
        return "การตั้งค่าผู้ใช้";
      case "wallet_history":
        return "ประวัติเติมเงิน";
      case "random_history":
        return "ประวัติการสุ่มสินค้า";
      case "privacy":
        return "นโยบายความเป็นส่วนตัว";
      case "terms":
        return "ข้อกำหนดการใช้งาน";
      case "admin":
        return "จัดการหลังบ้าน";
      default:
        return "APEXSTORE";
    }
  };

  const isHomeViewReady =
    (Array.isArray(products) &&
      Array.isArray(categories) &&
      siteSettings !== null) ||
    forceReveal;
  const isLoadingSkeleton = !isHomeViewReady && !dbErrorDetail;

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-[#050505]/80 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isLoaded && <PortalLoader key="portal" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.8 }}
        className="min-h-screen w-full flex flex-col lg:flex-row-reverse relative"
      >
        {useCustomCursor && <CustomCursor />}
        {/* Popup banner removed as requested */}

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col bg-[#1e1e1e] h-screen sticky top-0 shrink-0 overflow-hidden no-scrollbar z-[70] select-none text-[13px] transition-all duration-300 ease-in-out ${isDesktopSidebarOpen ? 'w-[260px] border-l border-[#1e1e1e]' : 'w-0 border-l-0 border-transparent'}`}>
          <div className="w-[260px] h-full flex flex-col no-scrollbar shrink-0 p-4 text-[#e3e3e3] bg-[#1e1e1e]">
            {/* Header */}
            <div 
              className="flex items-center justify-between mb-8 px-2 cursor-pointer hover:bg-white/5 py-2.5 rounded-lg transition-colors shrink-0"
              onClick={handleLogoClick}
            >
              <div className="flex items-center gap-3">
                <img src="https://img2.pic.in.th/DFB0841D-C86A-45E7-B08A-D626DD682DD1.png" alt="APEXSTORE Logo" className="h-10 object-contain" />
              </div>
              <ChevronDown size={20} className="text-zinc-500" />
            </div>

            {/* Main Navigation */}
            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pr-0.5">
              {/* EXPLORE Section */}
              <section>
                <h2 className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Explore</h2>
                <div className="space-y-1">
                  {/* Home (Playground) */}
                  <button
                    onClick={() => {
                      setActiveView("home");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${activeView === "home" ? "bg-white/[0.08] text-white" : "text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Terminal size={18} className={activeView === "home" ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"} />
                      <span className="text-sm font-medium">หน้าแรก (Home)</span>
                    </div>
                  </button>

                  {/* History */}
                  <button
                    onClick={() => {
                      if (user) {
                        setActiveView("history");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        import("sweetalert2").then((s) =>
                          s.default.fire({
                            icon: "info",
                            title: "จำเป็นต้องเข้าสู่ระบบ",
                            text: "กรุณาเข้าสู่ระบบก่อนเพื่อดูประวัติการสั่งซื้อ",
                            showCancelButton: true,
                            confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                            cancelButtonText: "ยกเลิก",
                            confirmButtonColor: "#10b981"
                          }).then((result) => {
                            if (result.isConfirmed) {
                              setActiveView("login");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          })
                        );
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${activeView === "history" || activeView === "my_orders" ? "bg-white/[0.08] text-white" : "text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <History size={18} className={activeView === "history" || activeView === "my_orders" ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"} />
                      <span className="text-sm font-medium">ประวัติการสั่งซื้อ</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* BUILD Section */}
              <section>
                <h2 className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Build</h2>
                <div className="space-y-1">
                  {/* Topup button styled precisely like the prominent rounded button */}
                  <button
                    onClick={() => {
                      if (user) {
                        setActiveView("wallet");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        import("sweetalert2").then((s) =>
                          s.default.fire({
                            icon: "info",
                            title: "จำเป็นต้องเข้าสู่ระบบ",
                            text: "กรุณาเข้าสู่ระบบก่อนเพื่อใช้งานเมนูเติมเงิน",
                            showCancelButton: true,
                            confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                            cancelButtonText: "ยกเลิก",
                            confirmButtonColor: "#10b981"
                          }).then((result) => {
                            if (result.isConfirmed) {
                              setActiveView("login");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          })
                        );
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 bg-[#333333] hover:bg-[#444444] text-white rounded-xl cursor-pointer mb-2 transition-colors font-sans"
                  >
                    <Plus size={18} className="text-white" />
                    <span className="font-semibold text-sm">เติมเงิน (Topup)</span>
                  </button>

                  {/* All products (My apps) */}
                  <button
                    onClick={() => {
                      setActiveView("categories");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${activeView === "categories" || activeView === "category_products" ? "bg-white/[0.08] text-white" : "text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={18} className={activeView === "categories" || activeView === "category_products" ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"} />
                      <span className="text-sm font-medium">สินค้าทั้งหมด</span>
                    </div>
                  </button>

                  {/* Gallery section */}
                  <button
                    onClick={() => {
                      setActiveView("categories");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon size={18} className="text-zinc-400 group-hover:text-zinc-200" />
                      <span className="text-sm font-medium">ภาพแกลเลอรีสินค้า</span>
                    </div>
                  </button>
                </div>
              </section>

              {/* MANAGE Section */}
              <section>
                <h2 className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Manage</h2>
                <div className="space-y-1">
                  {/* Dashboard (Admin view) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setActiveView("admin");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${activeView === "admin" ? "bg-white/[0.08] text-white" : "text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"}`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className={activeView === "admin" ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"} />
                        <span className="text-sm font-medium">จัดการระบบ (Admin)</span>
                      </div>
                      <ChevronRight size={16} className="text-[#9e9e9e]" />
                    </button>
                  )}

                  {/* Profile */}
                  <button
                    onClick={() => {
                      if (user) {
                        setActiveView("profile");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        setActiveView("login");
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors group ${activeView === "profile" ? "bg-white/[0.08] text-white" : "text-[#9e9e9e] hover:text-[#e3e3e3] hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <User size={18} className={activeView === "profile" ? "text-[#10b981]" : "text-zinc-400 group-hover:text-zinc-200"} />
                      <span className="text-sm font-medium">โปรไฟล์ของฉัน</span>
                    </div>
                    <ChevronRight size={16} className="text-[#9e9e9e]" />
                  </button>
                </div>
              </section>
            </div>

            {/* Footer Area */}
            <div className="mt-auto pt-4 space-y-4 shrink-0">
              {/* Upgrade Card / Premium Plan description */}
              <div 
                onClick={() => {
                  import("sweetalert2").then((s) => s.default.fire({
                    title: "👑 สมาชิกพรีเมียม (Premium Status)",
                    html: `
                      <div class="text-left text-sm space-y-2 leading-relaxed text-zinc-300">
                        <p class="font-semibold text-[#10b981] mb-2">• ได้รับสิทธิ์ในการซื้อคีย์แบบจำกัดจำนวนล่วงหน้า!</p>
                        <p>• รับคูปองลุ้นรับสินค้าฟรีและส่วนลดเติมเงินสะสมสูงสุด 20%</p>
                        <p>• บริการหลังการขายพรีเมียมและการรับประกันสิทธิประโยชน์!</p>
                      </div>
                    `,
                    background: "#1e1e1e",
                    color: "#fff",
                    confirmButtonColor: "#10b981",
                    confirmButtonText: "รับทราบ"
                  }));
                }}
                className="relative p-[1px] rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 cursor-pointer shadow-lg hover:shadow-purple-500/10 transition-shadow active:scale-[0.98]"
              >
                <div className="bg-[#1e1e1e] p-4 rounded-[15px] space-y-1">
                  <h3 className="text-sm font-medium text-white">Upgrade to unlock more</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Access higher limits, Pro features, and custom services.
                  </p>
                </div>
              </div>

              {/* Action Icons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Bell icon */}
                <button 
                  onClick={() => {
                    import("sweetalert2").then((s) => s.default.fire({
                      title: "📢 ข่าวสารการประกาศ",
                      text: "ขณะนี้หน้าร้านจัดส่งสติกเกอร์บูสเซิร์ฟเวอร์แบบออโต้ 100% สิทธิ์รับประกันคีย์ใช้งานมีผลทันทีหลังจากกดคัดลอก!",
                      background: "#1e1e1e",
                      color: "#fff",
                      confirmButtonColor: "#10b981"
                    }));
                  }}
                  className="flex items-center justify-center p-2 rounded-lg border border-zinc-700 bg-[#1e1e1e] hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                >
                  <Bell size={18} />
                </button>

                {/* Settings icon */}
                <button 
                  onClick={() => {
                    if (user) {
                      setActiveView("settings");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      setActiveView("login");
                    }
                  }}
                  className={`flex items-center justify-center p-2 rounded-lg border border-zinc-700 transition-colors ${activeView === "settings" ? "bg-white/[0.08] text-white" : "bg-[#1e1e1e] hover:bg-white/5 text-gray-400 hover:text-white"}`}
                >
                  <Settings size={18} />
                </button>

                {/* Search icon */}
                <button 
                  onClick={() => {
                    setActiveView("categories");
                    setTimeout(() => {
                      const searchInput = document.querySelector('input[placeholder="ค้นหาสินค้า..."]') as HTMLInputElement;
                      if (searchInput) searchInput.focus();
                    }, 100);
                  }}
                  className="flex items-center justify-center p-2 rounded-lg border border-zinc-700 bg-[#1e1e1e] hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                >
                  <Search size={18} />
                </button>

                {/* Key icon to redeem gift cards */}
                <button 
                  onClick={() => {
                    if (user) {
                      setActiveView("profile");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      import("sweetalert2").then((s) => s.default.fire({
                        title: "🔑 เปิดใช้งานคีย์สต็อก",
                        text: "คุณสามารถเปิดใช้งานคีย์หรือกิฟต์การ์ดที่ได้รับในหน้าเมนู 'โปรไฟล์' หรือใช้คีย์โดยตรงบนหน้าแผงควบคุม",
                        icon: "info",
                        background: "#1e1e1e",
                        color: "#fff",
                        confirmButtonColor: "#10b981"
                      }));
                    } else {
                      setActiveView("login");
                    }
                  }}
                  className="flex items-center justify-center p-2 rounded-lg border border-zinc-700 bg-[#1e1e1e] hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                >
                  <Key size={18} />
                </button>
              </div>

              {/* User Profile avatar/info */}
              {user ? (
                <div 
                  onClick={() => {
                    setActiveView("profile");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-650 overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={getAvatarUrl(user?.id || userPlan?.username || user?.email?.split("@")[0] || "U")} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm truncate text-gray-300 font-medium">
                      {userPlan?.username || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono font-medium truncate">
                      {Math.floor(userPlan?.balance || 0).toLocaleString()} ฿
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setActiveView("login");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400 font-medium font-sans">เข้าสู่ระบบ / สมัครสมาชิก</span>
                </div>
              )}

              {/* Logout Option */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 justify-center px-3 py-2 rounded-lg transition-colors text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                </button>
              )}
            </div>
          </div>
        </aside>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 relative transition-all duration-300">
          {/* Top Header */}
          <header className="sticky top-0 z-[100] w-full bg-[#050505]/40 backdrop-blur-2xl saturate-150 border-b border-[#1e1e1e] flex-shrink-0 select-none">
            <div className="flex items-center justify-between h-[150px] md:h-[165px] px-4 md:px-8 mx-auto w-full">
              {/* Left Section: Mobile Logo + Desktop Toggle */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                  className="hidden lg:flex w-11 h-11 flex-col justify-center items-center gap-[5px] bg-[#1c1c1e]/40 hover:bg-[#2c2c2e]/60 active:bg-white/[0.1] border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-pointer rounded-xl text-white shadow-md relative group"
                  aria-label="Toggle Sidebar"
                >
                  <motion.div
                    animate={{
                      rotate: isDesktopSidebarOpen ? 0 : 0,
                      y: 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-5.5 h-[2px] bg-zinc-300 rounded-full group-hover:bg-white"
                  />
                  <motion.div
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-5.5 h-[2px] bg-zinc-300 rounded-full group-hover:bg-white"
                  />
                  <motion.div
                    animate={{
                      rotate: 0,
                      y: 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-5.5 h-[2px] bg-zinc-300 rounded-full group-hover:bg-white"
                  />
                </motion.button>
                
                <div
                  className="flex items-center gap-3 select-none flex-shrink-0 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200 group lg:hidden"
                  onClick={() => {
                    setActiveView("home");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <div className="flex items-center">
                    <img src="https://img2.pic.in.th/DFB0841D-C86A-45E7-B08A-D626DD682DD1.png" alt="APEXSTORE Logo" className="h-[120px] md:h-[135px] select-none object-contain" />
                  </div>
                </div>
              </div>

              <div
                className="hidden lg:flex items-center gap-2 select-none"
                style={{ display: "none" }}
              >
                <span className="text-sm font-semibold tracking-[0.1em] text-white/90 uppercase">
                  {getViewTitle()}
                </span>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Search Pill Button */}
                <button
                  onClick={() => setShowSearchPopup(true)}
                  className="h-[38px] md:h-10 px-4 md:px-5 rounded-full flex items-center gap-2 md:gap-2.5 text-zinc-400 hover:text-white bg-[#0e0e11]/60 hover:bg-white/[0.04] border border-[#1e1e1e] hover:border-[#2e2e34] transition-all duration-200 active:scale-95 cursor-pointer select-none"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-xs md:text-sm font-sans tracking-wide text-zinc-400">
                    ค้นหาสินค้า
                  </span>
                </button>

                {/* Hamburger Trigger */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="w-11 h-11 flex flex-col justify-center items-center gap-[5.5px] bg-[#1c1c1e]/40 hover:bg-[#2c2c2e]/60 active:bg-white/[0.1] border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-pointer rounded-xl ml-1 lg:hidden text-white relative z-[140] shadow-md"
                  aria-label="Menu"
                >
                  <motion.div
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 7.5 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className="w-5.5 h-[2px] bg-white rounded-full"
                  />
                  <motion.div
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      scale: isMobileMenuOpen ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-5.5 h-[2px] bg-white rounded-full"
                  />
                  <motion.div
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -7.5 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                    className="w-5.5 h-[2px] bg-white rounded-full"
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
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-[#000000]/50 backdrop-blur-3xl saturate-150 z-[120] lg:hidden"
                />
                <motion.div
                  key="sidebar"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="fixed top-0 right-0 bottom-0 h-screen w-full max-w-[320px] bg-[#101014] z-[130] flex flex-col lg:hidden overflow-y-auto no-scrollbar border-l border-[#1e1e1e] shadow-2xl"
                >
                  {/* Mobile Sidebar Header with Logo and Close Icon */}
                  <div className="flex items-center justify-between h-[150px] px-6 border-b border-[#1e1e1e]/60 shrink-0 select-none">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12, duration: 0.2 }}
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        setActiveView("home");
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <div className="flex items-center">
                        <img src="https://img2.pic.in.th/DFB0841D-C86A-45E7-B08A-D626DD682DD1.png" alt="APEXSTORE Logo" className="h-[110px] object-contain select-none" />
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, rotate: -30, scale: 0.9 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      transition={{
                        delay: 0.15,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      whileHover={{ scale: 1.08, rotate: 90 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-[#1e1e1e] transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 px-3 space-y-3 overflow-y-auto no-scrollbar pb-5 mt-2 select-none text-[14px]">
                    {/* Main Menu */}
                    <div>
                      <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-500 tracking-wider">
                        NAVIGATION
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => {
                            setActiveView("home");
                            setIsMobileMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "home" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                          <Home className="w-4 h-4" /> หน้าแรก
                        </button>
                        <button
                          onClick={() => {
                            setActiveView("categories");
                            setIsMobileMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "categories" || activeView === "category_products" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                          <ShoppingCart className="w-4 h-4" /> สินค้าทั้งหมด
                        </button>
                        <button
                          onClick={() => {
                            if (user) {
                              setActiveView("wallet");
                              setIsMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              import("sweetalert2").then((s) =>
                                s.default.fire({
                                  icon: "info",
                                  title: "จำเป็นต้องเข้าสู่ระบบ",
                                  text: "กรุณาเข้าสู่ระบบก่อนเพื่อใช้งานเมนูเติมเงิน",
                                  showCancelButton: true,
                                  confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                                  cancelButtonText: "ยกเลิก",
                                  confirmButtonColor: "#10b981"
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    setActiveView("login");
                                    setIsMobileMenuOpen(false);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }
                                })
                              );
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "wallet" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                          <Wallet className="w-4 h-4" /> เติมเงิน
                        </button>
                        <button
                          onClick={() => {
                            if (user) {
                              setActiveView("history");
                              setIsMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            } else {
                              import("sweetalert2").then((s) =>
                                s.default.fire({
                                  icon: "info",
                                  title: "จำเป็นต้องเข้าสู่ระบบ",
                                  text: "กรุณาเข้าสู่ระบบก่อนเพื่อดูประวัติการสั่งซื้อ",
                                  showCancelButton: true,
                                  confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                                  cancelButtonText: "ยกเลิก",
                                  confirmButtonColor: "#10b981"
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    setActiveView("login");
                                    setIsMobileMenuOpen(false);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }
                                })
                              );
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "history" || activeView === "my_orders" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                        >
                          <History className="w-4 h-4" /> ประวัติการสั่งซื้อ
                        </button>
                      </div>
                    </div>

                    {/* Account */}
                    {user ? (
                      <div>
                        <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-500 tracking-wider">
                          ACCOUNT
                        </div>
                        <div className="px-3">
                          <div className="p-3 bg-[#09090b] border border-[#1e1e1e] rounded-md flex flex-col gap-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#050505] border border-[#1e1e1e] p-0.5 rounded-full overflow-hidden shadow-sm shrink-0">
                                <img
                                  loading="lazy"
                                  src={getAvatarUrl(
                                    user?.id ||
                                      userPlan?.username ||
                                      user?.email?.split("@")[0] ||
                                      "U",
                                  )}
                                  alt="Avatar"
                                  className="w-full h-full object-cover rounded-full"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex flex-col overflow-hidden leading-tight justify-center h-9">
                                <span className="text-white font-medium text-sm truncate flex items-center gap-1.5">
                                  {userPlan?.username ||
                                    user?.email?.split("@")[0]}
                                </span>
                                <span className="text-zinc-500 text-xs truncate flex items-center gap-1 mt-0.5">
                                  {userPlan?.isPremium && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  )}
                                  {userPlan?.isPremium
                                    ? "Premium Member"
                                    : "Member"}
                                </span>
                              </div>
                            </div>
                            <div className="bg-[#141416] border border-[#1e1e1e] rounded-md p-2 flex justify-between items-center text-xs mt-1">
                              <span className="text-zinc-400">
                                ยอดเงินคงเหลือ
                              </span>
                              <span className="font-mono text-[#10b981] font-medium">
                                {Math.floor(
                                  userPlan?.balance || 0,
                                ).toLocaleString()}{" "}
                                ฿
                              </span>
                            </div>

                            <div className="flex w-full gap-2 mt-1">
                              <button
                                onClick={() => {
                                  setActiveView("profile");
                                  setIsMobileMenuOpen(false);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] text-zinc-300 hover:text-white rounded transition-colors text-xs font-medium"
                              >
                                <User className="w-3.5 h-3.5" /> โปรไฟล์
                              </button>
                              <button
                                onClick={() => {
                                  setActiveView("settings");
                                  setIsMobileMenuOpen(false);
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-[#1e1e1e] text-zinc-300 hover:text-white rounded transition-colors text-xs font-medium"
                              >
                                <Settings className="w-3.5 h-3.5" /> ตั้งค่า
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-500 tracking-wider">
                          ACCOUNT
                        </div>
                        <div className="flex flex-col gap-2 px-3 pb-2">
                          <button
                            onClick={() => {
                              setActiveView("login");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black font-semibold text-sm rounded-md transition-all active:scale-95 whitespace-nowrap"
                          >
                            <LogIn className="w-4.5 h-4.5" /> เข้าสู่ระบบ
                          </button>
                          <button
                            onClick={() => {
                              setActiveView("signup");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-[#111] text-white font-semibold text-sm rounded-md border border-[#222] transition-all hover:bg-[#222] active:scale-95 whitespace-nowrap"
                          >
                            <UserPlus className="w-4.5 h-4.5" /> สมัครสมาชิก
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tools */}
                    {user && (
                      <div>
                        <div
                          className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 tracking-wider flex items-center justify-between cursor-pointer"
                          onClick={() =>
                            setIsMobileToolsOpen(!isMobileToolsOpen)
                          }
                        >
                          <span>UTILITIES</span>
                          <motion.div
                            animate={{ rotate: isMobileToolsOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </motion.div>
                        </div>
                        <AnimatePresence>
                          {isMobileToolsOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-0.5">
                                {[].map((str) => {
                                  const [vid, lbl] = str.split(":");
                                  return (
                                    <button
                                      key={vid}
                                      onClick={() => {
                                        setActiveView(vid);
                                        setIsMobileMenuOpen(false);
                                        window.scrollTo({
                                          top: 0,
                                          behavior: "smooth",
                                        });
                                      }}
                                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === vid ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                                    >
                                      <ArrowUpRight className="w-4 h-4" /> {lbl}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Admin / Logout */}
                    {user && (
                      <div>
                        <div className="h-px bg-[#1e1e1e] mb-3 mt-1 mx-3" />
                        <div className="flex flex-col gap-0.5">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setActiveView("admin");
                                setIsMobileMenuOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all ${activeView === "admin" ? "bg-white/[0.06] text-white font-medium" : "text-zinc-400 hover:text-white"}`}
                            >
                              <ShieldCheck className="w-4 h-4" /> จัดการระบบ
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md transition-all text-red-500/80 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <LogOut className="w-4 h-4" /> ออกจากระบบ
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
                    <SupplementaryLoader />
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
                      {activeView === "category_products" &&
                        selectedCategory && (
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
                          product={
                            products.find((p) => p.id === selectedProductId)!
                          }
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
                            siteSettings?.facebook_link ||
                            siteSettings?.contact_line
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
                        <AuthView
                          initialMode="login"
                          setActiveView={setActiveView}
                        />
                      )}
                      {activeView === "signup" && (
                        <AuthView
                          initialMode="signup"
                          setActiveView={setActiveView}
                        />
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

                      {activeView === "wallet" && (
                        <WalletView
                          userPlan={userPlan}
                          setUserPlan={setUserPlan}
                          userId={user?.id}
                          siteSettings={siteSettings}
                          onTopupSuccess={(entry) => {
                            setTopupHistory((prev) => [entry, ...prev]);
                            if (userPlan) {
                              setUserPlan({
                                ...userPlan,
                                balance:
                                  (userPlan.balance || 0) +
                                  Number(entry.amount),
                              });
                            }
                          }}
                        />
                      )}

                      {activeView === "redeem" && (
                        <RedeemKeyView
                          redeemKey={redeemKey}
                          userEmail={user?.email}
                          isLoggedIn={!!user}
                          onBack={() => setActiveView("home")}
                          onGoToStore={() => setActiveView("categories")}
                          onLoginClick={() => setActiveView("login")}
                        />
                      )}

                      {activeView === "settings" && (
                        <SettingsView
                          user={user}
                          setActiveView={setActiveView}
                        />
                      )}

                      {(activeView === "logs" ||
                        activeView === "history" ||
                        activeView === "order_history" ||
                        activeView === "my_orders") && (
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
                      {activeView === "admin" && isAdmin && (
                        <AdminDashboard
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
                      {activeView === "privacy" && (
                        <PrivacyView onBack={() => { setActiveView("home"); window.scrollTo(0,0); }} />
                      )}
                      {activeView === "terms" && (
                        <TermsView onBack={() => { setActiveView("home"); window.scrollTo(0,0); }} />
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
              <div className="flex flex-col justify-center items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mb-2 font-medium">
                  <span className="hover:text-zinc-300 cursor-pointer transition-colors" onClick={() => { setActiveView("privacy"); window.scrollTo(0,0); }}>นโยบายความเป็นส่วนตัว</span>
                  <span className="text-zinc-700">|</span>
                  <span className="hover:text-zinc-300 cursor-pointer transition-colors" onClick={() => { setActiveView("terms"); window.scrollTo(0,0); }}>ข้อกำหนดการใช้งาน</span>
                </div>
                <div className="flex justify-center items-center gap-4">
                  <p>
                    © {new Date().getFullYear()} เอเพ็กซ์สโตร์ — สงวนลิขสิทธิ์
                  </p>
                </div>
              </div>
            </div>
          </footer>

          {/* Modals */}
          <AnimatePresence>
            <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

          <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

          <ContactUsModal isOpen={showContactUs} onClose={() => setShowContactUs(false)} siteSettings={siteSettings} />
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
      </motion.div>
    </div>
  );
}

const SupplementaryLoader: React.FC = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh] bg-[#000000] text-zinc-400 p-8 my-4 text-center select-none">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
        <div className="space-y-2 mt-4">
          <div className="w-32 h-4 bg-zinc-800/80 rounded-full animate-pulse" />
          <div className="w-48 h-3 bg-zinc-800/60 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const PortalLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center font-sans overflow-hidden select-none"
    >
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] md:border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    </motion.div>
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

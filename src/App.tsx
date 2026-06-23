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
const ReceiptModal = lazy(() =>
  import("./components/modals/ReceiptModal").then((m) => ({
    default: m.ReceiptModal,
  })),
);
import { HomeViewSkeleton, CategoriesViewSkeleton } from "./components/Skeletons";

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
    <div className="px-3 py-1 bg-card border border-#1f2937 text-xs font-mono text-muted-foreground font-medium">
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
          background: "#121212",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
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
          background: "#121212",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
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
            bg: "bg-[#3b82f6]",
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
        background: "#121212",
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
        background: "#121212",
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
          background: "#121212",
          color: "#fff",
        });
      } else if (err.response && err.response.status === 404) {
        Swal.fire({
          icon: "error",
          title: "ไม่พบกุญแจนี้",
          text: "รหัสที่คุณกรอกอาจจะผิด หรือถูกใช้งานไปแล้ว",
          background: "#121212",
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
      background: "#121212",
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
        '<select id="swal-input1" class="swal2-input bg-card border-#1f2937 text-white w-full">' +
        '<option value="Day">1 วัน (Day)</option>' +
        '<option value="Week">7 วัน (Week)</option>' +
        '<option value="Month">1 เดือน (Month)</option>' +
        '<option value="3Month">3 เดือน (3 Months)</option>' +
        '<option value="Year">1 ปี (Year)</option>' +
        '<option value="Lifetime">ถาวร (Lifetime)</option>' +
        "</select>" +
        '<input id="swal-input2" class="swal2-input bg-card border-#1f2937 text-white w-full" placeholder="จำนวนคีย์ (1-50)" type="number" value="1">',
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
        '<input id="swal-ip" class="swal2-input bg-card border-#1f2937 text-white w-full" placeholder="IP Address เช่น 1.1.1.1">' +
        '<input id="swal-reason" class="swal2-input bg-card border-#1f2937 text-white w-full" placeholder="เหตุผลการบล็อค">',
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
         <div><span class="text-muted-foreground">คีย์ทั้งหมด:</span> <span class="font-medium text-[#3b82f6]">${totalAll}</span> รายการ</div>
         <div><span class="text-muted-foreground">ยังไม่ได้ใช้:</span> <span class="font-medium text-[#3b82f6]">${totalActive}</span> รายการ</div>
         <div><span class="text-muted-foreground">ใช้แล้ว:</span> <span class="font-medium text-amber-500">${totalUsed}</span> รายการ</div>
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

  if (isIPBlocked)
    return (
      <div className="min-h-screen bg-card flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-primary text-primary-foreground border border-#3b82f6/20 p-12 text-center relative overflow-hidden">
          <ShieldAlert className="w-20 h-20 text-[#3b82f6] mx-auto mb-6 " />
          <h1 className="text-3xl font-medium text-[#3b82f6] mb-4 uppercase tracking-tighter">
            Access Revoked
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            ที่อยู่ IP ของคุณ ({clientIp})
            ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย
            หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEXSTORE
          </p>
          <div className="bg-card p-4 text-[10px] text-muted-foreground font-mono mb-8">
            Error Code: APEXSTORE_SECURITY_BLOCK_L4
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-[#3b82f6] text-white px-8 py-3 text-xs font-medium transition-all"
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
        return "Sunoid.shop";
    }
  };

  const isHomeViewReady =
    (Array.isArray(products) &&
      Array.isArray(categories) &&
      siteSettings !== null) ||
    forceReveal;
  const isLoadingSkeleton = !isHomeViewReady && !dbErrorDetail;

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground font-[family-name:var(--font-sans)] selection:bg-blue-500/20 antialiased overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isLoaded && <PortalLoader key="portal" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, duration: 0.8 }}
        className="min-h-screen w-full flex flex-col lg:flex-row-reverse relative"
      >
        <Suspense fallback={null}>
          <PopupBanner
            enabled={siteSettings?.popup_enabled ?? false}
            imgUrl={siteSettings?.popup_img_url ?? ""}
            linkUrl={siteSettings?.popup_link ?? ""}
          />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 relative transition-all duration-300">
          
        
        {/* VHOUSE Specific Navbar */}
        <nav className="relative top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm sticky">
          <div className="container mx-auto flex h-[62px] items-center justify-between px-4">
            
            <div 
              className="flex items-center cursor-pointer select-none" 
              onClick={() => { setActiveView('home'); window.scrollTo(0,0); }}
            >
              <span className="text-[21px] font-sans font-extrabold text-white tracking-tight">
                Sunoid<span className="inline-block w-[5px] h-[5px] bg-blue-600 mx-[3px] rounded-[1.2px] align-middle"></span>shop
              </span>
            </div>

            <div className="flex items-center gap-2 md:hidden z-[1001]">
              <AnimatePresence mode="popLayout">
                {!isMobileMenuOpen && (
                  <motion.button 
                    key="mobile-search-btn"
                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    onClick={() => setShowSearchPopup(true)}
                    className="flex items-center justify-center border border-zinc-200 rounded-full bg-zinc-50/75 hover:bg-slate-100 text-zinc-500 transition-all cursor-pointer shadow-xs select-none shrink-0 h-10 w-10 animate-none"
                    aria-label="ค้นหาสินค้า"
                  >
                    <Search className="w-[18px] h-[18px] text-zinc-400 shrink-0" />
                  </motion.button>
                )}
              </AnimatePresence>
              <button 
                className="text-zinc-650 hover:text-black transition-all duration-300 outline-none select-none relative h-10 w-10 flex items-center justify-center cursor-pointer mr-0.5" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="เมนู"
              >
                <div className="w-[26px] h-[18px] relative select-none">
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 7.75 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-[26px] h-[2.5px] bg-[#1a1a1c] rounded-full absolute top-0 left-0 origin-center"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-[26px] h-[2.5px] bg-[#1a1a1c] rounded-full absolute top-[7.75px] left-0 origin-center"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -7.75 } : { rotate: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-[26px] h-[2.5px] bg-[#1a1a1c] rounded-full absolute bottom-0 left-0 origin-center"
                  />
                </div>
              </button>
            </div>

            {/* Desktop Links */}
            <div className="hidden items-center gap-1.5 lg:gap-2.5 md:flex ml-4">
                <button 
                  onClick={() => { setActiveView('home'); window.scrollTo(0,0); }}
                  className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'home' 
                      ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20' 
                      : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                  }`}
                >
                  <Home className="w-4.5 h-4.5" />
                  <span>หน้าแรก</span>
                </button>
                <button 
                  onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }}
                  className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'categories' || activeView === 'category_products' || activeView === 'product_detail'
                      ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20 shadow-xs' 
                      : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                  }`}
                >
                  <Gamepad2 className="w-4.5 h-4.5" />
                  <span>ซื้อไอดีเกม</span>
                </button>
                <button 
                  onClick={() => { 
                    if (!user) { setActiveView('login'); return; }
                    setActiveView('wallet'); 
                  }}
                  className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'wallet' 
                      ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20 shadow-xs' 
                      : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                  }`}
                >
                  <Wallet className="w-4.5 h-4.5" />
                  <span>ช่องทางชำระเงิน</span>
                </button>
                <button 
                  onClick={() => { 
                    if (!user) { setActiveView('login'); return; }
                    setActiveView('history'); 
                  }}
                  className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'history' 
                      ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20 shadow-xs' 
                      : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                  }`}
                >
                  <History className="w-4.5 h-4.5" />
                  <span>ประวัติการสั่งซื้อ</span>
                </button>
                <button 
                  onClick={() => { 
                    if (!user) { setActiveView('login'); return; }
                    setActiveView('profile'); 
                  }}
                  className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    activeView === 'profile' 
                      ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20 shadow-xs' 
                      : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                  }`}
                >
                  <User className="w-4.5 h-4.5" />
                  <span>โปรไฟล์</span>
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => { setActiveView('admin'); window.scrollTo(0,0); }}
                    className={`text-[14px] font-bold transition-all py-1.5 px-4 rounded-full cursor-pointer flex items-center gap-1.5 ${
                      activeView === 'admin' 
                        ? 'text-blue-600 bg-blue-50/70 border border-blue-100/20 shadow-xs' 
                        : 'text-zinc-650 hover:text-blue-600 hover:bg-zinc-100/40'
                    }`}
                  >
                    <ShieldAlert className="w-4.5 h-4.5" />
                    <span>จัดการระบบ (Admin)</span>
                  </button>
                )}
            </div>

            <div className="hidden items-center md:flex gap-3">
              <button 
                onClick={() => setShowSearchPopup(true)}
                className="flex items-center justify-center border border-zinc-200 rounded-full h-10 w-10 bg-white hover:bg-slate-50 text-zinc-400 hover:text-zinc-800 transition-colors cursor-pointer shadow-xs animate-none shrink-0"
                aria-label="ค้นหาสินค้า"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {!user ? (
                <button 
                  onClick={() => setActiveView('login')}
                  className="flex items-center gap-1.5 text-[14px] font-bold text-zinc-100 hover:text-blue-600 transition-colors py-1.5 px-4 rounded-full hover:bg-zinc-100/40 cursor-pointer h-10 shrink-0"
                >
                  <User className="h-4.5 w-4.5 text-blue-500" /> เข้าสู่ระบบ
                </button>
              ) : (
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-1.5 rounded-full border border-[#e2e8f0] h-10">
                    <Wallet className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-[14px] font-bold text-zinc-100">฿{(userPlan?.balance ?? 0).toFixed(2)}</span>
                  </div>
                  <button 
                     onClick={() => setActiveView('profile')}
                     className="flex items-center gap-1.5 text-[14px] font-bold text-zinc-100 hover:bg-slate-50 px-4 py-1.5 rounded-full border border-transparent hover:border-[#e2e8f0] transition-colors cursor-pointer h-10"
                  >
                    <User className="h-4.5 w-4.5 text-blue-500" /> โปรไฟล์
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </nav>

        {/* Mobile Menu Sidebar Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[999] md:hidden"
            />
          )}

          {isMobileMenuOpen && (
            <motion.div
              key="sidebar-drawer"
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="fixed right-0 top-0 bottom-0 h-full w-[320px] max-w-[88vw] bg-white border-l border-neutral-200 shadow-2xl z-[1000] flex flex-col p-6 font-sans text-neutral-800 md:hidden rounded-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 shrink-0 mt-2">
                <div className="flex items-center select-none cursor-pointer" onClick={() => { setActiveView('home'); setIsMobileMenuOpen(false); window.scrollTo(0,0); }}>
                  <span className="text-[24px] font-sans font-extrabold text-white tracking-tight">
                    Sunoid<span className="inline-block w-[6.5px] h-[6.5px] bg-blue-600 mx-[2.5px] rounded-[1.5px] align-baseline"></span>shop
                  </span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer animate-none"
                  aria-label="ปิดเมนู"
                >
                  <X className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>

              {/* Nav Links scrollable container */}
              <div className="flex flex-col flex-1 overflow-y-auto pr-1 py-4 space-y-6 select-none" style={{ scrollbarWidth: 'none' }}>
                
                {/* Navigation Menu */}
                <div className="flex flex-col space-y-2.5">
                  {[
                    { id: 'home', label: 'หน้าแรก', icon: Home, action: () => { setActiveView('home'); window.scrollTo(0, 0); } },
                    { id: 'categories', label: 'ซื้อไอดีเกม', icon: Gamepad2, action: () => { setActiveView('categories'); window.scrollTo(0, 0); }, isActive: activeView === 'categories' || activeView === 'category_products' || activeView === 'product_detail' },
                    { id: 'wallet', label: 'ช่องทางชำระเงิน', icon: Wallet, action: () => { if (!user) { setActiveView('login'); } else { setActiveView('wallet'); } } },
                    { id: 'history', label: 'ประวัติการสั่งซื้อ', icon: History, action: () => { if (!user) { setActiveView('login'); } else { setActiveView('history'); } } },
                    { id: 'profile', label: 'โปรไฟล์', icon: User, action: () => { if (!user) { setActiveView('login'); } else { setActiveView('profile'); } } },
                    ...(isAdmin ? [{ id: 'admin', label: 'จัดการระบบ (Admin)', icon: ShieldAlert, action: () => { setActiveView('admin'); window.scrollTo(0, 0); } }] : [])
                  ].map((item, idx) => {
                    const isActive = item.isActive !== undefined ? item.isActive : activeView === item.id;
                    const IconComponent = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 24,
                          delay: idx * 0.05 + 0.1
                        }}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          item.action();
                        }}
                        className={`flex items-center gap-4 text-left text-[15.5px] font-bold p-4 rounded-2xl transition-all cursor-pointer border ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50/70 border-blue-150/30 shadow-sm font-black' 
                            : 'text-zinc-100 hover:text-blue-600 hover:bg-zinc-100/50 border-transparent'
                        }`}
                      >
                        <IconComponent className="w-5.5 h-5.5 shrink-0" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <hr className="border-t border-zinc-100" />

                {/* Account Section */}
                <div className="flex flex-col pb-6">
                  <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest pl-1 mb-4">บัญชี</span>
                  
                  {!user ? (
                    /* Premium glowing rainbow line bottom button exactly like screenshot */
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer mt-1">
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); setActiveView('login'); }}
                        className="w-full text-center py-4 text-[15px] font-extrabold text-neutral-805 bg-white cursor-pointer hover:bg-neutral-50 transition-colors"
                      >
                        เข้าสู่ระบบ
                      </button>
                      {/* Rainbow glowing bottom layer edge */}
                      <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#10b981] via-[#06b6d4] via-[#3b82f6] via-[#8b5cf6] via-[#ec4899] via-[#f59e0b] to-[#10b981]" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">บัญชีผู้ใช้งาน</p>
                        <p className="text-xs font-bold text-zinc-800 mt-0.5 truncate">{userPlan?.username || user?.email?.split('@')[0]}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">ยอดเงินคงเหลือ: <span className="font-bold text-blue-600 font-mono">฿{(userPlan?.balance ?? 0).toFixed(2)}</span></p>
                      </div>
                      <div className="relative overflow-hidden rounded-xl border border-red-200 bg-white transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer">
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-center py-3 text-xs font-bold text-red-500 bg-white cursor-pointer hover:bg-red-50/50 transition-colors"
                        >
                          ออกจากระบบ
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 to-red-600" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>


          {/* Verification Banner Removed */}

          {/* Global Page Header Removed */}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-6 lg:pb-0 w-full flex-1 flex flex-col">
            <GlobalErrorBoundary>
            <Suspense
              fallback={
                <div className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                  <div className="w-8 h-8 border-4 border-#1f2937 border-t-white rounded-full animate-spin" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView === 'login' || activeView === 'signup' ? 'auth' : activeView}
                  initial={{ opacity: 0, y: 20, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.99 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 w-full flex flex-col min-h-0"
                >
                  {isLoadingSkeleton ? (
                    activeView === "home" ? (
                      <HomeViewSkeleton />
                    ) : (activeView === "categories" || activeView === "category_products") ? (
                      <CategoriesViewSkeleton />
                    ) : (
                      <SupplementaryLoader />
                    )
                  ) : (
                    <>
                      {(activeView === "categories" || activeView === "category_products") && (
                        <CategoriesView
                          categories={categories}
                          products={products}
                          siteSettings={siteSettings}
                          selectedCategory={selectedCategory || "all"}
                          setSelectedCategory={setSelectedCategory}
                          onBack={() => setActiveView("home")}
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
                        <Suspense
                          fallback={
                            <div className="w-full max-w-7xl mx-auto px-4 py-12 animate-pulse font-sans">
                              <div className="bg-muted rounded-3xl h-[350px] w-full mb-6" />
                              <div className="h-8 bg-muted rounded-lg w-2/3 mb-4" />
                              <div className="h-5 bg-muted rounded-lg w-1/2 mb-8" />
                              <div className="h-10 bg-muted rounded-lg w-1/3" />
                            </div>
                          }
                        >
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
                        </Suspense>
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
                      {(activeView === "login" || activeView === "signup") && (
                        <AuthView
                          initialMode={activeView}
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
          </GlobalErrorBoundary>
          </div>

          
          {/* Footer */}
          <footer className="mt-auto bg-muted border-t border-border">
            <div className="container mx-auto px-8 py-12">
              <div className="mb-8">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground select-none">
                  <span className="text-[17px] font-sans font-extrabold text-white tracking-tight">
                    Sunoid<span className="inline-block w-[3.5px] h-[3.5px] bg-blue-600 mx-[1.2px] rounded-[0.8px] align-baseline"></span>shop
                  </span>
                  <span>&gt;</span>
                  <span>Sunoid.shop Store Online</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-4">เลือกซื้อและเรียนรู้</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">ซื้อไอดีเกม</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-4">บัญชี</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => { setActiveView('profile'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">จัดการบัญชีของคุณ</button></li>
                    <li><button onClick={() => { setActiveView('profile'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">โปรไฟล์</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-4">Sunoid.shop Store</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">ซื้อไอดีเกม</button></li>
                    <li><button onClick={() => { setActiveView('wallet'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">ช่องทางชำระเงิน</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-4">เกี่ยวกับ Sunoid.shop</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => { setActiveView('home'); window.scrollTo(0,0); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">หน้าแรก</button></li>
                    <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">เข้าร่วม Discord</a></li>
                  </ul>
                </div>
              </div>
              <div className="mb-8 pb-8 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  อีกหลากหลายวิธีในการเลือกซื้อ:{' '}
                  <button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className="text-blue-600 hover:underline">
                    ค้นหา Sunoid.shop
                  </button> หรือ <button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className="text-blue-600 hover:underline">ร้านค้าอื่นๆ</button> ใกล้คุณ
                </p>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
                <p>Copyright © 2026 Sunoid.shop Inc. สงวนสิทธิ์ทุกประการ</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="hover:text-foreground transition-colors">ข้อกำหนดการใช้งาน</button>
                  <span>|</span>
                  <button className="hover:text-foreground transition-colors">นโยบายความเป็นส่วนตัว</button>
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

      </motion.div>
    </div>
  );
}

const SupplementaryLoader: React.FC = () => {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh] bg-card text-muted-foreground p-8 my-4 text-center select-none">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="w-8 h-8 border-4 border-border border-t-white rounded-full animate-spin" />
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
      className="fixed inset-0 z-[99999] bg-card flex flex-col items-center justify-center font-sans overflow-hidden select-none"
    >
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="w-8 h-8 md:w-10 md:h-10 border-[3px] md:border-4 border-border border-t-white rounded-full animate-spin" />
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

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
  Mail,
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

import jsQR from "jsqr";

type SupabaseUser = any;
import { Turnstile } from "@marsidev/react-turnstile";
import { Analytics } from "@vercel/analytics/react";
import { useToastStore } from "./lib/toastStore";
import { ToastContainer } from "./components/ui/Toast";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import { AccountResult, LogEntry, UserPlan } from "./types";
import { KeyModal } from "./components/modals/KeyModal";
import { ReceiptModal } from "./components/modals/ReceiptModal";
import { PopupBanner } from "./components/PopupBanner";
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
import { HomeView } from "./components/HomeView";
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
const FreeWebsiteTool = lazy(() =>
  import("./components/FreeWebsiteTool").then((module) => ({
    default: module.FreeWebsiteTool,
  }))
);
const TelegramCatcherTool = lazy(() =>
  import("./components/TelegramCatcherTool").then((module) => ({
    default: module.TelegramCatcherTool,
  })),
);
const ProxyFreeTool = lazy(() =>
  import("./components/ProxyFreeTool").then((module) => ({
    default: module.ProxyFreeTool,
  })),
);
const ProxyFreeFireIOSTool = lazy(() =>
  import("./components/ProxyFreeFireIOSTool").then((module) => ({
    default: module.ProxyFreeFireIOSTool,
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
      className={`w-full bg-[#050505] border border-zinc-800 p-3 text-[11px] font-mono text-emerald-400 focus:border-emerald-500/50 focus:outline-none resize-none transition-all scrollbar-thin scrollbar-thumb-zinc-800 h-[320px] shadow-inner ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
  });

  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [deferMedia, setDeferMedia] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeferMedia(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const formatSpotifyEmbedUrl = (url: string, autoplay: boolean) => {
    if (!url) return "";
    let embedUrl = url;

    // Check if it's a direct audio file
    if (
      url.match(/\.(mp3|wav|ogg|m4a)$/) ||
      url.includes("drive.google.com/uc") ||
      url.startsWith("data:audio")
    ) {
      return url;
    }

    // Handle YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1].split("?")[0];
      }

      if (videoId) {
        // Use youtube-nocookie for better privacy and reliability
        let yUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0&controls=0&enablejsapi=1&loop=1&playlist=${videoId}&origin=${encodeURIComponent(window.location.origin)}&playsinline=1`;
        if (autoplay) {
          yUrl += "&autoplay=1&mute=1";
        }
        return yUrl;
      }
    }

    // Convert regular link to embed link
    if (url.includes("spotify.com") && !url.includes("spotify.com/embed")) {
      const segments = url.split("spotify.com/")[1]?.split("?")[0];
      if (segments) {
        embedUrl = `https://open.spotify.com/embed/${segments}`;
      }
    }

    // Ensure it starts with https
    if (embedUrl.startsWith("open.spotify.com")) {
      embedUrl = "https://" + embedUrl;
    }

    // Add autoplay parameter
    if (autoplay) {
      embedUrl += embedUrl.includes("?") ? "&autoplay=1" : "?autoplay=1";
    }
    return embedUrl;
  };

  useEffect(() => {
    if (
      siteSettings.spotify_autoplay &&
      siteSettings.spotify_url &&
      (siteSettings.spotify_url.match(/\.(mp3|wav|ogg|m4a)$/) ||
        siteSettings.spotify_url.includes("drive.google.com/uc") ||
        siteSettings.spotify_url.startsWith("data:audio"))
    ) {
      const playAudio = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            console.log("Autoplay blocked, waiting for user interaction");
          });
        }
        window.removeEventListener("click", playAudio);
      };
      window.addEventListener("click", playAudio);
    }
  }, [siteSettings.spotify_autoplay, siteSettings.spotify_url]);

  useEffect(() => {
    if (
      siteSettings.spotify_url &&
      (siteSettings.spotify_url.includes("youtube.com") ||
        siteSettings.spotify_url.includes("youtu.be"))
    ) {
      const handleFirstInteraction = () => {
        if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
          ytIframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "unMute", args: [] }),
            "*",
          );
          if (siteSettings.spotify_autoplay) {
            ytIframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "playVideo", args: [] }),
              "*",
            );
            setYtPlaying(true);
          }
        }
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
        window.removeEventListener("scroll", handleFirstInteraction);
      };
      window.addEventListener("click", handleFirstInteraction);
      window.addEventListener("keydown", handleFirstInteraction);
      window.addEventListener("scroll", handleFirstInteraction);
      return () => {
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
        window.removeEventListener("scroll", handleFirstInteraction);
      };
    }
  }, [siteSettings.spotify_url, siteSettings.spotify_autoplay]);

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
    | "free_website"
    | "telegram_catcher"
    | "discord_catcher"
    | "discord_on"
    | "discord_badge"
    | "two_fa_generator"
    | "proxy_ff_ios"
    | "proxy_free"
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
      }, 50);
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
        "free_website",
        "telegram_catcher",
        "discord_catcher",
        "discord_on",
        "discord_badge",
        "two_fa_generator",
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
      }, 50);
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
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    // Topup history is user-specific, we do not cache it in localStorage.
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
      const idempotencyKey = `buy_${product.id}_${Date.now()}_${Math.random()}`;
      const res = await axios.post("/api/buy", {
        productId: product.id,
        quantity,
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
            bg: "bg-emerald-500",
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
      
      console.log("Fetching all data from backend...", { reqId: currentRequestId });
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

      Promise.all(
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
          } else if (res.url === "/api/products" && res.data && Array.isArray(res.data)) {
            setProducts(res.data.length > 0 ? res.data : defaultProducts);
          } else if (res.url === "/api/categories" && res.data && Array.isArray(res.data)) {
            setCategories(res.data);
          } else if (res.url === "/api/stats" && res.data) {
            setSiteStats({
              users: res.data.users,
              stock: res.data.stock,
              sales: res.data.sales,
              topups: res.data.totalTopupsAmount,
              totalOrders: res.data.totalOrders,
            });
          } else if (res.url === "/api/pages" && res.data) {
            const d = res.data;
            setCustomPages(Array.isArray(d) ? d : (d.data && Array.isArray(d.data) ? d.data : []));
          }
        }
      });

      // 2. Secondary Data & User Data
      fetchApi("/api/logs-system").then(res => {
        if (res.data && Array.isArray(res.data.categories)) {
          setLogCategories(res.data.categories.filter((c: any) => c.isVisible));
        }
      });

      // 3. User & Admin Specific Data
      if (user) {
        fetchApi("/api/used_keys").then(res => { if (res.data) setUsedKeysHistory(res.data); });
        fetchApi("/api/purchases").then(res => { if (res.data && Array.isArray(res.data)) setPurchaseHistory(res.data); });
        fetchApi("/api/topups").then(res => { if (res.data && Array.isArray(res.data)) setTopupHistory(res.data); });
      }

      if (isAdmin) {
        fetchApi("/api/license_keys").then(res => { if (res.data) setLicenseKeys(res.data); });
        fetchApi("/api/blocked_ips").then(res => { if (res.data) setBlockedIPs(res.data); });
        fetchApi("/api/users").then(res => { if (res.data && Array.isArray(res.data)) setUsersList(res.data); });
      }

      console.timeEnd("fetchAllData");

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
  }, [isAdmin, user]);

  // Backend API Listeners
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

      try {
        const res = await axios.get("/api/health");
        const ip = res.data.clientIp || "Unknown";
        setClientIp(ip);
      } catch (err) {
        setClientIp("offline_local");
        console.error("IP Check Failed", err);
      }
      
      dataReady = true;
      setIsLoaded(true);
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
          <div><span class="text-zinc-500">คีย์ทั้งหมด:</span> <span class="font-bold text-[#3B82F6]">${totalAll}</span> รายการ</div>
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
            "text-emerald-400 font-bold",
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
            "text-emerald-500 font-bold",
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
            "text-red-500 font-bold",
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
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-xl p-12 text-center relative overflow-hidden">
          <ShieldAlert className="w-20 h-20 text-[#2563EB] mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-[#2563EB] mb-4 uppercase tracking-tighter">
            Access Revoked
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            ที่อยู่ IP ของคุณ ({clientIp})
            ถูกระงับการเข้าถึงระบบเนื่องจากละเมิดข้อตกลงการใช้งานหรือพบพฤติกรรมที่น่าสงสัย
            หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ APEXSTORE
          </p>
          <div className="bg-black/50 rounded-2xl p-4 text-[10px] text-zinc-500 font-mono mb-8">
            Error Code: APEXSTORE_SECURITY_BLOCK_L4
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-3 rounded-2xl text-xs font-bold transition-all"
          >
            TRY RECONNECTING
          </button>
        </div>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-[#0B0D0F] flex flex-col items-center justify-center font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-center w-80 h-80 z-10"
        >
          {/* Spinner 1: Outer Slow Clockwise Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute w-64 h-64 border-4 border-t-[#9b59f5] border-r-transparent border-b-[#9b59f5]/20 border-l-transparent rounded-full opacity-60"
          />

          {/* Spinner 2: Middle Fast Counter-Clockwise Spinner */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            className="absolute w-52 h-52 border-[3px] border-l-blue-400 border-t-transparent border-r-blue-400/20 border-b-transparent border-dashed rounded-full opacity-80"
          />

          {/* Spinner 3: Inner Very Fast Clockwise Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }}
            className="absolute w-40 h-40 border-2 border-r-purple-400 border-t-transparent border-l-transparent border-b-transparent rounded-full shadow-[0_0_15px_rgba(155,89,245,0.4)]"
          />

          {/* Glowing Ambient Behind the Logo */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"
          />

          {/* Logo Centered inside */}
          <motion.img
            src="https://img2.pic.in.th/4D8F9A5A-1535-4802-BD86-5FA08F0D3B3D.png"
            alt="Logo"
            referrerPolicy="no-referrer"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="relative w-28 h-auto z-20 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] object-contain select-none"
          />
        </motion.div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#ffffff] font-sans selection:bg-[#9b59f5]/30 flex flex-col lg:flex-row relative">
      {useCustomCursor && <CustomCursor />}
      <PopupBanner
        enabled={siteSettings?.popup_enabled ?? false}
        imgUrl={siteSettings?.popup_img_url ?? ""}
        linkUrl={siteSettings?.popup_link ?? ""}
      />
      {/* Page Transition Overlay */}
      {isPageTransitioning && (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0a]/95 flex flex-col items-center justify-center p-4 overflow-hidden animate-in fade-in duration-75">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            <Loader
              className="w-12 h-12 text-[#9b59f5] animate-spin"
              strokeWidth={2}
            />
          </motion.div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-[#0a0a0a] border-r border-[#1e1e1e] h-screen sticky top-0 p-6 z-[60] overflow-y-auto no-scrollbar">
        <div className="mb-10 w-full flex justify-start">
          <motion.img
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            src="https://img2.pic.in.th/4D8F9A5A-1535-4802-BD86-5FA08F0D3B3D.png"
            alt="Logo"
            referrerPolicy="no-referrer"
            className="h-14 w-auto cursor-pointer drop-shadow-md"
            onClick={handleLogoClick}
          />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center py-[8px] my-1">
            <div className="flex-grow border-t border-[#1e1e1e]"></div>
            <span className="shrink-0 px-3 text-[10px] font-medium text-[#888888] uppercase tracking-[0.2em]">เมนู</span>
            <div className="flex-grow border-t border-[#1e1e1e]"></div>
          </div>
          <button
            onClick={() => setActiveView("home")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "home" ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <Home className="w-[18px] h-[18px]" /> หน้าแรก
          </button>
          <button
            onClick={() => {
              setActiveView("categories");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "categories" ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <ShoppingCart className="w-[18px] h-[18px]" /> สินค้าทั้งหมด
          </button>
          <button
            onClick={() => {
              setActiveView(user ? "wallet" : "login");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "wallet" ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <Wallet className="w-[18px] h-[18px]" /> เติมเงิน
          </button>
          <button
            onClick={() => {
              if (!user) {
                Swal.fire({
                  icon: "warning",
                  title: "กรุณาเข้าสู่ระบบ",
                  text: "คุณต้องเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้",
                  confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                  confirmButtonColor: "#9b59f5",
                  background: "#111",
                  color: "#fff"
                }).then(() => setActiveView("login"));
                return;
              }
              setActiveView("free_website");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "free_website" ? "bg-[#161616] text-[#9b59f5] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <Globe className="w-[18px] h-[18px]" /> เปิดเว็บไซต์ฟรี
          </button>
          <button
            onClick={() => {
              if (!user) {
                Swal.fire({
                  icon: "warning",
                  title: "กรุณาเข้าสู่ระบบ",
                  text: "คุณต้องเข้าสู่ระบบก่อนใช้งานบรรดาเครื่องมือ",
                  confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                  confirmButtonColor: "#9b59f5",
                  background: "#111",
                  color: "#fff"
                }).then(() => setActiveView("login"));
                return;
              }
              setActiveView("tools");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={() => toolsImport()}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "tools" ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <Bot className="w-[18px] h-[18px]" /> เครื่องมือฟรี
          </button>

          {!user && (
            <>
              <div className="w-full h-[1px] bg-[#1e1e1e] my-4" />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveView("login");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95 ${activeView === "login" ? "bg-[#ffffff] text-[#0a0a0a]" : "bg-[#1e1e1e] hover:bg-[#ffffff] hover:text-[#0a0a0a] text-[#ffffff]"}`}
                >
                  <LogIn className="w-[18px] h-[18px]" /> เข้าสู่ระบบ
                </button>
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="flex-1 h-[1px] bg-[#1e1e1e]" />
                  <span className="text-[10px] font-medium text-[#888888] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1px] bg-[#1e1e1e]" />
                </div>
                <button
                  onClick={() => {
                    setActiveView("signup");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 border ${activeView === "signup" ? "bg-[#161616] text-[#ffffff] border-[#333333]" : "bg-transparent hover:bg-[#111111] text-[#888888] border-[#1e1e1e] hover:text-[#ffffff]"}`}
                >
                  <UserPlus className="w-[18px] h-[18px]" /> สมัครสมาชิก
                </button>
              </div>
            </>
          )}

          {user && (
            <>
              <button
                onClick={() => setIsDesktopToolsOpen(!isDesktopToolsOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] transition-all group mt-2"
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-[18px] h-[18px]" /> เครื่องมือย่อย
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isDesktopToolsOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isDesktopToolsOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="flex flex-col gap-1 mt-1 pl-3 border-l border-[#1e1e1e] ml-6">
                  <button
                    onClick={() => setActiveView("telegram_catcher")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "telegram_catcher" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> ดักซองเทเลแกรม
                  </button>
                  <button
                    onClick={() => setActiveView("discord_catcher")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "discord_catcher" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> ดักซองดิสคอร์ด
                  </button>
                  <button
                    onClick={() => setActiveView("discord_on")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "discord_on" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> รันโทเค่นดิสคอร์ด
                  </button>
                  <button
                    onClick={() => setActiveView("discord_badge")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "discord_badge" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> รับตราอัตโนมัติ
                  </button>
                  <button
                    onClick={() => setActiveView("two_fa_generator")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "two_fa_generator" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> สร้างรหัส 2FA
                  </button>
                  <button
                    onClick={() => setActiveView("proxy_free")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${activeView === "proxy_free" ? "bg-[#161616] text-[#ffffff]" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                  >
                    <ArrowUpRight className="w-[14px] h-[14px]" /> พร็อกซี่ฟรี (Proxy)
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
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "history" ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
          >
            <History className="w-[18px] h-[18px]" /> ประวัติสั่งซื้อ
          </button>
          <button
            onClick={() => {
              setShowContactUs(true);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent`}
          >
            <Phone className="w-[18px] h-[18px]" /> ติดต่อแอดมิน
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-red-500 hover:bg-red-500/10 mt-2 border border-transparent"
            >
              <LogOut className="w-[18px] h-[18px]" /> ออกจากระบบ
            </button>
          )}

          {user && customPages && customPages.length > 0 && (
            <>
              <div className="text-[10px] font-medium text-[#888888] uppercase tracking-widest mt-6 mb-3 pl-3">
                หน้าอื่นๆ
              </div>
              {customPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    setSelectedPage(page);
                    setActiveView("custom_page");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeView === "custom_page" && selectedPage?.id === page.id ? "bg-[#161616] text-[#ffffff] border border-[#1e1e1e] shadow-sm" : "text-[#888888] hover:bg-[#111111] hover:text-[#ffffff] border border-transparent"}`}
                >
                  <FileText className="w-[18px] h-[18px]" />{" "}
                  {page.title.replace(/^#+\s*/, "")}
                </button>
              ))}
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative overflow-x-hidden">
        {/* Desktop Top Header */}
        <header className="hidden lg:flex sticky top-0 z-[50] w-full h-[60px] bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1e1e1e] items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-[#ffffff]">
              {activeView === "home" ? "ภาพรวม" : 
               activeView === "categories" ? "หมวดหมู่สินค้า" : 
               activeView === "category_products" ? "รายการสินค้า" : 
               activeView === "wallet" ? "เติมเงิน" : 
               activeView === "profile" ? "ตั้งค่าโปรไฟล์" : 
               activeView === "history" ? "ประวัติการใช้งาน" : 
               activeView === "admin" ? "ระบบจัดการหลังบ้าน" : "แดชบอร์ด"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView("search")}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#888888] hover:text-[#ffffff] hover:bg-[#111111] transition-colors"
              aria-label="Search"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            {user ? (
              <div
                className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-[#1e1e1e] hover:border-[#333333] transition-colors cursor-pointer bg-[#161616]"
                onClick={() => setActiveView("profile")}
              >
                <div className="flex flex-col text-right">
                  <span className="text-[13px] font-medium text-[#ffffff] leading-tight">
                    {userPlan?.username || user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-[11px] text-[#9b59f5] font-medium">
                    ฿ {userPlan?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden bg-[#0a0a0a]">
                  <img
                    src={getAvatarUrl(user?.id || userPlan?.username || user?.email?.split("@")[0] || "guest")}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveView("login")}
                className="px-4 py-1.5 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#0a0a0a] text-[13px] font-medium rounded-full transition-colors shadow-sm"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </header>

        {/* Global Top Navbar (Mobile) */}
        <nav className="lg:hidden sticky top-0 z-[60] bg-[#0a0a0a] border-b border-[#1e1e1e] w-full flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-5 h-[60px] relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src="https://img2.pic.in.th/4D8F9A5A-1535-4802-BD86-5FA08F0D3B3D.png"
              alt="Logo"
              referrerPolicy="no-referrer"
              className="h-8 w-auto cursor-pointer"
              onClick={() => setActiveView("home")}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView("search")}
                className="w-10 h-10 rounded-md flex items-center justify-center text-[#888888] hover:text-[#ffffff] transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 rounded-md flex items-center justify-center text-[#888888] hover:text-[#ffffff] active:scale-95 transition-all"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
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
                className="fixed inset-0 bg-black/60 z-[70] lg:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.3 }}
                className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[300px] bg-[#0a0a0a] shadow-2xl z-[71] flex flex-col lg:hidden overflow-y-auto no-scrollbar border-l border-[#1e1e1e]"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-[16px] right-[16px] z-[80] bg-[#111111] border border-[#1e1e1e] rounded-md w-8 h-8 flex items-center justify-center cursor-pointer text-[#888888] hover:text-[#ffffff] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Header / Logo */}
                <div className="flex items-center justify-start px-[24px] pt-[24px] pb-[16px] shrink-0 relative z-[70]">
                  <img 
                    src="https://img2.pic.in.th/4D8F9A5A-1535-4802-BD86-5FA08F0D3B3D.png" 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                    className="h-8 w-auto"
                  />
                </div>

                {/* Nav items */}
                <div className="px-[16px] flex flex-col gap-[8px] shrink-0 mt-4">
                  <div className="flex items-center py-[6px] mb-2">
                    <div className="flex-grow border-t border-[#1e1e1e]"></div>
                    <span className="shrink-0 px-3 text-[10px] font-medium text-[#888888] uppercase tracking-[0.2em]">เมนู</span>
                    <div className="flex-grow border-t border-[#1e1e1e]"></div>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all ${activeView === "home" ? "border-[#1e1e1e] bg-[#161616] text-[#ffffff]" : "border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                    onClick={() => {
                      setActiveView("home");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Home className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">หน้าหลัก</span>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all ${activeView === "categories" || activeView === "category_products" ? "border-[#1e1e1e] bg-[#161616] text-[#ffffff]" : "border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                    onClick={() => {
                      setActiveView("categories");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <ShoppingCart className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">สินค้าทั้งหมด</span>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all ${activeView === "wallet" ? "border-[#1e1e1e] bg-[#161616] text-[#ffffff]" : "border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                    onClick={() => {
                      if (!user) {
                        setActiveView("login");
                      } else {
                        setActiveView("wallet");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Wallet className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">เติมเงิน</span>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all ${activeView === "free_website" ? "border-[#1e1e1e] bg-[#161616] text-[#9b59f5]" : "border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                    onClick={() => {
                      if (!user) {
                        Swal.fire({
                          icon: "warning",
                          title: "กรุณาเข้าสู่ระบบ",
                          text: "คุณต้องเข้าสู่ระบบก่อนใช้งานตัวเลือกนี้",
                          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                          confirmButtonColor: "#9b59f5",
                          background: "#111",
                          color: "#fff"
                        }).then(() => {
                           setActiveView("login");
                           setIsMobileMenuOpen(false);
                        });
                        return;
                      }
                      setActiveView("free_website");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Globe className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">เปิดเว็บไซต์ฟรี</span>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all ${activeView === "tools" ? "border-[#1e1e1e] bg-[#161616] text-[#ffffff]" : "border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]"}`}
                    onClick={() => {
                      if (!user) {
                        Swal.fire({
                          icon: "warning",
                          title: "กรุณาเข้าสู่ระบบ",
                          text: "คุณต้องเข้าสู่ระบบก่อนใช้งานตัวเลือกนี้",
                          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
                          confirmButtonColor: "#9b59f5",
                          background: "#111",
                          color: "#fff"
                        }).then(() => {
                           setActiveView("login");
                           setIsMobileMenuOpen(false);
                        });
                        return;
                      }
                      setActiveView("tools");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Bot className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">เครื่องมือ</span>
                  </div>
                  <div
                    className={`nav-row flex items-center gap-[13px] border rounded-lg p-[10px] px-[14px] cursor-pointer transition-all border-transparent text-[#888888] hover:bg-[#111111] hover:text-[#ffffff]`}
                    onClick={() => {
                      setShowContactUs(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Phone className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium">ติดต่อเรา</span>
                  </div>
                </div>

                {/* สมาชิก */}
                {user ? (
                  <div className="px-[14px] pt-[20px] shrink-0">
                    <div className="text-[14px] font-medium text-[#888888] mb-[8px] flex items-center gap-2">
                      <User className="w-[18px] h-[18px]" />
                      สมาชิก
                    </div>
                    <div
                      onClick={() => setIsUserMenuOpen((v) => !v)}
                      className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-3 flex flex-col gap-3 cursor-pointer hover:border-[#333333] transition-all shadow-sm active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-[#1e1e1e] p-[1px] shrink-0 shadow-sm">
                          <div className="w-full h-full rounded-full bg-[#0a0a0a] overflow-hidden">
                            <img
                              src={getAvatarUrl(
                                user?.id ||
                                  userPlan?.username ||
                                  user?.email?.split("@")[0] ||
                                  "guest",
                              )}
                              alt="avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[#ffffff] truncate pr-2">
                              {userPlan?.username || user?.email?.split("@")[0]}
                            </span>
                            <div
                              className={`text-[#888888] transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : "rotate-0"}`}
                            >
                              <ChevronDownIcon />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {userPlan?.isPremium ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#9b59f5]/10 text-[#9b59f5] border border-[#9b59f5]/20 text-[10px] font-medium rounded-md uppercase tracking-wider shadow-sm">
                                <Crown className="w-3 h-3" />
                                Premium
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#161616] text-[#888888] border border-[#1e1e1e] text-[10px] font-medium rounded-md uppercase tracking-wider shadow-sm">
                                <User className="w-3 h-3" />
                                {getUserRank(userPlan, user)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#161616] border border-[#1e1e1e] flex items-center justify-center shadow-sm overflow-hidden">
                              <Coins className="w-4 h-4 text-[#ffffff]" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <Wallet className="w-3 h-3 text-[#888888]" />
                                <span className="text-[10px] font-medium text-[#888888] uppercase tracking-wide">
                                  ยอดเงินคงเหลือ
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[16px] font-medium text-[#ffffff]">
                                  {userPlan?.balance
                                    ? Math.floor(userPlan.balance).toLocaleString()
                                    : "0"}
                                </span>
                                <span className="text-[12px] font-medium text-[#9b59f5]">
                                  ฿
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User dropdown */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out`}
                      style={{
                        maxHeight: isUserMenuOpen ? "800px" : "0px",
                        opacity: isUserMenuOpen ? 1 : 0,
                        marginTop: isUserMenuOpen ? "8px" : "0px",
                      }}
                    >
                      <div className="bg-[#111111] shadow-inner border border-[#1e1e1e] rounded-xl overflow-hidden">
                        <div className="p-3 px-4 pb-2 text-[13px] font-medium text-[#ffffff] border-b border-[#1e1e1e]">
                          {userPlan?.username || user?.email?.split("@")[0]}
                        </div>
                      <div
                        className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#888888] border-b border-[#1e1e1e] cursor-pointer transition-colors ${activeView === "profile" ? "bg-[#161616] text-[#ffffff]" : "hover:bg-[#161616] hover:text-[#ffffff]"}`}
                        onClick={() => {
                          setActiveView("profile");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <User className="w-[16px] h-[16px]" />
                        โปรไฟล์
                      </div>
                      <div
                        className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#888888] border-b border-[#1e1e1e] cursor-pointer transition-colors ${activeView === "settings" ? "bg-[#161616] text-[#ffffff]" : "hover:bg-[#161616] hover:text-[#ffffff]"}`}
                        onMouseEnter={() => settingsImport()}
                        onClick={() => {
                          setActiveView("settings");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="w-[16px] h-[16px]" />
                        การตั้งค่าผู้ใช้
                      </div>
                      <div
                        className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#888888] border-b border-[#1e1e1e] cursor-pointer transition-colors ${activeView === "wallet_history" ? "bg-[#161616] text-[#ffffff]" : "hover:bg-[#161616] hover:text-[#ffffff]"}`}
                        onMouseEnter={() => historyImport()}
                        onClick={() => {
                          setActiveView("wallet_history");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Wallet className="w-[16px] h-[16px]" />
                        ประวัติเติมเงิน
                      </div>
                      <div
                        className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#888888] border-b border-[#1e1e1e] cursor-pointer transition-colors ${activeView === "order_history" ? "bg-[#161616] text-[#ffffff]" : "hover:bg-[#161616] hover:text-[#ffffff]"}`}
                        onMouseEnter={() => historyImport()}
                        onClick={() => {
                          setActiveView("order_history");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <ShoppingBag className="w-[16px] h-[16px]" />
                        ประวัติการซื้อสินค้า
                      </div>
                      <div
                        className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#888888] border-b border-[#1e1e1e] cursor-pointer transition-colors ${activeView === "random_history" ? "bg-[#161616] text-[#ffffff]" : "hover:bg-[#161616] hover:text-[#ffffff]"}`}
                        onMouseEnter={() => historyImport()}
                        onClick={() => {
                          setActiveView("random_history");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Gift className="w-[16px] h-[16px]" />
                        ประวัติการสุ่มสินค้า
                      </div>
                      {isAdmin && (
                        <div
                          className={`dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-[#9b59f5] border-b border-[#1e1e1e] cursor-pointer transition-colors bg-[#161616]`}
                          onClick={() => {
                            setActiveView("admin");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <ShieldAlert className="w-[16px] h-[16px]" />
                          จัดการหลังบ้าน
                        </div>
                      )}
                      <div
                        className="dd-row flex items-center gap-3 p-3 px-4 text-[13px] font-medium text-red-500 cursor-pointer transition-colors hover:bg-red-900/10"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-[16px] h-[16px]" />
                        ออกจากระบบ
                      </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-6 my-4">
                       <div className="w-full h-[1px] bg-[#1e1e1e]" />
                    </div>
                    <div className="px-[14px] flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setActiveView("login");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-2.5 bg-[#ffffff] hover:bg-[#e0e0e0] text-[#0a0a0a] rounded-lg font-medium text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                      >
                        <LogIn className="w-[18px] h-[18px]" /> เข้าสู่ระบบ
                      </button>
                      <div className="flex items-center gap-3 px-4">
                         <div className="h-[1px] flex-1 bg-[#1e1e1e]" />
                         <span className="text-[10px] text-[#888888] font-medium uppercase tracking-widest">or</span>
                         <div className="h-[1px] flex-1 bg-[#1e1e1e]" />
                      </div>
                      <button
                        onClick={() => {
                          setActiveView("signup");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-2.5 bg-[#161616] hover:bg-[#111111] border border-[#1e1e1e] hover:border-[#333333] text-[#ffffff] rounded-lg font-medium text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                      >
                        <UserPlus className="w-[18px] h-[18px]" /> สมัครสมาชิก
                      </button>
                    </div>
                  </>
                )}

                <div className="flex-1 min-h-[20px]" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Verification Banner Removed */}

        {/* Global Page Header (Based on activeView) for Mobile */}
        {activeView !== "home" && (
          <div className="lg:hidden px-[18px] pt-[14px] pb-[10px] flex gap-[12px] items-center shrink-0 border-b border-white/5 bg-[#111318]">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none mb-1">
                {activeView === "categories" ? "Main Shop" :
                 activeView === "wallet" ? "Billing" :
                 activeView === "profile" ? "Profile Info" :
                 activeView === "history" ? "History" : "Activity"}
              </div>
              <div className="text-[20px] font-black text-white leading-none">
                {activeView === "categories" ? "สินค้าทั่วไป" :
                 activeView === "category_products" ? "รายการสินค้า" :
                 activeView === "wallet" ? "เติมเงิน" :
                 activeView === "profile" ? "โปรไฟล์" :
                 activeView === "history" ? "ประวัติ" :
                 activeView === "admin" ? "ระบบหลังบ้าน" : ""}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-0 sm:pt-2 pb-6 lg:pb-0 w-full flex-1 flex flex-col">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-10">
                <div className="w-8 h-8 border-4 border-[#3B82F6] border-t-transparent flex-shrink-0 animate-spin rounded-full"></div>
              </div>
            }
          >
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
            {activeView === "free_website" && (
              <FreeWebsiteTool userPlan={userPlan} products={products} onBack={() => setActiveView("tools")} />
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
            {activeView === "two_fa_generator" && <TwoFAGenerator />}
            {activeView === "proxy_ff_ios" && <ProxyFreeFireIOSTool />}
            {activeView === "proxy_free" && <ProxyFreeTool />}
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
            )}{" "}
          </Suspense>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-16 pb-8 border-t border-[#3B82F6]/10 relative overflow-hidden bg-[#0A0D12]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px from-transparent via-[#3B82F6]/50 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-zinc-500 mb-12 text-center md:text-center">
              {/* Brand & Intro */}
              <div className="col-span-1 md:col-span-1 flex flex-col items-center">
                <img 
                  src="https://img2.pic.in.th/4D8F9A5A-1535-4802-BD86-5FA08F0D3B3D.png" 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto mb-4"
                />
                <p
                  className="leading-relaxed mb-6 text-zinc-400 select-all cursor-text hover:text-white transition-colors"
                  title="คลิกเพื่อคัดลอก"
                >
                  APEXSTORE | จำหน่ายสินค้าราคาถูก ปลอดภัย 100%
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
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      สินค้าทั่วไป
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveView("premium")}
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      แอพพรีเมียม
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveView("vip")}
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      ยศ VIP
                    </button>
                  </li>
                </ul>
              </div>

              {/* Links Group 2 */}
              <div className="flex flex-col items-center">
                <h4 className="text-white font-bold mb-4 tracking-wider">
                  ข้อมูลสำคัญ
                </h4>
                <ul className="space-y-3 flex flex-col items-center">
                  <li>
                    <button
                      onClick={() => setShowAboutUs(true)}
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      เกี่ยวกับเรา
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowTerms(true)}
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      เงื่อนไขการใช้งาน
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowPrivacy(true)}
                      className="hover:text-[#3B82F6] transition-colors"
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowContactUs(true)}
                      className="hover:text-[#3B82F6] transition-colors"
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
                    <a
                      href="https://discord.gg/EvFjgkSB4W"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 hover:text-[#5865F2] transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5865F2]"></div>
                      Discord
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${siteSettings?.contact_email || "support.apexstoreth@gmail.com"}`}
                      className="flex items-center gap-2 hover:text-white text-zinc-400 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                      Email Support
                    </a>
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
        <AnimatePresence>
          {showPrivacy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]  font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 shrink-0 text-[#2563EB]" />{" "}
                  นโยบายความเป็นส่วนตัว (Privacy Policy)
                </h2>
                <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                <div className="pt-6 mt-6 border-t border-white/5 flex gap-3 flex-col sm:flex-row justify-end">
                  <button
                    onClick={() => setShowPrivacy(false)}
                    className="bg-[#3B82F6]/10 hover:bg-[#3B82F6]/25 text-[#3B82F6] font-bold py-3 px-8 rounded-2xl transition-colors w-full sm:w-auto"
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
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]  font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                  <ListChecks className="w-6 h-6 shrink-0 text-[#2563EB]" />{" "}
                  ข้อกำหนดการใช้งาน (Terms of Use)
                </h2>
                <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
                  <div>
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
                      6. การระงับกรณีเปิดเครื่องมือ Developer Tools
                    </h3>
                    <p>
                      หากเราตรวจพบว่าคุณพยายามเข้าถึง Inspection Tools หรือ
                      Console เพื่อป่วนการหน่วงเวลา ระบบจะจับรีไดเร็ค ล้าง
                      Session การใช้งาน ปิดบังรหัส หรือหยุดทำงาน
                      ถือว่าผู้ใช้ฝืนกฎโดยเจตนา
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base mb-2">
                      7. เหตุสุดวิสัยและการปรับปรุง
                    </h3>
                    <p>
                      ในกรณีที่มีการอัปเดตรหัส ฝั่ง Third-Party เปลี่ยนมาตรการ
                      ปิดช่องโหว่ ปิดพอร์ต หรือเหตุภัยพิบัติซึ่งทำให้ระบบบอท
                      เครื่องมือ ตลอดจนหน้าต่างตรวจสอบไม่สามารถใช้การได้
                      ถือเป็นเหตุที่เหนือการควบคุม (Force Majeure)
                      และเราอาจจำเป็นต้องยุติฟีเจอร์นั้นชั่วคราวหรือถาวร
                      โดยไม่จำเป็นต้องชดเชย
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-white/5 text-right w-full">
                  <button
                    onClick={() => setShowTerms(false)}
                    className="bg-[#3B82F6] hover:bg-[#1D4ED8] text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
                  >
                    ข้าพเจ้ายอมรับและตกลงตามข้อกำหนดกติกา
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAboutUs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]  font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                  <div className="w-8 h-8 rounded-full bg-[#3B82F6]/25 flex items-center justify-center text-[#3B82F6]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  บริษัทและโครงการ (About APEXSTORE)
                </h2>
                <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-zinc-400 scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
                  <div>
                    <h3 className="font-bold text-white text-base mb-2">
                      จุดเริ่มต้น และวิสัยทัศน์ (Vision & Origin)
                    </h3>
                    <p>
                      <strong>APEXSTORE</strong>{" "}
                      เกิดจากแนวคิดที่ต้องการทลายข้อจำกัดด้านเวลาและความยุ่งยากของการบริหารโซเชียลมีเดีย
                      ทรัพยากรบัญชี และคีย์ผลิตภัณฑ์ ด้วยเจตนารมณ์ที่จะรวบรวม
                      "เครื่องมือตัวคัดกรองอัตโนมัติ" และ
                      "สินทรัพย์ดิจิทัลแอปพรีเมียม" เข้าไว้ในแพลตฟอร์มเดียว
                      เราออกแบบเทคโนโลยีที่เน้นเรื่องความเสถียร ความทันสมัย
                      ปลอดภัย และราคาที่ทุกคนจับต้องได้
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base mb-2">
                      ผลิตภัณฑ์หลักของเรา (Products & Services)
                    </h3>
                    <p className="mb-2">
                      เครือข่ายของ APEXSTORE
                      ภาคภูมิใจที่จะนำเสนอขอบข่ายการบริการหลากหลาย ได้แก่ :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>
                          Automation Verification Tools (Checkers):
                        </strong>{" "}
                        เครื่องมือตรวจสอบไอดี (ตัวเช็ค)
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <h3 className="font-bold text-white text-base mb-2">
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
                    <p className="mt-2 text-zinc-500 italic">
                      "ขอบคุณผู้ใช้งานและพันธมิตรทุกคน
                      ที่เล็งเห็นคุณค่าและก้าวเดินไปพร้อมกับ APEXSTORE
                      ขวากหนามทางดิจิทัลไหนที่ยาก... เราพร้อมเบิกทางให้คุณ"
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-white/5 flex justify-end w-full">
                  <button
                    onClick={() => setShowAboutUs(false)}
                    className="bg-[#3B82F6]/10 hover:bg-[#3B82F6]/25 text-[#3B82F6] font-bold py-3 px-8 rounded-2xl transition-all w-full sm:w-auto"
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
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]  font-sans"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 sm:p-8 max-w-md w-full flex flex-col shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                    <Phone className="w-6 h-6 shrink-0 text-[#3B82F6]" />{" "}
                    ติดต่อเรา
                  </h2>
                  <button
                    onClick={() => setShowContactUs(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <a
                    href="https://discord.gg/EvFjgkSB4W"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded-2xl text-white transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="font-bold text-xl block">D</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Discord</h3>
                      <p className="text-zinc-400 text-sm">
                        เข้าร่วมเซิร์ฟเวอร์ของเรา
                      </p>
                    </div>
                  </a>

                  {siteSettings?.contact_email && (
                    <a
                      href={`mailto:${siteSettings.contact_email}`}
                      className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-2xl text-white transition-all group"
                    >
                      <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Email</h3>
                        <p className="text-zinc-400 text-sm">
                          {siteSettings.contact_email}
                        </p>
                      </div>
                    </a>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex justify-end w-full">
                  <button
                    onClick={() => setShowContactUs(false)}
                    className="bg-[#3B82F6]/10 hover:bg-[#3B82F6]/25 text-[#3B82F6] font-bold py-3 px-8 rounded-2xl transition-all w-full sm:w-auto"
                  >
                    ปิดหน้าต่างนี้
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <KeyModal
          show={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          vipTab={vipTab}
          redeemKey={redeemKey}
          userEmail={user?.email}
        />

        {/* Turnstile Modal */}
        {showTurnstileModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[70]  font-sans animate-in zoom-in-95 duration-200">
            <div className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative overflow-hidden flex flex-col items-center">
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
                    <div className="p-3 bg-[#3B82F6]/20 text-[#3B82F6] rounded-xl text-center text-[10px] font-bold w-full mx-8">
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
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm mb-4"
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

        {/* Global Audio Provider */}
        {!deferMedia && siteSettings.spotify_url && (
          <div className="fixed bottom-6 right-6 z-[990] flex flex-col items-end gap-3 pointer-events-none group/float">
            <div className="bg-[#0b0e14]/90  border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black text-[#3B82F6] tracking-widest opacity-0 group-hover/float:opacity-100 transition-opacity mb-1 shadow-2xl pointer-events-none uppercase">
              Music Player
            </div>
            <button
              onClick={() => {
                if (
                  siteSettings.spotify_url.includes("youtube.com") ||
                  siteSettings.spotify_url.includes("youtu.be")
                ) {
                  if (
                    ytIframeRef.current &&
                    ytIframeRef.current.contentWindow
                  ) {
                    if (ytPlaying) {
                      ytIframeRef.current.contentWindow.postMessage(
                        JSON.stringify({
                          event: "command",
                          func: "pauseVideo",
                          args: [],
                        }),
                        "*",
                      );
                      setYtPlaying(false);
                    } else {
                      ytIframeRef.current.contentWindow.postMessage(
                        JSON.stringify({
                          event: "command",
                          func: "unMute",
                          args: [],
                        }),
                        "*",
                      );
                      ytIframeRef.current.contentWindow.postMessage(
                        JSON.stringify({
                          event: "command",
                          func: "playVideo",
                          args: [],
                        }),
                        "*",
                      );
                      setYtPlaying(true);
                    }
                  }
                } else {
                  setIsMusicExpanded(!isMusicExpanded);
                }
              }}
              className={`w-12 h-12 rounded-2xl bg-[#0b0e14]/90  border border-white/10 flex items-center justify-center text-[#3B82F6] shadow-2xl transition-all duration-300 pointer-events-auto hover:scale-110 active:scale-95 ${isMusicExpanded || ytPlaying ? "rotate-90" : ""}`}
              title="เปิด/ปิด แถบเพลง"
            >
              <Music
                className={`w-5 h-5 ${ytPlaying || siteSettings.spotify_autoplay || siteSettings.spotify_url.match(/\.(mp3|wav|ogg|m4a)$/) || siteSettings.spotify_url.includes("drive.google.com/uc") || siteSettings.spotify_url.startsWith("data:audio") ? "animate-pulse" : ""}`}
              />
            </button>

            {!(
              siteSettings.spotify_url.includes("youtube.com") ||
              siteSettings.spotify_url.includes("youtu.be")
            ) && (
              <div
                className={`transition-all duration-500 transform origin-bottom-right pointer-events-auto ${isMusicExpanded || siteSettings.spotify_autoplay ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-50 pointer-events-none"}`}
              >
                <div
                  className={`bg-[#0b0e14]/90  border border-white/10 p-1 rounded-2xl shadow-2xl overflow-hidden ${siteSettings.spotify_url.match(/\.(mp3|wav|ogg|m4a)$/) || siteSettings.spotify_url.includes("drive.google.com/uc") || siteSettings.spotify_url.startsWith("data:audio") ? "w-auto h-auto" : "w-[300px] h-[80px]"}`}
                >
                  {siteSettings.spotify_url.match(/\.(mp3|wav|ogg|m4a)$/) ||
                  siteSettings.spotify_url.includes("drive.google.com/uc") ||
                  siteSettings.spotify_url.startsWith("data:audio") ? (
                    <div className="p-3 flex items-center gap-4 min-w-[280px]">
                      <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center">
                        <Music className="w-5 h-5 text-[#3B82F6] animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          Playing Background Music
                        </p>
                        <audio
                          ref={audioRef}
                          src={formatSpotifyEmbedUrl(
                            siteSettings.spotify_url,
                            false,
                          )}
                          controls
                          autoPlay={siteSettings.spotify_autoplay}
                          loop
                          className="h-8 w-full mt-1 accent-[#3B82F6]"
                        />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={formatSpotifyEmbedUrl(
                        siteSettings.spotify_url,
                        siteSettings.spotify_autoplay || false,
                      )}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-xl"
                    ></iframe>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* YouTube Background Invisible Audio Player */}
        {!deferMedia &&
          siteSettings.spotify_url &&
          (siteSettings.spotify_url.includes("youtube.com") ||
            siteSettings.spotify_url.includes("youtu.be")) && (
            <div
              className="fixed top-0 left-0 w-[400px] h-[300px] pointer-events-none z-[-9999]"
              style={{ opacity: 0.001 }}
            >
              <iframe
                ref={ytIframeRef}
                src={formatSpotifyEmbedUrl(
                  siteSettings.spotify_url,
                  siteSettings.spotify_autoplay || false,
                )}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          )}
      </div>

      {/* Mobile Bottom Navigation Bar removed as per request */}
    </div>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
      <ToastContainer />
    </GlobalErrorBoundary>
  );
}

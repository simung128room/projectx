import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Game, 
  Session, 
  Transaction, 
  User, 
  SessionStatus, 
  GameAccountProduct, 
  ActiveRental, 
  StoreOrder 
} from '../types';
import { INITIAL_ACCOUNT_PRODUCTS } from '../data/storeProducts';

export type AppView = 
  | 'landing' 
  | 'dashboard' 
  | 'games' 
  | 'marketplace' 
  | 'rentals'
  | 'redeem' 
  | 'profile' 
  | 'wallet' 
  | 'history' 
  | 'session-detail' 
  | 'auth';

interface AppContextType {
  user: User;
  isLoggedIn: boolean;
  loginUser: (username: string, email?: string) => void;
  logout: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  language: 'th' | 'en' | 'ko';
  setLanguage: (lang: 'th' | 'en' | 'ko') => void;
  t: Record<string, string>;
  
  // Cloud AFK
  games: Game[];
  sessions: Session[];
  activeSessions: Session[];
  selectedSessionId: string | null;
  setSelectedSessionId: (id: string | null) => void;
  selectedSession: Session | undefined;
  selectedGameForModal: Game | null;
  setSelectedGameForModal: (game: Game | null) => void;
  openCreateModal: boolean;
  setOpenCreateModal: (open: boolean) => void;
  openTopUpModal: boolean;
  setOpenTopUpModal: (open: boolean) => void;
  
  // Marketplace & Rental (From Original System)
  accountProducts: GameAccountProduct[];
  activeRentals: ActiveRental[];
  storeOrders: StoreOrder[];
  selectedProductForModal: GameAccountProduct | null;
  setSelectedProductForModal: (prod: GameAccountProduct | null) => void;
  openPurchaseModal: boolean;
  setOpenPurchaseModal: (open: boolean) => void;
  purchaseModalMode: 'buy' | 'rent';
  setPurchaseModalMode: (mode: 'buy' | 'rent') => void;
  buyAccountProduct: (productId: string) => { success: boolean; error?: string; order?: StoreOrder };
  rentAccountProduct: (productId: string, hours: number) => { success: boolean; error?: string; rental?: ActiveRental };
  returnRentalEarly: (rentalId: string) => void;

  // Transactions & Wallets
  transactions: Transaction[];
  createAFKSession: (
    gameId: string,
    robloxUsername: string,
    durationHours: number,
    robloxPassword?: string,
    cookie?: string
  ) => { success: boolean; error?: string; sessionId?: string };
  stopAFKSession: (sessionId: string) => void;
  pauseAFKSession: (sessionId: string) => void;
  resumeAFKSession: (sessionId: string) => void;
  extendAFKSession: (sessionId: string, hours: number) => { success: boolean; error?: string };
  executeTerminalCommand: (sessionId: string, command: string) => void;
  updateSessionSettings: (sessionId: string, settings: Partial<Session>) => void;
  topUpWallet: (amount: number, method: string) => void;
  redeemVoucher: (code: string) => { success: boolean; amount?: number; error?: string; type?: string };
  redeemTrueMoneyGift: (link: string) => { success: boolean; amount?: number; error?: string };
}

const initialGames: Game[] = [
  {
    id: 'blox-fruits',
    name: 'Blox Fruits',
    mapName: 'Third Sea · Mirage & Pirate Raid',
    category: 'Roblox',
    description: 'ระบบ Auto Farm Mastery, Auto Sea Event, Auto Mirage Island V4 Awakening และ Auto Dough King 24/7',
    pricePerHour: 5.00,
    status: 'available',
    thumbnail: '🍍',
    features: ['Auto Sea Beast & Terrorshark Farm', 'V4 Gear Awakening Helper', 'Anti-AFK Bypass 100%']
  },
  {
    id: 'fisch',
    name: 'Fisch',
    mapName: 'Roslit Bay & Vertigo Trench',
    category: 'Roblox',
    description: 'ตกปลาอัตโนมัติ Auto Cast, Auto Shake, Auto Reel Perfect 100%, ขายปลาออโต้เมื่อช่องเต็ม',
    pricePerHour: 4.50,
    status: 'available',
    thumbnail: '🎣',
    features: ['Perfect Reel Mini-Game 100%', 'Auto Sell & Auto Bait Buy', 'Mythic & Secret Fish Notifier']
  },
  {
    id: 'anime-defenders',
    name: 'Anime Defenders',
    mapName: 'Infinite Tower & Raid Challenge',
    category: 'Roblox',
    description: 'Auto Macro Placement, Auto Upgrade Unit, Auto Retry Story & Infinite Mode เก็บ Gem มหาศาล',
    pricePerHour: 5.00,
    status: 'available',
    thumbnail: '⚔️',
    features: ['Infinite Mode Auto Retry', 'Auto Skill & Upgrade Priority', 'Discord Gem Counter Alerts']
  },
  {
    id: 'pet-simulator-99',
    name: 'Pet Simulator 99',
    mapName: 'World 3 · Tech Spawn & Huge Chest',
    category: 'Roblox',
    description: 'ฟาร์มเหรียญเพชร Auto Breakables, Auto Hatch Huge Egg, Auto Use Ultimate และเก็บของดรอปตลอดคืน',
    pricePerHour: 4.00,
    status: 'available',
    thumbnail: '🐾',
    features: ['Auto Hatch Huge / Titanic Eggs', 'Fast Coin Area Destroyer', 'Auto Claim Free Gifts']
  },
  {
    id: 'king-legacy',
    name: 'King Legacy',
    mapName: 'Third Sea · Hydra & Sea King',
    category: 'Roblox',
    description: 'Auto Farm Level, Auto Kill Boss, Auto Sea King & Ghost Ship ดรอปดาบและผลระดับตำนาน',
    pricePerHour: 4.50,
    status: 'available',
    thumbnail: '👑',
    features: ['Auto Sea King Spawn Alert', 'Auto Farm Quest & Bosses', 'Auto Stat Allocation']
  },
  {
    id: 'genshin-afk',
    name: 'Genshin Impact (Cloud Bot)',
    mapName: 'Teyvat · Daily & Resin Dispatch',
    category: 'Gacha',
    description: 'ทำเควสต์ประจำวัน Auto Daily Commission, ลงดันเจี้ยนฟาร์ม Artifacts และใช้ Resin อัตโนมัติ',
    pricePerHour: 8.00,
    status: 'available',
    thumbnail: '✨',
    features: ['Auto Daily Commissions 4/4', 'Condensed Resin Crafting', 'Expedition Auto Collect']
  }
];

const initialSessions: Session[] = [
  {
    id: 'MC-88219',
    gameId: 'blox-fruits',
    gameName: 'Blox Fruits',
    mapName: 'Third Sea · Mirage & Pirate Raid',
    robloxUsername: 'SiamGamer_Pro99',
    status: 'running',
    startedAt: new Date(Date.now() - 3600 * 1000 * 2.5).toISOString(),
    endsAt: new Date(Date.now() + 3600 * 1000 * 5.5).toISOString(),
    durationHours: 8,
    remainingSeconds: 19800,
    totalSeconds: 28800,
    price: 40.00,
    itemsCollected: 48,
    pingMs: 16,
    memoryMb: 156,
    workerName: 'MINICLOUD-BKK-NODE-04',
    workerId: 'worker-sg-04a',
    autoReconnect: true,
    antiAfkJump: true,
    webhookUrl: '',
    logs: [
      { id: '1', timestamp: '18:30:12', level: 'info', message: 'Instance spawned in Cloud Container Sandbox #BKK-04' },
      { id: '2', timestamp: '18:30:15', level: 'info', message: 'Roblox client launched via headless engine' },
      { id: '3', timestamp: '18:30:22', level: 'success', message: 'Connected to Roblox game server (Sea 3, ID: 74219)' },
      { id: '4', timestamp: '18:30:25', level: 'info', message: 'Bypassing Roblox 20-min AFK idle detector...' },
      { id: '5', timestamp: '18:35:40', level: 'success', message: '[LOOT] Collected Mirage Mirror Fragment (+1)' },
      { id: '6', timestamp: '19:12:05', level: 'info', message: 'Auto anti-idle micro jump cycle executed' },
      { id: '7', timestamp: '19:45:10', level: 'success', message: '[LEVEL UP] Mastery Level increased to 580' },
      { id: '8', timestamp: '20:10:00', level: 'cmd', message: 'Telemetry ping: 16ms, FPS: 60, RAM: 156MB' }
    ]
  }
];

const initialActiveRentals: ActiveRental[] = [
  {
    id: 'RNT-2026-991',
    productId: 'prod-val-01',
    productTitle: 'Valorant | Immortal 3 มีด Ignis Fan + Reaver Karambit',
    gameName: 'Valorant',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    durationHours: 6,
    startTime: Date.now() - 3600 * 1000 * 1.5,
    endTime: Date.now() + 3600 * 1000 * 4.5,
    remainingSeconds: 16200,
    pricePaid: 120,
    credentials: {
      username: 'Val_Immortal3_TH',
      password: 'Riot#ValGod2026',
      twoFactorKey: 'RIOT-2FA-88192',
      instructions: 'ห้ามเปิดโปรแกรมช่วยเล่น, ห้ามเปลี่ยนรหัสผ่าน, หากเล่นเสร็จสามารถกดปุ่มคืนไอดีได้ทันที'
    },
    status: 'active'
  }
];

const initialStoreOrders: StoreOrder[] = [
  {
    id: 'ORD-9982',
    orderNumber: 'MC-ORD-2026-9982',
    productId: 'prod-rbx-01',
    productTitle: 'Blox Fruits | Max Lv.2550 + Kitsune Perm + V4 Full Gear',
    gameName: 'Roblox Blox Fruits',
    type: 'buy',
    price: 1590,
    purchasedAt: '31/08/2026 15:40',
    credentials: {
      username: 'SiamKitsune_God',
      password: 'CloudPass#Blox2026',
      twoFactorKey: 'RBX-2FA-99201',
      emailLinked: 'เมลสะอาด ไม่ผูกเบอร์'
    }
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 'TX-99014',
    type: 'topup',
    amount: 150.00,
    description: 'เติมเงินผ่าน PromptPay QR Code',
    paymentMethod: 'PromptPay',
    timestamp: '02/09/2026 18:20'
  },
  {
    id: 'TX-99015',
    type: 'afk_charge',
    amount: 40.00,
    description: 'ชำระค่าบริการ AFK Blox Fruits (8 ชม.)',
    paymentMethod: 'Wallet',
    timestamp: '02/09/2026 18:30'
  },
  {
    id: 'TX-99016',
    type: 'rental',
    amount: 120.00,
    description: 'เช่าไอดี Valorant Immortal 3 (6 ชม.)',
    paymentMethod: 'Wallet',
    timestamp: '02/09/2026 19:00'
  }
];

const translations: Record<string, Record<string, string>> = {
  th: {
    navDashboard: 'แดชบอร์ด AFK',
    navMarketplace: 'ตลาดซื้อ-เช่าไอดี',
    navRentals: 'ไอดีที่กำลังเช่า',
    navGames: 'เกมที่รองรับ',
    navRedeem: 'แลกโค้ด',
    navWallet: 'กระเป๋าเงิน',
    navHistory: 'ประวัติการใช้งาน',
    navProfile: 'โปรไฟล์ & ตั้งค่า',
    walletTitle: 'กระเป๋าเงิน & เติมเงิน',
    walletSubtitle: 'จัดการยอดเงินคงเหลือ เติมเงินผ่าน PromptPay หรือ ทรูมันนี่ และตรวจสอบประวัติการทำรายการ',
    walletAvailableBalance: 'ยอดเงินคงเหลือในกระเป๋า',
    btnTopUp: 'เติมเงินเข้ากระเป๋า',
    walletRecentTx: 'ประวัติการทำรายการ',
    walletNoTx: 'ยังไม่มีรายการทำรายการ',
    gamesTitle: 'เกมที่รองรับระบบ Cloud AFK',
    gameBadgeActive: 'พร้อมใช้งาน',
    statusMaintenance: 'ปรับปรุง',
    gameFeature1: 'ระบบ Auto Farm & Auto Collect',
    createSummaryRate: 'อัตราค่าบริการ',
    createHourUnit: 'ชม.',
    btnLaunchAFK: 'เริ่มรัน AFK',
    detailBack: 'กลับไปแดชบอร์ด',
    statusRunning: 'กำลังทำงาน',
    statusCompleted: 'เสร็จสิ้น',
    statusStopped: 'หยุดทำงาน',
    statusFailed: 'ผิดพลาด',
    detailRemainingTime: 'เวลาที่เหลืออยู่',
    btnExtendTime: 'ต่อเวลา',
    btnStopSession: 'ยุติการรันเซสชันนี้',
    extendModalTitle: 'ต่อเวลาการรัน AFK',
    extendModalDesc: 'เลือกจำนวนชั่วโมงที่ต้องการเพิ่มสำหรับเซสชัน',
    createSummaryWallet: 'ยอดเงินในกระเป๋า',
    createSummaryTotal: 'ยอดชำระทั้งหมด',
    createBtnCancel: 'ยกเลิก',
    extendModalBtnConfirm: 'ยืนยันการต่อเวลา',
    badgeSystemOnline: 'ระบบ Cloud Sandbox ออนไลน์ 100%',
    heroHeadlineAccent: 'ศูนย์รวมระบบ Cloud AFK บอทเกม & ตลาดไอดีครบวงจร 24/7',
    heroDescription: 'ปล่อยฟาร์มอัตโนมัติ ปลอดภัย ไม่โดนแบน พร้อมระบบซื้อ-เช่าไอดีเกมแท้ ปลดล็อกทุกไอเทมระดับตำนานในคลิกเดียว',
    btnStartAFKNow: 'เริ่มใช้งาน AFK เลย',
    btnExploreGames: 'ดูเกมที่รองรับ',
    featureTitle1: 'เปิดเครื่องทำงานทันที',
    featureDesc1: 'ระบบ Deploy อินสแตนซ์ให้ภายใน 3 วินาที พร้อมเชื่อมต่อเซิร์ฟเวอร์เกมทันที',
    featureTitle2: 'Anti-Ban & IP แยกอิสระ',
    featureDesc2: 'ทำงานบน Sandbox ปลอดภัย ไม่เสี่ยงโดนแบน พร้อมระบบข้าม Anti-AFK Kick',
    featureTitle3: 'มอนิเตอร์สด & แจ้งเตือน',
    featureDesc3: 'ดูภาพจอจำลองสด 60 FPS พิมพ์คำสั่งใน Terminal และรับแจ้งเตือนผ่าน Discord',
    historyTitle: 'ประวัติการใช้งานเซสชัน',
    historySubtitle: 'บันทึกประวัติการรันบอทและสถานะการทำงานทั้งหมดของคุณ',
    historyFilterAll: 'ทั้งหมด',
    historyFilterRunning: 'กำลังทำงาน',
    historyFilterCompleted: 'สำเร็จแล้ว',
    historyFilterStopped: 'หยุดเอง',
    historyFilterFailed: 'ล้มเหลว',
    historyNoRecords: 'ไม่พบประวัติเซสชัน',
    dashTitle: 'ภาพรวมระบบ & เซสชันสด',
    statActiveSessions: 'บอทที่กำลังรัน',
    statTotalHours: 'ชั่วโมงสะสม',
    statWalletBalance: 'ยอดเงินคงเหลือ',
    labelRemaining: 'เวลาที่เหลืออยู่',
    specStarted: 'เริ่มเมื่อ',
    specEnds: 'สิ้นสุดเมื่อ',
    detailTitle: 'เข้าสู่หน้าจอควบคุม & มอนิเตอร์',
    noActiveSessionsTitle: 'ยังไม่มีเซสชันที่กำลังรันอยู่',
    noActiveSessionsDesc: 'เริ่มต้นสร้างเซสชัน Cloud AFK เพื่อเริ่มฟาร์มอัตโนมัติได้ทันที',
    sectionActiveSessions: 'เซสชันอื่นๆ ที่กำลังรัน',
    btnCreateAFK: 'สร้าง AFK ใหม่'
  },
  en: {
    navDashboard: 'AFK Dashboard',
    navMarketplace: 'ID Marketplace',
    navRentals: 'Active Rentals',
    navGames: 'Supported Games',
    navRedeem: 'Redeem Code',
    navWallet: 'Wallet',
    navHistory: 'History & Orders',
    navProfile: 'Profile & Settings',
    walletTitle: 'Wallet & Top Up',
    walletSubtitle: 'Manage your balance, top up via PromptPay / TrueMoney, and view transaction history',
    walletAvailableBalance: 'Available Balance',
    btnTopUp: 'Top Up Wallet',
    walletRecentTx: 'Recent Transactions',
    walletNoTx: 'No transaction history found',
    gamesTitle: 'Cloud AFK Supported Games',
    gameBadgeActive: 'Ready',
    statusMaintenance: 'Maintenance',
    gameFeature1: 'Auto Farm & Auto Collect',
    createSummaryRate: 'Hourly Rate',
    createHourUnit: 'hrs',
    btnLaunchAFK: 'Launch AFK',
    detailBack: 'Back to Dashboard',
    statusRunning: 'Running',
    statusCompleted: 'Completed',
    statusStopped: 'Stopped',
    statusFailed: 'Failed',
    detailRemainingTime: 'Remaining Time',
    btnExtendTime: 'Extend Time',
    btnStopSession: 'Stop this Session',
    extendModalTitle: 'Extend AFK Time',
    extendModalDesc: 'Select additional duration for session',
    createSummaryWallet: 'Wallet Balance',
    createSummaryTotal: 'Total Payment',
    createBtnCancel: 'Cancel',
    extendModalBtnConfirm: 'Confirm Extension',
    badgeSystemOnline: 'Cloud Sandbox 100% Online',
    heroHeadlineAccent: '24/7 Automated Game Farming & Premium ID Marketplace',
    heroDescription: 'Farm levels, grind mastery, rent top tier accounts, and collect rare items 24/7 without keeping your PC or phone turned on.',
    btnStartAFKNow: 'Start AFK Now',
    btnExploreGames: 'Explore Games',
    featureTitle1: 'Instant Deployment',
    featureDesc1: 'Sandbox instance boots up in 3 seconds and connects directly to game servers.',
    featureTitle2: 'Anti-Ban & Dedicated IP',
    featureDesc2: 'Zero risk with dedicated sandbox containers and built-in anti-AFK kick bypass.',
    featureTitle3: 'Live Monitor & Alerts',
    featureDesc3: 'Live 60 FPS monitor canvas stream, interactive terminal, and Discord alerts.',
    historyTitle: 'Session History',
    historySubtitle: 'Detailed record of all your bot instances and completion statuses',
    historyFilterAll: 'All',
    historyFilterRunning: 'Running',
    historyFilterCompleted: 'Completed',
    historyFilterStopped: 'Stopped',
    historyFilterFailed: 'Failed',
    historyNoRecords: 'No session records found',
    dashTitle: 'Overview & Live Sessions',
    statActiveSessions: 'Active Bots',
    statTotalHours: 'Total Hours',
    statWalletBalance: 'Wallet Balance',
    labelRemaining: 'Remaining Time',
    specStarted: 'Started at',
    specEnds: 'Ends at',
    detailTitle: 'Open Control Panel & Monitor',
    noActiveSessionsTitle: 'No Active Sessions',
    noActiveSessionsDesc: 'Create a new Cloud AFK instance to start automated farming.',
    sectionActiveSessions: 'Other Active Sessions',
    btnCreateAFK: 'New AFK'
  },
  ko: {
    navDashboard: '대시보드',
    navMarketplace: '아이디 거래소',
    navRentals: '대여 중인 계정',
    navGames: '지원 게임',
    navRedeem: '코드 교환',
    navWallet: '지갑',
    navHistory: '이용 내역',
    navProfile: '프로필 및 설정',
    walletTitle: '지갑 & 충전',
    walletSubtitle: '잔액 관리, 결제 및 거래 내역 확인',
    walletAvailableBalance: '사용 가능한 잔액',
    btnTopUp: '지갑 충전',
    walletRecentTx: '최근 거래 내역',
    walletNoTx: '거래 내역이 없습니다',
    gamesTitle: '지원되는 클라우드 게임 목록',
    gameBadgeActive: '이용 가능',
    statusMaintenance: '점검 중',
    gameFeature1: '자동 파밍 & 아이템 수집',
    createSummaryRate: '시간당 요금',
    createHourUnit: '시간',
    btnLaunchAFK: 'AFK 시작',
    detailBack: '대시보드로 돌아가기',
    statusRunning: '실행 중',
    statusCompleted: '완료됨',
    statusStopped: '중지됨',
    statusFailed: '실패',
    detailRemainingTime: '남은 시간',
    btnExtendTime: '시간 연장',
    btnStopSession: '세션 중지',
    extendModalTitle: 'AFK 시간 연장',
    extendModalDesc: '추가할 시간을 선택하세요',
    createSummaryWallet: '지갑 잔액',
    createSummaryTotal: '총 결제 금액',
    createBtnCancel: '취소',
    extendModalBtnConfirm: '연장 확인',
    badgeSystemOnline: '클라우드 샌드박스 100% 가동 중',
    heroHeadlineAccent: '클라우드 기반 24/7 자동 게임 봇 & 계정 거래소',
    heroDescription: 'PC를 켜두지 않고도 24시간 안전하게 파밍하고 계정을 대여하세요.',
    btnStartAFKNow: '지금 시작하기',
    btnExploreGames: '지원 게임 보기',
    featureTitle1: '즉각적인 클라우드 배포',
    featureDesc1: '3초 안에 샌드박스 인스턴스가 생성되어 게임 서버에 접속합니다.',
    featureTitle2: '전용 IP & 밴 방지',
    featureDesc2: '계정별 독립된 IP와 샌드박스 환경으로 안전하게 작동합니다.',
    featureTitle3: '실시간 모니터링',
    featureDesc3: '60 FPS 캔버스 스트림과 Discord 웹훅 알림을 제공합니다.',
    historyTitle: '세션 기록',
    historySubtitle: '모든 봇 실행 기록과 상태 확인',
    historyFilterAll: '전체',
    historyFilterRunning: '실행 중',
    historyFilterCompleted: '완료',
    historyFilterStopped: '중지',
    historyFilterFailed: '실패',
    historyNoRecords: '세션 기록이 없습니다',
    dashTitle: '개요 및 실시간 세션',
    statActiveSessions: '실행 중인 봇',
    statTotalHours: '총 누적 시간',
    statWalletBalance: '지갑 잔액',
    labelRemaining: '남은 시간',
    specStarted: '시작 시간',
    specEnds: '종료 시간',
    detailTitle: '제어판 및 모니터 열기',
    noActiveSessionsTitle: '실행 중인 세션이 없습니다',
    noActiveSessionsDesc: '새로운 클라우드 AFK 인스턴스를 시작해보세요.',
    sectionActiveSessions: '기타 활성 세션',
    btnCreateAFK: '새 AFK 생성'
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: 'USR-8910',
    username: 'abopboa',
    email: 'abopboa.b@gmail.com',
    walletBalance: 1250.00,
    isVip: true,
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
    joinedDate: '15/07/2026',
    totalSpent: 3450.00,
    rank: 'VIP Member'
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'th' | 'en' | 'ko'>('th');

  const [games] = useState<Game[]>(initialGames);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>('MC-88219');
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openTopUpModal, setOpenTopUpModal] = useState<boolean>(false);
  
  // Store states
  const [accountProducts, setAccountProducts] = useState<GameAccountProduct[]>(INITIAL_ACCOUNT_PRODUCTS);
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>(initialActiveRentals);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>(initialStoreOrders);
  const [selectedProductForModal, setSelectedProductForModal] = useState<GameAccountProduct | null>(null);
  const [openPurchaseModal, setOpenPurchaseModal] = useState<boolean>(false);
  const [purchaseModalMode, setPurchaseModalMode] = useState<'buy' | 'rent'>('buy');

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Sync dark class to html document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Countdown timer for active AFK sessions
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.status !== 'running') return session;
          if (session.remainingSeconds <= 1) {
            return {
              ...session,
              remainingSeconds: 0,
              status: 'completed',
              logs: [
                ...session.logs,
                {
                  id: String(Date.now()),
                  timestamp: new Date().toLocaleTimeString('th-TH'),
                  level: 'success',
                  message: 'Session completed successfully. All progress preserved.'
                }
              ]
            };
          }
          const shouldCollectItem = Math.random() < 0.15;
          const updatedItems = shouldCollectItem ? session.itemsCollected + 1 : session.itemsCollected;

          return {
            ...session,
            remainingSeconds: session.remainingSeconds - 1,
            itemsCollected: updatedItems
          };
        })
      );

      // Countdown timer for active rentals
      setActiveRentals((prevRentals) =>
        prevRentals.map((rental) => {
          if (rental.status !== 'active') return rental;
          const newRemaining = Math.max(0, Math.floor((rental.endTime - Date.now()) / 1000));
          if (newRemaining <= 0) {
            return {
              ...rental,
              remainingSeconds: 0,
              status: 'completed'
            };
          }
          return {
            ...rental,
            remainingSeconds: newRemaining
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activeSessions = sessions.filter((s) => s.status === 'running' || s.status === 'paused');
  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const loginUser = (username: string, email?: string) => {
    setUser({
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      username: username || 'GameMaster',
      email: email || `${username}@cloud.app`,
      walletBalance: user.walletBalance,
      isVip: true,
      rank: 'VIP Member'
    });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentView('landing');
  };

  const createAFKSession = (
    gameId: string,
    robloxUsername: string,
    durationHours: number,
    robloxPassword?: string,
    cookie?: string
  ) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return { success: false, error: 'ไม่พบข้อมูลเกม' };

    const totalPrice = game.pricePerHour * durationHours;
    if (user.walletBalance < totalPrice) {
      return { success: false, error: `ยอดเงินคงเหลือไม่เพียงพอ (ต้องการ ฿${totalPrice.toFixed(2)}) กรุณาเติมเงินก่อน` };
    }

    // Deduct wallet
    setUser((prev) => ({ ...prev, walletBalance: prev.walletBalance - totalPrice }));

    const newId = `MC-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const ends = new Date(now.getTime() + durationHours * 3600 * 1000);

    const newSession: Session = {
      id: newId,
      gameId: game.id,
      gameName: game.name,
      mapName: game.mapName,
      robloxUsername: robloxUsername.trim(),
      status: 'running',
      startedAt: now.toISOString(),
      endsAt: ends.toISOString(),
      durationHours,
      remainingSeconds: durationHours * 3600,
      totalSeconds: durationHours * 3600,
      price: totalPrice,
      itemsCollected: 0,
      pingMs: Math.floor(12 + Math.random() * 15),
      memoryMb: Math.floor(130 + Math.random() * 30),
      workerName: `MINICLOUD-BKK-NODE-0${Math.floor(1 + Math.random() * 4)}`,
      workerId: `worker-sg-0${Math.floor(1 + Math.random() * 4)}${String.fromCharCode(97 + Math.floor(Math.random() * 4))}`,
      autoReconnect: true,
      antiAfkJump: true,
      logs: [
        { id: '1', timestamp: now.toLocaleTimeString('th-TH'), level: 'info', message: `Sandbox container initialized for ${robloxUsername}` },
        { id: '2', timestamp: now.toLocaleTimeString('th-TH'), level: 'info', message: 'Authenticating with Roblox headless runner...' },
        { id: '3', timestamp: now.toLocaleTimeString('th-TH'), level: 'success', message: `Connected to ${game.name} server!` }
      ]
    };

    setSessions((prev) => [newSession, ...prev]);

    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'afk_charge',
      amount: totalPrice,
      description: `เริ่มรัน AFK ${game.name} (${durationHours} ชม.)`,
      paymentMethod: 'Wallet',
      timestamp: `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
    };
    setTransactions((prev) => [newTx, ...prev]);
    setSelectedSessionId(newId);

    return { success: true, sessionId: newId };
  };

  const stopAFKSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'stopped',
          remainingSeconds: 0,
          logs: [
            ...s.logs,
            {
              id: String(Date.now()),
              timestamp: new Date().toLocaleTimeString('th-TH'),
              level: 'warn',
              message: 'Session manually stopped by user.'
            }
          ]
        };
      })
    );
  };

  const pauseAFKSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'paused',
          logs: [
            ...s.logs,
            {
              id: String(Date.now()),
              timestamp: new Date().toLocaleTimeString('th-TH'),
              level: 'warn',
              message: 'Bot movements paused.'
            }
          ]
        };
      })
    );
  };

  const resumeAFKSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status: 'running',
          logs: [
            ...s.logs,
            {
              id: String(Date.now()),
              timestamp: new Date().toLocaleTimeString('th-TH'),
              level: 'success',
              message: 'Bot movements resumed.'
            }
          ]
        };
      })
    );
  };

  const extendAFKSession = (sessionId: string, hours: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return { success: false, error: 'ไม่พบเซสชัน' };

    const game = games.find((g) => g.id === session.gameId) || { pricePerHour: 5 };
    const cost = game.pricePerHour * hours;

    if (user.walletBalance < cost) {
      return { success: false, error: `ยอดเงินไม่พอ (ต้องการ ฿${cost.toFixed(2)})` };
    }

    setUser((prev) => ({ ...prev, walletBalance: prev.walletBalance - cost }));

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const addSec = hours * 3600;
        return {
          ...s,
          durationHours: s.durationHours + hours,
          remainingSeconds: s.remainingSeconds + addSec,
          totalSeconds: s.totalSeconds + addSec,
          price: s.price + cost,
          status: 'running',
          logs: [
            ...s.logs,
            {
              id: String(Date.now()),
              timestamp: new Date().toLocaleTimeString('th-TH'),
              level: 'success',
              message: `Extended time by +${hours} hours (Paid ฿${cost.toFixed(2)})`
            }
          ]
        };
      })
    );

    const now = new Date();
    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'afk_charge',
      amount: cost,
      description: `ต่อเวลาเซสชัน #${sessionId} (+${hours} ชม.)`,
      paymentMethod: 'Wallet',
      timestamp: `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
    };
    setTransactions((prev) => [newTx, ...prev]);

    return { success: true };
  };

  const executeTerminalCommand = (sessionId: string, command: string) => {
    const cmd = command.trim();
    if (!cmd) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const nowStr = new Date().toLocaleTimeString('th-TH');

        if (cmd === '/clear') {
          return {
            ...s,
            logs: [{ id: String(Date.now()), timestamp: nowStr, level: 'info', message: 'Terminal log cleared.' }]
          };
        }

        let respLevel: 'info' | 'success' | 'warn' | 'error' = 'info';
        let respMsg = '';

        if (cmd === '/stats') {
          respLevel = 'info';
          respMsg = `[STATS] Items Collected: ${s.itemsCollected} | Remaining: ${Math.floor(s.remainingSeconds / 60)}m | Latency: ${s.pingMs}ms`;
        } else if (cmd === '/ping') {
          respLevel = 'success';
          respMsg = `[PING] Round-trip latency: ${s.pingMs}ms (Host: ${s.workerName})`;
        } else if (cmd === '/jump') {
          respLevel = 'success';
          respMsg = `[ACTION] Micro anti-idle jump sent to character. Character jumped safely.`;
        } else if (cmd === '/collect') {
          respLevel = 'success';
          respMsg = `[ACTION] Area Loot Magnet executed. Collected +2 nearby dropped items.`;
        } else if (cmd === '/heal' || cmd === '/reconnect') {
          respLevel = 'warn';
          respMsg = `[SYSTEM] Reconnected websocket packet stream. Health restored to 100%.`;
        } else if (cmd === '/help') {
          respLevel = 'info';
          respMsg = `Available commands: /stats, /ping, /jump, /collect, /reconnect, /clear, /help`;
        } else {
          respLevel = 'info';
          respMsg = `Command '${cmd}' received and dispatched to Headless Engine.`;
        }

        return {
          ...s,
          itemsCollected: cmd === '/collect' ? s.itemsCollected + 2 : s.itemsCollected,
          logs: [
            ...s.logs,
            { id: String(Date.now()), timestamp: nowStr, level: 'cmd', message: cmd },
            { id: String(Date.now() + 1), timestamp: nowStr, level: respLevel, message: respMsg }
          ]
        };
      })
    );
  };

  const updateSessionSettings = (sessionId: string, settings: Partial<Session>) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return { ...s, ...settings };
      })
    );
  };

  // Buying game account from store
  const buyAccountProduct = (productId: string) => {
    const product = accountProducts.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'ไม่พบสินค้า' };
    const price = product.buyPrice || 0;

    if (user.walletBalance < price) {
      return { success: false, error: `ยอดเงินคงเหลือไม่พอ (ต้องการ ฿${price.toLocaleString()}) กรุณาเติมเงินก่อน` };
    }

    setUser((prev) => ({ ...prev, walletBalance: prev.walletBalance - price, totalSpent: (prev.totalSpent || 0) + price }));

    const orderNo = `MC-ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: StoreOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNo,
      productId: product.id,
      productTitle: product.title,
      gameName: product.gameName,
      type: 'buy',
      price,
      purchasedAt: new Date().toLocaleString('th-TH'),
      credentials: {
        username: product.credentials.username,
        password: product.credentials.password || 'Pass#2026Auto',
        twoFactorKey: product.credentials.twoFactorKey,
        emailLinked: product.credentials.notes || 'เมลสะอาด ปลดล็อคได้ 100%'
      }
    };

    setStoreOrders((prev) => [newOrder, ...prev]);

    // Record transaction
    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'purchase',
      amount: price,
      description: `ซื้อไอดี ${product.title.slice(0, 30)}...`,
      paymentMethod: 'Wallet',
      timestamp: new Date().toLocaleString('th-TH')
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Mark product as sold
    setAccountProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: 'sold' } : p)));

    return { success: true, order: newOrder };
  };

  // Renting game account from store
  const rentAccountProduct = (productId: string, hours: number) => {
    const product = accountProducts.find((p) => p.id === productId);
    if (!product) return { success: false, error: 'ไม่พบสินค้า' };
    const rate = product.rentPricePerHour || 15;
    const totalPrice = rate * hours;

    if (user.walletBalance < totalPrice) {
      return { success: false, error: `ยอดเงินไม่เพียงพอ (ต้องการ ฿${totalPrice.toLocaleString()}) กรุณาเติมเงินก่อน` };
    }

    setUser((prev) => ({ ...prev, walletBalance: prev.walletBalance - totalPrice, totalSpent: (prev.totalSpent || 0) + totalPrice }));

    const startTime = Date.now();
    const endTime = startTime + hours * 3600 * 1000;
    const rentalId = `RNT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRental: ActiveRental = {
      id: rentalId,
      productId: product.id,
      productTitle: product.title,
      gameName: product.gameName,
      imageUrl: product.imageUrl,
      durationHours: hours,
      startTime,
      endTime,
      remainingSeconds: hours * 3600,
      pricePaid: totalPrice,
      credentials: {
        username: product.credentials.username,
        password: product.credentials.password || 'RentPass#2026',
        twoFactorKey: product.credentials.twoFactorKey,
        instructions: 'ห้ามเปิดโปรแกรมช่วยเล่น, ห้ามเปลี่ยนรหัสผ่าน, เล่นเสร็จสามารถกดคืนไอดีได้ทันที'
      },
      status: 'active'
    };

    setActiveRentals((prev) => [newRental, ...prev]);

    // Order record
    const newOrder: StoreOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `MC-RNT-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productTitle: `${product.title} (เช่า ${hours} ชม.)`,
      gameName: product.gameName,
      type: 'rent',
      price: totalPrice,
      durationHours: hours,
      purchasedAt: new Date().toLocaleString('th-TH'),
      credentials: {
        username: product.credentials.username,
        password: product.credentials.password || 'RentPass#2026',
        twoFactorKey: product.credentials.twoFactorKey
      }
    };
    setStoreOrders((prev) => [newOrder, ...prev]);

    // Transaction
    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'rental',
      amount: totalPrice,
      description: `เช่าไอดี ${product.gameName} (${hours} ชม.)`,
      paymentMethod: 'Wallet',
      timestamp: new Date().toLocaleString('th-TH')
    };
    setTransactions((prev) => [newTx, ...prev]);

    return { success: true, rental: newRental };
  };

  const returnRentalEarly = (rentalId: string) => {
    setActiveRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: 'returned', remainingSeconds: 0 } : r))
    );
  };

  const topUpWallet = (amount: number, method: string) => {
    setUser((prev) => ({ ...prev, walletBalance: prev.walletBalance + amount }));
    const now = new Date();
    const newTx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'topup',
      amount,
      description: `เติมเงินผ่าน ${method}`,
      paymentMethod: method,
      timestamp: `${now.toLocaleDateString('th-TH')} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const redeemVoucher = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, error: 'กรุณากรอกโค้ด' };

    let amount = 0;
    let type = 'credit';

    if (clean === 'BOATWELCOME' || clean === 'MINICLOUD') {
      amount = 50.00;
    } else if (clean === 'VIP2025' || clean === 'VIP2026') {
      amount = 100.00;
    } else if (clean === 'FREE10') {
      amount = 10.00;
    } else if (clean === 'ROBLOX100') {
      amount = 100.00;
    } else if (clean === 'FARM24H') {
      amount = 120.00;
      type = 'afk_pass';
    } else {
      return { success: false, error: 'โค้ดไม่ถูกต้อง หรือถูกใช้งานจนครบโควตาแล้ว' };
    }

    topUpWallet(amount, `โค้ดของขวัญ [${clean}]`);
    return { success: true, amount, type };
  };

  const redeemTrueMoneyGift = (link: string) => {
    const clean = link.trim();
    if (!clean.includes('truemoney.com') && !clean.includes('gift')) {
      return { success: false, error: 'ลิงก์ซองของขวัญไม่ถูกต้อง (ต้องขึ้นต้นด้วย https://gift.truemoney.com/...)' };
    }

    const randomAmount = Math.floor(20 + Math.random() * 80);
    topUpWallet(randomAmount, 'ซองของขวัญ TrueMoney');
    return { success: true, amount: randomAmount };
  };

  const currentT = translations[language] || translations.th;

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        loginUser,
        logout,
        currentView,
        setCurrentView,
        authModalMode,
        setAuthModalMode,
        theme,
        setTheme,
        language,
        setLanguage,
        t: currentT,
        games,
        sessions,
        activeSessions,
        selectedSessionId,
        setSelectedSessionId,
        selectedSession,
        selectedGameForModal,
        setSelectedGameForModal,
        openCreateModal,
        setOpenCreateModal,
        openTopUpModal,
        setOpenTopUpModal,
        accountProducts,
        activeRentals,
        storeOrders,
        selectedProductForModal,
        setSelectedProductForModal,
        openPurchaseModal,
        setOpenPurchaseModal,
        purchaseModalMode,
        setPurchaseModalMode,
        buyAccountProduct,
        rentAccountProduct,
        returnRentalEarly,
        transactions,
        createAFKSession,
        stopAFKSession,
        pauseAFKSession,
        resumeAFKSession,
        extendAFKSession,
        executeTerminalCommand,
        updateSessionSettings,
        topUpWallet,
        redeemVoucher,
        redeemTrueMoneyGift
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

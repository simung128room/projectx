import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameProduct, GameCategory, ActiveRental, OrderItem, WalletTransaction, UserProfile } from '../types/store';
import { INITIAL_PRODUCTS } from '../data/mockData';
import Swal from 'sweetalert2';

interface StoreContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: UserProfile | null;
  products: GameProduct[];
  selectedCategory: GameCategory;
  setSelectedCategory: (cat: GameCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeRentals: ActiveRental[];
  orders: OrderItem[];
  transactions: WalletTransaction[];
  
  // Auth state & modals
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (username: string, password?: string) => Promise<boolean>;
  register: (username: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  
  // Purchase / Rent modal
  purchaseModalProduct: GameProduct | null;
  purchaseModalMode: 'buy' | 'rent';
  openPurchaseModal: (product: GameProduct, mode: 'buy' | 'rent') => void;
  closePurchaseModal: () => void;
  
  // Actions
  buyProduct: (productId: string) => Promise<boolean>;
  rentProduct: (productId: string, durationHours: number, price: number) => Promise<boolean>;
  returnRentalEarly: (rentalId: string) => void;
  topupTrueMoney: (voucherLink: string) => Promise<{ success: boolean; amount?: number; message?: string }>;
  topupPromptPay: (amount: number) => Promise<{ success: boolean; message?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'gamestore_user_session';
const LOCAL_STORAGE_KEY_RENTALS = 'gamestore_active_rentals';
const LOCAL_STORAGE_KEY_ORDERS = 'gamestore_orders';
const LOCAL_STORAGE_KEY_TXS = 'gamestore_transactions';
const LOCAL_STORAGE_KEY_THEME = 'gamestore_theme_pref';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  // User profile state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing user session', e);
      }
    }
    // Default logged-in guest user for instant seamless experience
    return {
      id: 'usr-guest-998',
      username: 'ProGamer_TH',
      email: 'gamer.thai@gmail.com',
      balance: 1500,
      points: 250,
      role: 'vip',
      avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=200&auto=format&fit=crop',
      totalSpent: 4200,
      joinedDate: '2026-07-15'
    };
  });

  // Products
  const [products, setProducts] = useState<GameProduct[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Rentals
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RENTALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed initial active rental demo
    return [
      {
        id: 'rnt-demo-01',
        productId: 'val-002',
        productTitle: 'Valorant | Immortal 3 มีด Ignis Fan + Reaver Karambit',
        gameName: 'Valorant',
        gameCategory: 'valorant',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
        durationHours: 6,
        startTime: Date.now() - 1000 * 60 * 45, // Started 45 mins ago
        endTime: Date.now() + 1000 * 60 * (6 * 60 - 45), // remaining ~5h 15m
        pricePaid: 120,
        credentials: {
          username: 'Val_Imm3_Renting',
          password: 'RentPassword#2026',
          twoFactorKey: 'RIOT-2FA-99321',
          instructions: 'ห้ามเปิดโปรแกรมช่วยเล่น, ห้ามเปลี่ยนรหัสผ่าน, เล่นเสร็จสามารถกดปุ่มคืนไอดีได้ทันที'
        },
        status: 'active'
      }
    ];
  });

  // Orders
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'ord-8831',
        orderNumber: 'NX-ORD-2026-8831',
        productId: 'rbx-001',
        productTitle: 'Roblox | Blox Fruits Max Lv.2550 + ผล Kitsune ถาวร',
        gameName: 'Roblox',
        type: 'buy',
        price: 1890,
        purchasedAt: '2026-08-30 14:22:10',
        credentials: {
          username: 'BloxGod_KitsuneV4',
          password: 'Roblox#BloxMax2026',
          emailLinked: 'เมลยังไม่ผูก (ผูกอีเมลส่วนตัวได้ทันที)'
        }
      }
    ];
  });

  // Transactions
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TXS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'tx-001',
        type: 'topup_promptpay',
        amount: 2000,
        description: 'เติมเงินผ่าน พร้อมเพย์ QR Code อัตโนมัติ',
        status: 'success',
        timestamp: '2026-08-30 14:15:00',
        referenceCode: 'PP-99382109'
      },
      {
        id: 'tx-002',
        type: 'purchase',
        amount: -1890,
        description: 'ซื้อไอดี Roblox Blox Fruits Max Kitsune',
        status: 'success',
        timestamp: '2026-08-30 14:22:10',
        referenceCode: 'NX-ORD-2026-8831'
      },
      {
        id: 'tx-003',
        type: 'topup_truemoney',
        amount: 500,
        description: 'เติมเงินผ่าน ซองของขวัญ TrueMoney Voucher',
        status: 'success',
        timestamp: '2026-09-01 19:10:45',
        referenceCode: 'TM-VOUCHER-500'
      },
      {
        id: 'tx-004',
        type: 'rental',
        amount: -120,
        description: 'เช่าไอดี Valorant Immortal 3 (6 ชม.)',
        status: 'success',
        timestamp: '2026-09-02 18:30:00',
        referenceCode: 'RNT-DEMO-01'
      }
    ];
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [purchaseModalProduct, setPurchaseModalProduct] = useState<GameProduct | null>(null);
  const [purchaseModalMode, setPurchaseModalMode] = useState<'buy' | 'rent'>('buy');

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.style.backgroundColor = '#09090b';
      document.body.style.color = '#f4f4f5';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  // Persist states
  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RENTALS, JSON.stringify(activeRentals));
  }, [activeRentals]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TXS, JSON.stringify(transactions));
  }, [transactions]);

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth actions
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (username: string, _password?: string): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      username: username || 'GameUser',
      email: `${username.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      balance: 1500,
      points: 150,
      role: 'user',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUser(newUser);
    closeAuthModal();
    return true;
  };

  const register = async (username: string, email: string, _password?: string): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      username: username || 'NewGamer',
      email: email || `${username.toLowerCase()}@gmail.com`,
      balance: 300, // Welcome bonus!
      points: 50,
      role: 'user',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUser(newUser);
    
    // Add welcome bonus tx
    const welcomeTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'refund',
      amount: 300,
      description: 'โบนัสต้อนรับสมาชิกใหม่ (Welcome Bonus)',
      status: 'success',
      timestamp: new Date().toLocaleString('th-TH'),
      referenceCode: 'BONUS-WELCOME-300'
    };
    setTransactions(prev => [welcomeTx, ...prev]);

    closeAuthModal();
    return true;
  };

  const logout = () => {
    setUser(null);
    Swal.fire({
      icon: 'success',
      title: 'ออกจากระบบเรียบร้อย',
      timer: 1500,
      showConfirmButton: false,
      background: theme === 'dark' ? '#121216' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000'
    });
  };

  // Purchase Modal
  const openPurchaseModal = (product: GameProduct, mode: 'buy' | 'rent') => {
    setPurchaseModalProduct(product);
    setPurchaseModalMode(mode);
  };

  const closePurchaseModal = () => {
    setPurchaseModalProduct(null);
  };

  // Buy Product
  const buyProduct = async (productId: string): Promise<boolean> => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return false;

    const cost = targetProduct.buyPrice || 0;

    if (!user) {
      openAuthModal('login');
      return false;
    }

    if (user.balance < cost) {
      Swal.fire({
        icon: 'error',
        title: 'ยอดเงินไม่เพียงพอ',
        text: `คุณมียอดเงิน ฿${user.balance.toLocaleString()} ต้องการ ฿${cost.toLocaleString()} กรุณาเติมเงินก่อนทำรายการ`,
        confirmButtonText: 'ไปหน้าเติมเงิน',
        confirmButtonColor: '#10b981',
        background: theme === 'dark' ? '#121216' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
      return false;
    }

    // Deduct balance
    const updatedBalance = user.balance - cost;
    setUser({
      ...user,
      balance: updatedBalance,
      totalSpent: user.totalSpent + cost,
      points: user.points + Math.floor(cost * 0.05) // 5% cashback in points
    });

    // Create Order
    const orderNo = `NX-ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNo,
      productId: targetProduct.id,
      productTitle: targetProduct.title,
      gameName: targetProduct.gameName,
      type: 'buy',
      price: cost,
      purchasedAt: new Date().toLocaleString('th-TH'),
      credentials: {
        username: targetProduct.credentials.username,
        password: targetProduct.credentials.password,
        twoFactorKey: targetProduct.credentials.twoFactorKey,
        emailLinked: targetProduct.credentials.emailStatus
      }
    };
    setOrders(prev => [newOrder, ...prev]);

    // Create Transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'purchase',
      amount: -cost,
      description: `ซื้อไอดี ${targetProduct.title.slice(0, 35)}...`,
      status: 'success',
      timestamp: new Date().toLocaleString('th-TH'),
      referenceCode: orderNo
    };
    setTransactions(prev => [newTx, ...prev]);

    // Mark product as sold
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'sold' } : p));

    return true;
  };

  // Rent Product
  const rentProduct = async (productId: string, durationHours: number, price: number): Promise<boolean> => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return false;

    if (!user) {
      openAuthModal('login');
      return false;
    }

    if (user.balance < price) {
      Swal.fire({
        icon: 'error',
        title: 'ยอดเงินไม่เพียงพอ',
        text: `คุณมียอดเงิน ฿${user.balance.toLocaleString()} ต้องการ ฿${price.toLocaleString()} กรุณาเติมเงินก่อนทำรายการ`,
        confirmButtonText: 'ไปหน้าเติมเงิน',
        confirmButtonColor: '#10b981',
        background: theme === 'dark' ? '#121216' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
      return false;
    }

    // Deduct balance
    const updatedBalance = user.balance - price;
    setUser({
      ...user,
      balance: updatedBalance,
      totalSpent: user.totalSpent + price,
      points: user.points + Math.floor(price * 0.05)
    });

    const now = Date.now();
    const endTime = now + (durationHours * 60 * 60 * 1000);
    const rentalId = `rnt-${Date.now()}`;

    // Add active rental
    const newRental: ActiveRental = {
      id: rentalId,
      productId: targetProduct.id,
      productTitle: targetProduct.title,
      gameName: targetProduct.gameName,
      gameCategory: targetProduct.game,
      imageUrl: targetProduct.imageUrl,
      durationHours,
      startTime: now,
      endTime,
      pricePaid: price,
      credentials: {
        username: targetProduct.credentials.username,
        password: targetProduct.credentials.password || 'Rent#AutoPass2026',
        twoFactorKey: targetProduct.credentials.twoFactorKey,
        instructions: 'ห้ามเปิดโปรแกรมช่วยเล่น, ห้ามเปลี่ยนรหัสผ่าน, เล่นเสร็จสามารถกดปุ่มคืนไอดีได้ทันที'
      },
      status: 'active'
    };
    setActiveRentals(prev => [newRental, ...prev]);

    // Add order record
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNumber: `NX-RNT-${Date.now().toString().slice(-6)}`,
      productId: targetProduct.id,
      productTitle: `${targetProduct.title} (เช่า ${durationHours} ชม.)`,
      gameName: targetProduct.gameName,
      type: 'rent',
      price,
      durationHours,
      purchasedAt: new Date().toLocaleString('th-TH'),
      credentials: {
        username: targetProduct.credentials.username,
        password: targetProduct.credentials.password || 'Rent#AutoPass2026',
        twoFactorKey: targetProduct.credentials.twoFactorKey
      }
    };
    setOrders(prev => [newOrder, ...prev]);

    // Add transaction
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'rental',
      amount: -price,
      description: `เช่าไอดี ${targetProduct.gameName} (${durationHours} ชั่วโมง)`,
      status: 'success',
      timestamp: new Date().toLocaleString('th-TH'),
      referenceCode: rentalId
    };
    setTransactions(prev => [newTx, ...prev]);

    return true;
  };

  // Return Rental Early
  const returnRentalEarly = (rentalId: string) => {
    setActiveRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status: 'returned' } : r));
    Swal.fire({
      icon: 'success',
      title: 'คืนไอดีสำเร็จ',
      text: 'ระบบได้ทำการส่งมอบไอดีคืนระบบเรียบร้อย ขอบคุณที่ใช้บริการเช่าไอดี!',
      timer: 2000,
      showConfirmButton: false,
      background: theme === 'dark' ? '#121216' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000'
    });
  };

  // Topup TrueMoney
  const topupTrueMoney = async (voucherLink: string): Promise<{ success: boolean; amount?: number; message?: string }> => {
    if (!voucherLink || !voucherLink.includes('gift.truemoney.com')) {
      return { success: false, message: 'ลิงก์ซองของขวัญไม่ถูกต้อง (ต้องขึ้นต้นด้วย gift.truemoney.com)' };
    }

    // Simulate voucher extraction and network validation
    await new Promise(r => setTimeout(r, 1200));

    // Calculate simulated voucher amount
    const simulatedAmount = 100 + Math.floor(Math.random() * 4) * 100; // 100, 200, 300, 400

    if (user) {
      setUser({
        ...user,
        balance: user.balance + simulatedAmount
      });
    }

    const txId = `TM-${Date.now().toString().slice(-8)}`;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'topup_truemoney',
      amount: simulatedAmount,
      description: `เติมเงินซองของขวัญ TrueMoney Voucher (฿${simulatedAmount})`,
      status: 'success',
      timestamp: new Date().toLocaleString('th-TH'),
      referenceCode: txId
    };
    setTransactions(prev => [newTx, ...prev]);

    return { success: true, amount: simulatedAmount };
  };

  // Topup PromptPay
  const topupPromptPay = async (amount: number): Promise<{ success: boolean; message?: string }> => {
    if (amount <= 0) return { success: false, message: 'จำนวนเงินต้องมากกว่า 0 บาท' };

    await new Promise(r => setTimeout(r, 1500));

    if (user) {
      setUser({
        ...user,
        balance: user.balance + amount
      });
    }

    const txId = `PP-${Date.now().toString().slice(-8)}`;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'topup_promptpay',
      amount,
      description: `เติมเงินผ่าน พร้อมเพย์ QR Code (฿${amount})`,
      status: 'success',
      timestamp: new Date().toLocaleString('th-TH'),
      referenceCode: txId
    };
    setTransactions(prev => [newTx, ...prev]);

    return { success: true };
  };

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        products,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeRentals,
        orders,
        transactions,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        purchaseModalProduct,
        purchaseModalMode,
        openPurchaseModal,
        closePurchaseModal,
        buyProduct,
        rentProduct,
        returnRentalEarly,
        topupTrueMoney,
        topupPromptPay
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

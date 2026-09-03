export type GameCategory = 
  | 'all'
  | 'valorant'
  | 'roblox'
  | 'genshin'
  | 'rov'
  | 'steam'
  | 'freefire'
  | 'honkai'
  | 'fconline';

export type ProductStatus = 'available' | 'reserved' | 'sold' | 'renting';

export type ProductType = 'buy' | 'rent' | 'both';

export interface GameRentalOption {
  durationHours: number;
  label: string;
  price: number;
}

export interface GameProduct {
  id: string;
  title: string;
  game: GameCategory;
  gameName: string;
  rank?: string;
  rankColor?: string;
  level?: number | string;
  skinsCount?: number;
  featuredItems: string[];
  description: string;
  imageUrl: string;
  gallery?: string[];
  productType: ProductType;
  buyPrice?: number;
  originalBuyPrice?: number;
  rentalOptions?: GameRentalOption[];
  status: ProductStatus;
  isHot?: boolean;
  isVerified?: boolean;
  credentials: {
    username: string;
    password?: string;
    emailStatus: string;
    additionalInfo?: string;
    twoFactorKey?: string;
  };
  createdAt: string;
}

export interface ActiveRental {
  id: string;
  productId: string;
  productTitle: string;
  gameName: string;
  gameCategory: GameCategory;
  imageUrl: string;
  durationHours: number;
  startTime: number; // timestamp
  endTime: number;   // timestamp
  pricePaid: number;
  credentials: {
    username: string;
    password: string;
    twoFactorKey?: string;
    instructions?: string;
  };
  status: 'active' | 'returned' | 'expired';
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  gameName: string;
  type: 'buy' | 'rent';
  price: number;
  durationHours?: number;
  purchasedAt: string;
  credentials: {
    username: string;
    password?: string;
    twoFactorKey?: string;
    emailLinked?: string;
  };
}

export interface WalletTransaction {
  id: string;
  type: 'topup_truemoney' | 'topup_promptpay' | 'purchase' | 'rental' | 'refund';
  amount: number;
  description: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  referenceCode?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  points: number;
  role: 'user' | 'vip' | 'admin';
  avatarUrl: string;
  totalSpent: number;
  joinedDate: string;
}

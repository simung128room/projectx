declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLMarqueeElement> & { scrollamount?: string }, HTMLMarqueeElement>;
    }
  }
}

export interface AccountResult {
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
  hasRov?: boolean;
  rovCharacter?: string;
  rovClean?: boolean;
  phoneBound: boolean;
  emailVerified: boolean;
  fbLinked: boolean;
  region: string;
  otherGames: string[];
  codmNickname?: string;
  codmUid?: string;
  codmOpenId?: string;
  codmTOpenId?: string;
  codmRegion?: string;
  codmRegionName?: string;
  codmRegionFlag?: string;
  idCardBound?: boolean;
  avatarUrl?: string;
  mobileNumber?: string;
  emailAddress?: string;
  fbUsername?: string;
  twoFaEnabled?: boolean;
  authenticatorEnabled?: boolean;
  lastLoginDate?: string;
  lastLoginIp?: string;
  lastLoginCountry?: string;
  lastLoginSource?: string;
}

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  iconName: string;
  colorClass: string;
}

export interface UserPlan {
  username: string;
  fullName?: string;
  balance?: number;
  role?: string;
  rank?: 'user' | 'basic' | 'premium';
  isPremium: boolean;
  premiumExpireDate: string | null;
  registeredAt?: string;
}

export interface Category {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  bannerUrl: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  soldCount?: number;
  imageUrl: string;
  stock: number;
  category?: string;
  isPopular?: boolean;
  tag?: string;
  stockData?: string[];
  _version?: number;
}

export interface SiteStats {
  users: number;
  stock: number;
  sales: number;
  topups: number;
  totalOrders?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  image?: string;
  text?: string;
  fileUrl?: string;
  type: 'free' | 'premium';
}

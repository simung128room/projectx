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
  phoneBound: boolean;
  emailVerified: boolean;
  fbLinked: boolean;
  region: string;
  otherGames: string[];
  codmNickname?: string;
  idCardBound?: boolean;
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
  isPremium: boolean;
  premiumExpireDate: string | null;
  registeredAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
  isPopular?: boolean;
}

export interface SiteStats {
  users: number;
  stock: number;
  sales: number;
}

export interface ContentItem {
  id: string;
  title: string;
  image?: string;
  text?: string;
  fileUrl?: string;
  type: 'free' | 'premium';
}

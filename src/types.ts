declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLMarqueeElement> & { scrollamount?: string }, HTMLMarqueeElement>;
    }
  }
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
  isPreOrder?: boolean;
  preOrderOptions?: string[];
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

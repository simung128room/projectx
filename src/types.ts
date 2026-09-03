export type SessionStatus = 'running' | 'paused' | 'completed' | 'stopped' | 'failed';

export interface Game {
  id: string;
  name: string;
  mapName: string;
  category: 'Roblox' | 'Gacha' | 'MMORPG' | 'FPS' | 'Sandbox';
  description: string;
  pricePerHour: number;
  status: 'available' | 'maintenance' | 'busy';
  thumbnail: string;
  features: string[];
}

export interface SessionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'cmd';
  message: string;
}

export interface Session {
  id: string;
  gameId: string;
  gameName: string;
  mapName: string;
  robloxUsername: string;
  status: SessionStatus;
  startedAt: string;
  endsAt: string;
  durationHours: number;
  remainingSeconds: number;
  totalSeconds: number;
  price: number;
  itemsCollected: number;
  pingMs: number;
  memoryMb: number;
  workerName: string;
  workerId: string;
  autoReconnect: boolean;
  antiAfkJump: boolean;
  webhookUrl?: string;
  logs: SessionLog[];
}

export interface Transaction {
  id: string;
  type: 'topup' | 'afk_charge' | 'rental' | 'purchase' | 'refund';
  amount: number;
  description: string;
  paymentMethod: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  walletBalance: number;
  isVip: boolean;
  avatarUrl?: string;
  joinedDate?: string;
  totalSpent?: number;
  rank?: 'Free Member' | 'VIP Member' | 'Cloud Elite';
}

// Marketplace & ID Rental Types from Original System
export interface GameAccountProduct {
  id: string;
  title: string;
  gameName: string;
  gameCategory: 'roblox' | 'valorant' | 'genshin' | 'rov' | 'steam';
  description: string;
  imageUrl: string;
  buyPrice?: number;
  rentPricePerHour?: number;
  availableForRent: boolean;
  availableForBuy: boolean;
  isPopular?: boolean;
  tag?: string;
  features: string[];
  stockCount: number;
  status: 'available' | 'sold' | 'rented';
  credentials: {
    username: string;
    password?: string;
    twoFactorKey?: string;
    emailStatus: 'clean_unlinked' | 'linked_changeable' | 'safe_rental';
    notes?: string;
  };
}

export interface ActiveRental {
  id: string;
  productId: string;
  productTitle: string;
  gameName: string;
  imageUrl: string;
  durationHours: number;
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  pricePaid: number;
  credentials: {
    username: string;
    password?: string;
    twoFactorKey?: string;
    instructions: string;
  };
  status: 'active' | 'completed' | 'returned';
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  gameName: string;
  type: 'buy' | 'rent';
  price: number;
  purchasedAt: string;
  durationHours?: number;
  credentials: {
    username: string;
    password?: string;
    twoFactorKey?: string;
    emailLinked?: string;
  };
}

// Backward compatibility types
export type Product = GameAccountProduct;
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  count?: number;
}
export interface SiteStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRentals: number;
}
export type UserPlan = 'free' | 'vip' | 'elite';

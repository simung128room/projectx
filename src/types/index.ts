export type SessionStatus = 'running' | 'paused' | 'completed' | 'stopped' | 'failed';

export interface Game {
  id: string;
  name: string;
  mapName: string;
  category: string;
  description: string;
  pricePerHour: number;
  status: 'available' | 'maintenance';
  thumbnail?: string;
  features?: string[];
  bannerUrl?: string;
  recommendedDuration?: number;
}

export interface SessionLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'cmd';
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
  autoReconnect?: boolean;
  antiAfkJump?: boolean;
  webhookUrl?: string;
  logs: SessionLog[];
}

export interface Transaction {
  id: string;
  type: 'topup' | 'afk_charge' | 'refund';
  amount: number;
  description: string;
  paymentMethod?: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  walletBalance: number;
  isVip?: boolean;
  role?: string;
}

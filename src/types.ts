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
  isPremium: boolean;
  premiumExpireDate: string | null;
}

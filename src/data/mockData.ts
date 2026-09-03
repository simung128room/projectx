import { GameProduct, GameCategory } from '../types/store';

export interface CategoryMetadata {
  id: GameCategory;
  name: string;
  iconName: string;
  badge: string;
  bannerUrl: string;
  popularSearch: string;
}

export const CATEGORIES: CategoryMetadata[] = [
  {
    id: 'all',
    name: 'ทั้งหมด (All Games)',
    iconName: 'Gamepad2',
    badge: 'Popular',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'ไอดีเกมทุกประเภท'
  },
  {
    id: 'valorant',
    name: 'Valorant',
    iconName: 'Crosshair',
    badge: 'Hot Deals',
    bannerUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'Kuronami, Champions, Reaver'
  },
  {
    id: 'roblox',
    name: 'Roblox / Blox Fruits',
    iconName: 'Box',
    badge: 'Top Sell',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'Kitsune, Dragon, Max Level'
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    iconName: 'Sparkles',
    badge: 'AR60+',
    bannerUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'Raiden Shogun C6, Furina, Arlecchino'
  },
  {
    id: 'rov',
    name: 'RoV (Arena of Valor)',
    iconName: 'Swords',
    badge: 'Glorious',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'Supreme, Dimension Breaker'
  },
  {
    id: 'steam',
    name: 'Steam & CS2',
    iconName: 'Flame',
    badge: 'Prime',
    bannerUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'CS2 Prime, Butterfly Knife, GTA V'
  },
  {
    id: 'freefire',
    name: 'Free Fire',
    iconName: 'ShieldAlert',
    badge: 'Grandmaster',
    bannerUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'ชุดซากุระ, กางเกงเหลือง, สกินปืน Evo'
  },
  {
    id: 'honkai',
    name: 'Honkai: Star Rail',
    iconName: 'Orbit',
    badge: 'E6S5',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'Acheron E6, Firefly, Ruan Mei'
  },
  {
    id: 'fconline',
    name: 'FC Online 4',
    iconName: 'Trophy',
    badge: 'Team Value 10T+',
    bannerUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    popularSearch: 'ICON The Moment, Gullit +8, R9'
  }
];

export const INITIAL_PRODUCTS: GameProduct[] = [
  {
    id: 'val-001',
    title: 'Valorant | Radiant #340 Vandal Kuronami + Champions 2023/2024 มีดครบ',
    game: 'valorant',
    gameName: 'Valorant',
    rank: 'Radiant',
    rankColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    level: 218,
    skinsCount: 64,
    featuredItems: ['Kuronami Vandal', 'Champions 2023 Karambit', 'Reaver 2.0 Knife', 'Prime Phantom', 'Magepunk 3.0'],
    description: 'ไอดีหลักสะอาด ไม่เคยโดนแบน เมลแท้เปลี่ยนได้ 100% สกินพรีเมียมอัปเกรดเอฟเฟกต์ตันทุกกระบอก มีดทอง Champions หายาก',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 3850,
    originalBuyPrice: 4800,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 35 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 90 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 160 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 280 },
      { durationHours: 24, label: '24 ชั่วโมง (1 วัน)', price: 490 },
      { durationHours: 72, label: '3 วัน (สุดคุ้ม)', price: 1200 }
    ],
    status: 'available',
    isHot: true,
    isVerified: true,
    credentials: {
      username: 'ValoProRadiant99',
      password: 'NX_ValPass_#8899',
      emailStatus: 'เมลเปลี่ยนได้ทันที (First Email Verified)',
      additionalInfo: 'สามารถเปลี่ยนรหัสและอีเมลในระบบ Riot ได้เลยทันทีหลังซื้อ',
      twoFactorKey: 'RIOT-2FA-NX88721'
    },
    createdAt: '2026-08-28'
  },
  {
    id: 'val-002',
    title: 'Valorant | Immortal 3 มีด Ignis Fan + Reaver Karambit สกินปืน 42 ชิ้น',
    game: 'valorant',
    gameName: 'Valorant',
    rank: 'Immortal 3',
    rankColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    level: 165,
    skinsCount: 42,
    featuredItems: ['Ignis Fan', 'Reaver Karambit', 'Glitchpop Vandal', 'Ion Phantom', 'Sovereign Ghost'],
    description: 'ไอดีพร้อมลงแข่งแรงค์สูง MMR แน่น สกินปืนยอดฮิตครบ เสียงเอฟเฟกต์สะใจ',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 2450,
    originalBuyPrice: 3100,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 25 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 65 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 120 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 210 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 360 }
    ],
    status: 'available',
    isHot: false,
    isVerified: true,
    credentials: {
      username: 'ImmortalKing_TH',
      password: 'Val_Imm3_#SecurePass',
      emailStatus: 'เมลสะอาด เปลี่ยนได้ 100%',
      additionalInfo: 'ไม่มีประวัติ Toxic / AFK แรงค์พร้อมลุยทันที'
    },
    createdAt: '2026-08-30'
  },
  {
    id: 'rbx-001',
    title: 'Roblox | Blox Fruits Max Lv.2550 + ผล Kitsune ถาวร + หมัด Godhuman + CDK V2',
    game: 'roblox',
    gameName: 'Roblox',
    rank: 'Max Level 2550',
    rankColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    level: '2550 (Max)',
    skinsCount: 18,
    featuredItems: ['Permanent Kitsune', 'Godhuman Mastery 600', 'Cursed Dual Katana V2', 'Soul Guitar', 'Race V4 Full Gear'],
    description: 'ไอดีบล็อกฟรุตฟูลออปชั่น เผ่า V4 ตื่นครบทุกเฟือง ผลจิ้งจอกถาวร บิลด์ PVP โหดขั้นสุด เงินในเกม 80M+ แฟรกเมนต์ 150k+',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 1890,
    originalBuyPrice: 2400,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 20 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 50 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 95 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 160 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 290 }
    ],
    status: 'available',
    isHot: true,
    isVerified: true,
    credentials: {
      username: 'BloxGod_KitsuneV4',
      password: 'Roblox#BloxMax2026',
      emailStatus: 'เมลไม่ผูก (Unverified Email - ปลอดภัยสูงสุด)',
      additionalInfo: 'สามารถผูกอีเมลและเบอร์โทรศัพท์ของคุณเองได้ทันที'
    },
    createdAt: '2026-09-01'
  },
  {
    id: 'gen-001',
    title: 'Genshin Impact | AR60 เซิร์ฟ Asia ไรเดน C6R5 + ฟูริน่า C2R1 + อาร์เลคคิโน C1R1',
    game: 'genshin',
    gameName: 'Genshin Impact',
    rank: 'AR 60 (End-Game)',
    rankColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    level: 'AR 60',
    skinsCount: 35,
    featuredItems: ['Raiden Shogun C6 + Engulfing R5', 'Furina C2', 'Arlecchino C1', 'Kazuha C2', 'Mora 45,000,000'],
    description: 'ไอดีเทพเอเชีย 5 ดาวครบครัน อาร์ติแฟกต์ CV 45+ ทุกตัว ลุย Spiral Abyss 12-3 สบายๆ ไม่เคยใช้โปรแกรมช่วยเล่น 100%',
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 4200,
    originalBuyPrice: 5500,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 40 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 100 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 180 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 320 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 550 }
    ],
    status: 'available',
    isHot: true,
    isVerified: true,
    credentials: {
      username: 'genshin_raiden_c6',
      password: 'Hoyoverse_Genshin_#2026',
      emailStatus: 'ยกเลิกผูกเบอร์แล้ว สามารถเปลี่ยนเมลได้ทันที'
    },
    createdAt: '2026-08-25'
  },
  {
    id: 'rov-001',
    title: 'RoV | แรงค์ Supreme Glorious สกิน Supreme Violet + Tulen Dimension Breaker',
    game: 'rov',
    gameName: 'RoV (Arena of Valor)',
    rank: 'Supreme Glorious',
    rankColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    level: 30,
    skinsCount: 180,
    featuredItems: ['Tulen Dimension Breaker', 'Violet First Love Supreme', 'Raz Muay Thai', 'Florentino Ultraman', 'Rune 90 Lv.3 ครบ'],
    description: 'ไอดีการีนาสะอาด รูนตัน 90 ครบทุกสาย สกินลิมิเต็ดระดับ Supreme เพียบ วินเรต 68%+',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 1950,
    originalBuyPrice: 2600,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 20 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 50 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 90 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 160 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 280 }
    ],
    status: 'available',
    isHot: false,
    isVerified: true,
    credentials: {
      username: 'rov_supreme_master',
      password: 'GarenaROV_#99011',
      emailStatus: 'เบอร์เปลี่ยนได้ เมลเปลี่ยนได้ 100%'
    },
    createdAt: '2026-09-02'
  },
  {
    id: 'stm-001',
    title: 'Steam CS2 | Prime Account + มีด Butterfly Doppler Phase 2 + ถุงมือ Vice Gloves',
    game: 'steam',
    gameName: 'Steam & CS2',
    rank: 'CS2 Premier 18,500',
    rankColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    level: 'Steam Lv.55',
    skinsCount: 28,
    featuredItems: ['Butterfly Knife Doppler P2', 'Sport Gloves Vice', 'AK-47 Bloodsport FN', 'M4A1-S Printstream'],
    description: 'ไอดีสตรีมแท้ เหรียญ 10 ปี CS เหรียญ Loyalty Badge พ่วงเกม GTA V, RDR2, Cyberpunk 2077 สตรีมวอลเล็ตติดไว้ 150฿',
    imageUrl: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 6500,
    originalBuyPrice: 7900,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 50 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 130 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 240 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 420 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 750 }
    ],
    status: 'available',
    isHot: true,
    isVerified: true,
    credentials: {
      username: 'cs2_prime_doppler',
      password: 'SteamCS2_#Doppler2026',
      emailStatus: 'Steam Guard พร้อมโอนรหัสและเมลต้นฉบับ',
      twoFactorKey: 'STEAM-SG-88231'
    },
    createdAt: '2026-08-20'
  },
  {
    id: 'hsr-001',
    title: 'Honkai: Star Rail | Acheron E6S5 + Firefly E2S1 + Ruan Mei E1 ไอดีสมบูรณ์แบบ',
    game: 'honkai',
    gameName: 'Honkai: Star Rail',
    rank: 'Trailblaze 70',
    rankColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    level: 'Trailblaze Lv.70',
    skinsCount: 22,
    featuredItems: ['Acheron E6 + Signature LC S5', 'Firefly E2S1', 'Ruan Mei E1', 'Sparkle E0S1', 'Stellar Jade 12,000+'],
    description: 'ทีมเบรกและทีมดูดพลังสายดาร์กดาเมจหลักสิบล้าน เคลียร์ MoC 12 และ Pure Fiction ออโต้ผ่านเต็ม 3 ดาวทุกรอบ',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 3490,
    originalBuyPrice: 4200,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 30 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 80 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 150 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 260 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 450 }
    ],
    status: 'available',
    isHot: false,
    isVerified: true,
    credentials: {
      username: 'hsr_acheron_e6s5',
      password: 'Hoyoverse_HSR_#Acheron99',
      emailStatus: 'เมลสะอาด เปลี่ยนได้ทันที'
    },
    createdAt: '2026-08-29'
  },
  {
    id: 'fco-001',
    title: 'FC Online 4 | มูลค่าทีม 25T ฟูลทีม เรอัล มาดริด Gullit ICON TM + R9 + Zidane',
    game: 'fconline',
    gameName: 'FC Online 4',
    rank: 'Super Champions',
    rankColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    level: 'Lv. 100',
    skinsCount: 11,
    featuredItems: ['R. Gullit ICON The Moment +5', 'Ronaldo R9 LN +8', 'Z. Zidane ICON TM +5', 'C. Ronaldo BTB +8', 'BP สดในคลัง 800B'],
    description: 'ทีมพร้อมไต่ระดับสูงสุด มีการ์ดนักเตะลิมิเต็ดและสเตตัส 130+ ทุกตำแหน่ง สไตล์การเล่นลื่นไหล',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    productType: 'both',
    buyPrice: 2800,
    originalBuyPrice: 3500,
    rentalOptions: [
      { durationHours: 1, label: '1 ชั่วโมง', price: 25 },
      { durationHours: 3, label: '3 ชั่วโมง', price: 70 },
      { durationHours: 6, label: '6 ชั่วโมง', price: 130 },
      { durationHours: 12, label: '12 ชั่วโมง', price: 230 },
      { durationHours: 24, label: '24 ชั่วโมง', price: 400 }
    ],
    status: 'available',
    isHot: false,
    isVerified: true,
    credentials: {
      username: 'fco4_gullit_tm',
      password: 'FCOnline_#25T_Team',
      emailStatus: 'การีนาแท้ เปลี่ยนเบอร์และเมลได้ 100%'
    },
    createdAt: '2026-09-01'
  }
];

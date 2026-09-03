import { GameAccountProduct } from '../types';

export const INITIAL_ACCOUNT_PRODUCTS: GameAccountProduct[] = [
  {
    id: 'prod-rbx-01',
    title: 'Blox Fruits | Max Lv.2550 + เผ่า V4 ฟูลเกียร์ + ผลคิทสึเนะถาวร (Kitsune Perm)',
    gameName: 'Roblox Blox Fruits',
    gameCategory: 'roblox',
    description: 'ไอดีพร้อมเล่น เลเวลตัน 2550 สกิลครบ ดาบคู่ Cursed Dual Katana + กีตาร์ Soul Guitar + เผ่ามิ้งค์ V4 ปลดครบทุกเทียร์',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    buyPrice: 1590,
    rentPricePerHour: 15,
    availableForBuy: true,
    availableForRent: true,
    isPopular: true,
    tag: 'ยอดนิยม 🔥',
    features: ['Max Level 2550', 'Kitsune Perm (ถาวร)', 'Mink V4 Full Gear', 'CDK + Soul Guitar', 'เมลสะอาด เปลี่ยนได้ 100%'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'SiamKitsune_God',
      password: 'CloudPass#Blox2026',
      twoFactorKey: 'RBX-2FA-99201',
      emailStatus: 'clean_unlinked',
      notes: 'ไอดีสะอาด ไม่เคยใช้โปรแกรมช่วยเล่น สามารถเปลี่ยนรหัสผ่านและผูกเมลส่วนตัวได้ทันที'
    }
  },
  {
    id: 'prod-val-01',
    title: 'Valorant | Immortal 3 มีด Ignis Fan + Reaver Karambit + Prime Vandal',
    gameName: 'Valorant',
    gameCategory: 'valorant',
    description: 'แรงก์ Immortal 3 MMR สูง ยิงนิ่ง สกินสวย มีดพัดทองคำ พร้อมสกินปืนอัปเกรดเอฟเฟกต์ครบทุกกระบอก',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    buyPrice: 3200,
    rentPricePerHour: 20,
    availableForBuy: true,
    availableForRent: true,
    isPopular: true,
    tag: 'แรงก์สูง 💎',
    features: ['Rank: Immortal 3 (Peak Radiant)', 'Ignis Fan Melee', 'Reaver Karambit', 'Prime / Vandal Spectrum', 'เซิร์ฟเวอร์ไทย (TH)'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'Val_Immortal3_TH',
      password: 'Riot#ValGod2026',
      twoFactorKey: 'RIOT-2FA-88192',
      emailStatus: 'clean_unlinked',
      notes: 'สำหรับผู้เช่า: ห้ามเปิดโปรแกรมช่วยเล่นหรือ Toxics ในเกมเด็ดขาด ระบบมีตรวจจับอัตโนมัติ'
    }
  },
  {
    id: 'prod-fisch-01',
    title: 'Fisch | เบ็ด Destiny Rod + เงิน 5,000,000C + ปลา Mythic / Secret ครบเซ็ต',
    gameName: 'Roblox Fisch',
    gameCategory: 'roblox',
    description: 'ไอดีสายตกปลาเทพ เบ็ดแรร์ครบทุกคัน เงินเหรียญล้น ตกปลาได้ทุกระดับพร้อมเรือ Speedboat และแท่นบูชาครบ',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    buyPrice: 890,
    rentPricePerHour: 10,
    availableForBuy: true,
    availableForRent: true,
    isPopular: false,
    tag: 'สายชิลล์ 🎣',
    features: ['Destiny Rod Enchanted', '5,000,000+ C Coins', 'All Secret Fish Unlocked', 'Fast Speedboat', 'เมลสะอาด'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'KingFisher_Siam',
      password: 'Fisch#ProMaster26',
      twoFactorKey: 'RBX-2FA-11029',
      emailStatus: 'clean_unlinked',
      notes: 'เหมาะสำหรับนำไปฟาร์มต่อหรือปล่อยรันผ่านระบบ Cloud AFK'
    }
  },
  {
    id: 'prod-genshin-01',
    title: 'Genshin Impact | AR60 30x 5★ C6 Furina + C2 Raiden + Signature Weapons',
    gameName: 'Genshin Impact',
    gameCategory: 'genshin',
    description: 'ไอดีจบแดนดิ่ง AR60 ฟูริน่า C6 R1 อาวุธประจำตัวครบ ดาเมจล้น แผนที่เคลียร์ 100% สไปรัลอบิส 36 ดาวสบายๆ',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    buyPrice: 4500,
    rentPricePerHour: 25,
    availableForBuy: true,
    availableForRent: true,
    isPopular: true,
    tag: 'ฟูลออฟ 👑',
    features: ['AR60 Asia Server', 'C6 Furina + Splendor R1', 'C2 Raiden Shogun + EL R1', 'C1 Hu Tao + Homa R1', 'Abyss 36★ Auto Win'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'Genshin_FurinaC6',
      password: 'Hoyo#ImpactMax2026',
      twoFactorKey: 'HOYO-2FA-33441',
      emailStatus: 'clean_unlinked',
      notes: 'ปลอดภัย 100% ประวัติการเติมเงินครบถ้วน ส่งมอบพร้อมอีเมลต้นทาง'
    }
  },
  {
    id: 'prod-ps99-01',
    title: 'Pet Simulator 99 | 15x Titanic Pets + 100x Huge Pets + Tech World Max',
    gameName: 'Roblox Pet Sim 99',
    gameCategory: 'roblox',
    description: 'ไอดีฟาร์มเพชรและเหรียญสูงสุด มีสัตว์เลี้ยงยักษ์ Titanic และ Huge มากกว่า 100 ตัว พลังทำลายกว้างขวาง ปล่อยบอทได้เงินล้านต่อคืน',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    buyPrice: 1990,
    rentPricePerHour: 12,
    availableForBuy: true,
    availableForRent: true,
    isPopular: false,
    tag: 'ฟาร์มรวย 🐾',
    features: ['15x Titanic Pets', '100+ Huge Pets (Rainbow/Shiny)', 'Max Rebirth & Area 199', 'Enchant Books Tier IX', 'Auto Farm Ready'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'PetSimGod_Titanic',
      password: 'PS99#CloudMega2026',
      twoFactorKey: 'RBX-2FA-77291',
      emailStatus: 'clean_unlinked',
      notes: 'สามารถเชื่อมต่อเข้ากับระบบ MINICLOUD เพื่อเริ่มฟาร์มเพชรทันที'
    }
  },
  {
    id: 'prod-rov-01',
    title: 'RoV | Supreme 50★ สกิน Dimension Breaker ครบ 4 ตัว (Tel, Violet, Nakroth, Lauriel)',
    gameName: 'RoV Arena of Valor',
    gameCategory: 'rov',
    description: 'แรงก์ Supreme 50 ดาว คลังสกินอนิเมะ Dimension Breaker ครบชุด พร้อมสกิน Legend / Ultimate มากกว่า 450 สกิน',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    buyPrice: 2890,
    rentPricePerHour: 18,
    availableForBuy: true,
    availableForRent: true,
    isPopular: false,
    tag: 'สกินแรร์ 🏆',
    features: ['Supreme 50 Stars', '4x Dimension Breaker Skins', '450+ Total Skins', 'Rune Lv.90 ทุกสาย', 'Garena ID สะอาด'],
    stockCount: 1,
    status: 'available',
    credentials: {
      username: 'RoV_DimensionLord',
      password: 'Garena#RovGod2026',
      twoFactorKey: 'GAR-2FA-44910',
      emailStatus: 'clean_unlinked',
      notes: 'การีน่าสะอาด ไม่ติดเบอร์ ไม่ติดบัตรประชาชน'
    }
  }
];

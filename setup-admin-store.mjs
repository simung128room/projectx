import fs from 'fs';

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
  `import { AccountResult } from '../types';`,
  `import { AccountResult, Product, SiteStats } from '../types';\nimport { ShoppingCart, Package, Users } from 'lucide-react';`
);

content = content.replace(
  `  adminTab: 'overview' | 'keys' | 'history' | 'ips';\n  setAdminTab: (tab: 'overview' | 'keys' | 'history' | 'ips') => void;`,
  `  adminTab: string;\n  setAdminTab: (tab: string) => void;\n  products?: Product[];\n  setProducts?: (products: Product[]) => void;\n  siteStats?: SiteStats;\n  setSiteStats?: (stats: SiteStats) => void;`
);

content = content.replace(
  `  deleteKey,\n  unblockIP\n}) => {`,
  `  deleteKey,\n  unblockIP,\n  products = [],\n  setProducts,\n  siteStats = { users: 0, stock: 0, sales: 0 },\n  setSiteStats\n}) => {`
);

const tabsReplacement = `            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { id: 'overview', label: 'ภาพรวมระบบ', icon: BarChart3 },
                { id: 'store', label: 'จัดการร้านค้า', icon: ShoppingCart },
                { id: 'keys', label: 'จัดการคีย์', icon: Key },
                { id: 'history', label: 'ประวัติคีย์', icon: History },
                { id: 'ips', label: 'บล็อค IP', icon: Ban },
              ]`;

content = content.replace(
  /            \<div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide"\>\n              \{\[\n                \{ id: 'overview', label: 'ภาพรวมระบบ', icon: BarChart3 \},\n                \{ id: 'keys', label: 'จัดการคีย์', icon: Key \},\n                \{ id: 'history', label: 'ประวัติคีย์', icon: History \},\n                \{ id: 'ips', label: 'บล็อค IP', icon: Ban \},\n              \]/g,
  tabsReplacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);

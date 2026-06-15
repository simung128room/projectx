import { Category } from "./types";

/**
 * Strips technical UUID codes from product names or formats them beautifully.
 * E.g., Scd0be989-a2ef-4e5f-903a-97e097bbe4bb becomes "ไอดีพรีเมียม ROV Game #SCD0BE989"
 */
export function formatProductName(name: string): string {
  if (!name) return "สินค้าพรีเมียม";
  const cleanName = name.trim();
  // Match standard UUID or UUID with a single leading character (like S/s)
  const uuidRegex = /^[a-zA-Z]?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (uuidRegex.test(cleanName)) {
    const match = cleanName.match(/^([a-zA-Z]?)([0-9a-fA-F]{8})/);
    const prefix = match ? match[1] : "";
    const shortCode = match ? match[2] : cleanName.split("-")[0];
    return `ไอดีพรีเมียม ROV Game #${(prefix + shortCode).toUpperCase()}`;
  }
  return cleanName;
}

/**
 * Generates a unique, elegant dark gradient color scheme from a string input.
 */
export function generateGradient(inputStr: string): string {
  if (!inputStr) return "linear-gradient(135deg, #09090b 0%, #18181b 100%)";
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    hash = inputStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 20%, 8%) 0%, hsl(${hue2}, 25%, 4%) 100%)`;
}

/**
 * Cleans and transforms raw category data objects from API or storage to type Category.
 */
export function sanitizeCategories(categories: any[]): Category[] {
  if (!Array.isArray(categories)) return [];
  return categories
    .filter(c => c && (c.id || c.name || c.title))
    .map(c => ({
      id: String(c.id || c.name || Math.random().toString(36).substring(2, 11)),
      name: String(c.name || c.title || "general"),
      title: String(c.title || c.name || "ทั่วไป"),
      subtitle: String(c.subtitle || c.description || ""),
      bannerUrl: String(c.bannerUrl || c.banner_url || "https://img2.pic.in.th/IMG_7177176d5344301b32a1.png"),
      imageUrl: String(c.imageUrl || c.image_url || c.bannerUrl || "https://img2.pic.in.th/IMG_7177176d5344301b32a1.png")
    }));
}

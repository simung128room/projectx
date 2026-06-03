export const cleanCategoryField = (val: any): string => {
  if (typeof val === 'string' && val.trim().startsWith('{') && val.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(val);
      return parsed.t || parsed.title || parsed.n || parsed.name || val;
    } catch (e) {}
  }
  return val;
};

export const sanitizeCategories = (categories: any[]) => {
  return categories.map(cat => ({
    ...cat,
    title: cleanCategoryField(cat.title),
    name: cleanCategoryField(cat.name),
  }));
};

export const generateGradient = (seed: string): string => {
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };
  const intToRGB = (i: number) => {
    const c = (i & 0x00FFFFFF).toString(16).toUpperCase();
    return "00000".substring(0, 6 - c.length) + c;
  };
  
  const hash1 = hashCode(seed);
  const hash2 = hashCode(seed + "salt");
  const color1 = `#${intToRGB(hash1)}`;
  const color2 = `#${intToRGB(hash2)}`;
  
  return `linear-gradient(45deg, ${color1}, ${color2})`;
};


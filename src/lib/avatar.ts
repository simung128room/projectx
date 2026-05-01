export const ANIMATED_AVATARS = [
  'https://img2.pic.in.th/IMG_6128bbad22e0dfcfc428.jpeg',
  'https://img2.pic.in.th/IMG_612748e6014158159a61.jpeg',
  'https://img1.pic.in.th/images/IMG_6126c13fd1426319d6c6.jpeg',
  'https://img1.pic.in.th/images/IMG_6125.jpeg',
  'https://img2.pic.in.th/IMG_61247d1002e7a803974c.jpeg'
];

export function getAvatarUrl(seed: string) {
  if (!seed) return ANIMATED_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % ANIMATED_AVATARS.length;
  return ANIMATED_AVATARS[index];
}

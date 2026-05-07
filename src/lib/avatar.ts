export const ANIMATED_AVATARS = [
  'https://img1.pic.in.th/images/IMG_63218c044649cb4ee095.jpeg',
  'https://img2.pic.in.th/IMG_6322.jpeg',
  'https://img2.pic.in.th/IMG_6323.jpeg',
  'https://img1.pic.in.th/images/IMG_6324.jpeg',
  'https://img1.pic.in.th/images/IMG_6325.jpeg'
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

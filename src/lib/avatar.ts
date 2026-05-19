export const ANIMATED_AVATARS = [
  'https://s.imgz.io/2026/05/19/IMG_6675e5deac3eabebbd12.jpeg',
  'https://s.imgz.io/2026/05/19/IMG_6677723bedbed1f3f659.jpeg',
  'https://s.imgz.io/2026/05/19/IMG_667634c017684418573b.jpeg',
  'https://s.imgz.io/2026/05/19/IMG_667842ea8c862646193b.jpeg',
  'https://s.imgz.io/2026/05/19/IMG_6679b09c7e069e25d550.jpeg'
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

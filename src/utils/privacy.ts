// ============================================================================
// OUROBET PRO - PRIVACY ENGINE & PSEUDONYM / MASKED AVATAR GENERATOR
// ============================================================================

// High-tech stylized anonymous gamer / casino privacy avatars (SVG Data URIs)
// Replaces all real human photos with anonymous gaming silhouettes & emblems
export const MASKED_AVATARS = [
  // 1. Stealth Ninja / Shadow Operative (Gold & Dark)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="%230f172a"/><circle cx="50" cy="50" r="42" fill="%231e293b" stroke="%23f59e0b" stroke-width="2"/><path d="M30 45 Q50 30 70 45 Q75 60 70 75 Q50 85 30 75 Z" fill="url(%23g1)"/><rect x="35" y="48" width="30" height="6" rx="3" fill="%230f172a"/><circle cx="42" cy="51" r="2" fill="%23fef08a"/><circle cx="58" cy="51" r="2" fill="%23fef08a"/></svg>`,

  // 2. Cyber Shield (Emerald & Slate)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="%2306151e"/><circle cx="50" cy="50" r="42" fill="%230b2938" stroke="%2310b981" stroke-width="2"/><polygon points="50,22 75,35 75,65 50,82 25,65 25,35" fill="url(%23g2)"/><polygon points="50,30 68,40 68,62 50,74 32,62 32,40" fill="%2306151e"/><circle cx="50" cy="50" r="8" fill="%2334d399"/></svg>`,

  // 3. Aviator Pilot Helmet (Crimson & Rose)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f43f5e"/><stop offset="100%" stop-color="%239f1239"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="%23160a12"/><circle cx="50" cy="50" r="42" fill="%2326121f" stroke="%23f43f5e" stroke-width="2"/><circle cx="50" cy="48" r="26" fill="url(%23g3)"/><path d="M30 46 C32 40 45 38 50 38 C55 38 68 40 70 46 C70 54 62 58 50 58 C38 58 30 54 30 46 Z" fill="%230f172a" stroke="%2338bdf8" stroke-width="2.5"/><path d="M42 46 C45 44 48 44 50 44 C52 44 55 44 58 46" stroke="%23fef08a" stroke-width="1.5"/></svg>`,

  // 4. Anonymous VIP Crown (Electric Cyan & Blue)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="%23081024"/><circle cx="50" cy="50" r="42" fill="%230f1f42" stroke="%2306b6d4" stroke-width="2"/><path d="M25 65 L32 35 L45 48 L50 28 L55 48 L68 35 L75 65 Z" fill="url(%23g4)"/><rect x="25" y="67" width="50" height="6" rx="3" fill="%2338bdf8"/><circle cx="32" cy="35" r="3" fill="%23a5f3fc"/><circle cx="50" cy="28" r="3.5" fill="%23a5f3fc"/><circle cx="68" cy="35" r="3" fill="%23a5f3fc"/></svg>`,

  // 5. High Roller Dice Operative (Purple & Magenta)
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23a855f7"/><stop offset="100%" stop-color="%236b21a8"/></linearGradient></defs><rect width="100" height="100" rx="30" fill="%23180826"/><circle cx="50" cy="50" r="42" fill="%2327113e" stroke="%23a855f7" stroke-width="2"/><rect x="30" y="30" width="40" height="40" rx="10" fill="url(%23g5)"/><circle cx="40" cy="40" r="3.5" fill="%23ffffff"/><circle cx="60" cy="40" r="3.5" fill="%23ffffff"/><circle cx="50" cy="50" r="3.5" fill="%23ffffff"/><circle cx="40" cy="60" r="3.5" fill="%23ffffff"/><circle cx="60" cy="60" r="3.5" fill="%23ffffff"/></svg>`,
];

// Helper to get an anonymous masked avatar based on user ID or seed
export function getMaskedAvatar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MASKED_AVATARS.length;
  return MASKED_AVATARS[index];
}

// Pseudonym Generator / Masker
const GAMER_PSEUDONYMS = [
  'Apostador',
  'Tigre',
  'Leão',
  'Águia',
  'Falcão',
  'Fênix',
  'Pantera',
  'Lobo',
  'Mestre',
  'Sombra',
  'Cobra',
  'Faraó',
  'Relâmpago',
  'Predador',
  'Vortex',
];

export function maskPlayerName(name: string, isCurrentUser: boolean = false): string {
  if (isCurrentUser) {
    return 'Você (Apostador VIP)';
  }

  // If already a pseudonym format like "Tigre***48", keep it
  if (name.includes('***')) {
    return name;
  }

  // Derive stable pseudonym based on name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const prefix = GAMER_PSEUDONYMS[absHash % GAMER_PSEUDONYMS.length];
  const suffix = (absHash % 900 + 100).toString().slice(0, 2); // 2-3 digits

  return `${prefix}***${suffix}`;
}

export const LEVELS = [
  { gap: 0.2, planks: 1 },
  { gap: 0.38, planks: 1 },
  { gap: 0.76, planks: 2 },
  { gap: 0.7, planks: 2 },
  { gap: 0.78, planks: 2 },
];

const n = parseInt(new URLSearchParams(window.location.search).get('level') || '1', 10);
const safe = isNaN(n) ? 1 : n;
export const LEVEL_INDEX = Math.min(Math.max(safe, 1), LEVELS.length);
export const LV = LEVELS[LEVEL_INDEX - 1];
export const HAS_NEXT = LEVEL_INDEX < LEVELS.length;

export function nextLevelUrl(): string {
  const q = new URLSearchParams(window.location.search);
  q.set('level', String(LEVEL_INDEX + 1));
  return window.location.pathname + '?' + q.toString();
}

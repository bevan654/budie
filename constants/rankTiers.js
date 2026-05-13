// XP-based rank tiers. Mirrors the placeholder formerly inlined in HomeScreen
// and SwipeCard so both surfaces resolve to the same tier for the same XP.
export const RANK_TIERS = [
  { emoji: '🌱', name: 'Junior',       min: 0,        max: 2000 },
  { emoji: '📚', name: 'Senior',       min: 2001,     max: 10000 },
  { emoji: '🎓', name: 'Scholar',      min: 10001,    max: 30000 },
  { emoji: '🧠', name: 'Professor',    min: 30001,    max: 80000 },
  { emoji: '⚔️',  name: 'Master',       min: 80001,    max: 200000 },
  { emoji: '👑', name: 'Grand Master', min: 200001,   max: 500000 },
  { emoji: '🧙', name: 'Wizard',       min: 500001,   max: Infinity },
];

export function getRankFromXp(xp) {
  const n = Number(xp) || 0;
  return RANK_TIERS.find((t) => n >= t.min && n <= t.max) || RANK_TIERS[0];
}

export function tierProgress(rank, xp) {
  const n = Number(xp) || 0;
  const max = isFinite(rank.max) ? rank.max : rank.min + 100_000;
  return Math.max(0, Math.min(1, (n - rank.min) / (max - rank.min || 1)));
}

export function formatXp(xp) {
  const n = Number(xp) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

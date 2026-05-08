export const TIERS = {
  COLD: {
    key: 'cold',
    name: 'Cold',
    minHours: 10 / 60, // 10 min
    color: '#34D399', // green-blue
    glow: '#34D399',
    description: '10 min average',
  },
  COOL: {
    key: 'cool',
    name: 'Cool',
    minHours: 1,
    color: '#06B6D4', // cyan blue
    glow: '#06B6D4',
    description: '1 hr average',
  },
  WARM: {
    key: 'warm',
    name: 'Warm',
    minHours: 2,
    color: '#F97316', // orange
    glow: '#F97316',
    description: '2 hr average',
  },
  HOT: {
    key: 'hot',
    name: 'Hot',
    minHours: 4,
    color: '#DC143C', // crimson red
    glow: '#DC143C',
    description: '4 hr average',
  },
  INFERNO: {
    key: 'inferno',
    name: 'Inferno',
    minHours: 6,
    color: '#C026D3', // purple-red
    glow: '#DB2777',
    description: '6 hr average',
  },
};

const TIER_ORDER = [TIERS.INFERNO, TIERS.HOT, TIERS.WARM, TIERS.COOL, TIERS.COLD];

export function getTier(avgHours) {
  for (const t of TIER_ORDER) if (avgHours >= t.minHours) return t;
  return null;
}

export const MAX_FREEZES = 2;

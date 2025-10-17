import { Badge } from './types';

export const ALL_BADGES: Badge[] = [
  {
    type: 'first_report',
    name: 'First Steps',
    description: 'Submit your first pollution report',
    icon: '🌊'
  },
  {
    type: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Submit 10 pollution reports',
    icon: '🛡️'
  },
  {
    type: 'cleanup_hero',
    name: 'Cleanup Hero',
    description: 'Complete your first cleanup mission',
    icon: '🦸'
  },
  {
    type: 'accuracy_expert',
    name: 'Accuracy Expert',
    description: '10 reports verified by community',
    icon: '🎯'
  },
  {
    type: 'mission_complete',
    name: 'Mission Master',
    description: 'Complete 5 cleanup missions',
    icon: '⭐'
  },
  {
    type: 'streak_master',
    name: 'Streak Master',
    description: 'Report pollution for 7 days in a row',
    icon: '🔥'
  }
];

export function calculateLevel(points: number): number {
  if (points < 100) return 1;
  if (points < 250) return 2;
  if (points < 500) return 3;
  if (points < 1000) return 4;
  if (points < 2000) return 5;
  if (points < 5000) return 6;
  if (points < 10000) return 7;
  return 8 + Math.floor((points - 10000) / 5000);
}

export function getPointsForNextLevel(currentLevel: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  if (currentLevel < thresholds.length) {
    return thresholds[currentLevel];
  }
  return 10000 + (currentLevel - 7) * 5000;
}

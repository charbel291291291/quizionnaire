// src/gameConfig.ts

export const XP_PER_DIFFICULTY: Record<string, number> = {
  easy: 5,
  medium: 10,
  hard: 20,
};

export const STREAK_BONUS_XP = 2; // extra XP per streak step after 3
export const CORRECT_ANSWER_XP = 2; // base XP for every correct answer

export function calculateXpGain(opts: {
  difficulty: string;
  isCorrect: boolean;
  currentStreak: number;
}): number {
  if (!opts.isCorrect) return 0;

  const base = XP_PER_DIFFICULTY[opts.difficulty] ?? XP_PER_DIFFICULTY.easy;
  const streakBonus =
    opts.currentStreak >= 3 ? (opts.currentStreak - 2) * STREAK_BONUS_XP : 0;

  return base + CORRECT_ANSWER_XP + streakBonus;
}

export function levelFromXp(totalXp: number): number {
  // Simple curve: every 100 XP = +1 level (change curve if you want)
  return Math.max(1, Math.floor(totalXp / 100) + 1);
}

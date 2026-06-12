import type { DailyLog, ReadinessLevel } from "@/lib/types";

const TARGET_SLEEP_HOURS = 8;

/**
 * MVP 版レディネススコア (0〜100)。
 * 主観 (回復・気分・疲労の逆数) と睡眠時間の達成度から算出する簡易版。
 *
 * 注: 要件定義書の「Optimize Score」(Training_Load, Travel_Stress, Sleep_Metrics,
 * HRV_Trend の関数) および HRV 7日移動平均/変動係数(CV) は、トレーニング負荷・
 * HRV 履歴の蓄積後に拡張する。本関数はその出発点。
 */
export function computeReadiness(log: DailyLog | undefined): {
  score: number | null;
  level: ReadinessLevel;
} {
  if (!log) return { score: null, level: "yellow" };

  const parts: number[] = []; // 各 0〜100

  if (log.subjectiveRecovery) parts.push((log.subjectiveRecovery / 5) * 100);
  if (log.mood) parts.push((log.mood / 5) * 100);
  if (log.subjectiveFatigue) parts.push(((6 - log.subjectiveFatigue) / 5) * 100); // 疲労は逆数
  if (typeof log.sleepHours === "number") {
    parts.push(Math.min(log.sleepHours / TARGET_SLEEP_HOURS, 1) * 100);
  }

  if (parts.length === 0) return { score: null, level: "yellow" };

  const score = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  return { score, level: levelFromScore(score) };
}

export function levelFromScore(score: number): ReadinessLevel {
  if (score >= 70) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

export const LEVEL_LABEL: Record<ReadinessLevel, string> = {
  green: "良好",
  yellow: "注意",
  red: "要休息",
};

/** Tailwind の背景クラス (信号色) */
export const LEVEL_BG: Record<ReadinessLevel, string> = {
  green: "bg-green-600",
  yellow: "bg-amber-500",
  red: "bg-red-600",
};

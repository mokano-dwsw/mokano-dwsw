import type { DailyLog } from "@/lib/types";

// ---------------------------------------------------------------------------
// 統計ユーティリティ
// ---------------------------------------------------------------------------
export function mean(xs: number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stddev(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/** 変動係数 CV = σ/μ × 100 */
export function coefficientOfVariation(xs: number[]): number {
  const m = mean(xs);
  if (!isFinite(m) || m === 0) return NaN;
  return (stddev(xs) / m) * 100;
}

// ---------------------------------------------------------------------------
// HRV トレンド (7日移動平均 + 変動係数)
//   要件: 日々の値は背景の薄い棒、7日移動平均を太い折れ線でオーバーレイ。
//   CV の低下はオーバートレーニングの初期兆候 → 色で警告する。
// ---------------------------------------------------------------------------
export interface HrvPoint {
  date: string;
  hrv?: number;
  rolling7?: number;
}

/** 日付昇順のログから HRV 系列 (日次値 + 7日移動平均) を作る */
export function hrvSeries(logsAsc: DailyLog[]): HrvPoint[] {
  return logsAsc.map((log, i) => {
    const window = logsAsc
      .slice(Math.max(0, i - 6), i + 1)
      .map((l) => l.hrv)
      .filter((v): v is number => typeof v === "number");
    return {
      date: log.logDate,
      hrv: log.hrv,
      rolling7: window.length ? mean(window) : undefined,
    };
  });
}

/** 直近7日の HRV 変動係数。低下しているほど疲労蓄積の兆候。 */
export function recentHrvCV(logsAsc: DailyLog[]): number {
  const vals = logsAsc
    .slice(-7)
    .map((l) => l.hrv)
    .filter((v): v is number => typeof v === "number");
  return coefficientOfVariation(vals);
}

// ---------------------------------------------------------------------------
// 睡眠スコア (0〜100) — MVP 簡易版
//   総睡眠時間 (目標8h) / 深い睡眠 (目標15〜20%) / レム (目標20〜25%) / 効率
// ---------------------------------------------------------------------------
export function sleepScore(log: DailyLog): number | null {
  const parts: number[] = [];
  if (typeof log.sleepHours === "number") {
    parts.push(Math.min(log.sleepHours / 8, 1) * 100);
  }
  if (typeof log.sleepDeepPct === "number") {
    parts.push(scoreAroundTarget(log.sleepDeepPct, 15, 20));
  }
  if (typeof log.sleepRemPct === "number") {
    parts.push(scoreAroundTarget(log.sleepRemPct, 20, 25));
  }
  if (typeof log.sleepEfficiencyPct === "number") {
    parts.push(Math.min(log.sleepEfficiencyPct / 90, 1) * 100);
  }
  if (parts.length === 0) return null;
  return Math.round(mean(parts));
}

/** 目標レンジ [lo, hi] の中なら 100、外れるほど減点 */
function scoreAroundTarget(value: number, lo: number, hi: number): number {
  if (value >= lo && value <= hi) return 100;
  const dist = value < lo ? lo - value : value - hi;
  return Math.max(0, 100 - dist * 8);
}

/** 日付昇順に整列したコピーを返す */
export function sortByDateAsc(logs: DailyLog[]): DailyLog[] {
  return [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));
}

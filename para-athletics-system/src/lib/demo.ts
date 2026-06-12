import { db, type DailyLogRecord } from "@/lib/db/offline";
import type { Scale5 } from "@/lib/types";

/**
 * ダッシュボード確認用のデモデータ (約30日分) をローカル(Dexie)に生成する。
 * Supabase へは送らないよう syncStatus を 'synced' にしておく。
 */
export async function seedDemoData(athleteId: string, days = 30): Promise<number> {
  const records: DailyLogRecord[] = [];
  const today = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const iso = date.toISOString().slice(0, 10);

    // ゆるやかな変動 + ノイズで現実的な系列を作る
    const wave = Math.sin(d / 4);
    const hrv = Math.round(62 + wave * 8 + (Math.random() - 0.5) * 10);
    const sleep = +(7.2 + wave * 0.6 + (Math.random() - 0.5) * 0.8).toFixed(1);
    const recovery = clamp5(3 + Math.round(wave + (Math.random() - 0.5)));

    records.push({
      id: `demo-${iso}`,
      athleteId,
      logDate: iso,
      weightKg: +(58 + (Math.random() - 0.5)).toFixed(1),
      bodyFatPct: +(12 + (Math.random() - 0.5)).toFixed(1),
      sleepHours: sleep,
      sleepDeepPct: Math.round(16 + (Math.random() - 0.5) * 6),
      sleepRemPct: Math.round(22 + (Math.random() - 0.5) * 6),
      sleepEfficiencyPct: Math.round(88 + (Math.random() - 0.5) * 8),
      restingHr: Math.round(48 + (Math.random() - 0.5) * 6),
      hrv,
      subjectiveRecovery: recovery,
      subjectiveFatigue: clamp5(6 - recovery),
      mood: recovery,
      updatedAt: date.toISOString(),
      syncStatus: "synced",
    });
  }

  await db.dailyLogs.bulkPut(records);
  return records.length;
}

function clamp5(n: number): Scale5 {
  return Math.min(5, Math.max(1, n)) as Scale5;
}

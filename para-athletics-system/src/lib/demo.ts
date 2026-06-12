import {
  db,
  type DailyLogRecord,
  type ScheduleEventRecord,
  type TrainingLogRecord,
} from "@/lib/db/offline";
import type { Scale5 } from "@/lib/types";

function isoDaysAgo(base: Date, daysAgo: number): string {
  const d = new Date(base);
  d.setDate(base.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/**
 * ダッシュボード確認用のデモデータ (約30日分) をローカル(Dexie)に生成する。
 * 「長距離移動の翌日に HRV が低下する」傾向が読み取れるよう作為的に山谷を入れる。
 * Supabase へは送らないよう syncStatus を 'synced' にしておく。
 */
export async function seedDemoData(athleteId: string, days = 30): Promise<number> {
  const today = new Date();

  // 移動・試合の予定 (○日前)
  const travelDaysAgo = [18, 9];
  const competitionDaysAgo = [8];
  const travelDates = new Set(travelDaysAgo.map((d) => isoDaysAgo(today, d)));

  const logs: DailyLogRecord[] = [];
  const trainings: TrainingLogRecord[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const iso = isoDaysAgo(today, d);
    const prevWasTravel = travelDates.has(isoDaysAgo(today, d + 1));
    const isTravelDay = travelDates.has(iso);

    const wave = Math.sin(d / 4);
    let hrv = 62 + wave * 8 + (Math.random() - 0.5) * 8;
    let recovery = 3 + Math.round(wave + (Math.random() - 0.5));
    let sleep = 7.2 + wave * 0.6 + (Math.random() - 0.5) * 0.7;

    // 移動の翌日は回復が落ちる
    if (prevWasTravel) {
      hrv -= 12;
      recovery -= 1;
      sleep -= 0.8;
    }

    logs.push({
      id: `demo-${iso}`,
      athleteId,
      logDate: iso,
      weightKg: +(58 + (Math.random() - 0.5)).toFixed(1),
      bodyFatPct: +(12 + (Math.random() - 0.5)).toFixed(1),
      sleepHours: +sleep.toFixed(1),
      sleepDeepPct: Math.round(16 + (Math.random() - 0.5) * 6),
      sleepRemPct: Math.round(22 + (Math.random() - 0.5) * 6),
      sleepEfficiencyPct: Math.round(88 + (Math.random() - 0.5) * 8),
      restingHr: Math.round(48 + (Math.random() - 0.5) * 6),
      hrv: Math.round(hrv),
      subjectiveRecovery: clamp5(recovery),
      subjectiveFatigue: clamp5(6 - recovery),
      mood: clamp5(recovery),
      updatedAt: isoToNoon(iso),
      syncStatus: "synced",
    });

    // 移動日は休養。それ以外は隔日で練習を入れる (時間×RPE が負荷)
    if (!isTravelDay && d % 2 === 0) {
      const rpe = clamp(5 + Math.round(wave + (Math.random() - 0.5) * 2), 3, 9);
      trainings.push({
        id: `demo-tr-${iso}`,
        athleteId,
        logDate: iso,
        menu: rpe >= 7 ? "スプリント 150m×6" : "リカバリージョグ + 可動域",
        distanceM: rpe >= 7 ? 900 : 4000,
        durationMin: rpe >= 7 ? 75 : 50,
        reps: rpe >= 7 ? 6 : undefined,
        rpe,
        updatedAt: isoToNoon(iso),
        syncStatus: "synced",
      });
    }
  }

  const events: ScheduleEventRecord[] = [
    ...travelDaysAgo.map<ScheduleEventRecord>((d, i) => ({
      id: `demo-travel-${d}`,
      athleteId,
      eventDate: isoDaysAgo(today, d),
      type: "travel",
      title: i === 0 ? "東京 → 大阪（新幹線）" : "羽田 → 福岡（空路）",
      transport: i === 0 ? "新幹線のぞみ" : "JAL",
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
    })),
    ...competitionDaysAgo.map<ScheduleEventRecord>((d) => ({
      id: `demo-comp-${d}`,
      athleteId,
      eventDate: isoDaysAgo(today, d),
      type: "competition",
      title: "記録会",
      updatedAt: new Date().toISOString(),
      syncStatus: "synced",
    })),
  ];

  await db.dailyLogs.bulkPut(logs);
  await db.scheduleEvents.bulkPut(events);
  await db.trainingLogs.bulkPut(trainings);
  return logs.length;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function isoToNoon(iso: string): string {
  return new Date(`${iso}T12:00:00`).toISOString();
}

function clamp5(n: number): Scale5 {
  return Math.min(5, Math.max(1, n)) as Scale5;
}

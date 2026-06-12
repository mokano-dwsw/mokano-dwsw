import { createClient } from "@/lib/supabase/client";
import { db, type DailyLogRecord } from "@/lib/db/offline";
import type { DailyLog } from "@/lib/types";

/** Dexie レコード -> Supabase 行 (snake_case) */
function toRow(d: DailyLogRecord) {
  return {
    id: d.id,
    athlete_id: d.athleteId,
    log_date: d.logDate,
    weight_kg: d.weightKg ?? null,
    body_fat_pct: d.bodyFatPct ?? null,
    sleep_hours: d.sleepHours ?? null,
    sleep_deep_pct: d.sleepDeepPct ?? null,
    sleep_rem_pct: d.sleepRemPct ?? null,
    sleep_efficiency_pct: d.sleepEfficiencyPct ?? null,
    resting_hr: d.restingHr ?? null,
    hrv: d.hrv ?? null,
    subjective_recovery: d.subjectiveRecovery ?? null,
    subjective_fatigue: d.subjectiveFatigue ?? null,
    mood: d.mood ?? null,
    notes: d.notes ?? null,
    updated_at: d.updatedAt,
  };
}

/** Supabase 行 -> DailyLog (camelCase) */
function fromRow(r: Record<string, unknown>): DailyLog {
  const num = (v: unknown) => (v == null ? undefined : Number(v));
  const scale = (v: unknown) => (v == null ? undefined : (Number(v) as DailyLog["mood"]));
  return {
    id: r.id as string,
    athleteId: r.athlete_id as string,
    logDate: r.log_date as string,
    weightKg: num(r.weight_kg),
    bodyFatPct: num(r.body_fat_pct),
    sleepHours: num(r.sleep_hours),
    sleepDeepPct: num(r.sleep_deep_pct),
    sleepRemPct: num(r.sleep_rem_pct),
    sleepEfficiencyPct: num(r.sleep_efficiency_pct),
    restingHr: num(r.resting_hr),
    hrv: num(r.hrv),
    subjectiveRecovery: scale(r.subjective_recovery),
    subjectiveFatigue: scale(r.subjective_fatigue),
    mood: scale(r.mood),
    notes: (r.notes as string) ?? undefined,
    updatedAt: r.updated_at as string,
  };
}

export interface SyncResult {
  pushed: number;
  pulled: number;
}

/**
 * オフラインで蓄積したデイリーログ (pending) を Supabase へ push し、
 * サーバ側の最新を pull してローカルへ反映する。
 * Supabase 未設定 / オフライン時はエラーを投げる。
 */
export async function syncDailyLogs(athleteId: string): Promise<SyncResult> {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase が未設定です (.env.local を確認してください)");
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("オフラインのため同期できません");
  }

  const pending = await db.dailyLogs
    .where("syncStatus")
    .equals("pending")
    .filter((d) => d.athleteId === athleteId)
    .toArray();

  if (pending.length > 0) {
    const { error } = await supabase
      .from("daily_logs")
      .upsert(pending.map(toRow), { onConflict: "athlete_id,log_date" });
    if (error) throw new Error(`同期に失敗しました: ${error.message}`);
    await db.dailyLogs.bulkPut(pending.map((d) => ({ ...d, syncStatus: "synced" as const })));
  }

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("athlete_id", athleteId);
  if (error) throw new Error(`取得に失敗しました: ${error.message}`);
  const rows = (data ?? []).map(fromRow);
  await db.dailyLogs.bulkPut(rows.map((d) => ({ ...d, syncStatus: "synced" as const })));

  return { pushed: pending.length, pulled: rows.length };
}

import Dexie, { type Table } from "dexie";
import type { DailyLog, ScheduleEvent } from "@/lib/types";

export type SyncStatus = "pending" | "synced";

/** オフライン保存用のデイリーログ (同期状態を付与) */
export interface DailyLogRecord extends DailyLog {
  syncStatus: SyncStatus;
}

/** オフライン保存用のスケジュール (同期状態を付与) */
export interface ScheduleEventRecord extends ScheduleEvent {
  syncStatus: SyncStatus;
}

/**
 * 端末ローカル (IndexedDB) のオフライン DB。
 * 現場/移動中ではここを唯一の作業ストアとして扱い、オンライン時に Supabase へ同期する。
 */
class ParaAthleticsDB extends Dexie {
  dailyLogs!: Table<DailyLogRecord, string>;
  scheduleEvents!: Table<ScheduleEventRecord, string>;

  constructor() {
    super("para-athletics");
    this.version(1).stores({
      // [athleteId+logDate] で 1日1件を一意管理
      dailyLogs: "id, &[athleteId+logDate], athleteId, logDate, syncStatus, updatedAt",
    });
    this.version(2).stores({
      scheduleEvents: "id, athleteId, eventDate, type, syncStatus, updatedAt",
    });
  }
}

export const db = new ParaAthleticsDB();

/** 指定日のログを取得 (なければ undefined) */
export function getDailyLog(athleteId: string, logDate: string) {
  return db.dailyLogs.where({ athleteId, logDate }).first();
}

/** その日のログを保存し、同期待ち (pending) としてマークする (1日1件 upsert) */
export async function saveDailyLogLocal(
  input: Omit<DailyLog, "id" | "updatedAt">
): Promise<DailyLogRecord> {
  const existing = await getDailyLog(input.athleteId, input.logDate);
  const record: DailyLogRecord = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    syncStatus: "pending",
  };
  await db.dailyLogs.put(record);
  return record;
}

/** スケジュールを保存し、同期待ち (pending) としてマークする */
export async function saveScheduleEventLocal(
  input: Omit<ScheduleEvent, "id" | "updatedAt"> & { id?: string }
): Promise<ScheduleEventRecord> {
  const record: ScheduleEventRecord = {
    ...input,
    id: input.id ?? crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    syncStatus: "pending",
  };
  await db.scheduleEvents.put(record);
  return record;
}

export function deleteScheduleEventLocal(id: string): Promise<void> {
  return db.scheduleEvents.delete(id);
}

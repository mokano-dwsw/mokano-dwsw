"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveDailyLogLocal } from "@/lib/db/offline";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { syncDailyLogs } from "@/lib/sync/dailyLogs";
import { computeReadiness, LEVEL_LABEL, LEVEL_BG } from "@/lib/readiness";
import { DEMO_ATHLETE_ID, todayISO } from "@/lib/athlete";
import type { Scale5 } from "@/lib/types";

const FACES: Record<Scale5, string> = { 1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };
const SCALE: Scale5[] = [1, 2, 3, 4, 5];

/** 5段階のスマイリー入力 (認知負荷を下げるため数値タイピングを排除) */
function FaceScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Scale5;
  onChange: (v: Scale5) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-base font-medium">{label}</legend>
      <div className="flex gap-2">
        {SCALE.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={value === s}
            aria-label={`${label} ${s}`}
            onClick={() => onChange(s)}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl transition ${
              value === s ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500" : "border-gray-200"
            }`}
          >
            {FACES[s]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function DailyCheckin() {
  const athleteId = DEMO_ATHLETE_ID;
  const date = todayISO();
  const todayLog = useLiveQuery(() => db.dailyLogs.where({ athleteId, logDate: date }).first(), [
    athleteId,
    date,
  ]);

  const [recovery, setRecovery] = useState<Scale5>();
  const [mood, setMood] = useState<Scale5>();
  const [fatigue, setFatigue] = useState<Scale5>();
  const [sleepHours, setSleepHours] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // 既存ログが読み込まれたら一度だけフォームへ反映 (レンダー中に前回値を調整する React 推奨パターン)
  const [loadedId, setLoadedId] = useState<string>();
  if (todayLog && todayLog.id !== loadedId) {
    setLoadedId(todayLog.id);
    setRecovery(todayLog.subjectiveRecovery);
    setMood(todayLog.mood);
    setFatigue(todayLog.subjectiveFatigue);
    setSleepHours(todayLog.sleepHours?.toString() ?? "");
    setWeightKg(todayLog.weightKg?.toString() ?? "");
  }

  const readiness = computeReadiness({
    id: "",
    athleteId,
    logDate: date,
    subjectiveRecovery: recovery,
    mood,
    subjectiveFatigue: fatigue,
    sleepHours: sleepHours ? Number(sleepHours) : undefined,
    updatedAt: "",
  });

  async function handleSave() {
    await saveDailyLogLocal({
      athleteId,
      logDate: date,
      subjectiveRecovery: recovery,
      mood,
      subjectiveFatigue: fatigue,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
    });
    setMessage("今日のチェックインを保存しました");
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const r = await syncDailyLogs(athleteId);
      setMessage(`同期完了: 送信 ${r.pushed} 件 / 取得 ${r.pulled} 件`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* レディネス・カード (信号色で一目で把握) */}
      <div className={`rounded-3xl p-6 text-white ${LEVEL_BG[readiness.level]}`}>
        <p className="text-sm opacity-90">今日のコンディション</p>
        <p className="text-4xl font-bold">
          {readiness.score === null ? "—" : readiness.score}
          <span className="ml-2 text-xl font-medium">/ 100</span>
        </p>
        <p className="mt-1 text-lg font-medium">{LEVEL_LABEL[readiness.level]}</p>
      </div>

      <FaceScale label="体の回復ぐあい" value={recovery} onChange={setRecovery} />
      <FaceScale label="今日の気分" value={mood} onChange={setMood} />
      <FaceScale label="疲れぐあい（強いほど右）" value={fatigue} onChange={setFatigue} />

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-base font-medium">
          睡眠時間 (時間)
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            className="rounded-xl border px-3 py-2 text-lg"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-base font-medium">
          体重 (kg)
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            className="rounded-xl border px-3 py-2 text-lg"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </label>
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-2xl bg-blue-700 py-4 text-lg font-bold text-white hover:bg-blue-800"
      >
        保存する
      </button>

      <div className="flex flex-wrap items-center gap-3 border-t pt-4 text-sm text-gray-600">
        <button
          onClick={handleSync}
          disabled={syncing || !isSupabaseConfigured}
          className="rounded-lg border px-4 py-2 disabled:opacity-50"
          title={isSupabaseConfigured ? "" : "Supabase 未設定 (.env.local)"}
        >
          {syncing ? "同期中…" : "クラウドへ同期"}
        </button>
        <span>
          状態: {todayLog?.syncStatus === "synced" ? "同期済" : "未同期 (オフライン保存)"}
          {!isSupabaseConfigured && " / Supabase 未設定"}
        </span>
        {message && <span className="text-blue-700">{message}</span>}
      </div>
    </div>
  );
}

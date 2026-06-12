"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveTrainingLogLocal, deleteTrainingLogLocal } from "@/lib/db/offline";
import { DEMO_ATHLETE_ID, todayISO } from "@/lib/athlete";
import { sessionLoad } from "@/lib/metrics";

export default function TrainingManager() {
  const athleteId = DEMO_ATHLETE_ID;
  const logs = useLiveQuery(
    () => db.trainingLogs.where("athleteId").equals(athleteId).reverse().sortBy("logDate"),
    [athleteId]
  );

  const [logDate, setLogDate] = useState(todayISO());
  const [menu, setMenu] = useState("");
  const [distanceM, setDistanceM] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [reps, setReps] = useState("");
  const [result, setResult] = useState("");
  const [rpe, setRpe] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!menu.trim()) return;
    await saveTrainingLogLocal({
      athleteId,
      logDate,
      menu: menu.trim(),
      distanceM: distanceM ? Number(distanceM) : undefined,
      durationMin: durationMin ? Number(durationMin) : undefined,
      reps: reps ? Number(reps) : undefined,
      result: result.trim() || undefined,
      rpe: rpe ? Number(rpe) : undefined,
    });
    setMenu("");
    setDistanceM("");
    setDurationMin("");
    setReps("");
    setResult("");
    setRpe("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          日付
          <input
            type="date"
            className="rounded border px-2 py-1.5"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          メニュー
          <input
            className="rounded border px-2 py-1.5"
            placeholder="例: 150m×6 / ウェイト"
            value={menu}
            onChange={(e) => setMenu(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          距離 (m)
          <input
            type="number"
            inputMode="decimal"
            className="rounded border px-2 py-1.5"
            value={distanceM}
            onChange={(e) => setDistanceM(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          時間 (分)
          <input
            type="number"
            inputMode="decimal"
            className="rounded border px-2 py-1.5"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          本数
          <input
            type="number"
            inputMode="numeric"
            className="rounded border px-2 py-1.5"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          RPE (1〜10)
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            className="rounded border px-2 py-1.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          記録・備考
          <input
            className="rounded border px-2 py-1.5"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">
            記録を追加
          </button>
        </div>
      </form>

      <ul className="divide-y">
        {(logs ?? []).map((t) => (
          <li key={t.id} className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="font-medium">{t.menu}</p>
              <p className="text-xs text-gray-500">
                {t.logDate}
                {t.distanceM ? ` · ${t.distanceM}m` : ""}
                {t.durationMin ? ` · ${t.durationMin}分` : ""}
                {t.reps ? ` · ${t.reps}本` : ""}
                {t.rpe ? ` · RPE${t.rpe}` : ""}
                {sessionLoad(t) ? ` · 負荷 ${sessionLoad(t)}` : ""}
                {t.syncStatus === "pending" ? " · 未同期" : ""}
              </p>
            </div>
            <button
              onClick={() => deleteTrainingLogLocal(t.id)}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
        {logs && logs.length === 0 && (
          <li className="py-6 text-center text-gray-500">記録がまだありません。</li>
        )}
      </ul>
    </div>
  );
}

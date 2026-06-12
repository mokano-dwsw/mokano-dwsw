"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveScheduleEventLocal, deleteScheduleEventLocal } from "@/lib/db/offline";
import { DEMO_ATHLETE_ID, todayISO } from "@/lib/athlete";
import { SCHEDULE_META, type ScheduleType } from "@/lib/types";

const TYPES = Object.keys(SCHEDULE_META) as ScheduleType[];

export default function ScheduleManager() {
  const athleteId = DEMO_ATHLETE_ID;
  const events = useLiveQuery(
    () =>
      db.scheduleEvents
        .where("athleteId")
        .equals(athleteId)
        .reverse()
        .sortBy("eventDate"),
    [athleteId]
  );

  const [eventDate, setEventDate] = useState(todayISO());
  const [type, setType] = useState<ScheduleType>("travel");
  const [title, setTitle] = useState("");
  const [transport, setTransport] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await saveScheduleEventLocal({
      athleteId,
      eventDate,
      type,
      title: title.trim(),
      transport: transport.trim() || undefined,
    });
    setTitle("");
    setTransport("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          日付
          <input
            type="date"
            className="rounded border px-2 py-1.5"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          種別
          <select
            className="rounded border px-2 py-1.5"
            value={type}
            onChange={(e) => setType(e.target.value as ScheduleType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {SCHEDULE_META[t].icon} {SCHEDULE_META[t].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          内容
          <input
            className="rounded border px-2 py-1.5"
            placeholder="例: 東京→大阪 新幹線、全日本選手権"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          交通手段 (任意)
          <input
            className="rounded border px-2 py-1.5"
            placeholder="例: 新幹線のぞみ123号 / JL123"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">
            予定を追加
          </button>
        </div>
      </form>

      <ul className="divide-y">
        {(events ?? []).map((ev) => (
          <li key={ev.id} className="flex items-center gap-3 py-3">
            <span className="text-xl">{SCHEDULE_META[ev.type].icon}</span>
            <div className="flex-1">
              <p className="font-medium">{ev.title}</p>
              <p className="text-xs text-gray-500">
                {ev.eventDate} · {SCHEDULE_META[ev.type].label}
                {ev.transport ? ` · ${ev.transport}` : ""}
                {ev.syncStatus === "pending" ? " · 未同期" : ""}
              </p>
            </div>
            <button
              onClick={() => deleteScheduleEventLocal(ev.id)}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
        {events && events.length === 0 && (
          <li className="py-6 text-center text-gray-500">予定がまだありません。</li>
        )}
      </ul>
    </div>
  );
}

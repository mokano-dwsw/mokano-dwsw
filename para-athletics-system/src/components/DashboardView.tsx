"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/offline";
import { DEMO_ATHLETE_ID } from "@/lib/athlete";
import { computeReadiness, LEVEL_LABEL, LEVEL_BG } from "@/lib/readiness";
import { hrvSeries, recentHrvCV, sleepScore, sortByDateAsc } from "@/lib/metrics";
import { seedDemoData } from "@/lib/demo";
import { SCHEDULE_META } from "@/lib/types";
import BarLineChart, { type ChartPoint, type ChartMarker } from "@/components/charts/BarLineChart";

/** CV が低いほど疲労蓄積の兆候 (要件) → 信号色に変換。閾値は暫定。 */
function cvColor(cv: number): { label: string; cls: string } {
  if (!isFinite(cv)) return { label: "—", cls: "bg-gray-400" };
  if (cv >= 8) return { label: "安定", cls: "bg-green-600" };
  if (cv >= 5) return { label: "やや低下", cls: "bg-amber-500" };
  return { label: "低下(注意)", cls: "bg-red-600" };
}

export default function DashboardView() {
  const athleteId = DEMO_ATHLETE_ID;
  const logs = useLiveQuery(
    () => db.dailyLogs.where("athleteId").equals(athleteId).toArray(),
    [athleteId]
  );
  const events = useLiveQuery(
    () => db.scheduleEvents.where("athleteId").equals(athleteId).toArray(),
    [athleteId]
  );
  const [seeding, setSeeding] = useState(false);

  if (!logs) return <p className="text-gray-500">読み込み中…</p>;

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <p className="text-gray-600">表示できるデータがまだありません。</p>
        <p className="mt-1 text-sm text-gray-500">
          `/checkin` から入力するか、確認用のデモデータを生成してください。
        </p>
        <button
          onClick={async () => {
            setSeeding(true);
            await seedDemoData(athleteId);
            setSeeding(false);
          }}
          disabled={seeding}
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {seeding ? "生成中…" : "デモデータを生成 (30日)"}
        </button>
      </div>
    );
  }

  const asc = sortByDateAsc(logs);
  const latest = asc[asc.length - 1];
  const readiness = computeReadiness(latest);
  const sleep = sleepScore(latest);
  const cv = recentHrvCV(asc);
  const cvc = cvColor(cv);

  const hrvPoints: ChartPoint[] = hrvSeries(asc).map((p) => ({
    label: p.date,
    bar: p.hrv,
    line: p.rolling7,
  }));

  // スケジュール(移動・試合)を HRV 時間軸に合わせてマーカー化
  const dateIndex = new Map(asc.map((l, i) => [l.logDate, i]));
  const markers: ChartMarker[] = (events ?? [])
    .filter((ev) => ev.type === "travel" || ev.type === "competition")
    .flatMap((ev) => {
      const i = dateIndex.get(ev.eventDate);
      if (i == null) return [];
      const meta = SCHEDULE_META[ev.type];
      return [{ index: i, icon: meta.icon, color: meta.color, title: `${ev.eventDate} ${ev.title}` }];
    });
  const readinessPoints: ChartPoint[] = asc.map((l) => ({
    label: l.logDate,
    bar: computeReadiness(l).score ?? undefined,
  }));

  return (
    <div className="space-y-8">
      {/* サマリータイル */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile title="今日のレディネス" colorCls={LEVEL_BG[readiness.level]}>
          <span className="text-3xl font-bold">{readiness.score ?? "—"}</span>
          <span className="ml-1 text-sm">/100 ({LEVEL_LABEL[readiness.level]})</span>
        </Tile>
        <Tile title="睡眠スコア" colorCls="bg-indigo-600">
          <span className="text-3xl font-bold">{sleep ?? "—"}</span>
          <span className="ml-1 text-sm">/100</span>
        </Tile>
        <Tile title="HRV 変動係数 (7日)" colorCls={cvc.cls}>
          <span className="text-3xl font-bold">{isFinite(cv) ? cv.toFixed(1) : "—"}</span>
          <span className="ml-1 text-sm">% ({cvc.label})</span>
        </Tile>
      </div>

      {/* HRV トレンド: 日次(棒) + 7日移動平均(折れ線) */}
      <section>
        <h2 className="mb-1 font-semibold">HRV トレンド × スケジュール</h2>
        <p className="mb-2 text-xs text-gray-500">
          薄い棒 = 日々の HRV、濃い線 = 7日移動平均。{SCHEDULE_META.travel.icon} 移動 /{" "}
          {SCHEDULE_META.competition.icon} 試合 を重ね、長距離移動の翌日に HRV
          が低下する傾向を読み取る。
        </p>
        <BarLineChart points={hrvPoints} markers={markers} unit=" ms" />
      </section>

      {/* レディネス推移 */}
      <section>
        <h2 className="mb-1 font-semibold">レディネス推移</h2>
        <BarLineChart points={readinessPoints} barColor="#86efac" lineColor="#16a34a" />
      </section>

      <p className="text-xs text-gray-400">
        ※ スコア/CV は MVP の簡易版です。Optimize Score・トレーニング負荷・移動×生理データの
        クロス可視化は今後実装します。
      </p>
    </div>
  );
}

function Tile({
  title,
  colorCls,
  children,
}: {
  title: string;
  colorCls: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-4 text-white ${colorCls}`}>
      <p className="text-xs opacity-90">{title}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}

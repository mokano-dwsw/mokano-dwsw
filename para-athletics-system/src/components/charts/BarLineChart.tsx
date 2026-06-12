// 依存ライブラリ不要の軽量 SVG チャート。
// 日次値を棒グラフ、移動平均などを折れ線でオーバーレイ表示する。

export interface ChartPoint {
  label: string;
  bar?: number;
  line?: number;
}

export default function BarLineChart({
  points,
  height = 160,
  barColor = "#bfdbfe",
  lineColor = "#1d4ed8",
  unit = "",
}: {
  points: ChartPoint[];
  height?: number;
  barColor?: string;
  lineColor?: string;
  unit?: string;
}) {
  const W = 100; // viewBox 幅 (レスポンシブ)
  const H = 100;
  const pad = 6;

  const values = points.flatMap((p) => [p.bar, p.line].filter((v): v is number => v != null));
  const max = values.length ? Math.max(...values) : 1;
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const x = (i: number) => pad + (i * (W - 2 * pad)) / Math.max(points.length - 1, 1);
  const y = (v: number) => H - pad - ((v - min) / range) * (H - 2 * pad);
  const barW = Math.max(0.8, (W - 2 * pad) / Math.max(points.length, 1) - 1);

  const linePts = points
    .map((p, i) => (p.line != null ? `${x(i)},${y(p.line)}` : null))
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ height }} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        {points.map((p, i) =>
          p.bar != null ? (
            <rect
              key={i}
              x={x(i) - barW / 2}
              y={y(p.bar)}
              width={barW}
              height={H - pad - y(p.bar)}
              fill={barColor}
              rx={0.6}
            />
          ) : null
        )}
        {linePts && (
          <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth={1.4} />
        )}
      </svg>
      <p className="mt-1 text-right text-xs text-gray-400">
        最大 {Math.round(max)}
        {unit}
      </p>
    </div>
  );
}

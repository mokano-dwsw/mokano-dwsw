// 依存ライブラリ不要の軽量 SVG チャート。
// 日次値を棒グラフ、移動平均などを折れ線でオーバーレイ表示し、
// 任意でスケジュール(移動・試合など)のマーカーを時間軸上に重ねる。

export interface ChartPoint {
  label: string;
  bar?: number;
  line?: number;
}

export interface ChartMarker {
  index: number; // points 配列上の位置
  icon: string;
  color: string;
  title?: string;
}

const W = 100;
const H = 100;
const PAD = 6;

function xAt(i: number, n: number): number {
  return PAD + (i * (W - 2 * PAD)) / Math.max(n - 1, 1);
}

export default function BarLineChart({
  points,
  markers = [],
  height = 160,
  barColor = "#bfdbfe",
  lineColor = "#1d4ed8",
  unit = "",
}: {
  points: ChartPoint[];
  markers?: ChartMarker[];
  height?: number;
  barColor?: string;
  lineColor?: string;
  unit?: string;
}) {
  const values = points.flatMap((p) => [p.bar, p.line].filter((v): v is number => v != null));
  const max = values.length ? Math.max(...values) : 1;
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const n = points.length;
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - 2 * PAD);
  const barW = Math.max(0.8, (W - 2 * PAD) / Math.max(n, 1) - 1);

  const linePts = points
    .map((p, i) => (p.line != null ? `${xAt(i, n)},${y(p.line)}` : null))
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      {/* マーカー行 (時間軸に合わせて絶対配置) */}
      {markers.length > 0 && (
        <div className="relative h-5">
          {markers.map((m, k) => (
            <span
              key={k}
              title={m.title}
              className="absolute -translate-x-1/2 text-sm"
              style={{ left: `${xAt(m.index, n)}%` }}
            >
              {m.icon}
            </span>
          ))}
        </div>
      )}

      <div style={{ height }} className="relative w-full">
        {/* マーカーの縦ガイド線 */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
          {markers.map((m, k) => (
            <line
              key={k}
              x1={xAt(m.index, n)}
              x2={xAt(m.index, n)}
              y1={0}
              y2={H}
              stroke={m.color}
              strokeWidth={0.5}
              strokeDasharray="2 2"
              opacity={0.6}
            />
          ))}
          {points.map((p, i) =>
            p.bar != null ? (
              <rect
                key={i}
                x={xAt(i, n) - barW / 2}
                y={y(p.bar)}
                width={barW}
                height={H - PAD - y(p.bar)}
                fill={barColor}
                rx={0.6}
              />
            ) : null
          )}
          {linePts && (
            <polyline points={linePts} fill="none" stroke={lineColor} strokeWidth={1.4} />
          )}
        </svg>
      </div>
      <p className="mt-1 text-right text-xs text-gray-400">
        最大 {Math.round(max)}
        {unit}
      </p>
    </div>
  );
}

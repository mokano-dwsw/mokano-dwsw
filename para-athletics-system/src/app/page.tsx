import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold">パラ陸上サポートシステム</h1>
      <p className="mt-2 text-gray-600">
        アスリートの状態・スケジュール・経費を一元管理する統合ポータル（開発中）。
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/checkin"
          className="rounded-2xl border p-5 transition hover:border-blue-500 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold">📝 今日のチェックイン</h2>
          <p className="mt-1 text-sm text-gray-600">
            回復・気分・睡眠などを簡単入力。オフラインでも保存できます。
          </p>
        </Link>

        <Link
          href="/training"
          className="rounded-2xl border p-5 transition hover:border-blue-500 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold">🏃 トレーニング記録</h2>
          <p className="mt-1 text-sm text-gray-600">
            練習メニュー・距離・RPE を記録。負荷（時間×RPE）を集計。
          </p>
        </Link>

        <Link
          href="/schedule"
          className="rounded-2xl border p-5 transition hover:border-blue-500 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold">✈️ スケジュール・移動</h2>
          <p className="mt-1 text-sm text-gray-600">
            合宿・試合・移動を登録。移動は HRV トレンドに重ねて表示。
          </p>
        </Link>

        <Link
          href="/expenses"
          className="rounded-2xl border p-5 transition hover:border-blue-500 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold">💴 財務・経費</h2>
          <p className="mt-1 text-sm text-gray-600">
            遠征費・宿泊費・用具代をカテゴリ別に記録・集計。
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="rounded-2xl border p-5 transition hover:border-blue-500 hover:shadow-sm"
        >
          <h2 className="text-lg font-semibold">📊 ダッシュボード</h2>
          <p className="mt-1 text-sm text-gray-600">
            レディネス推移・HRV 7日移動平均・睡眠スコアを可視化。
          </p>
        </Link>
      </section>

      <p className="mt-8 text-xs text-gray-400">
        要件定義とロードマップは README.md を参照してください。
      </p>
    </main>
  );
}

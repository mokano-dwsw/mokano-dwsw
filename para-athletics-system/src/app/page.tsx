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

        <div className="rounded-2xl border border-dashed p-5 text-gray-400">
          <h2 className="text-lg font-semibold">📊 ダッシュボード</h2>
          <p className="mt-1 text-sm">レディネス推移・HRV・スケジュール×負荷の可視化（実装予定）</p>
        </div>
      </section>

      <p className="mt-8 text-xs text-gray-400">
        要件定義とロードマップは README.md を参照してください。
      </p>
    </main>
  );
}

import ScheduleManager from "@/components/ScheduleManager";

export const metadata = {
  title: "スケジュール・移動 | パラ陸上サポート",
};

export default function SchedulePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">スケジュール・移動</h1>
      <p className="mb-6 text-sm text-gray-600">
        合宿・試合・移動の予定を登録します。移動はダッシュボードの HRV トレンド上に重ねて表示されます。
      </p>
      <ScheduleManager />
    </main>
  );
}

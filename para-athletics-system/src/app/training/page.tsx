import TrainingManager from "@/components/TrainingManager";

export const metadata = {
  title: "トレーニング | パラ陸上サポート",
};

export default function TrainingPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">トレーニング記録</h1>
      <p className="mb-6 text-sm text-gray-600">
        練習メニュー・距離・時間・本数・RPE を記録します。トレーニング負荷（時間×RPE）は
        ダッシュボードに集計されます。
      </p>
      <TrainingManager />
    </main>
  );
}

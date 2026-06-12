import DailyCheckin from "@/components/DailyCheckin";

export const metadata = {
  title: "今日のチェックイン | パラ陸上サポート",
};

export default function CheckinPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">今日のチェックイン</h1>
      <DailyCheckin />
    </main>
  );
}

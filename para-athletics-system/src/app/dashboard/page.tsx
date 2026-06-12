import DashboardView from "@/components/DashboardView";

export const metadata = {
  title: "ダッシュボード | パラ陸上サポート",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      <DashboardView />
    </main>
  );
}

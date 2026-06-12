import ExpenseManager from "@/components/ExpenseManager";

export const metadata = {
  title: "財務・経費 | パラ陸上サポート",
};

export default function ExpensesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold">財務・経費</h1>
      <p className="mb-6 text-sm text-gray-600">
        遠征費・宿泊費・用具代などを記録します。カテゴリ別に集計され、家族・連盟での透明性を確保します。
      </p>
      <ExpenseManager />
    </main>
  );
}

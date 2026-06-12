"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, saveExpenseLocal, deleteExpenseLocal } from "@/lib/db/offline";
import { DEMO_ATHLETE_ID, todayISO } from "@/lib/athlete";
import { EXPENSE_META, type ExpenseCategory } from "@/lib/types";

const CATEGORIES = Object.keys(EXPENSE_META) as ExpenseCategory[];
const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export default function ExpenseManager() {
  const athleteId = DEMO_ATHLETE_ID;
  const expenses = useLiveQuery(
    () => db.expenses.where("athleteId").equals(athleteId).reverse().sortBy("spentDate"),
    [athleteId]
  );

  const [spentDate, setSpentDate] = useState(todayISO());
  const [category, setCategory] = useState<ExpenseCategory>("travel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt) return;
    await saveExpenseLocal({
      athleteId,
      spentDate,
      category,
      amountJpy: Math.round(amt),
      description: description.trim() || undefined,
    });
    setAmount("");
    setDescription("");
  }

  // カテゴリ別合計
  const totals = new Map<ExpenseCategory, number>();
  let grand = 0;
  for (const e of expenses ?? []) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amountJpy);
    grand += e.amountJpy;
  }

  return (
    <div className="space-y-6">
      {/* カテゴリ別サマリー */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <div key={c} className="rounded-xl border p-3">
            <p className="text-xs text-gray-500">
              {EXPENSE_META[c].icon} {EXPENSE_META[c].label}
            </p>
            <p className="text-lg font-semibold">{yen(totals.get(c) ?? 0)}</p>
          </div>
        ))}
      </div>
      <p className="text-right text-sm text-gray-600">合計: {yen(grand)}</p>

      <form onSubmit={handleAdd} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          日付
          <input
            type="date"
            className="rounded border px-2 py-1.5"
            value={spentDate}
            onChange={(e) => setSpentDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          カテゴリ
          <select
            className="rounded border px-2 py-1.5"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_META[c].icon} {EXPENSE_META[c].label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          金額 (円)
          <input
            type="number"
            inputMode="numeric"
            className="rounded border px-2 py-1.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          内容
          <input
            className="rounded border px-2 py-1.5"
            placeholder="例: 新幹線(東京→大阪)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <button className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800">
            経費を追加
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-400">
        ※ レシート画像の AI-OCR 自動取り込みは今後実装予定です。
      </p>

      <ul className="divide-y">
        {(expenses ?? []).map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-3">
            <span className="text-xl">{EXPENSE_META[e.category].icon}</span>
            <div className="flex-1">
              <p className="font-medium">
                {yen(e.amountJpy)}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {e.description ?? EXPENSE_META[e.category].label}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {e.spentDate} · {EXPENSE_META[e.category].label}
                {e.syncStatus === "pending" ? " · 未同期" : ""}
              </p>
            </div>
            <button
              onClick={() => deleteExpenseLocal(e.id)}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
        {expenses && expenses.length === 0 && (
          <li className="py-6 text-center text-gray-500">経費がまだありません。</li>
        )}
      </ul>
    </div>
  );
}

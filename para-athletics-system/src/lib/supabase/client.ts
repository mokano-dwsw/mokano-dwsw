import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase の接続情報が設定済みかどうか */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * ブラウザ用 Supabase クライアントを返す。
 * 環境変数が未設定の場合は null を返し、呼び出し側でオフライン専用に切り替える。
 */
export function createClient() {
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}

// 認証 (Supabase Auth) を組み込むまでの暫定アスリート ID。
// 本実装では athlete_members からログインユーザーの担当アスリートを解決する。
export const DEMO_ATHLETE_ID = "demo-athlete";

/** ローカル日付を YYYY-MM-DD で返す */
export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

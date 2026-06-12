"use client";

import { useEffect } from "react";

/** サービスワーカーを登録し PWA (オフライン/インストール) を有効化する */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // 開発時は無効
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録失敗はオフライン非対応となるだけなので握りつぶす
    });
  }, []);
  return null;
}

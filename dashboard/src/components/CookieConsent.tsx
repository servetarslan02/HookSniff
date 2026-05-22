"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "hooksniff_cookie_consent";

type ConsentStatus = "accepted" | "rejected" | null;

function getStoredConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

function storeConsent(status: "accepted" | "rejected") {
  localStorage.setItem(CONSENT_KEY, status);
  // Set a cookie so the backend can also check consent
  document.cookie = `cookie_consent=${status}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax; Secure`;
}

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === null) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, []);

  // BUG FIX: Don't render until client-side hydration is complete
  // Prevents banner from flashing on every page load
  if (visible !== true) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      aria-describedby="cookie-consent-desc"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1" id="cookie-consent-desc">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {t("description")}{" "}
            <Link
              href="/privacy"
              className="text-brand-600 dark:text-brand-400 underline hover:no-underline"
            >
              {t("privacyPolicy")}
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => {
              storeConsent("rejected");
              setVisible(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            {t("reject")}
          </button>
          <button
            onClick={() => {
              storeConsent("accepted");
              setVisible(false);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

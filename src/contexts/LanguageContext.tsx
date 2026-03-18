"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type Lang = "ko" | "en";

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (ko: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ko",
  toggleLang: () => {},
  t: (ko) => ko,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko");

  useEffect(() => {
    const saved = localStorage.getItem("flint-lang") as Lang | null;
    if (saved === "en") setLang("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "ko" ? "en" : "ko";
      localStorage.setItem("flint-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (ko: string, en: string) => (lang === "ko" ? ko : en),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

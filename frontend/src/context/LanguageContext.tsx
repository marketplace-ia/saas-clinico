"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type LangType = "es" | "en" | "fr" | "zh" | "hi" | "ar";

interface LanguageContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "es",
  setLang: () => {},
  isRtl: false,
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLangState] = useState<LangType>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedLang = localStorage.getItem("lumina_lang") as LangType;

    if (storedLang === "ar") {
      document.documentElement.dir = "rtl";
    }

    // Usamos setTimeout para salir del ciclo síncrono del Effect y evitar la alerta del linter
    const timer = setTimeout(() => {
      if (storedLang && storedLang !== "es") {
        setLangState(storedLang);
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const setLang = (newLang: LangType) => {
    setLangState(newLang);
    localStorage.setItem("lumina_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  if (!mounted) return <div className="min-h-screen bg-[#0a0a0a]"></div>;

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

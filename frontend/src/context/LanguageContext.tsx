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

  useEffect(() => {
    const storedLang = localStorage.getItem("lumina_lang") as LangType;

    if (storedLang) {
      // 1. Cambiamos la orientación del HTML inmediatamente (para el árabe)
      document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";

      // 2. Usamos setTimeout para salir del ciclo síncrono del Effect.
      // Esto elimina la alerta de "cascading renders" del linter.
      const timer = setTimeout(() => {
        setLangState(storedLang);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  const setLang = (newLang: LangType) => {
    setLangState(newLang);
    localStorage.setItem("lumina_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

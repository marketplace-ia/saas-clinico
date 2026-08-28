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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 1. Leemos la memoria
    const storedLang = localStorage.getItem("lumina_lang") as LangType;

    // 2. Modificamos el DOM directamente (esto no dispara alertas de React)
    if (storedLang) {
      document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";
    }

    // 3. Diferimos las actualizaciones de estado de React para evitar la alerta "cascading renders"
    const timer = setTimeout(() => {
      if (storedLang) {
        setLangState(storedLang);
      }
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const setLang = (newLang: LangType) => {
    setLangState(newLang);
    localStorage.setItem("lumina_lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  // Mientras se carga el navegador, proveemos el contexto por defecto
  if (!isMounted) {
    return (
      <LanguageContext.Provider value={{ lang: "es", setLang, isRtl: false }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

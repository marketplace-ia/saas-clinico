"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage, LangType } from "../../context/LanguageContext";

// 1. Interfaz Estricta para TypeScript
interface AdminAuthTranslation {
  title: string;
  subtitle: string;
  email: string;
  pass: string;
  btn: string;
  loading: string;
  error: string;
}

// 2. Diccionario Multi-idioma para el Staff
const translations: Record<LangType, AdminAuthTranslation> = {
  es: {
    title: "Acceso Administrativo",
    subtitle: "Portal exclusivo para Psicólogos y Secretariado",
    email: "Correo corporativo",
    pass: "Contraseña",
    btn: "Ingresar al Sistema Clínico",
    loading: "Verificando credenciales...",
    error: "Error al iniciar sesión.",
  },
  en: {
    title: "Administrative Access",
    subtitle: "Exclusive portal for Psychologists and Staff",
    email: "Corporate Email",
    pass: "Password",
    btn: "Enter Clinical System",
    loading: "Verifying credentials...",
    error: "Error logging in.",
  },
  zh: {
    title: "管理访问",
    subtitle: "心理学家和工作人员的专属门户",
    email: "企业电子邮件",
    pass: "密码",
    btn: "进入临床系统",
    loading: "正在验证凭据...",
    error: "登录时出错。",
  },
  hi: {
    title: "प्रशासनिक पहुँच",
    subtitle: "मनोवैज्ञानिकों और कर्मचारियों के लिए विशेष पोर्टल",
    email: "कॉर्पोरेट ईमेल",
    pass: "पासवर्ड",
    btn: "क्लिनिकल सिस्टम में प्रवेश करें",
    loading: "क्रेडेंशियल्स की पुष्टि की जा रही है...",
    error: "लॉग इन करने में त्रुटि।",
  },
  fr: {
    title: "Accès Administratif",
    subtitle: "Portail exclusif pour les psychologues et le personnel",
    email: "E-mail professionnel",
    pass: "Mot de passe",
    btn: "Entrer dans le système clinique",
    loading: "Vérification des identifiants...",
    error: "Erreur de connexion.",
  },
  ar: {
    title: "الوصول الإداري",
    subtitle: "بوابة حصرية لعلماء النفس والموظفين",
    email: "البريد الإلكتروني للشركة",
    pass: "كلمة المرور",
    btn: "الدخول إلى النظام السريري",
    loading: "جاري التحقق من بيانات الاعتماد...",
    error: "خطأ في تسجيل الدخول.",
  },
};

export default function LoginPersonalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const { lang, isRtl } = useLanguage();
  const t = translations[lang];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Tras loguearse exitosamente, el sistema lo envía al panel del psicólogo
      // (El layout del psicólogo se encargará de verificar si es psicólogo o secretaria)
      router.push("/dashboard-psicologo");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.error);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col justify-center py-12 px-6 lg:px-8 transition-colors duration-300"
    >
      {/* Botón flotante para volver */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Link
          href="/"
          className="w-10 h-10 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-sm"
        >
          <svg
            className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          {/* LOGO OFICIAL LUMINA */}
          <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-teal-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
            Ψ
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-gray-400">
          {t.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#111] py-8 px-6 shadow-xl rounded-3xl border border-slate-200 dark:border-white/10 sm:px-10 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-500/30">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="doctor@lumina.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                {t.pass}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-slate-400 dark:disabled:bg-slate-800 transition-colors"
              >
                {cargando ? t.loading : t.btn}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

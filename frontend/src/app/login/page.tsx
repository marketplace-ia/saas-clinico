"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage, LangType } from "../../context/LanguageContext";

interface AuthTranslation {
  title: string;
  subtitle: string;
  link: string;
  email: string;
  pass: string;
  btn: string;
  loading: string;
  error: string;
  or: string;
  googleBtn: string;
}

const translations: Record<LangType, AuthTranslation> = {
  es: {
    title: "Iniciar Sesión",
    subtitle: "¿No tienes cuenta?",
    link: "Regístrate aquí",
    email: "Correo electrónico",
    pass: "Contraseña",
    btn: "Ingresar al portal",
    loading: "Verificando...",
    error: "Error al iniciar sesión.",
    or: "O ingresa con",
    googleBtn: "Continuar con Google",
  },
  en: {
    title: "Log In",
    subtitle: "Don't have an account?",
    link: "Register here",
    email: "Email address",
    pass: "Password",
    btn: "Enter portal",
    loading: "Verifying...",
    error: "Error logging in.",
    or: "Or log in with",
    googleBtn: "Continue with Google",
  },
  zh: {
    title: "登录",
    subtitle: "没有账户？",
    link: "在此注册",
    email: "电子邮件",
    pass: "密码",
    btn: "进入门户",
    loading: "正在验证...",
    error: "登录时出错。",
    or: "或使用以下方式登录",
    googleBtn: "使用 Google 继续",
  },
  hi: {
    title: "लॉग इन करें",
    subtitle: "क्या आपके पास खाता नहीं है?",
    link: "यहां पंजीकरण करें",
    email: "ईमेल पता",
    pass: "पासवर्ड",
    btn: "पोर्टल में प्रवेश करें",
    loading: "पुष्टि की जा रही है...",
    error: "लॉग इन करने में त्रुटि।",
    or: "या इसके साथ लॉग इन करें",
    googleBtn: "Google के साथ जारी रखें",
  },
  fr: {
    title: "Connexion",
    subtitle: "Vous n'avez pas de compte ?",
    link: "Inscrivez-vous ici",
    email: "Adresse e-mail",
    pass: "Mot de passe",
    btn: "Entrer dans le portail",
    loading: "Vérification...",
    error: "Erreur de connexion.",
    or: "Ou connectez-vous avec",
    googleBtn: "Continuer avec Google",
  },
  ar: {
    title: "تسجيل الدخول",
    subtitle: "ليس لديك حساب؟",
    link: "سجل هنا",
    email: "البريد الإلكتروني",
    pass: "كلمة المرور",
    btn: "الدخول إلى البوابة",
    loading: "جاري التحقق...",
    error: "خطأ في تسجيل الدخول.",
    or: "أو سجل دخولك باستخدام",
    googleBtn: "المتابعة باستخدام Google",
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const { lang, isRtl } = useLanguage();
  const t = translations[lang];

  // RADAR INTELIGENTE
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/dashboard-paciente");
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

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
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t.error);
      setCargando(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t.error);
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col justify-center py-12 px-6 lg:px-8 transition-colors duration-300"
    >
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
          <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-teal-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg">
            Ψ
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-gray-400">
          {t.subtitle}{" "}
          <Link
            href="/registro"
            className="font-bold text-indigo-600 dark:text-teal-400 hover:text-indigo-500 transition-colors"
          >
            {t.link}
          </Link>
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
                placeholder="tu@correo.com"
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

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-[#111] text-slate-500 font-medium">
                {t.or}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm text-sm font-bold text-slate-700 dark:text-gray-300 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-[#151515] focus:outline-none transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t.googleBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

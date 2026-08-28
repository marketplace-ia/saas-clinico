"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage, LangType } from "../../context/LanguageContext";

// 1. Añadimos la Interfaz Estricta para eliminar el 'any'
interface AuthTranslation {
  title: string;
  subtitle: string;
  link: string;
  email: string;
  pass: string;
  btn: string;
  loading: string;
  error: string;
}

// 2. Aplicamos la interfaz al diccionario
const translations: Record<LangType, AuthTranslation> = {
  es: {
    title: "Crear cuenta",
    subtitle: "¿Ya tienes cuenta?",
    link: "Inicia sesión aquí",
    email: "Correo electrónico",
    pass: "Contraseña",
    btn: "Registrarme ahora",
    loading: "Creando infraestructura...",
    error: "Ocurrió un error inesperado al registrarse.",
  },
  en: {
    title: "Create account",
    subtitle: "Already have an account?",
    link: "Log in here",
    email: "Email address",
    pass: "Password",
    btn: "Register now",
    loading: "Creating infrastructure...",
    error: "An unexpected error occurred.",
  },
  zh: {
    title: "创建账户",
    subtitle: "已有账户？",
    link: "在此登录",
    email: "电子邮件",
    pass: "密码",
    btn: "立即注册",
    loading: "正在创建基础设施...",
    error: "发生意外错误。",
  },
  hi: {
    title: "खाता बनाएं",
    subtitle: "क्या आपके पास पहले से खाता है?",
    link: "यहां लॉग इन करें",
    email: "ईमेल पता",
    pass: "पासवर्ड",
    btn: "अभी पंजीकरण करें",
    loading: "बुनियादी ढांचा बनाया जा रहा है...",
    error: "एक अप्रत्याशित त्रुटि हुई।",
  },
  fr: {
    title: "Créer un compte",
    subtitle: "Vous avez déjà un compte ?",
    link: "Connectez-vous ici",
    email: "Adresse e-mail",
    pass: "Mot de passe",
    btn: "S'inscrire maintenant",
    loading: "Création de l'infrastructure...",
    error: "Une erreur inattendue s'est produite.",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "هل لديك حساب بالفعل؟",
    link: "سجل دخولك هنا",
    email: "البريد الإلكتروني",
    pass: "كلمة المرور",
    btn: "سجل الآن",
    loading: "جاري إنشاء البنية التحتية...",
    error: "حدث خطأ غير متوقع.",
  },
};

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const { lang, isRtl } = useLanguage();
  const t = translations[lang];

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase
          .from("roles_usuarios")
          .insert([{ correo: email, rol: "paciente" }]);
      }
      router.push("/dashboard-paciente");
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
            href="/login"
            className="font-bold text-indigo-600 dark:text-teal-400 hover:text-indigo-500 transition-colors"
          >
            {t.link}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#111] py-8 px-6 shadow-xl rounded-3xl border border-slate-200 dark:border-white/10 sm:px-10 transition-colors duration-300">
          <form className="space-y-6" onSubmit={handleRegistro}>
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
        </div>
      </div>
    </div>
  );
}

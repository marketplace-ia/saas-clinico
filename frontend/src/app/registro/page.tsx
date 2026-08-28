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
  tabPatient: string;
  tabDoc: string;
  codeLabel: string;
  codeError: string;
}

const translations: Record<LangType, AuthTranslation> = {
  es: {
    title: "Crear cuenta",
    subtitle: "¿Ya tienes cuenta?",
    link: "Inicia sesión aquí",
    email: "Correo electrónico",
    pass: "Contraseña",
    btn: "Registrarme ahora",
    loading: "Procesando...",
    error: "Ocurrió un error inesperado.",
    or: "O regístrate con",
    googleBtn: "Continuar con Google",
    tabPatient: "Soy Paciente",
    tabDoc: "Soy Especialista",
    codeLabel: "Código de Activación Profesional",
    codeError: "Código de activación inválido.",
  },
  en: {
    title: "Create account",
    subtitle: "Already have an account?",
    link: "Log in here",
    email: "Email address",
    pass: "Password",
    btn: "Register now",
    loading: "Processing...",
    error: "An unexpected error occurred.",
    or: "Or sign up with",
    googleBtn: "Continue with Google",
    tabPatient: "I am a Patient",
    tabDoc: "I am a Specialist",
    codeLabel: "Professional Activation Code",
    codeError: "Invalid activation code.",
  },
  zh: {
    title: "创建账户",
    subtitle: "已有账户？",
    link: "在此登录",
    email: "电子邮件",
    pass: "密码",
    btn: "立即注册",
    loading: "处理中...",
    error: "发生意外错误。",
    or: "或使用以下方式注册",
    googleBtn: "使用 Google 继续",
    tabPatient: "我是患者",
    tabDoc: "我是专家",
    codeLabel: "专业激活码",
    codeError: "激活码无效。",
  },
  hi: {
    title: "खाता बनाएं",
    subtitle: "क्या आपके पास पहले से खाता है?",
    link: "यहां लॉग इन करें",
    email: "ईमेल पता",
    pass: "पासवर्ड",
    btn: "अभी पंजीकरण करें",
    loading: "प्रसंस्करण...",
    error: "एक अप्रत्याशित त्रुटि हुई।",
    or: "या इसके साथ पंजीकरण करें",
    googleBtn: "Google के साथ जारी रखें",
    tabPatient: "मैं एक मरीज हूँ",
    tabDoc: "मैं एक विशेषज्ञ हूँ",
    codeLabel: "पेशेवर सक्रियण कोड",
    codeError: "अमान्य सक्रियण कोड।",
  },
  fr: {
    title: "Créer un compte",
    subtitle: "Vous avez déjà un compte ?",
    link: "Connectez-vous ici",
    email: "Adresse e-mail",
    pass: "Mot de passe",
    btn: "S'inscrire maintenant",
    loading: "Traitement...",
    error: "Une erreur inattendue s'est produite.",
    or: "Ou inscrivez-vous avec",
    googleBtn: "Continuer avec Google",
    tabPatient: "Je suis un patient",
    tabDoc: "Je suis un spécialiste",
    codeLabel: "Code d'activation professionnel",
    codeError: "Code d'activation invalide.",
  },
  ar: {
    title: "إنشاء حساب",
    subtitle: "هل لديك حساب بالفعل؟",
    link: "سجل دخولك هنا",
    email: "البريد الإلكتروني",
    pass: "كلمة المرور",
    btn: "سجل الآن",
    loading: "جاري المعالجة...",
    error: "حدث خطأ غير متوقع.",
    or: "أو سجل باستخدام",
    googleBtn: "المتابعة باستخدام Google",
    tabPatient: "أنا مريض",
    tabDoc: "أنا متخصص",
    codeLabel: "رمز التفعيل المهني",
    codeError: "رمز التفعيل غير صالح.",
  },
};

export default function RegistroPage() {
  const [tipoCuenta, setTipoCuenta] = useState<"paciente" | "psicologo">(
    "paciente",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const { lang, isRtl } = useLanguage();
  const t = translations[lang];

  const CODIGO_MAESTRO = "LUMINA-PRO-2026";

  // RADAR INTELIGENTE: Lee la memoria tras volver de Google
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user?.email) {
        const rolPendiente = localStorage.getItem("lumina_registro_rol");

        if (rolPendiente) {
          try {
            // Verificamos si ya existe el rol para no duplicar
            const { data: existente } = await supabase
              .from("roles_usuarios")
              .select("rol")
              .eq("correo", session.user.email)
              .maybeSingle();

            if (!existente) {
              await supabase
                .from("roles_usuarios")
                .insert([{ correo: session.user.email, rol: rolPendiente }]);
            }
          } catch (e) {
            console.error("Error asignando rol:", e);
          }

          // Limpiamos la memoria y redirigimos
          localStorage.removeItem("lumina_registro_rol");
          router.push(
            rolPendiente === "psicologo"
              ? "/dashboard-psicologo"
              : "/dashboard-paciente",
          );
        } else {
          // Si no hay rol pendiente, asumimos que es un inicio de sesión normal o paciente
          router.push("/dashboard-paciente");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (tipoCuenta === "psicologo" && codigoAcceso !== CODIGO_MAESTRO) {
      setError(t.codeError);
      setCargando(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase
          .from("roles_usuarios")
          .insert([{ correo: email, rol: tipoCuenta }]);
      }

      if (tipoCuenta === "psicologo") {
        router.push("/dashboard-psicologo");
      } else {
        router.push("/dashboard-paciente");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t.error);
      setCargando(false);
    }
  };

  const handleGoogleAuth = async () => {
    // 1. Validamos el código ANTES de ir a Google
    if (tipoCuenta === "psicologo" && codigoAcceso !== CODIGO_MAESTRO) {
      setError(t.codeError);
      return;
    }

    try {
      // 2. Anotamos en la memoria qué rol eligió
      localStorage.setItem("lumina_registro_rol", tipoCuenta);

      // 3. Lo enviamos a Google (y le decimos que vuelva a esta misma página)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/registro` },
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
            href="/login"
            className="font-bold text-indigo-600 dark:text-teal-400 hover:text-indigo-500 transition-colors"
          >
            {t.link}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-[#111] py-8 px-6 shadow-xl rounded-3xl border border-slate-200 dark:border-white/10 sm:px-10 transition-colors duration-300">
          <div className="flex bg-slate-100 dark:bg-[#1a1a1a] p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setTipoCuenta("paciente")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tipoCuenta === "paciente" ? "bg-white dark:bg-[#2a2a2a] shadow-sm text-indigo-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-gray-300"}`}
            >
              {t.tabPatient}
            </button>
            <button
              type="button"
              onClick={() => setTipoCuenta("psicologo")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tipoCuenta === "psicologo" ? "bg-white dark:bg-[#2a2a2a] shadow-sm text-indigo-600 dark:text-teal-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-gray-300"}`}
            >
              {t.tabDoc}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleRegistro}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-500/30">
                {error}
              </div>
            )}

            {tipoCuenta === "psicologo" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">
                  {t.codeLabel}
                </label>
                <input
                  type="text"
                  value={codigoAcceso}
                  onChange={(e) => setCodigoAcceso(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-indigo-50/50 dark:bg-teal-900/10 border border-indigo-200 dark:border-teal-500/30 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest uppercase transition-colors"
                  placeholder="LUMINA-PRO-XXXX"
                />
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

          {/* El botón de Google ahora siempre es visible */}
          <div className="mt-6 relative animate-in fade-in duration-300">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-[#111] text-slate-500 font-medium">
                {t.or}
              </span>
            </div>
          </div>

          <div className="mt-6 animate-in fade-in duration-300">
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

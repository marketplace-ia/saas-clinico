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
}

const translations: Record<LangType, AuthTranslation> = {
  es: {
    title: "Comienza tu viaje",
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
  },
  en: {
    title: "Start your journey",
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
  },
  zh: {
    title: "开始你的旅程",
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
  },
  hi: {
    title: "अपनी यात्रा शुरू करें",
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
  },
  fr: {
    title: "Commencez votre voyage",
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
  },
  ar: {
    title: "ابدأ رحلتك",
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
  },
};

export default function RegistroPage() {
  const [tipoCuenta, setTipoCuenta] = useState<"paciente" | "psicologo">(
    "paciente",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [ingresandoDemo, setIngresandoDemo] = useState(false);
  const router = useRouter();

  const { lang, isRtl } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user?.email) {
        const correoUser = session.user.email;
        const rolPendiente = localStorage.getItem("Clinesfera_registro_rol");

        let rolFinal = "paciente";

        if (rolPendiente) {
          try {
            await supabase
              .from("roles_usuarios")
              .upsert([{ correo: correoUser, rol: rolPendiente }], {
                onConflict: "correo",
              });
            rolFinal = rolPendiente;
          } catch (e) {
            console.error("Error guardando rol nuevo:", e);
          }
          localStorage.removeItem("Clinesfera_registro_rol");
        } else {
          try {
            const { data } = await supabase
              .from("roles_usuarios")
              .select("rol")
              .eq("correo", correoUser)
              .single();
            if (data && data.rol) rolFinal = data.rol;
          } catch (e) {
            console.error("Error leyendo rol existente:", e);
          }
        }

        if (rolFinal === "psicologo") {
          router.push("/dashboard-psicologo");
        } else {
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

    try {
      localStorage.setItem("Clinesfera_registro_rol", tipoCuenta);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { rol: tipoCuenta, nombre: email.split("@")[0] } },
      });

      if (signUpError)
        throw new Error(`Error al registrar: ${signUpError.message}`);

      if (data.session) {
        router.push(
          tipoCuenta === "psicologo"
            ? "/dashboard-psicologo"
            : "/dashboard-paciente",
        );
      } else {
        setError("Por favor, revisa tu correo para confirmar tu cuenta.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? `Error: ${err.message}` : t.error);
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      localStorage.setItem("Clinesfera_registro_rol", tipoCuenta);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/registro` },
      });

      if (error) throw new Error(`Error Google Auth: ${error.message}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? `🔍 DETALLE: ${err.message}` : t.error);
    }
  };

  const handleTourVirtual = async () => {
    setIngresandoDemo(true);
    setError("");
    try {
      localStorage.setItem("Clinesfera_registro_rol", "psicologo");

      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@clinesfera.com",
        password: "demo-password-123",
      });

      if (error) {
        setError(
          "⚠️ Por seguridad, debes crear primero el usuario 'demo@clinesfera.com' en tu panel de Supabase para activar esta puerta.",
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? `Error: ${err.message}` : t.error);
    } finally {
      setIngresandoDemo(false);
    }
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen flex bg-white font-sans"
    >
      {/* 🟢 LADO IZQUIERDO: Panel de Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12"
          >
            <svg
              className="w-5 h-5"
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
            Volver al inicio
          </Link>

          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center font-bold text-3xl mb-8 backdrop-blur-sm">
            Ψ
          </div>

          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Eleva tu práctica clínica al siguiente nivel.
          </h1>
          <p className="text-indigo-100 text-lg mb-12 max-w-md leading-relaxed font-medium">
            Clinesfera es el software SaaS integral diseñado exclusivamente para
            profesionales de la salud mental.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="font-bold text-white/90 text-sm">
                Facturación automática conectada al SRI de Ecuador.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="font-bold text-white/90 text-sm">
                Historias Clínicas blindadas y encriptadas.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/30">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="font-bold text-white/90 text-sm">
                Portal exclusivo para pacientes y recaudación.
              </p>
            </div>
          </div>
        </div>

        {/* 🟢 BLOQUE DE CONTACTO */}
        <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <p className="text-sm font-bold text-white mb-1">
            ¿Representas a una clínica o institución?
          </p>
          <p className="text-xs text-white/70 mb-5">
            Adquiere un plan corporativo y obtén capacitación de nuestra IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/593991258731?text=Hola,%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20licencias%20de%20Clinesfera."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-black text-xs px-5 py-2.5 rounded-lg hover:bg-[#20bd5a] transition-colors shadow-md w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.113.551 4.184 1.6 6.002L.17 24l6.14-1.611a12.04 12.04 0 005.72 1.442h.004c6.645 0 12.03-5.386 12.03-12.03S18.676 0 12.031 0zm0 21.828a9.982 9.982 0 01-5.084-1.385l-.364-.216-3.774.99.998-3.682-.237-.378A9.972 9.972 0 012.042 12c0-5.513 4.488-10.002 10.005-10.002 5.517 0 10.003 4.489 10.003 10.002 0 5.513-4.486 10.002-10.003 10.002zm5.485-7.48c-.3-.15-1.78-.88-2.056-.98-.276-.1-.476-.15-.676.15-.2.3-.776.98-.952 1.18-.176.2-.352.225-.652.075-2.036-1.022-3.322-1.92-4.595-3.83-.176-.265-.008-.407.142-.557.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-.926-2.23-.242-.585-.487-.506-.676-.515-.176-.008-.376-.008-.576-.008s-.526.075-.802.375c-.276.3-1.052 1.025-1.052 2.5s1.077 2.9 1.227 3.1c.15.2 2.112 3.225 5.118 4.525.714.31 1.27.495 1.705.633.716.227 1.37.195 1.886.118.577-.086 1.78-.727 2.03-1.43.25-.702.25-1.305.175-1.43-.075-.125-.275-.2-.575-.35z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="mailto:clinesfera@outlook.com"
              className="flex items-center justify-center gap-2 bg-white text-indigo-900 font-black text-xs px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-md w-full sm:w-auto"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              clinesfera@outlook.com
            </a>
          </div>
        </div>
      </div>

      {/* 🟢 LADO DERECHO: Formulario de Registro */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 xl:px-24 bg-slate-50 relative overflow-y-auto py-12 lg:py-0">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden w-12 h-12 bg-linear-to-br from-indigo-500 to-teal-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg mb-8">
            Ψ
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium mb-8">
            {t.subtitle}{" "}
            <Link
              href="/login"
              className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors underline decoration-2 underline-offset-4"
            >
              {t.link}
            </Link>
          </p>

          <div className="flex bg-slate-200/50 p-1.5 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setTipoCuenta("paciente")}
              className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${tipoCuenta === "paciente" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t.tabPatient}
            </button>
            <button
              type="button"
              onClick={() => setTipoCuenta("psicologo")}
              className={`flex-1 py-3 rounded-lg text-sm font-black transition-all ${tipoCuenta === "psicologo" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t.tabDoc}
            </button>
          </div>

          {/* =========================================
              🟢 LA PUERTA MÁGICA: ARRIBA COMO PASE VIP
              ========================================= */}
          {tipoCuenta === "psicologo" && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <button
                onClick={handleTourVirtual}
                disabled={ingresandoDemo}
                type="button"
                className="group relative w-full p-1 rounded-2xl transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(245,158,11,0.6)] hover:shadow-[0_12px_25px_-6px_rgba(245,158,11,0.8)] hover:-translate-y-1 overflow-hidden bg-linear-to-r from-amber-400 via-orange-400 to-amber-500 border-none disabled:opacity-75 disabled:cursor-wait"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/30 to-transparent z-10"></div>

                <div className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-transparent rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0 shadow-inner">
                      {ingresandoDemo ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-2xl animate-pulse drop-shadow-md">
                          ✨
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-black text-lg tracking-wide drop-shadow-sm leading-tight mb-0.5">
                        {ingresandoDemo
                          ? "Abriendo puerta..."
                          : "Tour Interactivo Gratis"}
                      </p>
                      <p className="text-amber-50 font-bold text-xs drop-shadow-sm opacity-90">
                        Prueba el sistema completo sin registrarte
                      </p>
                    </div>
                  </div>

                  {!ingresandoDemo && (
                    <div className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-sm shrink-0 group-hover:bg-white/30 transition-colors shadow-inner hidden sm:flex">
                      <svg
                        className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-300 drop-shadow-sm"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <div className="mt-8 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
                <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 whitespace-nowrap">
                  O crea tu cuenta permanente
                </span>
                <div className="w-full border-t border-slate-200"></div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegistro}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 select-text">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {t.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                {t.pass}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
                placeholder="••••••••"
              />
            </div>

            {tipoCuenta === "psicologo" && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-2">
                <p className="text-xs font-bold text-indigo-800 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Verificación requerida
                </p>
                <p className="text-xs text-indigo-600/80 mt-1 font-medium">
                  Podrás registrarte gratis. Luego deberás adjuntar tu
                  certificado de la SENESCYT para activar tu clínica.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-slate-300 transition-colors mt-2"
            >
              {cargando ? t.loading : t.btn}
            </button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
              {t.or}
            </span>
            <div className="w-full border-t border-slate-200"></div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={handleGoogleAuth}
              type="button"
              className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors"
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

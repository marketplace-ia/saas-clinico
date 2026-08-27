"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPersonalPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. PRIMERO declaramos la función
  const verificarRolYRedirigir = async (correo: string | undefined) => {
    if (!correo) return;
    setCargando(true);

    try {
      const { data: rolData, error: rolError } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", correo)
        .maybeSingle();

      if (rolError) throw rolError;

      // Si es psicologo o secretaria, lo dejamos pasar
      if (
        rolData &&
        (rolData.rol === "psicologo" || rolData.rol === "secretaria")
      ) {
        setMensaje({
          tipo: "exito",
          texto: "Credenciales verificadas. Abriendo tu panel...",
        });
        setTimeout(() => {
          router.push(
            rolData.rol === "psicologo"
              ? "/dashboard-psicologo"
              : "/dashboard-secretaria",
          );
        }, 1000);
      } else {
        // Si no es staff, lo bloqueamos y cerramos su sesión
        setMensaje({
          tipo: "error",
          texto:
            "Este portal es solo para el equipo clínico. Si eres paciente, usa el acceso principal.",
        });
        await supabase.auth.signOut();
        setCargando(false);
      }
    } catch (error) {
      console.error(error);
      setMensaje({
        tipo: "error",
        texto: "Hubo un error al verificar los permisos del sistema.",
      });
      await supabase.auth.signOut();
      setCargando(false);
    }
  };

  // 2. DESPUÉS la usamos en el useEffect
  useEffect(() => {
    // EL RADAR 📡: Detecta si regresamos de Google con la sesión iniciada
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        verificarRolYRedirigir(session.user.email);
      }
    });

    // Revisa si ya hay alguien logueado al cargar la página por primera vez
    const checkSessionInit = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        verificarRolYRedirigir(session.user.email);
      }
    };

    checkSessionInit();

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Si el login por email es exitoso, el Radar (onAuthStateChange) se activa solo.
    } catch (err: unknown) {
      // CORRECCIÓN 1: Ahora sí imprimimos el error para que el linter no se queje
      console.error("Error de login:", err);
      setMensaje({
        tipo: "error",
        texto: "Correo o contraseña incorrectos. Verifica tus datos.",
      });
      setCargando(false);
    }
  };

  const handleLoginGoogle = async () => {
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    // LA DIRECCIÓN DE RETORNO 📍: Forzamos a Google a volver a esta página específica
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login-personal`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-200">
      {/* Botón de volver */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-2 transition-colors"
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
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver a selección de área
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        {/* CORRECCIÓN 2: Cambiamos rounded-[2rem] por rounded-4xl */}
        <div className="bg-white rounded-4xl shadow-xl border border-gray-100 p-8 md:p-12 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-gray-200">
              🏢
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              Acceso Administrativo
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Portal exclusivo para Psicólogos y Secretariado
            </p>
          </div>

          {/* Mensajes de Alerta */}
          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 font-bold text-sm text-center ${mensaje.tipo === "exito" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
            >
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleLoginEmail} className="space-y-5 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Correo Corporativo
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-medium"
                placeholder="doctor@clinica.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-2 ${cargando ? "bg-slate-500 text-white cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-white hover:-translate-y-1 hover:shadow-lg"}`}
            >
              {cargando && mensaje.tipo !== "error" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                  Procesando...
                </>
              ) : (
                "Ingresar al Sistema Clínico"
              )}
            </button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-bold uppercase tracking-wider text-xs">
                O ingresa con
              </span>
            </div>
          </div>

          <button
            onClick={handleLoginGoogle}
            disabled={cargando}
            type="button"
            className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </div>
      </div>
    </div>
  );
}

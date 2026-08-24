"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function LoginPersonalPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (res.error) throw res.error;

      // VALIDACIÓN ESTRICTA: Verificar si realmente es personal
      if (res.data.user) {
        const roleRes = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", email)
          .maybeSingle();

        // Si es paciente, lo echamos fuera de este portal
        if (!roleRes.data || roleRes.data.rol === "paciente") {
          await supabase.auth.signOut();
          throw new Error("ACCESO_DENEGADO_PACIENTE");
        }
      }

      window.location.href = "/";
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "ACCESO_DENEGADO_PACIENTE") {
          setError(
            "Este portal es solo para el equipo clínico. Si eres paciente, usa el acceso principal.",
          );
        } else {
          setError("Credenciales incorrectas o usuario no encontrado.");
        }
      } else {
        setError("Ocurrió un error al intentar ingresar.");
      }
      setCargando(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (res.error) throw res.error;
    } catch (err) {
      console.error("Error de Google Auth:", err);
      setError("Error al conectar con Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mb-6">
        <Link
          href="/acceso-personal"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition font-medium text-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
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

      <div className="bg-white p-8 rounded-2xl shadow-sm border-t-8 border-gray-800 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            🏢
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Administrativo
          </h1>
          <p className="text-gray-500 text-sm">
            Portal exclusivo para Psicólogos y Secretariado
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">
              Correo Corporativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition"
              placeholder="personal@clinica.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-2.5 rounded-lg font-medium transition text-white ${cargando ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900 shadow-sm hover:shadow"}`}
          >
            {cargando
              ? "Verificando credenciales..."
              : "Ingresar al Sistema Clínico"}
          </button>
        </form>

        {/* --- NUEVO BOTÓN DE GOOGLE --- */}
        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O ingresa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
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
            Ingresar con Google
          </button>
        </div>
        {/* ----------------------------- */}
      </div>
    </div>
  );
}

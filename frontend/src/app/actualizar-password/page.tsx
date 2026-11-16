"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function ActualizarPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [errorUI, setErrorUI] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [sesionValida, setSesionValida] = useState(false);

  // Verificamos si el usuario llegó con un link válido (Supabase lo autologuea temporalmente en el fondo)
  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSesionValida(true);
      }
    };
    verificarSesion();
  }, []);

  const guardarNuevaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorUI(null);

    if (password.length < 6) {
      setErrorUI("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setErrorUI("Las contraseñas no coinciden. Revisa e intenta de nuevo.");
      return;
    }

    setCargando(true);
    try {
      // 🟢 Supabase encriptará y guardará la nueva contraseña de inmediato
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setExito(true);

      // Cerramos la sesión de recuperación para obligarlo a loguearse con la clave nueva
      await supabase.auth.signOut();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorUI(
          error.message ||
            "Error al actualizar la contraseña. El enlace puede haber caducado.",
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
      {/* Background Decorativo Premium */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-10 relative z-10 animate-in zoom-in-95 fade-in duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Nueva Contraseña
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Define tu nueva clave de acceso seguro.
          </p>
        </div>

        {errorUI && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-rose-100 animate-in shake">
            {errorUI}
          </div>
        )}

        {!sesionValida && !exito && !errorUI && (
          <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-amber-100">
            Cargando validación de seguridad... Si esta pantalla no avanza,
            solicita un nuevo enlace de recuperación.
          </div>
        )}

        {exito ? (
          <div className="text-center py-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              ¡Bóveda Actualizada!
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Tu contraseña ha sido encriptada y actualizada con éxito. Ya
              puedes ingresar a tu consultorio.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex justify-center bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg transition-all"
            >
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form
            onSubmit={guardarNuevaPassword}
            className={`space-y-5 ${!sesionValida ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                required
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={cargando || !sesionValida}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 mt-4"
            >
              {cargando ? "Encriptando..." : "Guardar y Actualizar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

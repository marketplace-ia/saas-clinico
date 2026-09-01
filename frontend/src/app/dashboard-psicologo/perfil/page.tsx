"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

export default function PerfilPage() {
  // Estados de la marca
  const [nombreComercial, setNombreComercial] = useState(
    "Consultorio Psicológico",
  );
  const [eslogan, setEslogan] = useState("");
  const [colorMarca, setColorMarca] = useState("#4F46E5");
  const [mision, setMision] = useState("");

  // Estados de carga y conexión
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [conectadoGoogle, setConectadoGoogle] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Cargar perfil al entrar
  const cargarPerfil = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("perfil_psicologo")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .maybeSingle(); // Usamos maybeSingle para que no arroje error si aún no existe

      if (error) throw error;

      if (data) {
        setNombreComercial(data.nombre_comercial);
        setEslogan(data.eslogan);
        setColorMarca(data.color_marca);
        setMision(data.mision);
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setCargandoPerfil(false);
    }
  }, []);

  useEffect(() => {
    // CORRECCIÓN 1: Envolvemos cargarPerfil en una función asíncrona
    const inicializar = async () => {
      await cargarPerfil();
    };
    inicializar();

    // Verificar si está conectado a Google
    const verificarConexion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const esGoogle = session.user.app_metadata?.provider === "google";
        setConectadoGoogle(esGoogle);
      }
    };
    verificarConexion();
  }, [cargarPerfil]);

  // Conectar con Google Calendar
  const conectarGoogleCalendar = async () => {
    setCargandoGoogle(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
          redirectTo: `${window.location.origin}/dashboard-psicologo/perfil`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error conectando con Google:", err);
      alert("Hubo un error al intentar conectar con Google.");
    } finally {
      setCargandoGoogle(false);
    }
  };

  // Función REAL para guardar en la base de datos
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("perfil_psicologo").upsert(
        {
          psicologo_id: session.user.id,
          nombre_comercial: nombreComercial,
          eslogan: eslogan,
          color_marca: colorMarca,
          mision: mision,
          actualizado_en: new Date().toISOString(),
        },
        { onConflict: "psicologo_id" },
      );

      if (error) throw error;
      alert("¡Perfil guardado correctamente! 🚀");
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoPerfil) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Mi Perfil</h1>
        <p className="text-slate-500 font-medium">
          Personaliza la marca blanca de tu consultorio. Tus pacientes verán
          esta información.
        </p>
      </div>

      <form onSubmit={guardarCambios} className="space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            Identidad de la Clínica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombre Comercial
              </label>
              <input
                type="text"
                required
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Eslogan Corto
              </label>
              <input
                type="text"
                value={eslogan}
                onChange={(e) => setEslogan(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Color Principal de Marca
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg border-2 border-slate-200 shadow-sm transition-colors"
                style={{ backgroundColor: colorMarca }}
              ></div>
              <input
                type="color"
                value={colorMarca}
                onChange={(e) => setColorMarca(e.target.value)}
                className="h-12 w-16 p-1 rounded-lg border border-slate-200 cursor-pointer"
              />
              <span className="font-mono text-sm text-slate-500 font-bold uppercase">
                {colorMarca}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">
            Filosofía Corporativa
          </h2>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Misión
            </label>
            <textarea
              rows={4}
              value={mision}
              onChange={(e) => setMision(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium text-slate-900"
            ></textarea>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Integraciones Clinesfera
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-2xl font-medium">
            Conecta tu cuenta de Google para sincronizar tus citas
            automáticamente con tu calendario personal.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
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
              <div>
                <h4 className="font-bold text-slate-900">Google Calendar</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Sincronización bidireccional
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={conectarGoogleCalendar}
              disabled={cargandoGoogle || conectadoGoogle}
              className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                conectadoGoogle
                  ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-default"
                  : "bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700"
              }`}
            >
              {cargandoGoogle
                ? "Conectando..."
                : conectadoGoogle
                  ? "✅ Conectado"
                  : "Conectar Calendario"}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={guardando}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

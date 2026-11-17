"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

export default function PerfilMedicoPage() {
  const [nombreComercial, setNombreComercial] = useState(
    "Centro Médico Integral",
  );
  const [precioConsulta, setPrecioConsulta] = useState<number>(40.0);
  // Variables visuales (eslogan, colorMarca) removidas temporalmente para el MVP médico

  const [nombresReales, setNombresReales] = useState("Doctor");
  const [apellidosReales, setApellidosReales] = useState("");
  const [registroSenescyt, setRegistroSenescyt] = useState("");
  const [codigoMSP, setCodigoMSP] = useState("");
  const [especialidad, setEspecialidad] = useState("Medicina General");

  const [perfilExiste, setPerfilExiste] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Integraciones
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [conectadoGoogle, setConectadoGoogle] = useState(false);
  const [mensajeGoogle, setMensajeGoogle] = useState<{
    texto: string;
    tipo: "exito" | "error";
  } | null>(null);

  const cargarPerfil = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("perfil_medico") // 🟢 Apuntamos a la nueva tabla de doctores
        .select("*")
        .eq("medico_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPerfilExiste(true);
        setNombresReales(data.nombres || "Doctor");
        setApellidosReales(data.apellidos || "");
        setEspecialidad(data.especialidad || "Medicina General");
        setRegistroSenescyt(data.registro_senescyt || "");
        setCodigoMSP(data.codigo_msp || "");

        // Valores por defecto visuales
        setNombreComercial("Centro Médico Integral");
        setPrecioConsulta(40.0);
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setCargandoPerfil(false);
    }
  }, []);

  useEffect(() => {
    const inicializarPerfil = async () => {
      await cargarPerfil();
    };
    inicializarPerfil();

    const verificarConexion = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from("integraciones_oauth")
            .select("id")
            .eq("psicologo_id", session.user.id) // Temporalmente usamos la misma columna o puedes cambiarla a "usuario_id" en la BD.
            .eq("proveedor", "google_calendar")
            .eq("estado", "conectado")
            .maybeSingle();
          setConectadoGoogle(!!data);
        }
      } catch (error) {
        console.error("Error verificando conexión:", error);
      }
    };
    verificarConexion();
  }, [cargarPerfil]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("google_sync") === "success") {
        setMensajeGoogle({
          texto: "¡Calendario sincronizado con éxito!",
          tipo: "exito",
        });
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } else if (urlParams.get("error")) {
        setMensajeGoogle({
          texto: "Hubo un error al sincronizar el calendario.",
          tipo: "error",
        });
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const conectarGoogleCalendar = () => {
    setCargandoGoogle(true);
    window.location.href = "/api/calendario/conectar";
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // 🟢 En el MVP Médico los datos más importantes son los legales
      const payload = {
        nombres: nombresReales,
        apellidos: apellidosReales,
        especialidad: especialidad,
        registro_senescyt: registroSenescyt,
        codigo_msp: codigoMSP,
        updated_at: new Date().toISOString(),
      };

      if (perfilExiste) {
        const { error } = await supabase
          .from("perfil_medico")
          .update(payload)
          .eq("medico_id", session.user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("perfil_medico").insert({
          medico_id: session.user.id,
          ...payload,
        });
        if (error) throw error;
      }

      alert("¡Perfil Médico guardado correctamente! 🚀");
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Hubo un error al guardar los cambios: ${mensaje}`);
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoPerfil) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 h-full pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Mi Perfil Profesional
        </h1>
        <p className="text-slate-500 font-medium">
          Configura tus credenciales del Ministerio de Salud (MSP) y SENESCYT
          para la validez de tus recetas.
        </p>
      </div>

      {mensajeGoogle && (
        <div
          className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 ${mensajeGoogle.tipo === "exito" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
        >
          {mensajeGoogle.tipo === "exito" ? "🎉" : "⚠️"} {mensajeGoogle.texto}
        </div>
      )}

      <form onSubmit={guardarCambios} className="space-y-8">
        {/* 🟢 SECCIÓN LEGAL (NUEVA PARA EL MÉDICO) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-teal-600"
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
            Credenciales Clínicas (Obligatorio)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombres del Profesional
              </label>
              <input
                type="text"
                required
                value={nombresReales}
                onChange={(e) => setNombresReales(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Apellidos
              </label>
              <input
                type="text"
                required
                value={apellidosReales}
                onChange={(e) => setApellidosReales(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Especialidad
              </label>
              <input
                type="text"
                required
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej: Medicina Interna"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Registro SENESCYT
              </label>
              <input
                type="text"
                required
                value={registroSenescyt}
                onChange={(e) => setRegistroSenescyt(e.target.value)}
                placeholder="Ej: 1004-2022-221234"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Código MSP (Recetario)
              </label>
              <input
                type="text"
                required
                value={codigoMSP}
                onChange={(e) => setCodigoMSP(e.target.value)}
                placeholder="Libro y Folio"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 🟢 SECCIÓN DE MARCA (Mantenida por estética, aunque no se guarda en la tabla médica en este MVP) */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm opacity-60">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">
            <span>Identidad Visual (Página Pública)</span>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded uppercase tracking-widest">
              Próximamente
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pointer-events-none">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={nombreComercial}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Precio Consulta USD
              </label>
              <input
                type="number"
                value={precioConsulta}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-teal-600"
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
            Conecta tu cuenta de Google para sincronizar tus citas médicas
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
              className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${conectadoGoogle ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-default" : "bg-white border-2 border-slate-200 hover:border-teal-600 hover:text-teal-600 text-slate-700"}`}
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
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Guardar Credenciales
          </button>
        </div>
      </form>
    </div>
  );
}

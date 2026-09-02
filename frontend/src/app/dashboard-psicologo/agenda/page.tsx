"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Cita {
  id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  estado: string;
  google_event_id?: string;
}

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para Google Calendar
  const [googleConectado, setGoogleConectado] = useState(false);
  const [procesandoGoogle, setProcesandoGoogle] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    nombre_paciente: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    modalidad: "Presencial",
  });

  const cargarCitas = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Verificamos si tiene el token de Google activo al cargar
      if (session.provider_token) {
        setGoogleConectado(true);
      }

      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("fecha", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      if (data) setCitas(data as Cita[]);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    // Cápsula asíncrona exigida por React para evitar renders en cascada
    const inicializarDatos = async () => {
      await cargarCitas();
    };
    inicializarDatos();

    // 🟢 RADAR DE SESIÓN: Atrapa la llave de Google en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.provider_token) {
          setGoogleConectado(true);
        } else {
          setGoogleConectado(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [cargarCitas]);

  // FUNCIONES DE GOOGLE CALENDAR
  const conectarGoogle = async () => {
    setProcesandoGoogle(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          redirectTo: `${window.location.origin}/dashboard-psicologo/agenda`,
        },
      });
    } catch (error) {
      console.error("Error al conectar:", error);
      setProcesandoGoogle(false);
    }
  };

  const desconectarGoogle = async () => {
    if (
      !confirm(
        "¿Estás seguro de desconectar tu Google Calendar? Por seguridad, se cerrará tu sesión y deberás volver a entrar.",
      )
    )
      return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
      }

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error al desconectar:", error);
      alert("Hubo un problema al intentar desconectar.");
    }
  };

  // FUNCIÓN PARA AGENDAR
  const agendarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let googleId = null;
      const googleToken = session.provider_token;

      if (!googleToken) {
        // Guardado local sin Google (Falla silenciosa si no hay token)
      } else {
        try {
          const horaInicioCompleta =
            nuevaCita.hora_inicio.length === 5
              ? `${nuevaCita.hora_inicio}:00`
              : nuevaCita.hora_inicio;
          const horaFinCompleta =
            nuevaCita.hora_fin.length === 5
              ? `${nuevaCita.hora_fin}:00`
              : nuevaCita.hora_fin;

          const eventoGoogle = {
            summary: `Cita: ${nuevaCita.nombre_paciente}`,
            description: `Modalidad: ${nuevaCita.modalidad} - Agendado desde Clinesfera`,
            start: {
              dateTime: `${nuevaCita.fecha}T${horaInicioCompleta}`,
              timeZone: "America/Guayaquil",
            },
            end: {
              dateTime: `${nuevaCita.fecha}T${horaFinCompleta}`,
              timeZone: "America/Guayaquil",
            },
          };

          const res = await fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${googleToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(eventoGoogle),
            },
          );

          if (res.ok) {
            const googleData = await res.json();
            googleId = googleData.id;
          } else {
            const errorData = await res.json();
            console.error("Error completo de Google:", errorData);
            alert(
              `⚠️ GOOGLE RECHAZÓ LA CITA.\nMotivo: "${errorData.error?.message}"\nRevisa tus permisos.`,
            );
          }
        } catch (err) {
          console.error("Error con la petición de Google Calendar:", err);
        }
      }

      const { error } = await supabase.from("citas").insert([
        {
          psicologo_id: session.user.id,
          nombre_paciente: nuevaCita.nombre_paciente,
          fecha: nuevaCita.fecha,
          hora_inicio: nuevaCita.hora_inicio,
          hora_fin: nuevaCita.hora_fin,
          modalidad: nuevaCita.modalidad,
          estado: "Programada",
          google_event_id: googleId,
        },
      ]);

      if (error) throw error;

      setNuevaCita({
        nombre_paciente: "",
        fecha: "",
        hora_inicio: "",
        hora_fin: "",
        modalidad: "Presencial",
      });
      setModalAbierto(false);
      cargarCitas();
    } catch (error) {
      console.error("Error al agendar:", error);
      alert("Hubo un error al guardar la cita en la base de datos.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCita = async (id: string, googleEventId?: string) => {
    if (!confirm("¿Estás seguro de cancelar esta cita?")) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const googleToken = session?.provider_token;

      if (googleToken && googleEventId) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${googleToken}` },
          },
        );
      }
      const { error } = await supabase.from("citas").delete().eq("id", id);
      if (error) throw error;
      cargarCitas();
    } catch (error) {
      console.error("Error eliminando cita:", error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mi Agenda</h1>
          <p className="text-slate-500 font-medium">
            Controla tu tiempo y tus sesiones con pacientes.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Cita
        </button>
      </div>

      {/* ========================================= */}
      {/* SECCIÓN VIP: BANNERS DE GOOGLE CALENDAR  */}
      {/* ========================================= */}

      {!cargando && !googleConectado && (
        <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-6 md:p-8 mb-8 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner shrink-0">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-black mb-1">
                ¡Sincroniza tu Google Calendar!
              </h3>
              <p className="text-indigo-100 font-medium max-w-lg">
                Evita cruces de horarios. Conecta tu cuenta y tus citas se
                guardarán automáticamente en tu calendario personal con
                recordatorios.
              </p>
            </div>
          </div>

          <button
            onClick={conectarGoogle}
            disabled={procesandoGoogle}
            className="w-full md:w-auto relative z-10 bg-white text-indigo-600 font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {procesandoGoogle ? "Conectando..." : "Vincular Cuenta de Google"}
          </button>
        </div>
      )}

      {!cargando && googleConectado && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-emerald-900 font-black text-lg">
                Google Calendar Sincronizado
              </h3>
              <p className="text-emerald-700 font-medium text-sm">
                Tus citas se están respaldando en tiempo real en tu calendario
                personal.
              </p>
            </div>
          </div>
          <button
            onClick={desconectarGoogle}
            className="text-red-500 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-transparent hover:border-red-100"
          >
            Desconectar Calendario
          </button>
        </div>
      )}

      {/* ========================================= */}
      {/* FIN SECCIÓN VIP */}
      {/* ========================================= */}

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : citas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Tu agenda está libre
          </h3>
          <p className="text-slate-500 max-w-sm">
            No tienes citas programadas. Haz clic en &quot;Nueva Cita&quot; para
            empezar a agendar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citas.map((cita) => (
            <div
              key={cita.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow group relative"
            >
              <button
                onClick={() => eliminarCita(cita.id, cita.google_event_id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white rounded-full p-1 shadow-sm border border-slate-100"
                title="Cancelar Cita"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <div className="flex justify-between items-start pr-8">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${cita.modalidad === "Online" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {cita.modalidad}
                </span>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  {cita.estado}
                </span>
              </div>

              <div>
                <h3 className="font-black text-xl text-slate-900 mb-1">
                  {cita.nombre_paciente}
                </h3>
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                  <svg
                    className="w-4 h-4 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(cita.fecha).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm mt-1">
                  <svg
                    className="w-4 h-4 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {cita.hora_inicio.slice(0, 5)} - {cita.hora_fin.slice(0, 5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales... */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Agendar Cita
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={agendarCita} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={nuevaCita.nombre_paciente}
                  onChange={(e) =>
                    setNuevaCita({
                      ...nuevaCita,
                      nombre_paciente: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                  placeholder="Ej. María López"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={nuevaCita.fecha}
                  onChange={(e) =>
                    setNuevaCita({ ...nuevaCita, fecha: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={nuevaCita.hora_inicio}
                    onChange={(e) =>
                      setNuevaCita({
                        ...nuevaCita,
                        hora_inicio: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    required
                    value={nuevaCita.hora_fin}
                    onChange={(e) =>
                      setNuevaCita({ ...nuevaCita, hora_fin: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Modalidad
                </label>
                <select
                  value={nuevaCita.modalidad}
                  onChange={(e) =>
                    setNuevaCita({ ...nuevaCita, modalidad: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-bold"
                >
                  <option value="Presencial">Presencial (Consultorio)</option>
                  <option value="Online">Online (Videollamada)</option>
                </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Confirmar Cita"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

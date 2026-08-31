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
}

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

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

      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("fecha", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      if (data) setCitas(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializarDatos = async () => {
      await cargarCitas();
    };
    inicializarDatos();
  }, [cargarCitas]);

  const agendarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      // 1. Obtenemos la sesión actual (que contiene el token de Google si se conectó)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // 2. Guardamos la cita en nuestra base de datos de Clinesfera
      const { error } = await supabase.from("citas").insert([
        {
          psicologo_id: session.user.id,
          nombre_paciente: nuevaCita.nombre_paciente,
          fecha: nuevaCita.fecha,
          hora_inicio: nuevaCita.hora_inicio,
          hora_fin: nuevaCita.hora_fin,
          modalidad: nuevaCita.modalidad,
          estado: "Programada",
        },
      ]);

      if (error) throw error;

      // 3. ¡LA MAGIA! Si tenemos el token de Google, enviamos la cita al Calendario
      const googleToken = session.provider_token;
      if (googleToken) {
        try {
          const eventoGoogle = {
            summary: `Cita: ${nuevaCita.nombre_paciente}`,
            description: `Modalidad: ${nuevaCita.modalidad} - Agendado desde Clinesfera`,
            start: {
              dateTime: `${nuevaCita.fecha}T${nuevaCita.hora_inicio}:00`,
              timeZone: "America/Guayaquil", // Zona horaria de Ecuador
            },
            end: {
              dateTime: `${nuevaCita.fecha}T${nuevaCita.hora_fin}:00`,
              timeZone: "America/Guayaquil",
            },
          };

          await fetch(
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
          console.log("¡Cita sincronizada con Google Calendar!");
        } catch (err) {
          console.error(
            "No se pudo sincronizar con Google (quizás el token expiró):",
            err,
          );
        }
      }

      // 4. Limpiamos y recargamos la vista
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
      alert("Hubo un error al guardar la cita.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
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

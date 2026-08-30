"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// Interfaces para TypeScript
interface Cita {
  id: string;
  paciente: string;
  horaInicio: string; // Formato HH:MM
  horaFin: string;
  tipo: string;
  estado: "Confirmada" | "Pendiente" | "Cancelada";
}

// Generador de horas para la cuadrícula (8 AM a 6 PM)
const horasDelDia = Array.from({ length: 11 }, (_, i) => {
  const hora = i + 8;
  return `${hora.toString().padStart(2, "0")}:00`;
});

// Función pura externa
const obtenerFechaString = (fecha: Date) => {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
};

export default function AgendaPage() {
  // AHORA PERMITIMOS CAMBIAR LA FECHA (setFechaActual)
  const [fechaActual, setFechaActual] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    paciente: "",
    tipo: "Terapia Individual",
    estado: "Confirmada" as "Confirmada" | "Pendiente" | "Cancelada",
  });

  // CARGA DE CITAS (Se dispara automáticamente cada vez que cambias la fecha)
  useEffect(() => {
    let montado = true;

    const fetchCitas = async () => {
      setCargando(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const fechaBuscada = obtenerFechaString(fechaActual);

        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .eq("psicologo_id", session.user.id)
          .eq("fecha", fechaBuscada); // Filtramos por el día exacto que estás viendo

        if (error) throw error;

        if (data && montado) {
          const citasReales = data.map((cita) => ({
            id: cita.id,
            paciente: cita.nombre_paciente,
            horaInicio: cita.hora_inicio.substring(0, 5),
            horaFin: cita.hora_fin.substring(0, 5),
            tipo: cita.tipo,
            estado: cita.estado as "Confirmada" | "Pendiente" | "Cancelada",
          }));
          setCitas(citasReales);
        }
      } catch (error) {
        console.error("Error cargando citas:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    fetchCitas();

    return () => {
      montado = false;
    };
  }, [fechaActual, refreshKey]); // Depende de fechaActual: si la cambias, busca de nuevo

  // FUNCIONES DE NAVEGACIÓN DEL CALENDARIO
  const irAlDiaAnterior = () => {
    setFechaActual((prev) => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setDate(nuevaFecha.getDate() - 1);
      return nuevaFecha;
    });
  };

  const irAlDiaSiguiente = () => {
    setFechaActual((prev) => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setDate(nuevaFecha.getDate() + 1);
      return nuevaFecha;
    });
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  // Función para Guardar una Cita Nueva
  const handleGuardarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const fechaHoy = obtenerFechaString(fechaActual);

      const horaInicioNum = parseInt(horaSeleccionada.split(":")[0]);
      const horaFin = `${(horaInicioNum + 1).toString().padStart(2, "0")}:00`;

      const { error } = await supabase.from("citas").insert([
        {
          psicologo_id: session.user.id,
          nombre_paciente: formData.paciente,
          fecha: fechaHoy,
          hora_inicio: `${horaSeleccionada}:00`,
          hora_fin: `${horaFin}:00`,
          tipo: formData.tipo,
          estado: formData.estado,
        },
      ]);

      if (error) throw error;

      setModalAbierto(false);
      setFormData({
        paciente: "",
        tipo: "Terapia Individual",
        estado: "Confirmada",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error guardando cita:", error);
      alert("Error al guardar la cita.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalParaHora = (hora: string) => {
    setHoraSeleccionada(hora);
    setModalAbierto(true);
  };

  const obtenerCitaEnHora = (horaBase: string) => {
    return citas.find((c) => c.horaInicio === horaBase);
  };

  const fechaFormateada = fechaActual.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Comprobar si la fecha actual mostrada es realmente hoy
  const esHoy =
    obtenerFechaString(fechaActual) === obtenerFechaString(new Date());

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col relative">
      {/* ENCABEZADO DE LA AGENDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mi Agenda</h1>
          <p className="text-slate-500 text-sm md:text-base capitalize flex items-center gap-2">
            {fechaFormateada}
            {esHoy && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Hoy
              </span>
            )}
          </p>
        </div>

        {/* BOTONES DE NAVEGACIÓN ACTIVADOS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={irAlDiaAnterior}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-600 shadow-sm"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={irAHoy}
            className={`px-4 py-2 border rounded-xl font-bold transition-colors text-sm shadow-sm ${esHoy ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            Hoy
          </button>

          <button
            onClick={irAlDiaSiguiente}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-600 shadow-sm"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-center shrink-0 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Vista Diaria
          </span>
          {cargando && (
            <span className="text-xs font-bold text-indigo-500 animate-pulse">
              Sincronizando...
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 relative">
          {horasDelDia.map((hora) => {
            const cita = obtenerCitaEnHora(hora);

            return (
              <div key={hora} className="flex min-h-20 group">
                <div className="w-20 pr-4 text-right shrink-0 relative -top-3">
                  <span className="text-xs font-bold text-slate-400">
                    {hora}
                  </span>
                </div>

                <div className="flex-1 border-t border-slate-100 relative p-1">
                  {cita ? (
                    <div
                      className={`absolute top-1 left-1 right-1 bottom-1 p-3 rounded-xl border ${
                        cita.estado === "Confirmada"
                          ? "bg-indigo-50 border-indigo-200 shadow-[inset_4px_0_0_0_#4F46E5]"
                          : cita.estado === "Cancelada"
                            ? "bg-red-50 border-red-200 shadow-[inset_4px_0_0_0_#EF4444]"
                            : "bg-amber-50 border-amber-200 shadow-[inset_4px_0_0_0_#F59E0B]"
                      } hover:shadow-md transition-shadow cursor-pointer z-10 flex flex-col justify-center`}
                    >
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-black text-sm ${cita.estado === "Confirmada" ? "text-indigo-900" : cita.estado === "Cancelada" ? "text-red-900" : "text-amber-900"}`}
                        >
                          {cita.paciente}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cita.estado === "Confirmada"
                              ? "bg-indigo-100 text-indigo-700"
                              : cita.estado === "Cancelada"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 font-medium ${cita.estado === "Confirmada" ? "text-indigo-600/80" : cita.estado === "Cancelada" ? "text-red-600/80" : "text-amber-600/80"}`}
                      >
                        {cita.horaInicio} - {cita.horaFin} • {cita.tipo}
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={() => abrirModalParaHora(hora)}
                      className="w-full h-full rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Agendar cita a las {hora}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL (FORMULARIO EMERGENTE PARA GUARDAR CITA) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Nueva Cita
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Horario: {horaSeleccionada} -{" "}
                  {parseInt(horaSeleccionada.split(":")[0]) + 1}:00
                </p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors bg-white p-2 rounded-full shadow-sm"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGuardarCita} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.paciente}
                  onChange={(e) =>
                    setFormData({ ...formData, paciente: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  placeholder="Ej. Ana García"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tipo de Sesión
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  <option value="Terapia Individual">Terapia Individual</option>
                  <option value="Terapia de Pareja">Terapia de Pareja</option>
                  <option value="Evaluación Inicial">Evaluación Inicial</option>
                  <option value="Seguimiento">Seguimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as
                        | "Confirmada"
                        | "Pendiente"
                        | "Cancelada",
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center"
                >
                  {guardando ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Guardar Cita"
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

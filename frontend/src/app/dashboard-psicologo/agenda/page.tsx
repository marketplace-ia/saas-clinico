"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

interface Cita {
  id: string;
  nombre_paciente: string;
  paciente_email?: string;
  paciente_telefono?: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  estado: string;
}

export default function AgendaPsicologoPage() {
  const router = useRouter();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorTecnico, setErrorTecnico] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());

  // Estados del Modal de Agendamiento
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaCita, setNuevaCita] = useState({
    nombre_paciente: "",
    paciente_email: "",
    paciente_telefono: "",
    hora_inicio: "09:00",
    modalidad: "Virtual",
  });

  // Escuchar al Asistente Inteligente para abrir el modal
  useEffect(() => {
    const handleOpenModal = () => setModalAbierto(true);
    window.addEventListener("OPEN_MODAL_NUEVA_CITA", handleOpenModal);
    return () =>
      window.removeEventListener("OPEN_MODAL_NUEVA_CITA", handleOpenModal);
  }, []);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setErrorTecnico(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const diaFiltro = fechaSeleccionada.toLocaleDateString("en-CA", {
        timeZone: "America/Guayaquil",
      });

      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("psicologo_id", user.id)
        .eq("fecha", diaFiltro)
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      setCitas((data || []) as Cita[]);
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string };
      setErrorTecnico(err?.message || err?.details || String(error));
    } finally {
      setCargando(false);
    }
  }, [fechaSeleccionada]);

  // 🟢 CORRECCIÓN: Envolvemos la llamada en una función interna asíncrona
  useEffect(() => {
    const inicializarCitas = async () => {
      await cargarCitas();
    };
    inicializarCitas();
  }, [cargarCitas]);

  const cambiarDia = (dias: number) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaSeleccionada(nuevaFecha);
  };

  const cambiarEstadoCita = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from("citas")
        .update({ estado: nuevoEstado })
        .eq("id", id);
      if (error) throw error;
      cargarCitas();
    } catch (error: unknown) {
      const err = error as { message?: string };
      alert("Error al actualizar la cita: " + (err?.message || "Desconocido"));
    }
  };

  const handleAgendarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorTecnico(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión inválida");

      // Buscar el tenant_id del psicólogo para aislar los datos correctamente
      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", user.id)
        .single();

      // Calcular hora de fin aproximada (+1 hora)
      const horaInicioObj = new Date(`2000-01-01T${nuevaCita.hora_inicio}`);
      horaInicioObj.setHours(horaInicioObj.getHours() + 1);
      const hora_fin = horaInicioObj.toTimeString().split(" ")[0];

      const diaFiltro = fechaSeleccionada.toLocaleDateString("en-CA", {
        timeZone: "America/Guayaquil",
      });

      const payload = {
        tenant_id: tu?.tenant_id || null,
        psicologo_id: user.id,
        nombre_paciente: nuevaCita.nombre_paciente,
        paciente_correo: nuevaCita.paciente_email,
        paciente_telefono: nuevaCita.paciente_telefono,
        fecha: diaFiltro,
        hora_inicio: nuevaCita.hora_inicio,
        hora_fin: hora_fin,
        modalidad: nuevaCita.modalidad,
        estado: "confirmed",
      };

      const { error } = await supabase.from("citas").insert([payload]);

      if (error) throw error;

      setModalAbierto(false);
      setNuevaCita({
        nombre_paciente: "",
        paciente_email: "",
        paciente_telefono: "",
        hora_inicio: "09:00",
        modalidad: "Virtual",
      });
      cargarCitas();
    } catch (error: unknown) {
      const err = error as { message?: string };
      setErrorTecnico(err?.message || "Error al agendar la cita.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Mi Agenda de Sesiones
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona tus citas diarias y revisa la disponibilidad de pacientes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <button
              onClick={() => cambiarDia(-1)}
              className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
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
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-center min-w-40 px-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {fechaSeleccionada.toLocaleDateString("es-ES", {
                  weekday: "long",
                  timeZone: "America/Guayaquil",
                })}
              </p>
              <p className="text-base font-black text-slate-900">
                {fechaSeleccionada.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  timeZone: "America/Guayaquil",
                })}
              </p>
            </div>
            <button
              onClick={() => cambiarDia(1)}
              className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-500"
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
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="bg-slate-900 hover:bg-indigo-600 text-white font-black px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
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
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Cita
          </button>
        </div>
      </div>

      {errorTecnico && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-sm font-medium mb-6">
          <strong>Error de Sistema:</strong> {errorTecnico}
        </div>
      )}

      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Cargando Agenda...
          </p>
        </div>
      ) : citas.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Tu agenda está libre
          </h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            No hay citas programadas para esta fecha.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                  <th className="p-5 font-black uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="p-5 font-black uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="p-5 font-black uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="p-5 font-black uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="p-5 font-black uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citas.map((cita) => {
                  const horaFormateada = cita.hora_inicio
                    ? cita.hora_inicio.slice(0, 5)
                    : "00:00";
                  return (
                    <tr
                      key={cita.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="text-xl font-black text-indigo-900">
                          {horaFormateada}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-slate-900 text-base">
                          {cita.nombre_paciente}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {cita.paciente_telefono ||
                            cita.paciente_email ||
                            "Sin contacto registrado"}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-3 py-1 rounded-md">
                          {cita.modalidad}
                        </span>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            cita.estado === "confirmed" ||
                            cita.estado === "Programada"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : cita.estado === "requested"
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-rose-100 text-rose-700 border border-rose-200 opacity-50 line-through"
                          }`}
                        >
                          {cita.estado === "confirmed"
                            ? "Confirmada"
                            : cita.estado}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2">
                        {(cita.estado === "confirmed" ||
                          cita.estado === "Programada") && (
                          <div className="flex justify-end gap-2">
                            {(cita.modalidad.toLowerCase() === "online" ||
                              cita.modalidad.toLowerCase() === "virtual" ||
                              cita.modalidad.toLowerCase() ===
                                "teleconsulta") && (
                              <button
                                onClick={() =>
                                  router.push(
                                    "/dashboard-psicologo/teleconsulta/" +
                                      cita.id,
                                  )
                                }
                                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm transition-colors flex items-center gap-2"
                              >
                                Iniciar Videollamada
                              </button>
                            )}
                            <button
                              onClick={() =>
                                cambiarEstadoCita(cita.id, "cancelled")
                              }
                              className="bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                            >
                              ✕ Anular
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AGENDAR NUEVA CITA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-600"
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
                Agendar Nueva Cita
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
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

            <form onSubmit={handleAgendarCita} className="p-6 space-y-5">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-indigo-800 text-xs font-bold flex justify-between items-center">
                <span>Fecha seleccionada:</span>
                <span className="uppercase tracking-wider">
                  {fechaSeleccionada.toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    timeZone: "America/Guayaquil",
                  })}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre del Paciente
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
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={nuevaCita.paciente_telefono}
                    onChange={(e) =>
                      setNuevaCita({
                        ...nuevaCita,
                        paciente_telefono: e.target.value,
                      })
                    }
                    placeholder="Opcional"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={nuevaCita.paciente_email}
                    onChange={(e) =>
                      setNuevaCita({
                        ...nuevaCita,
                        paciente_email: e.target.value,
                      })
                    }
                    placeholder="Opcional"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Hora de Inicio
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Modalidad
                  </label>
                  <select
                    value={nuevaCita.modalidad}
                    onChange={(e) =>
                      setNuevaCita({ ...nuevaCita, modalidad: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Virtual">Virtual</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="w-full px-4 py-3 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-3 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

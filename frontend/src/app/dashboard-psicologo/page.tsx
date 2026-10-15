"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface Cita {
  id: string;
  nombre_paciente: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
}

export default function DashboardPsicologo() {
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("Doc");
  const [mostrarModalCita, setMostrarModalCita] = useState(false);
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [formulario, setFormulario] = useState({
    paciente: "",
    fecha: "",
    hora: "",
  });

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const emailNombre = session.user.email?.split("@")[0] || "Doc";
        setNombre(emailNombre.charAt(0).toUpperCase() + emailNombre.slice(1));

        const hoy = new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Guayaquil",
        });

        const { data: citasData } = await supabase
          .from("citas")
          .select("id, nombre_paciente, hora_inicio, hora_fin, modalidad")
          .eq("psicologo_id", session.user.id)
          .eq("fecha", hoy)
          .order("hora_inicio", { ascending: true });

        if (citasData) setCitasHoy(citasData);

        const { count } = await supabase
          .from("historias_clinicas")
          .select("*", { count: "exact", head: true })
          .eq("psicologo_id", session.user.id);

        if (count !== null) setTotalPacientes(count);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosDashboard();
  }, []);

  useEffect(() => {
    const handleNuevaCita = () => setMostrarModalCita(true);
    window.addEventListener("OPEN_MODAL_NUEVA_CITA", handleNuevaCita);
    return () =>
      window.removeEventListener("OPEN_MODAL_NUEVA_CITA", handleNuevaCita);
  }, []);

  // 🟢 FUNCIÓN ACTUALIZADA Y BLINDADA
  const guardarNuevaCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoCita(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .single();

      if (!tu)
        throw new Error(
          "No tienes una clínica asignada para guardar esta cita.",
        );

      // Calcular hora de fin aproximada (+1 hora)
      const horaInicioObj = new Date(`2000-01-01T${formulario.hora}`);
      horaInicioObj.setHours(horaInicioObj.getHours() + 1);
      const hora_fin = horaInicioObj.toTimeString().split(" ")[0];

      // 🟢 CORRECCIÓN: Usar estado "confirmed"
      const { error } = await supabase.from("citas").insert({
        tenant_id: tu.tenant_id,
        psicologo_id: session.user.id,
        nombre_paciente: formulario.paciente,
        fecha: formulario.fecha,
        hora_inicio: formulario.hora,
        hora_fin: hora_fin,
        modalidad: "Online",
        estado: "confirmed",
      });

      if (error) throw error;

      setFormulario({ paciente: "", fecha: "", hora: "" });
      setMostrarModalCita(false);
      window.location.reload();
    } catch (error: unknown) {
      console.error("Detalle completo del error:", error);
      let errorReal = "Error desconocido";
      if (error instanceof Error) {
        errorReal = error.message;
      } else if (typeof error === "object" && error !== null) {
        const errObj = error as { message?: string; details?: string };
        errorReal = errObj.message || errObj.details || JSON.stringify(error);
      }
      alert(`⚠️ Error al agendar: \n${errorReal}`);
    } finally {
      setGuardandoCita(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">
            ¡Hola, {nombre}! 👋
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => setMostrarModalCita(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
          Agendar Cita
        </button>
      </div>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <svg
                    className="w-8 h-8"
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
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Citas para Hoy
                  </p>
                  <h3 className="text-4xl font-black text-slate-900">
                    {citasHoy.length}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <svg
                    className="w-8 h-8"
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
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pacientes Activos
                  </p>
                  <h3 className="text-4xl font-black text-slate-900">
                    {totalPacientes}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 md:w-2/3">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md mb-4 inline-block">
                  Novedad
                </span>
                <h2 className="text-2xl font-black mb-2">
                  ¡Bienvenido a Clinesfera!
                </h2>
                <p className="text-indigo-100 font-medium mb-6">
                  El módulo de Historias Clínicas y la sincronización con Google
                  Calendar ya están 100% operativos. Tu consultorio digital está
                  listo para escalar.
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute top-10 -right-5 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:h-150 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                Agenda de Hoy
              </h3>
              <Link
                href="/dashboard-psicologo/agenda"
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Ver todo
              </Link>
            </div>

            {citasHoy.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-slate-300"
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
                <p className="text-slate-500 font-medium">
                  Día despejado. No tienes citas programadas para hoy.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {citasHoy.map((cita) => (
                  <div
                    key={cita.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors flex gap-4"
                  >
                    {/* 🟢 CORRECCIÓN TAILWIND APLICADA AQUÍ */}
                    <div className="flex flex-col items-center justify-center min-w-15 border-r border-slate-200 pr-4">
                      <span className="text-lg font-black text-slate-900">
                        {cita.hora_inicio.slice(0, 5)}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Inicio
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">
                        {cita.nombre_paciente}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${cita.modalidad === "Online" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {cita.modalidad}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🟢 CORRECCIÓN TAILWIND APLICADA AQUÍ */}
      {mostrarModalCita && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setMostrarModalCita(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              📅 Agendar Nueva Cita
            </h2>
            <form className="space-y-5" onSubmit={guardarNuevaCita}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Paciente
                </label>
                <input
                  type="text"
                  required
                  value={formulario.paciente}
                  onChange={(e) =>
                    setFormulario({ ...formulario, paciente: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ej. Ana Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formulario.fecha}
                    onChange={(e) =>
                      setFormulario({ ...formulario, fecha: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={formulario.hora}
                    onChange={(e) =>
                      setFormulario({ ...formulario, hora: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={guardandoCita}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md mt-2 flex justify-center items-center gap-2"
              >
                {guardandoCita ? "Guardando..." : "Guardar Sesión"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

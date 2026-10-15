"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Definimos la estructura exacta para eliminar el error "Unexpected any"
interface Cita {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha_hora: string;
  motivo: string;
  estado: string;
  notas_previas: string;
}

export default function ResumenClinico({ pacienteId }: { pacienteId: string }) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 2. Movemos la función adentro del useEffect para evitar el error de dependencias (exhaustive-deps)
    const cargarCitas = async () => {
      if (!pacienteId) return;

      setCargando(true);

      // 3. Usamos el cliente estándar de Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("fecha_hora", { ascending: true });

      if (error) {
        console.error("Error al cargar citas:", error);
      } else {
        setCitas((data as Cita[]) || []);
      }
      setCargando(false);
    };

    cargarCitas();
  }, [pacienteId]);

  // Separar citas futuras de las pasadas
  const ahora = new Date();
  const citasProgramadas = citas.filter(
    (c) => new Date(c.fecha_hora) >= ahora && c.estado === "Programada",
  );
  const historialCitas = citas.filter(
    (c) => new Date(c.fecha_hora) < ahora || c.estado !== "Programada",
  );

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CABECERA Y BOTÓN AGENDAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Resumen Clínico
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm">
            Gestiona las sesiones y el historial del paciente.
          </p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2">
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

      {/* PRÓXIMA CITA (TARJETA DESTACADA) */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-teal-500"
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
          Próxima Sesión
        </h3>

        {citasProgramadas.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            {/* 4. Corregimos la clase de Tailwind sugerida */}
            <div className="bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-6 py-4 rounded-2xl text-center min-w-30">
              <div className="text-3xl font-black">
                {new Date(citasProgramadas[0].fecha_hora).getDate()}
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">
                {new Date(citasProgramadas[0].fecha_hora).toLocaleString(
                  "es-ES",
                  { month: "short" },
                )}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {new Date(citasProgramadas[0].fecha_hora).toLocaleTimeString(
                  "es-ES",
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </div>
              <p className="text-slate-600 dark:text-gray-400">
                Motivo:{" "}
                <span className="font-medium text-slate-900 dark:text-gray-200">
                  {citasProgramadas[0].motivo || "Sesión regular"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-gray-400 italic">
            No hay citas futuras programadas para este paciente.
          </p>
        )}
      </div>

      {/* HISTORIAL DE CITAS */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Historial de Citas
        </h3>
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden">
          {historialCitas.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {historialCitas.map((cita) => (
                <div
                  key={cita.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {new Date(cita.fecha_hora).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-gray-400">
                        {cita.motivo || "Sesión de seguimiento"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        cita.estado === "Completada"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : cita.estado === "Cancelada"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      {cita.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-gray-400">
              El historial clínico está vacío.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

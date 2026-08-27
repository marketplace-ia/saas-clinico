"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Cita {
  id: string;
  psicologo: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function MisCitasPacientePage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerMisCitas = async () => {
      try {
        // 1. Saber quién está logueado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) return;

        // 2. Traer SOLO las citas de este paciente, ordenadas de la más próxima a la más lejana
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .eq("paciente_correo", user.email)
          .order("fecha", { ascending: true });

        if (error) throw error;
        if (data) setCitas(data);
      } catch (error) {
        console.error("Error al cargar mis citas:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerMisCitas();
  }, []);

  // Función para determinar si una cita es "hoy" (para habilitar el botón de videollamada)
  const esCitaHoy = (fechaCita: string) => {
    const hoy = new Date().toISOString().split("T")[0];
    return fechaCita === hoy;
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Mis Citas</h1>
          <p className="text-gray-500">
            Administra tus reservas y accede a tus sesiones virtuales.
          </p>
        </div>
        <Link
          href="/dashboard-paciente/agendar"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Agendar Nueva Cita
        </Link>
      </div>

      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">
            Cargando tu historial de citas...
          </p>
        </div>
      ) : citas.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-16 text-center shadow-sm">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Aún no tienes citas
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Parece que todavía no has programado ninguna sesión con nuestros
            especialistas. ¡Da el primer paso hacia tu bienestar hoy mismo!
          </p>
          <Link
            href="/dashboard-paciente/agendar"
            className="inline-block bg-blue-50 text-blue-600 font-bold py-3 px-8 rounded-xl transition hover:bg-blue-100"
          >
            Explorar Especialistas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {citas.map((cita) => {
            const esHoy = esCitaHoy(cita.fecha);

            return (
              <div
                key={cita.id}
                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Banner superior de la tarjeta */}
                <div
                  className={`p-4 flex justify-between items-center ${esHoy ? "bg-emerald-500" : "bg-gray-50 border-b border-gray-100"}`}
                >
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${esHoy ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}
                  >
                    {esHoy ? "SESIÓN HOY" : "PROGRAMADA"}
                  </span>
                  <span
                    className={`font-black ${esHoy ? "text-white" : "text-gray-900"}`}
                  >
                    {cita.fecha}
                  </span>
                </div>

                {/* Contenido de la cita */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {cita.psicologo}
                    </h3>
                    <p className="text-blue-600 font-black text-lg mb-4 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      {cita.hora}
                    </p>

                    {cita.motivo && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Motivo de consulta
                        </p>
                        <p className="text-gray-700 text-sm italic">
                          &quot;{cita.motivo}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {esHoy ? (
                      <Link
                        href="/sala-virtual"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2 animate-pulse"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          ></path>
                        </svg>
                        Entrar a la Videollamada
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
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
                        Sala disponible el día de la cita
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

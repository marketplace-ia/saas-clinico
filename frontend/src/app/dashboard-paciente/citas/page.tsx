"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Cita {
  id: string;
  psicologo_id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  estado: string;
  paciente_correo: string;
}

export default function MisCitasPacientePage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorTecnico, setErrorTecnico] = useState<string | null>(null);

  useEffect(() => {
    const obtenerMisCitas = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          setErrorTecnico(
            "No se pudo identificar el correo del usuario logueado.",
          );
          setCargando(false);
          return;
        }

        // Ahora la consulta sí encontrará la columna "paciente_correo"
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .eq("paciente_correo", user.email)
          .order("fecha", { ascending: true });

        if (error) throw error;
        if (data) setCitas(data as Cita[]);
      } catch (error) {
        const err = error as {
          message?: string;
          details?: string;
          hint?: string;
        };
        const mensajeReal =
          err?.message ||
          err?.details ||
          err?.hint ||
          (typeof error === "object" ? JSON.stringify(error) : String(error)) ||
          "Error desconocido en base de datos";

        setErrorTecnico(mensajeReal);
      } finally {
        setCargando(false);
      }
    };

    obtenerMisCitas();
  }, []);

  const esCitaHoy = (fechaCita: string) => {
    const hoy = new Date().toISOString().split("T")[0];
    return fechaCita === hoy;
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mis Citas</h1>
          <p className="text-slate-500">
            Administra tus reservas y accede a tus sesiones virtuales.
          </p>
        </div>
        <Link
          href="/dashboard-paciente/agendar"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2"
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

      {errorTecnico ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center shadow-sm">
          <div className="text-red-500 mb-4 flex justify-center">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-red-700 mb-2">
            La base de datos bloqueó la consulta
          </h2>
          <p className="text-red-600 mb-4 font-medium">
            Supabase nos devolvió el siguiente detalle exacto:
          </p>
          <div className="bg-red-100 text-red-900 p-4 rounded-xl font-mono text-sm wrap-break-word text-left inline-block max-w-full">
            {errorTecnico}
          </div>
        </div>
      ) : cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">
            Cargando tu historial de citas...
          </p>
        </div>
      ) : citas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center shadow-sm">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Aún no tienes citas
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Parece que todavía no has programado ninguna sesión con nuestros
            especialistas. ¡Da el primer paso hacia tu bienestar hoy mismo!
          </p>
          <Link
            href="/dashboard-paciente/agendar"
            className="inline-block bg-indigo-50 text-indigo-600 font-bold py-3 px-8 rounded-xl transition hover:bg-indigo-100"
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
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div
                  className={`p-4 flex justify-between items-center ${esHoy ? "bg-emerald-500" : "bg-slate-50 border-b border-slate-100"}`}
                >
                  <span
                    className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${esHoy ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {esHoy ? "SESIÓN HOY" : cita.estado}
                  </span>
                  <span
                    className={`font-black ${esHoy ? "text-white" : "text-slate-900"}`}
                  >
                    {cita.fecha}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Cita {cita.modalidad}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mb-4">
                      Paciente: {cita.nombre_paciente}
                    </p>

                    <p className="text-indigo-600 font-black text-lg mb-4 flex items-center gap-2">
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
                      {cita.hora_inicio}{" "}
                      {cita.hora_fin ? ` - ${cita.hora_fin}` : ""}
                    </p>

                    {cita.modalidad && (
                      <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Modalidad
                        </p>
                        <p className="text-slate-700 text-sm font-medium">
                          {cita.modalidad}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
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
                        className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
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

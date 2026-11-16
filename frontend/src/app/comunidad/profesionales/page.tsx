"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

interface Profesional {
  psicologo_id: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  ciudad: string;
  experiencia_anos: number;
}

export default function RedProfesionalPage() {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todos");
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [errorBD, setErrorBD] = useState<string | null>(null);

  const especialidades = [
    "Todos",
    "Psicología Clínica",
    "Neuropsicología",
    "Psicología Educativa",
    "Psicología Organizacional",
    "Psiquiatría",
    "Estudiantes",
  ];

  useEffect(() => {
    let montado = true;

    const cargarPerfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("perfil_psicologo")
          .select(
            "psicologo_id, nombres, apellidos, especialidad, ciudad, experiencia_anos",
          );

        if (error) throw error;

        if (montado && data) {
          setProfesionales(data as Profesional[]);
          setErrorBD(null);
        }
      } catch (error: unknown) {
        if (montado) {
          // 🟢 RASTREADOR PROFUNDO PARA EVITAR EL BLOQUEO DE NEXT.JS
          let errorMensaje = "Error desconocido";
          let errorCode = "N/A";
          let errorDetalles = "N/A";
          let errorHint = "N/A";

          if (typeof error === "object" && error !== null) {
            const errObj = error as Record<string, unknown>;
            errorMensaje = (errObj.message as string) || "Sin mensaje";
            errorCode = (errObj.code as string) || "N/A";
            errorDetalles = (errObj.details as string) || "N/A";
            errorHint = (errObj.hint as string) || "N/A";
          } else if (error instanceof Error) {
            errorMensaje = error.message;
          }

          // Inyectamos todo en el estado para que se imprima en la pantalla
          setErrorBD(
            `CÓDIGO: ${errorCode} | MENSAJE: ${errorMensaje} | DETALLES: ${errorDetalles} | PISTA: ${errorHint}`,
          );
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarPerfiles();
    return () => {
      montado = false;
    };
  }, []);

  const profesionalesFiltrados = profesionales.filter((prof) => {
    const nombreCompleto =
      `${prof.nombres || ""} ${prof.apellidos || ""}`.toLowerCase();
    const coincideBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      (prof.ciudad?.toLowerCase() || "").includes(busqueda.toLowerCase());
    const coincideEspecialidad =
      filtroEspecialidad === "Todos" ||
      prof.especialidad === filtroEspecialidad;
    return coincideBusqueda && coincideEspecialidad;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      <div className="bg-slate-900 rounded-4xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-30 translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Directorio Profesional
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-8">
            Encuentra y conecta con especialistas verificados para tu salud
            mental.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0">
          {especialidades.map((esp) => (
            <button
              key={esp}
              onClick={() => setFiltroEspecialidad(esp)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${filtroEspecialidad === esp ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50"}`}
            >
              {esp}
            </button>
          ))}
        </div>
      </div>

      {errorBD && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-black text-lg mb-1">
                Detalle del Error Supabase
              </h3>
              <p className="text-red-700 font-medium text-sm leading-relaxed">
                {errorBD}
              </p>
            </div>
          </div>
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
            Cargando perfiles...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profesionalesFiltrados.map((prof) => (
            <div
              key={prof.psicologo_id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="h-24 w-full bg-linear-to-r from-indigo-500 to-purple-600 relative"></div>

              <div className="px-6 pb-6 flex-1 flex flex-col relative">
                <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 shadow-md absolute -top-10 left-6">
                  {prof.nombres ? prof.nombres.charAt(0) : "U"}
                </div>

                <div className="mt-12 flex-1">
                  <h3 className="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {prof.nombres} {prof.apellidos}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 mt-1">
                    {prof.especialidad || "Salud Mental"}
                  </p>

                  <div className="flex flex-col gap-2.5 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>📍 {prof.ciudad || "No especificada"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>
                        ⭐ {prof.experiencia_anos || 1} años de experiencia
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-slate-100 flex gap-2">
                  <Link
                    href={`/comunidad/profesionales/${prof.psicologo_id}`}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 text-center font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Ver Perfil
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {profesionalesFiltrados.length === 0 && !errorBD && (
            <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-2">
                No se encontraron especialistas
              </h3>
              <p className="text-slate-500">
                Prueba buscando con otros términos o ajustando los filtros.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

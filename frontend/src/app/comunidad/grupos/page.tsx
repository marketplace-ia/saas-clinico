"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase"; // 🟢 BD Conectada

type FiltroGrupo = "Todos" | "Clínica" | "Académico" | "Networking";

interface Grupo {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  miembros: number;
  privacidad: "Público" | "Privado";
  icono: string;
  color_badge: string;
  color_banner: string;
}

export default function GruposTematicosPage() {
  const [filtro, setFiltro] = useState<FiltroGrupo>("Todos");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorBD, setErrorBD] = useState<string | null>(null);

  const opcionesFiltros: FiltroGrupo[] = [
    "Todos",
    "Clínica",
    "Académico",
    "Networking",
  ];

  useEffect(() => {
    let montado = true;

    const cargarGrupos = async () => {
      try {
        const { data, error } = await supabase
          .from("comunidad_grupos")
          .select("*")
          .order("miembros", { ascending: false });

        if (error) throw error;

        if (montado && data) {
          setGrupos(data as Grupo[]);
          setErrorBD(null);
        }
      } catch (error) {
        if (montado) {
          console.error("Error BD Grupos:", error);
          setErrorBD("Ocurrió un error cargando los grupos de la comunidad.");
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarGrupos();
    return () => {
      montado = false;
    };
  }, []);

  const gruposFiltrados =
    filtro === "Todos" ? grupos : grupos.filter((g) => g.categoria === filtro);

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      <div className="bg-slate-900 rounded-4xl p-10 md:p-14 text-white relative overflow-hidden shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-2xl">
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-indigo-300 font-bold text-sm hover:text-white transition-colors mb-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <span aria-hidden="true">&larr;</span> Volver al Explorador
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Grupos Temáticos
          </h1>
          <p className="text-slate-300 text-lg font-medium">
            Únete a sub-comunidades especializadas. Debate sobre tu enfoque
            terapéutico, comparte recursos y supervisa casos clínicos con
            colegas.
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        {opcionesFiltros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${filtro === f ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {errorBD && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 text-sm">
          🚨 {errorBD}
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
            Cargando grupos...
          </p>
        </div>
      ) : gruposFiltrados.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm mt-6">
          <h3 className="text-xl font-black text-slate-900 mb-2">
            No se encontraron grupos
          </h3>
          <p className="text-slate-500">
            Aún no hay grupos disponibles en esta categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gruposFiltrados.map((grupo) => (
            <div
              key={grupo.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            >
              <div
                className={`h-20 w-full bg-linear-to-r ${grupo.color_banner} relative`}
              >
                <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center text-2xl">
                  {grupo.icono}
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 text-white text-xs font-bold">
                  {grupo.privacidad === "Privado" ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {grupo.privacidad}
                </div>
              </div>

              <div className="p-6 pt-10 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {grupo.nombre}
                  </h2>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border w-max mb-3 ${grupo.color_badge}`}
                >
                  {grupo.categoria}
                </span>
                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">
                  {grupo.descripcion}
                </p>

                <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      {grupo.miembros} Miembros
                    </span>
                  </div>
                  <button className="bg-slate-900 text-white hover:bg-indigo-600 font-bold px-5 py-2 rounded-xl text-sm transition-colors shadow-sm">
                    {grupo.privacidad === "Privado"
                      ? "Solicitar Acceso"
                      : "Unirme"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

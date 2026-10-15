"use client";

import { useState } from "react";
import Link from "next/link";

// 🟢 CREAMOS EL TIPO ESTRICTO PARA EVITAR EL 'any'
type FiltroGrupo = "Todos" | "Clínica" | "Académico" | "Networking";

export default function GruposTematicosPage() {
  const [filtro, setFiltro] = useState<FiltroGrupo>("Todos");

  // Arreglo tipado para los botones
  const opcionesFiltros: FiltroGrupo[] = [
    "Todos",
    "Clínica",
    "Académico",
    "Networking",
  ];

  // MOCK: Base de datos de Grupos Temáticos (Punto 11)
  const [grupos] = useState([
    {
      id: "grp-1",
      nombre: "Instituto de Terapia Cognitivo Conductual",
      descripcion:
        "Discusión de casos, técnicas de tercera generación y material exclusivo sobre TCC.",
      categoria: "Clínica",
      miembros: 342,
      privacidad: "Privado",
      icono: "🧠",
      color: "bg-indigo-50 text-indigo-700 border-indigo-100",
      banner: "from-indigo-500 to-blue-600",
    },
    {
      id: "grp-2",
      nombre: "Seminario de Psicoanálisis Lacaniano",
      descripcion:
        "Lectura conjunta de los Escritos y seminarios. Exclusivo para profesionales y estudiantes avanzados.",
      categoria: "Clínica",
      miembros: 128,
      privacidad: "Público",
      icono: "🛋️",
      color: "bg-purple-50 text-purple-700 border-purple-100",
      banner: "from-purple-500 to-fuchsia-600",
    },
    {
      id: "grp-3",
      nombre: "Red de Estudiantes de Psicología (Ecuador)",
      descripcion:
        "Apoyo con tesis, prácticas pre-profesionales, intercambio de libros y consejos académicos.",
      categoria: "Académico",
      miembros: 856,
      privacidad: "Público",
      icono: "📚",
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      banner: "from-emerald-400 to-teal-500",
    },
    {
      id: "grp-4",
      nombre: "Intervisión y Casos Difíciles",
      descripcion:
        "Espacio altamente moderado para supervisión grupal de casos clínicos. Requiere verificación profesional.",
      categoria: "Networking",
      miembros: 54,
      privacidad: "Privado",
      icono: "🛡️",
      color: "bg-rose-50 text-rose-700 border-rose-100",
      banner: "from-rose-500 to-red-600",
    },
  ]);

  const gruposFiltrados =
    filtro === "Todos" ? grupos : grupos.filter((g) => g.categoria === filtro);

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* 1. HERO SECTION PREMIUM */}
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

        <div className="relative z-10 shrink-0 w-full md:w-auto">
          <button className="w-full md:w-auto bg-white text-slate-900 hover:bg-slate-50 font-black py-4 px-8 rounded-2xl transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
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
            Crear un Grupo
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        {opcionesFiltros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              filtro === f
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 3. CUADRÍCULA DE GRUPOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gruposFiltrados.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
          >
            {/* Banner Superior Decorativo */}
            <div
              className={`h-20 w-full bg-linear-to-r ${grupo.banner} relative`}
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

            {/* Contenido */}
            <div className="p-6 pt-10 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h2 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {grupo.nombre}
                </h2>
              </div>

              <span
                className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border w-max mb-3 ${grupo.color}`}
              >
                {grupo.categoria}
              </span>

              <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">
                {grupo.descripcion}
              </p>

              <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500"
                      >
                        U
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 ml-1">
                    +{grupo.miembros}
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
    </div>
  );
}

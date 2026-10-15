"use client";

import { useState } from "react";
import Link from "next/link";

export default function DirectorioTalleresPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("Todas"); // Todas, Virtual, Presencial

  // MOCK DE EVENTOS Y TALLERES (Puntos 5, 6 y 14)
  const [talleres] = useState([
    {
      id: "evt-1",
      titulo: "Taller Práctico: Regulación Emocional en el Día a Día",
      descripcion:
        "Aprende técnicas basadas en TCC y DBT para gestionar emociones intensas. Incluye material de trabajo y certificado de participación.",
      ponente: "Dra. Elena Silva",
      profesion: "Psicóloga Clínica",
      fecha: "15 Oct 2026",
      hora: "18:00 - 20:00 (GMT-5)",
      modalidad: "Virtual",
      tipo: "Taller Clínico",
      precio: "Gratuito",
      plazas: "Limitadas",
      colorTematico: "indigo",
    },
    {
      id: "evt-2",
      titulo: "Grupo de Apoyo Guiado: Manejo de la Ansiedad Social",
      descripcion:
        "Un espacio terapéutico seguro y guiado por profesionales para compartir experiencias y practicar habilidades sociales en grupo.",
      ponente: "Mgtr. Carlos Ruiz",
      profesion: "Psicoterapeuta",
      fecha: "22 Oct 2026",
      hora: "17:30 - 19:00 (GMT-5)",
      modalidad: "Virtual",
      tipo: "Grupo de Apoyo",
      precio: "$15.00",
      plazas: "5 disponibles",
      colorTematico: "emerald",
    },
    {
      id: "evt-3",
      titulo: "I Simposio de Neuropsicología y Desarrollo Infantil",
      descripcion:
        "Jornada intensiva de actualización sobre biomarcadores del TDAH y TEA. Dirigido a estudiantes y profesionales de la salud mental.",
      ponente: "Múltiples Expertos",
      profesion: "Panel Académico",
      fecha: "10 Nov 2026",
      hora: "09:00 - 17:00 (GMT-5)",
      modalidad: "Presencial",
      tipo: "Simposio Académico",
      precio: "$80.00",
      plazas: "Abiertas",
      colorTematico: "rose",
    },
  ]);

  // Filtrado
  const talleresFiltrados = talleres.filter((taller) => {
    const matchBusqueda =
      taller.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      taller.ponente.toLowerCase().includes(busqueda.toLowerCase());
    const matchModalidad =
      filtroModalidad === "Todas" || taller.modalidad === filtroModalidad;
    return matchBusqueda && matchModalidad;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* 1. CABECERA HERO Y BUSCADOR */}
      <div className="bg-slate-900 rounded-4xl p-8 md:p-12 mb-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl">
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-slate-300 font-bold text-xs hover:text-white transition-colors mb-4 uppercase tracking-wider"
          >
            <span aria-hidden="true">&larr;</span> Volver a la Comunidad
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Talleres y Eventos
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-8">
            Expande tus conocimientos y habilidades participando en webinars,
            grupos de apoyo y simposios impartidos por expertos.
          </p>

          <div className="relative max-w-2xl">
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
              placeholder="Buscar por tema o nombre del ponente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. FILTROS RÁPIDOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-lg">Próximos Eventos</h3>

        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {["Todas", "Virtual", "Presencial"].map((mod) => (
            <button
              key={mod}
              onClick={() => setFiltroModalidad(mod)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filtroModalidad === mod
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID DE TALLERES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {talleresFiltrados.map((taller) => (
          <div
            key={taller.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
          >
            {/* Cabecera de la Tarjeta (Fecha y Modalidad) */}
            <div
              className={`p-6 border-b border-slate-100 flex justify-between items-center bg-${taller.colorTematico}-50/50`}
            >
              <div className="flex flex-col">
                <span
                  className={`text-xs font-black uppercase tracking-wider text-${taller.colorTematico}-600 mb-1`}
                >
                  {taller.tipo}
                </span>
                <span className="font-black text-slate-900 text-lg leading-none">
                  {taller.fecha}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full mb-1 ${taller.modalidad === "Virtual" ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"}`}
                >
                  {taller.modalidad}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
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
                  {taller.hora}
                </span>
              </div>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="p-6 flex-1 flex flex-col">
              <h4 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                {taller.titulo}
              </h4>
              <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                {taller.descripcion}
              </p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full bg-${taller.colorTematico}-100 flex items-center justify-center font-black text-${taller.colorTematico}-600 shrink-0`}
                >
                  {taller.ponente.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {taller.ponente}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {taller.profesion}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer de Inscripción */}
            <div className="p-2 bg-slate-50">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Inversión
                  </p>
                  <p
                    className={`font-black ${taller.precio === "Gratuito" ? "text-emerald-600" : "text-slate-900"}`}
                  >
                    {taller.precio}
                  </p>
                </div>
                <button className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                  Inscribirse
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ESTADO VACÍO */}
      {talleresFiltrados.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto mt-10">
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
          <h3 className="text-xl font-black text-slate-900 mb-2">
            No encontramos eventos
          </h3>
          <p className="text-slate-500 font-medium">
            Prueba ajustando los filtros de búsqueda o modalidad.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setFiltroModalidad("Todas");
            }}
            className="mt-6 text-indigo-600 font-bold bg-indigo-50 px-6 py-2.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            Ver todos los eventos
          </button>
        </div>
      )}
    </div>
  );
}

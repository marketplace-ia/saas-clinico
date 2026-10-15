"use client";

import { useState } from "react";
import Link from "next/link";

export default function DirectorioArticulosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos"); // Todos, Académico, Divulgativo

  // Categorías basadas en el Punto 4 de tu manifiesto
  const categorias = [
    "Todas",
    "Psicología Clínica",
    "Neuropsicología",
    "Psicoterapia",
    "Evaluación Psicológica",
    "Salud Mental",
    "Psicología Infantil",
  ];

  // MOCKS PREMIUM: Estructura de datos según el Punto 3 y 35
  const [articulos] = useState([
    {
      id: "art-1",
      titulo: "Eficacia de la TCC en Trastornos de Ansiedad Generalizada",
      resumen:
        "Revisión sistemática sobre los últimos avances en intervenciones cognitivo-conductuales para el manejo de la ansiedad crónica en adultos.",
      autor: "Dra. Elena Silva",
      avatar: "E",
      profesion: "Psicóloga Clínica e Investigadora",
      fecha: "20 Sep 2026",
      tiempoLectura: "12 min",
      categoria: "Psicología Clínica",
      etiquetas: ["Ansiedad", "TCC", "Intervención"],
      tipo: "Académico", // Contenido formal
      vistas: 1240,
      likes: 342,
      comentarios: 28,
      portada: "bg-indigo-100",
      guardado: false,
    },
    {
      id: "art-2",
      titulo: "¿Por qué nos cuesta tanto poner límites?",
      resumen:
        "Una guía práctica y accesible para entender la psicología detrás de la asertividad y aprender a decir 'no' sin culpa.",
      autor: "Mgtr. Carlos Ruiz",
      avatar: "C",
      profesion: "Psicólogo Organizacional",
      fecha: "24 Sep 2026",
      tiempoLectura: "5 min",
      categoria: "Salud Mental",
      etiquetas: ["Bienestar", "Relaciones", "Asertividad"],
      tipo: "Divulgativo", // Contenido para público general
      vistas: 5890,
      likes: 1205,
      comentarios: 156,
      portada: "bg-emerald-100",
      guardado: true,
    },
    {
      id: "art-3",
      titulo: "Biomarcadores en el diagnóstico temprano del TDAH",
      resumen:
        "Análisis de las recientes investigaciones neuropsicológicas que proponen nuevos biomarcadores para identificar el TDAH en la primera infancia.",
      autor: "Ana Torres",
      avatar: "A",
      profesion: "Neuropsicóloga",
      fecha: "18 Sep 2026",
      tiempoLectura: "15 min",
      categoria: "Neuropsicología",
      etiquetas: ["TDAH", "Infancia", "Neurodesarrollo"],
      tipo: "Académico",
      vistas: 850,
      likes: 190,
      comentarios: 14,
      portada: "bg-purple-100",
      guardado: false,
    },
  ]);

  // Motor de filtrado
  const articulosFiltrados = articulos.filter((art) => {
    const coincideBusqueda =
      art.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.etiquetas.some((tag) =>
        tag.toLowerCase().includes(busqueda.toLowerCase()),
      );
    const coincideCategoria =
      filtroCategoria === "Todas" || art.categoria === filtroCategoria;
    const coincideTipo = filtroTipo === "Todos" || art.tipo === filtroTipo;

    return coincideBusqueda && coincideCategoria && coincideTipo;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* 1. CABECERA Y BUSCADOR */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl">
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-indigo-300 font-bold text-xs hover:text-white transition-colors mb-4 uppercase tracking-wider"
          >
            <span aria-hidden="true">&larr;</span> Volver a la Comunidad
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Biblioteca de Publicaciones
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-8">
            Explora cientos de artículos, investigaciones y guías prácticas
            redactadas por profesionales de la salud mental.
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
              placeholder="Buscar por título, tema o etiqueta..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS (Categorías y Tipo de Contenido) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-200">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-2 md:pb-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                filtroCategoria === cat
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Académico vs Divulgativo (Punto 35) */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {["Todos", "Académico", "Divulgativo"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filtroTipo === tipo
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID DE ARTÍCULOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {articulosFiltrados.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col overflow-hidden group"
          >
            {/* Cabecera del Artículo (Autor y Guardar) */}
            <div className="p-6 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-400">
                  {art.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">
                    {art.autor}
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    {art.profesion}
                  </p>
                </div>
              </div>
              <button
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${art.guardado ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
                title="Guardar en Mi Biblioteca"
              >
                <svg
                  className="w-5 h-5"
                  fill={art.guardado ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="px-6 pb-2 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  {art.categoria}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${art.tipo === "Académico" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
                >
                  {art.tipo}
                </span>
              </div>

              <Link href={`/comunidad/articulos/${art.id}`} className="block">
                <h2 className="text-2xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                  {art.titulo}
                </h2>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                  {art.resumen}
                </p>
              </Link>

              {/* Etiquetas */}
              <div className="flex flex-wrap gap-2 mb-6">
                {art.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold text-slate-400 before:content-['#'] before:mr-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Pie del Artículo (Estadísticas) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 mt-auto">
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center gap-1.5"
                  title="Visualizaciones"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {art.vistas.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5" title="Reacciones">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {art.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5" title="Comentarios">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {art.comentarios}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>{art.fecha}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{art.tiempoLectura}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ESTADO VACÍO */}
      {articulosFiltrados.length === 0 && (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            No encontramos artículos
          </h3>
          <p className="text-slate-500 font-medium">
            Prueba ajustando los filtros de categoría o el tipo de contenido.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setFiltroCategoria("Todas");
              setFiltroTipo("Todos");
            }}
            className="mt-6 text-indigo-600 font-bold bg-indigo-50 px-6 py-2.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

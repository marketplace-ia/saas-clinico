"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase"; // 🟢 Conexión a BD Real

interface Articulo {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  tiempo_lectura: string;
  imagen_color: string;
  creado_el: string;
  tipo?: string;
}

export default function DirectorioArticulosPage() {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [errorBD, setErrorBD] = useState<string | null>(null);

  const categorias = [
    "Todas",
    "Psicología Clínica",
    "Neuropsicología",
    "Psicoterapia",
    "Evaluación Psicológica",
    "Salud Mental",
    "Psicología Infantil",
  ];

  // 🟢 1. Carga Real de Base de Datos
  useEffect(() => {
    let montado = true;

    const cargarArticulos = async () => {
      try {
        const { data, error } = await supabase
          .from("articulos_comunidad")
          .select("*")
          .order("creado_el", { ascending: false });

        if (error) throw error;

        if (montado && data) {
          setArticulos(data as Articulo[]);
          setErrorBD(null);
        }
      } catch (error: unknown) {
        if (montado) {
          console.error("Error BD Artículos:", error);
          setErrorBD("Ocurrió un error cargando el catálogo de publicaciones.");
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarArticulos();
    return () => {
      montado = false;
    };
  }, []);

  const articulosFiltrados = articulos.filter((art) => {
    const tituloBusqueda = art.titulo?.toLowerCase() || "";
    const coincideBusqueda = tituloBusqueda.includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "Todas" || art.categoria === filtroCategoria;

    // Mapeo temporal del tipo (si no existe en BD, asume Académico por defecto para el filtro)
    const tipoArt = art.tipo || "Académico";
    const coincideTipo = filtroTipo === "Todos" || tipoArt === filtroTipo;

    return coincideBusqueda && coincideCategoria && coincideTipo;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
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
              placeholder="Buscar por título..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-200">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-2 md:pb-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${filtroCategoria === cat ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {["Todos", "Académico", "Divulgativo"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroTipo === tipo ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {tipo}
            </button>
          ))}
        </div>
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
            Cargando publicaciones...
          </p>
        </div>
      ) : articulosFiltrados.length === 0 ? (
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
            Prueba ajustando los filtros o realizando otra búsqueda.
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {articulosFiltrados.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              <div className="p-6 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-400">
                    {art.autor ? art.autor.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">
                      {art.autor}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">
                      Miembro Clínico
                    </p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Guardar en Mi Biblioteca"
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 pb-2 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    {art.categoria}
                  </span>
                </div>

                <Link href={`/comunidad/articulos/${art.id}`} className="block">
                  <h2 className="text-2xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                    {art.titulo}
                  </h2>
                </Link>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 mt-auto">
                <div className="flex items-center gap-4">
                  <span>Leer artículo completo &rarr;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {new Date(art.creado_el).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{art.tiempo_lectura}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

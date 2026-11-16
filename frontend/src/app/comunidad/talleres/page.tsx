"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

interface TallerPublico {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  modalidad: string;
  tipo: string;
  precio: string;
  ponente: string;
  profesion: string;
  color_tematico: string;
}

export default function DirectorioTalleresPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [talleres, setTalleres] = useState<TallerPublico[]>([]);

  const [errorBD, setErrorBD] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    const cargarTalleresPublicos = async () => {
      try {
        const { data, error } = await supabase
          .from("talleres")
          .select("*")
          .order("fecha", { ascending: true });

        if (error) throw error;

        if (montado && data) {
          setTalleres(data as TallerPublico[]);
          setErrorBD(null);
        }
      } catch (error: unknown) {
        let errorMensaje = "Error desconocido al conectar con Supabase.";

        if (typeof error === "object" && error !== null) {
          const errObj = error as Record<string, unknown>;
          errorMensaje = `Código: ${errObj.code || "N/A"} - Detalle: ${errObj.message || "Sin mensaje"}`;
        } else if (error instanceof Error) {
          errorMensaje = error.message;
        }

        if (montado) setErrorBD(errorMensaje);
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarTalleresPublicos();

    return () => {
      montado = false;
    };
  }, []);

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
            grupos de apoyo y simposios impartidos por nuestros especialistas.
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
              placeholder="Buscar por tema o nombre del profesional..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
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
                Error de Base de Datos
              </h3>
              <p className="text-red-700 font-medium text-sm">{errorBD}</p>
              {/* 🟢 CORRECCIÓN DEL LINTER: Comillas escapadas en el texto HTML */}
              <p className="text-red-500 text-xs mt-2 font-bold">
                Pista: Verifica que hayas ejecutado el código SQL en Supabase
                para crear la tabla &quot;talleres&quot;.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-lg">Próximos Eventos</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          {["Todas", "Virtual", "Presencial"].map((mod) => (
            <button
              key={mod}
              onClick={() => setFiltroModalidad(mod)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filtroModalidad === mod ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {talleresFiltrados.map((taller) => {
            const colorHeader =
              taller.color_tematico === "emerald"
                ? "bg-emerald-50"
                : taller.color_tematico === "rose"
                  ? "bg-rose-50"
                  : "bg-indigo-50";
            const colorText =
              taller.color_tematico === "emerald"
                ? "text-emerald-600"
                : taller.color_tematico === "rose"
                  ? "text-rose-600"
                  : "text-indigo-600";
            const colorBg =
              taller.color_tematico === "emerald"
                ? "bg-emerald-100"
                : taller.color_tematico === "rose"
                  ? "bg-rose-100"
                  : "bg-indigo-100";

            return (
              <div
                key={taller.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                <div
                  className={`p-6 border-b border-slate-100 flex justify-between items-center ${colorHeader}`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-black uppercase tracking-wider mb-1 ${colorText}`}
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

                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                    {taller.titulo}
                  </h4>
                  <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                    {taller.descripcion}
                  </p>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${colorBg} ${colorText}`}
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
                    <button className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                      Inscribirse
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!cargando && talleresFiltrados.length === 0 && !errorBD && (
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
            className="mt-6 text-emerald-600 font-bold bg-emerald-50 px-6 py-2.5 rounded-full hover:bg-emerald-100 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

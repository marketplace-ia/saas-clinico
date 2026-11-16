"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

interface Articulo {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  tiempo_lectura: string;
  creado_el: string;
  contenido_texto?: string; // En el futuro se guardará aquí el cuerpo del artículo
}

export default function ArticuloDetallePage() {
  const params = useParams();
  const articuloId = params?.id as string;

  const [guardado, setGuardado] = useState(false);
  const [like, setLike] = useState(false);
  const [siguiendo, setSiguiendo] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [articulo, setArticulo] = useState<Articulo | null>(null);

  useEffect(() => {
    let montado = true;

    const cargarArticulo = async () => {
      try {
        if (!articuloId) return;

        const { data, error } = await supabase
          .from("articulos_comunidad")
          .select("*")
          .eq("id", articuloId)
          .single();

        if (error) throw error;

        if (montado && data) {
          setArticulo(data as Articulo);
        }
      } catch (error) {
        console.error("Error al cargar el artículo:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarArticulo();
    return () => {
      montado = false;
    };
  }, [articuloId]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
          Desplegando lectura...
        </p>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="text-center py-20 text-slate-500 font-bold">
        <p className="mb-4">
          El artículo solicitado no existe o fue eliminado.
        </p>
        <Link
          href="/comunidad/articulos"
          className="text-indigo-600 hover:underline"
        >
          Volver a la Biblioteca
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-700">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link
            href="/comunidad/articulos"
            className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
          >
            <span aria-hidden="true">&larr;</span> Volver a Biblioteca
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLike(!like)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-colors ${like ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              <svg
                className="w-4 h-4"
                fill={like ? "currentColor" : "none"}
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
              {like ? "1" : "Me gusta"}
            </button>
            <button
              onClick={() => setGuardado(!guardado)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${guardado ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              title="Guardar en biblioteca"
            >
              <svg
                className="w-4 h-4"
                fill={guardado ? "currentColor" : "none"}
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
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">
              {articulo.categoria}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {articulo.titulo}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                {articulo.autor.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-lg leading-none">
                    {articulo.autor}
                  </h4>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Autor / Clínico
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-2">
                  <span>
                    {new Date(articulo.creado_el).toLocaleDateString("es-ES")}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{articulo.tiempo_lectura}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSiguiendo(!siguiendo)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm shrink-0 ${siguiendo ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
            >
              {siguiendo ? "Siguiendo" : "Seguir Autor"}
            </button>
          </div>
        </header>

        <div className="w-full h-64 md:h-96 bg-indigo-50 rounded-4xl mb-12 flex items-center justify-center border border-indigo-100">
          <svg
            className="w-20 h-20 text-indigo-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <article className="prose prose-slate prose-lg max-w-none mb-16 font-medium text-slate-700 leading-loose whitespace-pre-wrap">
          {articulo.contenido_texto ||
            "El autor no ha añadido un cuerpo de texto a este artículo todavía."}
        </article>
      </div>
    </div>
  );
}

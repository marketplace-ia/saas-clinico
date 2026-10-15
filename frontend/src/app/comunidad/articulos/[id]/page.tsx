"use client";

import { useState } from "react";
import Link from "next/link";
// import { useParams } from "next/navigation"; // TODO: Descomentar al conectar backend

export default function ArticuloDetallePage() {
  // const params = useParams();
  // const articuloId = params.id; // TODO: Usar cuando conectemos con Supabase

  // ESTADOS INTERACTIVOS
  const [guardado, setGuardado] = useState(false);
  const [like, setLike] = useState(false);
  const [siguiendo, setSiguiendo] = useState(false);

  // MOCK DEL ARTÍCULO (En producción, se cargaría desde Supabase usando el articuloId)
  const articulo = {
    titulo: "Eficacia de la TCC en Trastornos de Ansiedad Generalizada",
    subtitulo:
      "Una revisión sistemática sobre los últimos avances metodológicos y aplicaciones clínicas en pacientes adultos con ansiedad crónica.",
    contenido: `
      La Terapia Cognitivo-Conductual (TCC) se ha consolidado como el tratamiento psicológico de primera línea para el Trastorno de Ansiedad Generalizada (TAG). Sin embargo, las recientes investigaciones apuntan a la necesidad de personalizar las intervenciones.
      
      A lo largo de este artículo, exploraremos cómo la integración de técnicas de tercera generación, como el Mindfulness y la Terapia de Aceptación y Compromiso (ACT), están mejorando las tasas de remisión a largo plazo.
      
      Los pacientes con TAG frecuentemente presentan un sesgo atencional hacia estímulos amenazantes. La reestructuración cognitiva clásica, aunque efectiva, a veces genera resistencia. Es aquí donde la exposición interoceptiva ha demostrado ser un complemento invaluable.
    `,
    categoria: "Psicología Clínica",
    tipo: "Académico",
    fecha: "20 Sep 2026",
    tiempoLectura: "12 min",
    vistas: 1240,
    etiquetas: ["Ansiedad", "TCC", "Intervención", "Revisión Sistemática"],
    referencias:
      "1. Hofmann, S. G., et al. (2012). The Efficacy of Cognitive Behavioral Therapy: A Review of Meta-analyses.\n2. Hayes, S. C. (2016). Acceptance and Commitment Therapy.",

    // MOCK DEL AUTOR
    autor: {
      nombre: "Dra. Elena Silva",
      avatar: "E",
      profesion: "Psicóloga Clínica e Investigadora",
      institucion: "Universidad Central",
      verificado: true,
    },
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-700">
      {/* 1. NAVEGACIÓN FLOTANTE (STICKY BAR) */}
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
              {like ? "343" : "342"}
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
        {/* 2. CABECERA DEL ARTÍCULO */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg">
              {articulo.categoria}
            </span>
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${articulo.tipo === "Académico" ? "border-indigo-200 text-indigo-600" : "border-emerald-200 text-emerald-600"}`}
            >
              Contenido {articulo.tipo}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
            {articulo.titulo}
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-8">
            {articulo.subtitulo}
          </p>

          {/* Fila del Autor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                {articulo.autor.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-lg leading-none">
                    {articulo.autor.nombre}
                  </h4>
                  {articulo.autor.verificado && (
                    <svg
                      className="w-4 h-4 text-emerald-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {articulo.autor.profesion}
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-2">
                  <span>{articulo.fecha}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{articulo.tiempoLectura} lectura</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>
                    {articulo.vistas.toLocaleString()} visualizaciones
                  </span>
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

        {/* 3. PORTADA DEL ARTÍCULO */}
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

        {/* 4. CONTENIDO DEL ARTÍCULO */}
        <article className="prose prose-slate prose-lg max-w-none mb-16 font-medium text-slate-700 leading-loose whitespace-pre-wrap">
          {articulo.contenido}
        </article>

        {/* 5. ETIQUETAS Y REFERENCIAS */}
        <div className="mb-16">
          <div className="flex flex-wrap gap-2 mb-10">
            {articulo.etiquetas.map((tag) => (
              <Link
                key={tag}
                href={`/comunidad/buscar?tag=${tag}`}
                className="bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Referencias Bibliográficas
            </h3>
            <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
              {articulo.referencias}
            </p>
          </div>
        </div>

        <hr className="border-slate-200 mb-12" />

        {/* 6. ZONA DE DEBATE / COMENTARIOS (Punto 10) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900">
              Debate Académico (28)
            </h3>
          </div>

          {/* Caja para comentar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-10 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shrink-0">
              U
            </div>
            <div className="flex-1">
              <textarea
                rows={3}
                placeholder="Únete a la conversación con respeto y criterio clínico..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
              ></textarea>
              <div className="flex justify-end">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm transition-colors text-sm">
                  Publicar Aporte
                </button>
              </div>
            </div>
          </div>

          {/* Comentario simulado */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                M
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-bold text-slate-900 text-sm">
                    Mgtr. Mateo López
                  </h5>
                  <span className="text-xs font-bold text-slate-400">
                    Hace 3 horas
                  </span>
                </div>
                <p className="text-slate-700 text-sm font-medium leading-relaxed mb-3">
                  Excelente revisión, Dra. Silva. Especialmente útil la
                  integración de la exposición interoceptiva. ¿Considera
                  pertinente el uso de registros fisiológicos continuos durante
                  estas sesiones?
                </p>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  Responder
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

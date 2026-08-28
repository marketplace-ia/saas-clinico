"use client";

import Link from "next/link";
import { useState } from "react";

export default function ComunidadPortalPage() {
  const [filtroActivo, setFiltroActivo] = useState("todos");

  const foros = [
    {
      id: 1,
      autor: "Dra. Elena Silva",
      rol: "Profesional",
      tiempo: "Hace 2 horas",
      titulo: "Nuevos enfoques en Terapia Cognitivo Conductual para 2026",
      respuestas: 14,
      likes: 32,
      tag: "Debate Clínico",
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: 2,
      autor: "Carlos M.",
      rol: "Estudiante",
      tiempo: "Hace 5 horas",
      titulo: "¿Algún consejo para mi primera práctica pre-profesional?",
      respuestas: 8,
      likes: 15,
      tag: "Academia",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 3,
      autor: "Equipo PsiEduca",
      rol: "Oficial",
      tiempo: "Hace 1 día",
      titulo: "Taller Gratuito: Primeros Auxilios Psicológicos en crisis",
      respuestas: 45,
      likes: 120,
      tag: "Eventos",
      color: "bg-teal-100 text-teal-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* HEADER CONNECTEDMIND */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-900 via-purple-700 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-indigo-950">
                Connected<span className="text-teal-600">Mind</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                Aprende • Conecta • Crece • Gestiona
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors hidden md:block"
            >
              Volver a Lumina
            </Link>
            <Link
              href="/login"
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-2.5 px-6 rounded-full transition-all shadow-md text-sm"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* BARRA LATERAL */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28">
            <h2 className="font-black text-slate-900 mb-4 uppercase tracking-wider text-xs">
              Explorar Comunidad
            </h2>
            <nav className="space-y-2">
              <button
                onClick={() => setFiltroActivo("todos")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "todos" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🌐 Muro Global
              </button>
              <button
                onClick={() => setFiltroActivo("psieduca")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "psieduca" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                📚 Cursos PsiEduca
              </button>
              <button
                onClick={() => setFiltroActivo("profesionales")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "profesionales" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🤝 Red de Profesionales
              </button>
              <button
                onClick={() => setFiltroActivo("estudiantes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "estudiantes" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🎓 Zona Estudiantes
              </button>
            </nav>
          </div>
        </aside>

        {/* FEED DE PUBLICACIONES */}
        <main className="flex-1">
          <div className="bg-linear-to-r from-indigo-950 to-purple-900 rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-3">
                Bienvenido al ecosistema.
              </h2>
              <p className="text-indigo-200 mb-6 max-w-lg leading-relaxed">
                Un portal integral diseñado para estudiantes, profesionales y
                cualquier persona buscando aprender y mejorar su salud mental.
              </p>
              <div className="flex gap-3">
                <button className="bg-white text-indigo-950 font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-md">
                  Crear Publicación
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {foros.map((foro) => (
              <div
                key={foro.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {foro.autor.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {foro.autor}
                      </p>
                      <p className="text-xs text-slate-500">
                        {foro.rol} • {foro.tiempo}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${foro.color}`}
                  >
                    {foro.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  {foro.titulo}
                </h3>

                <div className="flex items-center gap-6 border-t border-slate-100 pt-4">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold">
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
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {foro.likes}
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {foro.respuestas} Respuestas
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

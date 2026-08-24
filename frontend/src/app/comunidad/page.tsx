"use client";

import Link from "next/link";

export default function ComunidadHomePage() {
  return (
    <div className="w-full font-sans animate-in fade-in duration-500">
      {/* Hero Section (Banner Principal) */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-teal-100 text-teal-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
            Entorno Virtual de Aprendizaje
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
            El espacio donde la{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-emerald-600">
              salud mental
            </span>{" "}
            se comparte.
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Únete a nuestra comunidad. Explora artículos de profesionales,
            inscríbete en talleres interactivos y accede a una biblioteca de
            recursos validados para tu bienestar y formación.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/comunidad/articulos"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg"
            >
              Explorar Artículos
            </Link>
            <Link
              href="/comunidad/talleres"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl font-bold transition shadow-sm"
            >
              Ver Talleres
            </Link>
          </div>
        </div>
        {/* Ilustración / Decoración */}
        <div className="hidden md:flex w-72 h-72 bg-linear-to-tr from-teal-100 to-emerald-50 rounded-full items-center justify-center relative z-10 border-4 border-white shadow-xl">
          <span className="text-8xl">🧠</span>
        </div>
        {/* Fondo decorativo */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-50 rounded-full opacity-50 blur-3xl"></div>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal (Artículos) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-gray-800">
              Publicaciones Recientes
            </h2>
            <Link
              href="/comunidad/articulos"
              className="text-teal-600 hover:text-teal-800 font-bold text-sm"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid gap-6">
            {/* Tarjeta de Artículo Simulada */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  DR
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Dr. Roberto Sánchez
                  </p>
                  <p className="text-xs text-gray-500">
                    Psicólogo Clínico • Hace 2 días
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition">
                El impacto del micro-estrés laboral y cómo gestionarlo
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                A menudo ignoramos las pequeñas fricciones del día a día en
                nuestro entorno de trabajo. Sin embargo, la acumulación de estos
                micro-estresores puede llevar al Burnout más rápido que los
                grandes eventos traumáticos.
              </p>
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                  Ansiedad
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                  Laboral
                </span>
              </div>
            </div>

            {/* Tarjeta de Artículo Simulada 2 */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                  AL
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Ana López (Practicante)
                  </p>
                  <p className="text-xs text-gray-500">
                    Estudiante de Psicología • Hace 5 días
                  </p>
                </div>
                <span className="ml-auto bg-teal-50 text-teal-700 text-xs font-bold px-2 py-1 rounded border border-teal-100 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>{" "}
                  Validado
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition">
                Técnicas de grounding para ataques de pánico
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">
                Un repaso práctico por la técnica 5-4-3-2-1 y cómo anclarnos al
                presente cuando la ansiedad amenaza con desbordarnos.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Secundaria (Talleres y Biblioteca) */}
        <div className="space-y-8">
          {/* Widget de Talleres - CORREGIDO bg-linear-to-br */}
          <div className="bg-linear-to-br from-teal-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎟️</span>
              <h3 className="text-lg font-bold">Próximo Taller</h3>
            </div>
            <h4 className="text-xl font-black mb-2 leading-tight">
              Crianza Positiva en la Era Digital
            </h4>
            <p className="text-teal-100 text-sm mb-4">
              Aprende a establecer límites sanos con las pantallas sin generar
              conflictos.
            </p>
            <div className="bg-white/10 rounded-xl p-3 mb-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <span className="w-4 text-center">📅</span> Sab, 15 de Octubre
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="w-4 text-center">⏰</span> 10:00 AM (Zoom)
              </div>
            </div>
            <button className="w-full bg-white text-teal-900 font-black py-3 rounded-xl hover:bg-teal-50 transition shadow-sm">
              Inscribirme ($15)
            </button>
          </div>

          {/* Widget de Biblioteca */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                ></path>
              </svg>
              Recursos Recientes
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                  <span className="font-bold text-xs">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 group-hover:text-teal-600 transition">
                    Test de Ansiedad de Beck (BDI)
                  </p>
                  <p className="text-xs text-gray-400">Solo Profesionales</p>
                </div>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer">
                <div className="bg-blue-50 text-blue-500 p-2 rounded-lg">
                  <span className="font-bold text-xs">DOC</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700 group-hover:text-teal-600 transition">
                    Plantilla: Diario Emocional
                  </p>
                  <p className="text-xs text-gray-400">Público General</p>
                </div>
              </li>
            </ul>
            <button className="w-full mt-6 text-sm font-bold text-teal-600 bg-teal-50 py-2 rounded-lg hover:bg-teal-100 transition">
              Abrir Biblioteca Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

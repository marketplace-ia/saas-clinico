"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* BARRA DE NAVEGACIÓN (HEADER) */}
      <header className="fixed top-0 w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all duration-300">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
              Lumina
            </span>
          </div>

          <nav className="hidden md:flex gap-10 font-medium text-sm text-gray-400">
            <a href="#clinica" className="hover:text-white transition-colors">
              Gestión Clínica
            </a>
            <a href="#psieduca" className="hover:text-white transition-colors">
              Portal PsiEduca
            </a>
            <a href="#comunidad" className="hover:text-white transition-colors">
              Comunidad
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/login-personal"
              className="hidden md:block text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Acceso Profesionales
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-100 text-black font-black py-2.5 px-6 rounded-full transition-transform hover:scale-105 text-sm"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO (PRINCIPAL) */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* CORRECCIÓN TAILWIND: w-200 h-200 y w-150 h-150 en lugar de corchetes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/3 w-150 h-150 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
              Aprende • Conecta • Crece • Gestiona
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] max-w-5xl">
            El ecosistema integral para <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-teal-300 to-emerald-400">
              la comunidad de salud mental.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
            Mucho más que un consultorio. Una plataforma unificada para que
            psicólogos gestionen su clínica, y estudiantes, pacientes y público
            en general accedan a educación de calidad.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] text-lg flex items-center justify-center gap-2 group"
            >
              Únete a la Comunidad
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE ARQUITECTURA (Características Híbridas) */}
      <section
        id="clinica"
        className="py-32 relative border-t border-white/5 bg-[#050505]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Diseñado para todos
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
              Un espacio donde la tecnología clínica y la psicoeducación
              convergen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Para el Psicólogo/Paciente */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all duration-300 group flex flex-col h-full">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-2">
                Para Clínicas
              </span>
              <h3 className="text-2xl font-bold mb-3 text-gray-100">
                Gestión Inteligente
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Agenda sincronizada, historiales médicos encriptados, pasarela
                de pagos automatizada y telemedicina HD en una sola plataforma.
              </p>
            </div>

            {/* Para Estudiantes/Público */}
            <div
              id="psieduca"
              className="bg-[#111] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
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
              </div>
              <span className="text-teal-400 text-xs font-bold tracking-widest uppercase mb-2">
                Para Estudiantes y Público
              </span>
              <h3 className="text-2xl font-bold mb-3 text-gray-100">
                Portal PsiEduca
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Acceso a talleres, recursos didácticos, artículos científicos y
                herramientas de autocuidado. La academia del bienestar al
                alcance de todos.
              </p>
            </div>

            {/* Comunidad */}
            <div
              id="comunidad"
              className="bg-[#111] border border-white/5 rounded-3xl p-8 hover:bg-[#151515] hover:border-white/10 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
                Para Profesores y Redes
              </span>
              <h3 className="text-2xl font-bold mb-3 text-gray-100">
                Conexión Global
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Construye una red de apoyo, comparte conocimientos y crece junto
                a la comunidad de salud mental más avanzada de Ecuador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0a] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-bold tracking-widest text-sm">
              LUMINA / CONNECTED MIND
            </span>
          </div>
          <p className="text-gray-600 text-sm font-light">
            Construido para el futuro de la salud mental. © 2026
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link
              href="/login-personal"
              className="hover:text-white transition-colors"
            >
              Acceso Profesionales
            </Link>
            <a href="#" className="hover:text-white transition-colors">
              Privacidad
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
      {/* BARRA DE NAVEGACIÓN (HEADER) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
              Ψ
            </div>
            <span className="font-black text-2xl text-gray-900 tracking-tight">
              PsiClinic
            </span>
          </div>

          <nav className="hidden md:flex gap-8 font-bold text-gray-600 text-sm">
            <a href="#servicios" className="hover:text-blue-600 transition">
              Servicios
            </a>
            <a href="#beneficios" className="hover:text-blue-600 transition">
              Beneficios
            </a>
            <a href="#testimonios" className="hover:text-blue-600 transition">
              Testimonios
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login-personal"
              className="hidden md:block text-sm font-bold text-gray-500 hover:text-gray-900 transition"
            >
              Acceso Especialistas
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-lg shadow-blue-200"
            >
              Portal Paciente
            </Link>
          </div>
        </div>
      </header>

      {/* SECCIÓN HERO (PRINCIPAL) */}
      <section className="relative overflow-hidden bg-white">
        {/* CORRECCIÓN 1: Máscara pasada a style para evitar quejas del linter */}
        <div
          className="absolute inset-0 bg-blue-50/50"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, white, transparent)",
            maskImage: "linear-gradient(to bottom, white, transparent)",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black tracking-widest uppercase mb-6">
            La Nueva Era de la Salud Mental
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-tight max-w-4xl mx-auto">
            {/* CORRECCIÓN 2: bg-linear-to-r aplicado */}
            Tu bienestar emocional,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-teal-500">
              a un clic de distancia.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Conecta con especialistas en psicología desde la comodidad de tu
            hogar. Telemedicina segura, herramientas de bienestar y seguimiento
            continuo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl transition shadow-xl shadow-blue-200 text-lg"
            >
              Crear Cuenta Gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-2xl transition shadow-sm text-lg"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS */}
      <section id="servicios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Todo lo que necesitas para sanar
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Una plataforma integral diseñada por y para profesionales de la
              salud mental.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                📹
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Telemedicina HD
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Salas virtuales encriptadas para tus sesiones. Total privacidad
                garantizada sin necesidad de instalar apps extra.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                📅
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Agenda Inteligente
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Reserva tus citas al instante viendo la disponibilidad real de
                tu especialista. Confirmaciones automáticas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🌿
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Módulo PsiEduca
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Acceso a recursos 24/7. Meditaciones, diarios emocionales y
                ejercicios para mantenerte enfocado entre sesiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
              Ψ
            </div>
            <span className="font-bold text-white tracking-tight">
              PsiClinic 2026
            </span>
          </div>
          <p className="text-sm">Diseñado para revolucionar la salud mental.</p>
          <div className="flex gap-4 text-sm font-bold">
            <Link
              href="/login-personal"
              className="hover:text-white transition"
            >
              Staff
            </Link>
            <a href="#" className="hover:text-white transition">
              Privacidad
            </a>
            <a href="#" className="hover:text-white transition">
              Términos
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

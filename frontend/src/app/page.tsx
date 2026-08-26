import Link from "next/link";

export default function LandingSaaSPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200">
      {/* 🚀 NAVEGACIÓN */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md">
              Ψ
            </div>
            <span className="font-black text-2xl text-gray-900 tracking-tight">
              PsiClinic<span className="text-blue-600">.</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-8 font-bold text-sm text-gray-600">
            <a
              href="#caracteristicas"
              className="hover:text-blue-600 transition"
            >
              Características
            </a>
            <a href="#precios" className="hover:text-blue-600 transition">
              Planes
            </a>
            <a href="#testimonios" className="hover:text-blue-600 transition">
              Testimonios
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden md:block font-bold text-gray-700 hover:text-blue-600 transition text-sm"
            >
              Portal Pacientes
            </Link>
            <Link
              href="/login-personal"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-md text-sm"
            >
              Ingresar al Staff
            </Link>
          </div>
        </div>
      </header>

      {/* 💥 HERO SECTION (El gancho principal) */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block bg-blue-50 border border-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mb-4">
            🚀 El Software #1 para Profesionales de la Salud Mental
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Gestiona tu clínica en{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-teal-500">
              piloto automático.
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Agendas inteligentes, telemedicina cifrada, historias clínicas
            electrónicas y cobros automatizados. Todo en una sola plataforma
            diseñada exclusivamente para psicólogos.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 text-lg"
            >
              Comienza tu Prueba Gratis
            </Link>
            <p className="text-sm font-bold text-gray-400">
              Sin tarjeta de crédito. 14 días gratis.
            </p>
          </div>
        </div>

        {/* Mockup / Imagen del Software */}
        <div className="flex-1 w-full relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="absolute inset-0 bg-linear-to-tr from-blue-100 to-teal-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
          {/* Aquí corregimos el border-[8px] por border-8 */}
          <div className="bg-white border-8 border-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-video flex flex-col">
            <div className="h-6 bg-gray-900 flex items-center px-4 gap-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 bg-gray-50 p-4 relative">
              {/* Simulación de la app dentro del mockup */}
              <div className="absolute top-4 right-4 bg-white shadow-lg rounded-xl p-3 flex items-center gap-3 animate-bounce">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">
                  💳
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Nuevo Ingreso
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    +$45.00 USD
                  </p>
                </div>
              </div>
              <div className="w-1/3 h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                {/* Aquí corregimos el conflicto dejando solo w-3/4 */}
                <div className="w-3/4 h-4 bg-gray-200 rounded-full mb-4"></div>
                <div className="w-full h-24 bg-blue-50 rounded-lg mb-3"></div>
                <div className="w-full h-24 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ CARACTERÍSTICAS (Por qué comprarlo) */}
      <section id="caracteristicas" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Todo lo que necesitas para escalar tu práctica
            </h2>
            <p className="text-xl text-gray-500">
              Reemplaza Zoom, Excel, WhatsApp y tu terminal de pagos por una
              sola herramienta integral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-blue-200 transition-colors group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                🎥
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">
                Telemedicina Nativa
              </h3>
              <p className="text-gray-500">
                Consultorio virtual cifrado integrado. Observa a tu paciente
                mientras tomas notas en la misma pantalla.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-teal-200 transition-colors group">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">
                Historia Clínica Smart
              </h3>
              <p className="text-gray-500">
                Expedientes 100% digitales, privados y organizados. Encuentra el
                historial de evolución en segundos.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:border-purple-200 transition-colors group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">
                Cobros Automatizados
              </h3>
              <p className="text-gray-500">
                Tus pacientes pagan con tarjeta antes de la cita. Dile adiós a
                las cancelaciones sin pagar y las deudas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💰 PRECIOS (El negocio) */}
      <section id="precios" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black mb-4">
              Planes diseñados para tu crecimiento
            </h2>
            <p className="text-xl text-gray-400">
              Precios transparentes. Sin contratos forzosos. Cancela cuando
              quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold text-gray-300 mb-2">Básico</h3>
              <div className="mb-6">
                <span className="text-5xl font-black">$29</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-gray-400 mb-8 text-sm">
                Perfecto para psicólogos independientes que van empezando.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Agenda Inteligente
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> 50 Pacientes activos
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Historias Clínicas
                </li>
              </ul>
              <button className="w-full bg-gray-700 hover:bg-gray-600 font-bold py-3 rounded-xl transition">
                Elegir Básico
              </button>
            </div>

            {/* Plan Pro (Destacado) */}
            <div className="bg-linear-to-b from-blue-600 to-blue-900 rounded-3xl p-8 border border-blue-500 flex flex-col transform md:-translate-y-4 shadow-2xl relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-teal-400 text-teal-950 font-black text-xs uppercase px-4 py-1 rounded-full tracking-wider">
                Más Popular
              </div>
              <h3 className="text-xl font-bold text-blue-100 mb-2">
                Profesional
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-black">$59</span>
                <span className="text-blue-300">/mes</span>
              </div>
              <p className="text-blue-100 mb-8 text-sm">
                El ecosistema completo para escalar tu facturación.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-teal-300">✓</span> Todo lo del Básico
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-teal-300">✓</span> Telemedicina
                  Ilimitada
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-teal-300">✓</span> Pasarela de Pagos
                  Stripe
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-teal-300">✓</span> Módulo Comunidad
                  (PsiEduca)
                </li>
              </ul>
              <button className="w-full bg-white text-blue-900 hover:bg-gray-100 font-black py-3 rounded-xl transition shadow-lg">
                Comenzar 14 días Gratis
              </button>
            </div>

            {/* Plan Clínica */}
            <div className="bg-gray-800 rounded-3xl p-8 border border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                Clínica (Equipo)
              </h3>
              <div className="mb-6">
                <span className="text-5xl font-black">$129</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <p className="text-gray-400 mb-8 text-sm">
                Para centros psicológicos con recepcionista y múltiples
                especialistas.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Todo lo de
                  Profesional
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Panel de Secretaria
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Hasta 5 Psicólogos
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <span className="text-green-500">✓</span> Métricas Financieras
                  Avanzadas
                </li>
              </ul>
              <button className="w-full bg-gray-700 hover:bg-gray-600 font-bold py-3 rounded-xl transition">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center text-gray-500 font-medium">
        <p>© 2026 PsiClinic Software. Hecho con ❤️ para la Salud Mental.</p>
      </footer>
    </div>
  );
}

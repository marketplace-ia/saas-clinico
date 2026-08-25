import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col relative overflow-hidden">
      {/* Decoración de fondo abstracta */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-[40%] -left-20 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* Navbar Superior */}
      <header className="w-full px-6 py-5 flex justify-between items-center bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
            Ψ
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            PsiClinic.
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/login"
            className="text-gray-500 hover:text-blue-600 transition-colors hidden sm:block"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm font-bold"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section (Contenido Central) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 pt-16 pb-10">
        {/* Etiqueta Superior */}
        <span className="text-blue-600 font-black text-xs uppercase tracking-widest mb-6 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 shadow-sm inline-block">
          Plataforma Clínica Integral
        </span>

        {/* Titulo Principal */}
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 max-w-4xl tracking-tight leading-[1.1] mb-6">
          Tu bienestar mental, <br className="hidden md:block" />
          <span className="text-blue-600">a un clic de distancia.</span>
        </h1>

        {/* Descripción */}
        <p className="text-lg text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Gestiona tus citas, revisa tu historial clínico y mantente en contacto
          con tu especialista desde nuestra plataforma 100% segura y
          confidencial.
        </p>

        {/* Botones Principales */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto">
          <Link
            href="/registro"
            className="bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-transform w-full sm:w-auto text-center"
          >
            Empieza Ahora (Crear Cuenta)
          </Link>
          <Link
            href="/login"
            className="bg-white text-gray-800 font-bold text-lg px-8 py-4 rounded-full border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition w-full sm:w-auto text-center"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Enlace al panel de personal */}
        <Link
          href="/acceso-personal"
          className="text-gray-400 text-sm hover:text-gray-600 transition-colors underline underline-offset-4 mb-16 inline-block"
        >
          ¿Eres parte del equipo clínico? Accede a tu portal aquí
        </Link>

        {/* ============================================================ */}
        {/* 🔥 EL NUEVO BANNER LLAMATIVO PARA LA COMUNIDAD (PSI-EDUCA) 🔥 */}
        {/* ============================================================ */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-20 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          {/* CORRECCIÓN: rounded-3xl y p-1 */}
          <Link
            href="/comunidad"
            className="group relative block rounded-3xl p-1 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20 cursor-pointer"
          >
            {/* Borde con gradiente verde-azulado (Teal) */}
            <span className="absolute inset-0 bg-linear-to-r from-teal-400 via-emerald-300 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>

            {/* Contenido Interno de la Tarjeta */}
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 h-full w-full">
              <div className="flex items-center gap-6">
                {/* Icono grande (CORRECCIÓN: bg-linear-to-br) */}
                <div className="w-16 h-16 bg-linear-to-br from-teal-50 to-emerald-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner border border-teal-100/50">
                  🌿
                </div>

                {/* Textos */}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                      ¡NUEVO!
                    </span>
                    <h3 className="text-xl font-black text-gray-900 group-hover:text-teal-600 transition-colors">
                      Entorno de Aprendizaje
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md">
                    Explora talleres en vivo, lee artículos científicos y
                    descarga recursos clínicos gratuitos en nuestra nueva
                    comunidad.
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="w-full sm:w-auto bg-gray-900 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 group-hover:bg-teal-600 transition-colors shadow-md">
                  Explorar ahora
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                </span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

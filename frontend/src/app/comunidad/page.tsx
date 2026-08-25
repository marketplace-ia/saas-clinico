import Link from "next/link";

export default function ComunidadHubPage() {
  return (
    <div className="w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12">
        <Link
          href="/"
          className="text-teal-600 font-bold text-sm hover:underline mb-2 inline-block"
        >
          ← Volver a la Clínica
        </Link>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 mb-4 tracking-tight">
          Entorno de Aprendizaje
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Bienvenido a PsiEduca. Explora nuestros recursos, lee artículos
          clínicos y participa en talleres diseñados para tu bienestar mental y
          crecimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tarjeta Artículos */}
        <Link
          href="/comunidad/articulos"
          className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all group cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">
            📝
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artículos</h2>
          <p className="text-gray-500 mb-6">
            Investigaciones, guías y casos clínicos detallados.
          </p>
          <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Leer más{" "}
            <svg
              className="w-4 h-4"
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
        </Link>

        {/* Tarjeta Biblioteca */}
        <Link
          href="/comunidad/biblioteca"
          className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all group cursor-pointer"
        >
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">
            📚
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Biblioteca</h2>
          <p className="text-gray-500 mb-6">
            Descarga de plantillas y documentos clínicos validados.
          </p>
          <span className="text-teal-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Explorar{" "}
            <svg
              className="w-4 h-4"
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
        </Link>

        {/* Tarjeta Talleres */}
        <Link
          href="/comunidad/talleres"
          className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-orange-300 hover:shadow-xl transition-all group cursor-pointer"
        >
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform origin-left">
            🎟️
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Talleres</h2>
          <p className="text-gray-500 mb-6">
            Inscríbete a webinars y sesiones interactivas en vivo.
          </p>
          <span className="text-orange-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Ver agenda{" "}
            <svg
              className="w-4 h-4"
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
        </Link>
      </div>
    </div>
  );
}

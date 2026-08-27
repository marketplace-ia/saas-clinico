"use client";

export default function PsiEducaPage() {
  const recursos = [
    {
      id: 1,
      titulo: "Técnica de Respiración 4-7-8",
      categoria: "Meditación",
      tipo: "Audio",
      duracion: "5 min",
      icono: "🌬️",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      id: 2,
      titulo: "Diario de Gratitud Semanal",
      categoria: "Ejercicio",
      tipo: "PDF Interactivo",
      duracion: "10 min/día",
      icono: "📓",
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: 3,
      titulo: "Entendiendo la Ansiedad Social",
      categoria: "Psicoeducación",
      tipo: "Artículo",
      duracion: "8 min lectura",
      icono: "🧠",
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 4,
      titulo: "Relajación Muscular Progresiva",
      categoria: "Terapia Física",
      tipo: "Video",
      duracion: "15 min",
      icono: "🧘‍♀️",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Cabecera */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            PsiEduca <span className="text-4xl">🌿</span>
          </h1>
          <p className="text-gray-500">
            Recursos, herramientas y ejercicios guiados para tu bienestar mental
            diario.
          </p>
        </div>
      </div>

      {/* Recurso Destacado (Hero) */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-500 rounded-4xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="relative z-10 md:w-2/3">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-md border border-white/20">
            Recomendado para ti
          </span>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Guía Práctica: Primeros Auxilios Psicológicos
          </h2>
          <p className="text-emerald-50 mb-8 max-w-lg leading-relaxed text-sm md:text-base">
            Descubre herramientas inmediatas para calmar tu sistema nervioso
            durante episodios de estrés agudo o ataques de pánico.
          </p>
          <button className="bg-white text-teal-700 hover:bg-emerald-50 font-black py-3.5 px-8 rounded-xl transition shadow-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Comenzar Módulo (12 min)
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button className="bg-gray-900 text-white font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap shadow-sm">
          Todos los recursos
        </button>
        <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap transition">
          Meditación
        </button>
        <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap transition">
          Psicoeducación
        </button>
        <button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-2 px-5 rounded-full text-sm whitespace-nowrap transition">
          Ejercicios
        </button>
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recursos.map((recurso) => (
          <div
            key={recurso.id}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xs ${recurso.color}`}
            >
              {recurso.icono}
            </div>

            <div className="flex-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                {recurso.categoria}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                {recurso.titulo}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {recurso.duracion}
              </span>
              <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                {recurso.tipo}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer Médico */}
      <div className="mt-12 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4">
        <div className="text-2xl">ℹ️</div>
        <div>
          <h4 className="font-bold text-blue-900 mb-1">Nota importante</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed">
            Los recursos de PsiEduca están diseñados para complementar tu
            proceso terapéutico. En ningún caso sustituyen el consejo,
            diagnóstico o tratamiento psicológico profesional. Si experimentas
            una crisis, por favor contacta a tu terapeuta directamente o a los
            servicios de emergencia de tu localidad.
          </p>
        </div>
      </div>
    </div>
  );
}

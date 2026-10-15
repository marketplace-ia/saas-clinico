"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // 🟢 ESTA ES LA LÍNEA QUE FALTABA

interface Profesional {
  id: string;
  nombre: string;
  especialidad: string;
  enfoque: string;
  modalidad: string;
  verificado: boolean;
  color: string;
  bio: string;
  ciudad: string;
  conexiones: number;
}

export default function RedProfesionalPage() {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todos");

  const especialidades = [
    "Todos",
    "Psicología Clínica",
    "Neuropsicología",
    "Psicología Educativa",
    "Psicología Organizacional",
    "Psiquiatría",
    "Estudiantes",
  ];

  // MOCKS PREMIUM: Simulamos la base de datos de profesionales enriquecida
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);

  useEffect(() => {
    // Simulamos la carga desde Supabase
    setTimeout(() => {
      setProfesionales([
        {
          id: "prof-1",
          nombre: "Dra. Elena Silva",
          especialidad: "Psicología Clínica",
          enfoque: "Terapia Cognitivo Conductual (TCC)",
          modalidad: "Online y Presencial",
          verificado: true,
          color: "from-indigo-500 to-purple-600",
          bio: "Especialista en trastornos de ansiedad y depresión. Más de 10 años de experiencia clínica.",
          ciudad: "Quito, Ecuador",
          conexiones: 142,
        },
        {
          id: "prof-2",
          nombre: "Mgtr. Luis Paz",
          especialidad: "Psicología Organizacional",
          enfoque: "Clima Laboral y Liderazgo",
          modalidad: "Online",
          verificado: true,
          color: "from-blue-500 to-cyan-600",
          bio: "Consultor corporativo enfocado en el bienestar de los equipos y la resolución de conflictos.",
          ciudad: "Ibarra, Ecuador",
          conexiones: 89,
        },
        {
          id: "prof-3",
          nombre: "Ana Torres",
          especialidad: "Estudiantes",
          enfoque: "Evaluación y Rehabilitación",
          modalidad: "Presencial",
          verificado: false,
          color: "from-emerald-400 to-teal-500",
          bio: "Evaluación neuropsicológica en niños y adultos. Estudiante de último semestre enfocada en diagnóstico temprano.",
          ciudad: "Guayaquil, Ecuador",
          conexiones: 34,
        },
        {
          id: "prof-4",
          nombre: "Dr. Juan Vega",
          especialidad: "Psiquiatría",
          enfoque: "Psiquiatría General",
          modalidad: "Online y Presencial",
          verificado: true,
          color: "from-amber-400 to-orange-500",
          bio: "Tratamiento farmacológico integrativo. Enfoque centrado en la calidad de vida del paciente.",
          ciudad: "Cuenca, Ecuador",
          conexiones: 215,
        },
      ]);
      setCargando(false);
    }, 800);
  }, []);

  // Motor de filtrado en tiempo real
  const profesionalesFiltrados = profesionales.filter((prof) => {
    const coincideBusqueda =
      prof.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.enfoque.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecialidad =
      filtroEspecialidad === "Todos" ||
      prof.especialidad === filtroEspecialidad;
    return coincideBusqueda && coincideEspecialidad;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* 1. CABECERA Y BUSCADOR PREMIUM */}
      <div className="bg-slate-900 rounded-4xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-30 translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Directorio Profesional
          </h1>
          <p className="text-slate-300 text-lg font-medium mb-8">
            Encuentra y conecta con especialistas verificados o busca colegas
            para networking académico.
          </p>

          {/* Barra de Búsqueda Integrada */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, enfoque, trastorno o ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/20 transition-all font-medium text-white placeholder-slate-400 shadow-inner backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0 border-b border-transparent md:border-b-0">
          {especialidades.map((esp) => (
            <button
              key={esp}
              onClick={() => setFiltroEspecialidad(esp)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                filtroEspecialidad === esp
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {esp}
            </button>
          ))}
        </div>
        <p className="text-slate-500 font-bold text-sm shrink-0">
          {profesionalesFiltrados.length} perfiles encontrados
        </p>
      </div>

      {/* 3. ESTADO DE CARGA */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
            Cargando perfiles...
          </p>
        </div>
      ) : (
        /* 4. CUADRÍCULA DE PERFILES */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profesionalesFiltrados.map((prof) => (
            <div
              key={prof.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col group"
            >
              {/* Banner Superior del Perfil */}
              <div
                className={`h-24 w-full bg-linear-to-r ${prof.color} relative`}
              >
                {/* Botón Flotante de Conexiones */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 text-white text-xs font-bold shadow-sm">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {prof.conexiones}
                </div>
              </div>

              <div className="px-6 pb-6 flex-1 flex flex-col relative">
                {/* Avatar Circular Solapado */}
                <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 shadow-md absolute -top-10 left-6">
                  {prof.nombre.charAt(0)}
                </div>

                <div className="mt-12 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {prof.nombre}
                    </h3>
                    {prof.verificado && (
                      <div
                        className="text-emerald-500"
                        title="Profesional Verificado por Clinesfera"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">
                    {prof.especialidad}
                  </p>

                  <p className="text-slate-500 text-sm line-clamp-3 mb-5 leading-relaxed">
                    {prof.bio}
                  </p>

                  <div className="flex flex-col gap-2.5 mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      {prof.enfoque}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      {prof.ciudad}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
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
                      {prof.modalidad}
                    </div>
                  </div>
                </div>

                {/* 🟢 CORRECCIÓN APLICADA: Ahora es un Link de Next.js */}
                <div className="mt-auto pt-5 border-t border-slate-100 flex gap-2">
                  <Link
                    href={`/comunidad/profesionales/${prof.id}`}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 text-center font-bold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Ver Perfil
                  </Link>
                  {prof.verificado && (
                    <button className="flex-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold py-2.5 rounded-xl transition-colors text-sm shadow-sm">
                      Agendar Cita
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO VACÍO */}
      {!cargando && profesionalesFiltrados.length === 0 && (
        <div className="bg-white rounded-4xl p-16 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto mt-10">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            No se encontraron especialistas
          </h3>
          <p className="text-slate-500 font-medium">
            Prueba buscando con otros términos o seleccionando otra
            especialidad.
          </p>
          <button
            onClick={() => {
              setBusqueda("");
              setFiltroEspecialidad("Todos");
            }}
            className="mt-6 text-indigo-600 font-bold bg-indigo-50 px-6 py-2.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

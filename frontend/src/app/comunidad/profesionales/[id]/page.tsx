"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Definimos los tipos para TypeScript
interface Articulo {
  id: number;
  titulo: string;
  fecha: string;
  lectura: string;
  categoria: string;
}

interface Evento {
  id: number;
  titulo: string;
  fecha: string;
  modalidad: string;
  precio: string;
}

interface Perfil {
  id: string;
  nombre: string;
  rol: string;
  especialidad: string;
  avatar: string;
  verificado: boolean;
  colorBanner: string;
  bio: string;
  ciudad: string;
  modalidad: string;
  conexiones: number;
  enfoque: string;
  formacion: { titulo: string; institucion: string; año: string }[];
  experiencia: { cargo: string; lugar: string; periodo: string }[];
  intereses: string[];
  articulos: Articulo[];
  eventos: Evento[];
}

export default function PerfilPublicoPage() {
  const params = useParams(); // Para obtener el ID de la URL
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState<
    "perfil" | "articulos" | "eventos"
  >("perfil");

  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Simulamos la carga de la Base de Datos usando el ID del profesional
  useEffect(() => {
    // Aquí en el futuro harás: supabase.from('perfiles').select('*').eq('id', params.id)
    setTimeout(() => {
      setPerfil({
        id: (params?.id as string) || "prof-1",
        nombre: "Dra. Elena Silva",
        rol: "Psicóloga Clínica",
        especialidad: "Psicología Clínica",
        avatar: "E",
        verificado: true,
        colorBanner: "from-indigo-500 to-purple-600",
        bio: "Especialista en trastornos de ansiedad y depresión con un enfoque en Terapia Cognitivo Conductual. Mi objetivo es proporcionar un espacio seguro y basado en evidencia para el bienestar emocional de mis pacientes. Comprometida con la divulgación científica y la salud mental accesible.",
        ciudad: "Quito, Ecuador",
        modalidad: "Online y Presencial",
        conexiones: 142,
        enfoque: "Terapia Cognitivo Conductual (TCC)",
        formacion: [
          {
            titulo: "Maestría en Psicología Clínica",
            institucion: "Universidad San Francisco de Quito",
            año: "2020",
          },
          {
            titulo: "Licenciatura en Psicología",
            institucion: "Pontificia Universidad Católica del Ecuador",
            año: "2016",
          },
        ],
        experiencia: [
          {
            cargo: "Psicóloga Clínica Senior",
            lugar: "Centro de Bienestar Integral",
            periodo: "2021 - Presente",
          },
          {
            cargo: "Terapeuta",
            lugar: "Hospital Metropolitano",
            periodo: "2018 - 2021",
          },
        ],
        intereses: ["Ansiedad", "Depresión", "TCC", "Regulación Emocional"],
        articulos: [
          {
            id: 1,
            titulo:
              "Avances en la Terapia Cognitivo Conductual para Ansiedad Generalizada",
            fecha: "Hace 2 días",
            lectura: "5 min",
            categoria: "Clínica",
          },
          {
            id: 2,
            titulo: "Técnicas de grounding para ataques de pánico",
            fecha: "Hace 1 mes",
            lectura: "3 min",
            categoria: "Divulgación",
          },
        ],
        eventos: [
          {
            id: 1,
            titulo: "Taller Práctico: Regulación Emocional en el Día a Día",
            fecha: "15 Oct 2026",
            modalidad: "Virtual",
            precio: "Gratuito",
          },
        ],
      });
      setCargando(false);
    }, 800);
  }, [params]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
          Cargando perfil profesional...
        </p>
      </div>
    );
  }

  if (!perfil)
    return (
      <div className="text-center py-20 text-slate-500 font-bold">
        Perfil no encontrado.
      </div>
    );

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 max-w-5xl mx-auto pb-12">
      {/* 1. BOTÓN VOLVER */}
      <Link
        href="/comunidad/profesionales"
        className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors mb-6 bg-indigo-50 px-4 py-2 rounded-xl"
      >
        <span aria-hidden="true">&larr;</span> Volver al Directorio
      </Link>

      {/* 2. TARJETA PRINCIPAL DEL PERFIL */}
      <div className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 mb-8 relative">
        {/* Banner */}
        <div
          className={`h-40 md:h-48 w-full bg-linear-to-r ${perfil.colorBanner} relative`}
        >
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Info Solapada */}
        <div className="px-8 md:px-12 pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 mb-8">
            <div className="flex items-end gap-5">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-5xl md:text-6xl font-black text-slate-400 shadow-lg shrink-0">
                {perfil.nombre.charAt(0)}
              </div>
              <div className="pb-2 md:pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
                    {perfil.nombre}
                  </h1>
                  {perfil.verificado && (
                    <div
                      className="text-emerald-500"
                      title="Profesional Verificado"
                    >
                      <svg
                        className="w-6 h-6 md:w-8 md:h-8"
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
                <p className="text-indigo-600 font-bold text-lg">
                  {perfil.rol}
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
                Conectar
              </button>
              {perfil.verificado && (
                <button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md">
                  Agendar Cita
                </button>
              )}
            </div>
          </div>

          {/* Detalles Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Ubicación
              </p>
              <p className="text-slate-900 font-bold text-sm">
                {perfil.ciudad}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Modalidad
              </p>
              <p className="text-slate-900 font-bold text-sm">
                {perfil.modalidad}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Enfoque
              </p>
              <p className="text-slate-900 font-bold text-sm">
                {perfil.enfoque}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Red
              </p>
              <p className="text-indigo-600 font-black text-sm">
                {perfil.conexiones} conexiones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVEGACIÓN INTERNA (Tabs) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setPestanaActiva("perfil")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${pestanaActiva === "perfil" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Perfil Profesional
        </button>
        <button
          onClick={() => setPestanaActiva("articulos")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${pestanaActiva === "articulos" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
        >
          Artículos{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {perfil.articulos.length}
          </span>
        </button>
        <button
          onClick={() => setPestanaActiva("eventos")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${pestanaActiva === "eventos" ? "bg-teal-600 text-white shadow-md" : "text-slate-500 hover:bg-teal-50 hover:text-teal-600"}`}
        >
          Eventos{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {perfil.eventos.length}
          </span>
        </button>
      </div>

      {/* 4. CONTENIDO DE LAS PESTAÑAS */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {/* PESTAÑA: PERFIL CV */}
        {pestanaActiva === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-4">
                  Acerca de
                </h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {perfil.bio}
                </p>
              </section>

              <section className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Experiencia Clínica
                </h2>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {perfil.experiencia.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900">
                          {exp.cargo}
                        </h3>
                        <p className="text-indigo-600 text-sm font-bold mb-2">
                          {exp.lugar}
                        </p>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          {exp.periodo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                    />
                  </svg>
                  Formación Académica
                </h2>
                <div className="space-y-4">
                  {perfil.formacion.map((form, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-5 rounded-2xl border border-slate-100"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {form.titulo}
                          </h3>
                          <p className="text-slate-600 text-sm font-medium">
                            {form.institucion}
                          </p>
                        </div>
                        <span className="bg-white border border-slate-200 text-slate-500 text-xs font-black px-3 py-1 rounded-lg shrink-0">
                          {form.año}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm sticky top-28">
                <h2 className="text-lg font-black text-slate-900 mb-4">
                  Especialidades e Intereses
                </h2>
                <div className="flex flex-wrap gap-2">
                  {perfil.intereses.map((interes, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-indigo-100"
                    >
                      {interes}
                    </span>
                  ))}
                </div>

                <hr className="my-6 border-slate-100" />

                <h2 className="text-lg font-black text-slate-900 mb-4">
                  Información de Contacto
                </h2>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors mb-3">
                  Enviar Mensaje Directo
                </button>
                <div className="text-center text-xs font-bold text-slate-400">
                  Responde usualmente en 24h
                </div>
              </section>
            </div>
          </div>
        )}

        {/* PESTAÑA: ARTÍCULOS PUBLICADOS */}
        {pestanaActiva === "articulos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perfil.articulos.length === 0 ? (
              <p className="text-slate-500 font-medium col-span-full bg-white p-10 text-center rounded-3xl border border-slate-100">
                El profesional aún no ha publicado artículos.
              </p>
            ) : (
              perfil.articulos.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                >
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-3 bg-indigo-50 self-start px-2.5 py-1 rounded-md">
                    {art.categoria}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mb-4 leading-snug group-hover:text-indigo-600 transition-colors">
                    {art.titulo}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>{art.fecha}</span>
                    <span>{art.lectura} lectura</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PESTAÑA: EVENTOS */}
        {pestanaActiva === "eventos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perfil.eventos.length === 0 ? (
              <p className="text-slate-500 font-medium col-span-full bg-white p-10 text-center rounded-3xl border border-slate-100">
                No hay eventos programados próximamente.
              </p>
            ) : (
              perfil.eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-teal-200 transition-colors cursor-pointer group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 text-slate-600 text-xs font-black uppercase px-3 py-1.5 rounded-lg">
                      {evento.fecha}
                    </span>
                    <span
                      className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg ${evento.precio === "Gratuito" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {evento.precio}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-teal-600 transition-colors">
                    {evento.titulo}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-400"></span>{" "}
                      {evento.modalidad}
                    </span>
                    <button className="text-teal-600 font-bold text-sm hover:underline">
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

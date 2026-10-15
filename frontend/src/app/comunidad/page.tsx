"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";

interface Taller {
  id: string;
  titulo: string;
  fecha_hora: string;
  modalidad: string;
  precio: number;
}

interface PostComunidad {
  id: string;
  titulo: string;
  contenido: string;
  creado_el: string;
  perfil_psicologo: { nombre_completo: string } | null;
}

interface RawPost {
  id: string;
  titulo: string;
  contenido: string;
  creado_el: string;
}

// 🟢 BARO NGA INTERFACE: Para iti Artikulo a naggapu iti DB
interface Articulo {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  tiempo_lectura: string;
  imagen_color: string;
  creado_el: string;
}

export default function ComunidadExplorarPage() {
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const [eventos, setEventos] = useState<Taller[]>([]);
  const [conversaciones, setConversaciones] = useState<PostComunidad[]>([]);

  // 🟢 KINIKKAT TI HARDCODED STATE: Ita ket maysa a nadalus nga awan linaonna nga array
  const [articulos, setArticulos] = useState<Articulo[]>([]);

  const [nuevoDebate, setNuevoDebate] = useState({
    pregunta: "",
    tag: "Debate Clínico",
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      // 1. Kargaen dagiti Artikulo
      const { data: dataArticulos } = await supabase
        .from("articulos_comunidad")
        .select("*")
        .order("creado_el", { ascending: false })
        .limit(2);

      if (dataArticulos) setArticulos(dataArticulos);

      // 2. Kargaen dagiti Pasken
      const { data: dataEventos } = await supabase
        .from("talleres")
        .select("id, titulo, fecha_hora, modalidad, precio")
        .eq("estado", "activo")
        .order("fecha_hora", { ascending: true })
        .limit(3);

      if (dataEventos) setEventos(dataEventos);

      // 3. Kargaen dagiti Post iti Komunidad
      const { data: dataPosts } = await supabase
        .from("comunidad_posts")
        .select("id, titulo, contenido, creado_el")
        .eq("estado", "publicado")
        .order("creado_el", { ascending: false });

      if (dataPosts) {
        const postsFormateados = dataPosts.map((p: RawPost) => ({
          ...p,
          perfil_psicologo: { nombre_completo: "Miembro de la Comunidad" },
        }));
        setConversaciones(postsFormateados as PostComunidad[]);
      }
    } catch (error) {
      console.error("Error cargando comunidad:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciar = async () => {
      await cargarDatos();
    };
    iniciar();
  }, [cargarDatos]);

  const handlePublicarDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublicando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Debes iniciar sesión para publicar en la comunidad.");
        return;
      }

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .single();

      if (!tu) {
        alert("Solo los profesionales pueden abrir debates actualmente.");
        return;
      }

      const { error } = await supabase.from("comunidad_posts").insert({
        tenant_id: tu.tenant_id,
        psicologo_id: session.user.id,
        titulo: nuevoDebate.tag,
        contenido: nuevoDebate.pregunta,
        estado: "publicado",
      });

      if (error) throw error;

      setModalAbierto(false);
      setNuevoDebate({ pregunta: "", tag: "Debate Clínico" });
      cargarDatos();
    } catch (error) {
      console.error("Error al publicar:", error);
      alert("Hubo un error al publicar tu debate.");
    } finally {
      setPublicando(false);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 space-y-16 pb-12">
      <section className="relative bg-slate-900 rounded-4xl p-10 md:p-16 lg:p-20 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-indigo-500/30 to-purple-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-indigo-200 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/10 mb-6">
            Ecosistema Profesional
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Conecta. Aprende. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-teal-300">
              Comparte conocimiento.
            </span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium mb-10 max-w-xl leading-relaxed">
            Una comunidad diseñada para profesionales, estudiantes y mentes
            curiosas interesadas en comprender mejor el comportamiento humano y
            el bienestar.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/comunidad/articulos"
              className="bg-white hover:bg-slate-50 text-slate-900 font-black px-8 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1 text-center"
            >
              Explorar Artículos
            </Link>
            <Link
              href="/comunidad/grupos"
              className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-100 border border-purple-500/30 font-bold px-6 py-4 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2"
            >
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Grupos
            </Link>
            <Link
              href="/comunidad/convocatorias"
              className="bg-teal-600/20 hover:bg-teal-600/40 text-teal-100 border border-teal-500/30 font-bold px-6 py-4 rounded-2xl backdrop-blur-md transition-all flex items-center gap-2"
            >
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Convocatorias
            </Link>
          </div>
        </div>
      </section>

      {/* 🟢 SECCIÓN DE LECTURAS (Dinamikoon a naggapu iti DB) */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Lecturas Recomendadas
            </h2>
            <p className="text-slate-500 font-medium">
              Artículos clínicos y divulgativos tendencia.
            </p>
          </div>
        </div>

        {articulos.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">
              Nuevos artículos próximamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articulos.map((art) => (
              <div
                key={art.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col sm:flex-row gap-6 cursor-pointer"
              >
                <div
                  className={`w-full sm:w-40 h-48 sm:h-auto rounded-2xl ${art.imagen_color || "bg-slate-100"} shrink-0`}
                ></div>
                <div className="flex flex-col flex-1 py-1">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">
                    {art.categoria}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                    {art.titulo}
                  </h3>
                  <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                      {art.autor.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">
                        {art.autor}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {new Date(art.creado_el).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {art.tiempo_lectura}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 bg-slate-50 rounded-4xl p-8 border border-slate-100 h-fit">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900">
              Próximos Eventos
            </h2>
          </div>

          <div className="space-y-4">
            {eventos.length === 0 ? (
              <p className="text-slate-500 text-sm font-bold text-center py-10">
                No hay eventos programados.
              </p>
            ) : (
              eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                      {new Date(evento.fecha_hora).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${Number(evento.precio) === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {Number(evento.precio) === 0
                        ? "Gratuito"
                        : `$${evento.precio}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {evento.titulo}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>{" "}
                    {evento.modalidad}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                Muro Comunitario
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                Debates, networking y preguntas abiertas.
              </p>
            </div>
            <button
              onClick={() => setModalAbierto(true)}
              className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors shadow-md shrink-0"
            >
              Crear Debate
            </button>
          </div>

          <div className="space-y-4">
            {conversaciones.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">
                  Sé el primero en iniciar un debate en la comunidad.
                </p>
              </div>
            ) : (
              conversaciones.map((conv) => (
                <div
                  key={conv.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-black text-indigo-600 shadow-inner">
                      {conv.perfil_psicologo?.nombre_completo?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {conv.perfil_psicologo?.nombre_completo || "Usuario"}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {conv.titulo}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-800 font-medium text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                    {conv.contenido}
                  </p>
                  <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(conv.creado_el).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-4xl w-full max-w-xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Crear Debate
                </h2>
                <p className="text-slate-500 text-xs font-bold mt-1">
                  Comparte con profesionales y estudiantes.
                </p>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              onSubmit={handlePublicarDebate}
              className="p-6 md:p-8 space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Categoría
                </label>
                <select
                  value={nuevoDebate.tag}
                  onChange={(e) =>
                    setNuevoDebate({ ...nuevoDebate, tag: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium text-sm"
                >
                  <option value="Debate Clínico">🧠 Debate Clínico</option>
                  <option value="Estudiantes">🎓 Estudiantes</option>
                  <option value="Networking">🤝 Networking</option>
                  <option value="Investigación">🔬 Investigación</option>
                </select>
              </div>
              <div>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe tu pregunta o idea..."
                  value={nuevoDebate.pregunta}
                  onChange={(e) =>
                    setNuevoDebate({ ...nuevoDebate, pregunta: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium text-sm resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={publicando || !nuevoDebate.pregunta.trim()}
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center min-w-32"
                >
                  {publicando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Publicar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

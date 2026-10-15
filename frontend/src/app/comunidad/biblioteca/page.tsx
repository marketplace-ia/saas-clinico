"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Documento {
  id: number;
  titulo: string;
  tipo: string;
  tamaño: string;
  acceso: string;
  descripcion: string;
}

// 🟢 TIPO ESTRICTO PARA EVITAR EL USO DE 'any'
type FiltroFavorito = "todos" | "articulos" | "eventos" | "debates";

export default function BibliotecaComunidadPage() {
  const [pestanaActiva, setPestanaActiva] = useState<"favoritos" | "recursos">(
    "favoritos",
  );

  // 🟢 ESTADOS DE LA PESTAÑA: FAVORITOS
  const [filtroFavoritos, setFiltroFavoritos] =
    useState<FiltroFavorito>("todos");
  const opcionesFiltros: FiltroFavorito[] = [
    "todos",
    "articulos",
    "eventos",
    "debates",
  ];

  const [favoritos, setFavoritos] = useState([
    {
      id: "fav-1",
      tipo: "articulos",
      etiqueta: "Artículo",
      titulo: "El impacto del uso excesivo de pantallas en el neurodesarrollo",
      autor: "Mgtr. Carlos Ruiz",
      fecha: "Hace 5 días",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      id: "fav-2",
      tipo: "eventos",
      etiqueta: "Evento",
      titulo: "Simposio Internacional: Salud Mental Universitaria",
      autor: "Clinesfera Eventos",
      fecha: "25 Octubre 2026",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "fav-3",
      tipo: "debates",
      etiqueta: "Debate",
      titulo: "Experiencias realizando la primera entrevista clínica",
      autor: "Ana Torres",
      fecha: "Hace 5 horas",
      color: "bg-amber-100 text-amber-700",
    },
  ]);

  // 🟢 ESTADOS DE LA PESTAÑA: RECURSOS (Conectado a Supabase)
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtroRecursos, setFiltroRecursos] = useState("Todos");
  const filtrosDocs = ["Todos", "PDF", "DOCX", "XLSX", "Media"];

  // 1. CARGA DE BASE DE DATOS PARA RECURSOS
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: rolData } = await supabase
            .from("roles_usuarios")
            .select("rol")
            .eq("correo", user.email)
            .maybeSingle();

          if (rolData) setRolUsuario(rolData.rol);
        }

        const { data: datosBD, error } = await supabase
          .from("documentos")
          .select("*")
          .order("id", { ascending: true });

        if (error) console.error("Error consultando documentos:", error);
        if (datosBD) setDocumentos(datosBD);
      } catch (error) {
        console.error("Error al cargar la base de datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 2. LÓGICA DE PERMISOS
  const tieneAcceso = (nivelAcceso: string) => {
    if (nivelAcceso === "publico") return true;
    if (
      nivelAcceso === "restringido" &&
      (rolUsuario === "psicologo" || rolUsuario === "secretaria")
    )
      return true;
    return false;
  };

  // 3. FILTROS Y ACCIONES
  const favoritosFiltrados = favoritos.filter(
    (fav) => filtroFavoritos === "todos" || fav.tipo === filtroFavoritos,
  );
  const documentosFiltrados =
    filtroRecursos === "Todos"
      ? documentos
      : documentos.filter((doc) =>
          doc.tipo.toUpperCase().includes(filtroRecursos),
        );

  const eliminarFavorito = (id: string) => {
    setFavoritos(favoritos.filter((f) => f.id !== id));
  };

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 space-y-12">
      {/* ==========================================
          1. HERO SECTION PREMIUM
          ========================================== */}
      <div className="bg-slate-900 rounded-4xl p-10 md:p-14 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-2xl">
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-indigo-300 font-bold text-sm hover:text-white transition-colors mb-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <span aria-hidden="true">&larr;</span> Volver al Explorador
          </Link>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Biblioteca Clínica
          </h1>
          <p className="text-slate-300 text-lg font-medium">
            Tu colección personal de conocimiento. Gestiona tus artículos
            guardados, eventos próximos y descarga recursos para tu práctica
            profesional.
          </p>
        </div>

        {/* CONTROLES DE PESTAÑAS PRINCIPALES */}
        <div className="relative z-10 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col sm:flex-row w-full md:w-auto shrink-0 gap-1 sm:gap-0">
          <button
            onClick={() => setPestanaActiva("favoritos")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              pestanaActiva === "favoritos"
                ? "bg-white text-slate-900 shadow-md"
                : "text-white hover:bg-white/10"
            }`}
          >
            Mis Guardados
          </button>
          <button
            onClick={() => setPestanaActiva("recursos")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              pestanaActiva === "recursos"
                ? "bg-white text-slate-900 shadow-md"
                : "text-white hover:bg-white/10"
            }`}
          >
            Recursos Oficiales
          </button>
        </div>
      </div>

      {/* ==========================================
          2. PESTAÑA: MIS GUARDADOS (Favoritos)
          ========================================== */}
      {pestanaActiva === "favoritos" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {opcionesFiltros.map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroFavoritos(filtro)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-colors whitespace-nowrap border ${
                  filtroFavoritos === filtro
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filtro}
              </button>
            ))}
          </div>

          {favoritosFiltrados.length === 0 ? (
            <div className="bg-white rounded-4xl p-16 text-center border border-slate-200 shadow-sm">
              <div className="text-4xl mb-4">📌</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                No hay elementos guardados
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Explora la comunidad y utiliza el botón &quot;Guardar&quot; para
                construir tu biblioteca personal.
              </p>
              <Link
                href="/comunidad"
                className="inline-block mt-6 bg-indigo-50 text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Explorar Comunidad
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.color}`}
                    >
                      {item.etiqueta}
                    </span>
                    <button
                      onClick={() => eliminarFavorito(item.id)}
                      className="text-indigo-600 hover:text-red-500 transition-colors p-1"
                      title="Quitar de guardados"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.titulo}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>{item.autor}</span>
                    <span>{item.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          3. PESTAÑA: RECURSOS (Conectado a BD)
          ========================================== */}
      {pestanaActiva === "recursos" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto pb-2 sm:pb-0">
              {filtrosDocs.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroRecursos(f)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                    filtroRecursos === f
                      ? "bg-teal-600 text-white border-teal-600 shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-teal-200 hover:bg-teal-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {!cargando && rolUsuario === "psicologo" && (
              <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                Subir Documento
              </button>
            )}
          </div>

          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-4xl border border-slate-100">
              <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
                Desencriptando biblioteca segura...
              </p>
            </div>
          ) : documentosFiltrados.length === 0 ? (
            <div className="bg-white rounded-4xl p-16 text-center border border-slate-100 shadow-sm mt-6">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                No se encontraron documentos
              </h3>
              <p className="text-slate-500 font-medium">
                No hay recursos disponibles para el filtro &quot;
                {filtroRecursos}&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {documentosFiltrados.map((doc) => {
                const permitido = tieneAcceso(doc.acceso);

                return (
                  <div
                    key={doc.id}
                    className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col sm:flex-row items-start gap-5 ${
                      permitido
                        ? "border-slate-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 group"
                        : "border-slate-100 opacity-90 bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${
                        doc.tipo.includes("PDF")
                          ? "bg-rose-50 text-rose-600"
                          : doc.tipo.includes("DOC")
                            ? "bg-blue-50 text-blue-600"
                            : doc.tipo.includes("XLS")
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-600"
                      } ${!permitido && "grayscale opacity-60"}`}
                    >
                      {doc.tipo}
                    </div>

                    <div className="flex-1 min-w-0 w-full flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3
                          className={`font-black text-lg leading-tight truncate ${permitido ? "text-slate-900 group-hover:text-teal-600 transition-colors" : "text-slate-500"}`}
                        >
                          {doc.titulo}
                        </h3>

                        {doc.acceso === "restringido" && (
                          <span className="shrink-0 bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
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
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                              ></path>
                            </svg>
                            Uso Clínico
                          </span>
                        )}
                      </div>

                      <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                        {doc.descripcion}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                          {doc.tamaño}
                        </span>

                        {permitido ? (
                          <button className="text-teal-700 font-bold flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors text-sm shadow-sm">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              ></path>
                            </svg>
                            Descargar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-slate-400 font-bold flex items-center gap-1.5 bg-slate-100 px-4 py-2 rounded-xl cursor-not-allowed text-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                              ></path>
                            </svg>
                            Bloqueado
                          </button>
                        )}
                      </div>
                    </div>

                    {!permitido && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] rounded-3xl z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
                          Requiere verificación profesional
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

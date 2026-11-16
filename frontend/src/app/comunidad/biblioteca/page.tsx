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

export default function BibliotecaComunidadPage() {
  const [pestanaActiva, setPestanaActiva] = useState<"favoritos" | "recursos">(
    "favoritos",
  );

  // 🟢 CORRECCIÓN LINTER: Se eliminaron variables no utilizadas de "favoritos" (filtroFavoritos, opcionesFiltros, etc)
  const filtrosDocs = ["Todos", "PDF", "DOCX", "XLSX", "Media"];

  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtroRecursos, setFiltroRecursos] = useState("Todos");
  const [errorBD, setErrorBD] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    const cargarDatos = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email && montado) {
          const { data: rolData } = await supabase
            .from("roles_usuarios")
            .select("rol")
            .eq("correo", user.email)
            .maybeSingle();

          if (rolData) setRolUsuario(rolData.rol);
        }

        const { data: datosBD, error } = await supabase
          .from("documentos_biblioteca")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (montado && datosBD) {
          setDocumentos(datosBD as Documento[]);
          setErrorBD(null);
        }
      } catch (error: unknown) {
        if (montado) {
          console.error("Error BD Biblioteca:", error);
          setErrorBD(
            "No se pudieron cargar los recursos oficiales. Verifica la base de datos.",
          );
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarDatos();
    return () => {
      montado = false;
    };
  }, []);

  const tieneAcceso = (nivelAcceso: string) => {
    if (nivelAcceso === "publico") return true;
    if (
      nivelAcceso === "restringido" &&
      (rolUsuario === "psicologo" || rolUsuario === "secretaria")
    )
      return true;
    return false;
  };

  const documentosFiltrados =
    filtroRecursos === "Todos"
      ? documentos
      : documentos.filter((doc) =>
          doc.tipo.toUpperCase().includes(filtroRecursos),
        );

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 space-y-12">
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

        <div className="relative z-10 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 flex flex-col sm:flex-row w-full md:w-auto shrink-0 gap-1 sm:gap-0">
          <button
            onClick={() => setPestanaActiva("favoritos")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${pestanaActiva === "favoritos" ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/10"}`}
          >
            Mis Guardados
          </button>
          <button
            onClick={() => setPestanaActiva("recursos")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all ${pestanaActiva === "recursos" ? "bg-white text-slate-900 shadow-md" : "text-white hover:bg-white/10"}`}
          >
            Recursos Oficiales
          </button>
        </div>
      </div>

      {pestanaActiva === "favoritos" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-4xl p-16 text-center border border-slate-200 shadow-sm mt-6">
            <div className="text-4xl mb-4">📌</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              No hay elementos guardados
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              Esta función estará disponible en la próxima actualización. Por
              ahora, explora nuestros recursos oficiales.
            </p>
            <button
              onClick={() => setPestanaActiva("recursos")}
              className="inline-block mt-6 bg-indigo-50 text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Ir a Recursos Oficiales
            </button>
          </div>
        </div>
      )}

      {pestanaActiva === "recursos" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto pb-2 sm:pb-0">
              {filtrosDocs.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroRecursos(f)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filtroRecursos === f ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-teal-200 hover:bg-teal-50"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {errorBD && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 text-sm">
              🚨 {errorBD}
            </div>
          )}

          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-4xl border border-slate-100">
              <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
                Desencriptando biblioteca...
              </p>
            </div>
          ) : documentosFiltrados.length === 0 && !errorBD ? (
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
              {/* 🟢 CORRECCIÓN LINTER: Comillas escapadas con &quot; */}
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
                    className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col sm:flex-row items-start gap-5 ${permitido ? "border-slate-100 hover:border-teal-200 hover:shadow-xl hover:-translate-y-1 group" : "border-slate-100 opacity-90 bg-slate-50/50"}`}
                  >
                    <div
                      className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${doc.tipo.includes("PDF") ? "bg-rose-50 text-rose-600" : doc.tipo.includes("DOC") ? "bg-blue-50 text-blue-600" : doc.tipo.includes("XLS") ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"} ${!permitido && "grayscale opacity-60"}`}
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
                          <span className="shrink-0 bg-slate-100 text-slate-500 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-slate-200">
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
                          <button className="text-teal-700 font-bold bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl text-sm">
                            Descargar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="text-slate-400 font-bold bg-slate-100 px-4 py-2 rounded-xl text-sm"
                          >
                            Bloqueado
                          </button>
                        )}
                      </div>
                    </div>
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

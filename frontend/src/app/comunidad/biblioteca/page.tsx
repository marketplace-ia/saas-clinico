"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

// Definimos la estructura exacta que viene de Supabase
interface Documento {
  id: number;
  titulo: string;
  tipo: string;
  tamaño: string;
  acceso: string;
  descripcion: string;
}

export default function BibliotecaComunidadPage() {
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Nuestro nuevo estado dinámico
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // A. Verificamos quién está viendo la página
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: rolData } = await supabase
            .from("roles_usuarios")
            .select("rol")
            .eq("correo", user.email)
            .maybeSingle();

          if (rolData) {
            setRolUsuario(rolData.rol);
          }
        }

        // B. Traemos los documentos reales de Supabase
        const { data: datosBD, error } = await supabase
          .from("documentos")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error consultando documentos:", error);
        }

        if (datosBD) {
          setDocumentos(datosBD);
        }
      } catch (error) {
        console.error("Error al cargar la base de datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // La lógica del candado se mantiene intacta
  const tieneAcceso = (nivelAcceso: string) => {
    if (nivelAcceso === "publico") return true;
    if (
      nivelAcceso === "restringido" &&
      (rolUsuario === "psicologo" || rolUsuario === "secretaria")
    )
      return true;
    return false;
  };

  return (
    <div className="w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <Link
            href="/comunidad"
            className="text-teal-600 font-bold text-sm hover:underline mb-2 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-2 mb-2">
            Biblioteca de Recursos
          </h1>
          <p className="text-gray-500 text-lg">
            Descarga material de apoyo, plantillas y documentos clínicos
            validados.
          </p>
        </div>

        {!cargando && rolUsuario === "psicologo" && (
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap">
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              ></path>
            </svg>
            Subir Documento
          </button>
        )}
      </div>

      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Cargando biblioteca segura...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {documentos.map((doc) => {
            const permitido = tieneAcceso(doc.acceso);

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex items-start gap-5 ${
                  permitido
                    ? "border-gray-200 hover:border-teal-300 hover:shadow-md cursor-pointer group"
                    : "border-gray-100 opacity-75 grayscale-20"
                }`}
              >
                <div
                  className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${
                    doc.tipo === "PDF"
                      ? "bg-red-50 text-red-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {doc.tipo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-bold truncate pr-2 ${permitido ? "text-gray-900 group-hover:text-teal-600" : "text-gray-500"}`}
                    >
                      {doc.titulo}
                    </h3>
                    {doc.acceso === "restringido" && (
                      <span className="shrink-0 bg-gray-100 text-gray-500 text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
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
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {doc.descripcion}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-gray-400">
                      {doc.tamaño}
                    </span>

                    {permitido ? (
                      <button className="text-teal-600 hover:text-teal-800 text-sm font-bold flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>
                        Descargar
                      </button>
                    ) : (
                      <button
                        disabled
                        className="text-gray-400 text-sm font-bold flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-lg cursor-not-allowed"
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
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                          ></path>
                        </svg>
                        Bloqueado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {documentos.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 font-medium">
              Aún no hay documentos en la biblioteca.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

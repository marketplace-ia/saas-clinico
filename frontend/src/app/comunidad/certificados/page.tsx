"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

interface CertificadoDB {
  id: string;
  titulo_evento: string;
  emisor: string;
  horas: number;
  codigo_verificacion: string;
  estado: "Emitido" | "En Curso";
  url_pdf: string;
}

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState<CertificadoDB[]>([]);
  const [certificadoActivo, setCertificadoActivo] =
    useState<CertificadoDB | null>(null);
  const [cargando, setCargando] = useState(true);

  // 🟢 CORRECCIÓN APLICADA: Toda la lógica asíncrona ahora vive de forma segura dentro del useEffect
  useEffect(() => {
    let isMounted = true; // Control de seguridad anti-fugas de memoria

    const fetchCertificados = async () => {
      try {
        // 1. Identificar al usuario activo
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          if (isMounted) setCargando(false);
          return;
        }

        // 2. Buscar su ID en la tabla principal
        const { data: usuario } = await supabase
          .from("roles_usuarios")
          .select("id")
          .eq("correo", session.user.email)
          .single();

        if (usuario) {
          // 3. Traer solo los certificados de este usuario
          const { data: certs, error } = await supabase
            .from("certificados")
            .select("*")
            .eq("usuario_id", usuario.id);

          if (!error && certs && isMounted) {
            setCertificados(certs);
            // Auto-seleccionar el primero si está emitido
            const primerEmitido = certs.find((c) => c.estado === "Emitido");
            if (primerEmitido) setCertificadoActivo(primerEmitido);
          }
        }
      } catch (error) {
        console.error("Error cargando certificados:", error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    fetchCertificados();

    // Limpieza cuando el usuario sale de la página
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors mb-4 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
          >
            <span aria-hidden="true">&larr;</span> Volver al Explorador
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            Mis Certificados
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Gestiona, visualiza y descarga los avales académicos de los eventos
            y talleres en los que has participado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. LISTADO DE CERTIFICADOS (Sidebar Izquierdo) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
            Historial Académico
          </h2>

          {cargando ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : certificados.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <p className="text-slate-500 font-medium text-sm">
                Aún no tienes certificados registrados en la plataforma.
              </p>
            </div>
          ) : (
            certificados.map((cert) => (
              <button
                key={cert.id}
                onClick={() =>
                  cert.estado === "Emitido" && setCertificadoActivo(cert)
                }
                disabled={cert.estado === "En Curso"}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  certificadoActivo?.id === cert.id
                    ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200 text-white"
                    : cert.estado === "En Curso"
                      ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                      : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-900"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                      certificadoActivo?.id === cert.id
                        ? "bg-white/20 text-white"
                        : cert.estado === "En Curso"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {cert.estado}
                  </span>
                </div>
                <h3
                  className={`font-bold leading-tight mb-1 ${certificadoActivo?.id === cert.id ? "text-white" : "text-slate-900"}`}
                >
                  {cert.titulo_evento}
                </h3>
                <p
                  className={`text-xs font-medium line-clamp-1 ${certificadoActivo?.id === cert.id ? "text-indigo-200" : "text-slate-500"}`}
                >
                  {cert.emisor}
                </p>
              </button>
            ))
          )}
        </div>

        {/* 3. VISOR DEL DIPLOMA (Panel Derecho) */}
        <div className="lg:col-span-8">
          {certificadoActivo ? (
            <div className="bg-white rounded-4xl p-6 md:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  ID: {certificadoActivo.codigo_verificacion}
                </span>
                <a
                  href={certificadoActivo.url_pdf || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Descargar PDF
                </a>
              </div>

              <div className="w-full aspect-[1.414/1] bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-900 rounded-2xl p-2 md:p-4 shadow-2xl relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="w-full h-full border border-white/20 rounded-xl p-6 md:p-12 flex flex-col items-center justify-center text-center relative bg-white/5 backdrop-blur-xs">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white/80 font-serif text-3xl mb-6 border border-white/20">
                    Ψ
                  </div>
                  <h3 className="text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-8">
                    Certificado Oficial
                  </h3>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-6 tracking-tight font-serif">
                    {certificadoActivo.titulo_evento}
                  </h2>
                  <p className="text-white/70 text-sm md:text-base max-w-lg mb-8 leading-relaxed font-medium">
                    Acreditación válida por{" "}
                    <strong className="text-white">
                      {certificadoActivo.horas} horas académicas
                    </strong>
                    .
                  </p>
                  <div className="mt-auto w-full flex justify-between items-end border-t border-white/10 pt-6">
                    <div className="text-left">
                      <p className="text-white font-bold text-sm">
                        {certificadoActivo.emisor}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-4xl border border-slate-200 flex flex-col items-center justify-center p-12 text-center min-h-125">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-300">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Sin Certificados
              </h3>
              <p className="text-slate-500 font-medium">
                No se encontraron certificados emitidos en tu historial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

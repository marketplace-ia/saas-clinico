"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export default function MiPerfilComunidadPage() {
  const [cargando, setCargando] = useState(true);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState("guardados");

  const pestanas = [
    { id: "guardados", label: "Artículos Guardados" },
    { id: "eventos", label: "Mis Eventos y Talleres" },
    { id: "documentos", label: "Mis Descargas" },
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmailUsuario(user.email || "Usuario Clínico");
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* 1. CABECERA DEL PERFIL */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

        {/* Avatar Grande */}
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 bg-indigo-600 flex items-center justify-center text-4xl md:text-5xl font-black shadow-xl relative z-10 shrink-0">
          {emailUsuario ? emailUsuario.charAt(0).toUpperCase() : "U"}
        </div>

        <div className="relative z-10 text-center md:text-left">
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 text-indigo-300 font-bold text-xs hover:text-white transition-colors mb-4 uppercase tracking-wider"
          >
            <span aria-hidden="true">&larr;</span> Volver a la Comunidad
          </Link>
          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">
            Mi Actividad
          </h1>
          <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
            <svg
              className="w-5 h-5 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {emailUsuario}
          </p>
        </div>
      </div>

      {/* 2. MENÚ DE NAVEGACIÓN DE PESTAÑAS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-6 mb-8 border-b border-slate-200">
        {pestanas.map((pestana) => (
          <button
            key={pestana.id}
            onClick={() => setPestanaActiva(pestana.id)}
            className={`pb-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              pestanaActiva === pestana.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {pestana.label}
          </button>
        ))}
      </div>

      {/* 3. CONTENIDO DINÁMICO */}
      {cargando ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 md:p-16 text-center border border-slate-100 shadow-sm max-w-3xl mx-auto">
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-3">
            Aún no hay elementos aquí
          </h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            Explora la comunidad, guarda artículos interesantes y regístrate en
            eventos. Todo lo que guardes aparecerá en esta sección.
          </p>
          <Link
            href="/comunidad/articulos"
            className="text-white font-bold bg-indigo-600 px-8 py-3.5 rounded-full hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl inline-block"
          >
            Explorar Artículos
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import ResumenClinico from "../../components/ResumenClinico";

export default function FichaPaciente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next.js 15, params es una Promesa que debe desenvolverse con React.use()
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BOTÓN VOLVER Y CABECERA DEL PACIENTE */}
        <div>
          <Link
            href="/dashboard"
            className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
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
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al listado
          </Link>

          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-black shrink-0">
              {/* Inicial de ejemplo */}P
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                Expediente Clínico
              </h1>
              <p className="text-slate-500 dark:text-gray-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                Paciente Activo • ID: {id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE PESTAÑAS (Aquí inyectamos tu componente) */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <ResumenClinico pacienteId={id} />
        </div>
      </div>
    </div>
  );
}

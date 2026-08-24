"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function PsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login-personal";
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Barra Lateral Clínica */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm">
              Ψ
            </span>
            PsiClinic
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 font-bold uppercase tracking-wider">
            Portal Especialista
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard-psicologo"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/dashboard-psicologo"
                ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Mi Consultorio
          </Link>

          <Link
            href="/dashboard-psicologo/agenda"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname.includes("/agenda")
                ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Agenda Clínica
          </Link>

          <Link
            href="/dashboard-psicologo/pacientes"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname.includes("/pacientes")
                ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
            Pacientes e Historias
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleCerrarSesion}
            className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-xl transition border border-gray-200 hover:border-red-200 shadow-sm flex items-center justify-center gap-2"
          >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useState } from "react";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const links = [
    {
      name: "Mi Portal",
      href: "/dashboard-paciente",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      name: "Agendar Cita",
      href: "/dashboard-paciente/agendar",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      name: "Mis Citas",
      href: "/dashboard-paciente/citas",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    },
    {
      name: "Historial",
      href: "/dashboard-paciente/historial",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      name: "Pagos",
      href: "/dashboard-paciente/pagos",
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans overflow-hidden">
      {/* 📱 CABECERA MÓVIL */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
            Ψ
          </div>
          <span className="font-bold text-xl text-gray-900">PsiClinic</span>
        </div>
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="text-gray-600 hover:text-blue-500 focus:outline-none p-1"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuAbierto ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 💻 BARRA LATERAL */}
      <aside
        className={`
        ${menuAbierto ? "flex" : "hidden"} 
        md:flex flex-col w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0
        absolute md:relative z-40 h-[calc(100vh-73px)] md:h-screen top-18.25 md:top-0 shadow-xl md:shadow-none transition-all
      `}
      >
        <div className="p-8 hidden md:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              Ψ
            </div>
            <span className="font-bold text-2xl text-gray-900 tracking-tight">
              PsiClinic
            </span>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider ml-13">
            Portal Paciente
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 md:py-0 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={link.icon}
                  ></path>
                </svg>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto bg-white">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition font-medium"
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

      {/* 📄 CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full h-[calc(100vh-73px)] md:h-screen overflow-y-auto overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const validarCandado = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setAutorizado(true);
    };
    validarCandado();
  }, [router]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-500 font-bold tracking-widest text-sm animate-pulse">
          CARGANDO PORTAL SEGURO...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      {/* OVERLAY OSCURO PARA MÓVILES */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${menuAbierto ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="p-6 flex items-center justify-between border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                Ψ
              </div>
              <div>
                <h2 className="font-black text-gray-900 text-xl tracking-tight">
                  PsiClinic
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Paciente
                </p>
              </div>
            </div>
            <button
              onClick={() => setMenuAbierto(false)}
              className="md:hidden text-gray-400 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
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

          <nav className="px-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname === "/dashboard-paciente" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              🏠 Mi Portal
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/agendar"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/agendar") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              📅 Agendar Cita
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/citas"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/citas") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              📋 Mis Citas
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/historial"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/historial") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              🗂️ Historial
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/pagos"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/pagos") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              💳 Pagos
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100 pb-4">
              <Link
                onClick={() => setMenuAbierto(false)}
                href="/dashboard-paciente/psieduca"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/psieduca") ? "bg-emerald-50 text-emerald-600" : "text-emerald-600 hover:bg-emerald-50"}`}
              >
                🌿 Ir a PsiEduca
              </Link>
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* BARRA SUPERIOR SOLO PARA MÓVILES */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              Ψ
            </div>
            <span className="font-black text-gray-900 text-lg">PsiClinic</span>
          </div>
          <button
            onClick={() => setMenuAbierto(true)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none bg-gray-50 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

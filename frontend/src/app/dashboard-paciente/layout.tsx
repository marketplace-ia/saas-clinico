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

  // ESTADOS DE LA MARCA BLANCA
  const [nombreClinica, setNombreClinica] = useState("Lumina");
  const [colorPrimario, setColorPrimario] = useState("#4F46E5"); // Indigo-600 por defecto

  useEffect(() => {
    const cargarMarcaBlanca = async (userId: string) => {
      try {
        const { data: relacion } = await supabase
          .from("relaciones_clinicas")
          .select("psicologo_id")
          .eq("paciente_id", userId)
          .maybeSingle();

        if (relacion?.psicologo_id) {
          const { data: config } = await supabase
            .from("configuracion_clinica")
            .select("nombre_clinica, color_primario")
            .eq("psicologo_id", relacion.psicologo_id)
            .maybeSingle();

          if (config) {
            if (config.nombre_clinica) setNombreClinica(config.nombre_clinica);
            if (config.color_primario) setColorPrimario(config.color_primario);

            document.documentElement.style.setProperty(
              "--color-marca",
              config.color_primario || "#4F46E5",
            );
          }
        }
      } catch (error) {
        console.error("Error cargando marca blanca:", error);
      }
    };

    const validarCandado = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setAutorizado(true);
      cargarMarcaBlanca(session.user.id);
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
        <div
          className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"
          style={{ borderTopColor: "var(--color-marca, #4F46E5)" }}
        ></div>
        <p
          className="font-bold tracking-widest text-sm animate-pulse"
          style={{ color: "var(--color-marca, #4F46E5)" }}
        >
          CARGANDO PORTAL SEGURO...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden relative">
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setMenuAbierto(false)}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${menuAbierto ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-gray-100 mb-6 shrink-0">
            <div className="flex items-center gap-3 w-full">
              {/* LOGO DE LA CLÍNICA */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white font-black shrink-0"
                style={{ backgroundColor: colorPrimario }}
              >
                {nombreClinica.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="font-black text-gray-900 text-lg tracking-tight truncate"
                  title={nombreClinica}
                >
                  {nombreClinica}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Portal Paciente
                </p>
              </div>
            </div>
            <button
              onClick={() => setMenuAbierto(false)}
              className="md:hidden text-gray-400 hover:text-gray-900 shrink-0 ml-2"
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

          <nav className="px-4 space-y-2 overflow-y-auto flex-1">
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname === "/dashboard-paciente" ? "bg-opacity-10 text-opacity-100 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              style={
                pathname === "/dashboard-paciente"
                  ? {
                      backgroundColor: `${colorPrimario}15`,
                      color: colorPrimario,
                    }
                  : {}
              }
            >
              🏠 Mi Portal
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/agendar"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/agendar") ? "bg-opacity-10 text-opacity-100 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              style={
                pathname?.includes("/agendar")
                  ? {
                      backgroundColor: `${colorPrimario}15`,
                      color: colorPrimario,
                    }
                  : {}
              }
            >
              📅 Agendar Cita
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/citas"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/citas") ? "bg-opacity-10 text-opacity-100 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              style={
                pathname?.includes("/citas")
                  ? {
                      backgroundColor: `${colorPrimario}15`,
                      color: colorPrimario,
                    }
                  : {}
              }
            >
              📋 Mis Citas
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/historial"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/historial") ? "bg-opacity-10 text-opacity-100 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              style={
                pathname?.includes("/historial")
                  ? {
                      backgroundColor: `${colorPrimario}15`,
                      color: colorPrimario,
                    }
                  : {}
              }
            >
              🗂️ Historial
            </Link>
            <Link
              onClick={() => setMenuAbierto(false)}
              href="/dashboard-paciente/pagos"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/pagos") ? "bg-opacity-10 text-opacity-100 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
              style={
                pathname?.includes("/pagos")
                  ? {
                      backgroundColor: `${colorPrimario}15`,
                      color: colorPrimario,
                    }
                  : {}
              }
            >
              💳 Pagos
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-100 pb-4">
              <Link
                onClick={() => setMenuAbierto(false)}
                href="/comunidad"
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-teal-600 hover:bg-teal-50"
              >
                🌿 Ir a Comunidad
              </Link>
            </div>
          </nav>

          {/* ÁREA INFERIOR DEL MENÚ */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0 mt-auto">
            <button
              onClick={handleCerrarSesion}
              className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors mb-4"
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
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>

            {/* SELLO DE PRESTIGIO: POWERED BY LUMINA */}
            <div className="text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-medium text-gray-400">
                Tecnología impulsada por
              </span>
              <div className="flex items-center gap-1 mt-0.5 opacity-60 hover:opacity-100 transition-opacity">
                {/* CORRECCIÓN DE LA ALERTA TAILWIND (rounded-sm) */}
                <div className="w-4 h-4 bg-linear-to-br from-indigo-500 to-teal-400 text-white rounded-sm flex items-center justify-center font-bold text-[8px] shadow-xs">
                  Ψ
                </div>
                <span className="font-black text-gray-900 text-xs tracking-tight">
                  Lumina
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm text-white font-bold"
              style={{ backgroundColor: colorPrimario }}
            >
              {nombreClinica.charAt(0).toUpperCase()}
            </div>
            <span className="font-black text-gray-900 text-lg truncate max-w-37.5">
              {nombreClinica}
            </span>
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

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

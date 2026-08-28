"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function PsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const validarCandado = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login-personal");
        return;
      }
      const { data: rolData } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", session.user.email)
        .maybeSingle();

      if (rolData?.rol === "psicologo" || rolData?.rol === "secretaria") {
        setAutorizado(true);
      } else {
        router.replace("/dashboard-paciente");
      }
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
        <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-sm animate-pulse">
          VERIFICANDO CREDENCIALES CLÍNICAS...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* BARRA LATERAL (SIDEBAR) - Clases de visibilidad corregidas */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gray-100 mb-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
              Ψ
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-xl tracking-tight">
                PsiClinic
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Portal Especialista
              </p>
            </div>
          </div>
          <nav className="px-4 space-y-2">
            <Link
              href="/dashboard-psicologo/agenda"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname === "/dashboard-psicologo" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              🏠 Mi Consultorio
            </Link>
            <Link
              href="/dashboard-psicologo"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname === "/dashboard-psicologo/agenda" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              📅 Agenda Clínica
            </Link>
            <Link
              href="/dashboard-psicologo/pacientes"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname?.includes("/pacientes") ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              👥 Pacientes e Historias
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

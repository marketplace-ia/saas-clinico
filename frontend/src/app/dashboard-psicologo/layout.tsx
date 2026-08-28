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
    const validarAcceso = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // 1. Si no hay sesión, al login
        if (!session) {
          router.replace("/login-personal");
          return;
        }

        // 2. Buscar el rol del usuario (Usamos maybeSingle para que no explote si la cuenta es antigua)
        const { data: rolData, error } = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", session.user.email)
          .maybeSingle();

        // 3. Si hubo un error, si no tiene rol, o si su rol no es psicologo -> ¡Afuera!
        if (error || !rolData || rolData.rol !== "psicologo") {
          console.warn(
            "Acceso denegado: Usuario no es psicólogo o es una cuenta antigua.",
          );
          router.replace("/dashboard-paciente");
          return;
        }

        // 4. Si pasó los filtros, le damos acceso total
        setAutorizado(true);
      } catch (err) {
        console.error("Error validando seguridad:", err);
        router.replace("/");
      }
    };

    validarAcceso();
  }, [router]);

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // PANTALLA DE CARGA (El guardia verificando)
  if (!autorizado) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-bold tracking-widest text-sm animate-pulse">
          VERIFICANDO CREDENCIALES CLÍNICAS...
        </p>
      </div>
    );
  }

  // PANEL DEL PSICÓLOGO (Aprobado)
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* BARRA LATERAL OSCURA (Exclusiva de profesionales) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center justify-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg font-bold text-xl">
              Ψ
            </div>
            <span className="font-black text-xl tracking-tight">
              Lumina <span className="text-indigo-400">PRO</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/dashboard-psicologo"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname === "/dashboard-psicologo" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            🏠 Panel General
          </Link>
          <Link
            href="/dashboard-psicologo/agenda"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/agenda") ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            📅 Mi Agenda
          </Link>
          <Link
            href="/dashboard-psicologo/pacientes"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/pacientes") ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            👥 Mis Pacientes
          </Link>
          <Link
            href="/dashboard-psicologo/notas"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/notas") ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            📝 Notas Clínicas
          </Link>

          <div className="pt-4 mt-4 border-t border-slate-800"></div>

          <Link
            href="/dashboard-psicologo/perfil"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname?.includes("/perfil") ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            ⚙️ Configurar Clínica
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

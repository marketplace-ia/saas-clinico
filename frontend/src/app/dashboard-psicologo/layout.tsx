"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const validarCandado = async () => {
      // 1. Verificamos si hay alguien logueado
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login-personal"); // Lo sacamos al login del staff
        return;
      }

      // 2. Verificamos su rol en la base de datos
      const { data: rolData } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", session.user.email)
        .maybeSingle();

      // 3. Si es parte del equipo clínico, abrimos la puerta
      if (rolData?.rol === "psicologo" || rolData?.rol === "secretaria") {
        setAutorizado(true);
      } else {
        // Si es un paciente entrometido, lo devolvemos a su portal
        router.replace("/dashboard-paciente");
      }
    };

    validarCandado();
  }, [router]);

  // Pantalla de carga segura mientras el guardia revisa los permisos
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

  // Si todo está bien, mostramos el contenido de la página (el dashboard)
  return <>{children}</>;
}

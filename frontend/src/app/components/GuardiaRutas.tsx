"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function GuardiaRutas({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarRutasYRoles = async () => {
      // 1. Obtenemos la sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Definimos las zonas libres
      const rutasPublicas = ["/", "/login", "/registro"];
      const esRutaPublica = rutasPublicas.includes(pathname);

      if (!session) {
        // Si NO hay sesión y la ruta NO es pública, lo pateamos al login
        if (!esRutaPublica) {
          router.push("/login");
        } else {
          // Si no hay sesión y está en zona libre, lo dejamos pasar
          setCargando(false);
        }
      } else {
        // Si SÍ hay sesión, buscamos su rol usando su CORREO
        const { data: perfil } = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", session.user.email) // <-- SOLUCIÓN: Buscamos por correo, no por ID
          .single();

        const rolUsuario = perfil?.rol || "paciente"; // Si hay un error, asumimos paciente

        // Si ya está logueado y trata de ver el menú principal o login, lo mandamos a su oficina
        if (esRutaPublica) {
          if (rolUsuario === "paciente") router.push("/dashboard-paciente");
          else if (rolUsuario === "psicologo")
            router.push("/dashboard-psicologo");
          else if (rolUsuario === "secretaria")
            router.push("/dashboard-secretaria");
        } else {
          // Si ya está logueado y está navegando en sus dashboards, le quitamos la pantalla de carga
          setCargando(false);
        }
      }
    };

    verificarRutasYRoles();

    // Esto escucha si el usuario cierra sesión en tiempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verificarRutasYRoles();
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Pantalla de carga mientras el guardia revisa los permisos
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si todo está en orden, muestra la página que el usuario solicitó
  return <>{children}</>;
}

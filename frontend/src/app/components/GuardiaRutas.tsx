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
  const [estadoSuscripcion, setEstadoSuscripcion] = useState("activa");

  useEffect(() => {
    const verificarRutasYRoles = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const rutasPublicas = ["/", "/login", "/registro", "/login-personal"];
      const esRutaPublica = rutasPublicas.includes(pathname);

      if (!session) {
        if (!esRutaPublica) router.push("/login");
        else setCargando(false);
      } else {
        const { data: perfil } = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", session.user.email)
          .single();

        const rolUsuario = perfil?.rol || "paciente";

        if (esRutaPublica) {
          if (rolUsuario === "paciente") router.push("/dashboard-paciente");
          else if (rolUsuario === "psicologo")
            router.push("/dashboard-psicologo");
          else if (rolUsuario === "secretaria")
            router.push("/dashboard-secretaria");
        } else {
          if (rolUsuario === "psicologo") {
            const { data: tu } = await supabase
              .from("tenant_users")
              .select("tenant_id, tenants(estado_suscripcion)")
              .eq("usuario_id", session.user.id)
              .single();

            // 🟢 CORRECCIÓN TYPESCRIPT: Eliminamos el 'any' usando un tipo explícito
            type TenantData = { estado_suscripcion?: string };
            const tenantObj = tu?.tenants as TenantData | null | undefined;
            const estadoDB = tenantObj?.estado_suscripcion || "restringido";

            setEstadoSuscripcion(estadoDB);
          }
          setCargando(false);
        }
      }
    };

    verificarRutasYRoles();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verificarRutasYRoles();
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const enPaginaSuscripcion = pathname === "/dashboard-psicologo/suscripcion";
  const accesoBloqueado =
    (estadoSuscripcion === "inactiva" || estadoSuscripcion === "restringido") &&
    !enPaginaSuscripcion &&
    pathname.includes("/dashboard-psicologo");

  return (
    <div className="relative min-h-screen">
      <div
        className={`transition-all duration-300 h-full ${accesoBloqueado ? "opacity-40 pointer-events-none blur-sm" : ""}`}
      >
        {children}
      </div>

      {accesoBloqueado && (
        /* 🟢 CORRECCIÓN TAILWIND: z-100 en lugar de z-[100] */
        <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md p-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg text-center border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">
              Activa tu cuenta para continuar
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              Para acceder a tu agenda, pacientes y herramientas, necesitas
              activar tu período de prueba o suscribirte.
            </p>
            <button
              onClick={() => router.push("/dashboard-psicologo/suscripcion")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02]"
            >
              Ver Planes y Activar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

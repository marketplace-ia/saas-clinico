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

  // 🛡️ NUEVO: Estado para saber si el psicólogo ha pagado/iniciado prueba
  const [estadoSuscripcion, setEstadoSuscripcion] = useState("inactiva");

  useEffect(() => {
    const verificarRutasYRoles = async () => {
      // 1. Obtenemos la sesión actual
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 2. Definimos las zonas libres
      const rutasPublicas = ["/", "/login", "/registro", "/login-personal"];
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
          .eq("correo", session.user.email)
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
          // 🧱 NUEVO: Si es psicólogo, revisamos la base de datos de pagos
          if (rolUsuario === "psicologo") {
            const { data: suscripcion } = await supabase
              .from("suscripciones")
              .select("estado")
              .eq("psicologo_id", session.user.id)
              .single();

            setEstadoSuscripcion(suscripcion?.estado || "inactiva");
          }

          // Le quitamos la pantalla de carga
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

  // 🧱 LÓGICA DEL MURO DE PAGO
  const enPaginaSuscripcion = pathname === "/dashboard-psicologo/suscripcion";
  // Bloqueamos SOLO si: está inactiva + NO está en la página de pagos + la URL es del psicólogo
  const accesoBloqueado =
    estadoSuscripcion === "inactiva" &&
    !enPaginaSuscripcion &&
    pathname.includes("/dashboard-psicologo");

  return (
    <div className="relative min-h-screen">
      {/* Tu aplicación normal (se desenfoca si el acceso está bloqueado) */}
      <div
        className={`transition-all duration-300 h-full ${accesoBloqueado ? "opacity-40 pointer-events-none blur-sm" : ""}`}
      >
        {children}
      </div>

      {/* EL MURO DE PAGO VISUAL (Flota por encima de todo) */}
      {accesoBloqueado && (
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
              activar tu período de prueba gratuito de 14 días.
            </p>
            <button
              onClick={() => router.push("/dashboard-psicologo/suscripcion")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-[1.02]"
            >
              Ver Planes y Activar Prueba
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

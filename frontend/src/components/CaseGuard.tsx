"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function CaseGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [estadoSaaS, setEstadoSaaS] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCritico, setErrorCritico] = useState<string | null>(null);

  useEffect(() => {
    const auditarSaaS = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return router.push("/login");

      try {
        // 1. Buscamos a qué Clínica (Tenant) pertenece el usuario logueado.
        // Esto es VITAL para evitar vulnerabilidades IDOR/BOLA (Filtración Multi-Tenant).
        const { data: tu, error: errTu } = await supabase
          .from("tenant_users")
          .select("tenant_id")
          .eq("usuario_id", session.user.id)
          .eq("activo", true)
          .single();

        if (errTu || !tu) {
          throw new Error(
            "ACCESO DENEGADO: No estás asignado a ninguna clínica activa.",
          );
        }

        // 🟢 INYECCIÓN DE SEGURIDAD MULTI-TENANT
        // Configuramos la sesión local de Supabase para que TODAS las consultas futuras
        // desde el frontend asuman este tenant_id. Si el usuario intenta modificar la URL
        // para ver la historia clínica de otro Tenant, el RLS de Supabase lo bloqueará automáticamente.
        sessionStorage.setItem("active_tenant_id", tu.tenant_id);

        // 2. Evaluamos la vida financiera de esa Clínica (Suscripción a Clinesfera)
        const { data: sub } = await supabase
          .from("tenant_subscriptions")
          .select("estado")
          .eq("tenant_id", tu.tenant_id)
          .single();

        if (sub) {
          setEstadoSaaS(sub.estado);
        } else {
          // Si no tiene suscripción registrada, asumimos estado restringido por seguridad
          setEstadoSaaS("restricted");
        }
      } catch (error) {
        console.error("Fallo de Seguridad en C.A.S.E. Guard:", error);
        setErrorCritico(
          error instanceof Error
            ? error.message
            : "Error de aislamiento Multi-Tenant",
        );
      } finally {
        setCargando(false);
      }
    };

    auditarSaaS();
  }, [router]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Auditoria C.A.S.E. en curso
          </p>
        </div>
      </div>
    );
  }

  // Si se detecta un intento de acceso sin clínica asignada, bloqueamos de raíz
  if (errorCritico) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-50 absolute inset-0">
        <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl max-w-lg border border-red-500/30">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Bloqueo de Seguridad Multi-Tenant
          </h1>
          <p className="text-slate-400 text-sm">{errorCritico}</p>
        </div>
      </div>
    );
  }

  // REGLAS 19 y 22: Rutas que SIEMPRE están permitidas incluso en Modo Restringido
  const rutasLibres = [
    "/dashboard-psicologo/suscripcion",
    "/dashboard-psicologo/pagos",
    "/dashboard-psicologo/perfil",
    // 🟢 Agregamos facturación a las rutas libres para que puedan facturar a pacientes antiguos
    // incluso si no han pagado su suscripción mensual de software.
    "/dashboard-psicologo/facturacion",
  ];

  const esRutaLibre = rutasLibres.some((ruta) => pathname.startsWith(ruta));

  // INTERCEPCIÓN VISUAL: MODO CONSERVACIÓN (RESTRICTED)
  if (estadoSaaS === "restricted" && !esRutaLibre) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-50 absolute inset-0">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg border border-slate-200 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-100">
            <svg
              className="w-12 h-12"
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
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Modo Conservación Activo
          </h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            Tu suscripción a Clinesfera se encuentra restringida.{" "}
            <strong>
              Tus historias clínicas, notas y base de pacientes están intactos y
              a salvo
            </strong>
            , pero las operaciones de escritura (agendar citas, crear
            evoluciones) están bloqueadas.
          </p>
          <Link
            href="/dashboard-psicologo/suscripcion"
            className="bg-slate-900 text-white font-black py-4 px-6 rounded-xl block w-full hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
          >
            Regularizar Suscripción
          </Link>
        </div>
      </div>
    );
  }

  // Si todo está en orden, renderiza la plataforma normalmente
  return <>{children}</>;
}

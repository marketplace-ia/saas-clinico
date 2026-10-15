"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import SidebarPsicologo from "../components/SidebarPsicologo";
import Link from "next/link";
import { AssistantProvider } from "../../lib/assistant/ChatContext";
import AssistantWidget from "../components/AssistantWidget";

export default function DashboardPsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [cargando, setCargando] = useState(true);
  const [estadoValidacion, setEstadoValidacion] = useState<string | null>(null);
  const [tieneDocs, setTieneDocs] = useState(false);

  const [estadoSaaS, setEstadoSaaS] = useState<string | null>(null);

  useEffect(() => {
    const revisarAccesoCompleto = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const { data: perfil, error: perfilError } = await supabase
          .from("perfil_psicologo")
          .select("estado_verificacion, url_documento")
          .eq("id", session.user.id)
          .single();

        if (perfilError) {
          setEstadoValidacion("pendiente");
          setTieneDocs(false);
        } else if (perfil) {
          setEstadoValidacion(perfil.estado_verificacion || "pendiente");
          setTieneDocs(!!perfil.url_documento);

          if (perfil.estado_verificacion === "aprobado") {
            const { data: tu } = await supabase
              .from("tenant_users")
              .select("tenant_id")
              .eq("usuario_id", session.user.id)
              .eq("activo", true)
              .single();

            if (tu) {
              const { data: sub } = await supabase
                .from("tenant_subscriptions")
                .select("estado")
                .eq("tenant_id", tu.tenant_id)
                .single();

              if (sub) setEstadoSaaS(sub.estado);
            }
          }
        }
      } catch (error) {
        console.error("Error validando acceso:", error);
      } finally {
        setCargando(false);
      }
    };

    revisarAccesoCompleto();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          Autenticando credenciales y subscripción...
        </p>
      </div>
    );
  }

  if (!tieneDocs) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Requisito de Seguridad
          </h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            En cumplimiento con los estándares del sector salud, requerimos
            validar tus credenciales para garantizar un ecosistema seguro.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/registro/verificacion"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Iniciar Autenticación de Perfil
            </Link>
            <button
              onClick={cerrarSesion}
              className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 px-6 rounded-xl transition-colors border border-slate-200"
            >
              Cerrar sesión de forma segura
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (estadoValidacion === "pendiente") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Auditoría de Perfil en Curso
          </h2>
          <p className="text-slate-500 font-medium mb-6 leading-relaxed">
            Su documentación ha sido recibida. Nuestro departamento se encuentra
            validando su registro.
          </p>
          <button
            onClick={cerrarSesion}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 px-6 rounded-xl transition-colors border border-slate-200 shadow-sm"
          >
            Cerrar sesión de forma segura
          </button>
        </div>
      </div>
    );
  }

  if (estadoValidacion === "rechazado") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center border-t-4 border-t-red-500">
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Auditoría No Superada
          </h2>
          <p className="text-slate-500 font-medium mb-6">
            No pudimos validar su registro profesional. Por favor contacte a
            soporte técnico.
          </p>
          <button
            onClick={cerrarSesion}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all w-full"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const esRutaLibre = [
    "/dashboard-psicologo/suscripcion",
    "/dashboard-psicologo/pagos",
    "/dashboard-psicologo/perfil",
  ].some((ruta) => pathname.startsWith(ruta));

  if (estadoSaaS === "restricted" && !esRutaLibre) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg border border-slate-200 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Suscripción Restringida
          </h1>
          <p className="text-slate-500 mb-8 font-medium leading-relaxed">
            Tu plan actual ha finalizado su periodo de gracia.{" "}
            <strong>Tus historias clínicas y pacientes están a salvo</strong>,
            pero las operaciones de escritura como la agenda están bloqueadas
            temporalmente.
          </p>
          <Link
            href="/dashboard-psicologo/suscripcion"
            className="bg-slate-900 text-white font-black py-3.5 px-6 rounded-xl block w-full hover:bg-slate-800 transition-colors shadow-md"
          >
            Regularizar Suscripción
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AssistantProvider userRole="psicologo">
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarPsicologo />
        <main className="flex-1 ml-64 min-h-screen overflow-y-auto bg-slate-50 relative">
          {/* 🟢 CORRECCIÓN TAILWIND: Eliminado 'relative', se mantiene solo 'sticky' */}
          {estadoSaaS === "grace_period" && (
            <div className="bg-amber-500 text-amber-950 font-bold text-sm py-2 px-6 flex justify-between items-center z-40 sticky top-0">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
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
                Tu periodo de gracia finalizará pronto. Actualiza tu suscripción
                para no perder acceso a la agenda.
              </span>
              <Link
                href="/dashboard-psicologo/suscripcion"
                className="bg-amber-950 hover:bg-black text-amber-500 px-3 py-1 rounded-lg text-xs font-black transition-colors"
              >
                Renovar Ahora
              </Link>
            </div>
          )}

          {children}
        </main>
        <AssistantWidget />
      </div>
    </AssistantProvider>
  );
}

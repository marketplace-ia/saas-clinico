"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import SidebarPsicologo from "../components/SidebarPsicologo";
import Link from "next/link";

export default function DashboardPsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cargando, setCargando] = useState(true);
  const [estado, setEstado] = useState<string | null>(null);
  const [tieneDocs, setTieneDocs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const revisarAcceso = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("perfil_psicologo")
          .select("estado_verificacion, url_documento")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("No se encontró perfil:", error);
          setEstado("pendiente");
          setTieneDocs(false);
        } else if (data) {
          setEstado(data.estado_verificacion || "pendiente");
          setTieneDocs(!!data.url_documento);
        }
      } catch (error) {
        console.error("Error validando acceso:", error);
      } finally {
        setCargando(false);
      }
    };

    revisarAcceso();
  }, [router]);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // FASE 1: Verificando (Spinner)
  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">
          Autenticando credenciales de seguridad...
        </p>
      </div>
    );
  }

  // FASE 2: Acceso Total (Aprobado)
  if (estado === "aprobado") {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SidebarPsicologo />
        <main className="flex-1 ml-64 min-h-screen overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    );
  }

  // FASE 3: Falta subir documentos
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
            En cumplimiento con los más altos estándares de seguridad y calidad
            del sector salud, requerimos validar tus credenciales. Este
            protocolo garantiza un ecosistema de software exclusivo, profesional
            y 100% seguro para nuestra red de especialistas certificados.
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

  // FASE 4: Cuarentena (NUEVOS TEXTOS CORPORATIVOS)
  if (estado === "pendiente") {
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
            Su documentación ha sido recibida mediante una conexión cifrada de
            extremo a extremo. Nuestro departamento de{" "}
            <span className="font-bold text-slate-700">
              Cumplimiento Normativo
            </span>{" "}
            se encuentra validando su registro para garantizar la máxima
            seguridad de nuestra red médica.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
            <p className="text-sm text-slate-600 font-medium">
              Acuerdo de Nivel de Servicio (SLA):
              <br />
              <strong className="text-slate-900 text-base">
                Resolución en 24 a 48 horas laborables
              </strong>
            </p>
          </div>
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

  // FASE 5: Rechazado
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-lg w-full p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 text-center border-t-4 border-t-red-500">
        <h2 className="text-2xl font-black text-slate-900 mb-3">
          Auditoría No Superada
        </h2>
        <p className="text-slate-500 font-medium mb-6">
          No pudimos validar su registro profesional. Si considera que se trata
          de un error del sistema, por favor contacte a soporte técnico.
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

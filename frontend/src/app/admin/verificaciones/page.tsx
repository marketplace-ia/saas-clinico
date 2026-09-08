"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

interface PsicologoPendiente {
  id: string;
  cedula: string;
  url_documento: string;
  estado_verificacion: string;
}

export default function AdminVerificacionesPage() {
  const [psicologos, setPsicologos] = useState<PsicologoPendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // 1. PRIMERO declaramos la función y la memorizamos con useCallback
  const cargarPendientes = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("perfil_psicologo")
      .select("*")
      .eq("estado_verificacion", "pendiente");

    if (error) {
      console.error("Error cargando psicólogos:", error);
      setError(
        "No se pudieron cargar las verificaciones. Verifica que hayas ejecutado el código SQL en Supabase.",
      );
    } else {
      setPsicologos(data || []);
    }
    setCargando(false);
  }, []);

  // 2. DESPUÉS la utilizamos dentro del useEffect
  useEffect(() => {
    const verificarAdminYCargar = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || session.user.email !== "pinedaesteban535@gmail.com") {
          router.push("/login");
          return;
        }

        await cargarPendientes();
      } catch (err) {
        console.error(err);
        setError("Error de autenticación");
      }
    };

    verificarAdminYCargar();
  }, [router, cargarPendientes]);

  const actualizarEstado = async (
    id: string,
    nuevoEstado: "aprobado" | "rechazado",
  ) => {
    const confirmacion = confirm(
      `¿Estás seguro de marcar este perfil como ${nuevoEstado.toUpperCase()}?`,
    );
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from("perfil_psicologo")
        .update({ estado_verificacion: nuevoEstado })
        .eq("id", id);

      if (error) throw error;

      alert(`Perfil ${nuevoEstado} con éxito.`);
      cargarPendientes(); // Recargar la lista automáticamente
    } catch (err) {
      console.error("Error actualizando:", err);
      alert("Hubo un error al actualizar el estado en la base de datos.");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">
          Conectando al servidor VIP...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Mando Central de Auditoría
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Gestión y Aprobación de Especialistas Clínicos
            </p>
          </div>
          <div className="bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 w-max shadow-sm border border-indigo-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
            {psicologos.length} Solicitud(es) en Cuarentena
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {psicologos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl shadow-slate-200/50 border border-slate-100 mt-10">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              ¡Ecosistema Seguro!
            </h3>
            <p className="text-slate-500 font-medium text-lg">
              No hay psicólogos esperando verificación en este momento.
            </p>
            <button
              onClick={cargarPendientes}
              className="mt-8 text-slate-50 bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
            >
              Actualizar Radar
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {psicologos.map((psicologo) => (
              <div
                key={psicologo.id}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-indigo-200"
              >
                {/* Info Básica */}
                <div className="flex-1 w-full text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <span className="bg-amber-100 text-amber-700 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider border border-amber-200">
                      En Auditoría
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-md">
                      ID: {psicologo.id.split("-")[0]}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Identificación:{" "}
                    <span className="text-indigo-600">{psicologo.cedula}</span>
                  </h3>
                </div>

                {/* Documento */}
                <div className="flex-1 flex justify-center w-full md:w-auto">
                  <a
                    href={psicologo.url_documento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-6 py-4 rounded-2xl font-bold transition-all w-full md:w-auto justify-center border border-indigo-100 hover:border-indigo-300"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      ></path>
                    </svg>
                    Inspeccionar Documento (SENESCYT)
                  </a>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => actualizarEstado(psicologo.id, "rechazado")}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => actualizarEstado(psicologo.id, "aprobado")}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all border border-slate-700"
                  >
                    Aprobar y Dar Acceso
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

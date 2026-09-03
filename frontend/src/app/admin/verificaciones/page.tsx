"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

interface Psicologo {
  id: string;
  nombre?: string;
  correo?: string;
  email?: string;
  cedula?: string;
  estado_verificacion?: string;
  url_documento?: string;
  created_at?: string;
}

export default function AdminVerificaciones() {
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalImagen, setModalImagen] = useState<string | null>(null);
  const router = useRouter();

  // Toda la lógica de carga encapsulada de forma segura dentro del useEffect
  useEffect(() => {
    const inicializarPanel = async () => {
      try {
        // 1. Verificamos seguridad
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || session.user.email !== "pinedaesteban535@gmail.com") {
          router.push("/");
          return;
        }

        // 2. Cargamos los datos
        const { data, error } = await supabase
          .from("perfil_psicologo")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPsicologos(data || []);
      } catch (error) {
        console.error("Error inicializando panel:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarPanel();
  }, [router]); // router añadido como dependencia segura

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    if (
      !confirm(
        `¿Estás seguro de marcar a este usuario como ${nuevoEstado.toUpperCase()}?`,
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("perfil_psicologo")
        .update({ estado_verificacion: nuevoEstado })
        .eq("id", id);

      if (error) throw error;

      setPsicologos(
        psicologos.map((p) =>
          p.id === id ? { ...p, estado_verificacion: nuevoEstado } : p,
        ),
      );
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Hubo un error al actualizar el estado.");
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera VIP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
                <svg
                  className="w-6 h-6"
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
              </span>
              <h1 className="text-3xl font-black text-slate-900">
                Centro de Validación
              </h1>
            </div>
            <p className="text-slate-500 font-medium ml-11">
              Gestiona el acceso de los profesionales a Clinesfera.
            </p>
          </div>

          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase">
                Administrador
              </p>
              <p className="text-sm font-bold text-slate-700">
                pinedaesteban535@gmail.com
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-black">
              EP
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-5 font-bold">Profesional</th>
                  <th className="p-5 font-bold">Cédula / ID</th>
                  <th className="p-5 font-bold">Registro SENESCYT</th>
                  <th className="p-5 font-bold">Estado</th>
                  <th className="p-5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {psicologos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-slate-400 font-medium"
                    >
                      No hay profesionales registrados aún.
                    </td>
                  </tr>
                ) : (
                  psicologos.map((psi) => (
                    <tr
                      key={psi.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="p-5">
                        <p className="font-bold text-slate-900">
                          {psi.nombre || "Perfil en creación"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {psi.email || psi.correo || "Cargando correo..."}
                        </p>
                      </td>
                      <td className="p-5 font-medium text-slate-700">
                        {psi.cedula || "No registrada"}
                      </td>
                      <td className="p-5">
                        {psi.url_documento ? (
                          <button
                            onClick={() => setModalImagen(psi.url_documento!)}
                            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
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
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Ver Captura
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium">
                            Sin archivo
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                          ${
                            psi.estado_verificacion === "aprobado"
                              ? "bg-emerald-100 text-emerald-700"
                              : psi.estado_verificacion === "rechazado"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {psi.estado_verificacion || "Pendiente"}
                        </span>
                      </td>
                      <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => cambiarEstado(psi.id, "aprobado")}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Aprobar Profesional"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => cambiarEstado(psi.id, "rechazado")}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Rechazar Profesional"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL PARA VER EL DOCUMENTO */}
      {modalImagen && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-2 rounded-2xl max-w-4xl w-full shadow-2xl relative">
            <button
              onClick={() => setModalImagen(null)}
              className="absolute -top-4 -right-4 bg-white text-slate-900 hover:text-red-500 p-2 rounded-full shadow-lg transition-colors border border-slate-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full h-[80vh] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalImagen}
                alt="Documento SENESCYT"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

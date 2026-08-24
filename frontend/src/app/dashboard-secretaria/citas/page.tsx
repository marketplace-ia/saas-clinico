"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function GestionCitasSecretariaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {
    const cargarTodasLasCitas = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .order("fecha", { ascending: false })
          .order("hora", { ascending: false });

        if (error) throw error;
        setCitas(data || []);
      } catch (error) {
        console.error("Error al cargar la gestión de citas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTodasLasCitas();
  }, [refrescar]);

  const cambiarEstadoCita = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from("citas")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;

      // Recargamos la tabla visualmente
      setRefrescar((prev) => prev + 1);
    } catch (error) {
      alert("Error al actualizar el estado de la cita en el sistema.");
      console.error(error);
    }
  };

  return (
    <div className="w-full p-8 font-sans">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Supervisión de Citas
          </h1>
          <p className="text-gray-500 mt-1">
            Supervisión administrativa de todas las sesiones de la clínica.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            Sincronizando base de datos...
          </div>
        ) : citas.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📭
            </div>
            <p className="font-medium text-gray-600 text-lg">
              No hay citas registradas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-right">
                    Acciones Administrativas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {citas.map((cita) => (
                  <tr
                    key={cita.id}
                    className="hover:bg-purple-50/30 transition"
                  >
                    <td className="p-5">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          ></path>
                        </svg>
                        {cita.fecha}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        {cita.hora}
                      </div>
                    </td>
                    <td className="p-5 text-gray-600 font-medium">
                      {cita.motivo || "Sin motivo especificado"}
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${
                          cita.estado === "pendiente"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : cita.estado === "confirmada"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : cita.estado === "completada"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {cita.estado === "cancelada" && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        )}
                        {cita.estado === "confirmada" && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                        {cita.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {/* Botones de acción MÁGICOS */}
                      {cita.estado === "pendiente" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "confirmada")
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "cancelada")
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-200"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {cita.estado === "confirmada" && (
                        <button
                          onClick={() =>
                            cambiarEstadoCita(cita.id, "cancelada")
                          }
                          className="bg-white hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-300"
                        >
                          Cancelar Cita
                        </button>
                      )}

                      {(cita.estado === "cancelada" ||
                        cita.estado === "completada") && (
                        <span className="text-gray-400 text-sm font-medium italic">
                          Gestionada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

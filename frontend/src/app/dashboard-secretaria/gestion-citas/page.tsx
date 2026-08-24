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
        // La secretaria ve TODAS las citas del sistema
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .order("fecha", { ascending: true })
          .order("hora", { ascending: true });

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
            Gestión Global de Citas
          </h1>
          <p className="text-gray-500 mt-1">
            Coordina, confirma y cancela las solicitudes de toda la clínica.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Agenda Maestra
          </h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
            Total en sistema: {citas.length}
          </span>
        </div>

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
            <p className="text-sm mt-1">
              Cuando los pacientes soliciten citas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">Fecha y Hora</th>
                  <th className="p-5 font-semibold">Motivo del Paciente</th>
                  <th className="p-5 font-semibold">Estado</th>
                  <th className="p-5 font-semibold text-right">
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
                      <div className="font-bold text-gray-800 text-lg">
                        {cita.fecha}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <svg
                          className="w-4 h-4"
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
                      {cita.motivo}
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          cita.estado === "pendiente"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : cita.estado === "confirmada"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {/* Botones de acción para la Secretaria */}
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

                      {cita.estado === "cancelada" && (
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

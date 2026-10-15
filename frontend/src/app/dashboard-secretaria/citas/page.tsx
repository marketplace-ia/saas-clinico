"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Cita {
  id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
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
          .order("hora_inicio", { ascending: false });

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
      setRefrescar((prev) => prev + 1);
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
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
            Gestión administrativa de la agenda del especialista.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            Sincronizando agenda...
          </div>
        ) : citas.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📭
            </div>
            <p className="font-medium text-gray-600 text-lg">
              No hay citas registradas en la agenda.
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
                    Paciente y Modalidad
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-right">
                    Acciones
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
                        📅 {cita.fecha}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        ⏱️ {cita.hora_inicio.slice(0, 5)} -{" "}
                        {cita.hora_fin.slice(0, 5)}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-gray-800">
                        {cita.nombre_paciente}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cita.modalidad}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${
                          cita.estado === "Programada"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : cita.estado === "Completada"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      {cita.estado === "Programada" && (
                        <>
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "Completada")
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "Cancelada")
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold transition border border-red-200"
                          >
                            Cancelar
                          </button>
                        </>
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

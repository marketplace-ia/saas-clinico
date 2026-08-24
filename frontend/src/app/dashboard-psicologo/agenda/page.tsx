"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
// CORRECCIÓN: Se eliminó el import "Link" que no se estaba utilizando

interface CitaMedica {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function AgendaPsicologoPage() {
  const [citas, setCitas] = useState<CitaMedica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {
    const cargarAgenda = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .in("estado", ["confirmada", "completada", "pendiente"])
          .order("fecha", { ascending: true })
          .order("hora", { ascending: true });

        if (error) throw error;
        setCitas(data || []);
      } catch (error) {
        console.error("Error al cargar la agenda:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarAgenda();
  }, [refrescar]);

  const marcarComoCompletada = async (id: string) => {
    try {
      const { error } = await supabase
        .from("citas")
        .update({ estado: "completada" })
        .eq("id", id);

      if (error) throw error;
      setRefrescar((prev) => prev + 1);
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
      console.error(error);
    }
  };

  const citasPendientes = citas.filter(
    (c) => c.estado === "confirmada" || c.estado === "pendiente",
  );
  const citasHistorial = citas.filter((c) => c.estado === "completada");

  return (
    <div className="w-full p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mi Agenda Clínica</h1>
        <p className="text-gray-500 mt-1">
          Revisa tus próximas sesiones y marca las consultas finalizadas.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-2xl">📅</span> Próximas Sesiones
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            {citasPendientes.length} programadas
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Sincronizando agenda...
          </div>
        ) : citasPendientes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">🙌</div>
            <p className="font-medium text-lg">
              No tienes citas programadas para atender.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">Fecha y Hora</th>
                  <th className="p-5 font-semibold">Motivo de Consulta</th>
                  <th className="p-5 font-semibold text-center">
                    Estado Administrativo
                  </th>
                  <th className="p-5 font-semibold text-right">
                    Acción Clínica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {citasPendientes.map((cita) => (
                  <tr key={cita.id} className="hover:bg-blue-50/30 transition">
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
                    <td className="p-5 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                          cita.estado === "pendiente"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {cita.estado === "confirmada" ? (
                        <button
                          onClick={() => marcarComoCompletada(cita.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
                        >
                          ✓ Finalizar Sesión
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          Esperando a secretaria
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700">
            Historial de Sesiones Completadas
          </h2>
        </div>

        {citasHistorial.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            Aún no has marcado ninguna sesión como completada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <tbody className="divide-y divide-gray-50">
                {citasHistorial.map((cita) => (
                  <tr key={cita.id} className="bg-gray-50/50">
                    <td className="p-4 text-gray-500 font-medium">
                      {cita.fecha} - {cita.hora}
                    </td>
                    <td className="p-4 text-gray-400 truncate max-w-xs">
                      {cita.motivo}
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        COMPLETADA
                      </span>
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

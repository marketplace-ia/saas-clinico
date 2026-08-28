"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Cita {
  id: string;
  paciente_correo: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function AgendaClinicaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerCitas = async () => {
      try {
        // Traemos todas las citas ordenadas por fecha
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .order("fecha", { ascending: true });

        if (error) throw error;
        if (data) setCitas(data);
      } catch (error) {
        console.error("Error al cargar la agenda:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerCitas();
  }, []);

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Agenda Clínica
          </h1>
          <p className="text-gray-500">
            Listado completo de todas tus sesiones programadas.
          </p>
        </div>
        <Link
          href="/sala-virtual"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
          Ir a Sala Virtual
        </Link>
      </div>

      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Cargando base de datos...</p>
        </div>
      ) : citas.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-4xl p-16 text-center shadow-sm">
          <div className="text-6xl mb-4">🗓️</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Agenda Vacía
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            No hay citas programadas en el sistema en este momento.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-4xl p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Fecha</th>
                  <th className="pb-4 font-bold">Hora</th>
                  <th className="pb-4 font-bold">Paciente</th>
                  <th className="pb-4 font-bold">Motivo Registrado</th>
                  <th className="pb-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {citas.map((cita) => {
                  const nombrePaciente = cita.paciente_correo.split("@")[0];

                  return (
                    <tr
                      key={cita.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-5 font-black text-gray-900">
                        {cita.fecha}
                      </td>
                      <td className="py-5 font-bold text-blue-600">
                        {cita.hora}
                      </td>
                      <td className="py-5 font-bold text-gray-700 capitalize">
                        {nombrePaciente}
                      </td>
                      <td className="py-5 text-gray-500 italic max-w-xs truncate">
                        &quot;{cita.motivo}&quot;
                      </td>
                      <td className="py-5 text-right">
                        <Link
                          href="/dashboard-psicologo/pacientes"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg transition text-xs"
                        >
                          Ver Historial
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

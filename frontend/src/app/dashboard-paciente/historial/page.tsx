"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function HistorialPacientePage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      setCargando(true);
      try {
        // 1. Identificamos al paciente logueado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Buscamos SOLO las citas que le pertenecen a este paciente
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .eq("paciente_id", user.id)
          .order("fecha", { ascending: false }) // Mostramos las más recientes primero
          .order("hora", { ascending: false });

        if (error) throw error;
        setCitas(data || []);
      } catch (error) {
        console.error("Error al cargar el historial de citas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []);

  return (
    <div className="w-full p-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Mi Historial de Citas
          </h1>
          <p className="text-gray-500 mt-1">
            Revisa el estado de todas tus solicitudes y consultas pasadas.
          </p>
        </div>
        <Link
          href="/citas"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2 hover:-translate-y-0.5"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Agendar Nueva Cita
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Registro de Consultas
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            Total: {citas.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            Cargando tu historial...
          </div>
        ) : citas.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-4xl">
              📅
            </div>
            <p className="font-medium text-gray-600 text-lg">
              Aún no tienes citas registradas.
            </p>
            <p className="text-sm mt-1 mb-6">
              Cuando agendes una consulta, aparecerá aquí.
            </p>
            <Link
              href="/citas"
              className="text-blue-600 font-semibold hover:underline"
            >
              Ir a agendar mi primera cita →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">Fecha y Hora</th>
                  <th className="p-5 font-semibold">Motivo de Consulta</th>
                  <th className="p-5 font-semibold text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {citas.map((cita) => (
                  <tr
                    key={cita.id}
                    className="hover:bg-gray-50/50 transition group"
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
                    <td className="p-5 text-gray-600 max-w-sm">
                      {cita.motivo}
                    </td>
                    <td className="p-5 text-right">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm border ${
                          cita.estado === "pendiente"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : cita.estado === "confirmada"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {cita.estado === "pendiente" && (
                          <span className="mr-1.5 text-lg leading-none">•</span>
                        )}
                        {cita.estado === "confirmada" && (
                          <span className="mr-1.5 text-lg leading-none">✓</span>
                        )}
                        {cita.estado === "cancelada" && (
                          <span className="mr-1.5 text-lg leading-none">×</span>
                        )}
                        {cita.estado}
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

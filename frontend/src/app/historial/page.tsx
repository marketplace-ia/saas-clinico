"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

// Definimos la estructura de los datos para TypeScript
interface Cita {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function HistorialPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        // 1. Obtenemos al usuario actual
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("No hay sesión activa.");

        // 2. Buscamos sus citas en la base de datos (ordenadas por fecha reciente)
        const { data, error: errorCitas } = await supabase
          .from("citas")
          .select("*")
          .eq("paciente_id", user.id)
          .order("fecha", { ascending: false });

        if (errorCitas) throw errorCitas;

        setCitas(data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar el historial.");
        }
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorial();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Mi Historial de Citas
          </h1>
          <p className="text-gray-500">
            Aquí puedes ver el estado de todas tus consultas.
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 font-medium animate-pulse">
              Cargando tu historial...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-md border border-red-200">
            {error}
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">
              Aún no tienes citas registradas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b font-semibold">Fecha</th>
                  <th className="p-3 border-b font-semibold">Hora</th>
                  <th className="p-3 border-b font-semibold">Motivo</th>
                  <th className="p-3 border-b font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr
                    key={cita.id}
                    className="border-b hover:bg-blue-50/50 transition"
                  >
                    <td className="p-3 text-gray-800">{cita.fecha}</td>
                    <td className="p-3 text-gray-800">{cita.hora}</td>
                    <td className="p-3 text-gray-600 max-w-xs truncate">
                      {cita.motivo}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          cita.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : cita.estado === "confirmada"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cita.estado.toUpperCase()}
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

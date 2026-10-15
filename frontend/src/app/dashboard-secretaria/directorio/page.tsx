"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Paciente {
  id: string;
  nombre_completo: string;
  email: string;
}

export default function DirectorioSecretariaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarDirectorio = async () => {
      setCargando(true);
      try {
        // Al consultar la tabla 'pacientes', las reglas RLS de Supabase
        // filtrarán automáticamente solo los que pertenecen al psicólogo de esta secretaria.
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .order("nombre_completo", { ascending: true });

        if (error) throw error;
        setPacientes(data || []);
      } catch (error) {
        console.error("Error al cargar el directorio:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDirectorio();
  }, []);

  const pacientesFiltrados = pacientes.filter(
    (paciente) =>
      paciente.nombre_completo
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      paciente.email?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="w-full p-8 font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Directorio de Pacientes
          </h1>
          <p className="text-gray-500 mt-1">
            Base de datos de pacientes de tu especialista asignado.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Listado General
          </h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
            Total: {pacientes.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            Cargando pacientes de la clínica...
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🔍
            </div>
            <p className="font-medium text-gray-600 text-lg">
              No se encontraron pacientes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">ID Ref.</th>
                  <th className="p-5 font-semibold">Paciente</th>
                  <th className="p-5 font-semibold text-right">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pacientesFiltrados.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="hover:bg-purple-50/40 transition"
                  >
                    <td className="p-5 text-gray-400 font-mono text-sm">
                      #{paciente.id.split("-")[0]}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                          {paciente.nombre_completo.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-bold text-gray-800">
                          {paciente.nombre_completo}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right text-gray-500 text-sm">
                      {paciente.email || "Sin correo"}
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

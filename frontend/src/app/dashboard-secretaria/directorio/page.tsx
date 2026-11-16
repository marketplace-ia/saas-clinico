"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Paciente {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
}

export default function DirectorioSecretariaPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [errorJefe, setErrorJefe] = useState<string | null>(null);

  useEffect(() => {
    const cargarDirectorio = async () => {
      setCargando(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.id) throw new Error("Sin sesión activa");

        // 🟢 1. IDENTIFICAR AL PSICÓLOGO JEFE
        const { data: perfilData, error: perfilError } = await supabase
          .from("perfil_secretaria")
          .select("psicologo_id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (perfilError || !perfilData?.psicologo_id) {
          setErrorJefe(
            "No tienes un psicólogo asignado. Contacta al administrador.",
          );
          setCargando(false);
          return;
        }

        const idJefe = perfilData.psicologo_id;

        // 🟢 2. TRAER SOLO LOS PACIENTES DE ESE DOCTOR
        const { data, error } = await supabase
          .from("pacientes")
          .select("id, nombre_completo, email, telefono")
          .eq("psicologo_id", idJefe)
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

  if (errorJefe)
    return (
      <div className="p-10 font-bold text-red-600 bg-red-50 m-8 rounded-xl border border-red-200">
        🚨 {errorJefe}
      </div>
    );

  return (
    <div className="w-full p-8 font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Directorio de Pacientes
          </h1>
          <p className="text-gray-500 mt-1">
            Base de datos de pacientes exclusivos de tu especialista asignado.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition shadow-sm"
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
                    <td className="p-5 text-right text-gray-500 text-sm flex flex-col items-end">
                      <span className="font-bold">
                        {paciente.email || "Sin correo"}
                      </span>
                      {paciente.telefono && <span>{paciente.telefono}</span>}
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

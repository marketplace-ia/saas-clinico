"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Paciente {
  id: number;
  correo: string;
}

export default function PacientesPsicologoPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Estados para el Modal de Notas Clínicas
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<
    string | null
  >(null);
  const [textoNota, setTextoNota] = useState("");
  const [guardandoNota, setGuardandoNota] = useState(false);

  useEffect(() => {
    const cargarPacientes = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("roles_usuarios")
          .select("id, correo")
          .eq("rol", "paciente")
          .order("correo", { ascending: true });

        if (error) throw error;
        setPacientes(data || []);
      } catch (error) {
        console.error("Error al cargar pacientes:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.correo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const abrirModalNota = (correo: string) => {
    setPacienteSeleccionado(correo);
    setTextoNota(""); // Limpiamos la nota anterior si la hubiera
  };

  const cerrarModal = () => {
    setPacienteSeleccionado(null);
    setTextoNota("");
  };

  const guardarNotaClinica = async () => {
    if (!textoNota.trim()) {
      alert("Por favor, escribe algo en la nota antes de guardar.");
      return;
    }

    setGuardandoNota(true);

    // Aquí simulamos el guardado.
    // En el futuro, esto hará un insert en tu tabla 'notas_clinicas'
    setTimeout(() => {
      alert(
        `✅ Nota clínica guardada con éxito en el expediente de ${pacienteSeleccionado}`,
      );
      setGuardandoNota(false);
      cerrarModal();
    }, 1000);
  };

  return (
    <div className="w-full p-8 font-sans">
      {/* Cabecera */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Expedientes Clínicos
          </h1>
          <p className="text-gray-500 mt-1">
            Directorio de pacientes, historias y notas de evolución.
          </p>
        </div>

        {/* Buscador */}
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
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
          />
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Mis Pacientes</h2>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Cargando expedientes...
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No se encontraron pacientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">Paciente</th>
                  <th className="p-5 font-semibold">Última Sesión</th>
                  <th className="p-5 font-semibold text-right">
                    Acciones Clínicas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pacientesFiltrados.map((paciente) => (
                  <tr
                    key={paciente.id}
                    className="hover:bg-blue-50/40 transition"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                          {paciente.correo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {paciente.correo.split("@")[0]}
                          </div>
                          <div className="text-sm text-gray-500">
                            {paciente.correo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-gray-500 text-sm">Reciente</td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button
                        onClick={() =>
                          alert(
                            `Abriendo expediente completo de ${paciente.correo}...`,
                          )
                        }
                        className="text-gray-600 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-bold transition border border-gray-200"
                      >
                        Ver Historial
                      </button>
                      <button
                        onClick={() => abrirModalNota(paciente.correo)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm flex items-center gap-2"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                        Escribir Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL EMERGENTE PARA REDACTAR NOTAS */}
      {pacienteSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-100">
            {/* Header del Modal */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Nueva Nota de Evolución</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Paciente: {pacienteSeleccionado}
                </p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-blue-100 hover:text-white hover:bg-blue-700 p-2 rounded-lg transition"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            {/* Body del Modal */}
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Observaciones clínicas de la sesión
              </label>
              <textarea
                value={textoNota}
                onChange={(e) => setTextoNota(e.target.value)}
                placeholder="Describe los avances, síntomas, temas tratados y tareas asignadas al paciente..."
                className="w-full h-48 p-4 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none text-gray-700"
              ></textarea>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"
                  ></path>
                </svg>
                Esta nota se guardará de forma encriptada y confidencial.
              </p>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={cerrarModal}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNotaClinica}
                disabled={guardandoNota}
                className={`px-6 py-2.5 rounded-xl font-bold text-white transition flex items-center gap-2 ${
                  guardandoNota
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
              >
                {guardandoNota ? "Guardando..." : "Guardar Nota en Expediente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Historia {
  id: number;
  created_at: string;
  paciente: string;
  notas: string;
}

export default function HistoriasClinicasPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Campos del formulario (exactamente como tu base de datos)
  const [paciente, setPaciente] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Nuestro disparador mágico para recargar sin alertas de linter
  const [refrescar, setRefrescar] = useState(0);

  useEffect(() => {
    const cargarHistorias = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("historias_clinicas")
          .select("*")
          .order("created_at", { ascending: false }); // Las más recientes primero

        if (error) throw error;
        setHistorias(data || []);
      } catch (error) {
        console.error("Error al cargar las historias clínicas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorias();
  }, [refrescar]);

  const guardarHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const nuevaHistoria = {
        paciente: paciente,
        notas: notas,
      };

      // Supabase se encarga automáticamente del 'id' y el 'created_at'
      const { error } = await supabase
        .from("historias_clinicas")
        .insert([nuevaHistoria]);

      if (error) throw error;

      // Limpiar y cerrar modal
      setPaciente("");
      setNotas("");
      setModalAbierto(false);

      // Avisar al useEffect que recargue la lista
      setRefrescar((prev) => prev + 1);
    } catch (error) {
      if (error instanceof Error) {
        alert("Error al guardar: " + error.message);
      } else {
        alert("Ocurrió un error inesperado al guardar la historia clínica.");
      }
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  // Función para darle formato bonito a la fecha (created_at)
  const formatearFecha = (fechaIso: string) => {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full p-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Historias Clínicas
          </h1>
          <p className="text-gray-500 mt-1">
            Gestión de expedientes y antecedentes médicos de pacientes.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
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
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          Crear Expediente
        </button>
      </div>

      {/* Lista de Historias Clínicas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Archivo General
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            Total: {historias.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            Cargando archivo de expedientes...
          </div>
        ) : historias.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-gray-50/50">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-4xl">
              📂
            </div>
            <p className="font-medium text-gray-600">El archivo está vacío.</p>
            <p className="text-sm mt-1">
              No hay historias clínicas registradas en el sistema.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 p-6">
            {historias.map((historia) => (
              <div
                key={historia.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow hover:border-blue-300 group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                      {historia.paciente.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {historia.paciente}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-0.5">
                        Expediente #{historia.id.toString().padStart(4, "0")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2">
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
                    {formatearFecha(historia.created_at)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Detalle de la Historia Clínica
                  </h4>
                  <div className="bg-yellow-50/30 border border-yellow-100/50 rounded-xl p-5 text-gray-700 whitespace-pre-line leading-relaxed">
                    {historia.notas || "Sin información detallada."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Nueva Historia */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border-t-8 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nuevo Expediente Médico
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Registra la historia clínica oficial del paciente.
            </p>

            <form onSubmit={guardarHistoria} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre Completo del Paciente
                </label>
                <input
                  type="text"
                  required
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Ej. María Fernanda López"
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Historia Clínica / Anamnesis (Notas)
                </label>
                <textarea
                  required
                  rows={8}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Antecedentes familiares, motivo de consulta, estado actual, plan de tratamiento..."
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md hover:shadow-lg disabled:bg-gray-400"
                >
                  {guardando
                    ? "Guardando expediente..."
                    : "Guardar Historia Clínica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface Nota {
  id: string;
  paciente_nombre: string;
  psicologo_correo: string;
  fecha: string;
  contenido?: string;
}

export default function NotasClinicasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [pacienteNombre, setPacienteNombre] = useState("");
  const [contenidoNota, setContenidoNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  // Nuestro disparador mágico
  const [refrescar, setRefrescar] = useState(0);

  // Todo ocurre aquí adentro: limpio, rápido y sin alertas
  useEffect(() => {
    const cargarNotas = async () => {
      setCargando(true);
      try {
        const { data, error } = await supabase
          .from("notas_clinicas")
          .select("*")
          .order("fecha", { ascending: false });

        if (error) throw error;
        setNotas(data || []);
      } catch (error) {
        console.error("Error al cargar notas clínicas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarNotas();
  }, [refrescar]);

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("notas_clinicas").insert([
        {
          paciente_nombre: pacienteNombre,
          psicologo_correo: user?.email || "especialista@clinic.com",
          fecha: new Date().toISOString().split("T")[0],
          contenido: contenidoNota,
        },
      ]);

      if (error) throw error;

      setPacienteNombre("");
      setContenidoNota("");
      setModalAbierto(false);
      // Disparamos la recarga
      setRefrescar((prev) => prev + 1);
    } catch (error) {
      alert("Error al guardar la nota clínica.");
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notas Clínicas</h1>
          <p className="text-gray-500 mt-1">
            Historial de diagnósticos y seguimiento.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          + Nueva Nota
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Registros Clínicos
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
            Total: {notas.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Cargando notas...
          </div>
        ) : notas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay notas clínicas registradas.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notas.map((nota) => (
              <div key={nota.id} className="p-6 hover:bg-gray-50/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800">
                    Paciente: {nota.paciente_nombre}
                  </h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                    {nota.fecha}
                  </span>
                </div>
                <p className="text-gray-600 mt-3 bg-blue-50/30 p-4 rounded-xl border border-blue-50/50">
                  {nota.contenido || "Sin descripción."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Redactar Nota</h2>
            <form onSubmit={guardarNota} className="space-y-4">
              <input
                type="text"
                required
                value={pacienteNombre}
                onChange={(e) => setPacienteNombre(e.target.value)}
                placeholder="Nombre del Paciente"
                className="w-full border rounded-lg p-3"
              />
              <textarea
                required
                rows={4}
                value={contenidoNota}
                onChange={(e) => setContenidoNota(e.target.value)}
                placeholder="Notas clínicas..."
                className="w-full border rounded-lg p-3"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

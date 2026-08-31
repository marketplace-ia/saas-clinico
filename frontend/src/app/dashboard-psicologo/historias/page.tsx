"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Historia {
  id: string;
  nombre_paciente: string;
  fecha_nacimiento: string;
  motivo_consulta: string;
  diagnostico: string;
  evolucion: string;
  actualizado_en: string;
}

export default function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [historiaActual, setHistoriaActual] = useState<Partial<Historia>>({
    nombre_paciente: "",
    fecha_nacimiento: "",
    motivo_consulta: "",
    diagnostico: "",
    evolucion: "",
  });

  const cargarHistorias = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("historias_clinicas")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("actualizado_en", { ascending: false });

      if (error) throw error;
      if (data) setHistorias(data);
    } catch (error) {
      console.error("Error cargando historias:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciarCarga = async () => {
      await cargarHistorias();
    };
    iniciarCarga();
  }, [cargarHistorias]);

  const abrirModalNueva = () => {
    setHistoriaActual({
      nombre_paciente: "",
      fecha_nacimiento: "",
      motivo_consulta: "",
      diagnostico: "",
      evolucion: "",
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (historia: Historia) => {
    setHistoriaActual(historia);
    setModalAbierto(true);
  };

  const guardarHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      if (historiaActual.id) {
        await supabase
          .from("historias_clinicas")
          .update({
            nombre_paciente: historiaActual.nombre_paciente,
            fecha_nacimiento: historiaActual.fecha_nacimiento,
            motivo_consulta: historiaActual.motivo_consulta,
            diagnostico: historiaActual.diagnostico,
            evolucion: historiaActual.evolucion,
            actualizado_en: new Date().toISOString(),
          })
          .eq("id", historiaActual.id);
      } else {
        await supabase.from("historias_clinicas").insert([
          {
            psicologo_id: session.user.id,
            nombre_paciente: historiaActual.nombre_paciente,
            fecha_nacimiento: historiaActual.fecha_nacimiento,
            motivo_consulta: historiaActual.motivo_consulta,
            diagnostico: historiaActual.diagnostico,
            evolucion: historiaActual.evolucion,
          },
        ]);
      }

      setModalAbierto(false);
      cargarHistorias();
    } catch (error) {
      console.error("Error guardando historia:", error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Expedientes Clínicos
          </h1>
          <p className="text-slate-500 font-medium">
            Gestión segura y encriptada de Clinesfera.
          </p>
        </div>
        <button
          onClick={abrirModalNueva}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Expediente
        </button>
      </div>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : historias.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Sin expedientes activos
          </h3>
          <p className="text-slate-500 max-w-sm">
            Haz clic en &quot;Nuevo Expediente&quot; para registrar la historia
            de tu primer paciente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {historias.map((historia) => (
            <div
              key={historia.id}
              onClick={() => abrirModalEditar(historia)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col gap-4"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-xl text-slate-900">
                    {historia.nombre_paciente}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Actualizado:{" "}
                    {new Date(historia.actualizado_en).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Expediente
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Motivo
                  </span>
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {historia.motivo_consulta || "No especificado"}
                  </p>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Diagnóstico
                  </span>
                  <p className="text-sm text-slate-700 line-clamp-2 font-medium">
                    {historia.diagnostico || "En evaluación"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DEL EXPEDIENTE */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                {historiaActual.id ? "Ficha Clínica" : "Nuevo Expediente"}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={guardarHistoria}
              className="p-6 overflow-y-auto flex-1 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nombre del Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    value={historiaActual.nombre_paciente}
                    onChange={(e) =>
                      setHistoriaActual({
                        ...historiaActual,
                        nombre_paciente: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={historiaActual.fecha_nacimiento}
                    onChange={(e) =>
                      setHistoriaActual({
                        ...historiaActual,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Motivo de Consulta
                </label>
                <textarea
                  rows={2}
                  value={historiaActual.motivo_consulta}
                  onChange={(e) =>
                    setHistoriaActual({
                      ...historiaActual,
                      motivo_consulta: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-900"
                  placeholder="¿Por qué acude el paciente?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Diagnóstico / Hipótesis Clínica
                </label>
                <input
                  type="text"
                  value={historiaActual.diagnostico}
                  onChange={(e) =>
                    setHistoriaActual({
                      ...historiaActual,
                      diagnostico: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                  placeholder="Ej. Trastorno de ansiedad generalizada"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Evolución y Notas de Sesión
                </label>
                <textarea
                  rows={6}
                  value={historiaActual.evolucion}
                  onChange={(e) =>
                    setHistoriaActual({
                      ...historiaActual,
                      evolucion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-900"
                  placeholder="Registra aquí los avances, tareas o detalles de cada sesión..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-32"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Guardar Expediente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

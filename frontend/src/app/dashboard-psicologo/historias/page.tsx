"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Paciente {
  id: string;
  nombre_completo: string;
}

interface Historia {
  id: string;
  paciente_id: string;
  motivo_consulta: string;
  antecedentes: string;
  evaluacion: string;
  plan_tratamiento: string;
  actualizado_en: string;
  pacientes?: {
    nombre_completo: string;
  };
}

export default function HistoriasPage() {
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [listaPacientes, setListaPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nuevaHistoria, setNuevaHistoria] = useState({
    paciente_id: "",
    motivo_consulta: "",
    antecedentes: "",
    evaluacion: "",
    plan_tratamiento: "",
  });

  const cargarDatos = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Cargar pacientes para el selector desplegable
      const { data: dataPacientes } = await supabase
        .from("pacientes")
        .select("id, nombre_completo")
        .eq("psicologo_id", session.user.id)
        .order("nombre_completo");

      if (dataPacientes) setListaPacientes(dataPacientes);

      // 2. Cargar las historias clínicas y unir el nombre del paciente automáticamente
      const { data: dataHistorias, error } = await supabase
        .from("historias_clinicas")
        .select(`*, pacientes(nombre_completo)`)
        .eq("psicologo_id", session.user.id)
        .order("actualizado_en", { ascending: false });

      if (error) throw error;
      if (dataHistorias) setHistorias(dataHistorias);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => await cargarDatos();
    inicializar();
  }, [cargarDatos]);

  const guardarHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaHistoria.paciente_id) {
      alert("Por favor selecciona un paciente.");
      return;
    }

    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("historias_clinicas").insert([
        {
          psicologo_id: session.user.id,
          paciente_id: nuevaHistoria.paciente_id,
          motivo_consulta: nuevaHistoria.motivo_consulta,
          antecedentes: nuevaHistoria.antecedentes,
          evaluacion: nuevaHistoria.evaluacion,
          plan_tratamiento: nuevaHistoria.plan_tratamiento,
        },
      ]);

      if (error) throw error;

      setNuevaHistoria({
        paciente_id: "",
        motivo_consulta: "",
        antecedentes: "",
        evaluacion: "",
        plan_tratamiento: "",
      });
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando historia:", error);
      alert("Hubo un error al guardar el documento.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Historias Clínicas
          </h1>
          <p className="text-slate-500 font-medium">
            Documentos legales y evolución terapéutica de tus pacientes.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Nueva Historia
        </button>
      </div>

      {/* LISTA DE HISTORIAS */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : historias.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg
              className="w-10 h-10 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No hay expedientes clínicos
          </h3>
          <p className="text-slate-500 max-w-sm">
            Aún no has creado historias clínicas. Haz clic en &quot;Nueva
            Historia&quot; para abrir el expediente de un paciente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historias.map((historia) => (
            <div
              key={historia.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black">
                    {historia.pacientes?.nombre_completo.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {historia.pacientes?.nombre_completo}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Motivo de consulta
                  </span>
                  <p className="text-sm font-medium text-slate-700 line-clamp-2">
                    {historia.motivo_consulta || "No especificado"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Evaluación
                  </span>
                  <p className="text-sm font-medium text-slate-700 line-clamp-2">
                    {historia.evaluacion || "Sin evaluación registrada"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">
                  Actualizado:{" "}
                  {new Date(historia.actualizado_en).toLocaleDateString()}
                </span>
                <button className="text-indigo-600 text-sm font-bold hover:underline">
                  Abrir Expediente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA HISTORIA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="text-2xl font-black text-slate-900">
                Apertura de Historia Clínica
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

            <form onSubmit={guardarHistoria} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Seleccionar Paciente *
                </label>
                <select
                  required
                  value={nuevaHistoria.paciente_id}
                  onChange={(e) =>
                    setNuevaHistoria({
                      ...nuevaHistoria,
                      paciente_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                >
                  <option value="">
                    -- Elige un paciente de tu directorio --
                  </option>
                  {listaPacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre_completo}
                    </option>
                  ))}
                </select>
                {listaPacientes.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    Debes tener pacientes registrados en tu Directorio primero.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Motivo de Consulta
                </label>
                <textarea
                  rows={2}
                  value={nuevaHistoria.motivo_consulta}
                  onChange={(e) =>
                    setNuevaHistoria({
                      ...nuevaHistoria,
                      motivo_consulta: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-none"
                  placeholder="Razón principal por la que el paciente acude a terapia..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Antecedentes Clínicos / Familiares
                </label>
                <textarea
                  rows={3}
                  value={nuevaHistoria.antecedentes}
                  onChange={(e) =>
                    setNuevaHistoria({
                      ...nuevaHistoria,
                      antecedentes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Evaluación Psicológica Inicial
                </label>
                <textarea
                  rows={3}
                  value={nuevaHistoria.evaluacion}
                  onChange={(e) =>
                    setNuevaHistoria({
                      ...nuevaHistoria,
                      evaluacion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Plan de Tratamiento y Objetivos
                </label>
                <textarea
                  rows={2}
                  value={nuevaHistoria.plan_tratamiento}
                  onChange={(e) =>
                    setNuevaHistoria({
                      ...nuevaHistoria,
                      plan_tratamiento: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardando || listaPacientes.length === 0}
                  className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {guardando
                    ? "Guardando Expediente..."
                    : "Aperturar Historia Clínica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

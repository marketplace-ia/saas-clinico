"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams } from "next/navigation"; // 🟢 Quitamos useRouter
import Link from "next/link";

interface Paciente {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  estado: string;
  fecha_nacimiento: string;
}

interface NotaEvolucion {
  id: string;
  fecha: string;
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
  creado_en: string;
}

interface Anamnesis {
  id?: string;
  motivo_consulta: string;
  antecedentes_medicos: string;
  antecedentes_familiares: string;
  historia_personal: string;
}

export default function FichaPacientePage() {
  const params = useParams();
  const pacienteId = params.id as string; // 🟢 Eliminamos router de aquí

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState("evolucion");

  // Estados: Notas SOAP
  const [notas, setNotas] = useState<NotaEvolucion[]>([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [modalNotaAbierto, setModalNotaAbierto] = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({
    subjetivo: "",
    objetivo: "",
    analisis: "",
    plan: "",
  });

  // Estados: Anamnesis
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [cargandoAnamnesis, setCargandoAnamnesis] = useState(false);
  const [editandoAnamnesis, setEditandoAnamnesis] = useState(false);
  const [formAnamnesis, setFormAnamnesis] = useState<Anamnesis>({
    motivo_consulta: "",
    antecedentes_medicos: "",
    antecedentes_familiares: "",
    historia_personal: "",
  });
  const [guardandoAnamnesis, setGuardandoAnamnesis] = useState(false);

  // CARGAR PACIENTE
  useEffect(() => {
    const cargarDatosPaciente = async () => {
      try {
        const { data, error } = await supabase
          .from("pacientes")
          .select("*")
          .eq("id", pacienteId)
          .single();
        if (error) throw error;
        setPaciente(data);
      } catch (error) {
        console.error("Error paciente:", error);
      } finally {
        setCargando(false);
      }
    };
    if (pacienteId) cargarDatosPaciente();
  }, [pacienteId]);

  // CARGAR NOTAS
  const cargarNotas = useCallback(async () => {
    setCargandoNotas(true);
    try {
      const { data, error } = await supabase
        .from("notas_evolucion")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("fecha", { ascending: false })
        .order("creado_en", { ascending: false });
      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error("Error notas:", error);
    } finally {
      setCargandoNotas(false);
    }
  }, [pacienteId]);

  // CARGAR ANAMNESIS
  const cargarAnamnesis = useCallback(async () => {
    setCargandoAnamnesis(true);
    try {
      const { data, error } = await supabase
        .from("anamnesis")
        .select("*")
        .eq("paciente_id", pacienteId)
        .single();
      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setAnamnesis(data);
        setFormAnamnesis(data);
      }
    } catch (error) {
      console.error("Error anamnesis:", error);
    } finally {
      setCargandoAnamnesis(false);
    }
  }, [pacienteId]);

  // RUTEO DE PESTAÑAS
  useEffect(() => {
    const arrancarModulos = async () => {
      if (pestanaActiva === "evolucion") await cargarNotas();
      if (pestanaActiva === "anamnesis") await cargarAnamnesis();
    };
    arrancarModulos();
  }, [pestanaActiva, cargarNotas, cargarAnamnesis]);

  // GUARDAR NOTA SOAP
  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoNota(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from("notas_evolucion").insert([
        {
          paciente_id: pacienteId,
          psicologo_id: session.user.id,
          ...nuevaNota,
        },
      ]);
      if (error) throw error;
      setNuevaNota({ subjetivo: "", objetivo: "", analisis: "", plan: "" });
      setModalNotaAbierto(false);
      cargarNotas();
    } catch (error) {
      console.error(error); // 🟢 Usamos la variable error
      alert("Error al guardar la evolución médica.");
    } finally {
      setGuardandoNota(false);
    }
  };

  // GUARDAR ANAMNESIS
  const guardarAnamnesis = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoAnamnesis(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      if (anamnesis?.id) {
        const { error } = await supabase
          .from("anamnesis")
          .update(formAnamnesis)
          .eq("id", anamnesis.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("anamnesis").insert([
          {
            paciente_id: pacienteId,
            psicologo_id: session.user.id,
            ...formAnamnesis,
          },
        ]);
        if (error) throw error;
      }

      await cargarAnamnesis();
      setEditandoAnamnesis(false);
    } catch (error) {
      console.error(error); // 🟢 Usamos la variable error
      alert("Error al guardar la Anamnesis.");
    } finally {
      setGuardandoAnamnesis(false);
    }
  };

  if (cargando || !paciente)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      <Link
        href="/dashboard-psicologo/pacientes"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
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
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>{" "}
        Volver al Directorio
      </Link>

      {/* HEADER DEL PACIENTE */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-50 to-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-500/30 shrink-0">
            {paciente.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900">
                {paciente.nombre_completo}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                {paciente.estado || "Activo"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
              {paciente.email && (
                <span className="flex items-center gap-1.5">
                  📧 {paciente.email}
                </span>
              )}
              {paciente.telefono && (
                <span className="flex items-center gap-1.5">
                  📱 {paciente.telefono}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                🆔 ID: {paciente.id.split("-")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "evolucion", nombre: "Notas de Evolución" },
          { id: "anamnesis", nombre: "Anamnesis Inicial" },
          { id: "resumen", nombre: "Resumen Clínico" },
          { id: "documentos", nombre: "Documentos" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${pestanaActiva === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            {tab.nombre}
          </button>
        ))}
      </div>

      {/* CONTENEDOR DE PESTAÑAS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-100">
        {/* ========================================= */}
        {/* PESTAÑA: NOTAS SOAP */}
        {/* ========================================= */}
        {pestanaActiva === "evolucion" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Historial de Sesiones
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Registros médicos en formato SOAP.
                </p>
              </div>
              <button
                onClick={() => setModalNotaAbierto(true)}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 shrink-0"
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
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>{" "}
                Nueva Nota SOAP
              </button>
            </div>
            {cargandoNotas ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : notas.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                <h4 className="text-lg font-bold text-slate-700">
                  Sin evoluciones
                </h4>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {notas.map((nota) => (
                  <div key={nota.id} className="relative pl-12 md:pl-16 group">
                    <div className="absolute left-0 w-10 h-10 md:w-12 md:h-12 bg-indigo-50 border-4 border-white rounded-full flex items-center justify-center shadow-sm z-10 text-indigo-600">
                      📝
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                      <h4 className="text-lg font-black text-slate-900 mb-4">
                        {new Date(nota.fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-slate-400">
                            SUBJETIVO
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm min-h-20">
                            {nota.subjetivo}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-slate-400">
                            OBJETIVO
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm min-h-20">
                            {nota.objetivo}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-slate-400">
                            ANÁLISIS
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm min-h-20">
                            {nota.analisis}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-sm font-black text-slate-400">
                            PLAN
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm min-h-20">
                            {nota.plan}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* PESTAÑA: ANAMNESIS CLÍNICA */}
        {/* ========================================= */}
        {pestanaActiva === "anamnesis" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Historia Clínica y Anamnesis
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Antecedentes y contexto inicial del paciente.
                </p>
              </div>
              {!editandoAnamnesis && (
                <button
                  onClick={() => setEditandoAnamnesis(true)}
                  className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2"
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>{" "}
                  {anamnesis ? "Editar Anamnesis" : "Crear Anamnesis"}
                </button>
              )}
            </div>

            {cargandoAnamnesis ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : editandoAnamnesis ? (
              <form
                onSubmit={guardarAnamnesis}
                className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6 animate-in slide-in-from-bottom-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Motivo de Consulta (Demanda Inicial)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formAnamnesis.motivo_consulta}
                    onChange={(e) =>
                      setFormAnamnesis({
                        ...formAnamnesis,
                        motivo_consulta: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    placeholder="¿Por qué acude a terapia el paciente?..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Antecedentes Médicos / Psiquiátricos
                    </label>
                    <textarea
                      rows={4}
                      value={formAnamnesis.antecedentes_medicos}
                      onChange={(e) =>
                        setFormAnamnesis({
                          ...formAnamnesis,
                          antecedentes_medicos: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Antecedentes Familiares
                    </label>
                    <textarea
                      rows={4}
                      value={formAnamnesis.antecedentes_familiares}
                      onChange={(e) =>
                        setFormAnamnesis({
                          ...formAnamnesis,
                          antecedentes_familiares: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    ></textarea>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Historia Personal y Desarrollo
                  </label>
                  <textarea
                    rows={4}
                    value={formAnamnesis.historia_personal}
                    onChange={(e) =>
                      setFormAnamnesis({
                        ...formAnamnesis,
                        historia_personal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    placeholder="Infancia, educación, relaciones sociales..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditandoAnamnesis(false)}
                    className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoAnamnesis}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center min-w-50 justify-center"
                  >
                    {guardandoAnamnesis ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Guardar Anamnesis"
                    )}
                  </button>
                </div>
              </form>
            ) : !anamnesis ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                <p className="text-slate-500 font-medium">
                  Aún no has registrado la historia clínica inicial de este
                  paciente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h5 className="text-sm font-black text-indigo-800 uppercase tracking-wider mb-2">
                    Motivo de Consulta
                  </h5>
                  <p className="text-indigo-950 font-medium whitespace-pre-wrap">
                    {anamnesis.motivo_consulta}
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Antecedentes Médicos
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {anamnesis.antecedentes_medicos || "Sin registro."}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Antecedentes Familiares
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {anamnesis.antecedentes_familiares || "Sin registro."}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Historia Personal
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {anamnesis.historia_personal || "Sin registro."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESTO DE PESTAÑAS (En construcción) */}
        {pestanaActiva === "resumen" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Próximas Citas y Resumen
            </h3>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Módulo en construcción.
              </p>
            </div>
          </div>
        )}
        {pestanaActiva === "documentos" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Archivos Adjuntos
            </h3>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Módulo de documentos en construcción.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: NUEVA NOTA SOAP */}
      {modalNotaAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Nueva Evolución Clínica
                </h2>
              </div>
              <button
                onClick={() => setModalNotaAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                ❌
              </button>
            </div>
            <form onSubmit={guardarNota} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2">
                    Subjetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.subjetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, subjetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2">
                    Objetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.objetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, objetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2">
                    Análisis
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.analisis}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, analisis: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2">
                    Plan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.plan}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, plan: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardandoNota}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg min-w-50"
                >
                  {guardandoNota ? "..." : "Guardar Evolución"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

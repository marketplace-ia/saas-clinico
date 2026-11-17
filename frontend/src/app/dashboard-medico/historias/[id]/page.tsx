"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface HistoriaDetalle {
  id: string;
  motivo_consulta: string;
  antecedentes: string;
  evaluacion: string; // Se usa como Examen Físico Inicial
  plan_tratamiento: string;
  actualizado_en: string;
  pacientes?: {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
  };
}

interface Evolucion {
  id: string;
  numero_sesion: number;
  fecha: string;
  hora: string;
  modalidad: string;
  motivo_sesion: string; // Motivo de Consulta
  sintomas_relevantes: string; // Signos vitales / Enfermedad actual
  intervencion_tecnicas: string; // Diagnóstico CIE-10
  respuesta_paciente: string; // Plan de Tratamiento / Prescripción
  tareas_recomendaciones: string; // Exámenes solicitados
  proxima_sesion: string;
  creado_en: string;
}

export default function ExpedienteMedicoMSP() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [historia, setHistoria] = useState<HistoriaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState("evoluciones");

  const [evoluciones, setEvoluciones] = useState<Evolucion[]>([]);
  const [cargandoEvoluciones, setCargandoEvoluciones] = useState(false);
  const [modalNuevaEvolucion, setModalNuevaEvolucion] = useState(false);
  const [guardandoEvolucion, setGuardandoEvolucion] = useState(false);

  // 🟢 Formulario adaptado a medicina general
  const [nuevaConsulta, setNuevaConsulta] = useState({
    fecha: "",
    hora: "",
    modalidad: "Presencial",
    motivo_sesion: "",
    sintomas_relevantes: "",
    intervencion_tecnicas: "",
    respuesta_paciente: "",
    tareas_recomendaciones: "",
    proxima_sesion: "",
  });

  useEffect(() => {
    const inicializarFecha = async () => {
      setNuevaConsulta((prev) => ({
        ...prev,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    };
    inicializarFecha();
  }, []);

  const cargarHistoria = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("historias_clinicas")
        .select("*, pacientes(nombres, apellidos, email, telefono)")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) setHistoria(data as HistoriaDetalle);
    } catch (error) {
      console.error("Error al cargar historia:", error);
      alert("No se pudo cargar el expediente.");
      router.push("/dashboard-medico/historias");
    } finally {
      setCargando(false);
    }
  }, [id, router]);

  const cargarEvoluciones = useCallback(async () => {
    setCargandoEvoluciones(true);
    try {
      const { data, error } = await supabase
        .from("hcu_evoluciones")
        .select("*")
        .eq("historia_clinica_id", id)
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false });

      if (error) throw error;
      setEvoluciones(data || []);
    } catch (error) {
      console.error("Error cargando evoluciones:", error);
    } finally {
      setCargandoEvoluciones(false);
    }
  }, [id]);

  useEffect(() => {
    const inicializarDatos = async () => {
      if (id) {
        await cargarHistoria();
        await cargarEvoluciones();
      }
    };
    inicializarDatos();
  }, [id, cargarHistoria, cargarEvoluciones]);

  const guardarCambiosHCU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historia) return;
    setGuardando(true);
    try {
      const { error } = await supabase
        .from("historias_clinicas")
        .update({
          motivo_consulta: historia.motivo_consulta,
          antecedentes: historia.antecedentes,
          evaluacion: historia.evaluacion,
          plan_tratamiento: historia.plan_tratamiento,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      alert("✅ Ficha Base actualizada correctamente.");
    } catch (err) {
      console.error("Error actualizando ficha:", err);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEvolucionClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoEvolucion(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .maybeSingle();

      const { error } = await supabase.from("hcu_evoluciones").insert([
        {
          tenant_id: tu?.tenant_id || null,
          historia_clinica_id: id,
          psicologo_id: session.user.id, // Reutilizamos esta columna técnica por ahora
          numero_sesion: evoluciones.length + 1,
          ...nuevaConsulta,
        },
      ]);

      if (error) throw error;

      setModalNuevaEvolucion(false);
      setNuevaConsulta({
        ...nuevaConsulta,
        motivo_sesion: "",
        sintomas_relevantes: "",
        intervencion_tecnicas: "",
        respuesta_paciente: "",
        tareas_recomendaciones: "",
        proxima_sesion: "",
      });
      cargarEvoluciones();
    } catch (err) {
      console.error("Error guardando consulta:", err);
      alert("Error al registrar la consulta.");
    } finally {
      setGuardandoEvolucion(false);
    }
  };

  if (cargando)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );

  if (!historia) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard-medico/historias"
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 leading-none">
                    {historia.pacientes
                      ? `${historia.pacientes.nombres} ${historia.pacientes.apellidos}`
                      : "Paciente Desconocido"}
                  </h1>
                </div>
                <div className="flex gap-4 mt-2 text-sm text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    🆔 HCU: {id.split("-")[0].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex gap-3">
              <button
                onClick={() => setModalNuevaEvolucion(true)}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition text-sm flex items-center gap-2 shadow-sm"
              >
                + Nueva Consulta Médica
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex overflow-x-auto hide-scrollbar gap-1 border-b border-slate-200">
            {[
              { id: "evoluciones", label: "Consultas y Evolución" },
              { id: "hcu", label: "Ficha Médica Base (Antecedentes)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPestanaActiva(tab.id)}
                className={`px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${pestanaActiva === tab.id ? "border-teal-600 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        {pestanaActiva === "evoluciones" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Historial Clínico de Consultas
                </h2>
              </div>
            </div>

            {cargandoEvoluciones ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
            ) : evoluciones.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center border-dashed">
                <h3 className="text-lg font-bold text-slate-700 mt-4">
                  Sin atenciones registradas
                </h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6 text-sm">
                  Registra la primera consulta para iniciar la evolución
                  clínica.
                </p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {evoluciones.map((evo) => (
                  <div
                    key={evo.id}
                    className="relative pl-12 md:pl-16 group animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="absolute left-0 w-10 h-10 md:w-12 md:h-12 bg-white border-4 border-teal-50 rounded-full flex items-center justify-center shadow-sm z-10 text-teal-600">
                      <span className="font-black text-sm">
                        {evoluciones.length - evoluciones.indexOf(evo)}
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-lg font-black text-slate-900 capitalize flex items-center gap-2">
                            {new Date(evo.fecha).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </h4>
                          <span className="inline-block mt-2 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md uppercase">
                            {evo.modalidad}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {evo.motivo_sesion && (
                          <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                              Motivo de Consulta y Enfermedad Actual
                            </h5>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {evo.motivo_sesion}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {evo.sintomas_relevantes && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-2">
                                Signos Vitales y Examen Físico
                              </h5>
                              <p className="text-slate-700 text-sm">
                                {evo.sintomas_relevantes}
                              </p>
                            </div>
                          )}
                          {evo.intervencion_tecnicas && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <h5 className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2">
                                Diagnóstico Presuntivo / Definitivo (CIE-10)
                              </h5>
                              <p className="text-slate-700 text-sm font-bold">
                                {evo.intervencion_tecnicas}
                              </p>
                            </div>
                          )}
                        </div>
                        {evo.respuesta_paciente && (
                          <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                              Plan de Tratamiento y Prescripción
                            </h5>
                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {evo.respuesta_paciente}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestanaActiva === "hcu" && (
          <form onSubmit={guardarCambiosHCU} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800">
                  B. Motivo de Consulta Inicial
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={3}
                  value={historia.motivo_consulta || ""}
                  onChange={(e) =>
                    setHistoria({
                      ...historia,
                      motivo_consulta: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                ></textarea>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800">
                  D, E, F. Antecedentes Personales, Familiares y Hábitos
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={4}
                  value={historia.antecedentes || ""}
                  onChange={(e) =>
                    setHistoria({ ...historia, antecedentes: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                ></textarea>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-black text-slate-800">
                  H. Examen Físico Base (Constitución, Peso, Talla)
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={3}
                  value={historia.evaluacion || ""}
                  onChange={(e) =>
                    setHistoria({ ...historia, evaluacion: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end sticky bottom-6 z-10">
              <button
                type="submit"
                disabled={guardando}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-2xl transition-all disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "💾 Actualizar Ficha Base"}
              </button>
            </div>
          </form>
        )}
      </main>

      {modalNuevaEvolucion && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Registrar Consulta Médica
              </h2>
              <button
                onClick={() => setModalNuevaEvolucion(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={guardarEvolucionClinica}
              className="p-6 space-y-6 overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <label className="flex text-xs font-bold text-slate-700 uppercase mb-2">
                    Fecha de Consulta *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevaConsulta.fecha}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        fecha: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="flex text-xs font-bold text-slate-700 uppercase mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={nuevaConsulta.hora}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        hora: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="flex text-xs font-bold text-slate-700 uppercase mb-2">
                    Modalidad *
                  </label>
                  <select
                    required
                    value={nuevaConsulta.modalidad}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        modalidad: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Presencial">Consulta Presencial</option>
                    <option value="Online">Telemedicina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Motivo de Consulta y Enfermedad Actual *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaConsulta.motivo_sesion}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        motivo_sesion: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Signos Vitales y Examen Físico
                  </label>
                  <textarea
                    rows={4}
                    value={nuevaConsulta.sintomas_relevantes}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        sintomas_relevantes: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Diagnóstico (CIE-10) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={nuevaConsulta.intervencion_tecnicas}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        intervencion_tecnicas: e.target.value,
                      })
                    }
                    placeholder="Ej: J01.9 - Sinusitis aguda, no especificada"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Plan de Tratamiento / Prescripción *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={nuevaConsulta.respuesta_paciente}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        respuesta_paciente: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Exámenes de Laboratorio / Imagen
                  </label>
                  <input
                    type="text"
                    value={nuevaConsulta.tareas_recomendaciones}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        tareas_recomendaciones: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="flex text-sm font-bold text-slate-700 mb-2">
                    Fecha sugerida próxima cita
                  </label>
                  <input
                    type="text"
                    value={nuevaConsulta.proxima_sesion}
                    onChange={(e) =>
                      setNuevaConsulta({
                        ...nuevaConsulta,
                        proxima_sesion: e.target.value,
                      })
                    }
                    placeholder="Ej: En 15 días"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={guardandoEvolucion}
                  className="px-10 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {guardandoEvolucion
                    ? "Guardando..."
                    : "Firmar Consulta Médica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

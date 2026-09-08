"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
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

export default function FichaPacientePage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState("evolucion");

  // Estados para Notas de Evolución
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

  // CARGAR DATOS DEL PACIENTE
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
        console.error("Error cargando paciente:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarDatosPaciente();
  }, [pacienteId]);

  // CARGAR NOTAS CLÍNICAS
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
      console.error("Error cargando notas:", error);
    } finally {
      setCargandoNotas(false);
    }
  }, [pacienteId]);

  // 🛡️ SOLUCIÓN AL ERROR ROJO: Cápsula asíncrona segura
  useEffect(() => {
    const iniciarCargaNotas = async () => {
      if (pestanaActiva === "evolucion") {
        await cargarNotas();
      }
    };
    iniciarCargaNotas();
  }, [pestanaActiva, cargarNotas]);

  // GUARDAR NUEVA NOTA SOAP
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
          subjetivo: nuevaNota.subjetivo,
          objetivo: nuevaNota.objetivo,
          analisis: nuevaNota.analisis,
          plan: nuevaNota.plan,
        },
      ]);

      if (error) throw error;

      // Limpiar y recargar
      setNuevaNota({ subjetivo: "", objetivo: "", analisis: "", plan: "" });
      setModalNotaAbierto(false);
      cargarNotas();
    } catch (error) {
      console.error("Error al guardar nota:", error);
      alert("Hubo un error al guardar la evolución médica.");
    } finally {
      setGuardandoNota(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-black text-slate-800">
          Paciente no encontrado
        </h2>
        <button
          onClick={() => router.push("/dashboard-psicologo/pacientes")}
          className="mt-4 text-indigo-600 font-bold hover:underline"
        >
          Volver al directorio
        </button>
      </div>
    );
  }

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
        </svg>
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>{" "}
                  {paciente.email}
                </span>
              )}
              {paciente.telefono && (
                <span className="flex items-center gap-1.5">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>{" "}
                  {paciente.telefono}
                </span>
              )}
              <span className="flex items-center gap-1.5">
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
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  ></path>
                </svg>{" "}
                ID: {paciente.id.split("-")[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "evolucion", nombre: "Notas de Evolución" },
          { id: "resumen", nombre: "Resumen Clínico" },
          { id: "anamnesis", nombre: "Anamnesis" },
          { id: "documentos", nombre: "Documentos" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
              pestanaActiva === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.nombre}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-100">
        {/* PESTAÑA: NOTAS DE EVOLUCIÓN (MÓDULO SOAP) */}
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
                </svg>
                Nueva Nota SOAP
              </button>
            </div>

            {cargandoNotas ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : notas.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    ></path>
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-1">
                  Sin evoluciones médicas
                </h4>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  Comienza el historial clínico de este paciente agregando su
                  primera nota de evolución.
                </p>
              </div>
            ) : (
              /* 🛡️ SOLUCIÓN AL ERROR AMARILLO: bg-linear-to-b actualizado */
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {notas.map((nota) => (
                  <div key={nota.id} className="relative pl-12 md:pl-16 group">
                    <div className="absolute left-0 w-10 h-10 md:w-12 md:h-12 bg-indigo-50 border-4 border-white rounded-full flex items-center justify-center shadow-sm z-10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow group-hover:border-indigo-200">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                        <h4 className="text-lg font-black text-slate-900">
                          {new Date(nota.fecha).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          ID: {nota.id.split("-")[0]}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 🛡️ SOLUCIÓN AL ERROR AMARILLO: min-h-[5rem] -> min-h-20 */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>{" "}
                            (S) Subjetivo
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed text-sm min-h-20 border border-slate-100">
                            {nota.subjetivo || "Sin registro."}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{" "}
                            (O) Objetivo
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed text-sm min-h-20 border border-slate-100">
                            {nota.objetivo || "Sin registro."}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>{" "}
                            (A) Análisis
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed text-sm min-h-20 border border-slate-100">
                            {nota.analisis || "Sin registro."}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>{" "}
                            (P) Plan
                          </h5>
                          <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed text-sm min-h-20 border border-slate-100">
                            {nota.plan || "Sin registro."}
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

        {/* RESTO DE PESTAÑAS */}
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
        {pestanaActiva === "anamnesis" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Historia Clínica Inicial
            </h3>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Módulo de ficha médica en construcción.
              </p>
            </div>
          </div>
        )}
        {pestanaActiva === "documentos" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                Archivos Adjuntos
              </h3>
              <button className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                Subir Archivo
              </button>
            </div>
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
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Formato Estándar SOAP
                </p>
              </div>
              <button
                onClick={() => setModalNotaAbierto(false)}
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

            <form onSubmit={guardarNota} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>{" "}
                    (S) Subjetivo
                  </label>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Lo que relata el paciente (síntomas, estado de ánimo).
                  </p>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.subjetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, subjetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 text-sm resize-none"
                    placeholder="Ej: Paciente refiere sentirse con altos niveles de ansiedad durante la semana..."
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>{" "}
                    (O) Objetivo
                  </label>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Observaciones del terapeuta (lenguaje corporal, afecto).
                  </p>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.objetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, objetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 text-sm resize-none"
                    placeholder="Ej: Se observa inquietud motora, contacto visual evasivo..."
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>{" "}
                    (A) Análisis
                  </label>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Interpretación profesional y evaluación del progreso.
                  </p>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.analisis}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, analisis: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-slate-900 text-sm resize-none"
                    placeholder="Ej: Los síntomas coinciden con trastorno de ansiedad generalizada. Hay resistencia a..."
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>{" "}
                    (P) Plan
                  </label>
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Siguientes pasos, tareas asignadas y próxima cita.
                  </p>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.plan}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, plan: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-900 text-sm resize-none"
                    placeholder="Ej: Tarea: Ejercicios de respiración diafragmática. Próxima sesión en 7 días."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                {/* 🛡️ SOLUCIÓN AL ERROR AMARILLO: min-w-[200px] -> min-w-50 */}
                <button
                  type="submit"
                  disabled={guardandoNota}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-50"
                >
                  {guardandoNota ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Guardar Evolución"
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

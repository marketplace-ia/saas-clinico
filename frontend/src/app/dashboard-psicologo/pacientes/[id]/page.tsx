"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  identificacion?: string;
}

interface NotaEvolucion {
  id: string;
  creado_el: string;
  contenido: string;
  diagnostico_cie10?: string | null;
}

interface HistoriaClinica {
  id: string;
  motivo_consulta: string | null;
  antecedentes_personales: string | null;
  antecedentes_familiares: string | null;
  formularios_msp?: Record<string, string>;
}

export default function FichaPacientePage() {
  const params = useParams();
  const pacienteId = params.id as string;

  // ESTADOS PRINCIPALES
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historia, setHistoria] = useState<HistoriaClinica | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorUI, setErrorUI] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState("evolucion");

  // MÓDULO: EVOLUCIONES (NOTAS)
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

  // MÓDULO: HISTORIA CLÍNICA (ANAMNESIS)
  const [editandoAnamnesis, setEditandoAnamnesis] = useState(false);
  const [guardandoAnamnesis, setGuardandoAnamnesis] = useState(false);
  const [formAnamnesis, setFormAnamnesis] = useState({
    motivo_consulta: "",
    antecedentes_personales: "",
    antecedentes_familiares: "",
    historia_personal: "",
  });

  // 1. CARGA INICIAL (PACIENTE E HISTORIA CLÍNICA)
  const cargarDatosPrincipales = useCallback(async () => {
    if (!pacienteId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión clínica no detectada.");

      // Cargar Paciente
      const { data: dataPaciente, error: errPaciente } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", pacienteId)
        .single();

      if (errPaciente) throw new Error("Paciente no encontrado o sin acceso.");
      setPaciente(dataPaciente);

      // 🟢 CORRECCIÓN ESLINT: Separar consulta para usar const en el error
      const respuestaHistoria = await supabase
        .from("historias_clinicas")
        .select("*")
        .eq("paciente_id", pacienteId)
        .maybeSingle();

      let dataHistoria = respuestaHistoria.data;
      const errHistoria = respuestaHistoria.error;

      // Autoinicialización si no existe
      if (!dataHistoria && !errHistoria) {
        const { data: tu } = await supabase
          .from("tenant_users")
          .select("tenant_id")
          .eq("usuario_id", user.id)
          .single();
        if (tu) {
          const { data: nuevaHist } = await supabase
            .from("historias_clinicas")
            .insert({
              tenant_id: tu.tenant_id,
              paciente_id: pacienteId,
              psicologo_id: user.id,
            })
            .select()
            .single();
          dataHistoria = nuevaHist;
        }
      }

      if (dataHistoria) {
        setHistoria(dataHistoria);
        setFormAnamnesis({
          motivo_consulta: dataHistoria.motivo_consulta || "",
          antecedentes_personales: dataHistoria.antecedentes_personales || "",
          antecedentes_familiares: dataHistoria.antecedentes_familiares || "",
          historia_personal:
            dataHistoria.formularios_msp?.historia_personal || "",
        });
      }
    } catch (error: unknown) {
      setErrorUI(error instanceof Error ? error.message : "Error interno");
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  // 🟢 CORRECCIÓN REACT: Envoltura asíncrona local
  useEffect(() => {
    const iniciarCarga = async () => {
      await cargarDatosPrincipales();
    };
    iniciarCarga();
  }, [cargarDatosPrincipales]);

  // 2. CARGA DE NOTAS (BÓVEDA PRIVADA)
  const cargarNotas = useCallback(async () => {
    if (!historia) return;
    setCargandoNotas(true);
    try {
      const { data, error } = await supabase
        .from("notas_clinicas")
        .select("*")
        .eq("historia_id", historia.id)
        .order("creado_el", { ascending: false });
      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error("Error notas:", error);
    } finally {
      setCargandoNotas(false);
    }
  }, [historia]);

  // 🟢 CORRECCIÓN REACT: Envoltura asíncrona local
  useEffect(() => {
    const iniciarNotas = async () => {
      if (pestanaActiva === "evolucion" && historia) {
        await cargarNotas();
      }
    };
    iniciarNotas();
  }, [pestanaActiva, historia, cargarNotas]);

  // 🤖 3. RECEPTORES DEL ASISTENTE IA (INTACTOS)
  useEffect(() => {
    const abrirModalNota = () => {
      setPestanaActiva("evolucion");
      setModalNotaAbierto(true);
    };
    const abrirEdicionAnamnesis = () => {
      setPestanaActiva("anamnesis");
      setEditandoAnamnesis(true);
    };
    window.addEventListener("BOT_NUEVA_NOTA_SOAP", abrirModalNota);
    window.addEventListener("BOT_EDITAR_ANAMNESIS", abrirEdicionAnamnesis);
    return () => {
      window.removeEventListener("BOT_NUEVA_NOTA_SOAP", abrirModalNota);
      window.removeEventListener("BOT_EDITAR_ANAMNESIS", abrirEdicionAnamnesis);
    };
  }, []);

  // 4. GUARDADO EN LA NUEVA ARQUITECTURA
  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historia) return;
    setGuardandoNota(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const contenidoEstructurado = `SUBJETIVO:\n${nuevaNota.subjetivo}\n\nOBJETIVO:\n${nuevaNota.objetivo}\n\nANÁLISIS:\n${nuevaNota.analisis}\n\nPLAN:\n${nuevaNota.plan}`;

      const { error } = await supabase.from("notas_clinicas").insert([
        {
          historia_id: historia.id,
          psicologo_id: session?.user.id,
          tipo_nota: "evolucion",
          contenido: contenidoEstructurado,
        },
      ]);
      if (error) throw error;

      setNuevaNota({ subjetivo: "", objetivo: "", analisis: "", plan: "" });
      setModalNotaAbierto(false);
      cargarNotas();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la evolución médica en bóveda.");
    } finally {
      setGuardandoNota(false);
    }
  };

  const guardarAnamnesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historia) return;
    setGuardandoAnamnesis(true);
    try {
      const { error } = await supabase
        .from("historias_clinicas")
        .update({
          motivo_consulta: formAnamnesis.motivo_consulta,
          antecedentes_personales: formAnamnesis.antecedentes_personales,
          antecedentes_familiares: formAnamnesis.antecedentes_familiares,
          formularios_msp: {
            historia_personal: formAnamnesis.historia_personal,
          },
        })
        .eq("id", historia.id);

      if (error) throw error;

      await cargarDatosPrincipales();
      setEditandoAnamnesis(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la Historia Clínica.");
    } finally {
      setGuardandoAnamnesis(false);
    }
  };

  if (cargando)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  if (errorUI || !paciente)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-black text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500">
          {errorUI || "No tienes permisos para ver este expediente."}
        </p>
        <Link
          href="/dashboard-psicologo/pacientes"
          className="mt-4 inline-block text-indigo-600 font-bold"
        >
          Volver
        </Link>
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative pb-20">
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

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-50 to-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-500/30 shrink-0 uppercase">
            {paciente.nombres.charAt(0)}
            {paciente.apellidos.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900">
                {paciente.nombres} {paciente.apellidos}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Expediente Activo
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
                🆔 ID: {paciente.identificacion || "N/A"}
              </span>
              {paciente.fecha_nacimiento && (
                <span className="flex items-center gap-1.5">
                  🎂 Edad:{" "}
                  {new Date().getFullYear() -
                    new Date(paciente.fecha_nacimiento).getFullYear()}{" "}
                  años
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "evolucion", nombre: "Notas de Evolución" },
          { id: "anamnesis", nombre: "Historia Clínica Inicial" },
          { id: "documentos", nombre: "Documentos Adjuntos" },
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

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-100">
        {pestanaActiva === "evolucion" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Bóveda de Evoluciones
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
                        {new Date(nota.creado_el).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {nota.contenido}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pestanaActiva === "anamnesis" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Historia Clínica y Anamnesis
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Antecedentes estructurados (MSP).
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
                  </svg>
                  Editar Expediente
                </button>
              )}
            </div>

            {editandoAnamnesis ? (
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
                      Antecedentes Personales / Psiquiátricos
                    </label>
                    <textarea
                      rows={4}
                      value={formAnamnesis.antecedentes_personales}
                      onChange={(e) =>
                        setFormAnamnesis({
                          ...formAnamnesis,
                          antecedentes_personales: e.target.value,
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
                      "Guardar Expediente"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <h5 className="text-sm font-black text-indigo-800 uppercase tracking-wider mb-2">
                    Motivo de Consulta
                  </h5>
                  <p className="text-indigo-950 font-medium whitespace-pre-wrap">
                    {historia?.motivo_consulta || "Sin registro."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Antecedentes Personales
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {historia?.antecedentes_personales || "Sin registro."}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Antecedentes Familiares
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {historia?.antecedentes_familiares || "Sin registro."}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h5 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    Historia Personal
                  </h5>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-24">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {historia?.formularios_msp?.historia_personal ||
                        "Sin registro."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {pestanaActiva === "documentos" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Archivos Adjuntos
            </h3>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Módulo de documentos en construcción para la Fase 4.
              </p>
            </div>
          </div>
        )}
      </div>

      {modalNotaAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-10000 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Nueva Evolución SOAP
              </h2>
              <button
                onClick={() => setModalNotaAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                ❌
              </button>
            </div>
            <form onSubmit={guardarNota} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Subjetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.subjetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, subjetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Objetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.objetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, objetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Análisis
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.analisis}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, analisis: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Plan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.plan}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, plan: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardandoNota}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg min-w-50"
                >
                  {guardandoNota ? "..." : "Guardar Bóveda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

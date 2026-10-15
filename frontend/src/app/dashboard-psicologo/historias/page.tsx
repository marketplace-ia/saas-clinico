"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
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
    nombres: string;
    apellidos: string;
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

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .single();
      if (!tu) throw new Error("No tienes clínica asignada");

      const { data: dataPacientes } = await supabase
        .from("pacientes")
        .select("id, nombres, apellidos")
        .eq("tenant_id", tu.tenant_id)
        .order("apellidos");

      if (dataPacientes) setListaPacientes(dataPacientes);

      const { data: dataHistorias, error } = await supabase
        .from("historias_clinicas")
        .select(`*, pacientes(nombres, apellidos)`)
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

  // 🟢 NASIMPA: Async wrapper tapno maliklikan ti biddut ti ESLint
  useEffect(() => {
    const inicializar = async () => {
      await cargarDatos();
    };
    inicializar();
  }, [cargarDatos]);

  useEffect(() => {
    const abrirModalHistoria = () => setModalAbierto(true);
    window.addEventListener("BOT_NUEVA_HISTORIA", abrirModalHistoria);
    return () =>
      window.removeEventListener("BOT_NUEVA_HISTORIA", abrirModalHistoria);
  }, []);

  const guardarHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaHistoria.paciente_id) return alert("Selecciona un paciente.");

    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .single();

      const { error } = await supabase.from("historias_clinicas").insert([
        {
          tenant_id: tu?.tenant_id,
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
          Nueva Historia
        </button>
      </div>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : historias.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No hay expedientes clínicos
          </h3>
          <p className="text-slate-500 max-w-sm">
            Haz clic en &quot;Nueva Historia&quot; para abrir un expediente.
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
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black uppercase">
                    {historia.pacientes?.nombres?.charAt(0) || "?"}
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {historia.pacientes
                      ? `${historia.pacientes.nombres} ${historia.pacientes.apellidos}`
                      : "Paciente Desconocido"}
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
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">
                  Actualizado:{" "}
                  {new Date(historia.actualizado_en).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard-psicologo/historias/${historia.id}`}
                  className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
                >
                  Abrir Expediente
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Apertura de Historia Clínica
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={guardarHistoria}
              className="p-6 space-y-6 overflow-y-auto"
            >
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
                      {paciente.nombres} {paciente.apellidos}
                    </option>
                  ))}
                </select>
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

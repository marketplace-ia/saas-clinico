"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// 1. Le decimos a TypeScript exactamente qué forma tiene nuestro expediente
interface HistoriaDetalle {
  id: string;
  motivo_consulta: string;
  antecedentes: string;
  evaluacion: string;
  plan_tratamiento: string;
  actualizado_en: string;
  pacientes?: {
    nombre_completo: string;
    email: string;
    telefono: string;
  };
}

export default function HistoriaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // 2. Reemplazamos el "any" por nuestra nueva interfaz "HistoriaDetalle"
  const [historia, setHistoria] = useState<HistoriaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarHistoria = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("historias_clinicas")
        .select("*, pacientes(nombre_completo, email, telefono)")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) setHistoria(data as HistoriaDetalle);
    } catch (error) {
      console.error("Error al cargar historia:", error);
      alert("No se pudo cargar el expediente.");
      router.push("/dashboard-psicologo/historias");
    } finally {
      setCargando(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      const inicializar = async () => await cargarHistoria();
      inicializar();
    }
  }, [id, cargarHistoria]);

  const guardarCambios = async (e: React.FormEvent) => {
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
      alert("¡Expediente actualizado correctamente! ✅");
    } catch (error) {
      console.error("Error actualizando:", error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!historia) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* NAVEGACIÓN Y CABECERA */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard-psicologo/historias"
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 hover:text-indigo-600"
          title="Volver"
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
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Expediente Clínico
          </h1>
          <p className="text-slate-500 font-medium">
            Paciente:{" "}
            <strong className="text-indigo-600">
              {historia.pacientes?.nombre_completo}
            </strong>
          </p>
        </div>
      </div>

      <form
        onSubmit={guardarCambios}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
      >
        {/* INFO DEL PACIENTE */}
        <div className="flex flex-wrap gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {historia.pacientes?.telefono || "Sin teléfono registrado"}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {historia.pacientes?.email || "Sin correo registrado"}
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 ml-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Última actualización:{" "}
            </span>
            {new Date(historia.actualizado_en).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* CAMPOS MÉDICOS */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Motivo de Consulta
          </label>
          <textarea
            rows={2}
            value={historia.motivo_consulta || ""}
            onChange={(e) =>
              setHistoria({ ...historia, motivo_consulta: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-y"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Antecedentes Clínicos / Familiares
          </label>
          <textarea
            rows={4}
            value={historia.antecedentes || ""}
            onChange={(e) =>
              setHistoria({ ...historia, antecedentes: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-y"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Evaluación Psicológica
          </label>
          <textarea
            rows={6}
            value={historia.evaluacion || ""}
            onChange={(e) =>
              setHistoria({ ...historia, evaluacion: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-y"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Plan de Tratamiento y Objetivos
          </label>
          <textarea
            rows={4}
            value={historia.plan_tratamiento || ""}
            onChange={(e) =>
              setHistoria({ ...historia, plan_tratamiento: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-medium resize-y"
          ></textarea>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={guardando}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {guardando && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Guardar Cambios del Expediente
          </button>
        </div>
      </form>
    </div>
  );
}

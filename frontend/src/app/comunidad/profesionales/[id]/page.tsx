"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../../../lib/supabase"; // 🟢 CORRECCIÓN: Ruta exacta al archivo Supabase

interface Perfil {
  psicologo_id: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  ciudad: string;
  experiencia_anos: number;
}

export default function PerfilPublicoPage() {
  const params = useParams();
  const psicologoId = params?.id as string;

  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [errorBD, setErrorBD] = useState<string | null>(null);

  useEffect(() => {
    let montado = true;

    const cargarPerfil = async () => {
      try {
        if (!psicologoId) return;

        const { data, error } = await supabase
          .from("perfil_psicologo")
          .select("*")
          .eq("psicologo_id", psicologoId)
          .single();

        if (error) throw error;

        if (montado && data) {
          setPerfil(data as Perfil);
          setErrorBD(null);
        }
      } catch (error: unknown) {
        if (montado) {
          console.error("Error al cargar perfil público:", error);
          setErrorBD("No se pudo cargar la información del perfil.");
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarPerfil();
    return () => {
      montado = false;
    };
  }, [psicologoId]);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase animate-pulse">
          Cargando perfil profesional...
        </p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold mb-4">
          {errorBD || "Perfil no encontrado."}
        </p>
        <Link
          href="/comunidad/profesionales"
          className="text-indigo-600 font-bold hover:underline"
        >
          Volver al directorio
        </Link>
      </div>
    );
  }

  const nombreCompleto = `${perfil.nombres} ${perfil.apellidos}`;

  return (
    <div className="w-full animate-in fade-in duration-700 slide-in-from-bottom-4 max-w-5xl mx-auto pb-12">
      <Link
        href="/comunidad/profesionales"
        className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors mb-6 bg-indigo-50 px-4 py-2 rounded-xl"
      >
        <span aria-hidden="true">&larr;</span> Volver al Directorio
      </Link>

      <div className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 mb-8 relative">
        <div className="h-40 md:h-48 w-full bg-linear-to-r from-indigo-500 to-purple-600 relative"></div>

        <div className="px-8 md:px-12 pb-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 md:-mt-20 mb-8">
            <div className="flex items-end gap-5">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-5xl md:text-6xl font-black text-slate-400 shadow-lg shrink-0">
                {perfil.nombres ? perfil.nombres.charAt(0) : "U"}
              </div>
              <div className="pb-2 md:pb-4">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-1">
                  {nombreCompleto}
                </h1>
                <p className="text-indigo-600 font-bold text-lg">
                  {perfil.especialidad || "Salud Mental"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-md">
                Agendar Cita
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Ubicación
              </p>
              <p className="text-slate-900 font-bold text-sm">
                {perfil.ciudad || "No especificada"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                Experiencia
              </p>
              <p className="text-slate-900 font-bold text-sm">
                {perfil.experiencia_anos || 1} años
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

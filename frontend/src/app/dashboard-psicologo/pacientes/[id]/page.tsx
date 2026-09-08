"use client";

import { useState, useEffect } from "react";
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

export default function FichaPacientePage() {
  const params = useParams();
  const router = useRouter();
  const pacienteId = params.id as string;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState("resumen");

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

    if (pacienteId) {
      cargarDatosPaciente();
    }
  }, [pacienteId]);

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
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Botón de retroceso */}
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
          <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-500/30">
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

      {/* MENÚ DE NAVEGACIÓN INTERNA */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "resumen", nombre: "Resumen Clínico" },
          { id: "evolucion", nombre: "Notas de Evolución" },
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

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-100">
        {pestanaActiva === "resumen" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              Próximas Citas y Resumen
            </h3>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Módulo en construcción. Aquí se conectará la agenda con este
                paciente.
              </p>
            </div>
          </div>
        )}

        {pestanaActiva === "evolucion" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">
                Historial de Sesiones
              </h3>
              <button className="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                + Nueva Nota SOAP
              </button>
            </div>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-slate-500 font-medium">
                Aún no hay notas de evolución registradas para este paciente.
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
                Módulo de ficha médica integral en construcción.
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
                Sube consentimientos informados o resultados de pruebas
                psicológicas aquí.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Nota {
  id: string;
  psicologo: string;
  fecha: string;
  contenido: string;
}

export default function HistorialPacientePage() {
  const [pestanaActiva, setPestanaActiva] = useState<
    "sesiones" | "tareas" | "documentos"
  >("sesiones");
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. TU LÓGICA INTACTA: OBTENER HISTORIAL DESDE SUPABASE
  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) return;

        const { data, error } = await supabase
          .from("notas_clinicas")
          .select("*")
          .eq("paciente_correo", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setNotas(data);
      } catch (error: unknown) {
        const err = error as {
          message?: string;
          details?: string;
          hint?: string;
        };
        const mensajeReal = err?.message || err?.details || String(error);
        console.log("Detalle del error:", mensajeReal);
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorial();
  }, []);

  // 2. MOCKS PARA TAREAS Y EJERCICIOS (Se conectarán a BD luego)
  const tareas = [
    {
      id: "tar-1",
      titulo: "Registro de Pensamientos Automáticos",
      descripcion:
        "Llena este formato de PDF cada vez que sientas ansiedad aguda durante la semana. Tráelo a la próxima sesión.",
      fechaAsignacion: "18 Sep 2026",
      estado: "Pendiente",
      tipo: "PDF",
      color: "amber",
    },
    {
      id: "tar-2",
      titulo: "Lectura: Los límites de la asertividad",
      descripcion:
        "Artículo recomendado de nuestra biblioteca de PsiEduca para complementar lo conversado hoy.",
      fechaAsignacion: "04 Sep 2026",
      estado: "Completada",
      tipo: "Lectura",
      enlace: "/comunidad/articulos/art-2",
      color: "emerald",
    },
  ];

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* CABECERA */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Mi Historial Clínico
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            Revisa la evolución de tu tratamiento, descarga ejercicios y accede
            a tus documentos encriptados.
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl font-bold text-sm border border-indigo-100 flex items-center gap-2 shadow-sm shrink-0">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          Datos Encriptados
        </div>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-10 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setPestanaActiva("sesiones")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pestanaActiva === "sesiones"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
          }`}
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Sesiones Pasadas
        </button>
        <button
          onClick={() => setPestanaActiva("tareas")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pestanaActiva === "tareas"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          Tareas y Ejercicios
        </button>
        <button
          onClick={() => setPestanaActiva("documentos")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            pestanaActiva === "documentos"
              ? "bg-teal-600 text-white shadow-md"
              : "text-slate-500 hover:text-teal-600 hover:bg-teal-50"
          }`}
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
          Documentos
        </button>
      </div>

      {/* CONTENEDOR DE PESTAÑAS */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* PESTAÑA: SESIONES */}
        {pestanaActiva === "sesiones" && (
          <div>
            {cargando ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold">
                  Descifrando tu expediente médico...
                </p>
              </div>
            ) : notas.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-4xl p-16 text-center shadow-sm max-w-3xl mx-auto">
                <div className="text-6xl mb-4">🗂️</div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Expediente en blanco
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Aún no hay notas clínicas registradas en tu historial. Estas
                  aparecerán aquí después de tu primera sesión con el
                  especialista.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-4xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-indigo-200 before:to-transparent">
                  {notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                      </div>

                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-900">
                            {nota.psicologo}
                          </span>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {nota.fecha}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                          {nota.contenido}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: TAREAS */}
        {pestanaActiva === "tareas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            {tareas.map((tarea) => (
              <div
                key={tarea.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-${tarea.color}-50 text-${tarea.color}-600 flex items-center justify-center shadow-inner`}
                  >
                    {tarea.tipo === "PDF" ? (
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ) : (
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
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      tarea.estado === "Pendiente"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {tarea.estado}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
                  {tarea.titulo}
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-6 flex-1">
                  {tarea.descripcion}
                </p>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-slate-400">
                    Asignado: {tarea.fechaAsignacion}
                  </span>
                  {tarea.enlace ? (
                    <Link
                      href={tarea.enlace}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      Ir al artículo <span aria-hidden="true">&rarr;</span>
                    </Link>
                  ) : (
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                      Descargar PDF
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA: DOCUMENTOS */}
        {pestanaActiva === "documentos" && (
          <div className="bg-white rounded-4xl p-12 text-center border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              No hay documentos clínicos
            </h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Los consentimientos informados, certificados y recetas emitidas
              por tu especialista aparecerán aquí de forma segura.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

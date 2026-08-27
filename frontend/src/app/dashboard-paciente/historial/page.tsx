"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

interface Nota {
  id: string;
  psicologo: string;
  fecha: string;
  contenido: string;
}

export default function HistorialPacientePage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerHistorial = async () => {
      try {
        // 1. Identificamos al paciente logueado
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.email) return;

        // 2. Traemos SOLO las notas clínicas que le pertenecen a este correo
        const { data, error } = await supabase
          .from("notas_clinicas")
          .select("*")
          .eq("paciente_correo", user.email)
          .order("created_at", { ascending: false }); // Las más recientes primero

        if (error) throw error;
        if (data) setNotas(data);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerHistorial();
  }, []);

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Mi Historial Clínico
          </h1>
          <p className="text-gray-500">
            Revisa la evolución de tu tratamiento y las notas de tu
            especialista.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm border border-blue-100 flex items-center gap-2">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Datos Encriptados
        </div>
      </div>

      {/* Contenido del Historial */}
      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">
            Descifrando tu expediente médico...
          </p>
        </div>
      ) : notas.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-4xl p-16 text-center shadow-sm">
          <div className="text-6xl mb-4">🗂️</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Expediente en blanco
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Aún no hay notas clínicas registradas en tu historial. Estas
            aparecerán aquí después de tu primera sesión con el especialista.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-4xl p-8 shadow-sm">
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-blue-200 before:to-transparent">
            {notas.map((nota) => (
              <div
                key={nota.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
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

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">
                      {nota.psicologo}
                    </span>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {nota.fecha}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {nota.contenido}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

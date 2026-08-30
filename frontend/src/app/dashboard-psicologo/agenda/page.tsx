"use client";

import { useState } from "react";

// Interfaces para TypeScript
interface Cita {
  id: string;
  paciente: string;
  horaInicio: string; // Formato HH:MM
  horaFin: string;
  tipo: string;
  estado: "Confirmada" | "Pendiente" | "Cancelada";
}

// Datos simulados (Mock Data) para visualizar la agenda
const citasSimuladas: Cita[] = [
  {
    id: "1",
    paciente: "Carlos Mendoza",
    horaInicio: "09:00",
    horaFin: "10:00",
    tipo: "Terapia Individual",
    estado: "Confirmada",
  },
  {
    id: "2",
    paciente: "Ana Lucía Ortiz",
    horaInicio: "11:30",
    horaFin: "12:30",
    tipo: "Seguimiento",
    estado: "Pendiente",
  },
  {
    id: "3",
    paciente: "Javier Silva",
    horaInicio: "15:00",
    horaFin: "16:00",
    tipo: "Evaluación Inicial",
    estado: "Confirmada",
  },
];

// Generador de horas para la cuadrícula (8 AM a 6 PM)
const horasDelDia = Array.from({ length: 11 }, (_, i) => {
  const hora = i + 8;
  return `${hora.toString().padStart(2, "0")}:00`;
});

export default function AgendaPage() {
  const [fechaActual] = useState(new Date("2026-08-29T11:11:17")); // Fecha base de simulación
  const [citas] = useState<Cita[]>(citasSimuladas);

  // Función para encontrar si hay una cita en una hora específica
  const obtenerCitaEnHora = (horaBase: string) => {
    return citas.find((c) => c.horaInicio === horaBase);
  };

  // Formatear fecha para el encabezado (Ej: "Sábado, 29 de Agosto")
  const fechaFormateada = fechaActual.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* ENCABEZADO DE LA AGENDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Mi Agenda</h1>
          <p className="text-slate-500 text-sm md:text-base capitalize">
            {fechaFormateada}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm">
            Hoy
          </button>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="ml-auto md:ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Bloquear Horario
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL CALENDARIO */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 overflow-hidden flex flex-col">
        {/* Cabecera del día */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-center shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Vista Diaria
          </span>
        </div>

        {/* Cuadrícula de horas (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {horasDelDia.map((hora) => {
            const cita = obtenerCitaEnHora(hora);

            return (
              // CORRECCIÓN TAILWIND AQUÍ (min-h-20)
              <div key={hora} className="flex min-h-20 group">
                {/* Columna de la Hora */}
                <div className="w-20 pr-4 text-right shrink-0 relative -top-3">
                  <span className="text-xs font-bold text-slate-400">
                    {hora}
                  </span>
                </div>

                {/* Línea divisoria y Espacio de la Cita */}
                <div className="flex-1 border-t border-slate-100 relative p-1">
                  {/* Tarjeta de Cita (Si existe) */}
                  {cita ? (
                    <div
                      className={`absolute top-1 left-1 right-1 bottom-1 p-3 rounded-xl border ${
                        cita.estado === "Confirmada"
                          ? "bg-indigo-50 border-indigo-200 shadow-[inset_4px_0_0_0_#4F46E5]"
                          : "bg-amber-50 border-amber-200 shadow-[inset_4px_0_0_0_#F59E0B]"
                      } hover:shadow-md transition-shadow cursor-pointer z-10 flex flex-col justify-center`}
                    >
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-black text-sm ${cita.estado === "Confirmada" ? "text-indigo-900" : "text-amber-900"}`}
                        >
                          {cita.paciente}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cita.estado === "Confirmada"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {cita.estado}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 font-medium ${cita.estado === "Confirmada" ? "text-indigo-600/80" : "text-amber-600/80"}`}
                      >
                        {cita.horaInicio} - {cita.horaFin} • {cita.tipo}
                      </p>
                    </div>
                  ) : (
                    /* Espacio vacío interactivo para agregar cita */
                    <div className="w-full h-full rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Agendar aquí
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

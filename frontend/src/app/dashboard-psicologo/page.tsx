"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface CitaHoy {
  id: string;
  nombre_paciente: string;
  hora_inicio: string;
  tipo: string;
  estado: string;
}

export default function DashboardPsicologo() {
  const [citasHoy, setCitasHoy] = useState<CitaHoy[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreDoc, setNombreDoc] = useState("Especialista");

  useEffect(() => {
    let montado = true;

    const cargarPanel = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // Intentar sacar el nombre del usuario logueado
        if (session.user.email) {
          const nombreBase = session.user.email.split("@")[0];
          setNombreDoc(
            nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1),
          );
        }

        // Obtener fecha de hoy en formato local (YYYY-MM-DD)
        const hoy = new Date();
        const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

        // Buscar las citas de HOY en la nueva tabla
        const { data, error } = await supabase
          .from("citas")
          .select("id, nombre_paciente, hora_inicio, tipo, estado")
          .eq("psicologo_id", session.user.id)
          .eq("fecha", fechaHoy)
          .order("hora_inicio", { ascending: true });

        if (error) throw error;

        if (data && montado) {
          setCitasHoy(data);
        }
      } catch (error) {
        console.error("Error al cargar citas de hoy:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarPanel();

    return () => {
      montado = false;
    };
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Encabezado de Bienvenida */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hola, Dr. {nombreDoc} 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Aquí tienes el resumen de tu práctica clínica para hoy.
          </p>
        </div>
        <Link
          href="/dashboard-psicologo/agenda"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Abrir Agenda
        </Link>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-7 h-7"
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
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Citas Hoy
            </p>
            <p className="text-3xl font-black text-slate-900">
              {cargando ? "-" : citasHoy.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Pacientes
            </p>
            <p className="text-3xl font-black text-slate-900">12</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Ingresos Mes
            </p>
            <p className="text-3xl font-black text-slate-900">$450</p>
          </div>
        </div>
      </div>

      {/* Lista de citas de hoy */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Agenda de Hoy</h2>
        </div>

        <div className="p-6">
          {cargando ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : citasHoy.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                Día Libre
              </h3>
              <p className="text-slate-500">
                No tienes citas programadas para hoy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {citasHoy.map((cita) => (
                <div
                  key={cita.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold">
                      {cita.hora_inicio.substring(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {cita.nombre_paciente}
                      </h4>
                      <p className="text-sm font-medium text-slate-500">
                        {cita.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        cita.estado === "Confirmada"
                          ? "bg-indigo-100 text-indigo-700"
                          : cita.estado === "Pendiente"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cita.estado}
                    </span>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-indigo-200 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

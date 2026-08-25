"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function DashboardPsicologoPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUsuario(user);
      setCargando(false);
    };
    obtenerUsuario();
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500">
      {/* CABECERA CON EL BOTÓN DE SALA VIRTUAL */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Bienvenido, Dr. {usuario?.email?.split("@")[0] || "Especialista"}
          </h1>
          <p className="text-gray-500">
            Aquí tienes un resumen de tu jornada clínica para hoy.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-xl transition shadow-sm">
            Configurar Perfil
          </button>

          {/* NUEVO BOTÓN MAGICO 🎥 */}
          <Link
            href="/sala-virtual"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-md flex items-center justify-center gap-2 animate-pulse hover:animate-none"
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
            Iniciar Sala Virtual
          </Link>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            👥
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
              Pacientes Hoy
            </p>
            <p className="text-3xl font-black text-gray-900">4</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ⏳
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
              Próxima Cita
            </p>
            <p className="text-2xl font-black text-gray-900">11:30 AM</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ✅
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">
              Tareas Pendientes
            </p>
            <p className="text-3xl font-black text-gray-900">2</p>
          </div>
        </div>
      </div>

      {/* PRÓXIMAS CITAS */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-blue-600"
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
          Agenda del Día
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-blue-600 text-lg shadow-sm shrink-0">
                11
              </div>
              <div>
                <p className="font-bold text-gray-900">Carlos Mendoza</p>
                <p className="text-sm text-gray-500">
                  Consulta de Seguimiento - 11:30 AM
                </p>
              </div>
            </div>
            <button className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition whitespace-nowrap">
              Ver Historia
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-blue-600 text-lg shadow-sm shrink-0">
                14
              </div>
              <div>
                <p className="font-bold text-gray-900">Ana Lucía</p>
                <p className="text-sm text-gray-500">
                  Terapia Cognitiva - 02:00 PM
                </p>
              </div>
            </div>
            <button className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition whitespace-nowrap">
              Ver Historia
            </button>
          </div>
        </div>

        <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all">
          Ver agenda completa
        </button>
      </div>
    </div>
  );
}

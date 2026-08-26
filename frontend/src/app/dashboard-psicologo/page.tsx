"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function DashboardPsicologoPage() {
  const [nombreDoctor, setNombreDoctor] = useState("Doctor");

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        // Extraemos el nombre antes del @ para mostrarlo amigablemente
        const nombrePart = user.email.split("@")[0];
        setNombreDoctor(nombrePart);
      }
    };
    obtenerUsuario();
  }, []);

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Cabecera del Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Bienvenido, Dr.{" "}
            <span className="text-blue-600">{nombreDoctor}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Aquí tienes un resumen de tu jornada clínica para hoy.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Botón de Configuración de Perfil (Conectado al Paso 2) */}
          <Link
            href="/dashboard-psicologo/perfil"
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-3 px-6 rounded-2xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Configurar Perfil
          </Link>

          {/* Botón de Telemedicina */}
          <Link
            href="/sala-virtual"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl transition shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2"
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

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            👥
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Pacientes Hoy
            </p>
            <h3 className="text-3xl font-black text-gray-900">4</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ⏳
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Próxima Cita
            </p>
            <h3 className="text-3xl font-black text-gray-900">11:30 AM</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Tareas Pendientes
            </p>
            <h3 className="text-3xl font-black text-gray-900">2</h3>
          </div>
        </div>
      </div>

      {/* Agenda del Día */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-blue-600">📅</span> Agenda del Día
        </h2>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                11
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  Carlos Mendoza
                </h4>
                <p className="text-gray-500 text-sm">
                  Consulta de Seguimiento - 11:30 AM
                </p>
              </div>
            </div>
            <Link
              href="/dashboard-psicologo/pacientes"
              className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2.5 px-5 rounded-xl transition text-sm shadow-xs"
            >
              Ver Historia
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                14
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Ana Lucía</h4>
                <p className="text-gray-500 text-sm">
                  Terapia Cognitiva - 02:00 PM
                </p>
              </div>
            </div>
            <Link
              href="/dashboard-psicologo/pacientes"
              className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2.5 px-5 rounded-xl transition text-sm shadow-xs"
            >
              Ver Historia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function DashboardPacientePage() {
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
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Hola, {usuario?.email?.split("@")[0] || "Paciente"} 👋
          </h1>
          <p className="text-gray-500">
            Bienvenido a tu portal de salud mental.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-xl transition shadow-sm text-center">
            Configurar Perfil
          </button>

          {/* BOTÓN PARA UNIRSE A LA VIDEOLLAMADA */}
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
            Entrar a mi Consulta
          </Link>
        </div>
      </div>

      {/* PRÓXIMA CITA DESTACADA */}
      <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30 uppercase tracking-wider mb-4 inline-block">
            Cita de Hoy
          </span>
          <h2 className="text-2xl font-black mb-2">
            Terapia Individual (Seguimiento)
          </h2>
          <p className="text-blue-100 mb-6 flex items-center gap-2 font-medium">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Hoy, 11:30 AM con tu Especialista
          </p>
          <p className="text-sm text-blue-50/80 max-w-lg leading-relaxed">
            Tu especialista ya está preparándose para tu sesión. Puedes ingresar
            a la sala virtual 5 minutos antes de la hora programada para probar
            tu cámara y micrófono.
          </p>
        </div>
        {/* Decoración geométrica */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute top-10 right-20 text-9xl opacity-5 select-none">
          🧠
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard-paciente/historial"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-5 group cursor-pointer"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-transform origin-left">
            📝
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              Mi Historial Clínico
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Revisa tus diagnósticos y notas anteriores.
            </p>
          </div>
        </Link>

        <Link
          href="/comunidad"
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex items-center gap-5 group cursor-pointer"
        >
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:scale-110 transition-transform origin-left">
            🌿
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
              PsiEduca
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Explora talleres y artículos para tu bienestar.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

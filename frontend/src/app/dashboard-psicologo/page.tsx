"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

// Definimos cómo se ve una Cita que viene de la base de datos
interface Cita {
  id: string;
  paciente_correo: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function DashboardPsicologoPage() {
  const [nombreDoctor, setNombreDoctor] = useState("Doctor");
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  useEffect(() => {
    // 1. Obtener el nombre del doctor
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        const nombrePart = user.email.split("@")[0];
        setNombreDoctor(nombrePart);
      }
    };

    // 2. Obtener las citas reales de la base de datos
    const obtenerCitas = async () => {
      try {
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .order("fecha", { ascending: true }) // Ordenamos por fecha
          .limit(5); // Traemos las próximas 5

        if (error) throw error;
        if (data) setCitas(data);
      } catch (error) {
        console.error("Error al cargar citas:", error);
      } finally {
        setCargandoCitas(false);
      }
    };

    obtenerUsuario();
    obtenerCitas();
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
          {/* Botón de Configuración de Perfil */}
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
              Pacientes Agendados
            </p>
            <h3 className="text-3xl font-black text-gray-900">
              {cargandoCitas ? "-" : citas.length}
            </h3>
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
            <h3 className="text-2xl font-black text-gray-900">
              {cargandoCitas
                ? "Cargando..."
                : citas.length > 0
                  ? citas[0].hora
                  : "Sin citas"}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ✓
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Estado
            </p>
            <h3 className="text-3xl font-black text-gray-900">Activo</h3>
          </div>
        </div>
      </div>

      {/* Agenda del Día */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-blue-600">📅</span> Agenda de Pacientes
        </h2>

        {cargandoCitas ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">
              Cargando tu agenda de Supabase...
            </p>
          </div>
        ) : citas.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <div className="text-4xl mb-3">☕</div>
            <h3 className="text-lg font-bold text-gray-900">Agenda libre</h3>
            <p className="text-gray-500">
              Aún no tienes citas programadas para hoy.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map((cita, index) => {
              const dia = cita.fecha.split("-")[2] || "--";
              const nombrePaciente = cita.paciente_correo.split("@")[0];
              const bgNumber = index % 2 === 0 ? "bg-blue-600" : "bg-gray-900";

              return (
                <div
                  key={cita.id}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div
                      className={`w-12 h-12 ${bgNumber} text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md shrink-0`}
                    >
                      {dia}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-gray-900 text-lg truncate">
                        Paciente: {nombrePaciente}
                      </h4>
                      <p className="text-gray-500 text-sm truncate">
                        {cita.fecha} a las{" "}
                        <span className="font-bold text-blue-600">
                          {cita.hora}
                        </span>
                      </p>
                      {cita.motivo && (
                        <p className="text-xs text-gray-400 mt-1 italic truncate">
                          &quot;{cita.motivo}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/dashboard-psicologo/pacientes"
                    className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-2.5 px-5 rounded-xl transition text-sm shadow-xs text-center shrink-0"
                  >
                    Ver Historia
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

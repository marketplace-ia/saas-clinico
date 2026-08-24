"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface MiCita {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function PacienteHomePage() {
  const [nombre, setNombre] = useState("Paciente");
  const [misCitas, setMisCitas] = useState<MiCita[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && user.email) {
          setNombre(user.email.split("@")[0]);

          const { data, error } = await supabase
            .from("citas")
            .select("*")
            .order("fecha", { ascending: false });

          if (error) throw error;
          setMisCitas(data || []);
        }
      } catch (error) {
        console.error("Error al cargar el panel del paciente:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const citasPendientesOConfirmadas = misCitas.filter(
    (c) => c.estado === "pendiente" || c.estado === "confirmada",
  );
  const citasPasadas = misCitas.filter(
    (c) => c.estado === "completada" || c.estado === "cancelada",
  );

  return (
    <div className="w-full p-8 font-sans max-w-5xl mx-auto">
      {/* Banner de Bienvenida */}
      <div className="bg-linear-to-r from-blue-500 to-blue-700 rounded-3xl p-10 text-white shadow-lg mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            ¡Hola, {nombre}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Bienvenido a tu portal de salud mental. Aquí puedes gestionar tus
            sesiones y hacer seguimiento a tu tratamiento.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0">
          <Link
            href="/dashboard-paciente/agendar"
            className="bg-white text-blue-600 hover:bg-blue-50 font-black py-4 px-8 rounded-2xl shadow-xl transition-transform hover:-translate-y-1 flex items-center gap-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Agendar Nueva Cita
          </Link>
        </div>
        {/* Decoración geométrica */}
        <div className="absolute right-0 top-0 w-64 h-full bg-white opacity-10 transform -skew-x-12 translate-x-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Citas Activas */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-500"
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
            Tus próximas sesiones
          </h2>

          {cargando ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center text-gray-500 animate-pulse shadow-sm">
              Cargando tu información...
            </div>
          ) : citasPendientesOConfirmadas.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                🛋️
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No tienes citas próximas
              </h3>
              <p className="text-gray-500">
                Cuando agendes una nueva sesión con tu especialista, aparecerá
                aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {citasPendientesOConfirmadas.map((cita) => (
                <div
                  key={cita.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-blue-200"
                >
                  <div className="flex items-start gap-4">
                    {/* CORRECCIÓN APLICADA AQUÍ: min-w-20 en lugar de min-w-[80px] */}
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl text-center min-w-20">
                      <div className="text-xs font-bold uppercase">
                        {cita.fecha.split("-")[1]}/{cita.fecha.split("-")[0]}
                      </div>
                      <div className="text-2xl font-black">
                        {cita.fecha.split("-")[2]}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {cita.motivo || "Sesión de Seguimiento"}
                      </h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        {cita.hora}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase border ${
                        cita.estado === "confirmada"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {cita.estado === "confirmada"
                        ? "✓ Confirmada"
                        : "⏳ En revisión"}
                    </span>
                    {cita.estado === "pendiente" && (
                      <p className="text-xs text-gray-400 mt-2">
                        La secretaría confirmará pronto.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Historial y Recursos */}
        <div className="space-y-6">
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              ¿Necesitas ayuda urgente?
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Si estás atravesando una crisis, no esperes a tu cita. Contáctanos
              inmediatamente.
            </p>
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
              Línea de Emergencia
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">
            Historial Pasado
          </h2>
          {citasPasadas.length === 0 ? (
            <p className="text-gray-500 text-sm bg-white p-4 rounded-2xl border border-gray-100">
              No hay registros de citas anteriores.
            </p>
          ) : (
            <div className="space-y-3">
              {citasPasadas.slice(0, 3).map((cita) => (
                <div
                  key={cita.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-700">
                      {cita.fecha}
                    </span>
                    <span
                      className={`text-xs font-bold ${cita.estado === "completada" ? "text-green-600" : "text-red-500"}`}
                    >
                      {cita.estado.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate">{cita.motivo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

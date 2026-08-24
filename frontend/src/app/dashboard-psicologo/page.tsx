"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function PsicologoHomePage() {
  const [nombre, setNombre] = useState("Doctor");
  const [citasHoy, setCitasHoy] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          setNombre(user.email.split("@")[0]);
        }

        const { count, error } = await supabase
          .from("citas")
          .select("*", { count: "exact", head: true })
          .eq("estado", "confirmada");

        if (!error && count !== null) {
          setCitasHoy(count);
        }
      } catch (error) {
        console.error("Error al cargar el dashboard del psicólogo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="w-full p-8 font-sans">
      {/* Banner de Bienvenida */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 rounded-3xl p-10 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            ¡Buen día, Especialista {nombre}!{" "}
            <span className="text-3xl">☕</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Bienvenido a tu consultorio virtual. Aquí tienes un resumen de tu
            jornada clínica para hoy.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full bg-white opacity-10 transform -skew-x-12 translate-x-8"></div>
      </div>

      {/* Widgets Clínicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget: Citas Programadas */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Citas Confirmadas
            </p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-gray-800">
                {cargando ? "-" : citasHoy}
              </span>
              <span className="text-gray-500 mb-1 font-medium">en agenda</span>
            </div>
          </div>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <svg
              className="w-10 h-10 text-blue-500"
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
          </div>
        </div>

        {/* Widget: Acceso Directo a Pacientes */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-start">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Historias Clínicas
          </h3>
          <p className="text-gray-500 mb-6">
            Revisa los expedientes y redacta tus notas de evolución.
          </p>
          <Link
            href="/dashboard-psicologo/pacientes"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md hover:shadow-lg w-full sm:w-auto text-center"
          >
            Ver mis Pacientes →
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { Users, Calendar, Clock, Video, FileText } from "lucide-react";
import Link from "next/link"; // Importamos Link para la navegación a la sala virtual

interface Cita {
  id: string;
  paciente_email: string;
  fecha_hora: string;
  motivo: string;
  estado: string;
}

export default function DashboardPsicologo() {
  const [email, setEmail] = useState<string | null>("");
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarMisPacientes = useCallback(async () => {
    setCargando(true);

    // 1. Obtenemos quién es el psicólogo actual
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email) {
      const correoUsuario = session.user.email;
      setEmail(correoUsuario);

      // 2. Buscamos solo las citas asignadas a este psicólogo
      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("psicologo_email", correoUsuario)
        .order("fecha_hora", { ascending: true });

      if (!error && data) {
        setCitas(data);
      }
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    // Apagamos la advertencia estricta del linter solo para esta línea
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarMisPacientes();
  }, [cargarMisPacientes]);

  // Función para formatear la fecha a un modo más legible
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return {
      dia: fecha.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
      hora: fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="flex-1 h-full overflow-auto bg-slate-50 p-6 md:p-10 w-full relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado del Psicólogo */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-600/20">
          <h1 className="text-3xl font-bold tracking-tight">
            Panel del Profesional
          </h1>
          <p className="text-blue-100 mt-2 text-lg">
            Dr/a. {email?.split("@")[0]} - Aquí tienes tus sesiones programadas.
          </p>
        </div>

        {/* Tarjetas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sesiones Asignadas
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {citas.length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pacientes Activos
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {/* Un pequeño truco con Set para contar pacientes únicos */}
                {new Set(citas.map((c) => c.paciente_email)).size}
              </h3>
            </div>
          </div>
        </div>

        {/* Lista de Agenda de Hoy */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              Mi Agenda y Pacientes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium">Día y Hora</th>
                  <th className="p-4 font-medium">Motivo / Notas</th>
                  <th className="p-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargando ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-slate-500 font-medium animate-pulse"
                    >
                      Cargando agenda...
                    </td>
                  </tr>
                ) : citas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">
                          Agenda libre
                        </h3>
                        <p className="text-slate-500 mt-2">
                          No tienes sesiones programadas por el momento.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => {
                    const { dia, hora } = formatearFecha(cita.fecha_hora);
                    return (
                      <tr
                        key={cita.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-slate-800">
                            {cita.paciente_email}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${cita.estado === "confirmada" ? "bg-emerald-500" : "bg-amber-500"}`}
                            ></span>
                            {cita.estado}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-700 capitalize">
                              {dia}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-xs">
                              <Clock className="w-3.5 h-3.5" /> {hora}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            {cita.motivo}
                          </div>
                        </td>
                        <td className="p-4">
                          {/* Botón conectado con Link hacia la sala virtual */}
                          <Link href="/sala-virtual">
                            <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm w-full md:w-auto border border-blue-100 hover:border-blue-600">
                              <Video className="w-4 h-4" /> Iniciar Sesión
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { Calendar, Clock, Activity, CheckCircle2, Video } from "lucide-react";
import Link from "next/link"; // Importamos Link para la navegación

interface Cita {
  id: string;
  psicologo_email: string;
  fecha_hora: string;
  motivo: string;
  estado: string;
}

export default function DashboardPaciente() {
  const [email, setEmail] = useState<string | null>("");
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarMisCitas = useCallback(async () => {
    setCargando(true);

    // 1. Obtenemos quién es el paciente actual
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.email) {
      const correoUsuario = session.user.email;
      setEmail(correoUsuario);

      // 2. Buscamos solo las citas donde él sea el paciente
      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("paciente_email", correoUsuario)
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
    cargarMisCitas();
  }, [cargarMisCitas]);

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return {
      dia: fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      hora: fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="flex-1 h-full overflow-auto bg-slate-50 p-6 md:p-10 w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-600/20">
          <h1 className="text-3xl font-bold tracking-tight">
            Hola, {email?.split("@")[0]} 👋
          </h1>
          <p className="text-emerald-100 mt-2 text-lg">
            Tu bienestar es nuestra prioridad. Aquí está el resumen de tu
            proceso.
          </p>
        </div>

        {/* Tarjetas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Próximas Sesiones
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {citas.length}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estado</p>
              <h3 className="text-xl font-bold text-slate-800">
                Terapia Activa
              </h3>
            </div>
          </div>
        </div>

        {/* Lista de Próximas Citas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">
              Mis Sesiones Programadas
            </h2>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {cargando ? (
              <div className="p-8 text-center text-slate-500 font-medium animate-pulse">
                Cargando tus citas...
              </div>
            ) : citas.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  No hay sesiones a la vista
                </h3>
                <p className="text-slate-500 max-w-sm mt-2">
                  Actualmente no tienes citas programadas. Si necesitas agendar
                  una, por favor contacta a recepción.
                </p>
              </div>
            ) : (
              citas.map((cita) => {
                const { dia, hora } = formatearFecha(cita.fecha_hora);

                return (
                  <div
                    key={cita.id}
                    className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 rounded-xl transition-colors m-2"
                  >
                    <div className="flex gap-5 items-start md:items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-emerald-700 shrink-0">
                        <span className="text-xs font-bold uppercase">
                          {dia.split(" ")[0].substring(0, 3)}
                        </span>
                        <span className="text-xl font-black leading-none">
                          {dia.split(" ")[1]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg capitalize">
                          {dia}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{hora}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            Profesional:{" "}
                            <span className="font-semibold text-slate-700">
                              {cita.psicologo_email}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          cita.estado === "confirmada"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {cita.estado === "confirmada" && (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {cita.estado}
                      </span>

                      {/* Botón conectado con Link hacia la sala virtual */}
                      <Link href="/sala-virtual" className="w-full md:w-auto">
                        <button className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm w-full">
                          <Video className="w-4 h-4" /> Entrar a la llamada
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

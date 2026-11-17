"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface CitaTeleconsulta {
  id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  medico_id: string;
  meet_url?: string; // 🟢 El enlace de Google Meet generado por el backend
  paciente_id?: string;
}

export default function SalaTeleconsultaMedicoPage() {
  const params = useParams();
  const router = useRouter();
  const citaId = params.cita_id as string;

  const [cita, setCita] = useState<CitaTeleconsulta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [nombreMedico, setNombreMedico] = useState("Doctor");

  useEffect(() => {
    const validarAcceso = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return router.push("/login");

        // 1. Validar que la cita existe y pertenece a este médico
        // Asumimos que la columna 'meet_url' se llenará cuando el backend sincronice con Google Calendar
        const { data: dataCita, error } = await supabase
          .from("citas")
          .select(
            "id, nombre_paciente, fecha, hora_inicio, medico_id, meet_url, paciente_id",
          )
          .eq("id", citaId)
          .eq("medico_id", session.user.id) // 🟢 Validación estricta para médicos
          .single();

        if (error || !dataCita) {
          console.error("Detalle del error en consulta Citas:", error);
          throw new Error("Acceso denegado a esta sala.");
        }

        setCita(dataCita);

        // 2. Obtener nombre del profesional
        const { data: perfil } = await supabase
          .from("perfil_medico") // 🟢 Apuntamos al perfil médico
          .select("nombres, apellidos")
          .eq("medico_id", session.user.id)
          .maybeSingle();

        if (perfil) {
          setNombreMedico(`Dr. ${perfil.nombres} ${perfil.apellidos}`.trim());
        }
      } catch (error) {
        console.error(error);
        alert("No tienes acceso a esta teleconsulta.");
        router.push("/dashboard-medico/agenda");
      } finally {
        setCargando(false);
      }
    };

    validarAcceso();
  }, [citaId, router]);

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );

  if (!cita) return null;

  // Fallback por si la sincronización con Google aún no ha devuelto el link
  const urlReunion = cita.meet_url || "https://meet.google.com/new";

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 font-sans animate-in fade-in duration-500 z-50 fixed inset-0 overflow-y-auto">
      {/* HEADER CLÍNICO */}
      <div className="bg-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-slate-200 shrink-0 gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            <span className="font-black tracking-widest text-sm uppercase text-slate-500">
              Lobby de Telemedicina
            </span>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
          <div className="text-center sm:text-left">
            <h1 className="font-black text-slate-900 leading-tight text-lg">
              {cita.nombre_paciente}
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {cita.fecha} • {cita.hora_inicio.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push("/dashboard-medico/agenda")}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors border border-slate-200"
          >
            Volver a Agenda
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center w-full relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none opacity-60"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-white shadow-lg border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-12 h-12 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-4">
              Sala de Consulta Preparada
            </h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed">
              Dr. {nombreMedico}, su enlace seguro de Google Meet ha sido
              sincronizado con el calendario del paciente.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={urlReunion}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Unirse a Google Meet
              </a>

              {cita.paciente_id ? (
                <Link
                  href={`/dashboard-medico/historias/${cita.paciente_id}`}
                  target="_blank"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-lg"
                >
                  📝 Abrir Ficha Médica
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto bg-slate-200 text-slate-400 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-lg cursor-not-allowed"
                  title="El paciente aún no tiene ficha médica creada"
                >
                  📝 Ficha no vinculada
                </button>
              )}
            </div>

            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mantén esta pestaña abierta para redactar la historia clínica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

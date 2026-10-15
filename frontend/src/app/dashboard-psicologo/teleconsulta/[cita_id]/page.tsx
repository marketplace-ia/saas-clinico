"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { JitsiMeeting } from "@jitsi/react-sdk";

interface CitaTeleconsulta {
  id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  psicologo_id: string;
}

export default function SalaTeleconsultaPage() {
  const params = useParams();
  const router = useRouter();
  const citaId = params.cita_id as string;

  const [cita, setCita] = useState<CitaTeleconsulta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [nombrePsicologo, setNombrePsicologo] = useState("Psicólogo");
  // 🟢 Nuevo estado para satisfacer la interfaz estricta de Jitsi
  const [emailPsicologo, setEmailPsicologo] = useState(
    "profesional@clinesfera.com",
  );

  useEffect(() => {
    const validarAcceso = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return router.push("/login");

        // Capturamos el correo real de la sesión
        if (session.user.email) setEmailPsicologo(session.user.email);

        // 1. Validar que la cita existe y pertenece a este psicólogo
        // 🟢 CORRECCIÓN: Usar los nombres de columna correctos (nombre_paciente, fecha, hora_inicio)
        const { data: dataCita, error } = await supabase
          .from("citas")
          .select("id, nombre_paciente, fecha, hora_inicio, psicologo_id")
          .eq("id", citaId)
          .eq("psicologo_id", session.user.id)
          .single();

        if (error || !dataCita) {
          console.error("Detalle del error en consulta Citas:", error);
          throw new Error("Acceso denegado a esta sala.");
        }

        setCita(dataCita);

        // 2. Obtener nombre del profesional
        const { data: perfil } = await supabase
          .from("perfil_psicologo")
          .select("nombre_completo")
          .eq("id", session.user.id)
          .maybeSingle(); // 🟢 Usamos maybeSingle para que no arroje error si el perfil está incompleto

        if (perfil) setNombrePsicologo(perfil.nombre_completo || "Psicólogo");
      } catch (error) {
        console.error(error);
        alert("No tienes acceso a esta teleconsulta.");
        router.push("/dashboard-psicologo/agenda");
      } finally {
        setCargando(false);
      }
    };

    validarAcceso();
  }, [citaId, router]);

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  if (!cita) return null;

  const roomName = `Clinesfera-${cita.id.replace(/-/g, "")}`;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 text-white font-sans animate-in fade-in duration-500 z-50 fixed inset-0">
      {/* HEADER DE LA TELECONSULTA */}
      <div className="bg-slate-950 px-6 py-4 flex justify-between items-center border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-black tracking-widest text-sm uppercase text-slate-300">
              En Vivo
            </span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div>
            <h1 className="font-bold text-white leading-tight">
              Paciente: {cita.nombre_paciente}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Cita de las {cita.hora_inicio.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              window.open(`/dashboard-psicologo/pacientes`, "_blank")
            }
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            Abrir Historia Clínica ↗
          </button>
          <button
            onClick={() => router.push("/dashboard-psicologo/agenda")}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
            Finalizar Sesión
          </button>
        </div>
      </div>

      {/* CONTENEDOR DEL VIDEO */}
      <div className="flex-1 bg-black relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomName}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
            disableRecordAudioNotification: true,
            toolbarButtons: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "hangup",
              "chat",
            ],
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          }}
          userInfo={{
            displayName: nombrePsicologo,
            email: emailPsicologo, // 🟢 Solución del error de TypeScript
          }}
          onApiReady={(externalApi) => {
            externalApi.addListener("videoConferenceLeft", () => {
              router.push("/dashboard-psicologo/agenda");
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
}

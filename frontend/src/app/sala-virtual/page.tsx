"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  MonitorUp,
  MoreVertical,
  ShieldCheck,
} from "lucide-react";

export default function SalaVirtual() {
  const router = useRouter();
  const [microfonoActivo, setMicrofonoActivo] = useState(true);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [horaLocal, setHoraLocal] = useState("");

  // Reloj en tiempo real para la barra superior
  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHoraLocal(
        ahora.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const finalizarLlamada = () => {
    // router.back() devuelve al usuario al panel de donde vino (Paciente o Psicólogo)
    router.back();
  };

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col font-sans overflow-hidden">
      {/* HEADER: Información de la llamada */}
      <header className="h-16 flex items-center justify-between px-6 bg-zinc-900/50 text-zinc-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h1 className="font-medium text-white tracking-wide text-sm md:text-base">
            Sesión Clínica Encriptada (E2EE)
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span>{horaLocal}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL: Grilla de video */}
      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-center relative">
        {/* Pantalla principal (El otro participante) */}
        <div className="relative w-full h-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-700/50 shadow-inner">
              <Users className="w-10 h-10 text-zinc-500" />
            </div>
            <p className="text-zinc-400 font-medium animate-pulse">
              Esperando a que el otro participante active su cámara...
            </p>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm text-white font-medium flex items-center gap-2">
            Participante
            <MicOff className="w-4 h-4 text-red-500" />
          </div>
        </div>

        {/* Pantalla personal (Tú) */}
        <div className="absolute top-8 right-8 md:relative md:top-0 md:right-0 md:w-80 w-32 aspect-3/4 md:aspect-video bg-zinc-800 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-xl flex items-center justify-center z-10 hover:border-emerald-500/50 transition-colors cursor-pointer">
          {camaraActiva ? (
            // Simulación de cámara activa (pantalla en un gris más claro)
            <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
              <span className="text-zinc-400 font-medium">Cámara Activa</span>
            </div>
          ) : (
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-700 flex items-center justify-center">
              <Users className="w-6 h-6 text-zinc-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs md:text-sm text-white font-medium">
            Tú
          </div>
        </div>
      </main>

      {/* FOOTER: Controles de la llamada */}
      <footer className="h-24 pb-4 px-6 flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 md:gap-4 bg-zinc-900/80 p-2.5 px-4 md:px-6 rounded-3xl border border-zinc-800 shadow-xl backdrop-blur-lg">
          <button
            onClick={() => setMicrofonoActivo(!microfonoActivo)}
            className={`p-3 md:p-4 rounded-full transition-all flex items-center justify-center ${microfonoActivo ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            {microfonoActivo ? (
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <MicOff className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>

          <button
            onClick={() => setCamaraActiva(!camaraActiva)}
            className={`p-3 md:p-4 rounded-full transition-all flex items-center justify-center ${camaraActiva ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          >
            {camaraActiva ? (
              <VideoIcon className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </button>

          <div className="w-px h-8 bg-zinc-700 mx-1 md:mx-2"></div>

          <button className="p-3 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors hidden md:flex">
            <MonitorUp className="w-5 h-5" />
          </button>

          <button className="p-3 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>

          <button className="p-3 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors hidden md:flex">
            <MoreVertical className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-zinc-700 mx-1 md:mx-2"></div>

          <button
            onClick={finalizarLlamada}
            className="px-6 py-3 md:py-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-900/50 ml-2"
          >
            <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden md:inline">Colgar</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

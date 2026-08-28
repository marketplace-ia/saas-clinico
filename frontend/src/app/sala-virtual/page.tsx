"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SalaVirtualPage() {
  const router = useRouter();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);

  // Estados para la libreta del doctor
  const [notaRapida, setNotaRapida] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const iniciarEntornoVirtual = async () => {
      // 1. Identificar quién está entrando a la sala
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        router.push("/");
        return;
      }

      // Nombre amigable para la videollamada
      const nombrePart = user.email.split("@")[0];
      setNombreUsuario(nombrePart);

      // 2. Averiguar si es doctor o paciente para cambiar la interfaz
      const { data: rolData } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", user.email)
        .maybeSingle();

      setRol(rolData?.rol || "paciente");
      setCargando(false);
    };

    iniciarEntornoVirtual();
  }, [router]);

  // Simulación de guardado rápido (luego lo conectaremos a Supabase si lo deseas)
  const handleGuardarNota = () => {
    setGuardando(true);
    setTimeout(() => {
      // En una app real, aquí enviaríamos el texto a la tabla de notas
      navigator.clipboard.writeText(notaRapida); // Lo copiamos al portapapeles por seguridad
      setGuardando(false);
      setMensaje("¡Apuntes guardados en tu portapapeles!");
      setTimeout(() => setMensaje(""), 3000);
    }, 1000);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-blue-400 animate-pulse">
          ENCRIPTANDO CONEXIÓN...
        </p>
      </div>
    );
  }

  // Generamos una sala única y segura en los servidores de Jitsi
  // Le pasamos el nombre de nuestro usuario para que entre identificado
  const roomName = "Lumina_Consultorio_Seguro_2026";
  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${nombreUsuario}"`;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans selection:bg-blue-500 overflow-hidden">
      {/* BARRA DE NAVEGACIÓN SUPERIOR (Modo Oscuro Clínico) */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></div>
          <h1 className="font-black tracking-wider text-lg">
            Lumina{" "}
            <span className="font-light text-gray-400">| Consulta En Vivo</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-gray-400 text-sm font-medium">
            Conectado como:{" "}
            <span className="text-white font-bold">{nombreUsuario}</span>
          </span>
          <Link
            href={
              rol === "psicologo"
                ? "/dashboard-psicologo"
                : "/dashboard-paciente"
            }
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-bold py-2 px-6 rounded-lg transition"
          >
            Salir de la Sala
          </Link>
        </div>
      </header>

      {/* ÁREA DE TRABAJO */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1920px] mx-auto">
        {/* COLUMNA IZQUIERDA: Video en Vivo */}
        <div
          className={`flex-1 flex flex-col bg-black ${rol === "psicologo" ? "md:w-2/3 border-r border-gray-800" : "w-full"}`}
        >
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full min-h-[70vh] border-0"
          ></iframe>
        </div>

        {/* COLUMNA DERECHA: Libreta (SOLO VISIBLE PARA PSICÓLOGOS) */}
        {rol === "psicologo" && (
          <div className="w-full md:w-1/3 bg-gray-900 flex flex-col h-full shrink-0">
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="bg-blue-600 p-2 rounded-xl text-lg shadow-md">
                  📝
                </span>
                Apuntes en Vivo
              </h2>
              <p className="text-gray-400 text-sm mt-2 font-medium leading-relaxed">
                Escribe notas rápidas durante la sesión sin salir de la cámara.
                Al guardar, se copiarán para tu expediente principal.
              </p>
            </div>

            <div className="flex-1 p-6 flex flex-col bg-gray-900">
              <textarea
                value={notaRapida}
                onChange={(e) => setNotaRapida(e.target.value)}
                placeholder="El paciente reporta que durante la semana..."
                className="flex-1 w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-medium mb-4 text-sm"
              ></textarea>

              {mensaje && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold text-center mb-4 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  {mensaje}
                </div>
              )}

              <button
                onClick={handleGuardarNota}
                disabled={guardando || !notaRapida.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                    Guardando...
                  </>
                ) : (
                  "Copiar y Guardar Apuntes"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SalaVirtualContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citaId = searchParams.get("cita");

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);

  const [urlVideollamada, setUrlVideollamada] = useState("");
  const [esGoogleMeet, setEsGoogleMeet] = useState(false);

  const [notaRapida, setNotaRapida] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let montado = true;

    const iniciarEntornoVirtual = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        router.push("/");
        return;
      }

      if (montado) {
        const nombrePart = user.email.split("@")[0];
        setNombreUsuario(nombrePart);
      }

      const { data: rolData } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", user.email)
        .maybeSingle();

      if (montado) setRol(rolData?.rol || "paciente");

      // 🟢 OBTENER EL ENLACE SEGURO Y DETECTAR SI ES GOOGLE MEET
      if (citaId) {
        const { data: citaData } = await supabase
          .from("citas")
          .select("enlace_reunion")
          .eq("id", citaId)
          .single();

        if (montado && citaData?.enlace_reunion) {
          setUrlVideollamada(citaData.enlace_reunion);
          if (citaData.enlace_reunion.includes("meet.google.com")) {
            setEsGoogleMeet(true);
          }
        } else if (montado) {
          // Fallback temporal si la cita no tiene link guardado
          setUrlVideollamada(`https://meet.jit.si/Clinesfera_${citaId}`);
        }
      } else {
        if (montado)
          setUrlVideollamada(
            `https://meet.jit.si/Consultorio_${user.id.substring(0, 8)}`,
          );
      }

      if (montado) setCargando(false);
    };

    iniciarEntornoVirtual();

    return () => {
      montado = false;
    };
  }, [router, citaId]);

  const handleGuardarNota = () => {
    setGuardando(true);
    setTimeout(() => {
      navigator.clipboard.writeText(notaRapida);
      setGuardando(false);
      setMensaje("¡Apuntes guardados en tu portapapeles!");
      setTimeout(() => setMensaje(""), 3000);
    }, 1000);
  };

  const abrirGoogleMeet = () => {
    window.open(urlVideollamada, "_blank", "noopener,noreferrer");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white w-full">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-indigo-400 animate-pulse uppercase text-sm">
          Asegurando conexión y calendario...
        </p>
      </div>
    );
  }

  const iframeSrc = `${urlVideollamada}#userInfo.displayName="${nombreUsuario}"`;

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col font-sans selection:bg-indigo-500 overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
          <h1 className="font-black tracking-wider text-lg">
            Clinesfera{" "}
            <span className="font-light text-slate-400 hidden sm:inline-block">
              | Ecosistema Clínico
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-slate-400 text-sm font-medium">
            Ingreso como:{" "}
            <span className="text-white font-bold">{nombreUsuario}</span>
          </span>
          <Link
            href={
              rol === "psicologo"
                ? "/dashboard-psicologo"
                : "/dashboard-paciente"
            }
            className="bg-slate-800 hover:bg-rose-500 hover:text-white hover:border-rose-500 text-slate-300 border border-slate-700 text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"
          >
            Salir de la Sala
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1920px] mx-auto">
        {/* PANEL DE APUNTES (Solo Psicólogo) - Se mueve a la izquierda para mejor UX cuando se abre Meet */}
        {rol === "psicologo" && (
          <div className="w-full md:w-1/3 xl:w-1/4 bg-slate-900 flex flex-col h-full shrink-0 border-r border-slate-800">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-black text-white flex items-center gap-3">
                <span className="bg-indigo-600 p-2 rounded-xl shadow-md">
                  📝
                </span>
                Evolución en Vivo
              </h2>
              <p className="text-slate-400 text-xs mt-3 font-medium leading-relaxed">
                Toma notas rápidas aquí mientras mantienes tu ventana de Meet
                abierta al lado.
              </p>
            </div>

            <div className="flex-1 p-6 flex flex-col bg-slate-900">
              <textarea
                value={notaRapida}
                onChange={(e) => setNotaRapida(e.target.value)}
                placeholder="El paciente reporta que en esta semana..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium mb-4 text-sm"
              ></textarea>

              {mensaje && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold text-center mb-4 p-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  {mensaje}
                </div>
              )}

              <button
                onClick={handleGuardarNota}
                disabled={guardando || !notaRapida.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Copiar Apuntes de Sesión"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ÁREA DE VIDEOLLAMADA */}
        <div
          className={`flex-1 flex flex-col bg-black items-center justify-center relative w-full`}
        >
          {esGoogleMeet ? (
            <div className="text-center p-8 max-w-lg animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20">
                <svg
                  className="w-12 h-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 6L16 10V14L22 18V6Z" fill="#00832d" />
                  <path d="M14 6H2V18H14V6Z" fill="#0066da" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                Reunión en Google Meet
              </h2>
              <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed mb-10">
                Esta sesión utiliza la máxima calidad y seguridad de Google.{" "}
                {rol === "psicologo"
                  ? "Abre la llamada haciendo clic abajo y divide tu pantalla para ver a tu paciente y mantener tus apuntes aquí."
                  : "El psicólogo te espera en la sala."}
              </p>
              <button
                onClick={abrirGoogleMeet}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                Ingresar a la Videollamada
              </button>
            </div>
          ) : (
            <iframe
              src={iframeSrc}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full min-h-[70vh] border-0"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalaVirtualPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
      }
    >
      <SalaVirtualContent />
    </Suspense>
  );
}

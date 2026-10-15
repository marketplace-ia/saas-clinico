"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { assistantBrain } from "../lib/assistant/core/IntentResolver";
import { AppRole, AssistantContext } from "../lib/assistant/types";

interface Mensaje {
  id: string;
  rol: "user" | "bot";
  texto: string;
}

export default function ChatBot() {
  const router = useRouter();
  const pathname = usePathname();

  const [abierto, setAbierto] = useState(false);
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "1",
      rol: "bot",
      texto:
        "¡Hola! Soy tu asistente inteligente. ¿En qué te puedo ayudar hoy?",
    },
  ]);

  const finDelChatRef = useRef<HTMLDivElement>(null);

  let rolUsuario: AppRole | null = null;
  if (pathname.includes("/dashboard-psicologo")) rolUsuario = "psicologo";
  else if (pathname.includes("/dashboard-paciente")) rolUsuario = "paciente";
  else if (pathname.includes("/dashboard-secretaria"))
    rolUsuario = "secretaria";

  useEffect(() => {
    if (finDelChatRef.current) {
      finDelChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, abierto]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const textoUsuario = input.trim();
    setInput("");

    setMensajes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        rol: "user",
        texto: textoUsuario,
      },
    ]);

    const contextoActual: AssistantContext = {
      userRole: rolUsuario,
      currentRoute: pathname,
      isModalOpen: false,
      pageElements: [],
    };

    try {
      const resolucion = await Promise.resolve(
        assistantBrain.processInput(textoUsuario, contextoActual),
      );

      setTimeout(() => {
        const data = resolucion as unknown as Record<string, unknown>;
        const accionObj = (data?.action || data?.intent || data) as
          | Record<string, unknown>
          | undefined;

        let tipoAccion = accionObj?.actionType || accionObj?.type;
        const payloadCrudo = accionObj?.payload;
        let payloadFinal =
          typeof payloadCrudo === "function"
            ? (payloadCrudo as (role: AppRole | null) => string)(rolUsuario)
            : payloadCrudo;

        let textoBot =
          typeof resolucion.message === "function"
            ? (resolucion.message as (role: AppRole | null) => string)(
                rolUsuario,
              )
            : (resolucion.message as string);

        // 🟢 SISTEMA INTERCEPTOR: Corrige el GPS del bot y fuerza las acciones correctas
        const intencionPaciente =
          payloadFinal === "BOT_NUEVO_PACIENTE" ||
          payloadFinal === "OPEN_NEW_PATIENT_MODAL" ||
          textoUsuario.toLowerCase().includes("registrar");
        const intencionCita =
          payloadFinal === "OPEN_MODAL_NUEVA_CITA" ||
          textoUsuario.toLowerCase().includes("agendar");

        if (intencionPaciente) {
          if (pathname.includes("/pacientes")) {
            tipoAccion = "TRIGGER_EVENT";
            payloadFinal = "BOT_NUEVO_PACIENTE";
            textoBot =
              "Claro, te abro el formulario para registrar un nuevo paciente.";
          } else {
            tipoAccion = "NAVIGATE";
            payloadFinal = "/dashboard-psicologo/pacientes";
            textoBot =
              "Para registrar un paciente, primero te llevaré al Directorio.";
          }
        } else if (intencionCita) {
          if (pathname.includes("/agenda") || pathname.includes("/citas")) {
            tipoAccion = "TRIGGER_EVENT";
            payloadFinal = "OPEN_MODAL_NUEVA_CITA";
            textoBot = "¡Claro que sí! Abriendo el formulario para tu cita.";
          } else {
            tipoAccion = "NAVIGATE";
            payloadFinal =
              rolUsuario === "paciente"
                ? "/dashboard-paciente/citas"
                : "/dashboard-psicologo/agenda";
            textoBot =
              "Te llevo a la sección de Agenda para que podamos programar la cita.";
          }
        }

        // Mostramos la respuesta definitiva
        setMensajes((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), rol: "bot", texto: textoBot },
        ]);

        console.log(
          `🕵️‍♂️ RADAR BOT - Decisión: [${tipoAccion}] -> ${payloadFinal}`,
        );

        // 4. EJECUCIÓN DEL EVENTO
        if (
          tipoAccion === "TRIGGER_EVENT" &&
          typeof payloadFinal === "string"
        ) {
          // Disparamos en ambas modalidades de eventos por máxima compatibilidad
          window.dispatchEvent(new CustomEvent(payloadFinal));
          window.dispatchEvent(new Event(payloadFinal));
        } else if (
          tipoAccion === "NAVIGATE" &&
          typeof payloadFinal === "string"
        ) {
          router.push(payloadFinal);
        }
      }, 500);
    } catch (error) {
      console.error("Error procesando el mensaje del bot:", error);
    }
  };

  if (!rolUsuario) return null;

  return (
    <div className="fixed bottom-6 right-6 font-sans" style={{ zIndex: 9999 }}>
      {abierto && (
        <div className="bg-white w-80 md:w-96 rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-black leading-tight">Asistente IA</h3>
                <p className="text-xs text-indigo-200 font-medium">
                  Clinesfera Copilot
                </p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.rol === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium shadow-sm ${msg.rol === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"}`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}
            <div ref={finDelChatRef} />
          </div>

          <form
            onSubmit={enviarMensaje}
            className="p-3 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Abrir nueva historia clínica..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              <svg
                className="w-5 h-5 ml-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      )}

      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 transition-transform hover:scale-110 group"
        >
          <span className="text-2xl group-hover:animate-bounce">🤖</span>
        </button>
      )}
    </div>
  );
}

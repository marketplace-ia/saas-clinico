"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAssistant } from "../../lib/assistant/ChatContext";
import { assistantBrain } from "../../lib/assistant/core/IntentResolver";
import { AppRole, AssistantContext } from "../../lib/assistant/types";

// Tipado estricto
interface MessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  quickActions?: string[];
}

export default function AssistantWidget() {
  // Mantenemos isOpen del contexto por si otros botones de la app lo abren/cierran
  const { isOpen, setIsOpen } = useAssistant();
  const router = useRouter();
  const pathname = usePathname();

  // Controlamos los mensajes y la escritura localmente para inyectar el cerebro
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "1",
      sender: "assistant",
      text: "¡Hola! Soy tu asistente inteligente. ¿En qué te puedo ayudar hoy?",
      quickActions: ["Agendar cita", "Registrar paciente"],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // Identificar el rol del usuario según la URL
  let rolUsuario: AppRole | null = null;
  if (pathname.includes("/dashboard-psicologo")) rolUsuario = "psicologo";
  else if (pathname.includes("/dashboard-paciente")) rolUsuario = "paciente";
  else if (pathname.includes("/dashboard-secretaria"))
    rolUsuario = "secretaria";

  const procesarMensaje = async (texto: string) => {
    if (!texto.trim()) return;

    // 1. Mostrar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: texto },
    ]);
    setIsTyping(true);

    const contextoActual: AssistantContext = {
      userRole: rolUsuario,
      currentRoute: pathname,
      isModalOpen: false,
      pageElements: [],
    };

    try {
      // 2. Consultar al Cerebro
      const resolucion = await Promise.resolve(
        assistantBrain.processInput(texto, contextoActual),
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

        // 🟢 INTERCEPTOR GPS: Toma el control total de la acción
        const textoMin = texto.toLowerCase();

        // CORRECCIÓN: Buscamos palabras clave exactas (sustantivos) para evitar cruces con verbos genéricos
        const intencionPaciente =
          payloadFinal === "BOT_NUEVO_PACIENTE" ||
          textoMin.includes("paciente");
        const intencionCita =
          payloadFinal === "OPEN_MODAL_NUEVA_CITA" ||
          textoMin.includes("cita") ||
          textoMin.includes("agendar");
        const intencionEvolucion =
          payloadFinal === "BOT_NUEVA_EVOLUCION" ||
          textoMin.includes("sesión") ||
          textoMin.includes("sesion") ||
          textoMin.includes("evolución");

        // Evaluamos primero la evolución/sesión para que no choque con otras
        if (intencionEvolucion) {
          if (pathname.includes("/historias/")) {
            tipoAccion = "TRIGGER_EVENT";
            payloadFinal = "BOT_NUEVA_EVOLUCION";
            textoBot =
              "Enseguida te abro el formulario para registrar la evolución de esta sesión.";
          } else {
            tipoAccion = "NAVIGATE";
            payloadFinal = "/dashboard-psicologo/historias";
            textoBot =
              "Para registrar una sesión, primero debes seleccionar el expediente del paciente en Historias Clínicas.";
          }
        } else if (intencionPaciente) {
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

        // 3. Responder en el chat
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: textoBot,
          },
        ]);
        setIsTyping(false);

        console.log(
          `🕵️‍♂️ RADAR WIDGET - Acción: [${tipoAccion}] -> Payload: [${payloadFinal}]`,
        );

        // 4. Ejecutar la magia
        if (
          tipoAccion === "TRIGGER_EVENT" &&
          typeof payloadFinal === "string"
        ) {
          window.dispatchEvent(new CustomEvent(payloadFinal));
          window.dispatchEvent(new Event(payloadFinal));
        } else if (
          tipoAccion === "NAVIGATE" &&
          typeof payloadFinal === "string"
        ) {
          router.push(payloadFinal);
        }
      }, 800); // Simulamos un tiempo de pensamiento para que se vea natural
    } catch (error) {
      console.error("Error en el asistente:", error);
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const textoGuardado = inputText;
    setInputText("");
    procesarMensaje(textoGuardado);
  };

  const handleQuickAction = (actionText: string) => {
    procesarMensaje(actionText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-87.5 md:w-100 h-137.5 max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right">
          <div className="bg-indigo-600 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Asistente Clinesfera
                </h3>
                <p className="text-indigo-200 text-xs font-medium">
                  Guía de navegación V2
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((msg: MessageItem) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.quickActions.map((action: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action)}
                        className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5">
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-4 bg-white border-t border-slate-100 shrink-0"
          >
            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-4 h-4 ml-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Asistente de Navegación Seguro
              </span>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 ${
          isOpen
            ? "bg-slate-800 text-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-7 h-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

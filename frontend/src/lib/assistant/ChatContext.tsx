"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppRole } from "./types";
import { chatEventBus } from "./EventBus";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  quickActions?: string[];
}

interface ChatContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  userRole: AppRole | null;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const AssistantProvider = ({
  children,
  userRole,
}: {
  children: ReactNode;
  userRole: AppRole | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "¡Hola! 👋 Soy el Copiloto Clínico de Clinesfera potenciado por IA. Estoy conectado a toda la plataforma. ¿En qué te puedo asistir hoy?",
      quickActions:
        userRole === "psicologo"
          ? ["Llevame a mi Agenda", "Registrar paciente", "Ver mis ingresos"]
          : ["Agendar una cita", "Explorar recursos"],
    },
  ]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };

    const historialActual = [...messages];

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: text,
          historial: historialActual,
          contextoApp: {
            userRole,
            currentRoute: pathname || "/",
          },
        }),
      });

      // 🟢 CORRECCIÓN: Extractor de Errores Detallados
      if (!res.ok) {
        let errorDetallado = "Fallo desconocido en el servidor.";
        try {
          const errorData = await res.json();
          errorDetallado =
            errorData.detalles || errorData.error || res.statusText;
        } catch {
          errorDetallado = `Error HTTP ${res.status}: ${res.statusText}`;
        }
        throw new Error(`[Detalle del Backend]: ${errorDetallado}`);
      }

      const iaRespuesta = await res.json();

      if (iaRespuesta.accion === "NAVIGATE" && iaRespuesta.payload) {
        router.push(iaRespuesta.payload);
      } else if (
        iaRespuesta.accion === "TRIGGER_EVENT" &&
        iaRespuesta.payload
      ) {
        window.dispatchEvent(new Event(iaRespuesta.payload));
        if (chatEventBus && typeof chatEventBus.emit === "function") {
          type DynamicEmitFunction = (event: string, data: undefined) => void;
          const emitirEvento =
            chatEventBus.emit as unknown as DynamicEmitFunction;
          emitirEvento(iaRespuesta.payload, undefined);
        }
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: iaRespuesta.respuesta_texto,
        quickActions: iaRespuesta.sugerencias || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      // 🟢 Ahora veremos el error real de Gemini en la consola del navegador
      console.error("🚨 Error del Copiloto capturado:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "assistant",
          text: `Hubo una interferencia en mi conexión neural. ${error instanceof Error ? error.message : ""}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{ isOpen, setIsOpen, messages, isTyping, sendMessage, userRole }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(ChatContext);
  if (!context)
    throw new Error("useAssistant debe usarse dentro de un AssistantProvider");
  return context;
};

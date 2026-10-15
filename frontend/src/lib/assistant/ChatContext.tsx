"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { assistantBrain } from "./core/IntentResolver";
import { chatEventBus } from "./EventBus";
import { AppRole } from "./types";

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
      text: "¡Hola! 👋 Soy tu asistente de plataforma. Puedo ayudarte a navegar, encontrar funciones o guiarte paso a paso. ¿Qué necesitas hacer hoy?",
      quickActions:
        userRole === "psicologo"
          ? ["Ver mi agenda", "Crear nuevo paciente", "Ir a historias clínicas"]
          : ["Agendar una cita", "Ver mis citas", "Explorar recursos"],
    },
  ]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Agregar mensaje del usuario
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Simular tiempo de pensamiento (UX) y consultar al Cerebro
    setTimeout(() => {
      const brainContext = {
        userRole,
        currentRoute: pathname || "/",
        isModalOpen: false, // Se conectará dinámicamente después
        pageElements: [],
      };

      const resolution = assistantBrain.processInput(text, brainContext);

      // 3. Ejecutar la acción si existe (Ruteo o Evento de UI)
      if (resolution.action) {
        if (resolution.action.type === "NAVIGATE") {
          router.push(resolution.action.payload);
        } else if (resolution.action.type === "TRIGGER_EVENT") {
          // 🟢 NUEVO: Disparamos el evento a nivel global (window)
          window.dispatchEvent(
            new CustomEvent("bot-action", {
              detail: { action: resolution.action.payload },
            }),
          );
          // Mantenemos el EventBus por si acaso
          if (chatEventBus && typeof chatEventBus.emit === "function") {
            chatEventBus.emit(resolution.action.payload, undefined);
          }
        }
      }

      // 4. Agregar la respuesta del asistente
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: resolution.message,
        quickActions: resolution.suggestedQuickActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
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

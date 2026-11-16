"use client";

import { useState, useRef, useEffect } from "react";
import { useAssistant } from "../../lib/assistant/ChatContext";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// --- EL VERDADERO AVATAR 3D INTERACTIVO ---
function Robot3D({ isTyping }: { isTyping: boolean }) {
  const headRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (headRef.current) {
      if (isTyping) {
        // Gira y mira cuando está pensando
        headRef.current.rotation.y += 0.08;
      } else {
        // Flota y mira tranquilo cuando no hace nada
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
        headRef.current.position.y =
          Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={headRef} castShadow scale={1.2}>
        {/* Cabeza metálica */}
        <boxGeometry args={[1.5, 1.2, 1.2]} />
        <meshStandardMaterial color="#4F46E5" roughness={0.3} metalness={0.7} />

        {/* Pantalla frontal negra */}
        <mesh position={[0, 0, 0.61]}>
          <planeGeometry args={[1.2, 0.7]} />
          <meshBasicMaterial color="#1E1B4B" />
        </mesh>

        {/* Ojo Izquierdo (Cambia de color) */}
        <mesh position={[-0.25, 0, 0.62]}>
          <planeGeometry args={[0.25, 0.12]} />
          <meshBasicMaterial color={isTyping ? "#34D399" : "#60A5FA"} />
        </mesh>

        {/* Ojo Derecho (Cambia de color) */}
        <mesh position={[0.25, 0, 0.62]}>
          <planeGeometry args={[0.25, 0.12]} />
          <meshBasicMaterial color={isTyping ? "#34D399" : "#60A5FA"} />
        </mesh>
      </mesh>
    </Float>
  );
}

export default function AssistantWidget() {
  const { isOpen, setIsOpen, messages, isTyping, sendMessage } = useAssistant();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll hacia el último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[90vw] md:w-96 h-600px max-h-[80vh] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(79,70,229,0.4)] border border-white flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 origin-bottom-right">
          {/* HEADER SÚPER PREMIUM (Con el Canvas 3D incrustado) */}
          <div className="bg-linear-to-r from-indigo-600 via-indigo-500 to-teal-400 p-5 h-32 flex justify-between items-center shrink-0 relative overflow-hidden">
            {/* Animación de fondo original */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md z-0"></div>

            <div className="flex items-center gap-4 relative z-10 w-full">
              {/* LA MAGIA 3D REEMPLAZA AL EMOJI */}
              <div className="w-16 h-16 ml--10px relative shrink-0">
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1.5} />
                  <Environment preset="city" />
                  <Robot3D isTyping={isTyping} />
                </Canvas>
              </div>

              <div>
                <h3 className="font-black text-white text-base tracking-wide drop-shadow-sm">
                  Copiloto Clinesfera
                </h3>
                <p className="text-indigo-100 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]"></span>
                  IA Conectada
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:rotate-90 ml-auto shrink-0"
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
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ÁREA DE MENSAJES (Tu diseño intacto) */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-6 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 max-w-[95%]">
                    {msg.quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(action)}
                        disabled={isTyping}
                        className="bg-indigo-50/80 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-end gap-2 animate-in fade-in duration-300">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ZONA DE INPUT DE TEXTO (Tu diseño intacto) */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white/90 backdrop-blur-lg border-t border-slate-100 shrink-0"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pregúntale a tu asistente..."
                disabled={isTyping}
                className="w-full bg-slate-100/70 border border-slate-200 rounded-full py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 font-medium text-slate-700 placeholder-slate-400 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-1.5 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 disabled:shadow-none"
              >
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <div className="text-center mt-3 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
              <svg
                className="w-3.5 h-3.5 text-indigo-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                Motor IA Generativo de Clinesfera
              </span>
            </div>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE (EL ORBE INTACTO) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.8)] z-50 ${
          isOpen
            ? "bg-slate-800 text-white rotate-90"
            : "bg-linear-to-br from-indigo-600 via-indigo-500 to-teal-400 text-white hover:shadow-[0_10px_50px_-10px_rgba(20,184,166,0.8)]"
        }`}
      >
        {!isOpen && (
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-75 duration-1000"></div>
        )}
        {isOpen ? (
          <svg
            className="w-7 h-7 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span className="text-3xl filter drop-shadow-md group-hover:animate-bounce">
            🤖
          </span>
        )}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
        )}
      </button>
    </div>
  );
}

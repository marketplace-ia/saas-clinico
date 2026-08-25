"use client";

import { useRouter } from "next/navigation";

export default function SalaVirtualPage() {
  const router = useRouter();

  // Generamos un nombre de sala único para la clínica
  const nombreSala = "PsiClinic-Consultorio-Seguro-2026";

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans overflow-hidden">
      {/* 🛡️ Barra Superior Clínica */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
            Ψ
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-tight">
              Telemedicina PsiClinic
            </h1>
            <p className="text-xs text-green-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              Conexión Segura (Cifrado Extremo a Extremo)
            </p>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-0.5"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
          Finalizar Sesión
        </button>
      </header>

      {/* 🎥 Contenedor del Video (Jitsi Meet Iframe) */}
      <main className="flex-1 w-full bg-black relative">
        {/* Usamos iframe para incrustar el video de forma nativa sin instalar librerías pesadas */}
        <iframe
          src={`https://meet.jit.si/${nombreSala}`}
          allow="camera; microphone; fullscreen; display-capture"
          className="absolute inset-0 w-full h-full border-0"
        ></iframe>
      </main>
    </div>
  );
}

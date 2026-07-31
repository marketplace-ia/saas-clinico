"use client";

import { useRouter } from "next/navigation";
import { Rocket, ArrowLeft, Sparkles, Wrench } from "lucide-react";

export default function Proximamente() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 p-10 md:p-16 rounded-3xl shadow-2xl max-w-2xl w-full text-center relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8 relative">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 relative z-10">
            <Rocket className="w-12 h-12" />
          </div>
          <Sparkles className="w-8 h-8 text-amber-400 absolute top-0 right-1/3 animate-pulse" />
          <Wrench className="w-6 h-6 text-slate-400 absolute bottom-0 left-1/3 animate-bounce" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-4">
          Módulo en Desarrollo
        </h1>

        <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto">
          ¡Gracias por tu interés! Esta funcionalidad está planificada para la
          **Fase 2** de la plataforma. Estamos trabajando duro para traer
          herramientas de historial, pagos y gestión avanzada muy pronto.
        </p>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-slate-900/20"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a mi panel
        </button>
      </div>
    </div>
  );
}

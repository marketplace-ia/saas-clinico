"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

export default function SuscripcionPage() {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<"mensual" | "anual">(
    "mensual",
  );

  // SIMULADOR DE PAGO (Hasta que tengamos las claves de Paymentez)
  const simularActivacionPaymentez = async (nombrePlan: string) => {
    setProcesando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      // Calculamos la fecha de fin de prueba (14 días desde hoy)
      const fechaFinPrueba = new Date();
      fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 14);

      // Actualizamos o insertamos la suscripción en Supabase
      const { error } = await supabase.from("suscripciones").upsert({
        psicologo_id: session.user.id,
        estado: "prueba", // ¡Esto quita el candado!
        plan: nombrePlan,
        fecha_fin_prueba: fechaFinPrueba.toISOString(),
      });

      if (error) throw error;

      // Simulamos 2 segundos de carga de pasarela de pago
      setTimeout(() => {
        router.push("/dashboard-psicologo?activacion=exitosa");
      }, 2000);
    } catch (error) {
      console.error("Error activando prueba:", error);
      alert("Hubo un error al activar tu cuenta.");
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 font-sans">
      {/* Encabezado */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Invierte en tu Práctica Clínica
        </h1>
        <p className="text-lg text-slate-500 font-medium">
          Únete a cientos de psicólogos que ya optimizaron su tiempo.{" "}
          <br className="hidden md:block" />
          <strong className="text-indigo-600">
            Comienza hoy con 14 días gratis.
          </strong>{" "}
          Cancela en cualquier momento.
        </p>
      </div>

      {/* Switch Mensual / Anual */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-200/60 p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setPlanSeleccionado("mensual")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${planSeleccionado === "mensual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pago Mensual
          </button>
          <button
            onClick={() => setPlanSeleccionado("anual")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${planSeleccionado === "anual" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            Pago Anual{" "}
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest ml-1">
              Ahorra 20%
            </span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Precios */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Plan Esencial */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            Plan Esencial
          </h3>
          <p className="text-slate-500 text-sm font-medium h-10">
            Perfecto para especialistas que recién inician su consultorio
            privado.
          </p>

          <div className="my-6">
            <span className="text-5xl font-black text-slate-900">
              ${planSeleccionado === "mensual" ? "29" : "278"}
            </span>
            <span className="text-slate-500 font-medium">
              / {planSeleccionado === "mensual" ? "mes" : "año"}
            </span>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Agenda inteligente ilimitada",
              "Hasta 50 pacientes activos",
              "Portal básico para pacientes",
              "Recordatorios por email",
            ].map((beneficio, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-slate-700 font-medium"
              >
                <svg
                  className="w-5 h-5 text-emerald-500 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>

          <button
            disabled={procesando}
            onClick={() => simularActivacionPaymentez("esencial")}
            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl transition-colors disabled:opacity-50"
          >
            Comenzar Prueba Gratis
          </button>
        </div>

        {/* Plan Pro (Destacado) */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-indigo-500 to-purple-500 text-white text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full">
            El Más Elegido
          </div>

          <h3 className="text-2xl font-black text-white mb-2">
            Plan Profesional
          </h3>
          <p className="text-slate-400 text-sm font-medium h-10">
            Todo lo que necesitas para escalar tu clínica y automatizar cobros.
          </p>

          <div className="my-6">
            <span className="text-5xl font-black text-white">
              ${planSeleccionado === "mensual" ? "49" : "470"}
            </span>
            <span className="text-slate-400 font-medium">
              / {planSeleccionado === "mensual" ? "mes" : "año"}
            </span>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Pacientes ilimitados",
              "Historias clínicas encriptadas",
              "Cobro online (Paymentez / Stripe)",
              "Recordatorios por WhatsApp",
              "Soporte prioritario 24/7",
            ].map((beneficio, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-slate-300 font-medium"
              >
                <svg
                  className="w-5 h-5 text-indigo-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>

          <button
            disabled={procesando}
            onClick={() => simularActivacionPaymentez("profesional")}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {procesando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Iniciar 14 Días Gratis"
            )}
          </button>
          <p className="text-center text-slate-500 text-xs mt-4 font-medium">
            No se cobrará nada hoy. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}

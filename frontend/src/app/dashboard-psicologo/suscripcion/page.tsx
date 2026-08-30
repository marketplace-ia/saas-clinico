"use client";

import { useState } from "react";

export default function SuscripcionPage() {
  const [cicloFacturacion, setCicloFacturacion] = useState<"mensual" | "anual">(
    "mensual",
  );
  const [procesando, setProcesando] = useState<string | null>(null);

  const planes = [
    {
      id: "essential",
      nombre: "Lumina Essential",
      precioMensual: 29,
      precioAnual: 24, // $288 al año (ahorro del 17%)
      descripcion:
        "Todo lo necesario para gestionar tu consultorio independiente.",
      caracteristicas: [
        "Hasta 50 pacientes activos",
        "Historias clínicas encriptadas",
        "Portal de pacientes con marca blanca",
        "Soporte técnico por correo",
      ],
      popular: false,
    },
    {
      id: "pro",
      nombre: "Lumina PRO",
      precioMensual: 49,
      precioAnual: 39, // $468 al año (ahorro del 20%)
      descripcion:
        "El ecosistema completo para automatizar y escalar tu práctica.",
      caracteristicas: [
        "Pacientes activos ilimitados",
        "Sincronización bidireccional con Google Calendar",
        "Recordatorios automáticos por WhatsApp/Email",
        "Pasarela de cobro a pacientes (próximamente)",
        "Soporte prioritario 24/7",
      ],
      popular: true,
    },
  ];

  const handleSeleccionarPlan = (planId: string) => {
    setProcesando(planId);
    // Aquí conectaremos con Stripe Checkout en el siguiente paso
    setTimeout(() => {
      alert(
        `Simulando redirección segura a Stripe para el plan: ${planId} (${cicloFacturacion})`,
      );
      setProcesando(null);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Potencia tu práctica clínica
        </h1>
        <p className="text-slate-500 text-lg">
          Elige el plan que mejor se adapte a ti. Cancela en cualquier momento,
          sin contratos ocultos.
        </p>

        {/* Interruptor Mensual / Anual */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <span
            className={`text-sm font-bold ${cicloFacturacion === "mensual" ? "text-slate-900" : "text-slate-400"}`}
          >
            Mensual
          </span>
          <button
            onClick={() =>
              setCicloFacturacion(
                cicloFacturacion === "mensual" ? "anual" : "mensual",
              )
            }
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${cicloFacturacion === "anual" ? "translate-x-8" : "translate-x-1"}`}
            />
          </button>
          <span
            className={`text-sm font-bold flex items-center gap-2 ${cicloFacturacion === "anual" ? "text-slate-900" : "text-slate-400"}`}
          >
            Anual{" "}
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">
              Ahorra 20%
            </span>
          </span>
        </div>
      </div>

      {/* Tarjetas de Planes */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {planes.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-3xl p-8 border ${plan.popular ? "border-indigo-500 shadow-2xl shadow-indigo-500/10" : "border-slate-200 shadow-xl shadow-slate-200/50"} flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-linear-to-r from-indigo-500 to-teal-400 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Más Recomendado
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {plan.nombre}
              </h3>
              {/* CORRECCIÓN TAILWIND AQUÍ (min-h-10) */}
              <p className="text-slate-500 text-sm mt-2 min-h-10">
                {plan.descripcion}
              </p>
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">
                $
                {cicloFacturacion === "mensual"
                  ? plan.precioMensual
                  : plan.precioAnual}
              </span>
              <span className="text-slate-500 font-medium">/ mes</span>
            </div>

            {cicloFacturacion === "anual" && (
              <p className="text-emerald-600 font-bold text-sm mb-6 bg-emerald-50 inline-block px-3 py-1 rounded-lg">
                Facturado ${plan.precioAnual * 12} anualmente
              </p>
            )}

            <ul className="space-y-4 mb-8 flex-1">
              {plan.caracteristicas.map((caracteristica, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm text-slate-700 font-medium"
                >
                  <svg
                    className="w-5 h-5 text-indigo-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {caracteristica}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSeleccionarPlan(plan.id)}
              disabled={procesando !== null}
              className={`w-full py-4 rounded-xl font-black text-sm transition-all flex justify-center items-center gap-2 ${
                plan.popular
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg disabled:bg-indigo-400"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-50 text-opacity-50"
              }`}
            >
              {procesando === plan.id ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Conectando pasarela...
                </>
              ) : (
                "Comenzar con " + plan.nombre
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-slate-200 pt-8 flex flex-col items-center">
        <div className="flex items-center gap-2 text-slate-500 mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-bold">
            Pagos 100% Seguros y Encriptados
          </span>
        </div>
        <p className="text-xs text-slate-400 text-center max-w-md">
          Tus datos bancarios nunca tocan nuestros servidores. Procesamos los
          pagos mediante infraestructura tokenizada de grado bancario (PCI-DSS)
          líder en el mundo.
        </p>
      </div>
    </div>
  );
}

"use client";

import { Receipt, CreditCard, CheckCircle } from "lucide-react";

export default function PagosPaciente() {
  return (
    <div className="p-6 max-w-6xl mx-auto relative h-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Pagos y Facturas
          </h1>
          <p className="text-slate-500 mt-1">
            Gestiona tus pagos pendientes y descarga tus comprobantes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <CreditCard className="w-64 h-64" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-50 p-5 rounded-2xl">
              <Receipt className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            No tienes pagos pendientes
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Todo está al día. Cuando se genere un cobro por una sesión o se
            emita una factura, aparecerá detallada en esta sección para que
            puedas gestionarla.
          </p>

          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-100">
            <CheckCircle className="w-4 h-4" />
            Cuenta solvente
          </div>
        </div>
      </div>
    </div>
  );
}

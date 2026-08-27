"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function PagosPacientePage() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [deudaPagada, setDeudaPagada] = useState(false);
  const [nombrePaciente, setNombrePaciente] = useState("TITULAR DE CUENTA");

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setNombrePaciente(user.email.split("@")[0].toUpperCase());
      }
    };
    obtenerUsuario();
  }, []);

  const procesarPago = (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    // Simulamos la conexión con pasarela bancaria
    setTimeout(() => {
      setCargando(false);
      setDeudaPagada(true);
      setMensaje(
        "¡Transacción aprobada! Se ha generado tu factura electrónica.",
      );

      setTimeout(() => {
        setMensaje("");
      }, 5000);
    }, 2500);
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Facturación y Pagos
        </h1>
        <p className="text-gray-500">
          Gestiona tus saldos pendientes y revisa tus facturas electrónicas.
        </p>
      </div>

      {mensaje && (
        <div className="mb-8 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-emerald-200 animate-in slide-in-from-top-4">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {mensaje}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LADO IZQUIERDO: Tarjeta de Crédito Visual */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 rounded-4xl p-8 text-white shadow-2xl relative overflow-hidden transform transition hover:scale-[1.02] duration-300">
            {/* Brillo de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

            <div className="flex justify-between items-center mb-12 relative z-10">
              <svg
                className="w-12 h-12 text-gray-300 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
              <span className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-linear-to-r from-gray-300 to-white">
                PsiPay
              </span>
            </div>

            <div className="mb-8 relative z-10">
              <p className="text-gray-400 text-xs font-bold tracking-widest mb-1 uppercase">
                Número de Tarjeta Registrada
              </p>
              <p className="font-mono text-2xl tracking-widest text-gray-100 shadow-sm">
                •••• •••• •••• 4242
              </p>
            </div>

            <div className="flex justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold tracking-widest mb-1 uppercase">
                  Titular
                </p>
                <p className="font-bold tracking-wider text-sm truncate max-w-50">
                  {nombrePaciente}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold tracking-widest mb-1 uppercase">
                  Expira
                </p>
                <p className="font-bold tracking-wider text-sm">12/28</p>
              </div>
            </div>
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl transition shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Agregar nuevo método de pago
          </button>
        </div>

        {/* LADO DERECHO: Resumen de Cuenta */}
        <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-4xl p-8 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              🧾
            </span>
            Estado de Cuenta
          </h2>

          <div className="flex-1 flex flex-col gap-4">
            {!deudaPagada ? (
              <>
                {/* Item a pagar */}
                <div className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-gray-100">
                      🩺
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Sesión de Terapia
                      </p>
                      <p className="text-xs text-gray-500">
                        Pendiente de facturación
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-lg text-gray-900">
                    $50.00
                  </span>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">
                      Total a pagar
                    </span>
                    <span className="text-3xl font-black text-blue-600">
                      $50.00
                    </span>
                  </div>

                  <form onSubmit={procesarPago}>
                    <button
                      type="submit"
                      disabled={cargando}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                    >
                      {cargando ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                          Autorizando pago...
                        </>
                      ) : (
                        "Pagar con un clic"
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Vista cuando no hay deudas */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border-4 border-white">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Todo al día
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  No tienes saldos pendientes. Tu historial de facturas está
                  limpio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Facturas */}
      <div className="mt-8 bg-white border border-gray-100 rounded-4xl p-8 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">
          Historial de Transacciones
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold">Fecha</th>
                <th className="pb-3 font-bold">Descripción</th>
                <th className="pb-3 font-bold">Estado</th>
                <th className="pb-3 font-bold text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {deudaPagada && (
                <tr className="border-b border-gray-50 animate-in fade-in bg-green-50/50">
                  <td className="py-4 text-gray-500 font-medium">
                    Justo ahora
                  </td>
                  <td className="py-4 font-bold text-gray-900">
                    Sesión de Terapia
                  </td>
                  <td className="py-4">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold text-xs">
                      PAGADO
                    </span>
                  </td>
                  <td className="py-4 font-black text-right text-gray-900">
                    $50.00
                  </td>
                </tr>
              )}
              <tr className="border-b border-gray-50">
                <td className="py-4 text-gray-500 font-medium">15 Ago 2026</td>
                <td className="py-4 font-bold text-gray-900">
                  Evaluación Inicial
                </td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md font-bold text-xs">
                    PAGADO
                  </span>
                </td>
                <td className="py-4 font-black text-right text-gray-900">
                  $40.00
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

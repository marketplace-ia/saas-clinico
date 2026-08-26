"use client";

import { useState } from "react";

export default function PagosPacientePage() {
  const [procesando, setProcesando] = useState<number | null>(null);
  const [pagoExitoso, setPagoExitoso] = useState<number | null>(null);

  // Datos simulados de deudas y pagos
  const [pendientes, setPendientes] = useState([
    {
      id: 1,
      concepto: "Consulta Psicológica (Telemedicina)",
      fecha: "26 de Agosto, 2026",
      monto: 45.0,
      tipo: "cita",
    },
    {
      id: 2,
      concepto: "Taller: Control de Ansiedad",
      fecha: "28 de Agosto, 2026",
      monto: 15.0,
      tipo: "taller",
    },
  ]);

  const historial = [
    {
      id: 101,
      concepto: "Evaluación Inicial",
      fecha: "15 de Agosto, 2026",
      monto: 50.0,
      metodo: "**** 4242",
      estado: "Pagado",
    },
    {
      id: 102,
      concepto: "Terapia Cognitiva",
      fecha: "01 de Agosto, 2026",
      monto: 45.0,
      metodo: "Transferencia",
      estado: "Pagado",
    },
  ];

  const handlePagar = (id: number) => {
    setProcesando(id);

    // Simulamos la pasarela de pagos (ej. Stripe) que tarda 2 segundos
    setTimeout(() => {
      setProcesando(null);
      setPagoExitoso(id);

      // Quitamos el item de pendientes después de 2 segundos de mostrar el éxito
      setTimeout(() => {
        setPendientes(pendientes.filter((p) => p.id !== id));
        setPagoExitoso(null);
      }, 2000);
    }, 2000);
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Cabecera */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Pagos y Facturación
        </h1>
        <p className="text-gray-500">
          Gestiona tus pagos pendientes y revisa tu historial de transacciones.
        </p>
      </div>

      {/* Tarjeta de Resumen Financiero */}
      <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="z-10">
          <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">
            Total Pendiente
          </p>
          <h2 className="text-5xl font-black text-white flex items-center gap-2">
            $
            {pendientes
              .reduce((total, item) => total + item.monto, 0)
              .toFixed(2)}
          </h2>
        </div>
        <div className="z-10 flex gap-3 w-full md:w-auto">
          <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition w-full md:w-auto backdrop-blur-sm">
            Descargar Estado
          </button>
        </div>
        {/* Decoración */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute right-20 -bottom-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
      </div>

      {/* SECCIÓN: Pagos Pendientes */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Saldos Pendientes
        </h3>

        {pendientes.length === 0 ? (
          <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center text-green-700 font-bold flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-2">
              🎉
            </div>
            ¡Estás al día! No tienes pagos pendientes.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendientes.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${item.tipo === "cita" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {item.tipo === "cita" ? "🩺" : "🎟️"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {item.concepto}
                    </h4>
                    <p className="text-gray-500 text-sm">{item.fecha}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <span className="font-black text-2xl text-gray-900">
                    ${item.monto.toFixed(2)}
                  </span>

                  {pagoExitoso === item.id ? (
                    <div className="bg-green-100 text-green-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      ¡Pagado!
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePagar(item.id)}
                      disabled={procesando === item.id}
                      className={`font-bold py-3 px-8 rounded-xl transition shadow-md flex items-center gap-2 ${procesando === item.id ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1"}`}
                    >
                      {procesando === item.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            ></path>
                          </svg>{" "}
                          Pagar Ahora
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN: Historial de Transacciones */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg
            className="w-6 h-6 text-green-500"
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
          Historial de Pagos
        </h3>

        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Concepto</th>
                  <th className="p-4 font-bold">Fecha</th>
                  <th className="p-4 font-bold">Método</th>
                  <th className="p-4 font-bold text-right">Monto</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-center">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historial.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-900">
                      {pago.concepto}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{pago.fecha}</td>
                    <td className="p-4 text-gray-500 text-sm flex items-center gap-2">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        ></path>
                      </svg>
                      {pago.metodo}
                    </td>
                    <td className="p-4 font-black text-gray-900 text-right">
                      ${pago.monto.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {pago.estado}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition">
                        <svg
                          className="w-5 h-5 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

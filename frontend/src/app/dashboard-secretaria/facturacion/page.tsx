"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

interface CitaFactura {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

export default function FacturacionSecretariaPage() {
  const [citas, setCitas] = useState<CitaFactura[]>([]);
  const [cargando, setCargando] = useState(true);

  // Precio estándar simulado por consulta
  const TARIFA_CONSULTA = 50.0;

  useEffect(() => {
    const cargarDatosFinancieros = async () => {
      setCargando(true);
      try {
        // Traemos todas las citas para calcular finanzas
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .order("fecha", { ascending: false });

        if (error) throw error;
        setCitas(data || []);
      } catch (error) {
        console.error("Error al cargar la facturación:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosFinancieros();
  }, []);

  // Cálculos financieros
  const citasConfirmadas = citas.filter(
    (c) => c.estado === "confirmada" || c.estado === "completada",
  );
  const ingresosProyectados = citasConfirmadas.length * TARIFA_CONSULTA;

  const citasPendientes = citas.filter((c) => c.estado === "pendiente");
  const pagosEnEspera = citasPendientes.length * TARIFA_CONSULTA;

  return (
    <div className="w-full p-8 font-sans">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Facturación y Pagos
        </h1>
        <p className="text-gray-500 mt-1">
          Control financiero, liquidación de consultas y estado de cuenta de la
          clínica.
        </p>
      </div>

      {/* Widgets Financieros (Tarjetas superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ingresos Confirmados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">
              Ingresos (Confirmados)
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              ${ingresosProyectados.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Pagos Pendientes (Citas por confirmar) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-2xl">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">
              Pagos en Espera
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              ${pagosEnEspera.toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Total de Transacciones */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">
              Citas Procesadas
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {citas.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Historial de Facturación */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Historial de Cobros
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-800 font-bold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition border border-purple-100">
            Exportar a Excel
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">
            Calculando finanzas...
          </div>
        ) : citas.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay registros financieros para mostrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-semibold">Ref. de Cita</th>
                  <th className="p-5 font-semibold">Fecha de Servicio</th>
                  <th className="p-5 font-semibold">Monto</th>
                  <th className="p-5 font-semibold">Estado de Pago</th>
                  <th className="p-5 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {citas.map((cita) => {
                  const esPagado =
                    cita.estado === "confirmada" ||
                    cita.estado === "completada";
                  const esRechazado = cita.estado === "cancelada";

                  return (
                    <tr
                      key={cita.id}
                      className="hover:bg-purple-50/40 transition"
                    >
                      <td className="p-5 font-mono text-sm text-gray-500">
                        {cita.id.split("-")[0].toUpperCase()}
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-gray-800">
                          {cita.fecha}
                        </div>
                        <div className="text-sm text-gray-500">{cita.hora}</div>
                      </td>
                      <td className="p-5 font-bold text-gray-800">
                        ${TARIFA_CONSULTA.toFixed(2)}
                      </td>
                      <td className="p-5">
                        {esPagado ? (
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                            PAGADO
                          </span>
                        ) : esRechazado ? (
                          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                            ANULADO
                          </span>
                        ) : (
                          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                            POR COBRAR
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                            esPagado
                              ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              : "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                          }`}
                        >
                          {esPagado ? "Ver Recibo" : "Cobrar Ahora"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

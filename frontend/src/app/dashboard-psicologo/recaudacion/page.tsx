"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface RecaudacionPaciente {
  id: string;
  cita_id: string;
  monto_pagado: number;
  estado_pago: string;
  comprobante_url: string;
  creado_el: string;
  citas?: {
    nombre_paciente: string;
    fecha: string;
    hora_inicio: string;
    modalidad: string;
  } | null;
}

export default function CentroRecaudacionPsicologo() {
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [recaudaciones, setRecaudaciones] = useState<RecaudacionPaciente[]>([]);
  const [filtro, setFiltro] = useState<
    "pendientes" | "revision" | "aprobado" | "rechazado"
  >("revision");

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoAConfirmar, setPagoAConfirmar] =
    useState<RecaudacionPaciente | null>(null);
  const [visorComprobante, setVisorComprobante] = useState<{
    url: string;
    titulo: string;
  } | null>(null);

  const cargarPagos = useCallback(async (mostrarLoader: boolean = false) => {
    if (mostrarLoader) setCargando(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setErrorGlobal(null);

      if (sessionError || !session?.user?.id)
        throw new Error("Error de autenticación.");

      const { data: pagosDB, error: pagosError } = await supabase
        .from("recaudacion_pacientes")
        .select(
          `
          id, cita_id, monto_pagado, estado_pago, comprobante_url, creado_el, psicologo_id,
          citas (nombre_paciente, fecha, hora_inicio, modalidad)
        `,
        )
        .order("creado_el", { ascending: false });

      if (pagosError) {
        throw new Error("No se pudo descargar la información de recaudación.");
      }

      setRecaudaciones((pagosDB || []) as unknown as RecaudacionPaciente[]);
    } catch (err: unknown) {
      const msj =
        err instanceof Error
          ? err.message
          : "Error desconocido al procesar la solicitud";
      setErrorGlobal(msj);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await cargarPagos(false);
    };
    inicializar();
  }, [cargarPagos]);

  const registrarPagoConfirmado = async (accion: "aprobar" | "rechazar") => {
    if (!pagoAConfirmar) return;
    setProcesandoPago(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/recaudacion/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          recaudacion_id: pagoAConfirmar.id,
          cita_id: pagoAConfirmar.cita_id,
          accion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(
        `Pago ${accion === "aprobar" ? "registrado y cuenta por cobrar saldada" : "rechazado"} correctamente.`,
      );
      setPagoAConfirmar(null);
      cargarPagos(true);
    } catch (err: unknown) {
      const msj =
        err instanceof Error ? err.message : "Error al procesar el pago.";
      alert(`Operación denegada: ${msj}`);
    } finally {
      setProcesandoPago(false);
    }
  };

  const verComprobanteSeguro = async (rutaBucket: string, titulo: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("comprobantes_pacientes")
        .createSignedUrl(rutaBucket, 60);
      if (error || !data)
        throw new Error("No autorizado para ver este recibo.");
      setVisorComprobante({ url: data.signedUrl, titulo });
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : "Error de seguridad abriendo archivo.",
      );
    }
  };

  const pagosFiltrados = recaudaciones.filter((p) => {
    if (filtro === "pendientes")
      return p.estado_pago === "pending" || p.estado_pago === "pendiente_pago";
    if (filtro === "revision")
      return (
        p.estado_pago === "en_revision" || p.estado_pago === "under_review"
      );
    if (filtro === "aprobado")
      return p.estado_pago === "confirmed" || p.estado_pago === "aprobado";
    if (filtro === "rechazado")
      return p.estado_pago === "rejected" || p.estado_pago === "rechazado";
    return true;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmed":
      case "aprobado":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            PAGADO
          </span>
        );
      case "en_revision":
      case "under_review":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            EN REVISIÓN
          </span>
        );
      case "pending":
      case "pendiente_pago":
        return (
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            POR PAGAR
          </span>
        );
      case "rejected":
      case "rechazado":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            RECHAZADO
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            {estado}
          </span>
        );
    }
  };

  if (cargando)
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            Centro de Recaudación
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Gestiona tus cuentas por cobrar, revisa los comprobantes de tus
            pacientes y aplica los pagos recibidos en tu cuenta bancaria.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-slate-700">
              {recaudaciones.filter((p) => p.estado_pago === "pending").length}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              Pendientes
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-amber-600">
              {
                recaudaciones.filter(
                  (p) =>
                    p.estado_pago === "en_revision" ||
                    p.estado_pago === "under_review",
                ).length
              }
            </p>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">
              En Revisión
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center min-w-30">
            <p className="text-3xl font-black text-emerald-600">
              $
              {recaudaciones
                .filter(
                  (p) =>
                    p.estado_pago === "confirmed" ||
                    p.estado_pago === "aprobado",
                )
                .reduce((acc, p) => acc + Number(p.monto_pagado), 0)
                .toFixed(2)}
            </p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">
              Recaudado
            </p>
          </div>
        </div>
      </div>

      {errorGlobal && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm whitespace-pre-wrap break-all">
          {errorGlobal}
        </div>
      )}

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setFiltro("pendientes")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "pendientes" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
        >
          Por Pagar{" "}
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs">
            {recaudaciones.filter((p) => p.estado_pago === "pending").length}
          </span>
        </button>
        <button
          onClick={() => setFiltro("revision")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "revision" ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"}`}
        >
          En Revisión{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {
              recaudaciones.filter(
                (p) =>
                  p.estado_pago === "en_revision" ||
                  p.estado_pago === "under_review",
              ).length
            }
          </span>
        </button>
        <button
          onClick={() => setFiltro("aprobado")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "aprobado" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"}`}
        >
          Pagos Confirmados
        </button>
        <button
          onClick={() => setFiltro("rechazado")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "rechazado" ? "bg-rose-600 text-white shadow-md" : "text-slate-500 hover:bg-rose-50 hover:text-rose-700"}`}
        >
          Rechazados
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 min-h-300px">
        {pagosFiltrados.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Bandeja Vacía
            </h3>
            <p className="text-slate-500 font-medium">
              No tienes operaciones en esta categoría actualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Paciente y Cita
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Monto Depositado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagosFiltrados.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900">
                        {pago.citas?.nombre_paciente || "Paciente Desconocido"}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Cita:{" "}
                        {pago.citas
                          ? `${pago.citas.fecha} a las ${pago.citas.hora_inicio?.slice(0, 5)}`
                          : "N/A"}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {pago.citas?.modalidad || "Online"}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-black text-slate-900 text-lg">
                        ${Number(pago.monto_pagado).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        USD
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      {getEstadoBadge(pago.estado_pago)}
                    </td>
                    <td className="py-5 px-6 text-right space-x-2">
                      {pago.comprobante_url && (
                        <button
                          onClick={() =>
                            verComprobanteSeguro(
                              pago.comprobante_url,
                              pago.citas?.nombre_paciente || "Recibo",
                            )
                          }
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                          Ver comprobante
                        </button>
                      )}
                      {(pago.estado_pago === "en_revision" ||
                        pago.estado_pago === "under_review") && (
                        <button
                          onClick={() => setPagoAConfirmar(pago)}
                          className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-sm font-black transition-colors shadow-sm"
                        >
                          Aplicar pago
                        </button>
                      )}
                      {pago.estado_pago === "pending" && (
                        <span className="text-xs font-bold text-slate-400">
                          Esperando al paciente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagoAConfirmar && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white">
              <h3 className="text-xl font-black">
                Confirmar aplicación del pago
              </h3>
              <p className="text-indigo-200 text-sm mt-1">
                Procesamiento de cuenta por cobrar del paciente
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Paciente:</span>{" "}
                  <span className="font-black text-slate-900">
                    {pagoAConfirmar.citas?.nombre_paciente}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">
                    Fecha de Cita:
                  </span>{" "}
                  <span className="font-bold text-slate-900">
                    {pagoAConfirmar.citas ? pagoAConfirmar.citas.fecha : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold">
                    Valor depositado:
                  </span>{" "}
                  <span className="font-black text-emerald-600">
                    USD {Number(pagoAConfirmar.monto_pagado).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => setPagoAConfirmar(null)}
                disabled={procesandoPago}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => registrarPagoConfirmado("rechazar")}
                disabled={procesandoPago}
                className="px-5 py-2.5 bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 rounded-xl text-sm transition-colors"
              >
                Rechazar Pago
              </button>
              <button
                onClick={() => registrarPagoConfirmado("aprobar")}
                disabled={procesandoPago}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
              >
                {procesandoPago ? "Procesando..." : "Aprobar y Confirmar Cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {visorComprobante && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setVisorComprobante(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white hover:text-rose-400 font-bold bg-slate-800/50 px-4 py-2 rounded-xl transition-colors">
              Cerrar Visor ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visorComprobante.url}
              alt={`Comprobante de ${visorComprobante.titulo}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

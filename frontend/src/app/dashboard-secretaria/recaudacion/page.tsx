"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Pago {
  id: string;
  referencia_unica: string;
  monto_esperado: number;
  monto_aplicado: number;
  saldo_actual: number;
  estado: string;
  fecha_creacion: string;
  comprobante_url: string | null;
  usuario_id: number;
  paciente_nombre?: string;
}

export default function CentroRecaudacionSecretaria() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [filtro, setFiltro] = useState<
    "revision" | "confirmados" | "pendientes"
  >("revision");

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoAConfirmar, setPagoAConfirmar] = useState<Pago | null>(null);
  const [visorComprobante, setVisorComprobante] = useState<string | null>(null);

  const cargarPagos = useCallback(async (mostrarLoader: boolean = false) => {
    if (mostrarLoader) setCargando(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      setError(null);
      if (sessionError || !session?.user?.id)
        throw new Error("Error de autenticación.");

      // 🟢 DELEGACIÓN: Buscar el psicólogo asignado a esta secretaria
      const { data: relacion, error: relError } = await supabase
        .from("secretaria_psicologo")
        .select("psicologo_id")
        .eq("secretaria_id", session.user.id)
        .maybeSingle();

      if (relError || !relacion?.psicologo_id) {
        throw new Error(
          "No tienes un psicólogo asignado. Contacta al administrador para vincular tu cuenta.",
        );
      }
      const psicologoId = relacion.psicologo_id;

      // Cargar pagos usando el ID del psicólogo delegado
      const { data: pagosDB, error: pagosError } = await supabase
        .from("pagos")
        .select("*")
        .eq("psicologo_id", psicologoId)
        .order("fecha_creacion", { ascending: false });

      if (pagosError)
        throw new Error("No se pudo cargar el historial de recaudación.");

      let pagosEnriquecidos: Pago[] = [];
      if (pagosDB && pagosDB.length > 0) {
        pagosEnriquecidos = await Promise.all(
          pagosDB.map(async (pago) => {
            let paciente_nombre = "Paciente Desconocido";
            if (pago.usuario_id) {
              const { data: usuario } = await supabase
                .from("roles_usuarios")
                .select("nombre, correo")
                .eq("id", pago.usuario_id)
                .maybeSingle();
              paciente_nombre =
                usuario?.nombre || usuario?.correo || "Paciente Desconocido";
            }
            return { ...pago, paciente_nombre } as Pago;
          }),
        );
      }
      setPagos(pagosEnriquecidos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciarCarga = async () => {
      await cargarPagos(false);
    };
    iniciarCarga();
  }, [cargarPagos]);

  const registrarPagoConfirmado = async () => {
    if (!pagoAConfirmar) return;
    setProcesandoPago(true);

    try {
      const { error: rpcError } = await supabase.rpc(
        "rpc_registrar_pago_confirmado",
        {
          p_pago_id: pagoAConfirmar.id,
          p_monto_a_aplicar: pagoAConfirmar.monto_esperado,
        },
      );
      if (rpcError) throw rpcError;
      alert("Pago registrado correctamente.");
      setPagoAConfirmar(null);
      cargarPagos(true);
    } catch (err: unknown) {
      alert(
        `Operación denegada: ${err instanceof Error ? err.message : "Error al procesar el pago."}`,
      );
    } finally {
      setProcesandoPago(false);
    }
  };

  const getComprobanteUrl = (rutaStorage: string | null) => {
    if (!rutaStorage) return null;
    const { data } = supabase.storage
      .from("comprobantes_pagos")
      .getPublicUrl(rutaStorage);
    return data.publicUrl;
  };

  const pagosFiltrados = pagos.filter((p) => {
    if (filtro === "revision")
      return p.estado === "comprobante_recibido" || p.estado === "en_revision";
    if (filtro === "confirmados") return p.estado === "confirmado";
    if (filtro === "pendientes")
      return (
        p.estado === "pendiente_pago" ||
        p.estado === "informacion_adicional_requerida"
      );
    return true;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            PAGADO
          </span>
        );
      case "en_revision":
      case "comprobante_recibido":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            EN REVISIÓN
          </span>
        );
      case "pendiente_pago":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            POR COBRAR
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            {estado.replace("_", " ")}
          </span>
        );
    }
  };

  if (cargando)
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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
            Gestiona las cuentas por cobrar y audita los comprobantes de los
            pacientes en nombre del especialista.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center min-w-30">
            <p className="text-3xl font-black text-rose-600">
              {pagos.filter((p) => p.estado === "pendiente_pago").length}
            </p>
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mt-1">
              Por Cobrar
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-amber-600">
              {
                pagos.filter(
                  (p) =>
                    p.estado === "comprobante_recibido" ||
                    p.estado === "en_revision",
                ).length
              }
            </p>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">
              En Revisión
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center min-w-30">
            <p className="text-3xl font-black text-emerald-600">
              {pagos.filter((p) => p.estado === "confirmado").length}
            </p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">
              Confirmados
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setFiltro("revision")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "revision" ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"}`}
        >
          En Revisión{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {
              pagos.filter(
                (p) =>
                  p.estado === "comprobante_recibido" ||
                  p.estado === "en_revision",
              ).length
            }
          </span>
        </button>
        <button
          onClick={() => setFiltro("confirmados")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "confirmados" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"}`}
        >
          Pagos Confirmados
        </button>
        <button
          onClick={() => setFiltro("pendientes")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "pendientes" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
        >
          Cuentas por Cobrar
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {pagosFiltrados.length === 0 ? (
          <div className="p-16 text-center">
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
                    Paciente
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Saldos
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
                        {pago.paciente_nombre}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(pago.fecha_creacion).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-mono text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                        {pago.referencia_unica}
                      </span>
                    </td>
                    <td className="py-5 px-6">{getEstadoBadge(pago.estado)}</td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">
                          ${Number(pago.monto_esperado).toFixed(2)}{" "}
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Esperado
                          </span>
                        </span>
                        {pago.saldo_actual > 0 && (
                          <span className="text-xs font-bold text-rose-500 mt-0.5">
                            ${Number(pago.saldo_actual).toFixed(2)} Pendiente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right space-x-2">
                      {pago.comprobante_url && (
                        <button
                          onClick={() =>
                            setVisorComprobante(
                              getComprobanteUrl(pago.comprobante_url),
                            )
                          }
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                          Ver comprobante
                        </button>
                      )}

                      {(pago.estado === "comprobante_recibido" ||
                        pago.estado === "en_revision") && (
                        <button
                          onClick={() => setPagoAConfirmar(pago)}
                          className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-1.5 rounded-lg text-sm font-black transition-colors shadow-sm"
                        >
                          Aplicar pago
                        </button>
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
            <div className="p-6 border-b border-slate-100 bg-purple-600 text-white">
              <h3 className="text-xl font-black">
                Confirmar aplicación del pago
              </h3>
              <p className="text-purple-200 text-sm mt-1">
                Procesamiento de cuenta por cobrar
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Paciente:</span>{" "}
                  <span className="font-black text-slate-900">
                    {pagoAConfirmar.paciente_nombre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Referencia:</span>{" "}
                  <span className="font-mono font-bold text-purple-600">
                    {pagoAConfirmar.referencia_unica}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">
                    Valor de la operación:
                  </span>{" "}
                  <span className="font-black text-slate-900">
                    USD {Number(pagoAConfirmar.monto_esperado).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">
                    Valor a aplicar:
                  </span>{" "}
                  <span className="font-black text-emerald-600">
                    USD {Number(pagoAConfirmar.monto_esperado).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-bold">
                    Estado actual:
                  </span>{" "}
                  {getEstadoBadge(pagoAConfirmar.estado)}
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
                onClick={registrarPagoConfirmado}
                disabled={procesandoPago}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {procesandoPago ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Registrar pago confirmado"
                )}
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
              src={visorComprobante}
              alt="Comprobante de Pago"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

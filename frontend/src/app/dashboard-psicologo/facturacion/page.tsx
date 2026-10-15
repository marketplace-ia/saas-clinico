"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface FacturaOperacion {
  pago_id: string;
  paciente_nombre: string;
  referencia_interna: string;
  monto: number;
  fecha_pago: string;
  factura_id?: string;
  secuencial_tributario?: string | null;
  estado_sri:
    | "pendiente_emision"
    | "en_proceso"
    | "autorizada"
    | "rechazada"
    | "anulada";
  xml_url?: string | null;
  ride_url?: string | null;
}

export default function CentroFacturacionPsicologo() {
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [operaciones, setOperaciones] = useState<FacturaOperacion[]>([]);
  const [filtro, setFiltro] = useState<
    "pendientes" | "autorizadas" | "proceso_rechazadas"
  >("pendientes");
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarOperaciones = useCallback(
    async (mostrarLoader: boolean = false) => {
      if (mostrarLoader) setCargando(true);

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        setErrorGlobal(null);

        if (sessionError || !session?.user?.id)
          throw new Error("Error de autenticación.");
        const psicologoId = session.user.id;

        // 1. Cargar pagos CONFIRMADOS
        const { data: pagosDB, error: pagosError } = await supabase
          .from("pagos")
          .select("id, referencia_unica, monto, fecha_creacion, usuario_id")
          .eq("psicologo_id", psicologoId)
          .eq("estado", "confirmado")
          .order("fecha_creacion", { ascending: false });

        if (pagosError)
          throw new Error(`Error al descargar pagos: ${pagosError.message}`);

        // 2. Cargar facturas electrónicas
        const { data: facturasDB, error: facturasError } = await supabase
          .from("facturas_electronicas")
          .select("*")
          .eq("psicologo_id", psicologoId);

        if (facturasError)
          throw new Error(
            `Error al descargar historial de facturas: ${facturasError.message}`,
          );

        // 3. Cruzar datos
        let opsEnriquecidas: FacturaOperacion[] = [];

        if (pagosDB && pagosDB.length > 0) {
          opsEnriquecidas = await Promise.all(
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

              const facturaAsociada = facturasDB?.find(
                (f) => f.pago_id === pago.id,
              );

              return {
                pago_id: pago.id,
                paciente_nombre,
                referencia_interna: pago.referencia_unica,
                monto: pago.monto,
                fecha_pago: pago.fecha_creacion,
                factura_id: facturaAsociada?.id,
                secuencial_tributario: facturaAsociada?.secuencial_tributario,
                estado_sri: facturaAsociada?.estado_sri || "pendiente_emision",
                xml_url: facturaAsociada?.xml_url,
                ride_url: facturaAsociada?.ride_url,
              };
            }),
          );
        }

        setOperaciones(opsEnriquecidas);
      } catch (err: unknown) {
        setErrorGlobal(
          err instanceof Error ? err.message : "Error desconocido",
        );
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  useEffect(() => {
    const iniciarCarga = async () => {
      await cargarOperaciones(false);
    };
    iniciarCarga();
  }, [cargarOperaciones]);

  const emitirFactura = async (
    pagoId: string,
    pacienteNombre: string,
    monto: number,
  ) => {
    const confirmar = confirm(
      `¿Estás seguro de emitir la factura electrónica para ${pacienteNombre} por el valor de $${monto}?`,
    );
    if (!confirmar) return;

    setProcesando(pagoId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sin sesión activa");

      const respuesta = await fetch("/api/billing/emitir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ pago_id: pagoId }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.error ||
            "Fallo en la comunicación con la API de Facturación",
        );
      }

      alert(
        "¡Éxito! Orden de facturación enviada al SRI. El estado cambiará a 'Autorizada' una vez validada.",
      );
      cargarOperaciones(true);
    } catch (err: unknown) {
      const msj =
        err instanceof Error
          ? err.message
          : "Error al procesar la facturación.";
      alert(`Operación denegada: ${msj}`);
    } finally {
      setProcesando(null);
    }
  };

  const operacionesFiltradas = operaciones.filter((op) => {
    if (filtro === "pendientes") return op.estado_sri === "pendiente_emision";
    if (filtro === "autorizadas") return op.estado_sri === "autorizada";
    if (filtro === "proceso_rechazadas")
      return ["en_proceso", "rechazada", "anulada"].includes(op.estado_sri);
    return true;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "autorizada":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            AUTORIZADA SRI
          </span>
        );
      case "en_proceso":
        return (
          <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>{" "}
            EN PROCESO
          </span>
        );
      case "pendiente_emision":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            PENDIENTE DE EMISIÓN
          </span>
        );
      case "rechazada":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            RECHAZADA
          </span>
        );
      case "anulada":
        return (
          <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            ANULADA
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
            Centro de Facturación
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Gestiona y emite los comprobantes electrónicos tributarios de los
            pagos que ya han sido confirmados en tu cuenta bancaria.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center min-w-30">
            <p className="text-3xl font-black text-amber-600">
              {
                operaciones.filter((o) => o.estado_sri === "pendiente_emision")
                  .length
              }
            </p>
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">
              Por Emitir
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-blue-600">
              {operaciones.filter((o) => o.estado_sri === "en_proceso").length}
            </p>
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mt-1">
              En Proceso
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center min-w-30">
            <p className="text-3xl font-black text-emerald-600">
              {operaciones.filter((o) => o.estado_sri === "autorizada").length}
            </p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">
              Autorizadas
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
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "pendientes" ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-amber-50 hover:text-amber-600"}`}
        >
          Pendientes de Emisión{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {
              operaciones.filter((o) => o.estado_sri === "pendiente_emision")
                .length
            }
          </span>
        </button>
        <button
          onClick={() => setFiltro("proceso_rechazadas")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "proceso_rechazadas" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          En Proceso / Novedades
        </button>
        <button
          onClick={() => setFiltro("autorizadas")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "autorizadas" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"}`}
        >
          Autorizadas SRI
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        {operacionesFiltradas.length === 0 ? (
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
              No hay documentos en esta categoría.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Detalle del Servicio
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Referencia Pago
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Secuencial / Estado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operacionesFiltradas.map((op) => (
                  <tr
                    key={op.pago_id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900">
                        {op.paciente_nombre}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Confirmado:{" "}
                        {new Date(op.fecha_pago).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {op.referencia_interna}
                      </span>
                    </td>
                    <td className="py-5 px-6 space-y-1">
                      {getEstadoBadge(op.estado_sri)}
                      {op.secuencial_tributario && (
                        <p className="text-xs font-mono font-bold text-slate-600 mt-1">
                          {op.secuencial_tributario}
                        </p>
                      )}
                    </td>
                    <td className="py-5 px-6 font-black text-slate-900">
                      ${Number(op.monto).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right space-x-2">
                      {op.estado_sri === "pendiente_emision" && (
                        <button
                          onClick={() =>
                            emitirFactura(
                              op.pago_id,
                              op.paciente_nombre,
                              op.monto,
                            )
                          }
                          disabled={procesando === op.pago_id}
                          className="bg-slate-900 text-white hover:bg-indigo-600 px-4 py-2 rounded-xl text-sm font-black transition-colors shadow-sm disabled:opacity-50"
                        >
                          {procesando === op.pago_id
                            ? "Procesando..."
                            : "Emitir factura"}
                        </button>
                      )}
                      {op.estado_sri === "en_proceso" && (
                        <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                          Consultar estado
                        </button>
                      )}
                      {op.estado_sri === "autorizada" && (
                        <div className="flex justify-end gap-2">
                          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>{" "}
                            Ver factura
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

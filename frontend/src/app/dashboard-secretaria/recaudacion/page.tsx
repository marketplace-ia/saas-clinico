"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

export default function CentroRecaudacionSecretaria() {
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [recaudaciones, setRecaudaciones] = useState<RecaudacionPaciente[]>([]);
  const [psicologoId, setPsicologoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<
    "pendientes" | "revision" | "aprobado" | "rechazado"
  >("revision");

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoAConfirmar, setPagoAConfirmar] =
    useState<RecaudacionPaciente | null>(null);
  const [visorComprobante, setVisorComprobante] = useState<{
    url: string;
    titulo: string;
    esPdf?: boolean;
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

      const miUUID = session.user.id;

      // 🟢 DELEGACIÓN SEGURA: Encontrar al psicólogo jefe
      const { data: perfilData, error: perfilError } = await supabase
        .from("perfil_secretaria")
        .select("psicologo_id")
        .eq("id", miUUID)
        .maybeSingle();

      if (perfilError || !perfilData?.psicologo_id) {
        throw new Error(
          "No tienes un psicólogo asignado. Contacta al administrador.",
        );
      }

      const idJefe = perfilData.psicologo_id;
      setPsicologoId(idJefe);

      // 🟢 CARGA EXACTA COMO EL PSICÓLOGO
      const { data: pagosDB, error: pagosError } = await supabase
        .from("recaudacion_pacientes")
        .select("*")
        .eq("psicologo_id", idJefe)
        .order("creado_el", { ascending: false });

      if (pagosError) throw new Error(`Error RLS: ${pagosError.message}`);

      if (!pagosDB || pagosDB.length === 0) {
        setRecaudaciones([]);
        setCargando(false);
        return;
      }

      const idsCitas = pagosDB.map((p) => p.cita_id);
      const { data: citasDB } = await supabase
        .from("citas")
        .select(
          "id, nombre_paciente, paciente_nombre, fecha, hora_inicio, modalidad",
        )
        .in("id", idsCitas);

      const recaudacionesCompletas: RecaudacionPaciente[] = pagosDB.map(
        (pago) => {
          const citaAsociada = citasDB?.find((c) => c.id === pago.cita_id);
          return {
            ...pago,
            citas: citaAsociada
              ? {
                  nombre_paciente:
                    citaAsociada.nombre_paciente ||
                    citaAsociada.paciente_nombre ||
                    "Paciente Anónimo",
                  fecha: citaAsociada.fecha,
                  hora_inicio: citaAsociada.hora_inicio,
                  modalidad: citaAsociada.modalidad || "Virtual",
                }
              : null,
          };
        },
      );

      setRecaudaciones(recaudacionesCompletas);
    } catch (err: unknown) {
      setErrorGlobal(
        err instanceof Error ? err.message : "Error al procesar la solicitud",
      );
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

  // 🟢 UTILIZA EL ENDPOINT OFICIAL QUE YA CREAMOS PARA EL PSICÓLOGO
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
        `Pago ${accion === "aprobar" ? "registrado y cuenta saldada" : "rechazado"} correctamente.`,
      );
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

  const verComprobanteSeguro = async (rutaBucket: string, titulo: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("comprobantes_pacientes")
        .createSignedUrl(rutaBucket, 60);

      if (error || !data)
        throw new Error("No autorizado para ver este recibo.");

      const esPdf = rutaBucket.toLowerCase().endsWith(".pdf");
      setVisorComprobante({ url: data.signedUrl, titulo, esPdf });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error de seguridad.");
    }
  };

  const pagosFiltrados = recaudaciones.filter((p) => {
    if (filtro === "pendientes")
      return p.estado_pago === "pending" || p.estado_pago === "requested";
    if (filtro === "revision") return p.estado_pago === "under_review";
    if (filtro === "aprobado") return p.estado_pago === "confirmed";
    if (filtro === "rechazado") return p.estado_pago === "rejected";
    return true;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmed":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            PAGADO
          </span>
        );
      case "under_review":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            EN REVISIÓN
          </span>
        );
      case "pending":
      case "requested":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase">
            POR COBRAR
          </span>
        );
      case "rejected":
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
      <div className="p-10 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {!psicologoId && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm">
          🚨 Aviso: Tu cuenta de secretaria no ha sido asignada a ningún
          psicólogo.
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            Centro de Recaudación
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl">
            Gestiona cuentas por cobrar y audita los comprobantes de los
            pacientes en nombre del especialista.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-rose-700">
              {
                recaudaciones.filter(
                  (p) =>
                    p.estado_pago === "pending" ||
                    p.estado_pago === "requested",
                ).length
              }
            </p>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1">
              Por Cobrar
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center min-w-30 shadow-sm">
            <p className="text-3xl font-black text-amber-600">
              {
                recaudaciones.filter((p) => p.estado_pago === "under_review")
                  .length
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
                .filter((p) => p.estado_pago === "confirmed")
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
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm">
          {errorGlobal}
        </div>
      )}

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setFiltro("pendientes")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "pendientes" ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Por Pagar{" "}
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs">
            {
              recaudaciones.filter(
                (p) =>
                  p.estado_pago === "pending" || p.estado_pago === "requested",
              ).length
            }
          </span>
        </button>
        <button
          onClick={() => setFiltro("revision")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtro === "revision" ? "bg-amber-500 text-white shadow-md" : "text-slate-500 hover:bg-amber-50"}`}
        >
          En Revisión{" "}
          <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
            {
              recaudaciones.filter((p) => p.estado_pago === "under_review")
                .length
            }
          </span>
        </button>
        <button
          onClick={() => setFiltro("aprobado")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "aprobado" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-emerald-50"}`}
        >
          Pagos Confirmados
        </button>
        <button
          onClick={() => setFiltro("rechazado")}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "rechazado" ? "bg-rose-600 text-white shadow-md" : "text-slate-500 hover:bg-rose-50"}`}
        >
          Rechazados
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-300px">
        {pagosFiltrados.length === 0 ? (
          <div className="p-16 text-center">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Bandeja Vacía
            </h3>
            <p className="text-slate-500 font-medium">
              No hay operaciones en esta categoría.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase">
                    Paciente y Cita
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase">
                    Monto Depositado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase">
                    Estado
                  </th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagosFiltrados.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900">
                        {pago.citas?.nombre_paciente}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Cita: {pago.citas?.fecha}
                      </p>
                    </td>
                    <td className="py-5 px-6 font-black text-slate-900 text-lg">
                      ${Number(pago.monto_pagado).toFixed(2)}
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
                          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                        >
                          Ver comprobante
                        </button>
                      )}
                      {pago.estado_pago === "under_review" && (
                        <button
                          onClick={() => setPagoAConfirmar(pago)}
                          className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-1.5 rounded-lg text-sm font-black shadow-sm"
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 bg-purple-600 text-white">
              <h3 className="text-xl font-black">
                Auditoría y Confirmación de Pago
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Paciente:</span>{" "}
                  <span className="font-black text-slate-900">
                    {pagoAConfirmar.citas?.nombre_paciente}
                  </span>
                </div>
                <div className="flex justify-between">
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
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => registrarPagoConfirmado("rechazar")}
                disabled={procesandoPago}
                className="px-5 py-2.5 bg-rose-100 text-rose-700 font-bold hover:bg-rose-200 rounded-xl text-sm"
              >
                Rechazar Pago
              </button>
              <button
                onClick={() => registrarPagoConfirmado("aprobar")}
                disabled={procesandoPago}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-sm shadow-md"
              >
                {procesandoPago ? "Procesando..." : "Aprobar y Confirmar Cita"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISOR UNIVERSAL DE COMPROBANTES */}
      {visorComprobante && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setVisorComprobante(null)}
        >
          <div className="relative max-w-5xl w-full h-[85vh] flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white hover:text-rose-400 font-bold bg-slate-800/50 px-4 py-2 rounded-xl z-10">
              Cerrar Visor ✕
            </button>
            <div
              className="w-full h-full bg-slate-100 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center p-2 border-4 border-white relative"
              onClick={(e) => e.stopPropagation()}
            >
              {visorComprobante.esPdf ? (
                <iframe
                  src={visorComprobante.url}
                  className="w-full h-full rounded-lg border-0"
                  title="Comprobante"
                />
              ) : (
                <Image
                  src={visorComprobante.url}
                  alt="Comprobante"
                  fill
                  className="object-contain"
                  unoptimized
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

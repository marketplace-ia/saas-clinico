"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PagoHistorial {
  id: string;
  referencia_unica: string;
  monto_esperado: number;
  estado: string;
  fecha_creacion: string;
  comprobante_url: string | null;
  planes?: { nombre: string } | null;
}

export default function HistorialPagosPsicologoPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorUI, setErrorUI] = useState<string | null>(null);
  const [pagos, setPagos] = useState<PagoHistorial[]>([]);

  // Estados para el Modal de Reintento
  const [modalRechazo, setModalRechazo] = useState<{
    abierto: boolean;
    pagoId: string;
    referencia: string;
  }>({ abierto: false, pagoId: "", referencia: "" });
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null);
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);

  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // 1. Cargar Planes
      const { data: dataPlanes } = await supabase
        .from("planes")
        .select("id, nombre");

      // 2. Cargar Pagos
      const { data: dataPagos, error: errPagos } = await supabase
        .from("pagos")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .eq("entidad_tipo", "suscripcion")
        .order("fecha_creacion", { ascending: false });

      if (errPagos) throw errPagos;

      // 3. Mapear
      if (dataPagos) {
        const pagosDB = dataPagos as unknown as Array<
          PagoHistorial & { entidad_id: string }
        >;
        const pagosEnriquecidos = pagosDB.map((pago) => {
          const planAsociado = dataPlanes?.find(
            (plan) => plan.id === pago.entidad_id,
          );
          return {
            ...pago,
            planes: planAsociado ? { nombre: planAsociado.nombre } : null,
          };
        });
        setPagos(pagosEnriquecidos);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorUI("No se pudo cargar tu historial de transacciones.");
    } finally {
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    const inicializar = async () => {
      await cargarHistorial();
    };
    inicializar();
  }, [cargarHistorial]);

  // ==========================================
  // REINTENTAR PAGO
  // ==========================================
  const reintentarComprobante = async () => {
    if (!archivoNuevo || !modalRechazo.pagoId) return;
    setProcesandoArchivo(true);
    setErrorUI(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append("comprobante", archivoNuevo);
      formData.append("pago_id", modalRechazo.pagoId);

      const res = await fetch("/api/suscripciones/comprobante", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setModalRechazo({ abierto: false, pagoId: "", referencia: "" });
      setArchivoNuevo(null);
      await cargarHistorial();

      alert("✅ Comprobante enviado a revisión correctamente.");
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error
          ? error.message
          : "No pudimos procesar el comprobante.",
      );
      setModalRechazo({ abierto: false, pagoId: "", referencia: "" });
    } finally {
      setProcesandoArchivo(false);
    }
  };

  const getEstadoUI = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>{" "}
            Aprobado
          </span>
        );
      case "comprobante_recibido":
      case "en_revision":
        return (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            En Revisión
          </span>
        );
      case "rechazado":
        return (
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>{" "}
            Rechazado
          </span>
        );
      case "pendiente_pago":
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest w-fit">
            Incompleto
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest w-fit">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Historial de Facturación
            </h1>
            <p className="text-slate-500 font-medium">
              Revisa tus pagos de suscripción, su estado de aprobación y
              facturas asociadas.
            </p>
          </div>
          <Link
            href="/dashboard-psicologo/suscripcion"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-black px-6 py-3 rounded-xl transition-colors shadow-sm w-fit flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva Suscripción
          </Link>
        </div>

        {errorUI && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-8 border border-red-200 shadow-sm flex items-center gap-3">
            <svg
              className="w-6 h-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {errorUI}
          </div>
        )}

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
          ) : pagos.length === 0 ? (
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
                No tienes transacciones
              </h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                Aún no has contratado ningún plan de Clinesfera. Ve a Nueva
                Suscripción para empezar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                      Detalle del Cargo
                    </th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                      Referencia
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
                  {pagos.map((pago) => (
                    <tr
                      key={pago.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900 text-base">
                          {pago.planes?.nombre || "Suscripción"}
                        </p>
                        <p className="text-xs font-bold text-slate-500 mb-1">
                          {new Date(pago.fecha_creacion).toLocaleDateString()} •{" "}
                          {new Date(pago.fecha_creacion).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                        <span className="font-black text-slate-900">
                          ${Number(pago.monto_esperado).toFixed(2)} USD
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {pago.referencia_unica}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {getEstadoUI(pago.estado)}
                          {pago.estado === "rechazado" && (
                            <span className="text-[10px] font-bold text-rose-500 max-w-50">
                              Motivo: Comprobante inválido o monto incorrecto.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        {pago.estado === "rechazado" && (
                          <button
                            onClick={() =>
                              setModalRechazo({
                                abierto: true,
                                pagoId: pago.id,
                                referencia: pago.referencia_unica,
                              })
                            }
                            className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black px-4 py-2.5 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                            Corregir Comprobante
                          </button>
                        )}
                        {pago.estado === "aprobado" && (
                          <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                            Descargar Factura
                          </button>
                        )}
                        {pago.estado === "pendiente_pago" && (
                          <button className="bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                            Completar Pago
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
      </div>

      {/* MODAL PARA REINTENTO DE COMPROBANTE */}
      {modalRechazo.abierto && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-rose-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-rose-900">
                  Solucionar Pago Rechazado
                </h3>
                <p className="text-rose-600/80 text-xs font-bold mt-1 tracking-wider uppercase">
                  Ref: {modalRechazo.referencia}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalRechazo({
                    abierto: false,
                    pagoId: "",
                    referencia: "",
                  });
                  setArchivoNuevo(null);
                }}
                className="text-rose-400 hover:text-rose-600 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-8">
              <p className="text-slate-600 text-sm font-medium mb-6">
                Por favor, verifica el monto transferido en tu cuenta bancaria y
                sube el comprobante correcto para enviar nuevamente tu pago a
                revisión administrativa.
              </p>

              <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-6 mb-6 cursor-pointer relative group flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/jpeg, image/png, application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    setArchivoNuevo(e.target.files ? e.target.files[0] : null)
                  }
                />
                <svg
                  className="w-8 h-8 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                {archivoNuevo ? (
                  <div className="text-center">
                    <p className="font-bold text-indigo-600 line-clamp-1">
                      {archivoNuevo.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(archivoNuevo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-bold text-slate-700 text-sm">
                      Selecciona el nuevo comprobante
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG</p>
                  </div>
                )}
              </div>

              <button
                onClick={reintentarComprobante}
                disabled={!archivoNuevo || procesandoArchivo}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {procesandoArchivo ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                    Reenviando...
                  </>
                ) : (
                  "Enviar a Revisión"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

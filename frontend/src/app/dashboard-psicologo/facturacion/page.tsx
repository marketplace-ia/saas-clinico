"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

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

type SubResponse = {
  estado: string;
  plan_id: string;
  planes: { nombre: string } | { nombre: string }[] | null;
};

export default function CentroFacturacionPsicologo() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [operaciones, setOperaciones] = useState<FacturaOperacion[]>([]);
  const [filtro, setFiltro] = useState<
    "pendientes" | "autorizadas" | "proceso_rechazadas"
  >("pendientes");
  const [procesando, setProcesando] = useState<string | null>(null);

  const [planActual, setPlanActual] = useState("esencial");
  const [esDemo, setEsDemo] = useState(false); // 🟢 Control de Sandbox

  useEffect(() => {
    let montado = true;

    const cargarDatosFacturacion = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.id)
          throw new Error("Error de autenticación.");

        // ==========================================
        // 🟢 MODO SANDBOX: SI ES EL USUARIO DEMO
        // ==========================================
        if (session.user.email === "demo@clinesfera.com") {
          if (montado) {
            setEsDemo(true);
            setPlanActual("elite"); // 🟢 Pase VIP para ocultar el cartel

            // 🟢 Inyectamos operaciones falsas para que pruebe el sistema
            setOperaciones([
              {
                pago_id: "fake-pago-1",
                paciente_nombre: "María Solis (Demo)",
                referencia_interna: "PGO-0001",
                monto: 45.0,
                fecha_pago: new Date().toISOString(),
                estado_sri: "pendiente_emision",
              },
              {
                pago_id: "fake-pago-2",
                paciente_nombre: "Juan Pérez (Demo)",
                referencia_interna: "PGO-0002",
                monto: 60.0,
                fecha_pago: new Date(Date.now() - 86400000).toISOString(), // Ayer
                secuencial_tributario: "001-001-000000012",
                estado_sri: "autorizada",
              },
            ]);
            setCargando(false);
          }
          return; // Rompemos para que no toque Supabase
        }

        // ==========================================
        // FLUJO REAL (Para psicólogos de verdad)
        // ==========================================
        const psicologoId = session.user.id;
        if (montado) setErrorGlobal(null);

        const { data: tu } = await supabase
          .from("tenant_users")
          .select("tenant_id")
          .eq("usuario_id", psicologoId)
          .single();

        if (tu && montado) {
          const { data: sub } = await supabase
            .from("tenant_subscriptions")
            .select(`estado, plan_id, planes ( nombre )`)
            .eq("tenant_id", tu.tenant_id)
            .single();

          if (sub && (sub.estado === "active" || sub.estado === "confirmado")) {
            const suscripcionData = sub as unknown as SubResponse;
            const dataPlanes = suscripcionData.planes;

            let nombreDelPlan = "esencial";
            if (Array.isArray(dataPlanes))
              nombreDelPlan = dataPlanes[0]?.nombre.toLowerCase() || "esencial";
            else if (dataPlanes && typeof dataPlanes === "object")
              nombreDelPlan = dataPlanes.nombre.toLowerCase() || "esencial";

            setPlanActual(nombreDelPlan);
          }
        }

        const { data: pagosDB, error: pagosError } = await supabase
          .from("pagos")
          .select("id, referencia_unica, monto, fecha_creacion, usuario_id")
          .eq("psicologo_id", psicologoId)
          .eq("estado", "confirmado")
          .order("fecha_creacion", { ascending: false });
        if (pagosError)
          throw new Error(`Error al descargar pagos: ${pagosError.message}`);

        const { data: facturasDB, error: facturasError } = await supabase
          .from("facturas_electronicas")
          .select("*")
          .eq("psicologo_id", psicologoId);
        if (facturasError)
          throw new Error(
            `Error al descargar historial: ${facturasError.message}`,
          );

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

        if (montado) setOperaciones(opsEnriquecidas);
      } catch (err: unknown) {
        if (montado)
          setErrorGlobal(
            err instanceof Error ? err.message : "Error desconocido",
          );
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarDatosFacturacion();

    return () => {
      montado = false;
    };
  }, []);

  const emitirFactura = async (
    pagoId: string,
    pacienteNombre: string,
    monto: number,
  ) => {
    const confirmar = confirm(
      `¿Estás seguro de emitir la factura para ${pacienteNombre} por $${monto}?`,
    );
    if (!confirmar) return;

    setProcesando(pagoId);

    // ==========================================
    // 🟢 MODO SANDBOX: SIMULACIÓN DE EMISIÓN SRI
    // ==========================================
    if (esDemo) {
      setTimeout(() => {
        setOperaciones((prev) =>
          prev.map((op) => {
            if (op.pago_id === pagoId) {
              return {
                ...op,
                estado_sri: "autorizada",
                secuencial_tributario: `001-001-0000000${Math.floor(Math.random() * 90) + 10}`, // Secuencial falso aleatorio
              };
            }
            return op;
          }),
        );
        setProcesando(null);
        alert(
          "¡Éxito! (Simulación): Orden de facturación enviada y autorizada por el SRI.",
        );
      }, 2000); // Simulamos 2 segundos de carga para que parezca real
      return;
    }

    // FLUJO REAL
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
      if (!respuesta.ok)
        throw new Error(
          resultado.error || "Fallo en la comunicación con la API",
        );

      alert("¡Éxito! Orden de facturación enviada al SRI.");
      window.location.reload();
    } catch (err: unknown) {
      alert(
        `Operación denegada: ${err instanceof Error ? err.message : "Error"}`,
      );
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
            PENDIENTE
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
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 relative">
      {/* 🟢 BANNER SANDBOX (Aviso discreto para el usuario) */}
      {esDemo && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-4 py-2 rounded-xl mb-6 flex items-center justify-between text-sm shadow-sm">
          <span>
            🎮 Has desbloqueado el Módulo de Élite en modo simulación. Ninguna
            factura real será enviada al SRI.
          </span>
        </div>
      )}

      {/* EVALUACIÓN DINÁMICA DEL PAYWALL (Oculto si es demo) */}
      {planActual === "esencial" && !esDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Módulo de Élite
            </h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              La automatización tributaria y conexión con el SRI es exclusiva de
              los planes superiores. Olvídate del papeleo escalando tu
              consultorio hoy.
            </p>
            <button
              onClick={() => router.push("/dashboard-psicologo/suscripcion")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-lg transition-colors mb-3"
            >
              Mejorar a Plan Élite
            </button>
            <button
              onClick={() => router.push("/dashboard-psicologo")}
              className="w-full text-slate-500 font-bold py-3 hover:text-slate-800 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}

      <div
        className={
          planActual === "esencial" && !esDemo
            ? "blur-sm pointer-events-none select-none opacity-50"
            : ""
        }
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
              Centro de Facturación
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">
              Gestiona y emite los comprobantes electrónicos tributarios de los
              pagos confirmados.
            </p>
          </div>

          <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center min-w-120px">
              <p className="text-3xl font-black text-amber-600">
                {
                  operaciones.filter(
                    (o) => o.estado_sri === "pendiente_emision",
                  ).length
                }
              </p>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">
                Por Emitir
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center min-w-120px">
              <p className="text-3xl font-black text-emerald-600">
                {
                  operaciones.filter((o) => o.estado_sri === "autorizada")
                    .length
                }
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
            Pendientes{" "}
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">
              {
                operaciones.filter((o) => o.estado_sri === "pendiente_emision")
                  .length
              }
            </span>
          </button>
          <button
            onClick={() => setFiltro("autorizadas")}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filtro === "autorizadas" ? "bg-emerald-600 text-white shadow-md" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"}`}
          >
            Autorizadas SRI
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-300px">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

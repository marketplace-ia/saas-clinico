"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PerfilPsicologo {
  id: string;
  psicologo_id: string;
  nombre_completo?: string;
  nombre_comercial: string;
  especialidad: string;
  ciudad: string;
  estado_verificacion: string;
  url_documento: string | null;
}

interface PagoSuscripcion {
  id: string;
  psicologo_id: string;
  referencia_unica: string;
  monto_esperado: number;
  estado: string;
  comprobante_url: string;
  fecha_creacion: string;
  perfil_psicologo?: {
    nombre_completo: string;
    nombre_comercial: string;
  } | null;
  planes?: { nombre: string; id: string } | null;
}

export default function SuperAdminHubPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorUI, setErrorUI] = useState("");
  const [pestanaActiva, setPestanaActiva] = useState<
    "identidad" | "financiero"
  >("financiero");
  const [procesandoAccion, setProcesandoAccion] = useState<string | null>(null);

  const [profesionales, setProfesionales] = useState<PerfilPsicologo[]>([]);
  const [filtroIdentidad, setFiltroIdentidad] = useState<
    "pendiente" | "aprobado" | "rechazado"
  >("pendiente");

  const [pagos, setPagos] = useState<PagoSuscripcion[]>([]);
  const [filtroFinanciero, setFiltroFinanciero] = useState<
    "revision" | "aprobado" | "rechazado"
  >("revision");

  // 🛠️ ESTADO PARA EL DIAGNÓSTICO PROFUNDO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugLog, setDebugLog] = useState<any>(null);

  const [modalArchivo, setModalArchivo] = useState<{
    abierto: boolean;
    titulo: string;
    archivo_url: string;
    tipo: "pdf" | "imagen";
  }>({ abierto: false, titulo: "", archivo_url: "", tipo: "pdf" });

  const cargarDatosAdmin = useCallback(async () => {
    setCargando(true);

    const logInfo = {
      usuarioAdmin: "",
      totalPerfiles: 0,
      totalPagosSuscripcion: 0,
      estadosEncontrados: {} as Record<string, number>,
      errorDiagnostico: null as string | null,
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || session.user.email !== "pinedaesteban535@gmail.com") {
        router.push("/login");
        return;
      }
      logInfo.usuarioAdmin = session.user.email;

      const { data: dataPerfiles, error: errPerfiles } = await supabase
        .from("perfil_psicologo")
        .select("*");
      if (errPerfiles) throw errPerfiles;
      if (dataPerfiles) {
        setProfesionales(dataPerfiles);
        logInfo.totalPerfiles = dataPerfiles.length;
      }

      const { data: dataPlanes } = await supabase
        .from("planes")
        .select("id, nombre");

      // 🛠️ DIAGNÓSTICO: Buscar todos los pagos de tipo suscripción sin importar el estado
      const { data: dataPagos, error: errPagos } = await supabase
        .from("pagos")
        .select(`*, perfil_psicologo (nombre_completo, nombre_comercial)`)
        .eq("entidad_tipo", "suscripcion")
        .order("fecha_creacion", { ascending: false });

      if (errPagos) throw errPagos;

      if (dataPagos) {
        logInfo.totalPagosSuscripcion = dataPagos.length;

        // Mapear qué estados exactos tienen estos pagos en la base de datos
        dataPagos.forEach((p) => {
          const estadoStr = String(p.estado);
          logInfo.estadosEncontrados[estadoStr] =
            (logInfo.estadosEncontrados[estadoStr] || 0) + 1;
        });

        const pagosDB = dataPagos as unknown as Array<
          PagoSuscripcion & { entidad_id: string }
        >;
        const pagosEnriquecidos = pagosDB.map((pago) => {
          const planAsociado = dataPlanes?.find(
            (plan) => plan.id === pago.entidad_id,
          );
          return {
            ...pago,
            planes: planAsociado
              ? { id: planAsociado.id, nombre: planAsociado.nombre }
              : null,
          };
        });
        setPagos(pagosEnriquecidos);
      }
    } catch (err: unknown) {
      console.error("Detalle del error de carga:", err);
      let errorMessage = "Error al cargar la información administrativa.";
      if (err instanceof Error) errorMessage = err.message;
      setErrorUI(`Fallo de conexión: ${errorMessage}`);
      logInfo.errorDiagnostico = errorMessage;
    } finally {
      setDebugLog(logInfo);
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    const inicializar = async () => {
      await cargarDatosAdmin();
    };
    inicializar();
  }, [cargarDatosAdmin]);

  const cambiarEstadoIdentidad = async (
    id: string,
    nuevoEstado: "aprobado" | "rechazado",
  ) => {
    if (
      !confirm(
        `¿Estás seguro de marcar este perfil clínico como ${nuevoEstado.toUpperCase()}?`,
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("perfil_psicologo")
        .update({ estado_verificacion: nuevoEstado })
        .eq("psicologo_id", id);
      if (error) throw error;
      cargarDatosAdmin();
    } catch (err) {
      console.error(err);
      alert("Hubo un error al actualizar el estado clínico.");
    }
  };

  const procesarPagoSaaS = async (
    pago: PagoSuscripcion,
    accion: "aprobar" | "rechazar",
  ) => {
    if (!confirm(`ATENCIÓN: ¿Deseas ${accion.toUpperCase()} este pago?`))
      return;

    setProcesandoAccion(pago.id);
    setErrorUI("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const endpoint =
        accion === "aprobar"
          ? "/api/admin/suscripciones/aprobar"
          : "/api/admin/suscripciones/rechazar";
      const payload =
        accion === "aprobar"
          ? { pago_id: pago.id }
          : { pago_id: pago.id, motivo_rechazo: "Comprobante inválido" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en el servidor");

      alert(`✅ Éxito: ${data.mensaje || "Operación completada"}`);
      cargarDatosAdmin();
    } catch (err: unknown) {
      console.error("Error capturado:", err);
      setErrorUI(
        err instanceof Error ? err.message : "Error procesando la transacción.",
      );
    } finally {
      setProcesandoAccion(null);
    }
  };

  const abrirVisorSeguro = async (
    rutaBucket: string,
    titulo: string,
    esPrivado: boolean = true,
  ) => {
    try {
      let urlFinal = rutaBucket;

      if (esPrivado) {
        const { data, error } = await supabase.storage
          .from("comprobantes_pagos")
          .createSignedUrl(rutaBucket, 60);
        if (error || !data)
          throw new Error("No se pudo generar la firma de seguridad.");
        urlFinal = data.signedUrl;
      }

      const extension = rutaBucket.split(".").pop()?.toLowerCase();
      const tipo = extension === "pdf" ? "pdf" : "imagen";

      setModalArchivo({ abierto: true, titulo, archivo_url: urlFinal, tipo });
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error de seguridad.");
    }
  };

  const profesionalesFiltrados = profesionales.filter(
    (prof) =>
      prof.estado_verificacion === filtroIdentidad ||
      (!prof.estado_verificacion && filtroIdentidad === "pendiente"),
  );

  // 🟢 CORRECCIÓN MAGNA: Ampliamos la red de búsqueda para capturar cualquier sinónimo que la base de datos use para "aprobado"
  const pagosFiltrados = pagos.filter((pago) => {
    if (filtroFinanciero === "revision")
      return (
        pago.estado === "comprobante_recibido" ||
        pago.estado === "en_revision" ||
        pago.estado === "pending" ||
        pago.estado === "pendiente_pago"
      );

    if (filtroFinanciero === "aprobado")
      return (
        pago.estado === "aprobado" ||
        pago.estado === "confirmado" ||
        pago.estado === "confirmed" ||
        pago.estado === "activo" ||
        pago.estado === "active"
      );

    if (filtroFinanciero === "rechazado")
      return pago.estado === "rechazado" || pago.estado === "rejected";

    return false;
  });

  return (
    <div className="w-full animate-in fade-in duration-700 max-w-7xl mx-auto p-6 md:p-10 pb-20 font-sans">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors mb-4"
        >
          <span aria-hidden="true">&larr;</span> Volver al Dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Centro de Control y Auditoría
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Plataforma de SuperAdministrador. Revisa credenciales clínicas y
          aprueba ingresos financieros.
        </p>
      </div>

      {/* 🛠️ CONSOLA DE DIAGNÓSTICO DEL SUPERADMIN */}
      {debugLog && (
        <div className="mb-10 bg-slate-900 text-cyan-400 p-6 rounded-3xl font-mono text-xs overflow-auto shadow-2xl border border-slate-700 max-h-fit">
          <h3 className="text-white font-bold mb-4 text-base flex items-center gap-2">
            <span>🛠️</span> Consola de Diagnóstico: Motor SaaS
          </h3>
          <pre className="whitespace-pre-wrap mb-4">
            {JSON.stringify(debugLog, null, 2)}
          </pre>

          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-emerald-400 font-bold mb-2">
              💡 Análisis Automático:
            </h4>
            <div className="bg-cyan-900/30 border border-cyan-500/50 p-4 rounded-xl mt-2 text-cyan-100 text-sm leading-relaxed">
              Revisa el apartado <strong>&quot;estadosEncontrados&quot;</strong>{" "}
              en el JSON de arriba.
              <br />
              <br />• Si ves que un pago tiene estado{" "}
              <strong>&quot;confirmado&quot;</strong> o{" "}
              <strong>&quot;activo&quot;</strong>, significa que la API sí
              funcionó, pero la pestaña estaba buscando estrictamente la palabra
              &quot;aprobado&quot;. (Ya amplié la red de búsqueda en este código
              para solucionarlo).
              <br />• Si el estado sigue siendo{" "}
              <strong>&quot;comprobante_recibido&quot;</strong>, significa que
              la API <code>/api/admin/suscripciones/aprobar</code> falló en
              silencio y no actualizó la base de datos cuando presionaste
              &quot;Activar SaaS&quot;.
            </div>
          </div>
        </div>
      )}

      {errorUI && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm flex items-start gap-3">
          <svg
            className="w-6 h-6 shrink-0 mt-0.5"
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
          <div className="break-all whitespace-pre-wrap">{errorUI}</div>
        </div>
      )}

      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setPestanaActiva("financiero")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "financiero" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Auditoría Financiera
        </button>
        <button
          onClick={() => setPestanaActiva("identidad")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "identidad" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Verificación Identidad
        </button>
      </div>

      {cargando ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {pestanaActiva === "financiero" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFiltroFinanciero("revision")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroFinanciero === "revision" ? "bg-amber-100 text-amber-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Por Revisar
                </button>
                <button
                  onClick={() => setFiltroFinanciero("aprobado")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroFinanciero === "aprobado" ? "bg-emerald-100 text-emerald-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Aprobados
                </button>
                <button
                  onClick={() => setFiltroFinanciero("rechazado")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroFinanciero === "rechazado" ? "bg-rose-100 text-rose-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Rechazados
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {pagosFiltrados.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 font-medium">
                    No hay comprobantes financieros en esta bandeja.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Transacción
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Profesional / Plan
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                            Decisión Admin
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
                              <p className="font-mono font-bold text-slate-900">
                                {pago.referencia_unica}
                              </p>
                              <p className="text-xs font-bold text-emerald-600 mt-0.5">
                                ${Number(pago.monto_esperado).toFixed(2)} USD
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(pago.fecha_creacion).toLocaleString()}
                              </p>
                            </td>
                            <td className="py-5 px-6">
                              <p className="font-bold text-slate-800">
                                {pago.perfil_psicologo?.nombre_comercial ||
                                  pago.perfil_psicologo?.nombre_completo ||
                                  "Clínica Privada"}
                              </p>
                              <p className="text-xs font-bold text-slate-500">
                                {pago.planes?.nombre}
                              </p>
                            </td>
                            <td className="py-5 px-6">
                              {pago.comprobante_url ? (
                                <button
                                  onClick={() =>
                                    abrirVisorSeguro(
                                      pago.comprobante_url,
                                      pago.referencia_unica,
                                      true,
                                    )
                                  }
                                  className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1.5 w-fit"
                                >
                                  Auditar Recibo
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Sin archivo
                                </span>
                              )}
                            </td>
                            <td className="py-5 px-6 text-right">
                              {(pago.estado === "comprobante_recibido" ||
                                pago.estado === "en_revision" ||
                                pago.estado === "pendiente_pago" ||
                                pago.estado === "pending") && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      procesarPagoSaaS(pago, "aprobar")
                                    }
                                    disabled={procesandoAccion === pago.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                  >
                                    {procesandoAccion === pago.id
                                      ? "Procesando..."
                                      : "Activar SaaS"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      procesarPagoSaaS(pago, "rechazar")
                                    }
                                    disabled={procesandoAccion === pago.id}
                                    className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              )}
                              {(pago.estado === "aprobado" ||
                                pago.estado === "confirmado" ||
                                pago.estado === "confirmed" ||
                                pago.estado === "activo" ||
                                pago.estado === "active") && (
                                <span className="text-xs font-black text-emerald-600">
                                  SaaS Activo ✓
                                </span>
                              )}
                              {(pago.estado === "rechazado" ||
                                pago.estado === "rejected") && (
                                <span className="text-xs font-black text-rose-500">
                                  Rechazado ✕
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
            </div>
          )}

          {pestanaActiva === "identidad" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFiltroIdentidad("pendiente")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroIdentidad === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Por Revisar
                </button>
                <button
                  onClick={() => setFiltroIdentidad("aprobado")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroIdentidad === "aprobado" ? "bg-emerald-100 text-emerald-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Verificados
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {profesionalesFiltrados.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 font-medium">
                    No hay profesionales en esta bandeja.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Profesional
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Especialidad
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                            Documento
                          </th>
                          <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                            Decisión
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profesionalesFiltrados.map((prof) => (
                          <tr
                            key={prof.psicologo_id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="py-5 px-6">
                              <p className="font-bold text-slate-900">
                                {prof.nombre_completo ||
                                  prof.nombre_comercial ||
                                  "Sin Nombre"}
                              </p>
                              <p className="text-xs font-medium text-slate-500">
                                Ciudad: {prof.ciudad}
                              </p>
                            </td>
                            <td className="py-5 px-6 text-sm font-bold text-slate-700">
                              {prof.especialidad}
                            </td>
                            <td className="py-5 px-6">
                              <button
                                onClick={() =>
                                  abrirVisorSeguro(
                                    prof.url_documento || "",
                                    prof.nombre_completo || "Documento",
                                    false,
                                  )
                                }
                                className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                              >
                                Ver Título
                              </button>
                            </td>
                            <td className="py-5 px-6 text-right">
                              {!prof.estado_verificacion ||
                              prof.estado_verificacion === "pendiente" ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      cambiarEstadoIdentidad(
                                        prof.psicologo_id,
                                        "aprobado",
                                      )
                                    }
                                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 rounded-lg transition-colors"
                                  >
                                    Otorgar Insignia
                                  </button>
                                  <button
                                    onClick={() =>
                                      cambiarEstadoIdentidad(
                                        prof.psicologo_id,
                                        "rechazado",
                                      )
                                    }
                                    className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`text-xs font-black ${prof.estado_verificacion === "aprobado" ? "text-emerald-600" : "text-rose-500"}`}
                                >
                                  {prof.estado_verificacion.toUpperCase()}
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
            </div>
          )}
        </>
      )}

      {modalArchivo.abierto && (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Visor de Seguridad Clinesfera
                </h2>
                <p className="text-slate-500 text-xs font-bold mt-0.5">
                  Expediente:{" "}
                  <span className="text-indigo-600">{modalArchivo.titulo}</span>
                </p>
              </div>
              <button
                onClick={() =>
                  setModalArchivo({
                    abierto: false,
                    titulo: "",
                    archivo_url: "",
                    tipo: "pdf",
                  })
                }
                className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full border border-slate-200 hover:bg-red-50"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="flex-1 bg-slate-800 flex items-center justify-center p-4 overflow-hidden relative">
              {modalArchivo.tipo === "pdf" ? (
                <iframe
                  src={modalArchivo.archivo_url}
                  className="w-full h-full rounded-xl bg-white"
                  title="Visor PDF"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={modalArchivo.archivo_url}
                  alt="Comprobante"
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg border-2 border-white/10"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

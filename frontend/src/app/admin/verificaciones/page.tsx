"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PerfilPsicologo {
  id: string;
  psicologo_id: string;
  nombres: string;
  apellidos: string;
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
    nombres: string;
    apellidos: string;
  } | null;
  planes?: { nombre: string; id: string } | null;
}

interface TicketSoporte {
  id: string;
  asunto: string;
  datos_contacto: string;
  estado: string;
  prioridad: string;
  creado_el: string;
}

export default function SuperAdminHubPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [errorUI, setErrorUI] = useState("");

  const [pestanaActiva, setPestanaActiva] = useState<
    "identidad" | "financiero" | "soporte"
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

  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [filtroSoporte, setFiltroSoporte] = useState<"pendiente" | "resuelto">(
    "pendiente",
  );

  const [modalArchivo, setModalArchivo] = useState<{
    abierto: boolean;
    titulo: string;
    archivo_url: string;
    tipo: "pdf" | "imagen";
  }>({ abierto: false, titulo: "", archivo_url: "", tipo: "pdf" });

  const cargarDatosAdmin = useCallback(async () => {
    setCargando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const adminEmail =
        process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL ||
        "pinedaesteban535@gmail.com";

      if (!session || session.user.email !== adminEmail) {
        router.push("/login");
        return;
      }

      const { data: dataPerfiles, error: errPerfiles } = await supabase
        .from("perfil_psicologo")
        .select("*");

      if (errPerfiles)
        throw new Error(`Error en Perfiles: ${errPerfiles.message}`);

      if (dataPerfiles) {
        setProfesionales(dataPerfiles);
      }

      const { data: dataPlanes } = await supabase
        .from("planes")
        .select("id, nombre");

      const { data: dataPagos, error: errPagos } = await supabase
        .from("pagos")
        .select(`*, perfil_psicologo (nombres, apellidos)`)
        .eq("entidad_tipo", "suscripcion")
        .order("fecha_creacion", { ascending: false });

      if (errPagos) throw new Error(`Error en Pagos: ${errPagos.message}`);

      if (dataPagos) {
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

      const { data: dataTickets, error: errTickets } = await supabase
        .from("soporte_tickets")
        .select("*")
        .order("creado_el", { ascending: false });

      if (errTickets) {
        console.warn(
          "Advertencia: No se pudo cargar la tabla de soporte_tickets",
          errTickets,
        );
      } else if (dataTickets) {
        setTickets(dataTickets);
      }
    } catch (err: unknown) {
      console.error("Error al cargar la consola SuperAdmin:", err);
      if (err instanceof Error) {
        setErrorUI(`Error de sistema: ${err.message}`);
      } else {
        setErrorUI("Error al conectar con la base de datos.");
      }
    } finally {
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
      if (err instanceof Error) {
        setErrorUI(err.message);
      } else {
        setErrorUI("Error procesando la transacción.");
      }
    } finally {
      setProcesandoAccion(null);
    }
  };

  // 🟢 RESOLVER TICKET DE SOPORTE (LINTER LIMPIADO)
  const resolverTicket = async (id: string) => {
    if (!confirm("¿Marcar este ticket como resuelto?")) return;
    setProcesandoAccion(id);
    try {
      const { error } = await supabase
        .from("soporte_tickets")
        .update({ estado: "resuelto" })
        .eq("id", id);
      if (error) throw error;
      cargarDatosAdmin();
    } catch (err: unknown) {
      console.error(err);
      alert("Error al actualizar el ticket.");
    } finally {
      setProcesandoAccion(null);
    }
  };

  const abrirVisorSeguro = async (rutaBucket: string, titulo: string) => {
    try {
      let bucketDestino = "comprobantes_pagos";
      if (rutaBucket.includes("documentos_verificacion")) {
        bucketDestino = "documentos_verificacion";
      }

      const partesUrl = rutaBucket.split("/");
      const nombreArchivo = partesUrl.pop() || "";

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase.storage
        .from(bucketDestino)
        .createSignedUrl(nombreArchivo, 60);

      if (error) {
        console.error("🚨 REPORTE DE ERROR SUPABASE:", error);
        alert(
          `🚨 BLOQUEO DE SEGURIDAD DETECTADO\n\n` +
            `Bucket: ${bucketDestino}\n` +
            `Archivo: ${nombreArchivo}\n` +
            `Admin pidiendo acceso: ${session?.user?.email}\n\n` +
            `Mensaje: ${error.message}\n\n` +
            `Diagnóstico: Las políticas (RLS) en Supabase están bloqueando al administrador porque no es el dueño (owner) del archivo.`,
        );
        return;
      }

      const extension = nombreArchivo.split(".").pop()?.toLowerCase();
      const tipo = extension === "pdf" ? "pdf" : "imagen";

      setModalArchivo({
        abierto: true,
        titulo,
        archivo_url: data.signedUrl,
        tipo,
      });
    } catch (error: unknown) {
      console.error("Error crítico:", error);
      alert(
        `Error crítico en el código: ${error instanceof Error ? error.message : "Desconocido"}`,
      );
    }
  };

  const profesionalesFiltrados = profesionales.filter(
    (prof) =>
      prof.estado_verificacion === filtroIdentidad ||
      (!prof.estado_verificacion && filtroIdentidad === "pendiente"),
  );

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

  const ticketsFiltrados = tickets.filter(
    (ticket) => ticket.estado === filtroSoporte,
  );

  const extraerTelefono = (datos: string) => {
    const match = datos.match(/Teléfono:\s*([0-9\s]+)/);
    if (match && match[1]) {
      return match[1].replace(/\s/g, "");
    }
    return null;
  };

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
        <p className="text-slate-500 font-medium mt-2 mb-8">
          Plataforma de SuperAdministrador. Revisa credenciales, finanzas y
          brinda soporte a usuarios.
        </p>
      </div>

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

      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
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
        <button
          onClick={() => setPestanaActiva("soporte")}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "soporte" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Soporte y Recuperación
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
                                {pago.perfil_psicologo?.nombres
                                  ? `${pago.perfil_psicologo.nombres} ${pago.perfil_psicologo.apellidos}`
                                  : "Clínica Privada"}
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
                                {prof.nombres && prof.apellidos
                                  ? `${prof.nombres} ${prof.apellidos}`
                                  : "Sin Nombre"}
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
                                    prof.nombres || "Documento",
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

          {pestanaActiva === "soporte" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFiltroSoporte("pendiente")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroSoporte === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Tickets Pendientes
                </button>
                <button
                  onClick={() => setFiltroSoporte("resuelto")}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filtroSoporte === "resuelto" ? "bg-indigo-100 text-indigo-800" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  Resueltos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ticketsFiltrados.length === 0 ? (
                  <div className="col-span-full p-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
                    No hay solicitudes de soporte en esta bandeja.
                  </div>
                ) : (
                  ticketsFiltrados.map((ticket) => {
                    const telefonoUsuario = extraerTelefono(
                      ticket.datos_contacto,
                    );
                    const linkWa = telefonoUsuario
                      ? `https://wa.me/593${telefonoUsuario.startsWith("0") ? telefonoUsuario.slice(1) : telefonoUsuario}?text=Hola,%20somos%20el%20equipo%20de%20soporte%20y%20seguridad%20de%20Clinesfera.%20Vimos%20tu%20solicitud%20para%20recuperar%20tu%20acceso.`
                      : null;

                    return (
                      <div
                        key={ticket.id}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${ticket.prioridad === "alta" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"}`}
                            >
                              PRIORIDAD {ticket.prioridad}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {new Date(ticket.creado_el).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="font-black text-lg text-slate-900 mb-3">
                            {ticket.asunto}
                          </h3>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                            <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {ticket.datos_contacto}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto">
                          {ticket.estado === "pendiente" && linkWa && (
                            <a
                              href={linkWa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Contactar por WhatsApp
                            </a>
                          )}
                          {ticket.estado === "pendiente" ? (
                            <button
                              onClick={() => resolverTicket(ticket.id)}
                              disabled={procesandoAccion === ticket.id}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
                            >
                              {procesandoAccion === ticket.id
                                ? "Procesando..."
                                : "Marcar como Resuelto ✓"}
                            </button>
                          ) : (
                            <span className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-xl text-sm text-center block">
                              Ticket Resuelto
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
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
                /* eslint-disable-next-line @next/next/no-img-element */
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

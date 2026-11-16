"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

interface DatosBancarios {
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  titular: string;
  identificacion: string;
}

interface PagoCita {
  id: string; // 🟢 ID ÚNICO MAESTRO
  referencia_unica: string;
  monto: number;
  estado: string;
  fecha_creacion: string;
  psicologo_id: string;
  datos_banco?: DatosBancarios | null;
  nombre_psicologo?: string;
  recaudacion_id?: string;
  cita_id?: string;
}

export default function PagosPacientePage() {
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [usuarioCorreo, setUsuarioCorreo] = useState<string | null>(null);

  const [pagos, setPagos] = useState<PagoCita[]>([]);
  const [deudaTotal, setDeudaTotal] = useState(0);

  const [pagoEnFoco, setPagoEnFoco] = useState<PagoCita | null>(null);
  const [errorCritico, setErrorCritico] = useState<string | null>(null);

  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoCita | null>(
    null,
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [copiado, setCopiado] = useState<string>("");

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError)
          throw new Error(`Error de sesión: ${sessionError.message}`);
        if (!session?.user?.email) return;

        setUsuarioCorreo(session.user.email);

        // 🟢 MEJORA UX: Ordenamos por 'creado_en' para que la cita que acaba de agendar sea siempre la primera
        const { data: citasPaciente, error: citasError } = await supabase
          .from("citas")
          .select("id, psicologo_id, fecha, estado, creado_en")
          .eq("paciente_correo", session.user.email)
          .order("creado_en", { ascending: false });

        if (citasError)
          throw new Error("No se pudo cargar el historial de citas.");
        if (!citasPaciente || citasPaciente.length === 0) {
          setCargando(false);
          return;
        }

        const idsCitas = citasPaciente.map((c) => c.id);

        const { data: recaudaciones } = await supabase
          .from("recaudacion_pacientes")
          .select("*")
          .in("cita_id", idsCitas);

        const pagosEnriquecidos: PagoCita[] = await Promise.all(
          citasPaciente.map(async (cita) => {
            const rec = recaudaciones?.find((r) => r.cita_id === cita.id);

            let datos_banco = null;
            let nombre_psicologo = "Clínica General";
            let precio_base = 50;

            if (cita.psicologo_id) {
              const { data: configDB } = await supabase
                .from("configuracion_bancaria_psicologo")
                .select("*")
                .eq("psicologo_id", cita.psicologo_id)
                .maybeSingle();

              if (configDB) {
                datos_banco = {
                  banco: configDB.banco,
                  tipo_cuenta: configDB.tipo_cuenta,
                  numero_cuenta: configDB.numero_cuenta,
                  titular: configDB.titular,
                  identificacion: configDB.identificacion,
                };
              }

              const { data: perfil } = await supabase
                .from("perfil_psicologo")
                .select("nombres, apellidos, nombre_comercial, precio_consulta")
                .eq("psicologo_id", cita.psicologo_id)
                .maybeSingle();

              if (perfil) {
                nombre_psicologo =
                  perfil.nombre_comercial ||
                  (perfil.nombres
                    ? `Ps. ${perfil.nombres} ${perfil.apellidos}`
                    : "Profesional Médico");
                if (perfil.precio_consulta)
                  precio_base = perfil.precio_consulta;
              }
            }

            const refUnica = `CIT-${new Date(cita.creado_en || cita.fecha).getFullYear()}-${cita.id.substring(0, 6).toUpperCase()}`;

            return {
              id: cita.id,
              cita_id: cita.id,
              recaudacion_id: rec?.id || "",
              referencia_unica: refUnica,
              monto: rec?.monto_pagado || precio_base,
              estado: rec?.estado_pago || cita.estado,
              fecha_creacion: cita.creado_en || cita.fecha,
              psicologo_id: cita.psicologo_id,
              entidad_id: cita.id,
              datos_banco,
              nombre_psicologo,
            } as PagoCita;
          }),
        );

        setPagos(pagosEnriquecidos);

        const pendientes = pagosEnriquecidos.filter(
          (p) =>
            p.estado === "pendiente_pago" ||
            p.estado === "pending" ||
            p.estado === "requested",
        );
        const total = pendientes.reduce(
          (acc, curr) => acc + Number(curr.monto),
          0,
        );
        setDeudaTotal(total);

        // Al estar ordenados por creación, el primer pendiente es siempre el más reciente
        if (pendientes.length > 0) {
          setPagoEnFoco(pendientes[0]);
        } else if (pagosEnriquecidos.length > 0) {
          setPagoEnFoco(pagosEnriquecidos[0]);
        }
      } catch (error: unknown) {
        const mensaje =
          error instanceof Error ? error.message : "Error desconocido";
        setErrorCritico(mensaje);
      } finally {
        setCargando(false);
      }
    };

    inicializarDatos();
  }, []);

  const copiarTexto = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(""), 3000);
  };

  const enviarComprobante = async () => {
    if (!archivo || !pagoSeleccionado || !usuarioCorreo) return;
    setProcesando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const formData = new FormData();
      formData.append("comprobante", archivo);
      formData.append("pago_id", pagoSeleccionado.recaudacion_id || "");
      formData.append("cita_id", pagoSeleccionado.cita_id || "");
      formData.append("correo", usuarioCorreo);

      const res = await fetch("/api/pagos/comprobante", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fallo del servidor");

      setPagos(
        pagos.map((p) =>
          p.id === pagoSeleccionado.id
            ? { ...p, estado: "comprobante_recibido" }
            : p,
        ),
      );
      setDeudaTotal(deudaTotal - Number(pagoSeleccionado.monto));
      setPagoSeleccionado(null);
      setArchivo(null);

      alert(
        "¡Comprobante enviado con éxito! El psicólogo lo revisará en su centro de recaudación.",
      );
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`No se pudo enviar el comprobante: ${mensaje}`);
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
      case "aprobado":
      case "confirmed":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider">
            Pagado ✓
          </span>
        );
      case "en_revision":
      case "under_review":
      case "comprobante_recibido":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            En Revisión
          </span>
        );
      case "pendiente_pago":
      case "requested":
      case "pending":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider">
            Por Pagar
          </span>
        );
      case "rechazado":
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold text-xs uppercase tracking-wider">
            Rechazado
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
      <div className="p-10 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Facturación y Pagos
        </h1>
        <p className="text-slate-500">
          Gestiona tus saldos pendientes y adjunta los comprobantes bancarios
          para confirmar tus sesiones.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LADO IZQUIERDO: Método de Pago Dinámico */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {errorCritico ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full shadow-sm">
              <h3 className="text-lg font-black text-rose-900 mb-2">
                Error de Conexión
              </h3>
              <p className="text-rose-700 text-sm font-medium w-full">
                {errorCritico}
              </p>
            </div>
          ) : !pagoEnFoco ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full shadow-sm">
              <p className="text-slate-500 font-medium">
                Selecciona un pago pendiente a la derecha para ver las
                instrucciones bancarias.
              </p>
            </div>
          ) : !pagoEnFoco.datos_banco ? (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center h-full animate-in fade-in shadow-sm">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-black text-amber-900 mb-2">
                Cuenta no configurada
              </h3>
              <p className="text-amber-700 text-sm font-medium leading-relaxed">
                El especialista <strong>{pagoEnFoco.nombre_psicologo}</strong>{" "}
                aún no ha configurado la cuenta recaudadora en Clinesfera.
                Contáctalo por interno.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transform transition duration-300 animate-in zoom-in-95">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <p className="text-indigo-300 text-xs font-bold tracking-widest mb-1 uppercase">
                    CUENTA BANCARIA AUTORIZADA
                  </p>
                  <h3 className="text-2xl font-black text-white">
                    {pagoEnFoco.datos_banco.banco}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start border-t border-slate-700 pt-6">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Titular de la cuenta
                    </p>
                    <p className="font-bold text-sm uppercase text-slate-100">
                      {pagoEnFoco.datos_banco.titular}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400 font-mono">
                        ID: {pagoEnFoco.datos_banco.identificacion}
                      </p>
                      <button
                        onClick={() =>
                          copiarTexto(
                            pagoEnFoco.datos_banco!.identificacion,
                            "ruc",
                          )
                        }
                        className="text-indigo-400 hover:text-white transition-colors"
                        title="Copiar ID"
                      >
                        {copiado === "ruc" ? (
                          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Copiado ✓
                          </span>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Nº Cuenta ({pagoEnFoco.datos_banco.tipo_cuenta})
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <p className="font-mono font-black text-xl tracking-widest text-indigo-300">
                        {pagoEnFoco.datos_banco.numero_cuenta}
                      </p>
                      <button
                        onClick={() =>
                          copiarTexto(
                            pagoEnFoco.datos_banco!.numero_cuenta,
                            "cuenta",
                          )
                        }
                        className="text-indigo-400 hover:text-white transition-colors"
                        title="Copiar Cuenta"
                      >
                        {copiado === "cuenta" ? (
                          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            Copiado ✓
                          </span>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LADO DERECHO: Resumen de Cuenta (Saldos) */}
        <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner">
              🧾
            </span>
            Panel de Deudas
          </h2>

          <div className="flex-1 flex flex-col gap-4">
            {deudaTotal > 0 ? (
              <>
                <div className="space-y-3 overflow-y-auto max-h-300px pr-2 hide-scrollbar">
                  {pagos
                    .filter(
                      (p) =>
                        p.estado === "pendiente_pago" ||
                        p.estado === "pending" ||
                        p.estado === "requested",
                    )
                    .map((pago) => (
                      <div
                        key={pago.id}
                        onClick={() => setPagoEnFoco(pago)}
                        className={`flex justify-between items-center p-4 border rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md ${pagoEnFoco?.id === pago.id ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100" : "bg-white border-slate-200 hover:border-indigo-300"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-colors ${pagoEnFoco?.id === pago.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}
                          >
                            🩺
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm line-clamp-1">
                              {pago.nombre_psicologo}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold mt-1">
                              {pago.referencia_unica}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-black text-lg ${pagoEnFoco?.id === pago.id ? "text-indigo-700" : "text-slate-900"}`}
                          >
                            ${Number(pago.monto).toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPagoSeleccionado(pago);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md transform active:scale-95"
                          >
                            Pagar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-auto border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 font-black uppercase tracking-wider text-sm">
                      Total a Pagar
                    </span>
                    <span className="text-4xl font-black text-rose-600">
                      ${deudaTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Todo al día
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto text-sm">
                  No tienes saldos pendientes por cancelar. Tu historial de
                  pagos está impecable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <h3 className="font-black text-slate-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            ></path>
          </svg>
          Historial de Movimientos
        </h3>

        <div className="overflow-x-auto">
          {pagos.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <p className="text-slate-500 font-medium">
                Aún no hay registros de transacciones.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-4 font-black text-xs text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="py-4 px-4 font-black text-xs text-slate-400 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="py-4 px-4 font-black text-xs text-slate-400 uppercase tracking-wider">
                    Profesional
                  </th>
                  <th className="py-4 px-4 font-black text-xs text-slate-400 uppercase tracking-wider text-center">
                    Estado
                  </th>
                  <th className="py-4 px-4 font-black text-xs text-slate-400 uppercase tracking-wider text-right">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {pagos.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-5 px-4 text-slate-500 font-medium">
                      {new Date(pago.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-4 font-mono font-bold text-slate-700">
                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {pago.referencia_unica}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-slate-800 font-bold">
                      {pago.nombre_psicologo}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {getEstadoBadge(pago.estado)}
                    </td>
                    <td className="py-5 px-4 font-black text-right text-slate-900 text-lg">
                      ${Number(pago.monto).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {pagoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black mb-1">Cargar Comprobante</h3>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-widest">
                  {pagoSeleccionado.referencia_unica}
                </p>
              </div>
              <button
                onClick={() => {
                  setPagoSeleccionado(null);
                  setArchivo(null);
                }}
                className="text-white/60 hover:text-white bg-black/20 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 text-center">
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Por favor, adjunta la foto o PDF de la transferencia realizada a{" "}
                <strong>{pagoSeleccionado.nombre_psicologo}</strong> por el
                valor de{" "}
                <strong>${Number(pagoSeleccionado.monto).toFixed(2)}</strong>.
              </p>

              <div
                className={`border-2 border-dashed rounded-3xl p-8 mb-6 relative transition-all duration-300 ${archivo ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer"}`}
              >
                <input
                  type="file"
                  accept="image/jpeg, image/png, application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) =>
                    setArchivo(e.target.files ? e.target.files[0] : null)
                  }
                />
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
                  📸
                </div>
                {archivo ? (
                  <div>
                    <p className="font-black text-indigo-700 text-sm line-clamp-1">
                      {archivo.name}
                    </p>
                    <p className="text-xs text-indigo-400 mt-1 font-bold">
                      ¡Listo para enviar!
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-black text-slate-700 text-sm">
                      Seleccionar o Arrastrar
                    </p>
                    <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
                      PDF, JPG o PNG
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={enviarComprobante}
                disabled={!archivo || procesando}
                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2 transform active:scale-95"
              >
                {procesando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Enviar a Revisión Financiera"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

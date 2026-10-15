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
  id: string;
  referencia_unica: string;
  monto: number;
  estado: string;
  fecha_creacion: string;
  entidad_id: string;
  datos_banco?: DatosBancarios | null;
  nombre_psicologo?: string;
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

        const { data: usuario, error: userError } = await supabase
          .from("roles_usuarios")
          .select("id")
          .eq("correo", session.user.email)
          .single();

        if (userError)
          throw new Error("No se pudo cargar el perfil del usuario.");

        const { data: pagosDB, error: pagosError } = await supabase
          .from("pagos")
          .select("*")
          .eq("usuario_id", usuario.id)
          .eq("entidad_tipo", "cita")
          .order("fecha_creacion", { ascending: false });

        if (pagosError)
          throw new Error("No se pudo cargar el historial de pagos.");

        let pagosEnriquecidos: PagoCita[] = [];

        if (pagosDB && pagosDB.length > 0) {
          pagosEnriquecidos = await Promise.all(
            pagosDB.map(async (pago) => {
              const { data: cita } = await supabase
                .from("citas")
                .select("psicologo_id")
                .eq("id", pago.entidad_id)
                .maybeSingle();

              let datos_banco = null;
              let nombre_psicologo = "Profesional Médico";

              if (cita?.psicologo_id) {
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
                  .select("nombre_completo, nombre_comercial")
                  .eq("psicologo_id", cita.psicologo_id)
                  .maybeSingle();

                nombre_psicologo =
                  perfil?.nombre_completo ||
                  perfil?.nombre_comercial ||
                  "Profesional Médico";
              }

              return {
                ...pago,
                datos_banco,
                nombre_psicologo,
              } as PagoCita;
            }),
          );
        }

        setPagos(pagosEnriquecidos);

        const pendientes = pagosEnriquecidos.filter(
          (p) => p.estado === "pendiente_pago",
        );
        const total = pendientes.reduce(
          (acc, curr) => acc + Number(curr.monto),
          0,
        );
        setDeudaTotal(total);

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
      // 🟢 MAGIA: TODO el archivo se envía directo al Servidor, evadiendo las trabas de Supabase RLS.
      const formData = new FormData();
      formData.append("comprobante", archivo);
      formData.append("pago_id", pagoSeleccionado.id);
      formData.append("cita_id", pagoSeleccionado.entidad_id);
      formData.append("correo", usuarioCorreo);

      const res = await fetch("/api/pagos/comprobante", {
        method: "POST",
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
        "¡Comprobante enviado! El estado de tu pago ahora es 'En Revisión'.",
      );
    } catch (error: unknown) {
      const mensaje =
        error instanceof Error ? error.message : "Error desconocido";
      // Ahora si hay error, la API nos dirá exactamente qué tabla o columna falló.
      alert(`Ocurrió un problema: ${mensaje}`);
    } finally {
      setProcesando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "confirmado":
      case "aprobado":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-xs">
            PAGADO
          </span>
        );
      case "en_revision":
      case "under_review":
      case "comprobante_recibido":
        return (
          <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
            EN REVISIÓN
          </span>
        );
      case "pendiente_pago":
      case "pending":
        return (
          <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md font-bold text-xs">
            POR PAGAR
          </span>
        );
      case "rechazado":
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md font-bold text-xs">
            RECHAZADO
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
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Facturación y Pagos
        </h1>
        <p className="text-gray-500">
          Gestiona tus saldos pendientes y adjunta los comprobantes de tus
          consultas.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LADO IZQUIERDO: Método de Pago Dinámico */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          {errorCritico ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-4xl p-8 flex flex-col items-center justify-center text-center h-full">
              <h3 className="text-lg font-black text-red-900 mb-2">
                Error de Carga
              </h3>
              <p className="text-red-700 text-sm font-medium w-full">
                {errorCritico}
              </p>
            </div>
          ) : !pagoEnFoco ? (
            <div className="bg-slate-50 border border-slate-200 rounded-4xl p-8 flex flex-col items-center justify-center text-center h-full">
              <p className="text-slate-500 font-medium">
                No tienes facturas seleccionadas para mostrar métodos de pago.
              </p>
            </div>
          ) : !pagoEnFoco.datos_banco ? (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-4xl flex flex-col items-center justify-center text-center h-full animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
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
              <p className="text-amber-700 text-sm font-medium">
                El profesional <strong>{pagoEnFoco.nombre_psicologo}</strong>{" "}
                aún no ha registrado sus datos bancarios. Contáctalo
                directamente.
              </p>
            </div>
          ) : (
            <div className="bg-linear-to-br from-gray-900 via-slate-800 to-gray-900 rounded-4xl p-8 text-white shadow-2xl relative overflow-hidden transform transition duration-300 animate-in fade-in zoom-in-95">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <p className="text-gray-400 text-xs font-bold tracking-widest mb-1 uppercase">
                    MÉTODO AUTORIZADO
                  </p>
                  <h3 className="text-xl font-black">
                    {pagoEnFoco.datos_banco.banco}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
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
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Titular / Identificación
                    </p>
                    <p className="font-bold text-sm uppercase">
                      {pagoEnFoco.datos_banco.titular}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400 font-mono">
                        {pagoEnFoco.datos_banco.identificacion}
                      </p>
                      <button
                        onClick={() =>
                          copiarTexto(
                            pagoEnFoco.datos_banco!.identificacion,
                            "ruc",
                          )
                        }
                        className="text-blue-400 hover:text-white transition-colors"
                        title="Copiar RUC"
                      >
                        {copiado === "ruc" ? (
                          <span className="text-emerald-400 text-[10px] font-bold uppercase">
                            Copiado
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
                    <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Nº de Cuenta ({pagoEnFoco.datos_banco.tipo_cuenta})
                    </p>
                    <div className="flex items-center justify-end gap-3">
                      <p className="font-mono font-black text-xl tracking-widest text-blue-300">
                        {pagoEnFoco.datos_banco.numero_cuenta}
                      </p>
                      <button
                        onClick={() =>
                          copiarTexto(
                            pagoEnFoco.datos_banco!.numero_cuenta,
                            "cuenta",
                          )
                        }
                        className="text-blue-400 hover:text-white transition-colors"
                        title="Copiar Cuenta"
                      >
                        {copiado === "cuenta" ? (
                          <span className="text-emerald-400 text-[10px] font-bold uppercase">
                            Copiado
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
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs text-blue-800 font-medium">
              Selecciona una factura de la derecha para ver los datos bancarios
              del profesional correspondiente.
            </p>
          </div>
        </div>

        {/* LADO DERECHO: Resumen de Cuenta (Saldos) */}
        <div className="w-full lg:w-1/2 bg-white border border-gray-100 rounded-4xl p-8 shadow-sm flex flex-col h-full">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              🧾
            </span>
            Estado de Cuenta
          </h2>

          <div className="flex-1 flex flex-col gap-4">
            {deudaTotal > 0 ? (
              <>
                <div className="space-y-3 overflow-y-auto max-h-48 pr-2">
                  {pagos
                    .filter((p) => p.estado === "pendiente_pago")
                    .map((pago) => (
                      <div
                        key={pago.id}
                        onClick={() => setPagoEnFoco(pago)}
                        className={`flex justify-between items-center p-4 border rounded-2xl transition-colors cursor-pointer group ${pagoEnFoco?.id === pago.id ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100" : "bg-gray-50 border-gray-100 hover:border-blue-200"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-xl border transition-colors ${pagoEnFoco?.id === pago.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-100 text-gray-900"}`}
                          >
                            🩺
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">
                              {pago.nombre_psicologo}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-gray-500 font-mono font-bold">
                                {pago.referencia_unica}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-black ${pagoEnFoco?.id === pago.id ? "text-blue-700" : "text-gray-900"}`}
                          >
                            ${Number(pago.monto).toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPagoSeleccionado(pago);
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                          >
                            Informar
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-auto border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">
                      Total Consolidado
                    </span>
                    <span className="text-3xl font-black text-rose-600">
                      ${deudaTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 text-right">
                    (Suma total de todas tus consultas pendientes).
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border-4 border-white">
                  ✓
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Todo al día
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                  No tienes saldos pendientes. Tu historial clínico está libre
                  de deudas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white border border-gray-100 rounded-4xl p-8 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-sm">
          Historial de Transacciones
        </h3>
        <div className="overflow-x-auto">
          {pagos.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-4">
              Aún no hay registros de transacciones.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Fecha</th>
                  <th className="pb-4 font-bold">Referencia</th>
                  <th className="pb-4 font-bold">Profesional</th>
                  <th className="pb-4 font-bold">Estado</th>
                  <th className="pb-4 font-bold text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {pagos.map((pago) => (
                  <tr
                    key={pago.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-5 text-gray-500 font-medium">
                      {new Date(pago.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="py-5 font-mono font-bold text-gray-700">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {pago.referencia_unica}
                      </span>
                    </td>
                    <td className="py-5 text-gray-600 font-medium">
                      {pago.nombre_psicologo}
                    </td>
                    <td className="py-5">{getEstadoBadge(pago.estado)}</td>
                    <td className="py-5 font-black text-right text-gray-900">
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
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Informar Transferencia
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Adjunta el comprobante para la consulta con{" "}
              <strong>{pagoSeleccionado.nombre_psicologo}</strong> por un valor
              de <strong>${Number(pagoSeleccionado.monto).toFixed(2)}</strong>.
            </p>
            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-6 mb-6 text-center relative hover:bg-gray-100 transition-colors">
              <input
                type="file"
                accept="image/jpeg, image/png, application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) =>
                  setArchivo(e.target.files ? e.target.files[0] : null)
                }
              />
              <div className="text-3xl mb-2">📸</div>
              {archivo ? (
                <div>
                  <p className="font-bold text-blue-600 text-sm line-clamp-1">
                    {archivo.name}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-gray-700 text-sm">
                    Seleccionar Comprobante
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPagoSeleccionado(null);
                  setArchivo(null);
                }}
                className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={enviarComprobante}
                disabled={!archivo || procesando}
                className="w-2/3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
              >
                {procesando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

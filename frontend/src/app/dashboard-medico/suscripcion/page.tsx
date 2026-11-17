"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
  precio_anual: number;
  caracteristicas: string[];
}

interface DatosBancarios {
  banco: string;
  tipo_cuenta: string;
  cuentas: string[];
  titular: string;
  identificacion: string;
  whatsapp: string;
}

interface Desglose {
  total: number;
}

const generarIdTransaccion = () => `trx_${Date.now()}`;
const generarReferencia = (planNombre: string) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SUB-${planNombre.substring(0, 3).toUpperCase()}-${randomNum}`;
};

export default function CheckoutMedicoSaaS() {
  const router = useRouter();

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorUI, setErrorUI] = useState<string | null>(null);

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(
    null,
  );
  const [frecuencia, setFrecuencia] = useState<"mensual" | "anual">("mensual");

  const [transaccion, setTransaccion] = useState<{
    plan?: Plan;
    pago_id?: string;
    referencia?: string;
    desglose?: Desglose;
  }>({});

  const [archivo, setArchivo] = useState<File | null>(null);
  const [copiado, setCopiado] = useState("");

  useEffect(() => {
    let montado = true;

    const inicializarPlataforma = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        if (montado) {
          const { data: planesDB, error: errPlanes } = await supabase
            .from("planes")
            .select("*");
          if (errPlanes) throw errPlanes;

          if (planesDB && planesDB.length > 0) {
            const planesFormateados = planesDB.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              descripcion: p.descripcion || "SaaS Médico Profesional.",
              precio_mensual: Number(p.precio_mensual || 19.99),
              precio_anual: Number(p.precio_anual || 179.99),
              caracteristicas: p.caracteristicas || [
                "Agenda digital clínica",
                "Formularios MSP 002",
              ],
            }));
            setPlanes(planesFormateados);
          } else {
            setErrorUI(
              "No se encontraron planes configurados en la base de datos.",
            );
          }

          setDatosBancarios({
            banco: "Banco Pichincha",
            tipo_cuenta: "Ahorros",
            cuentas: ["2203733169", "2203733191"],
            titular: "Esteban Joel Pineda Pineda",
            identificacion: "1004583215",
            whatsapp: "593991258731",
          });

          setCargando(false);
        }
      } catch (err: unknown) {
        if (montado) {
          setErrorUI(
            `Error cargando plataforma: ${err instanceof Error ? err.message : "Fallo general"}`,
          );
          setCargando(false);
        }
      }
    };

    inicializarPlataforma();

    return () => {
      montado = false;
    };
  }, [router]);

  const copiarTexto = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(""), 3000);
  };

  const procesarIntencionDePago = async (plan: Plan) => {
    setProcesando(true);
    setErrorUI(null);

    const newTxId = generarIdTransaccion();
    const newRef = generarReferencia(plan.nombre);

    try {
      const total =
        frecuencia === "mensual" ? plan.precio_mensual : plan.precio_anual;
      setTransaccion({
        plan,
        pago_id: newTxId,
        referencia: newRef,
        desglose: { total },
      });
      setPaso(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorUI("Error al generar la transacción.");
    } finally {
      setProcesando(false);
    }
  };

  const procesarComprobante = async () => {
    if (!archivo || !transaccion.plan || !transaccion.desglose) return;
    setProcesando(true);
    setErrorUI(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada");

      const userId = session.user.id;
      const fileExt = archivo.name.split(".").pop();
      const fileName = `${userId}-comprobante-medico-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("comprobantes_pagos")
        .upload(fileName, archivo);
      if (uploadError)
        throw new Error(`Fallo subiendo archivo: ${uploadError.message}`);

      const {
        data: { publicUrl },
      } = supabase.storage.from("comprobantes_pagos").getPublicUrl(fileName);

      // 🟢 ATENCIÓN AQUÍ: Si tu tabla de "pagos" solo admite psicologo_id temporalmente, lo dejamos, pero te recomiendo
      // modificar la BD más tarde para que tenga medico_id o cambiar esa columna a "usuario_id".
      const { error: insertError } = await supabase.from("pagos").insert({
        psicologo_id: userId, // Reutilizando para el MVP, luego cambiar a medico_id en BD si deseas
        referencia_unica: transaccion.referencia,
        entidad_tipo: "suscripcion",
        entidad_id: transaccion.plan.id,
        metodo_pago: "bank_transfer",
        monto: transaccion.desglose.total,
        monto_esperado: transaccion.desglose.total,
        estado: "comprobante_recibido",
        comprobante_url: publicUrl,
      });

      if (insertError)
        throw new Error(`Fallo guardando pago: ${insertError.message}`);

      setPaso(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error(err);
      setErrorUI(
        err instanceof Error
          ? `Error de sistema: ${err.message}`
          : "No pudimos procesar el comprobante.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      {errorUI && (
        <div className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <svg
            className="w-6 h-6 text-red-600 shrink-0"
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
          <p className="text-sm font-bold text-red-800">{errorUI}</p>
        </div>
      )}

      {paso < 4 && (
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex md:hidden items-center text-sm font-bold text-slate-500 mb-2">
            Paso {paso} de 3 <span className="mx-2">•</span>{" "}
            {paso === 1 ? "Plan" : paso === 2 ? "Transferencia" : "Comprobante"}
          </div>
          <div className="hidden md:flex items-center justify-center gap-4">
            {[
              "Selección de Plan",
              "Transferencia Bancaria",
              "Carga de Comprobante",
            ].map((title, i) => {
              const num = i + 1;
              const activo = paso >= num;
              return (
                <div key={num} className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-2 ${activo ? "text-teal-900" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${activo ? "bg-teal-900 text-white" : "bg-slate-200"}`}
                    >
                      {num}
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                      {title}
                    </span>
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-12 h-px ${paso > num ? "bg-teal-900" : "bg-slate-200"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paso === 1 && (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Clinesfera Médico
            </h1>
            <p className="text-slate-500 font-medium">
              Infraestructura clínica y financiera para doctores y
              especialistas.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-slate-200/50 p-1.5 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setFrecuencia("mensual")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${frecuencia === "mensual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Pago Mensual
              </button>
              <button
                onClick={() => setFrecuencia("anual")}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${frecuencia === "anual" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Plan Anual{" "}
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest ${frecuencia === "anual" ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500/20 text-emerald-600"}`}
                >
                  Ahorras 3 meses
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planes.map((plan) => {
              const destacado =
                plan.nombre.toLowerCase().includes("élite") ||
                plan.nombre.toLowerCase().includes("elite");
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 border transition-all duration-300 relative flex flex-col ${destacado ? "bg-teal-900 border-teal-800 shadow-2xl text-white md:-translate-y-2" : "bg-white border-slate-200 shadow-sm"}`}
                >
                  {destacado && (
                    <div className="inline-block bg-white text-teal-900 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full mb-6 self-start">
                      Recomendado
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-black mb-1 ${destacado ? "text-white" : "text-slate-900"}`}
                  >
                    {plan.nombre}
                  </h3>
                  <p
                    className={`text-sm mb-6 min-h-40px ${destacado ? "text-teal-100" : "text-slate-500"}`}
                  >
                    {plan.descripcion}
                  </p>

                  <div className="mb-8 flex flex-col">
                    {frecuencia === "anual" && (
                      <span
                        className={`text-sm font-bold line-through mb-1 ${destacado ? "text-teal-300" : "text-slate-400"}`}
                      >
                        ${(plan.precio_mensual * 12).toFixed(2)} / año
                      </span>
                    )}
                    <div className="flex items-end">
                      <span className="text-sm font-bold mb-1 mr-1">$</span>
                      <span className="text-4xl font-black">
                        {frecuencia === "mensual"
                          ? plan.precio_mensual
                          : plan.precio_anual}
                      </span>
                      <span
                        className={`text-sm font-bold ml-1 mb-1 ${destacado ? "text-teal-200" : "text-slate-400"}`}
                      >
                        / {frecuencia}
                      </span>
                    </div>
                    {frecuencia === "anual" && (
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mt-2">
                        Llevas 3 Meses Gratis 🎉
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4 flex-1 mb-8">
                    {plan.caracteristicas.map((c, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 text-sm font-medium leading-snug ${destacado ? "text-teal-50" : "text-slate-600"}`}
                      >
                        <svg
                          className={`w-5 h-5 shrink-0 ${destacado ? "text-emerald-400" : "text-teal-500"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {c}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={procesando}
                    onClick={() => procesarIntencionDePago(plan)}
                    className={`w-full py-4 px-6 font-black rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 mt-auto ${destacado ? "bg-white text-teal-900 hover:bg-teal-50" : "bg-teal-900 text-white hover:bg-teal-800"}`}
                  >
                    {procesando ? (
                      <div
                        className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${destacado ? "border-teal-900" : "border-white"}`}
                      ></div>
                    ) : (
                      "Elegir este Plan"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(paso === 2 || paso === 3) && transaccion.desglose && datosBancarios && (
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-8 animate-in slide-in-from-right-8 duration-500 mt-8">
          <div className="flex-1 space-y-6">
            <div className="bg-slate-100/50 border border-slate-200 rounded-2xl p-4 flex gap-4 text-sm text-slate-600">
              <svg
                className="w-5 h-5 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p>
                Valida los datos de transferencia. Una vez realizado el pago,
                carga tu comprobante para activar tu plan al instante.
              </p>
            </div>

            {paso === 2 ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-black text-slate-900 mb-6">
                  Datos de Transferencia
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Entidad Bancaria
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {datosBancarios.banco}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Titular de la Cuenta
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {datosBancarios.titular}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Identificación
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {datosBancarios.identificacion}
                    </p>
                  </div>

                  <div className="md:col-span-2 mt-2 space-y-4">
                    {datosBancarios.cuentas.map((cta, index) => (
                      <div
                        key={cta}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Opción {index + 1}: Cuenta de{" "}
                            {datosBancarios.tipo_cuenta}
                          </p>
                          <p className="font-mono font-black text-xl md:text-2xl text-slate-900 tracking-widest">
                            {cta}
                          </p>
                        </div>
                        <button
                          onClick={() => copiarTexto(cta, `cta${index}`)}
                          className="shrink-0 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
                        >
                          {copiado === `cta${index}` ? "Copiado ✓" : "Copiar"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2 bg-teal-50 border border-teal-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                        Referencia Requerida
                      </p>
                      <p className="font-mono font-black text-lg text-teal-900">
                        {transaccion.referencia}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copiarTexto(transaccion.referencia!, "ref")
                      }
                      className="shrink-0 text-teal-700 hover:text-teal-900 font-bold text-sm bg-white border border-teal-200 px-4 py-2 rounded-lg shadow-sm"
                    >
                      {copiado === "ref" ? "Copiado ✓" : "Copiar"}
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-6">
                  <button
                    onClick={() => setPaso(3)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-md transition-colors text-lg"
                  >
                    Continuar a Carga de Comprobante →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-slate-900">
                    Validación de Transferencia
                  </h2>
                  <button
                    onClick={() => setPaso(2)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-900"
                  >
                    ← Volver a Datos
                  </button>
                </div>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-8 mb-6 relative group flex flex-col items-center justify-center min-h-250px">
                  <input
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={(e) =>
                      setArchivo(e.target.files ? e.target.files[0] : null)
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <svg
                    className="w-8 h-8 text-slate-400 mb-3 group-hover:text-slate-600 transition-colors"
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
                  {archivo ? (
                    <div className="text-center">
                      <p className="font-bold text-slate-900">
                        Comprobante seleccionado
                      </p>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        ✓ {archivo.name} •{" "}
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-bold text-slate-700">
                        Arrastra o haz clic para subir el comprobante
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Soporta PDF, JPG, PNG (Max. 5MB)
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={procesarComprobante}
                  disabled={!archivo || procesando}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                      Validando archivo...
                    </>
                  ) : (
                    "Enviar a Revisión Administrativa"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-6">
              <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">
                Resumen de Cargo
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Plan</span>
                  <span className="font-bold text-slate-900">
                    {transaccion.plan?.nombre}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">Ciclo</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {frecuencia}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-slate-900">Total a Pagar</span>
                <span className="text-3xl font-black text-slate-900">
                  ${transaccion.desglose.total.toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Referencia Asignada
                </p>
                <p className="font-mono text-sm font-black text-slate-900">
                  {transaccion.referencia}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {paso === 4 && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 mt-10">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Comprobante recibido correctamente
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              Tu archivo fue registrado de forma segura. Te notificaremos en
              cuanto el plan esté activado.
            </p>
            <button
              onClick={() => router.push("/dashboard-medico")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
            >
              Volver a mi Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

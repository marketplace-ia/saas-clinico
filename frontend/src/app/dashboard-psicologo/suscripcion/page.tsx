"use client";

import { useState, useEffect, useCallback } from "react";
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
  subtotal: number;
  impuestos: number;
  total: number;
}

export default function CheckoutSaaSPremium() {
  const router = useRouter();

  // Estados de máquina
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [errorUI, setErrorUI] = useState<string | null>(null);

  // Estados de negocio (Controlados por Backend)
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [datosBancarios, setDatosBancarios] = useState<DatosBancarios | null>(
    null,
  );
  const [frecuencia, setFrecuencia] = useState<"mensual" | "anual">("mensual");

  // Datos inmutables de la transacción
  const [transaccion, setTransaccion] = useState<{
    plan?: Plan;
    pago_id?: string;
    referencia?: string;
    desglose?: Desglose;
  }>({});

  const [archivo, setArchivo] = useState<File | null>(null);
  const [copiado, setCopiado] = useState("");

  const cargarDatosSaaS = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: planesDB } = await supabase
        .from("planes")
        .select("*")
        .eq("activo", true)
        .order("precio_mensual", { ascending: true });
      if (planesDB) setPlanes(planesDB);

      // 🟢 DATOS OFICIALES DE FACTURACIÓN Y PAGO (CLINESFERA)
      setDatosBancarios({
        banco: "Banco Pichincha",
        tipo_cuenta: "Ahorros",
        cuentas: ["2203733169", "2203733191"],
        titular: "Esteban Joel Pineda Pineda",
        identificacion: "1004583215",
        whatsapp: "593991258731", // Formato internacional sin '+'
      });
    } catch (error: unknown) {
      console.error(error);
      setErrorUI("No se pudo conectar con el sistema financiero.");
    } finally {
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    const inicializar = async () => {
      await cargarDatosSaaS();
    };
    inicializar();
  }, [cargarDatosSaaS]);

  const copiarTexto = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(""), 3000);
  };

  const procesarIntencionDePago = async (plan: Plan) => {
    setProcesando(true);
    setErrorUI(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/suscripciones/intencion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan_id: plan.id, frecuencia }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTransaccion({
        plan,
        pago_id: data.pago_id,
        referencia: data.referencia,
        desglose: data.desglose,
      });

      setPaso(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error
          ? error.message
          : "Error al generar la transacción.",
      );
    } finally {
      setProcesando(false);
    }
  };

  const procesarComprobante = async () => {
    if (!archivo || !transaccion.pago_id) return;
    setProcesando(true);
    setErrorUI(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append("comprobante", archivo);
      formData.append("pago_id", transaccion.pago_id);

      const res = await fetch("/api/suscripciones/comprobante", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPaso(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error
          ? error.message
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
      {/* ERROR GLOBAL UI */}
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

      {/* STEPPER EMPRESARIAL */}
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
                    className={`flex items-center gap-2 ${activo ? "text-slate-900" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${activo ? "bg-slate-900 text-white" : "bg-slate-200"}`}
                    >
                      {num}
                    </div>
                    <span className="font-bold text-sm tracking-wide">
                      {title}
                    </span>
                  </div>
                  {num < 3 && (
                    <div
                      className={`w-12 h-px ${paso > num ? "bg-slate-900" : "bg-slate-200"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PASO 1: SELECCIÓN DE PLAN */}
      {paso === 1 && (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Suscripción Clinesfera
            </h1>
            <p className="text-slate-500 font-medium">
              Infraestructura clínica y financiera para profesionales de la
              salud.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-slate-200/50 p-1 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setFrecuencia("mensual")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${frecuencia === "mensual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Mensual
              </button>
              <button
                onClick={() => setFrecuencia("anual")}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${frecuencia === "anual" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Anual{" "}
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Ahorra ~2 meses
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {planes.map((plan) => {
              const destacado = plan.nombre
                .toLowerCase()
                .includes("profesional");
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 border transition-all ${destacado ? "bg-slate-900 border-slate-800 shadow-2xl text-white md:-translate-y-2" : "bg-white border-slate-200 shadow-sm"}`}
                >
                  {destacado && (
                    <div className="inline-block bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full mb-6">
                      Recomendado
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-black mb-1 ${destacado ? "text-white" : "text-slate-900"}`}
                  >
                    {plan.nombre}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${destacado ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {plan.descripcion}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-black">
                      $
                      {frecuencia === "mensual"
                        ? plan.precio_mensual
                        : plan.precio_anual}
                    </span>
                    <span
                      className={`text-sm font-bold ml-1 ${destacado ? "text-slate-400" : "text-slate-400"}`}
                    >
                      / {frecuencia}
                    </span>
                    <p
                      className={`text-[10px] mt-1 font-bold uppercase ${destacado ? "text-slate-500" : "text-slate-400"}`}
                    >
                      No incluye IVA
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.caracteristicas.map((c, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 text-sm font-medium ${destacado ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <svg
                          className={`w-5 h-5 shrink-0 ${destacado ? "text-emerald-400" : "text-slate-900"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
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
                    className={`w-full py-3.5 px-6 font-black rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 ${destacado ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                  >
                    {procesando ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Seleccionar Plan"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PASO 2 & 3: CHECKOUT SPLIT (Desktop) / STACK (Mobile) */}
      {(paso === 2 || paso === 3) && transaccion.desglose && datosBancarios && (
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row gap-8 animate-in slide-in-from-right-8 duration-500">
          {/* COLUMNA PRINCIPAL DE ACCIÓN */}
          <div className="flex-1 space-y-6">
            {/* TRUST CENTER */}
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
                Clinesfera procesa los pagos en entornos controlados alineados a
                buenas prácticas de seguridad. Nunca solicitaremos credenciales
                de banca electrónica.
              </p>
            </div>

            {paso === 2 ? (
              /* ESTADO 2: TRANSFERENCIA CON NUEVOS DATOS REALES */
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
                      Identificación (Cédula)
                    </p>
                    <p className="font-bold text-slate-900 text-lg">
                      {datosBancarios.identificacion}
                    </p>
                  </div>

                  <div className="md:col-span-2 mt-2 space-y-4">
                    {/* Iteramos sobre las dos cuentas */}
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

                  <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                        Referencia (Concepto) Requerida
                      </p>
                      <p className="font-mono font-black text-lg text-indigo-900">
                        {transaccion.referencia}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copiarTexto(transaccion.referencia!, "ref")
                      }
                      className="shrink-0 text-indigo-700 hover:text-indigo-900 font-bold text-sm bg-white border border-indigo-200 px-4 py-2 rounded-lg shadow-sm"
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
              /* ESTADO 3: UPLOAD SEGURO */
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

                <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-8 mb-6 relative group flex flex-col items-center justify-center min-h-50">
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
                        ✓ {archivo.name.split(".").pop()?.toUpperCase()} •{" "}
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

          {/* COLUMNA LATERAL: RESUMEN */}
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
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Ciclo</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {frecuencia}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-900">
                    ${transaccion.desglose.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                  <span className="text-slate-500 font-medium">
                    Impuestos (15%)
                  </span>
                  <span className="font-bold text-slate-900">
                    ${transaccion.desglose.impuestos.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">
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

      {/* PASO 4: ÉXITO SEGURO */}
      {paso === 4 && (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <svg
                className="w-8 h-8"
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
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Comprobante recibido correctamente
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              Tu archivo fue registrado de forma segura. El área administrativa
              validará la transacción en las próximas horas.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left mb-8 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-500 font-bold text-sm">
                  Estado Actual:
                </span>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>{" "}
                  En Revisión
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold text-sm">
                  ID Operación:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {transaccion.referencia}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard-psicologo")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
            >
              Volver a mi Panel
            </button>
          </div>
        </div>
      )}

      {/* BANNER PREMIUM DE SOPORTE WHATSAPP */}
      {datosBancarios && (
        <div className="max-w-5xl mx-auto mt-16 bg-white rounded-2rem p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-inner">
              <svg
                className="w-10 h-10 text-emerald-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.061-.173-.299-.018-.461.13-.611.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                ¿Tienes dudas sobre la plataforma?
              </h3>
              <p className="text-slate-500 font-medium mt-1">
                Escríbeme directamente a WhatsApp. Como fundador, te guiaré
                personalmente en tu proceso.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${datosBancarios.whatsapp}?text=Hola%20Esteban,%20estoy%20en%20la%20página%20de%20Clinesfera%20y%20necesito%20más%20información%20sobre%20los%20planes.`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-4 rounded-2xl shadow-[0_8px_20px_rgba(37,211,102,0.3)] transition-transform transform hover:scale-[1.03] flex items-center gap-2"
          >
            Chatear con Esteban
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";

interface DatosBancarios {
  id?: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  titular: string;
  identificacion: string;
}

interface ConfigFiscal {
  id?: string;
  razon_social: string;
  ruc: string;
  direccion_matriz: string;
  obligado_contabilidad: boolean;
  rimpe: boolean;
}

export default function ConfiguracionFinancieraPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorUI, setErrorUI] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<"banco" | "fiscal">(
    "banco",
  );
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [banco, setBanco] = useState<DatosBancarios>({
    banco: "",
    tipo_cuenta: "Ahorros",
    numero_cuenta: "",
    titular: "",
    identificacion: "",
  });

  const [fiscal, setFiscal] = useState<ConfigFiscal>({
    razon_social: "",
    ruc: "",
    direccion_matriz: "",
    obligado_contabilidad: false,
    rimpe: false,
  });

  const cargarConfiguracion = useCallback(async () => {
    setCargando(true);
    setErrorUI(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no válida.");

      // 1. Obtener Tenant
      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", user.id)
        .single();
      if (!tu) throw new Error("No tienes un entorno clínico asignado.");
      setTenantId(tu.tenant_id);

      // 2. Cargar Datos Bancarios
      const { data: dataBanco } = await supabase
        .from("datos_bancarios")
        .select("*")
        .eq("tenant_id", tu.tenant_id)
        .maybeSingle();
      if (dataBanco) setBanco(dataBanco);

      // 3. Cargar Configuración Fiscal
      const { data: dataFiscal } = await supabase
        .from("configuracion_fiscal")
        .select("*")
        .eq("tenant_id", tu.tenant_id)
        .maybeSingle();
      if (dataFiscal) setFiscal(dataFiscal);
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error
          ? error.message
          : "Error al cargar la configuración.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciar = async () => {
      await cargarConfiguracion();
    };
    iniciar();
  }, [cargarConfiguracion]);

  const guardarDatosBancarios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorUI(null);
    setMensajeExito(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload = {
        tenant_id: tenantId,
        psicologo_id: user?.id,
        banco: banco.banco,
        tipo_cuenta: banco.tipo_cuenta,
        numero_cuenta: banco.numero_cuenta,
        titular: banco.titular,
        identificacion: banco.identificacion,
      };

      if (banco.id) {
        await supabase
          .from("datos_bancarios")
          .update(payload)
          .eq("id", banco.id);
      } else {
        await supabase.from("datos_bancarios").insert(payload);
      }

      setMensajeExito("Datos bancarios actualizados correctamente.");
      await cargarConfiguracion();
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error ? error.message : "Error al guardar banco.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const guardarConfiguracionFiscal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorUI(null);
    setMensajeExito(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const payload = {
        tenant_id: tenantId,
        psicologo_id: user?.id,
        razon_social: fiscal.razon_social,
        ruc: fiscal.ruc,
        direccion_matriz: fiscal.direccion_matriz,
        obligado_contabilidad: fiscal.obligado_contabilidad,
        rimpe: fiscal.rimpe,
      };

      if (fiscal.id) {
        await supabase
          .from("configuracion_fiscal")
          .update(payload)
          .eq("id", fiscal.id);
      } else {
        await supabase.from("configuracion_fiscal").insert(payload);
      }

      setMensajeExito("Configuración tributaria (SRI) actualizada.");
      await cargarConfiguracion();
    } catch (error: unknown) {
      setErrorUI(
        error instanceof Error
          ? error.message
          : "Error al guardar tributación.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando)
    return (
      <div className="p-10 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Configuración Financiera
        </h1>
        <p className="text-slate-500 font-medium">
          Gestiona tus cuentas de recaudación y tu información tributaria (SRI).
        </p>
      </div>

      {errorUI && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl font-bold mb-6 border border-rose-200 shadow-sm">
          {errorUI}
        </div>
      )}
      {mensajeExito && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl font-bold mb-6 border border-emerald-200 shadow-sm">
          {mensajeExito}
        </div>
      )}

      <div className="flex gap-2 mb-8 border-b border-slate-200 pb-px">
        <button
          onClick={() => setPestanaActiva("banco")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${pestanaActiva === "banco" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
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
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Datos Bancarios (Pacientes)
        </button>
        <button
          onClick={() => setPestanaActiva("fiscal")}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${pestanaActiva === "fiscal" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
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
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Facturación SRI
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        {/* ================================== */}
        {/* PESTAÑA: DATOS BANCARIOS (DOMINIO B) */}
        {/* ================================== */}
        {pestanaActiva === "banco" && (
          <form
            onSubmit={guardarDatosBancarios}
            className="space-y-6 animate-in fade-in duration-300"
          >
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 mb-6">
              <svg
                className="w-6 h-6 text-indigo-600 shrink-0"
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
              <div>
                <h4 className="font-bold text-indigo-900 text-sm">
                  Información Pública
                </h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Esta cuenta bancaria se mostrará automáticamente en tu Portal
                  de Pacientes cuando alguien intente agendar una cita contigo.
                  Asegúrate de que los datos sean correctos para recibir tus
                  honorarios.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Entidad Bancaria
                </label>
                <input
                  required
                  type="text"
                  value={banco.banco}
                  onChange={(e) =>
                    setBanco({ ...banco, banco: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej. Banco Pichincha, Guayaquil..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tipo de Cuenta
                </label>
                <select
                  value={banco.tipo_cuenta}
                  onChange={(e) =>
                    setBanco({ ...banco, tipo_cuenta: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Número de Cuenta
                </label>
                <input
                  required
                  type="text"
                  value={banco.numero_cuenta}
                  onChange={(e) =>
                    setBanco({ ...banco, numero_cuenta: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Identificación (Cédula/RUC)
                </label>
                <input
                  required
                  type="text"
                  value={banco.identificacion}
                  onChange={(e) =>
                    setBanco({ ...banco, identificacion: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="17XXXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nombre del Titular
                </label>
                <input
                  required
                  type="text"
                  value={banco.titular}
                  onChange={(e) =>
                    setBanco({ ...banco, titular: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej. Dr. Juan Pérez"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={guardando}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 min-w-40 flex items-center justify-center"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Guardar Datos Bancarios"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================================== */}
        {/* PESTAÑA: FACTURACIÓN SRI (DOMINIO A) */}
        {/* ================================== */}
        {pestanaActiva === "fiscal" && (
          <form
            onSubmit={guardarConfiguracionFiscal}
            className="space-y-6 animate-in fade-in duration-300"
          >
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex gap-3 mb-6">
              <svg
                className="w-6 h-6 text-slate-500 shrink-0"
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
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Información Confidencial (Back-Office)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Estos datos se utilizarán para la integración de emisión de
                  facturas electrónicas avaladas por el SRI. No son visibles
                  públicamente para tus pacientes.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Razón Social
                </label>
                <input
                  required
                  type="text"
                  value={fiscal.razon_social}
                  onChange={(e) =>
                    setFiscal({ ...fiscal, razon_social: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nombre legal registrado en el SRI"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  RUC
                </label>
                <input
                  required
                  type="text"
                  value={fiscal.ruc}
                  onChange={(e) =>
                    setFiscal({ ...fiscal, ruc: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="17XXXXXXXX001"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Dirección Matriz
                </label>
                <input
                  required
                  type="text"
                  value={fiscal.direccion_matriz}
                  onChange={(e) =>
                    setFiscal({ ...fiscal, direccion_matriz: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Calle principal y secundaria"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={fiscal.obligado_contabilidad}
                    onChange={(e) =>
                      setFiscal({
                        ...fiscal,
                        obligado_contabilidad: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="font-bold text-sm text-slate-700">
                    Obligado a llevar contabilidad
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={fiscal.rimpe}
                    onChange={(e) =>
                      setFiscal({ ...fiscal, rimpe: e.target.checked })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="font-bold text-sm text-slate-700">
                    Contribuyente Régimen RIMPE
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 mt-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50">
                <p className="text-sm font-bold text-slate-600">
                  Firma Electrónica (.p12 / .pfx)
                </p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Módulo de cifrado de firmas en construcción para integración
                  directa con SRI.
                </p>
                <button
                  type="button"
                  disabled
                  className="px-6 py-2 bg-slate-200 text-slate-500 font-bold rounded-lg text-sm cursor-not-allowed"
                >
                  Subir Firma (Próximamente)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={guardando}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 min-w-40 flex items-center justify-center"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Guardar Configuración Fiscal"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

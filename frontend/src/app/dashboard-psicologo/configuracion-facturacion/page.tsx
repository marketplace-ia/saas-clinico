"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface PerfilTributario {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion_matriz: string;
  obligado_contabilidad: boolean;
}

interface ConfigFacturacion {
  establecimiento: string;
  punto_emision: string;
  estado_firma: string;
  fecha_caducidad_firma: string | null;
  ambiente: string;
  proveedor_nombre: string;
  estado_conexion: string;
}

export default function ConfiguracionFacturacionPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [psicologoUUID, setPsicologoUUID] = useState<string>("");

  const [tributario, setTributario] = useState<PerfilTributario>({
    ruc: "",
    razon_social: "",
    nombre_comercial: "",
    direccion_matriz: "",
    obligado_contabilidad: false,
  });

  const [configuracion, setConfiguracion] = useState<ConfigFacturacion>({
    establecimiento: "001",
    punto_emision: "001",
    estado_firma: "pendiente",
    fecha_caducidad_firma: null,
    ambiente: "testing",
    proveedor_nombre: "No configurado",
    estado_conexion: "desconectado",
  });

  const cargarDatos = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user?.id) return;

      const currentUserId = session.user.id;
      setPsicologoUUID(currentUserId);

      // Cargar Perfil Tributario
      const { data: tribData } = await supabase
        .from("perfil_tributario_psicologo")
        .select("*")
        .eq("psicologo_id", currentUserId)
        .maybeSingle();

      if (tribData) {
        setTributario({
          ruc: tribData.ruc,
          razon_social: tribData.razon_social,
          nombre_comercial: tribData.nombre_comercial || "",
          direccion_matriz: tribData.direccion_matriz,
          obligado_contabilidad: tribData.obligado_contabilidad,
        });
      }

      // Cargar Configuración Facturación
      const { data: confData } = await supabase
        .from("configuracion_facturacion_psicologo")
        .select("*")
        .eq("psicologo_id", currentUserId)
        .maybeSingle();

      if (confData) {
        setConfiguracion({
          establecimiento: confData.establecimiento,
          punto_emision: confData.punto_emision,
          estado_firma: confData.estado_firma,
          fecha_caducidad_firma: confData.fecha_caducidad_firma,
          ambiente: confData.ambiente,
          proveedor_nombre: confData.proveedor_nombre,
          estado_conexion: confData.estado_conexion,
        });
      }
    } catch (error) {
      console.error("Error cargando perfil tributario:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciarCarga = async () => {
      await cargarDatos();
    };
    iniciarCarga();
  }, [cargarDatos]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      if (!psicologoUUID) throw new Error("Sesión inválida.");

      // 1. Guardar Perfil Tributario
      const { error: tribError } = await supabase
        .from("perfil_tributario_psicologo")
        .upsert({
          psicologo_id: psicologoUUID,
          ruc: tributario.ruc,
          razon_social: tributario.razon_social.toUpperCase(),
          nombre_comercial: tributario.nombre_comercial.toUpperCase(),
          direccion_matriz: tributario.direccion_matriz.toUpperCase(),
          obligado_contabilidad: tributario.obligado_contabilidad,
        });
      if (tribError) throw tribError;

      // 2. Guardar Configuración de Emisión
      const { error: confError } = await supabase
        .from("configuracion_facturacion_psicologo")
        .upsert({
          psicologo_id: psicologoUUID,
          establecimiento: configuracion.establecimiento,
          punto_emision: configuracion.punto_emision,
        });
      if (confError) throw confError;

      setMensaje(
        "Identidad tributaria y configuración de emisión guardadas correctamente.",
      );
    } catch (error: unknown) {
      const msj = error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al guardar: ${msj}`);
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(""), 5000);
    }
  };

  if (cargando)
    return (
      <div className="p-10 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Configuración de Facturación
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-3xl">
          Administra tu identidad tributaria, puntos de emisión y el estado de
          tu firma electrónica para la emisión automatizada de comprobantes.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex gap-4 mb-8">
        <svg
          className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
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
          <h3 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-1">
            Responsabilidad Tributaria
          </h3>
          <p className="text-sm text-blue-800">
            Estos datos corresponden a ti como profesional y serán utilizados
            como el <strong>Emisor Oficial</strong> de los comprobantes
            electrónicos. Clinesfera actúa únicamente como plataforma de
            gestión.
          </p>
        </div>
      </div>

      {mensaje && (
        <div className="mb-8 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-emerald-200">
          <svg
            className="w-6 h-6"
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
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORMULARIO TRIBUTARIO */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleGuardar}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <svg
                className="w-5 h-5 text-indigo-600"
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
              Identidad Tributaria (SRI)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Registro Único de Contribuyentes (RUC)
                </label>
                <input
                  required
                  type="text"
                  value={tributario.ruc}
                  onChange={(e) =>
                    setTributario({ ...tributario, ruc: e.target.value })
                  }
                  placeholder="Ej. 1700000000001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Razón Social
                </label>
                <input
                  required
                  type="text"
                  value={tributario.razon_social}
                  onChange={(e) =>
                    setTributario({
                      ...tributario,
                      razon_social: e.target.value,
                    })
                  }
                  placeholder="NOMBRES Y APELLIDOS COMPLETOS"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre Comercial{" "}
                  <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={tributario.nombre_comercial}
                  onChange={(e) =>
                    setTributario({
                      ...tributario,
                      nombre_comercial: e.target.value,
                    })
                  }
                  placeholder="Ej. CONSULTORIO PSICOLÓGICO"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Obligado a llevar contabilidad
                </label>
                <select
                  value={tributario.obligado_contabilidad ? "SI" : "NO"}
                  onChange={(e) =>
                    setTributario({
                      ...tributario,
                      obligado_contabilidad: e.target.value === "SI",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SÍ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Dirección Matriz
              </label>
              <input
                required
                type="text"
                value={tributario.direccion_matriz}
                onChange={(e) =>
                  setTributario({
                    ...tributario,
                    direccion_matriz: e.target.value,
                  })
                }
                placeholder="Dirección registrada en el SRI"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
              />
            </div>

            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-4 mt-8 border-b border-slate-100 pb-4">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Configuración de Emisión
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Establecimiento
                </label>
                <input
                  required
                  type="text"
                  maxLength={3}
                  value={configuracion.establecimiento}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      establecimiento: e.target.value.padStart(3, "0"),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="001"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Punto de Emisión
                </label>
                <input
                  required
                  type="text"
                  maxLength={3}
                  value={configuracion.punto_emision}
                  onChange={(e) =>
                    setConfiguracion({
                      ...configuracion,
                      punto_emision: e.target.value.padStart(3, "0"),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="001"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Guardar Identidad Tributaria"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* STATUS DE PROVEEDOR Y FIRMA (Lectura) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-emerald-600"
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
              Firma Electrónica
            </h3>

            {configuracion.estado_firma === "pendiente" && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                  Estado actual
                </p>
                <p className="text-sm text-rose-900 font-medium">
                  No configurada
                </p>
              </div>
            )}
            {configuracion.estado_firma === "por_vencer" && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Alerta: Próxima a vencer
                </p>
                <p className="text-sm text-amber-900 font-medium">
                  Tu certificado requiere renovación antes de la fecha indicada
                  para continuar con la emisión electrónica.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              La integración definitiva de la firma electrónica (.p12) y el
              proveedor de facturación se activará en la siguiente fase de
              desarrollo de Clinesfera, conforme a los requisitos regulatorios.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4">
              Conexión SRI
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Proveedor
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {configuracion.proveedor_nombre}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Ambiente
                </span>
                <span className="text-sm font-bold text-slate-900 uppercase">
                  {configuracion.ambiente}
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Estado
                </span>
                <span className="text-xs font-black bg-slate-200 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">
                  {configuracion.estado_conexion}
                </span>
              </div>
            </div>

            {configuracion.estado_conexion !== "conectado" && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-700">
                  Facturación no disponible
                </p>
                <p className="text-[10px] text-red-600 mt-1">
                  Motivo: Firma y proveedor no configurados en este ambiente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

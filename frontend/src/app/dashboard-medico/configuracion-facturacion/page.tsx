"use client";

import { useState, useEffect } from "react";
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

export default function ConfiguracionFacturacionMedicoPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [medicoUUID, setMedicoUUID] = useState<string>("");

  const [archivoFirma, setArchivoFirma] = useState<File | null>(null);
  const [passwordFirma, setPasswordFirma] = useState("");

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
    proveedor_nombre: "Conexión Nativa Clinesfera",
    estado_conexion: "desconectado",
  });

  useEffect(() => {
    let montado = true;

    const inicializarTributos = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user?.id) return;

        const currentUserId = session.user.id;

        if (montado) {
          setMedicoUUID(currentUserId);
        }

        const { data: tribData } = await supabase
          .from("perfil_tributario_medico") // 🟢 Apunta a médicos
          .select("*")
          .eq("medico_id", currentUserId)
          .maybeSingle();

        if (montado && tribData) {
          setTributario({
            ruc: tribData.ruc,
            razon_social: tribData.razon_social,
            nombre_comercial: tribData.nombre_comercial || "",
            direccion_matriz: tribData.direccion_matriz,
            obligado_contabilidad: tribData.obligado_contabilidad,
          });
        }

        const { data: confData } = await supabase
          .from("configuracion_facturacion_medico") // 🟢 Apunta a médicos
          .select("*")
          .eq("medico_id", currentUserId)
          .maybeSingle();

        if (montado && confData) {
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
        if (montado) {
          setCargando(false);
        }
      }
    };

    inicializarTributos();

    return () => {
      montado = false;
    };
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      if (!medicoUUID) throw new Error("Sesión inválida.");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Enviamos el contexto al backend de encriptación SRI
      const formData = new FormData();
      formData.append("rol", "medico"); // 🟢 Le decimos al backend que el usuario es un médico
      formData.append("tributario", JSON.stringify(tributario));
      formData.append("configuracion", JSON.stringify(configuracion));

      if (archivoFirma) {
        formData.append("firma", archivoFirma);
        formData.append("passwordFirma", passwordFirma);
      }

      const res = await fetch("/api/billing/sri", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Fallo en la sincronización segura.");

      setMensaje("Identidad tributaria y firma almacenadas en Bóveda Segura.");

      if (archivoFirma) {
        setConfiguracion((prev) => ({ ...prev, estado_firma: "activa" }));
        setPasswordFirma("");
        setArchivoFirma(null);
      }
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
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Configuración SRI
        </h1>
        <p className="text-slate-500 font-medium text-lg max-w-3xl">
          Administra tu identidad tributaria y tu firma electrónica (.p12) bajo
          estrictos protocolos de encriptación.
        </p>
      </div>

      {mensaje && (
        <div className="mb-8 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-emerald-200 shadow-sm">
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
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleGuardar}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <svg
                className="w-5 h-5 text-teal-600"
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
              Identidad Tributaria Oficial
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  RUC
                </label>
                <input
                  required
                  type="text"
                  maxLength={13}
                  value={tributario.ruc}
                  onChange={(e) =>
                    setTributario({ ...tributario, ruc: e.target.value })
                  }
                  placeholder="Ej. 1700000000001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
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
                  placeholder="NOMBRES Y APELLIDOS"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre Comercial
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
                  placeholder="Opcional"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Lleva contabilidad
                </label>
                <select
                  value={tributario.obligado_contabilidad ? "SI" : "NO"}
                  onChange={(e) =>
                    setTributario({
                      ...tributario,
                      obligado_contabilidad: e.target.value === "SI",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="NO">NO</option>
                  <option value="SI">SÍ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Registrada en el SRI"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none uppercase"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
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
                        establecimiento: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none font-mono"
                    placeholder="001"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Punto Emisión
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={3}
                    value={configuracion.punto_emision}
                    onChange={(e) =>
                      setConfiguracion({
                        ...configuracion,
                        punto_emision: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none font-mono"
                    placeholder="001"
                  />
                </div>
              </div>
            </div>

            <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-4 mt-8 border-b border-slate-100 pb-4">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Bóveda de Firma Electrónica
            </h2>

            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    Archivo (.p12 / .pfx)
                  </label>
                  <input
                    type="file"
                    accept=".p12,.pfx"
                    onChange={(e) =>
                      setArchivoFirma(e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <p className="text-[10px] text-emerald-600 font-medium mt-2">
                    Solo cargar si necesitas actualizar tu firma actual.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                    Contraseña de la firma
                  </label>
                  <input
                    type="password"
                    value={passwordFirma}
                    onChange={(e) => setPasswordFirma(e.target.value)}
                    disabled={!archivoFirma}
                    placeholder={
                      archivoFirma
                        ? "Ingresa la contraseña"
                        : "Sube el archivo primero"
                    }
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-4 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Encriptar y Guardar Cambios"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h3 className="font-black text-white text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
              Estado de Emisión
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Firma Digital
                </span>
                {configuracion.estado_firma === "activa" ? (
                  <span className="text-xs font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase">
                    ACTIVA
                  </span>
                ) : (
                  <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md uppercase">
                    PENDIENTE
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Ambiente
                </span>
                <span className="text-xs font-black text-white uppercase">
                  {configuracion.ambiente}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Motor de Envío
                </span>
                <span className="text-xs font-black text-teal-400 uppercase">
                  {configuracion.proveedor_nombre}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

interface DatosBancarios {
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  titular: string;
  identificacion: string;
  correo_pagos: string;
}

export default function ConfiguracionBancariaPsicologo() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // 🟢 Guardaremos directamente el UUID de la sesión
  const [psicologoUUID, setPsicologoUUID] = useState<string>("");

  const [datos, setDatos] = useState<DatosBancarios>({
    banco: "Banco Pichincha",
    tipo_cuenta: "Cuenta de Ahorros",
    numero_cuenta: "",
    titular: "",
    identificacion: "",
    correo_pagos: "",
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user?.id) return;

        // 🟢 Usamos el UUID de Supabase Auth directamente
        const currentUserId = session.user.id;
        setPsicologoUUID(currentUserId);

        // Buscar si ya tiene datos bancarios guardados usando su UUID
        const { data: config, error: configError } = await supabase
          .from("configuracion_bancaria_psicologo")
          .select("*")
          .eq("psicologo_id", currentUserId)
          .maybeSingle();

        if (configError) throw configError;

        if (config) {
          setDatos({
            banco: config.banco,
            tipo_cuenta: config.tipo_cuenta,
            numero_cuenta: config.numero_cuenta,
            titular: config.titular,
            identificacion: config.identificacion,
            correo_pagos: config.correo_pagos || "",
          });
        }
      } catch (error) {
        console.error("Error cargando configuración bancaria:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarConfiguracion();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      if (!psicologoUUID) throw new Error("No se detectó una sesión válida.");

      const { error } = await supabase
        .from("configuracion_bancaria_psicologo")
        .upsert(
          {
            psicologo_id: psicologoUUID, // 🟢 Guardamos el UUID directamente
            banco: datos.banco,
            tipo_cuenta: datos.tipo_cuenta,
            numero_cuenta: datos.numero_cuenta,
            titular: datos.titular,
            identificacion: datos.identificacion,
            correo_pagos: datos.correo_pagos,
          },
          { onConflict: "psicologo_id" },
        );

      if (error) throw error;
      setMensaje(
        "¡Configuración bancaria guardada y vinculada a tus pacientes con éxito!",
      );
    } catch (error: unknown) {
      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al guardar: ${mensajeError}`);
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(""), 4000);
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
          Mis Datos de Recaudación
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Configura la cuenta bancaria donde tus pacientes realizarán las
          transferencias por tus consultas.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* FORMULARIO DE CONFIGURACIÓN */}
        <form
          onSubmit={handleGuardar}
          className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm space-y-6"
        >
          <h2 className="font-black text-slate-900 text-xl flex items-center gap-2 mb-2">
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Información de la Cuenta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Entidad Bancaria
              </label>
              <select
                value={datos.banco}
                onChange={(e) => setDatos({ ...datos, banco: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Banco Pichincha">Banco Pichincha</option>
                <option value="Banco Guayaquil">Banco Guayaquil</option>
                <option value="Banco del Pacífico">Banco del Pacífico</option>
                <option value="Produbanco">Produbanco</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tipo de Cuenta
              </label>
              <select
                value={datos.tipo_cuenta}
                onChange={(e) =>
                  setDatos({ ...datos, tipo_cuenta: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                <option value="Cuenta Corriente">Cuenta Corriente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Número de Cuenta
            </label>
            <input
              required
              type="text"
              value={datos.numero_cuenta}
              onChange={(e) =>
                setDatos({ ...datos, numero_cuenta: e.target.value })
              }
              placeholder="Ej. 2200XXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Nombre del Titular (Como aparece en el banco)
            </label>
            <input
              required
              type="text"
              value={datos.titular}
              onChange={(e) =>
                setDatos({ ...datos, titular: e.target.value.toUpperCase() })
              }
              placeholder="NOMBRES Y APELLIDOS COMPLETOS"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Identificación (Cédula/RUC)
              </label>
              <input
                required
                type="text"
                value={datos.identificacion}
                onChange={(e) =>
                  setDatos({ ...datos, identificacion: e.target.value })
                }
                placeholder="0000000000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Correo para notificaciones
              </label>
              <input
                type="email"
                value={datos.correo_pagos}
                onChange={(e) =>
                  setDatos({ ...datos, correo_pagos: e.target.value })
                }
                placeholder="pagos@tuemail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {guardando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Guardar Configuración Bancaria"
              )}
            </button>
          </div>
        </form>

        {/* PREVISUALIZACIÓN (Lado Derecho) */}
        <div className="bg-slate-50 rounded-4xl p-8 border border-slate-200 shadow-sm sticky top-10">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Vista Previa del Paciente
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Así es como verán tu información bancaria los pacientes al momento
            de pagar una consulta.
          </p>

          <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] mb-1">
                  MÉTODO AUTORIZADO
                </p>
                <h3 className="text-xl font-black">{datos.banco}</h3>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <svg
                  className="w-5 h-5 text-white"
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

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                    Titular / Identificación
                  </p>
                  <p className="font-bold text-sm uppercase line-clamp-1">
                    {datos.titular || "TITULAR NO DEFINIDO"}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {datos.identificacion || "0000000000"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">
                    Nº de Cuenta
                  </p>
                  <p className="font-mono font-black text-lg tracking-widest text-indigo-300">
                    {datos.numero_cuenta || "XXXXXX"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {datos.tipo_cuenta}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

interface ConfigClinica {
  nombre_clinica: string;
  eslogan: string;
  mision: string;
  vision: string;
  color_primario: string;
}

export default function PerfilPsicologoPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [config, setConfig] = useState<ConfigClinica>({
    nombre_clinica: "",
    eslogan: "",
    mision: "",
    vision: "",
    color_primario: "#4F46E5",
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Eliminamos la variable 'error' que no se utilizaba
      const { data } = await supabase
        .from("configuracion_clinica")
        .select("*")
        .eq("psicologo_id", user.id)
        .single();

      if (data) {
        setConfig({
          nombre_clinica: data.nombre_clinica || "",
          eslogan: data.eslogan || "",
          mision: data.mision || "",
          vision: data.vision || "",
          color_primario: data.color_primario || "#4F46E5",
        });
      }
      setCargando(false);
    };

    cargarConfiguracion();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const guardarConfiguracion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const { error: upsertError } = await supabase
        .from("configuracion_clinica")
        .upsert(
          {
            psicologo_id: user.id,
            ...config,
          },
          { onConflict: "psicologo_id" },
        );

      if (upsertError) throw upsertError;

      setMensaje({
        texto: "¡Configuración guardada con éxito!",
        tipo: "exito",
      });
    } catch (err: unknown) {
      // Reemplazamos 'any' por 'unknown' y aplicamos validación estricta
      if (err instanceof Error) {
        setMensaje({ texto: err.message, tipo: "error" });
      } else {
        setMensaje({
          texto: "Error al guardar la configuración",
          tipo: "error",
        });
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Configuración de Clínica
        </h1>
        <p className="text-slate-500">
          Personaliza la marca blanca de tu consultorio. Tus pacientes verán
          esta información.
        </p>
      </div>

      {mensaje.texto && (
        <div
          className={`mb-6 p-4 rounded-xl font-bold text-sm ${mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={guardarConfiguracion} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            Identidad de la Clínica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombre Comercial
              </label>
              <input
                type="text"
                name="nombre_clinica"
                value={config.nombre_clinica}
                onChange={handleChange}
                placeholder="Ej: Consultorio Dr. Pérez"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Eslogan Corto
              </label>
              <input
                type="text"
                name="eslogan"
                value={config.eslogan}
                onChange={handleChange}
                placeholder="Ej: Tu mente en equilibrio"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Color Principal de Marca
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="color_primario"
                value={config.color_primario}
                onChange={handleChange}
                className="w-14 h-14 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-sm text-slate-500 font-medium font-mono bg-slate-100 px-3 py-1 rounded-lg uppercase">
                {config.color_primario}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Este color se usará en los botones y detalles del portal de tus
              pacientes.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            Filosofía Corporativa
          </h2>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Misión
            </label>
            <textarea
              name="mision"
              value={config.mision}
              onChange={handleChange}
              rows={3}
              placeholder="¿Cuál es el propósito fundamental de tu clínica?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Visión
            </label>
            <textarea
              name="vision"
              value={config.vision}
              onChange={handleChange}
              rows={3}
              placeholder="¿Cómo ves el futuro de tus pacientes y tu clínica?"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={guardando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-colors disabled:bg-slate-400"
          >
            {guardando ? "Guardando cambios..." : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}

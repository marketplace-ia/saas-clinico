"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export type TipoCampo = "texto_corto" | "parrafo" | "seleccion" | "casilla";

export interface CampoDinamico {
  id: string;
  tipo: TipoCampo;
  etiqueta: string;
  requerido: boolean;
  opciones?: string[]; // Solo para tipo 'seleccion'
}

export default function ConstructorHistoriasPage() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [plantillaId, setPlantillaId] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("Historia Clínica Personalizada");
  const [campos, setCampos] = useState<CampoDinamico[]>([]);

  const cargarPlantilla = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("plantillas_historias")
        .select("*")
        .eq("creador_id", session.user.id)
        .eq("rol", "psicologo")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPlantillaId(data.id);
        setTitulo(data.titulo);
        // Validamos que sea un array válido
        setCampos(Array.isArray(data.campos_json) ? data.campos_json : []);
      } else {
        // Plantilla por defecto si es la primera vez
        setCampos([
          {
            id: crypto.randomUUID(),
            tipo: "texto_corto",
            etiqueta: "Motivo de Consulta",
            requerido: true,
          },
          {
            id: crypto.randomUUID(),
            tipo: "parrafo",
            etiqueta: "Antecedentes Relevantes",
            requerido: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error cargando plantilla:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await cargarPlantilla();
    };
    inicializar();
  }, [cargarPlantilla]);

  const agregarCampo = (tipo: TipoCampo) => {
    const nuevoCampo: CampoDinamico = {
      id: crypto.randomUUID(),
      tipo,
      etiqueta: "Nueva Pregunta",
      requerido: false,
      ...(tipo === "seleccion" ? { opciones: ["Opción 1", "Opción 2"] } : {}),
    };
    setCampos([...campos, nuevoCampo]);
  };

  const actualizarCampo = (
    id: string,
    key: keyof CampoDinamico,
    value: string | boolean | string[],
  ) => {
    setCampos(campos.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  };

  const eliminarCampo = (id: string) => {
    setCampos(campos.filter((c) => c.id !== id));
  };

  const moverCampo = (index: number, direccion: -1 | 1) => {
    if (index + direccion < 0 || index + direccion >= campos.length) return;
    const nuevosCampos = [...campos];
    const temp = nuevosCampos[index];
    nuevosCampos[index] = nuevosCampos[index + direccion];
    nuevosCampos[index + direccion] = temp;
    setCampos(nuevosCampos);
  };

  const actualizarOpciones = (id: string, opcionesString: string) => {
    const arrayOpciones = opcionesString
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    actualizarCampo(id, "opciones", arrayOpciones);
  };

  const guardarPlantilla = async () => {
    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const payload = {
        creador_id: session.user.id,
        rol: "psicologo",
        titulo,
        campos_json: campos,
      };

      if (plantillaId) {
        await supabase
          .from("plantillas_historias")
          .update(payload)
          .eq("id", plantillaId);
      } else {
        const { data } = await supabase
          .from("plantillas_historias")
          .insert(payload)
          .select()
          .single();
        if (data) setPlantillaId(data.id);
      }

      alert(
        "¡Plantilla clínica guardada con éxito! Tus pacientes ahora usarán esta estructura.",
      );
    } catch (error) {
      console.error(error);
      alert("Error al guardar la plantilla.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/dashboard-psicologo"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Volver al Inicio
          </Link>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Constructor de Historias
          </h1>
          <p className="text-slate-500 font-medium">
            Diseña los campos que quieres llenar cuando atiendas a tus
            pacientes.
          </p>
        </div>
        <button
          onClick={guardarPlantilla}
          disabled={guardando}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {guardando ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "💾 Guardar Estructura"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* PANEL IZQUIERDO: HERRAMIENTAS */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
          <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-wider">
            Añadir Campos
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => agregarCampo("texto_corto")}
              className="flex items-center gap-3 w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                🔤
              </span>
              <span className="font-bold text-slate-700 text-sm">
                Texto Corto
              </span>
            </button>
            <button
              onClick={() => agregarCampo("parrafo")}
              className="flex items-center gap-3 w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                📝
              </span>
              <span className="font-bold text-slate-700 text-sm">
                Párrafo Largo
              </span>
            </button>
            <button
              onClick={() => agregarCampo("seleccion")}
              className="flex items-center gap-3 w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                🔽
              </span>
              <span className="font-bold text-slate-700 text-sm">
                Opción Múltiple
              </span>
            </button>
            <button
              onClick={() => agregarCampo("casilla")}
              className="flex items-center gap-3 w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-colors group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                ☑️
              </span>
              <span className="font-bold text-slate-700 text-sm">
                Casilla (Sí/No)
              </span>
            </button>
          </div>
        </div>

        {/* PANEL DERECHO: EL LIENZO DEL FORMULARIO */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-3xl border-t-8 border-t-indigo-600 border border-slate-200 shadow-sm">
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full text-3xl font-black text-slate-900 border-0 border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none transition-colors pb-2 mb-2 bg-transparent"
              placeholder="Título de la Ficha Clínica"
            />
            <p className="text-slate-500 font-medium">
              Esta plantilla se cargará automáticamente al abrir el expediente
              de un paciente.
            </p>
          </div>

          {campos.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center text-slate-500 font-bold">
              No hay campos. Haz clic en las herramientas de la izquierda para
              comenzar a construir.
            </div>
          ) : (
            campos.map((campo, index) => (
              <div
                key={campo.id}
                className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-bottom-4 duration-300"
              >
                {/* Controles de orden */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moverCampo(index, -1)}
                    disabled={index === 0}
                    className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moverCampo(index, 1)}
                    disabled={index === campos.length - 1}
                    className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={campo.etiqueta}
                      onChange={(e) =>
                        actualizarCampo(campo.id, "etiqueta", e.target.value)
                      }
                      className="w-full text-lg font-bold text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Escribe la pregunta o título del campo..."
                    />
                  </div>
                  <div className="shrink-0 w-full md:w-48">
                    <select
                      value={campo.tipo}
                      onChange={(e) =>
                        actualizarCampo(
                          campo.id,
                          "tipo",
                          e.target.value as TipoCampo,
                        )
                      }
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="texto_corto">Texto Corto</option>
                      <option value="parrafo">Párrafo Largo</option>
                      <option value="seleccion">Opción Múltiple</option>
                      <option value="casilla">Casilla (Sí/No)</option>
                    </select>
                  </div>
                </div>

                {/* Previsualización del campo */}
                <div className="mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed pointer-events-none opacity-60">
                  {campo.tipo === "texto_corto" && (
                    <div className="border-b border-slate-300 w-1/2 pb-1 text-sm text-slate-400">
                      Respuesta corta...
                    </div>
                  )}
                  {campo.tipo === "parrafo" && (
                    <div className="border border-slate-300 rounded bg-transparent h-20 w-full p-2 text-sm text-slate-400">
                      Respuesta larga...
                    </div>
                  )}
                  {campo.tipo === "casilla" && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <input type="checkbox" readOnly /> Sí / Confirmado
                    </div>
                  )}
                </div>

                {/* Configuración específica del campo */}
                {campo.tipo === "seleccion" && (
                  <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
                      Opciones Disponibles (Separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={campo.opciones?.join(", ") || ""}
                      onChange={(e) =>
                        actualizarOpciones(campo.id, e.target.value)
                      }
                      placeholder="Ej: Soltero, Casado, Divorciado"
                      className="w-full px-4 py-2.5 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {campo.opciones?.map((op, i) => (
                        <span
                          key={i}
                          className="bg-white border border-indigo-200 text-indigo-700 text-xs font-bold px-2 py-1 rounded shadow-sm"
                        >
                          {op}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    onClick={() => eliminarCampo(campo.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Eliminar pregunta"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-bold text-slate-600 uppercase">
                      Obligatorio
                    </span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        checked={campo.requerido}
                        onChange={(e) =>
                          actualizarCampo(
                            campo.id,
                            "requerido",
                            e.target.checked,
                          )
                        }
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-indigo-600 transition-all"
                        style={{ right: campo.requerido ? "0" : "1.25rem" }}
                      />
                      <div
                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${campo.requerido ? "bg-indigo-600" : "bg-slate-300"}`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

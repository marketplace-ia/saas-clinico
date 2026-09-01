"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  color: string;
  creado_en: string;
}

const COLORES_DISPONIBLES = [
  { id: "bg-yellow-100", clase: "bg-yellow-100", border: "border-yellow-200" },
  { id: "bg-blue-100", clase: "bg-blue-100", border: "border-blue-200" },
  {
    id: "bg-emerald-100",
    clase: "bg-emerald-100",
    border: "border-emerald-200",
  },
  { id: "bg-rose-100", clase: "bg-rose-100", border: "border-rose-200" },
  { id: "bg-purple-100", clase: "bg-purple-100", border: "border-purple-200" },
];

export default function MisNotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({
    titulo: "",
    contenido: "",
    color: "bg-yellow-100",
  });

  const cargarNotas = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notas_psicologo")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("creado_en", { ascending: false });

      if (error) throw error;
      if (data) setNotas(data);
    } catch (error) {
      console.error("Error cargando notas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => await cargarNotas();
    inicializar();
  }, [cargarNotas]);

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("notas_psicologo").insert([
        {
          psicologo_id: session.user.id,
          titulo: nuevaNota.titulo,
          contenido: nuevaNota.contenido,
          color: nuevaNota.color,
        },
      ]);

      if (error) throw error;

      setNuevaNota({ titulo: "", contenido: "", color: "bg-yellow-100" });
      setModalAbierto(false);
      cargarNotas();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar la nota.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarNota = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta nota?")) return;

    try {
      const { error } = await supabase
        .from("notas_psicologo")
        .delete()
        .eq("id", id);
      if (error) throw error;
      cargarNotas();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar la nota.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Mis Notas Privadas
          </h1>
          <p className="text-slate-500 font-medium">
            Apuntes rápidos, hipótesis o recordatorios (no visibles en historias
            clínicas).
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Nota
        </button>
      </div>

      {/* REJILLA DE NOTAS */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : notas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg
              className="w-10 h-10 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Tu bloc está vacío
          </h3>
          <p className="text-slate-500 max-w-sm">
            Haz clic en &quot;Nueva Nota&quot; para crear tu primer apunte
            rápido.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {notas.map((nota) => (
            <div
              key={nota.id}
              className={`${nota.color} p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col gap-3 group relative transform hover:-translate-y-1 transition-all duration-200`}
            >
              <button
                onClick={() => eliminarNota(nota.id)}
                className="absolute top-4 right-4 text-black/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar nota"
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

              <h3 className="font-black text-lg text-slate-900 pr-6 leading-tight">
                {nota.titulo}
              </h3>
              <p className="text-slate-700 text-sm whitespace-pre-wrap flex-1">
                {nota.contenido}
              </p>

              <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mt-4">
                {new Date(nota.creado_en).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NUEVA NOTA */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900">
                Crear Apunte
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={guardarNota} className="p-6 space-y-5">
              <div>
                <input
                  type="text"
                  required
                  value={nuevaNota.titulo}
                  onChange={(e) =>
                    setNuevaNota({ ...nuevaNota, titulo: e.target.value })
                  }
                  className="w-full px-0 py-2 border-0 border-b-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-xl font-black text-slate-900 placeholder:text-slate-300 transition-colors outline-none bg-transparent"
                  placeholder="Título de la nota..."
                />
              </div>

              <div>
                <textarea
                  required
                  rows={5}
                  value={nuevaNota.contenido}
                  onChange={(e) =>
                    setNuevaNota({ ...nuevaNota, contenido: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 resize-none font-medium"
                  placeholder="Escribe aquí los detalles..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Color de la nota
                </label>
                <div className="flex gap-3">
                  {COLORES_DISPONIBLES.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() =>
                        setNuevaNota({ ...nuevaNota, color: color.id })
                      }
                      className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${color.clase} ${nuevaNota.color === color.id ? "border-indigo-600 scale-110 shadow-md" : "border-transparent"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {guardando ? "Guardando..." : "Guardar Nota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

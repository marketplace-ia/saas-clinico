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

const COLORES = [
  { id: "bg-yellow-100", borde: "border-yellow-200", texto: "text-yellow-900" },
  { id: "bg-blue-100", borde: "border-blue-200", texto: "text-blue-900" },
  { id: "bg-green-100", borde: "border-green-200", texto: "text-green-900" },
  { id: "bg-pink-100", borde: "border-pink-200", texto: "text-pink-900" },
  { id: "bg-purple-100", borde: "border-purple-200", texto: "text-purple-900" },
];

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [notaActual, setNotaActual] = useState<{
    id?: string;
    titulo: string;
    contenido: string;
    color: string;
  }>({
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
    // SOLUCIÓN: Envolvemos la llamada para que el linter vea claramente que es asíncrona
    // y no lance el error de "actualización síncrona".
    const iniciarCarga = async () => {
      await cargarNotas();
    };

    iniciarCarga();
  }, [cargarNotas]);

  const abrirModalNueva = () => {
    setNotaActual({ titulo: "", contenido: "", color: "bg-yellow-100" });
    setModalAbierto(true);
  };

  const abrirModalEditar = (nota: Nota) => {
    setNotaActual(nota);
    setModalAbierto(true);
  };

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      if (notaActual.id) {
        // Actualizar existente
        await supabase
          .from("notas_psicologo")
          .update({
            titulo: notaActual.titulo,
            contenido: notaActual.contenido,
            color: notaActual.color,
          })
          .eq("id", notaActual.id);
      } else {
        // Crear nueva
        await supabase.from("notas_psicologo").insert([
          {
            psicologo_id: session.user.id,
            titulo: notaActual.titulo,
            contenido: notaActual.contenido,
            color: notaActual.color,
          },
        ]);
      }

      setModalAbierto(false);
      cargarNotas(); // Recargar la lista
    } catch (error) {
      console.error("Error guardando nota:", error);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarNota = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se abra el modal de editar
    if (!confirm("¿Estás seguro de eliminar esta nota?")) return;

    try {
      await supabase.from("notas_psicologo").delete().eq("id", id);
      cargarNotas();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Mis Notas Privadas
          </h1>
          <p className="text-slate-500 font-medium">
            Un espacio seguro para tus ideas y recordatorios.
          </p>
        </div>
        <button
          onClick={abrirModalNueva}
          className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
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

      {/* GRILLA DE NOTAS */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : notas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-slate-400"
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
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No tienes notas aún
          </h3>
          <p className="text-slate-500 max-w-sm">
            Haz clic en &quot;Nueva Nota&quot; para crear tu primer post-it
            digital.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {notas.map((nota) => {
            const estilo =
              COLORES.find((c) => c.id === nota.color) || COLORES[0];
            return (
              <div
                key={nota.id}
                onClick={() => abrirModalEditar(nota)}
                className={`group relative p-6 rounded-2xl border ${nota.color} ${estilo.borde} shadow-sm hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 flex flex-col h-64`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className={`font-black text-lg ${estilo.texto} line-clamp-2 pr-6 leading-tight`}
                  >
                    {nota.titulo}
                  </h3>
                  <button
                    onClick={(e) => eliminarNota(nota.id, e)}
                    className="absolute top-4 right-4 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all bg-white/50 hover:bg-white p-1.5 rounded-lg"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <p
                  className={`${estilo.texto} opacity-80 text-sm flex-1 overflow-hidden font-medium`}
                >
                  {nota.contenido}
                </p>
                <p className="text-xs font-bold opacity-40 mt-4 pt-4 border-t border-black/5 uppercase tracking-widest">
                  {new Date(nota.creado_en).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex gap-2">
                {COLORES.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() =>
                      setNotaActual({ ...notaActual, color: color.id })
                    }
                    className={`w-8 h-8 rounded-full border-2 transition-all ${color.id} ${notaActual.color === color.id ? "border-slate-900 scale-110 shadow-md" : "border-transparent hover:scale-110"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors p-2 bg-white rounded-full"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={guardarNota}
              className={`p-6 ${notaActual.color} transition-colors duration-300`}
            >
              <input
                type="text"
                placeholder="Título de la nota..."
                required
                value={notaActual.titulo}
                onChange={(e) =>
                  setNotaActual({ ...notaActual, titulo: e.target.value })
                }
                className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 p-0 mb-4 placeholder-black/30 text-black/80 outline-none"
              />
              <textarea
                placeholder="Escribe tu nota aquí..."
                required
                rows={8}
                value={notaActual.contenido}
                onChange={(e) =>
                  setNotaActual({ ...notaActual, contenido: e.target.value })
                }
                className="w-full text-base font-medium bg-transparent border-none focus:ring-0 p-0 resize-none placeholder-black/30 text-black/70 outline-none"
              />

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-6 py-2.5 font-bold text-black/60 hover:text-black/90 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center min-w-30"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

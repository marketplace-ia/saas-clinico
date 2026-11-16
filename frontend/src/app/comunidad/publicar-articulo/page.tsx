"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase"; // 🟢 Conectado a BD
import { useRouter } from "next/navigation";

export default function PublicarArticuloPage() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [etiquetaInput, setEtiquetaInput] = useState("");

  const [articulo, setArticulo] = useState({
    titulo: "",
    subtitulo: "",
    contenido: "",
    categoria: "",
    tipo: "Divulgativo",
    etiquetas: [] as string[],
    referencias: "",
  });

  const categorias = [
    "Psicología Clínica",
    "Neuropsicología",
    "Psicoterapia",
    "Evaluación Psicológica",
    "Salud Mental",
    "Psicología Infantil",
    "Desarrollo Humano",
    "Investigación",
  ];

  const handleAgregarEtiqueta = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && etiquetaInput.trim() !== "") {
      e.preventDefault();
      if (!articulo.etiquetas.includes(etiquetaInput.trim())) {
        setArticulo({
          ...articulo,
          etiquetas: [...articulo.etiquetas, etiquetaInput.trim()],
        });
      }
      setEtiquetaInput("");
    }
  };

  const handleEliminarEtiqueta = (tagEliminar: string) => {
    setArticulo({
      ...articulo,
      etiquetas: articulo.etiquetas.filter((tag) => tag !== tagEliminar),
    });
  };

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Debes iniciar sesión.");

      // Buscamos el nombre del autor en la BD
      const { data: perfil } = await supabase
        .from("perfil_psicologo")
        .select("nombres, apellidos")
        .eq("psicologo_id", session.user.id)
        .single();

      const autorNombre = perfil
        ? `${perfil.nombres} ${perfil.apellidos}`
        : "Profesional Clínico";

      // Calculamos tiempo de lectura (aprox 200 palabras por min)
      const palabras = articulo.contenido.split(" ").length;
      const minLectura = Math.max(1, Math.ceil(palabras / 200));

      const { error } = await supabase.from("articulos_comunidad").insert({
        titulo: articulo.titulo,
        autor: autorNombre,
        categoria: articulo.categoria || "Salud Mental",
        tiempo_lectura: `${minLectura} min`,
      });

      if (error) throw error;

      alert("¡Artículo publicado exitosamente en la comunidad!");
      router.push("/comunidad/articulos");
    } catch (error: unknown) {
      alert(
        `Error al publicar: ${error instanceof Error ? error.message : "Desconocido"}`,
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <Link
          href="/comunidad/articulos"
          className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Cancelar
        </Link>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-5 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
            Guardar Borrador
          </button>
          <button
            onClick={handlePublicar}
            disabled={guardando || !articulo.titulo || !articulo.contenido}
            className="flex-1 md:flex-none px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {guardando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Publicar Artículo"
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 md:p-12 rounded-4xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <input
                type="text"
                placeholder="Título del artículo..."
                value={articulo.titulo}
                onChange={(e) =>
                  setArticulo({ ...articulo, titulo: e.target.value })
                }
                className="w-full text-3xl md:text-5xl font-black text-slate-900 placeholder:text-slate-200 border-none focus:ring-0 px-0 outline-none"
              />
            </div>
            <hr className="border-slate-100 my-4" />
            <div>
              <textarea
                placeholder="Escribe tu conocimiento aquí..."
                rows={20}
                value={articulo.contenido}
                onChange={(e) =>
                  setArticulo({ ...articulo, contenido: e.target.value })
                }
                className="w-full text-lg text-slate-700 font-medium leading-relaxed placeholder:text-slate-200 border-none focus:ring-0 px-0 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block font-black text-slate-900 mb-2">
                Categoría
              </label>
              <select
                value={articulo.categoria}
                onChange={(e) =>
                  setArticulo({ ...articulo, categoria: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700"
              >
                <option value="">Selecciona una categoría...</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-900 mb-2">
                Etiquetas
              </label>
              <input
                type="text"
                value={etiquetaInput}
                onChange={(e) => setEtiquetaInput(e.target.value)}
                onKeyDown={handleAgregarEtiqueta}
                placeholder="Escribe y presiona Enter..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {articulo.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    {tag}{" "}
                    <button
                      type="button"
                      onClick={() => handleEliminarEtiqueta(tag)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

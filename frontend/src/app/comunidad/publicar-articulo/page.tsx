"use client";

import { useState } from "react";
import Link from "next/link";

export default function PublicarArticuloPage() {
  const [guardando, setGuardando] = useState(false);
  const [etiquetaInput, setEtiquetaInput] = useState("");

  const [articulo, setArticulo] = useState({
    titulo: "",
    subtitulo: "",
    contenido: "",
    categoria: "",
    tipo: "Divulgativo", // Académico o Divulgativo
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

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    // Simulación de guardado
    setTimeout(() => {
      setGuardando(false);
      alert("¡Artículo publicado exitosamente en la comunidad!");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/comunidad/articulos"
          className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Volver a Biblioteca
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm">
            Guardar Borrador
          </button>
          <button
            onClick={handlePublicar}
            disabled={guardando || !articulo.titulo || !articulo.contenido}
            className="px-6 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 text-sm flex items-center gap-2"
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
        {/* COLUMNA IZQUIERDA: EDITOR PRINCIPAL */}
        <div className="lg:col-span-2 space-y-6">
          {/* Zona de Portada */}
          <div className="w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-4xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group">
            <svg
              className="w-10 h-10 mb-3 text-slate-300 group-hover:text-indigo-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-bold text-sm text-slate-500 group-hover:text-indigo-500">
              Subir imagen de portada
            </span>
            <span className="text-xs font-medium mt-1">
              PNG, JPG (Recomendado 1200x600px)
            </span>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-4xl border border-slate-100 shadow-sm space-y-6">
            {/* Títulos */}
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
            <div>
              <input
                type="text"
                placeholder="Subtítulo o breve descripción (opcional)..."
                value={articulo.subtitulo}
                onChange={(e) =>
                  setArticulo({ ...articulo, subtitulo: e.target.value })
                }
                className="w-full text-lg md:text-xl font-medium text-slate-500 placeholder:text-slate-300 border-none focus:ring-0 px-0 outline-none"
              />
            </div>

            <hr className="border-slate-100 my-4" />

            {/* Barra de herramientas simulada */}
            <div className="flex gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
              {["B", "I", "U"].map((format) => (
                <button
                  key={format}
                  className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                  {format}
                </button>
              ))}
              <div className="w-px h-6 bg-slate-200 my-auto mx-2"></div>
              <button className="px-3 h-8 flex items-center justify-center rounded-lg font-bold text-slate-600 text-xs hover:bg-white hover:shadow-sm transition-all gap-1.5">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>{" "}
                Enlace
              </button>
            </div>

            {/* Contenido (Textarea) */}
            <div>
              <textarea
                placeholder="Escribe tu conocimiento aquí..."
                rows={15}
                value={articulo.contenido}
                onChange={(e) =>
                  setArticulo({ ...articulo, contenido: e.target.value })
                }
                className="w-full text-lg text-slate-700 font-medium leading-relaxed placeholder:text-slate-200 border-none focus:ring-0 px-0 outline-none resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: METADATOS Y CONFIGURACIÓN */}
        <div className="space-y-6">
          {/* Tarjeta: Tipo de Contenido (Punto 35) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-500"
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
              Tipo de Publicación
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setArticulo({ ...articulo, tipo: "Divulgativo" })
                }
                className={`py-2 rounded-lg text-sm font-bold transition-all ${articulo.tipo === "Divulgativo" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Divulgativo
              </button>
              <button
                type="button"
                onClick={() => setArticulo({ ...articulo, tipo: "Académico" })}
                className={`py-2 rounded-lg text-sm font-bold transition-all ${articulo.tipo === "Académico" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Académico
              </button>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-3 leading-relaxed">
              {articulo.tipo === "Divulgativo"
                ? "Dirigido al público general. Usa lenguaje accesible para explicar conceptos psicológicos."
                : "Dirigido a estudiantes e investigadores. Requiere rigor metodológico y citas APA."}
            </p>
          </div>

          {/* Tarjeta: Categoría y Etiquetas */}
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
                    {tag}
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

          {/* Tarjeta: Referencias */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Referencias Bibliográficas
            </h3>
            <textarea
              rows={4}
              value={articulo.referencias}
              onChange={(e) =>
                setArticulo({ ...articulo, referencias: e.target.value })
              }
              placeholder="Formato APA recomendado..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 resize-none"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

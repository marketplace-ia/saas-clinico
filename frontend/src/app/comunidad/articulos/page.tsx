"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export default function ArticulosComunidadPage() {
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Simulamos una base de datos de artículos por ahora
  const articulosFalsos = [
    {
      id: 1,
      titulo: "El impacto del micro-estrés laboral y cómo gestionarlo",
      autor: "Dr. Roberto Sánchez",
      rolAutor: "Psicólogo Clínico",
      fecha: "Hace 2 días",
      lectura: "5 min",
      etiquetas: ["Ansiedad", "Laboral"],
      resumen:
        "A menudo ignoramos las pequeñas fricciones del día a día en nuestro entorno de trabajo. Sin embargo, la acumulación de estos micro-estresores puede llevar al Burnout más rápido que los grandes eventos traumáticos.",
    },
    {
      id: 2,
      titulo: "Técnicas de grounding para ataques de pánico",
      autor: "Ana López",
      rolAutor: "Estudiante Validada",
      fecha: "Hace 5 días",
      lectura: "3 min",
      etiquetas: ["Pánico", "Técnicas"],
      resumen:
        "Un repaso práctico por la técnica 5-4-3-2-1 y cómo anclarnos al presente cuando la ansiedad amenaza con desbordarnos de manera sorpresiva.",
    },
    {
      id: 3,
      titulo: "La importancia de establecer límites en pareja",
      autor: "Dra. María Fernández",
      rolAutor: "Terapeuta de Pareja",
      fecha: "Hace 1 semana",
      lectura: "7 min",
      etiquetas: ["Relaciones", "Límites"],
      resumen:
        "Decir 'no' no es un acto de egoísmo, sino de supervivencia emocional. Descubre cómo comunicar tus límites sin generar conflictos destructivos.",
    },
  ];

  useEffect(() => {
    const verificarIdentidad = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Si hay un usuario logueado, buscamos qué rol tiene
        if (user && user.email) {
          const { data } = await supabase
            .from("roles_usuarios")
            .select("rol")
            .eq("correo", user.email)
            .maybeSingle();

          if (data) {
            setRolUsuario(data.rol);
          }
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
      } finally {
        setCargando(false);
      }
    };

    verificarIdentidad();
  }, []);

  const articulosFiltrados = articulosFalsos.filter(
    (a) =>
      a.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.etiquetas.some((e) => e.toLowerCase().includes(busqueda.toLowerCase())),
  );

  return (
    <div className="w-full font-sans animate-in fade-in duration-500">
      {/* Cabecera con Botón Mágico */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div className="max-w-2xl">
          <Link
            href="/comunidad"
            className="text-teal-600 font-bold text-sm hover:underline mb-2 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-2 mb-2">
            Publicaciones Científicas y Artículos
          </h1>
          <p className="text-gray-500 text-lg">
            Descubre herramientas, reflexiones y estudios redactados por nuestra
            red de especialistas.
          </p>
        </div>

        {/* EL BOTÓN SECRETO: Solo se muestra si el usuario es psicólogo */}
        {!cargando && rolUsuario === "psicologo" && (
          <button
            onClick={() =>
              alert(
                "Próximamente: Se abrirá el editor de texto enriquecido para redactar tu artículo.",
              )
            }
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              ></path>
            </svg>
            Publicar Artículo
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative w-full max-w-xl mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar por tema, palabra clave o ansiedad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition shadow-sm text-gray-700"
        />
      </div>

      {/* Grid de Artículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articulosFiltrados.map((articulo) => (
          <div
            key={articulo.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group cursor-pointer overflow-hidden hover:-translate-y-1"
          >
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex flex-wrap gap-2 mb-4">
                {articulo.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-full border border-teal-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-teal-600 transition leading-tight">
                {articulo.titulo}
              </h3>

              <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">
                {articulo.resumen}
              </p>

              <div className="border-t border-gray-100 pt-5 flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 bg-linear-to-br from-teal-100 to-emerald-200 text-teal-800 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {articulo.autor.charAt(0)}
                  {articulo.autor.split(" ")[1]?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {articulo.autor}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <span>{articulo.fecha}</span>
                    <span>•</span>
                    <span>{articulo.lectura} lectura</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {articulosFiltrados.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4">🍂</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No encontramos artículos
            </h3>
            <p className="text-gray-500">
              Prueba buscando con otras palabras clave.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

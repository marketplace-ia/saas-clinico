"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CrearTallerPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: "",
    instructor: "",
    fecha: "",
    hora: "",
    modalidad: "Zoom (En vivo)",
    precio: 0,
    cupos: 10,
    descripcion: "",
    color: "from-blue-500 to-blue-700",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "cupos" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const { error } = await supabase.from("talleres").insert([formData]);

      if (error) throw error;

      setMensaje({ tipo: "exito", texto: "¡Taller publicado exitosamente!" });

      setTimeout(() => {
        router.push("/comunidad/talleres");
      }, 2000);

      // SOLUCIÓN: Le quitamos el ": any" a esta línea
    } catch (error) {
      console.error("Error:", error);
      setMensaje({
        tipo: "error",
        texto: "Hubo un error al publicar el taller. Intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Link
          href="/comunidad/talleres"
          className="text-blue-600 font-bold text-sm hover:underline mb-2 inline-block"
        >
          ← Cancelar y volver
        </Link>
        <h1 className="text-3xl font-black text-gray-900">
          Crear Nuevo Taller
        </h1>
        <p className="text-gray-500 mt-1">
          Completa los detalles para publicar un nuevo evento en PsiEduca.
        </p>
      </div>

      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl mb-6 font-bold ${mensaje.tipo === "exito" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {mensaje.texto}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Título del Taller
            </label>
            <input
              required
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: Control de Ansiedad en 5 pasos"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre del Instructor
            </label>
            <input
              required
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: Dr. Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="Zoom (En vivo)">Zoom (En vivo)</option>
              <option value="Presencial (Auditorio)">
                Presencial (Auditorio)
              </option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha (Texto)
            </label>
            <input
              required
              type="text"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: 20 de Noviembre"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Hora
            </label>
            <input
              required
              type="text"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: 10:00 AM - 12:00 PM"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Precio ($)
            </label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">
              Pon 0 si el taller es gratuito.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Límite de Cupos
            </label>
            <input
              required
              type="number"
              min="1"
              name="cupos"
              value={formData.cupos}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Color de la Tarjeta
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="from-blue-500 to-blue-700">Azul Clínico</option>
              <option value="from-teal-500 to-teal-700">Verde Menta</option>
              <option value="from-purple-500 to-purple-700">
                Morado Recepción
              </option>
              <option value="from-orange-500 to-orange-700">
                Naranja Alerta
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Descripción Corta
            </label>
            <textarea
              required
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              placeholder="Describe brevemente de qué trata este taller..."
            ></textarea>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={cargando}
            className={`bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-md flex items-center gap-2 ${cargando ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:-translate-y-1"}`}
          >
            {cargando ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                Publicando...
              </span>
            ) : (
              "Publicar Taller"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

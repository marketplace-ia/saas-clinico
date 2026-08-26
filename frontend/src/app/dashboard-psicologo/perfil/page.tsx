"use client";

import { useState } from "react";

export default function PerfilPsicologoPage() {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Datos simulados (pronto vendrán de Supabase)
  const [perfil, setPerfil] = useState({
    nombre: "Dr. Esteban",
    especialidad: "Psicología Clínica y Psicoterapia",
    precio: "50.00",
    duracion: "60",
    biografia:
      "Especialista en terapia cognitivo-conductual con enfoque en ansiedad y desarrollo personal.",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    // Simulamos el tiempo de guardado en la base de datos
    setTimeout(() => {
      setGuardando(false);
      setMensaje("¡Perfil y configuración guardados exitosamente!");

      // Borrar el mensaje después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Configuración de la Clínica
        </h1>
        <p className="text-gray-500">
          Personaliza tu perfil público, tarifas y detalles profesionales.
        </p>
      </div>

      {/* Alerta de Éxito */}
      {mensaje && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-green-200 animate-in slide-in-from-top-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-8">
        {/* SECCIÓN 1: Información Profesional */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              👤
            </span>
            Información Profesional
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex items-center gap-6 mb-2">
              <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl">
                👨‍⚕️
              </div>
              <button
                type="button"
                className="bg-white border border-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Cambiar Fotografía
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Nombre Público
              </label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Especialidad Principal
              </label>
              <input
                type="text"
                name="especialidad"
                value={perfil.especialidad}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Biografía (Visible para pacientes)
              </label>
              <textarea
                name="biografia"
                value={perfil.biografia}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Facturación y Consultas */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">
              💳
            </span>
            Facturación y Consultas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Precio por Sesión (USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">$</span>
                </div>
                <input
                  type="number"
                  name="precio"
                  value={perfil.precio}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-gray-900 text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Duración de la Cita
              </label>
              <select
                name="duracion"
                value={perfil.duracion}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
              >
                <option value="30">30 Minutos</option>
                <option value="45">45 Minutos</option>
                <option value="60">60 Minutos (Recomendado)</option>
                <option value="90">90 Minutos</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOTÓN DE GUARDAR */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={guardando}
            className={`font-black py-4 px-10 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${guardando ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 hover:shadow-blue-500/30"}`}
          >
            {guardando ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                Actualizando...
              </>
            ) : (
              "Guardar Configuración"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

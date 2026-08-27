"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function PerfilPacientePage() {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [correo, setCorreo] = useState("");

  // Estado del perfil del paciente
  const [perfil, setPerfil] = useState({
    nombre: "",
    telefono: "",
    fechaNacimiento: "",
    contactoEmergencia: "",
  });

  useEffect(() => {
    // Obtenemos el usuario de la sesión actual
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        setCorreo(user.email);
        const nombrePart = user.email.split("@")[0];
        setPerfil((prev) => ({ ...prev, nombre: nombrePart }));
      }
    };
    obtenerUsuario();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    // Simulamos el guardado en base de datos
    setTimeout(() => {
      setGuardando(false);
      setMensaje("¡Tus datos han sido actualizados exitosamente!");
      setTimeout(() => setMensaje(""), 3000);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Mi Perfil Clínico
        </h1>
        <p className="text-gray-500">
          Mantén tus datos personales y de contacto de emergencia actualizados.
        </p>
      </div>

      {mensaje && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-green-200">
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

      <form onSubmit={handleGuardar} className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : "👤"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Información Personal
              </h2>
              <p className="text-sm text-gray-500">
                Tus datos están protegidos y son confidenciales.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Correo Electrónico (De acceso)
              </label>
              <input
                type="text"
                value={correo}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Teléfono Celular
              </label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                placeholder="Ej: 099 123 4567"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={perfil.fechaNacimiento}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                name="contactoEmergencia"
                value={perfil.contactoEmergencia}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                placeholder="Ej: Mi madre - 098 765 4321"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 px-8 rounded-xl transition shadow-lg flex items-center gap-2"
          >
            {guardando ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

export default function PerfilPacientePage() {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorDiagnostico, setErrorDiagnostico] = useState<string | null>(null);
  const [correo, setCorreo] = useState("");

  // Estado del perfil del paciente
  const [perfil, setPerfil] = useState({
    nombre: "",
    telefono: "",
    fechaNacimiento: "",
    contactoEmergencia: "",
    tipoIdentificacion: "cedula", // Valor por defecto
    identificacion: "",
  });

  useEffect(() => {
    // Obtenemos el usuario de la sesión actual y sus datos reales
    const obtenerUsuario = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user && user.email) {
          setCorreo(user.email);

          const { data: pacienteData, error: dbError } = await supabase
            .from("roles_usuarios")
            .select("*")
            .eq("correo", user.email)
            .single();

          if (dbError) throw dbError;

          if (pacienteData) {
            setPerfil({
              nombre: pacienteData.nombre || user.email.split("@")[0],
              telefono: pacienteData.telefono || "",
              fechaNacimiento: pacienteData.fecha_nacimiento || "",
              contactoEmergencia: pacienteData.contacto_emergencia || "",
              tipoIdentificacion: pacienteData.tipo_identificacion || "cedula",
              identificacion: pacienteData.identificacion || "",
            });
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error al cargar perfil:", error);
        setErrorDiagnostico(error?.message || JSON.stringify(error));
      }
    };
    obtenerUsuario();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");
    setErrorDiagnostico(null);

    // Validación básica SRI: Si pone cédula/RUC, no debería estar vacío.
    if (
      perfil.tipoIdentificacion !== "consumidor_final" &&
      !perfil.identificacion.trim()
    ) {
      setErrorDiagnostico(
        "Debes ingresar un número de identificación para facturación.",
      );
      setGuardando(false);
      return;
    }

    try {
      const fechaParseada =
        perfil.fechaNacimiento.trim() === "" ? null : perfil.fechaNacimiento;

      const { error } = await supabase
        .from("roles_usuarios")
        .update({
          nombre: perfil.nombre,
          telefono: perfil.telefono,
          fecha_nacimiento: fechaParseada,
          contacto_emergencia: perfil.contactoEmergencia,
          tipo_identificacion: perfil.tipoIdentificacion,
          identificacion: perfil.identificacion,
        })
        .eq("correo", correo);

      if (error) throw error;

      setMensaje(
        "¡Tus datos han sido actualizados y guardados en la Base de Datos!",
      );
      setTimeout(() => setMensaje(""), 4000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al guardar:", error);
      const msgError =
        error?.message || error?.details || JSON.stringify(error);
      setErrorDiagnostico(`La base de datos rechazó los cambios: ${msgError}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Mi Perfil Clínico
        </h1>
        <p className="text-slate-500">
          Mantén tus datos personales, información de contacto e identidad
          actualizados para emisión de facturas.
        </p>
      </div>

      {errorDiagnostico && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl font-bold flex flex-col gap-2 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Alerta:</span>
          </div>
          <p className="font-mono text-sm font-medium bg-red-100 p-2 rounded-lg">
            {errorDiagnostico}
          </p>
        </div>
      )}

      {mensaje && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-3 border border-emerald-200 shadow-sm">
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
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : "👤"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Información de Identidad y Facturación
              </h2>
              <p className="text-sm text-slate-500">
                Tus datos están protegidos y son usados estrictamente para
                gestión clínica y tributaria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Correo Electrónico (De acceso)
              </label>
              <input
                type="text"
                value={correo}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nombre Completo (Razón Social)
              </label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Documento
                </label>
                <select
                  name="tipoIdentificacion"
                  value={perfil.tipoIdentificacion}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-sm"
                >
                  <option value="cedula">Cédula</option>
                  <option value="ruc">RUC</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="consumidor_final">C. Final</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Número de Identificación
                </label>
                <input
                  type="text"
                  name="identificacion"
                  value={perfil.identificacion}
                  onChange={handleChange}
                  disabled={perfil.tipoIdentificacion === "consumidor_final"}
                  placeholder={
                    perfil.tipoIdentificacion === "consumidor_final"
                      ? "9999999999"
                      : "Ej: 1712345678"
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Teléfono Celular
              </label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                placeholder="Ej: 099 123 4567"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={perfil.fechaNacimiento}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                name="contactoEmergencia"
                value={perfil.contactoEmergencia}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                placeholder="Ej: Mi madre - 098 765 4321"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-4 px-8 rounded-xl transition shadow-lg flex items-center gap-2"
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

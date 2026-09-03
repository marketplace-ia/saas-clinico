"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SubirVerificacionPage() {
  const [cedula, setCedula] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const manejarSubida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula || !archivo) {
      setMensaje("Por favor, ingresa tu cédula y selecciona un archivo.");
      return;
    }

    setSubiendo(true);
    setMensaje("");

    try {
      // 1. Obtener el usuario actual logueado
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Debes iniciar sesión primero");

      const userId = session.user.id;
      const fileExt = archivo.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;

      // 2. Subir la imagen al Storage de Supabase
      const { error: uploadError } = await supabase.storage
        .from("documentos_verificacion")
        .upload(fileName, archivo);

      if (uploadError) throw uploadError;

      // 3. Obtener el link público de la imagen que acabamos de subir
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("documentos_verificacion")
        .getPublicUrl(fileName);

      // 4. Actualizar el perfil del psicólogo en la base de datos
      const { error: updateError } = await supabase
        .from("perfil_psicologo")
        .update({
          cedula: cedula,
          url_documento: publicUrl,
          estado_verificacion: "pendiente",
        })
        .eq("id", userId); // Actualizamos solo al usuario actual

      if (updateError) throw updateError;

      // ¡Éxito! Lo mandamos a la sala de espera
      router.push("/dashboard-psicologo");
    } catch (error) {
      console.error("Error al subir:", error);
      const mensajeError =
        error instanceof Error
          ? error.message
          : "Hubo un error al enviar tus documentos.";
      setMensaje(mensajeError);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-900">
          Verificación Profesional
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 font-medium px-4 leading-relaxed">
          Como plataforma orientada a profesionales de la salud, operamos bajo
          estrictas normativas de seguridad. Valida tu registro en la SENESCYT
          para certificar tu perfil y acceder a todas las herramientas de tu
          consultorio digital.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={manejarSubida}>
            {/* Campo Cédula */}
            <div>
              <label
                htmlFor="cedula"
                className="block text-sm font-bold text-slate-700"
              >
                Número de Cédula
              </label>
              <div className="mt-2">
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  placeholder="Ej: 1700000000"
                />
              </div>
            </div>

            {/* Campo Archivo */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Captura de Registro SENESCYT
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 transition-colors">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-slate-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Sube un archivo</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={(e) =>
                          setArchivo(e.target.files ? e.target.files[0] : null)
                        }
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    PNG, JPG o PDF hasta 5MB
                  </p>
                  {archivo && (
                    <p className="text-sm font-bold text-emerald-600 mt-2 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                      ✓ {archivo.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {mensaje && (
              <div
                className={`p-4 rounded-xl text-sm font-bold ${mensaje.includes("error") ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}
              >
                {mensaje}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={subiendo}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendo ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando a revisión...
                  </span>
                ) : (
                  "Enviar Documentos"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

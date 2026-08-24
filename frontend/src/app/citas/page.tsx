"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgendarCitaPage() {
  const router = useRouter();
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const horariosDisponibles = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const hoy = new Date().toISOString().split("T")[0];

  const solicitarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        throw new Error(
          "No se pudo verificar tu sesión. Intenta iniciar sesión de nuevo.",
        );

      const nuevaCita = {
        fecha: fecha,
        hora: hora,
        motivo: motivo,
        estado: "pendiente",
        paciente_id: user.id,
      };

      const { error: insertError } = await supabase
        .from("citas")
        .insert([nuevaCita]);

      if (insertError) throw insertError;

      setMensaje({
        tipo: "exito",
        texto:
          "¡Tu solicitud de cita ha sido enviada! El especialista la revisará pronto.",
      });

      setFecha("");
      setHora("");
      setMotivo("");

      setTimeout(() => {
        router.push("/dashboard-paciente");
      }, 3000);
    } catch (error) {
      // CORRECCIÓN TYPESCRIPT APLICADA AQUÍ (Sin usar 'any')
      console.error("Error al agendar:", error);
      if (error instanceof Error) {
        setMensaje({ tipo: "error", texto: error.message });
      } else {
        setMensaje({
          tipo: "error",
          texto:
            "Ocurrió un error al agendar la cita. Por favor intenta de nuevo.",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl">
        <Link
          href="/dashboard-paciente"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition mb-6 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver a mi panel
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* CORRECCIÓN TAILWIND APLICADA AQUÍ (bg-linear-to-r) */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Agendar Nueva Cita</h1>
            <p className="text-blue-100">
              Selecciona la fecha y hora que mejor se adapte a ti.
            </p>
          </div>

          <div className="p-8">
            {mensaje && (
              <div
                className={`p-4 rounded-xl mb-8 font-medium border ${
                  mensaje.tipo === "exito"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {mensaje.texto}
                {mensaje.tipo === "exito" && (
                  <p className="text-sm mt-1 text-green-600 font-normal">
                    Redirigiendo a tu panel...
                  </p>
                )}
              </div>
            )}

            <form onSubmit={solicitarCita} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fecha deseada
                  </label>
                  <input
                    type="date"
                    required
                    min={hoy}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Hora de atención
                  </label>
                  <select
                    required
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-700 bg-white"
                  >
                    <option value="" disabled>
                      Selecciona una hora...
                    </option>
                    {horariosDisponibles.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Motivo de la consulta (Breve)
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej. Terapia individual, manejo de estrés, primera consulta..."
                  className="w-full border border-gray-300 rounded-xl p-3.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-700 resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={cargando || mensaje?.tipo === "exito"}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
                    cargando || mensaje?.tipo === "exito"
                      ? "bg-gray-400 text-white cursor-not-allowed shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {cargando
                    ? "Procesando solicitud..."
                    : "Confirmar Solicitud de Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

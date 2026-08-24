"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

export default function AgendarCitaPacientePage() {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  // Horarios de ejemplo
  const horariosDisponibles = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const { error } = await supabase.from("citas").insert([
        {
          fecha: fecha,
          hora: hora,
          motivo: motivo,
          estado: "pendiente",
        },
      ]);

      if (error) throw error;
      setExito(true);
    } catch (error) {
      // CORRECCIÓN 1: Eliminado el ": any"
      // CORRECCIÓN 2: Validación estricta de TypeScript para el error
      const mensaje =
        error instanceof Error ? error.message : "Error desconocido";
      alert("Hubo un error al agendar la cita. Detalle: " + mensaje);
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="w-full h-full min-h-[80vh] flex items-center justify-center p-8 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            ¡Cita Solicitada!
          </h2>
          <p className="text-gray-500 mb-8">
            Tu solicitud para el <strong>{fecha}</strong> a las{" "}
            <strong>{hora}</strong> ha sido enviada. Nuestra secretaría la
            revisará y confirmará pronto.
          </p>
          <Link
            href="/dashboard-paciente"
            className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm"
          >
            Volver a mi Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8 font-sans max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Agendar Nueva Cita</h1>
        <p className="text-gray-500 mt-1">
          Selecciona la fecha y hora que mejor se adapten a tu disponibilidad.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-blue-50/50">
          <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Detalles de tu sesión
          </h2>
        </div>

        <form onSubmit={handleAgendar} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fecha deseada
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Hora preferida
              </label>
              <select
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-700 bg-white"
              >
                <option value="">Selecciona un horario...</option>
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
              Motivo de la consulta (Opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Ansiedad, problemas de pareja, primera vez..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none text-gray-700"
            ></textarea>
            <p className="text-xs text-gray-400 mt-2">
              Esta información es confidencial y solo la leerá tu especialista.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-4 rounded-xl font-bold text-white transition text-lg shadow-sm ${
                cargando
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
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
  );
}

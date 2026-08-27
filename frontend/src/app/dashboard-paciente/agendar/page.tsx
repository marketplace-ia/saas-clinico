"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function AgendarCitaPage() {
  const router = useRouter();

  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [correoPaciente, setCorreoPaciente] = useState("");

  // Estado del formulario
  const [cita, setCita] = useState({
    psicologo: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  // Obtener el correo del paciente logueado
  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setCorreoPaciente(user.email);
      }
    };
    obtenerUsuario();
  }, []);

  const horasDisponibles = [
    "09:00 AM",
    "10:00 AM",
    "11:30 AM",
    "02:00 PM",
    "03:30 PM",
    "05:00 PM",
  ];

  const handleSeleccionarHora = (hora: string) => {
    setCita({ ...cita, hora });
  };

  const handleConfirmarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    // Validación de seguridad extra: Asegurarnos de que hay un paciente logueado
    if (!correoPaciente) {
      setMensaje({
        tipo: "error",
        texto:
          "Error: No hemos detectado tu sesión de paciente. Intenta recargar la página.",
      });
      setCargando(false);
      return;
    }

    try {
      const { error } = await supabase.from("citas").insert([
        {
          paciente_correo: correoPaciente,
          psicologo: cita.psicologo || "Dr. Asignado Automáticamente",
          fecha: cita.fecha,
          hora: cita.hora,
          motivo: cita.motivo,
          estado: "confirmada",
        },
      ]);

      if (error) throw error;

      setMensaje({
        tipo: "exito",
        texto: "¡Cita confirmada exitosamente! Preparando tu sala...",
      });

      setTimeout(() => {
        router.push("/dashboard-paciente");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { message?: string };
      // AQUÍ ESTÁ LA MAGIA: Ahora veremos el error real de Supabase
      setMensaje({
        tipo: "error",
        texto: `Error de Base de Datos: ${error.message || "Desconocido"}`,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Agendar Nueva Cita
        </h1>
        <p className="text-gray-500">
          Selecciona el especialista, la fecha y el horario que mejor se adapte
          a ti.
        </p>
      </div>

      {/* Indicador de Pasos */}
      <div className="flex items-center gap-4 mb-10">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 1 ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"}`}
        >
          1
        </div>
        <div
          className={`flex-1 h-1 rounded-full ${paso >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 2 ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"}`}
        >
          2
        </div>
        <div
          className={`flex-1 h-1 rounded-full ${paso >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 3 ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-500"}`}
        >
          3
        </div>
      </div>

      {/* Alertas */}
      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl mb-8 font-bold flex items-center gap-3 border ${mensaje.tipo === "exito" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {mensaje.tipo === "exito" ? "🎉" : "⚠️"} {mensaje.texto}
        </div>
      )}

      {/* PASO 1: Especialista y Motivo */}
      {paso === 1 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm animate-in slide-in-from-right-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Detalles de la Consulta
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Especialista (Opcional)
              </label>
              <select
                value={cita.psicologo}
                onChange={(e) =>
                  setCita({ ...cita, psicologo: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">Cualquier especialista disponible</option>
                <option value="Dra. Camila Rojas">
                  Dra. Camila Rojas - Ansiedad y Estrés
                </option>
                <option value="Dr. Esteban">
                  Dr. Esteban - Terapia Cognitivo Conductual
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Motivo de consulta (Breve)
              </label>
              <textarea
                value={cita.motivo}
                onChange={(e) => setCita({ ...cita, motivo: e.target.value })}
                placeholder="Ej: Siento mucha ansiedad por el trabajo últimamente..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 resize-none"
              ></textarea>
            </div>

            <button
              onClick={() => setPaso(2)}
              disabled={cita.motivo.length < 5}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Continuar a Fecha y Hora
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Fecha y Hora */}
      {paso === 2 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm animate-in slide-in-from-right-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Selecciona el Horario
            </h2>
            <button
              onClick={() => setPaso(1)}
              className="text-sm font-bold text-gray-400 hover:text-blue-600 transition"
            >
              ← Volver
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Día de la cita
              </label>
              <input
                type="date"
                value={cita.fecha}
                onChange={(e) => setCita({ ...cita, fecha: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Horas Disponibles
              </label>
              <div className="grid grid-cols-2 gap-3">
                {horasDisponibles.map((hora) => (
                  <button
                    key={hora}
                    onClick={() => handleSeleccionarHora(hora)}
                    className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border ${
                      cita.hora === hora
                        ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-105"
                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => setPaso(3)}
              disabled={!cita.fecha || !cita.hora}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Revisar y Confirmar
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Confirmación */}
      {paso === 3 && (
        <form
          onSubmit={handleConfirmarCita}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-white animate-in slide-in-from-right-4 relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>

          <h2 className="text-2xl font-black mb-6 relative z-10">
            Resumen de tu Cita
          </h2>

          <div className="space-y-6 relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-400 font-medium">Especialista</span>
              <span className="font-bold">
                {cita.psicologo || "Dr. Asignado Automáticamente"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-400 font-medium">Fecha</span>
              <span className="font-bold">{cita.fecha}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-gray-400 font-medium">Hora</span>
              <span className="font-bold text-blue-400">{cita.hora}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Costo de Sesión</span>
              <span className="font-black text-xl text-green-400">$50.00</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8 relative z-10">
            <button
              type="button"
              onClick={() => setPaso(2)}
              className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 font-bold py-4 rounded-xl transition"
            >
              Modificar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] flex justify-center items-center gap-2"
            >
              {cargando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Confirmar Reserva"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

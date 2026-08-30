"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

// Interfaz para los doctores que vienen de la BD
interface Doctor {
  psicologo_id: string;
  nombre_clinica: string;
}

export default function AgendarCitaPage() {
  const router = useRouter();

  const [paso, setPaso] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [pacienteInfo, setPacienteInfo] = useState({
    id: "",
    email: "",
    nombre: "Paciente Web",
  });

  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);

  // AHORA ES UN ESTADO DINÁMICO (Empieza vacío y se llena desde la Base de Datos)
  const [doctoresDisponibles, setDoctoresDisponibles] = useState<Doctor[]>([]);

  const [cita, setCita] = useState({
    psicologo_id: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  // 1. Obtener datos del paciente Y la lista dinámica de doctores
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      // Obtener el paciente actual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setPacienteInfo({
          id: user.id,
          email: user.email || "",
          nombre: user.email
            ? user.email.split("@")[0].charAt(0).toUpperCase() +
              user.email.split("@")[0].slice(1)
            : "Paciente Web",
        });
      }

      // 🚀 MAGIA SAAS: Traer todos los doctores de la base de datos automáticamente
      const { data: clinicas, error } = await supabase
        .from("configuracion_clinica")
        .select("psicologo_id, nombre_clinica");

      if (clinicas && !error) {
        setDoctoresDisponibles(clinicas);
      }
    };

    cargarDatosIniciales();
  }, []);

  const convertirHoraAFormatoDB = (hora12h: string) => {
    const [time, modifier] = hora12h.split(" ");
    const [initialHours, minutes] = time.split(":");

    let hours = initialHours;
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();

    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  useEffect(() => {
    const buscarHorasOcupadas = async () => {
      if (!cita.fecha || !cita.psicologo_id) {
        setHorasOcupadas([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("citas")
          .select("hora_inicio")
          .eq("fecha", cita.fecha)
          .eq("psicologo_id", cita.psicologo_id)
          .neq("estado", "Cancelada");

        if (error) throw error;

        if (data) {
          const horasTomadas = data.map((c) => {
            const h = parseInt(c.hora_inicio.split(":")[0]);
            const ampm = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 || 12;
            return `${h12.toString().padStart(2, "0")}:${c.hora_inicio.split(":")[1]} ${ampm}`;
          });

          setHorasOcupadas(horasTomadas);

          if (horasTomadas.includes(cita.hora)) {
            setCita((prev) => ({ ...prev, hora: "" }));
          }
        }
      } catch (error) {
        console.error("Error al buscar disponibilidad:", error);
      }
    };

    buscarHorasOcupadas();
  }, [cita.fecha, cita.psicologo_id, cita.hora]);

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

    if (!pacienteInfo.id) {
      setMensaje({
        tipo: "error",
        texto: "Error: No hemos detectado tu sesión de paciente.",
      });
      setCargando(false);
      return;
    }

    try {
      const horaInicioDB = convertirHoraAFormatoDB(cita.hora);

      const horaInicioObj = new Date(`2000-01-01T${horaInicioDB}`);
      horaInicioObj.setHours(horaInicioObj.getHours() + 1);
      const horaFinDB = horaInicioObj.toTimeString().split(" ")[0];

      const { error } = await supabase.from("citas").insert([
        {
          psicologo_id: cita.psicologo_id,
          paciente_id: pacienteInfo.id,
          nombre_paciente: pacienteInfo.nombre,
          fecha: cita.fecha,
          hora_inicio: horaInicioDB,
          hora_fin: horaFinDB,
          tipo: "Terapia Individual",
          estado: "Pendiente",
        },
      ]);

      if (error) throw error;

      setMensaje({
        tipo: "exito",
        texto:
          "¡Cita solicitada exitosamente! El especialista debe confirmarla.",
      });

      setTimeout(() => {
        router.push("/dashboard-paciente");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { message?: string };
      setMensaje({
        tipo: "error",
        texto: `Error de Base de Datos: ${error.message || "Desconocido"}`,
      });
    } finally {
      setCargando(false);
    }
  };

  // Obtener el nombre del doctor seleccionado para el resumen (Paso 3)
  const doctorSeleccionado = doctoresDisponibles.find(
    (d) => d.psicologo_id === cita.psicologo_id,
  );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Agendar Nueva Cita
        </h1>
        <p className="text-gray-500">
          Selecciona el especialista, la fecha y el horario que mejor se adapte
          a ti.
        </p>
      </div>

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

      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl mb-8 font-bold flex items-center gap-3 border ${mensaje.tipo === "exito" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {mensaje.tipo === "exito" ? "🎉" : "⚠️"} {mensaje.texto}
        </div>
      )}

      {/* PASO 1 */}
      {paso === 1 && (
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm animate-in slide-in-from-right-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Detalles de la Consulta
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Especialista
              </label>
              <select
                value={cita.psicologo_id}
                onChange={(e) =>
                  setCita({ ...cita, psicologo_id: e.target.value })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              >
                <option value="">Selecciona un especialista</option>
                {doctoresDisponibles.map((doc) => (
                  <option key={doc.psicologo_id} value={doc.psicologo_id}>
                    {doc.nombre_clinica}
                  </option>
                ))}
              </select>
              {doctoresDisponibles.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  No hay especialistas configurados aún en la plataforma.
                </p>
              )}
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
              disabled={cita.motivo.length < 5 || !cita.psicologo_id}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Continuar a Fecha y Hora
            </button>
          </div>
        </div>
      )}

      {/* PASO 2 */}
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
                {horasDisponibles.map((hora) => {
                  const estaOcupada = horasOcupadas.includes(hora);
                  return (
                    <button
                      key={hora}
                      onClick={() => handleSeleccionarHora(hora)}
                      disabled={estaOcupada}
                      className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border flex flex-col items-center justify-center ${
                        estaOcupada
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                          : cita.hora === hora
                            ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-105"
                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <span>{hora}</span>
                      {estaOcupada && (
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-wider mt-0.5">
                          Ocupado
                        </span>
                      )}
                    </button>
                  );
                })}
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

      {/* PASO 3 */}
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
              <span className="font-bold text-right pl-4">
                {doctorSeleccionado?.nombre_clinica || "No especificado"}
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

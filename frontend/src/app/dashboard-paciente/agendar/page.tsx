"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

interface Doctor {
  psicologo_id: string;
  nombre_comercial: string;
  precio_consulta: number;
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
  const [doctoresDisponibles, setDoctoresDisponibles] = useState<Doctor[]>([]);

  const [cita, setCita] = useState({
    psicologo_id: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setPacienteInfo({
          id: user.id,
          email: user.email || "",
          nombre: user.email
            ? user.email.split("@")[0].toUpperCase()
            : "Paciente",
        });
      }

      const { data: perfiles, error } = await supabase
        .from("perfil_psicologo")
        .select("psicologo_id, nombre_comercial, precio_consulta");

      if (perfiles && !error) setDoctoresDisponibles(perfiles);
    };

    cargarDatosIniciales();
  }, []);

  const convertirHoraAFormatoDB = (hora12h: string) => {
    const [time, modifier] = hora12h.split(" ");
    const [initialHours, minutes] = time.split(":");
    let hours = initialHours;
    if (hours === "12") hours = "00";
    if (modifier === "PM" && hours !== "12")
      hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, "0")}:${minutes}:00`;
  };

  useEffect(() => {
    const buscarHorasOcupadas = async () => {
      if (!cita.fecha || !cita.psicologo_id) {
        setHorasOcupadas([]);
        return;
      }

      // 🟢 CORRECCIÓN VISUAL: BuscarCualquier cita que no esté formalmente cancelada
      const { data, error } = await supabase
        .from("citas")
        .select("hora_inicio")
        .eq("fecha", cita.fecha)
        .eq("psicologo_id", cita.psicologo_id)
        .neq("estado", "cancelled")
        .neq("estado", "Cancelada")
        .neq("estado", "rejected")
        .neq("estado", "rechazado");

      if (data && !error) {
        const horasTomadas = data.map((c) => {
          const [horaStr, minutoStr] = c.hora_inicio.split(":");
          const h = parseInt(horaStr);
          const ampm = h >= 12 ? "PM" : "AM";
          const h12 = h % 12 || 12;
          return `${h12.toString().padStart(2, "0")}:${minutoStr} ${ampm}`;
        });

        setHorasOcupadas(horasTomadas);
        // Si el paciente tenía seleccionada una hora que acaba de ser ocupada, la deseleccionamos
        if (horasTomadas.includes(cita.hora))
          setCita((prev) => ({ ...prev, hora: "" }));
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
    "06:30 PM",
    "08:00 PM",
    "09:00 PM",
    "10:00 PM",
  ];

  const handleConfirmarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const horaInicioDB = convertirHoraAFormatoDB(cita.hora);

      const res = await fetch("/api/citas/agendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psicologo_id: cita.psicologo_id,
          paciente_correo: pacienteInfo.email,
          paciente_nombre: pacienteInfo.nombre,
          fecha: cita.fecha,
          hora_inicio: horaInicioDB,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMensaje({
        tipo: "exito",
        texto: "¡Cita reservada y factura generada exitosamente!",
      });

      setTimeout(() => {
        router.push("/dashboard-paciente/pagos");
      }, 2000);
    } catch (error: unknown) {
      const msj = error instanceof Error ? error.message : "Error desconocido";
      // Si salta el error 409 (Dobles reservas), lo mostramos en rojo y forzamos a elegir otra hora
      setMensaje({ tipo: "error", texto: msj });
      setCita((prev) => ({ ...prev, hora: "" }));
      setPaso(2);
    } finally {
      setCargando(false);
    }
  };

  const doctorSeleccionado = doctoresDisponibles.find(
    (d) => d.psicologo_id === cita.psicologo_id,
  );

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Agendar Nueva Cita
        </h1>
        <p className="text-slate-500">
          Selecciona el especialista, la fecha y el horario que mejor se adapte
          a ti.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-10">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 1 ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
        >
          1
        </div>
        <div
          className={`flex-1 h-1 rounded-full ${paso >= 2 ? "bg-indigo-600" : "bg-slate-200"}`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 2 ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
        >
          2
        </div>
        <div
          className={`flex-1 h-1 rounded-full ${paso >= 3 ? "bg-indigo-600" : "bg-slate-200"}`}
        ></div>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${paso >= 3 ? "bg-indigo-600 text-white shadow-md" : "bg-slate-200 text-slate-500"}`}
        >
          3
        </div>
      </div>

      {mensaje.texto && (
        <div
          className={`p-4 rounded-xl mb-8 font-bold flex items-center gap-3 border ${mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
        >
          {mensaje.tipo === "exito" ? "🎉" : "⚠️"} {mensaje.texto}
        </div>
      )}

      {paso === 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Detalles de la Consulta
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Especialista
              </label>
              <select
                value={cita.psicologo_id}
                onChange={(e) =>
                  setCita({ ...cita, psicologo_id: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              >
                <option value="">Selecciona un especialista</option>
                {doctoresDisponibles.map((doc) => (
                  <option key={doc.psicologo_id} value={doc.psicologo_id}>
                    {doc.nombre_comercial || "Especialista sin nombre"} - $
                    {(doc.precio_consulta || 50).toFixed(2)} / sesión
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Motivo de consulta (Breve)
              </label>
              <textarea
                value={cita.motivo}
                onChange={(e) => setCita({ ...cita, motivo: e.target.value })}
                placeholder="Ej: Siento mucha ansiedad..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 resize-none"
              ></textarea>
            </div>
            <button
              onClick={() => setPaso(2)}
              disabled={cita.motivo.length < 5 || !cita.psicologo_id}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Continuar a Fecha y Hora
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Selecciona el Horario
            </h2>
            <button
              onClick={() => setPaso(1)}
              className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition"
            >
              ← Volver
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Día de la cita
              </label>
              <input
                type="date"
                value={cita.fecha}
                onChange={(e) => setCita({ ...cita, fecha: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Horas Disponibles
              </label>
              <div className="grid grid-cols-2 gap-3">
                {horasDisponibles.map((hora) => {
                  const estaOcupada = horasOcupadas.includes(hora);
                  return (
                    <button
                      key={hora}
                      onClick={() => setCita({ ...cita, hora })}
                      disabled={estaOcupada}
                      className={`py-3 px-2 rounded-xl font-bold text-sm transition-all border flex flex-col items-center justify-center ${estaOcupada ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70" : cita.hora === hora ? "bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition shadow-md"
            >
              Revisar y Confirmar
            </button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <form
          onSubmit={handleConfirmarCita}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
          <h2 className="text-2xl font-black mb-6 relative z-10">
            Resumen de tu Cita
          </h2>
          <div className="space-y-6 relative z-10 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-slate-400 font-medium">Especialista</span>
              <span className="font-bold text-right pl-4">
                {doctorSeleccionado?.nombre_comercial || "No especificado"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-slate-400 font-medium">Fecha y Hora</span>
              <span className="font-bold text-indigo-400">
                {cita.fecha} | {cita.hora}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">
                Costo de Sesión
              </span>
              <span className="font-black text-xl text-emerald-400">
                ${(doctorSeleccionado?.precio_consulta || 50).toFixed(2)}
              </span>
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
              className="flex-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(79,70,229,0.4)] flex justify-center items-center gap-2"
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

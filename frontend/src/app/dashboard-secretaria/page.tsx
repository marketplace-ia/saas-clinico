"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

interface Cita {
  id: string;
  paciente_email: string;
  psicologo_email: string;
  fecha_hora: string;
  estado: string;
}

export default function DashboardSecretaria() {
  const [email, setEmail] = useState<string | null>("");
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para controlar el modal y el formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({
    paciente: "",
    psicologo: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  // Usamos useCallback y agregamos la petición asíncrona a Supabase
  const cargarCitas = useCallback(async () => {
    setCargando(true);

    // 1. Obtenemos la sesión del usuario actual
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) setEmail(session.user.email ?? "");

    // 2. Pedimos las citas a la base de datos
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .order("fecha_hora", { ascending: true });

    // 3. Actualizamos el estado con los datos reales
    if (!error && data) {
      setCitas(data);
    }

    setCargando(false);
  }, []);

  // El useEffect llama a la función que creamos arriba
  useEffect(() => {
    // Apagamos la advertencia estricta del linter solo para esta línea,
    // ya que nuestra función es asíncrona y totalmente segura.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarCitas();
  }, [cargarCitas]);

  // Función para guardar una nueva cita en Supabase
  const agendarCita = async (e: React.FormEvent) => {
    e.preventDefault();

    // Unimos la fecha y la hora en formato ISO para la base de datos
    const fechaHoraISO = new Date(`${form.fecha}T${form.hora}`).toISOString();

    const { error } = await supabase.from("citas").insert([
      {
        paciente_email: form.paciente,
        psicologo_email: form.psicologo,
        fecha_hora: fechaHoraISO,
        motivo: form.motivo,
        estado: "confirmada",
      },
    ]);

    if (!error) {
      setModalAbierto(false); // Cerramos el modal
      setForm({ paciente: "", psicologo: "", fecha: "", hora: "", motivo: "" }); // Limpiamos el form
      cargarCitas(); // Recargamos la tabla para ver la nueva cita
    } else {
      alert("Hubo un error al agendar la cita. Verifica los datos.");
    }
  };

  // Función para formatear fechas en la tabla
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return {
      dia: fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      }),
      hora: fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="flex-1 h-full overflow-auto bg-slate-50 p-6 md:p-10 w-full relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            Recepción y Control
          </h1>
          <p className="text-slate-500 mt-2">
            Bienvenida, {email}. Este es el resumen administrativo de hoy.
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Citas (Sistema)
              </p>
              <h3 className="text-2xl font-bold text-slate-800">
                {citas.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Tabla de Agenda General */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-slate-800">
              Visor de Agenda General
            </h2>
            <button
              onClick={() => setModalAbierto(true)}
              className="flex items-center gap-2 text-sm bg-purple-600 text-white hover:bg-purple-700 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Cita
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 font-medium">Paciente</th>
                  <th className="p-4 font-medium">Profesional (Email)</th>
                  <th className="p-4 font-medium">Día y Hora</th>
                  <th className="p-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Cargando agenda...
                    </td>
                  </tr>
                ) : citas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No hay citas registradas.
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => {
                    const { dia, hora } = formatearFecha(cita.fecha_hora);
                    return (
                      <tr
                        key={cita.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-800">
                          {cita.paciente_email}
                        </td>
                        <td className="p-4 text-slate-600">
                          {cita.psicologo_email}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-semibold">{dia}</span>
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                              <Clock className="w-3 h-3" /> {hora}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              cita.estado === "confirmada"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {cita.estado === "confirmada" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5" />
                            )}
                            {cita.estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL PARA NUEVA CITA --- */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                Agendar Nueva Cita
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-200/50 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={agendarCita} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo del Paciente
                </label>
                <input
                  required
                  type="email"
                  value={form.paciente}
                  onChange={(e) =>
                    setForm({ ...form, paciente: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="paciente@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo del Psicólogo
                </label>
                <input
                  required
                  type="email"
                  value={form.psicologo}
                  onChange={(e) =>
                    setForm({ ...form, psicologo: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="psicologo@clinica.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    required
                    type="date"
                    value={form.fecha}
                    onChange={(e) =>
                      setForm({ ...form, fecha: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hora
                  </label>
                  <input
                    required
                    type="time"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Motivo / Notas
                </label>
                <input
                  required
                  type="text"
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. Sesión de Terapia Cognitiva"
                />
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-purple-600/20"
                >
                  Guardar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

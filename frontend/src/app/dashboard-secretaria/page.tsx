"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, Calendar, Plus, Clock } from "lucide-react";

// Inicializamos Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaz para definir la forma exacta de los datos
interface CitaManual {
  id?: string;
  paciente_correo?: string;
  psicologo_correo?: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado?: string;
}

export default function DashboardSecretariaResumen() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  // SOLUCIÓN: Reemplazamos 'any' por nuestra interfaz 'CitaManual'
  const [citasRecientes, setCitasRecientes] = useState<CitaManual[]>([]);

  const [formulario, setFormulario] = useState({
    paciente_correo: "",
    psicologo_correo: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  useEffect(() => {
    const cargarCitas = async () => {
      const { data } = await supabase
        .from("citas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Le decimos a TypeScript que confíe en que los datos tienen esta forma
      if (data) setCitasRecientes(data as CitaManual[]);
    };
    cargarCitas();
  }, []);

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const agendarCitaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const { data, error } = await supabase
      .from("citas")
      .insert([
        {
          paciente_correo: formulario.paciente_correo,
          psicologo_correo: formulario.psicologo_correo,
          fecha: formulario.fecha,
          hora: formulario.hora,
          motivo: formulario.motivo,
          estado: "confirmada",
        },
      ])
      .select();

    if (error) {
      alert(
        "Hubo un error al agendar la cita. Verifica los datos.\nDetalle: " +
          error.message,
      );
      console.error(error);
    } else if (data) {
      alert("¡Cita agendada con éxito!");
      setMostrarModal(false);
      setFormulario({
        paciente_correo: "",
        psicologo_correo: "",
        fecha: "",
        hora: "",
        motivo: "",
      });
      setCitasRecientes([data[0] as CitaManual, ...citasRecientes]);
    }

    setCargando(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Encabezado y Botón de Acción */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control General</h1>
          <p className="text-slate-500 mt-1">Panel administrativo de Lumina.</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* Widgets Estadísticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Pacientes Activos
            </p>
            <p className="text-2xl font-bold text-slate-900">124</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl">
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Citas Hoy</p>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-xl">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Pendientes de Pago
            </p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
        </div>
      </div>

      {/* Modal Funcional */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                Agendar Nueva Cita
              </h2>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form
              onSubmit={agendarCitaManual}
              className="p-6 space-y-4 bg-slate-50"
            >
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Correo del Paciente
                </label>
                <input
                  type="email"
                  name="paciente_correo"
                  required
                  placeholder="paciente12@gmail.com"
                  value={formulario.paciente_correo}
                  onChange={manejarCambio}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Correo del Psicólogo
                </label>
                <input
                  type="email"
                  name="psicologo_correo"
                  required
                  placeholder="psicologo@Lumina.com"
                  value={formulario.psicologo_correo}
                  onChange={manejarCambio}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    required
                    value={formulario.fecha}
                    onChange={manejarCambio}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    name="hora"
                    required
                    value={formulario.hora}
                    onChange={manejarCambio}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Motivo / Notas
                </label>
                <textarea
                  name="motivo"
                  required
                  value={formulario.motivo}
                  onChange={manejarCambio}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 bg-white"
                  placeholder="sesion individual"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="bg-purple-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-900 transition-colors disabled:opacity-70"
                >
                  {cargando ? "Guardando..." : "Guardar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializamos Supabase de la forma más directa con la librería principal
// Asegúrate de que en tu archivo .env.local tus variables se llamen exactamente así
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Definimos la estructura exacta de nuestra base de datos
interface Cita {
  id?: string;
  motivo: string;
  fecha: string;
  hora: string;
  notas: string;
  estado?: string;
}

export default function CitasPaciente() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  const [citas, setCitas] = useState<Cita[]>([]);
  const [formulario, setFormulario] = useState<Cita>({
    motivo: "",
    fecha: "",
    hora: "",
    notas: "",
  });

  // Efecto para cargar las citas desde Supabase apenas abre la página
  useEffect(() => {
    const obtenerCitas = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("citas")
          .select("*")
          .eq("paciente_id", user.id)
          .order("fecha", { ascending: true }); // Ordena por fecha

        if (error) {
          console.error("Error al cargar las citas:", error.message);
        } else if (data) {
          setCitas(data);
        }
      }
      setCargandoCitas(false);
    };

    obtenerCitas();
  }, []);

  // Manejar lo que escribe el usuario
  const manejarCambio = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // Guardar la cita REAL en la base de datos
  const guardarCita = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    // 1. Verificamos quién es el paciente logueado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión para agendar una cita.");
      setCargando(false);
      return;
    }

    // 2. Preparamos el paquete de datos
    const nuevaCita = {
      paciente_id: user.id,
      motivo: formulario.motivo,
      fecha: formulario.fecha,
      hora: formulario.hora,
      notas: formulario.notas,
    };

    // 3. Lo enviamos a Supabase
    const { data, error } = await supabase
      .from("citas")
      .insert([nuevaCita])
      .select();

    if (error) {
      alert("Hubo un error al guardar: " + error.message);
      console.error(error);
    } else if (data) {
      // 4. Si hay éxito, actualizamos la pantalla con la cita real de la base de datos
      setCitas([...citas, data[0]]);
      setMostrarFormulario(false);
      setFormulario({ motivo: "", fecha: "", hora: "", notas: "" });
    }

    setCargando(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative h-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Citas</h1>
          <p className="text-slate-500 mt-1">
            Gestiona tus próximas sesiones y tu historial de consultas.
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Agendar Nueva Cita
        </button>
      </div>

      {/* Pantalla de Carga Inicial */}
      {cargandoCitas ? (
        <div className="flex justify-center items-center py-20">
          <span className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : citas.length === 0 ? (
        /* Si NO hay citas, mostramos el mensaje de vacío */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in duration-500">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-50 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Aún no tienes citas programadas
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Parece que tu agenda está libre. Cuando programes una sesión con uno
            de nuestros especialistas, aparecerá aquí.
          </p>
        </div>
      ) : (
        /* Si SÍ hay citas, mostramos las tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {citas.map((cita) => (
            <div
              key={cita.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {cita.estado || "Confirmada"}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 capitalize mb-1">
                {cita.motivo.replace("_", " ")}
              </h3>
              <div className="text-slate-500 text-sm flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
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
                  {cita.fecha}
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {cita.hora}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal del Formulario para Agendar */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                Agendar Nueva Sesión
              </h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200"
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

            <form onSubmit={guardarCita} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Especialidad / Motivo
                </label>
                <select
                  name="motivo"
                  required
                  value={formulario.motivo}
                  onChange={manejarCambio}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-slate-700"
                >
                  <option value="">Selecciona un motivo...</option>
                  <option value="terapia_individual">Terapia Individual</option>
                  <option value="terapia_pareja">Terapia de Pareja</option>
                  <option value="orientacion">Orientación Vocacional</option>
                  <option value="ansiedad_estres">
                    Manejo de Ansiedad/Estrés
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    required
                    value={formulario.fecha}
                    onChange={manejarCambio}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    name="hora"
                    required
                    value={formulario.hora}
                    onChange={manejarCambio}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  name="notas"
                  value={formulario.notas}
                  onChange={manejarCambio}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400 text-slate-700"
                  placeholder="¿Hay algo que debamos saber antes de la sesión?"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 flex justify-center items-center"
                >
                  {cargando ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    "Confirmar Cita"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

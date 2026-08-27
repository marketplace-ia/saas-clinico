"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

interface Nota {
  id: string;
  fecha: string;
  contenido: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<string[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<
    string | null
  >(null);

  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [nombreDoctor, setNombreDoctor] = useState("");

  // 1. Cargar la lista de pacientes únicos que han tenido citas con este doctor
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) return;

      const doctor = user.email.split("@")[0];
      setNombreDoctor(doctor);

      // Buscamos todas las citas de este doctor para saber quiénes son sus pacientes
      const { data: citas } = await supabase
        .from("citas")
        .select("paciente_correo")
        .eq(
          "psicologo",
          "Dr. " + doctor.charAt(0).toUpperCase() + doctor.slice(1),
        ); // Ajuste simple de nombre

      if (citas) {
        // Filtramos para que no salgan correos repetidos
        const unicos = Array.from(new Set(citas.map((c) => c.paciente_correo)));
        setPacientes(unicos);
      }
    };

    cargarDatosIniciales();
  }, []);

  // 2. Cargar el historial cuando seleccionamos un paciente
  useEffect(() => {
    const cargarNotas = async () => {
      if (!pacienteSeleccionado) return;

      const { data } = await supabase
        .from("notas_clinicas")
        .select("*")
        .eq("paciente_correo", pacienteSeleccionado)
        .order("created_at", { ascending: false });

      if (data) setNotas(data);
    };

    cargarNotas();
  }, [pacienteSeleccionado]);

  // 3. Guardar una nueva nota
  const handleGuardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim() || !pacienteSeleccionado) return;

    setGuardando(true);
    const fechaHoy = new Date().toISOString().split("T")[0];

    try {
      const { data, error } = await supabase
        .from("notas_clinicas")
        .insert([
          {
            psicologo: nombreDoctor,
            paciente_correo: pacienteSeleccionado,
            fecha: fechaHoy,
            contenido: nuevaNota,
          },
        ])
        .select();

      if (error) throw error;

      // Agregamos la nota a la pantalla sin tener que recargar
      if (data) {
        setNotas([data[0], ...notas]);
        setNuevaNota("");
      }
    } catch (error) {
      console.error("Error al guardar nota:", error);
      alert("Hubo un error al guardar la nota clínica.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 min-h-[80vh]">
      {/* COLUMNA IZQUIERDA: Lista de Pacientes */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Mis Pacientes
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Selecciona un paciente para ver o agregar notas a su expediente.
          </p>
        </div>

        {/* CORRECCIÓN 1: max-h-[600px] cambiado por max-h-150 */}
        <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm flex-1 max-h-150 overflow-y-auto">
          {pacientes.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm">
              Aún no tienes pacientes registrados en tu agenda.
            </div>
          ) : (
            <div className="space-y-2">
              {pacientes.map((correo, index) => {
                const nombreAmigable = correo.split("@")[0];
                const seleccionado = pacienteSeleccionado === correo;

                return (
                  <button
                    key={index}
                    onClick={() => setPacienteSeleccionado(correo)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 ${
                      seleccionado
                        ? "bg-blue-600 text-white shadow-md transform scale-[1.02]"
                        : "hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${seleccionado ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}
                    >
                      {nombreAmigable.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold truncate">{nombreAmigable}</p>
                      <p
                        className={`text-xs truncate ${seleccionado ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {correo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Expediente Clínico */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {!pacienteSeleccionado ? (
          <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <svg
              className="w-16 h-16 mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <p className="font-bold text-lg text-gray-500">
              Expediente Clínico
            </p>
            <p className="text-sm mt-2 max-w-xs">
              Selecciona un paciente en la lista de la izquierda para abrir su
              historial.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header del Paciente */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black">
                  {pacienteSeleccionado.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Historial de {pacienteSeleccionado.split("@")[0]}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">
                    Confidencialidad Médico-Paciente
                  </p>
                </div>
              </div>
            </div>

            {/* Redactar Nueva Nota */}
            <form
              onSubmit={handleGuardarNota}
              className="bg-blue-900 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>

              <h3 className="font-bold mb-4 flex items-center gap-2">
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  ></path>
                </svg>
                Redactar Nueva Nota Clínica
              </h3>

              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Escribe aquí el análisis de la sesión, progreso, o diagnóstico..."
                rows={4}
                className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none font-medium text-sm mb-4"
              ></textarea>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={guardando || !nuevaNota.trim()}
                  className="bg-blue-500 hover:bg-blue-400 disabled:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 text-sm"
                >
                  {guardando ? "Guardando..." : "Guardar en Expediente"}
                </button>
              </div>
            </form>

            {/* Historial de Notas Previas */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex-1">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                Historial de Sesiones
              </h3>

              <div className="space-y-6">
                {notas.length === 0 ? (
                  <p className="text-gray-400 text-sm italic text-center py-4">
                    No hay notas previas para este paciente.
                  </p>
                ) : (
                  notas.map((nota) => (
                    <div
                      key={nota.id}
                      className="relative pl-6 border-l-2 border-blue-100 pb-2"
                    >
                      {/* CORRECCIÓN 2: -left-[7px] cambiado por -left-1.75 */}
                      <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-1.75 top-1 shadow-[0_0_0_4px_white]"></div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                        {nota.fecha}
                      </p>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                          {nota.contenido}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

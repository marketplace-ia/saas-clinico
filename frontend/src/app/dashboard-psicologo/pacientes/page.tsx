"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Paciente {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  estado: string;
  creado_en: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
  });

  const cargarPacientes = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("nombre_completo", { ascending: true });

      if (error) throw error;
      if (data) setPacientes(data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => await cargarPacientes();
    inicializar();
  }, [cargarPacientes]);

  const guardarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from("pacientes").insert([
        {
          psicologo_id: session.user.id,
          nombre_completo: nuevoPaciente.nombre_completo,
          email: nuevoPaciente.email || null,
          telefono: nuevoPaciente.telefono || null,
          fecha_nacimiento: nuevoPaciente.fecha_nacimiento || null,
          estado: "Activo",
        },
      ]);

      if (error) throw error;

      setNuevoPaciente({
        nombre_completo: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
      });
      setModalAbierto(false);
      cargarPacientes();
    } catch (error) {
      console.error("Error al guardar paciente:", error);
      alert("Hubo un error al registrar al paciente.");
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar pacientes en tiempo real basados en la búsqueda
  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Directorio de Pacientes
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona los perfiles y datos de contacto de tus clientes.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Registrar Paciente
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar paciente por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* LISTA DE PACIENTES */}
      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : pacientesFiltrados.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center mt-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No se encontraron pacientes
          </h3>
          <p className="text-slate-500 max-w-sm">
            No tienes pacientes registrados aún, o la búsqueda no arrojó
            resultados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pacientesFiltrados.map((paciente) => (
            <div
              key={paciente.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xl font-black">
                  {paciente.nombre_completo.charAt(0).toUpperCase()}
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${paciente.estado === "Activo" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {paciente.estado}
                </span>
              </div>

              <div>
                <h3 className="font-black text-xl text-slate-900 mb-3">
                  {paciente.nombre_completo}
                </h3>

                <div className="space-y-2">
                  {paciente.telefono && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {paciente.telefono}
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="truncate">{paciente.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">
                  Ingreso:{" "}
                  {new Date(paciente.creado_en).toLocaleDateString("es-ES", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button className="text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Ver Ficha{" "}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL REGISTRAR PACIENTE */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Registrar Paciente
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={guardarPaciente} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoPaciente.nombre_completo}
                  onChange={(e) =>
                    setNuevoPaciente({
                      ...nuevoPaciente,
                      nombre_completo: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={nuevoPaciente.telefono}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                    placeholder="099 999 9999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={nuevoPaciente.fecha_nacimiento}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        fecha_nacimiento: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={nuevoPaciente.email}
                  onChange={(e) =>
                    setNuevoPaciente({
                      ...nuevoPaciente,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900"
                  placeholder="juan@correo.com"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardando}
                  className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Guardar Paciente"
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

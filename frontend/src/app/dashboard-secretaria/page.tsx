"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase"; // Conexión oficial
import { Users, Calendar, Plus, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

interface CitaManual {
  id: string;
  paciente_nombre: string;
  fecha: string;
  hora_inicio: string;
  motivo: string;
  estado: string;
}

export default function DashboardSecretariaResumen() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [psicologoId, setPsicologoId] = useState<string | null>(null); // El ID del jefe
  const [citasRecientes, setCitasRecientes] = useState<CitaManual[]>([]);
  const [metricas, setMetricas] = useState({ pacientes: 0, citasHoy: 0 });

  const [formulario, setFormulario] = useState({
    paciente_nombre: "",
    fecha: "",
    hora_inicio: "",
    motivo: "",
  });

  useEffect(() => {
    const inicializarSecretaria = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const miUUID = session.user.id; // UUID de la secretaria logueada

        // 1. 🟢 CONEXIÓN EXACTA A TU BASE DE DATOS: Buscamos al jefe en perfil_secretaria
        const { data: perfilData, error: perfilError } = await supabase
          .from("perfil_secretaria")
          .select("psicologo_id")
          .eq("id", miUUID)
          .maybeSingle();

        if (perfilError || !perfilData?.psicologo_id) {
          console.error("Esta secretaria no tiene un psicólogo asignado.");
          setCargando(false);
          return;
        }

        const idJefe = perfilData.psicologo_id;
        setPsicologoId(idJefe);

        // 2. Traemos las Citas RECIENTES solo de ESE psicólogo
        const { data: citasData } = await supabase
          .from("citas")
          .select("id, paciente_nombre, fecha, hora_inicio, motivo, estado")
          .eq("psicologo_id", idJefe)
          .order("fecha", { ascending: false })
          .limit(5);

        if (citasData) setCitasRecientes(citasData);

        // 3. Calculamos métricas de ESE psicólogo (Citas del día)
        const hoy = new Date().toISOString().split("T")[0];
        const { count: citasHoyCount } = await supabase
          .from("citas")
          .select("id", { count: "exact", head: true })
          .eq("psicologo_id", idJefe)
          .eq("fecha", hoy);

        setMetricas({
          pacientes: 124, // Para conectarlo real, harías un count a la tabla de pacientes con eq("psicologo_id", idJefe)
          citasHoy: citasHoyCount || 0,
        });
      } catch (error) {
        console.error("Error iniciando portal de secretaría:", error);
      } finally {
        setCargando(false);
      }
    };

    inicializarSecretaria();
  }, []);

  const manejarCambio = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const agendarCitaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psicologoId)
      return alert("Acceso denegado: No estás vinculada a ningún consultorio.");

    setCargando(true);

    const { data, error } = await supabase
      .from("citas")
      .insert([
        {
          psicologo_id: psicologoId, // 🟢 La cita se agenda automáticamente a la agenda de su jefe
          paciente_nombre: formulario.paciente_nombre,
          fecha: formulario.fecha,
          hora_inicio: formulario.hora_inicio,
          motivo: formulario.motivo,
          estado: "confirmada",
          creado_por_secretaria: true,
        },
      ])
      .select();

    if (error) {
      alert("Hubo un error al agendar la cita.\nDetalle: " + error.message);
    } else if (data) {
      alert("¡Cita agendada con éxito en el calendario del doctor!");
      setMostrarModal(false);
      setFormulario({
        paciente_nombre: "",
        fecha: "",
        hora_inicio: "",
        motivo: "",
      });
      setCitasRecientes([data[0] as CitaManual, ...citasRecientes]);
    }
    setCargando(false);
  };

  if (cargando)
    return (
      <div className="p-10 flex justify-center text-purple-600 font-bold">
        Cargando base de datos de la clínica...
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-y-auto">
      {!psicologoId && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-6 border border-red-200 shadow-sm">
          🚨 Aviso del Sistema: Tu cuenta de secretaria aún no ha sido asignada
          a ningún consultorio o psicólogo. No podrás agendar citas hasta que el
          administrador te asigne uno.
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Recepción General
          </h1>
          <p className="text-slate-500 mt-1">
            Panel administrativo de citas y pagos de tu clínica.
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          disabled={!psicologoId}
          className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Agendar Rápido
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pacientes</p>
            <p className="text-2xl font-bold text-slate-900">
              {metricas.pacientes}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl">
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Citas Hoy</p>
            <p className="text-2xl font-bold text-slate-900">
              {metricas.citasHoy}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard-secretaria/recaudacion"
          className="bg-white hover:bg-amber-50/50 transition-colors p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group"
        >
          <div className="bg-amber-50 group-hover:bg-amber-100 transition-colors p-4 rounded-xl">
            <CheckCircle className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Auditar Pagos</p>
            <p className="text-sm font-bold text-amber-600 mt-1">
              Ir a Recaudación ➔
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard-secretaria/facturacion"
          className="bg-white hover:bg-purple-50/50 transition-colors p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group"
        >
          <div className="bg-purple-50 group-hover:bg-purple-100 transition-colors p-4 rounded-xl">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Comprobantes</p>
            <p className="text-sm font-bold text-purple-600 mt-1">
              Ir a Facturación ➔
            </p>
          </div>
        </Link>
      </div>

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
                <label className="block text-sm text-slate-600 mb-1 font-bold">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  name="paciente_nombre"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={formulario.paciente_nombre}
                  onChange={manejarCambio}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1 font-bold">
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
                  <label className="block text-sm text-slate-600 mb-1 font-bold">
                    Hora
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    required
                    value={formulario.hora_inicio}
                    onChange={manejarCambio}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none text-slate-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1 font-bold">
                  Motivo / Notas
                </label>
                <textarea
                  name="motivo"
                  required
                  placeholder="Primera sesión, ansiedad..."
                  value={formulario.motivo}
                  onChange={manejarCambio}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-700 bg-white"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="text-slate-500 hover:text-slate-700 font-bold px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="bg-purple-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-900 transition-colors disabled:opacity-70"
                >
                  {cargando ? "Agendando..." : "Confirmar Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Paciente {
  id: string;
  nombres?: string | null;
  apellidos?: string | null;
  nombre_completo?: string | null;
  email?: string | null;
  telefono?: string | null;
  identificacion?: string | null;
  creado_el: string;
  fecha_nacimiento?: string | null;
}

type SubResponse = {
  estado: string;
  plan_id: string;
  planes: { nombre: string } | { nombre: string }[] | null;
};

export default function PacientesPage() {
  const router = useRouter();

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: "",
    apellidos: "",
    identificacion: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
  });

  const [mostrarPaywall, setMostrarPaywall] = useState(false);
  const [planActual, setPlanActual] = useState("Gratuito");
  const LIMITE_ESENCIAL = 50;

  const cargarPacientes = useCallback(async () => {
    setCargando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: dataPacientes, error: errPacientes } = await supabase
        .from("pacientes")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("apellidos", { ascending: true });

      if (errPacientes) throw errPacientes;

      if (dataPacientes) {
        setPacientes(dataPacientes as Paciente[]);
      }

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .maybeSingle();

      if (tu) {
        const { data: sub } = await supabase
          .from("tenant_subscriptions")
          .select("estado, plan_id, planes ( nombre )")
          .eq("tenant_id", tu.tenant_id)
          .maybeSingle();

        let nombreDelPlan = "Gratuito";

        if (sub && (sub.estado === "active" || sub.estado === "confirmado")) {
          const suscripcionData = sub as unknown as SubResponse;
          const dataPlanes = suscripcionData.planes;

          if (Array.isArray(dataPlanes)) {
            nombreDelPlan = dataPlanes[0]?.nombre || "Esencial";
          } else if (dataPlanes && typeof dataPlanes === "object") {
            nombreDelPlan = dataPlanes.nombre || "Esencial";
          }
        }

        setPlanActual(nombreDelPlan);
      }
    } catch (error: unknown) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await cargarPacientes();
    };
    inicializar();
  }, [cargarPacientes]);

  useEffect(() => {
    const manejarAperturaModal = () => {
      setModalAbierto(true);
    };
    window.addEventListener("BOT_NUEVO_PACIENTE", manejarAperturaModal);
    return () =>
      window.removeEventListener("BOT_NUEVO_PACIENTE", manejarAperturaModal);
  }, []);

  const intentarAbrirModalNuevo = () => {
    const planFormateado = planActual.toLowerCase();
    const esPlanBasico =
      planFormateado === "gratuito" || planFormateado === "esencial";
    if (esPlanBasico && pacientes.length >= LIMITE_ESENCIAL) {
      setMostrarPaywall(true);
    } else {
      setModalAbierto(true);
    }
  };

  const guardarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();

    const planFormateado = planActual.toLowerCase();
    const esPlanBasico =
      planFormateado === "gratuito" || planFormateado === "esencial";
    if (esPlanBasico && pacientes.length >= LIMITE_ESENCIAL) {
      setModalAbierto(false);
      setMostrarPaywall(true);
      return;
    }

    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let tenantIdDestino = null;

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .maybeSingle();

      if (tu) tenantIdDestino = tu.tenant_id;

      const nombreCompletoArmado = `${nuevoPaciente.nombres.trim()} ${nuevoPaciente.apellidos.trim()}`;

      const { error } = await supabase.from("pacientes").insert([
        {
          tenant_id: tenantIdDestino,
          psicologo_id: session.user.id,
          nombres: nuevoPaciente.nombres,
          apellidos: nuevoPaciente.apellidos,
          nombre_completo: nombreCompletoArmado,
          identificacion: nuevoPaciente.identificacion || null,
          email: nuevoPaciente.email || null,
          telefono: nuevoPaciente.telefono || null,
          fecha_nacimiento: nuevoPaciente.fecha_nacimiento || null,
        },
      ]);

      if (error) throw error;

      setNuevoPaciente({
        nombres: "",
        apellidos: "",
        identificacion: "",
        email: "",
        telefono: "",
        fecha_nacimiento: "",
      });
      setModalAbierto(false);
      cargarPacientes();
    } catch (error: unknown) {
      alert(
        `Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      );
    } finally {
      setGuardando(false);
    }
  };

  // 🟢 CORRECCIÓN: Filtro tolerante a fallos
  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombres || ""} ${p.apellidos || ""} ${p.nombre_completo || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Directorio de Pacientes
          </h1>
          <p className="text-slate-500 font-medium">
            Gestiona los perfiles y datos de contacto de tus clientes.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {planActual.toLowerCase() === "gratuito" ||
              planActual.toLowerCase() === "esencial"
                ? "Consumo del Plan"
                : `Plan ${planActual}`}
            </span>
            {planActual.toLowerCase() === "gratuito" ||
            planActual.toLowerCase() === "esencial" ? (
              <span
                className={`text-sm font-bold ${pacientes.length >= LIMITE_ESENCIAL ? "text-rose-500" : "text-slate-600"}`}
              >
                {pacientes.length} / {LIMITE_ESENCIAL} pacientes
              </span>
            ) : (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                {pacientes.length} activos (Ilimitados)
              </span>
            )}
          </div>
          <button
            onClick={intentarAbrirModalNuevo}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
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
      </div>

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
          placeholder="Buscar paciente por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

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
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xl font-black uppercase">
                  {/* 🟢 CORRECCIÓN: Renderizado tolerante a fallos para el Avatar */}
                  {paciente.nombres
                    ? paciente.nombres.charAt(0)
                    : paciente.nombre_completo
                      ? paciente.nombre_completo.charAt(0)
                      : "?"}
                  {paciente.apellidos ? paciente.apellidos.charAt(0) : ""}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700">
                  Activo
                </span>
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 mb-3 truncate">
                  {/* 🟢 CORRECCIÓN: Renderizado tolerante a fallos para el Nombre */}
                  {paciente.nombres || paciente.apellidos
                    ? `${paciente.nombres || ""} ${paciente.apellidos || ""}`.trim()
                    : paciente.nombre_completo || "Paciente Anónimo"}
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
                  {new Date(paciente.creado_el).toLocaleDateString("es-ES", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Link
                  href={`/dashboard-psicologo/pacientes/${paciente.id}`}
                  className="text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:text-indigo-800"
                >
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
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && !mostrarPaywall && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Registrar Paciente
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoPaciente.nombres}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        nombres: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoPaciente.apellidos}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        apellidos: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cédula / Pasaporte
                </label>
                <input
                  type="text"
                  value={nuevoPaciente.identificacion}
                  onChange={(e) =>
                    setNuevoPaciente({
                      ...nuevoPaciente,
                      identificacion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
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

      {mostrarPaywall && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
            <button
              onClick={() => setMostrarPaywall(false)}
              className="absolute top-5 right-5 w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Límite de Pacientes
            </h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Has alcanzado el límite de {LIMITE_ESENCIAL} pacientes. Desbloquea
              pacientes ilimitados mejorando tu suscripción.
            </p>
            <button
              onClick={() => router.push("/dashboard-psicologo/suscripcion")}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg mb-3"
            >
              Mejorar a Plan Élite
            </button>
            <button
              onClick={() => setMostrarPaywall(false)}
              className="w-full text-slate-500 font-bold py-3 hover:text-slate-800"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

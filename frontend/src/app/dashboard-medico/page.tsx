"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Cita {
  id: string;
  nombre_paciente: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
}

interface InfoSuscripcion {
  estado: string;
  plan_nombre: string;
}

type SubResponse = {
  estado: string;
  plan_id: string;
  planes: { nombre: string } | { nombre: string }[] | null;
};

export default function DashboardMedico() {
  const router = useRouter();

  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("Doctor");
  const [mostrarModalCita, setMostrarModalCita] = useState(false);
  const [guardandoCita, setGuardandoCita] = useState(false);
  const [esDemo, setEsDemo] = useState(false);

  const [infoSuscripcion, setInfoSuscripcion] = useState<InfoSuscripcion>({
    estado: "trialing",
    plan_nombre: "Gratuito",
  });
  const [mostrarPaywall, setMostrarPaywall] = useState(false);

  const [formulario, setFormulario] = useState({
    paciente: "",
    fecha: "",
    hora: "",
    modalidad: "Presencial",
  });

  useEffect(() => {
    let montado = true;

    const cargarDatosDashboard = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // ==========================================
        // 🟢 MODO SANDBOX MÉDICO
        // ==========================================
        const correo = session.user.email;
        if (correo === "demo-medico@clinesfera.com") {
          if (montado) {
            setEsDemo(true);
            setNombre("Dr. Invitado (Demo)");
            setInfoSuscripcion({
              estado: "active",
              plan_nombre: "Élite (Demo Médica)",
            });

            setCitasHoy([
              {
                id: "demo-med-1",
                nombre_paciente: "Paciente Control General",
                hora_inicio: "09:00",
                hora_fin: "09:30",
                modalidad: "Presencial",
              },
              {
                id: "demo-med-2",
                nombre_paciente: "Lectura de Exámenes (Telemedicina)",
                hora_inicio: "11:30",
                hora_fin: "12:00",
                modalidad: "Online",
              },
            ]);
            setTotalPacientes(45);
            setCargando(false);
          }
          return;
        }

        // ==========================================
        // FLUJO REAL
        // ==========================================
        if (montado) {
          const emailNombre = correo?.split("@")[0] || "Doc";
          setNombre(
            "Dr. " + emailNombre.charAt(0).toUpperCase() + emailNombre.slice(1),
          );
        }

        const { data: tu } = await supabase
          .from("tenant_users")
          .select("tenant_id")
          .eq("usuario_id", session.user.id)
          .single();

        if (tu && montado) {
          const { data: sub } = await supabase
            .from("tenant_subscriptions")
            .select(`estado, plan_id, planes ( nombre )`)
            .eq("tenant_id", tu.tenant_id)
            .single();

          if (sub) {
            const suscripcionData = sub as unknown as SubResponse;
            const dataPlanes = suscripcionData.planes;
            let nombreDelPlan = "Gratuito";

            if (sub.estado === "active" || sub.estado === "confirmado") {
              if (Array.isArray(dataPlanes))
                nombreDelPlan = dataPlanes[0]?.nombre || "Esencial";
              else if (dataPlanes && typeof dataPlanes === "object")
                nombreDelPlan = dataPlanes.nombre || "Esencial";
            }
            setInfoSuscripcion({
              estado: sub.estado,
              plan_nombre: nombreDelPlan,
            });
          }
        }

        const hoy = new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Guayaquil",
        });

        const { data: citasData } = await supabase
          .from("citas")
          .select("id, nombre_paciente, hora_inicio, hora_fin, modalidad")
          .eq("medico_id", session.user.id) // 🟢 Usamos medico_id
          .eq("fecha", hoy)
          .order("hora_inicio", { ascending: true });

        if (montado && citasData) setCitasHoy(citasData);

        const { count } = await supabase
          .from("historias_clinicas")
          .select("*", { count: "exact", head: true })
          .eq("medico_id", session.user.id); // 🟢 Usamos medico_id

        if (montado && count !== null) setTotalPacientes(count);
      } catch (error) {
        console.error("Error cargando dashboard médico:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarDatosDashboard();

    return () => {
      montado = false;
    };
  }, []);

  const guardarNuevaCita = async (e: React.FormEvent) => {
    e.preventDefault();

    const planFormateado = infoSuscripcion.plan_nombre.toLowerCase();
    const planBajo =
      planFormateado === "gratuito" || planFormateado === "esencial";

    if (planBajo && formulario.modalidad === "Online" && !esDemo) {
      setMostrarPaywall(true);
      return;
    }

    setGuardandoCita(true);
    try {
      if (esDemo) {
        const nuevaCitaFalsa: Cita = {
          id: `fake-${Date.now()}`,
          nombre_paciente: formulario.paciente,
          hora_inicio: formulario.hora,
          hora_fin: "00:00",
          modalidad: formulario.modalidad,
        };

        setCitasHoy((prev) =>
          [...prev, nuevaCitaFalsa].sort((a, b) =>
            a.hora_inicio.localeCompare(b.hora_inicio),
          ),
        );
        setFormulario({
          paciente: "",
          fecha: "",
          hora: "",
          modalidad: "Presencial",
        });
        setMostrarModalCita(false);
        setGuardandoCita(false);
        return;
      }

      // FLUJO REAL
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .single();
      if (!tu) throw new Error("No tienes una clínica asignada.");

      const horaInicioObj = new Date(`2000-01-01T${formulario.hora}`);
      horaInicioObj.setHours(horaInicioObj.getHours() + 1); // 1 hora de cita por defecto
      const hora_fin = horaInicioObj.toTimeString().split(" ")[0];

      const { error } = await supabase.from("citas").insert({
        tenant_id: tu.tenant_id,
        medico_id: session.user.id, // 🟢 Insertamos como medico_id
        nombre_paciente: formulario.paciente,
        fecha: formulario.fecha,
        hora_inicio: formulario.hora,
        hora_fin: hora_fin,
        modalidad: formulario.modalidad,
        estado: "confirmed",
      });

      if (error) throw error;

      setFormulario({
        paciente: "",
        fecha: "",
        hora: "",
        modalidad: "Presencial",
      });
      setMostrarModalCita(false);
      window.location.reload();
    } catch {
      alert(`⚠️ Error al agendar.`);
    } finally {
      setGuardandoCita(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">
            ¡Hola, {nombre}! 🩺
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => setMostrarModalCita(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
          Agendar Cita
        </button>
      </div>

      {cargando ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 🟢 BANNER SANDBOX EXCLUSIVO MÉDICO */}
          {esDemo ? (
            <div className="bg-linear-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner animate-pulse">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-teal-900 mb-1">
                    Modo de Simulación Clínica Activo 🚀
                  </h2>
                  <p className="text-teal-700 font-medium text-sm">
                    Estás probando la plataforma con funciones Élite. Puedes
                    crear, editar y jugar.{" "}
                    <strong className="text-emerald-700">
                      Ningún cambio se guardará en la base de datos real.
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  router.push("/registro");
                }}
                className="shrink-0 bg-teal-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors text-sm flex items-center gap-2"
              >
                Terminar Prueba y Registrarme
              </button>
            </div>
          ) : infoSuscripcion.estado === "trialing" ||
            infoSuscripcion.estado === "pendiente" ? (
            <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-amber-900 mb-1">
                    Plan Gratuito (Prueba de 7 días)
                  </h2>
                  <p className="text-amber-700 font-medium text-sm">
                    Estás experimentando Clinesfera sin límites. Al finalizar tu
                    prueba, el acceso a tu agenda se bloqueará automáticamente.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard-medico/suscripcion"
                className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors text-sm flex items-center gap-2"
              >
                Suscribirme Ahora
              </Link>
            </div>
          ) : infoSuscripcion.estado === "active" ||
            infoSuscripcion.estado === "confirmado" ? (
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-black text-emerald-900 mb-1">
                    Suscripción {infoSuscripcion.plan_nombre} Activa 🚀
                  </h2>
                  <p className="text-emerald-700 font-medium text-sm">
                    {infoSuscripcion.plan_nombre.toLowerCase() === "esencial" ||
                    infoSuscripcion.plan_nombre.toLowerCase() === "gratuito"
                      ? "Tu consultorio digital está asegurado. Administra tus turnos e historias clínicas sin límites."
                      : "Tienes acceso VIP a Telemedicina, pacientes ilimitados y funciones premium."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Citas para Hoy
                    </p>
                    <h3 className="text-4xl font-black text-slate-900">
                      {citasHoy.length}
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <svg
                      className="w-8 h-8"
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
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Pacientes Activos
                    </p>
                    <h3 className="text-4xl font-black text-slate-900">
                      {totalPacientes}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-linear-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 md:w-2/3">
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md mb-4 inline-block">
                    Novedad Clínica
                  </span>
                  <h2 className="text-2xl font-black mb-2">
                    ¡Bienvenido al Portal Médico!
                  </h2>
                  <p className="text-teal-100 font-medium mb-6">
                    El Formulario MSP 002 y el buscador integrado de
                    diagnósticos CIE-10 están listos. Tu consultorio digital
                    está operativo.
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:h-150 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  Agenda Clínica
                </h3>
                <Link
                  href="/dashboard-medico/agenda"
                  className="text-teal-600 font-bold text-sm hover:underline"
                >
                  Ver todo
                </Link>
              </div>

              {citasHoy.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-slate-500 font-medium">
                    No tienes citas médicas programadas para hoy.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {citasHoy.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex gap-4"
                    >
                      <div className="flex flex-col items-center justify-center min-w-15 border-r border-slate-200 pr-4">
                        <span className="text-lg font-black text-slate-900">
                          {cita.hora_inicio.slice(0, 5)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">
                          {cita.nombre_paciente}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${cita.modalidad === "Online" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          {cita.modalidad}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mostrarModalCita && !mostrarPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setMostrarModalCita(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
              📅 Agendar Paciente
            </h2>
            <form className="space-y-5" onSubmit={guardarNuevaCita}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Paciente
                </label>
                <input
                  type="text"
                  required
                  value={formulario.paciente}
                  onChange={(e) =>
                    setFormulario({ ...formulario, paciente: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={formulario.fecha}
                    onChange={(e) =>
                      setFormulario({ ...formulario, fecha: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={formulario.hora}
                    onChange={(e) =>
                      setFormulario({ ...formulario, hora: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Modalidad
                </label>
                <select
                  value={formulario.modalidad}
                  onChange={(e) =>
                    setFormulario({ ...formulario, modalidad: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  <option value="Presencial">Presencial (Consultorio)</option>
                  <option value="Online">Online (Telemedicina VIP) 🔒</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={guardandoCita}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3.5 px-6 rounded-xl mt-2"
              >
                {guardandoCita ? "Guardando..." : "Guardar Cita"}
              </button>
            </form>
          </div>
        </div>
      )}

      {mostrarPaywall && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative">
            <button
              onClick={() => setMostrarPaywall(false)}
              className="absolute top-5 right-5 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Función de Élite
            </h2>
            <p className="text-slate-500 font-medium mb-8">
              La telemedicina integrada y recetas electrónicas están disponibles
              en los planes superiores. Escala tu clínica hoy mismo.
            </p>

            <button
              onClick={() => router.push("/dashboard-medico/suscripcion")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors mb-3"
            >
              Mejorar mi Plan
            </button>
            <button
              onClick={() => setMostrarPaywall(false)}
              className="w-full text-slate-500 font-bold py-3 hover:text-slate-800 transition-colors"
            >
              Quizás más tarde
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

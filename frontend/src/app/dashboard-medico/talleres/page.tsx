"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase"; // 🟢 Conexión a Base de Datos

interface Taller {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  modalidad: string;
  tipo: string;
  precio: string;
  limite: number;
  inscritos: number;
  estado: string;
  ingresos: number;
}

export default function GestionTalleresPsicologo() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 🟢 Gatillo para recargar datos

  const [misTalleres, setMisTalleres] = useState<Taller[]>([]);

  const [nuevoTaller, setNuevoTaller] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    modalidad: "Virtual",
    tipo: "Taller Clínico",
    precio: "",
    limite: "",
  });

  // 🟢 SOLUCIÓN AL LINTER: Lógica integrada en el useEffect
  useEffect(() => {
    let montado = true;

    const cargarMisTalleres = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from("talleres")
          .select("*")
          .eq("psicologo_id", session.user.id)
          .order("fecha", { ascending: false });

        if (error) throw error;
        if (montado && data) setMisTalleres(data as Taller[]);
      } catch (error) {
        console.error("Error cargando talleres:", error);
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargarMisTalleres();

    return () => {
      montado = false;
    };
  }, [refreshTrigger]); // 🟢 Se vuelve a ejecutar cada vez que cambia el trigger

  // 🟢 PUBLICAR TALLER EN SUPABASE
  const handleCrearTaller = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No autenticado");

      // Buscar el perfil del psicólogo para inyectar su nombre como ponente
      const { data: perfil } = await supabase
        .from("perfil_psicologo")
        .select("nombres, apellidos, especialidad")
        .eq("psicologo_id", session.user.id)
        .single();

      const ponenteNombre = perfil
        ? `${perfil.nombres} ${perfil.apellidos}`
        : "Psicólogo";
      const profesion = perfil ? perfil.especialidad : "Salud Mental";

      const nuevoTallerDB = {
        psicologo_id: session.user.id,
        titulo: nuevoTaller.titulo,
        descripcion: nuevoTaller.descripcion,
        fecha: nuevoTaller.fecha || "Por definir",
        hora: nuevoTaller.hora || "00:00",
        modalidad: nuevoTaller.modalidad,
        tipo: nuevoTaller.tipo,
        precio:
          nuevoTaller.precio === "0" || nuevoTaller.precio === ""
            ? "Gratuito"
            : `$${nuevoTaller.precio}`,
        ponente: ponenteNombre,
        profesion: profesion,
        limite: Number(nuevoTaller.limite) || 50,
        inscritos: 0,
        estado: "Activo",
        ingresos: 0,
        color_tematico: "indigo", // Podemos aleatorizarlo en el futuro
      };

      const { error } = await supabase.from("talleres").insert([nuevoTallerDB]);

      if (error) throw error;

      setModalAbierto(false);
      setNuevoTaller({
        titulo: "",
        descripcion: "",
        fecha: "",
        hora: "",
        modalidad: "Virtual",
        tipo: "Taller Clínico",
        precio: "",
        limite: "",
      });

      // 🟢 Recargar la tabla accionando el gatillo
      setRefreshTrigger((prev) => prev + 1);

      alert("¡Taller publicado exitosamente en la comunidad!");
    } catch (error: unknown) {
      alert(
        `Error al crear el taller: ${error instanceof Error ? error.message : "Desconocido"}`,
      );
    } finally {
      setGuardando(false);
    }
  };

  // 🟢 FUNCIÓN PARA ELIMINAR TALLER (Solo el propio creador)
  const eliminarTaller = async (id: string, titulo: string) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente el evento "${titulo}"? Esta acción no se puede deshacer y borrará a los inscritos.`,
    );

    if (!confirmar) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No autenticado");

      const { error } = await supabase
        .from("talleres")
        .delete()
        .eq("id", id)
        .eq("psicologo_id", session.user.id); // Validamos seguridad extrema de pertenencia

      if (error) throw error;

      alert("El evento ha sido eliminado de la cartelera de Clinesfera.");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: unknown) {
      alert(
        `Error al eliminar: ${error instanceof Error ? error.message : "Desconocido"}`,
      );
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in duration-500">
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mis Talleres y Eventos
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestiona tus grupos de apoyo y webinars publicados en la comunidad.
          </p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
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
          Crear Nuevo Evento
        </button>
      </div>

      {/* 2. MÉTRICAS RÁPIDAS (Calculadas desde BD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7"
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
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Total Inscritos
            </p>
            <p className="text-3xl font-black text-slate-900">
              {misTalleres.reduce((acc, t) => acc + t.inscritos, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Ingresos (Est.)
            </p>
            <p className="text-3xl font-black text-slate-900">
              ${misTalleres.reduce((acc, t) => acc + t.ingresos, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7"
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
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Eventos Creados
            </p>
            <p className="text-3xl font-black text-slate-900">
              {misTalleres.length}
            </p>
          </div>
        </div>
      </div>

      {/* 3. LISTADO DE TALLERES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-black text-slate-900">
            Historial de Publicaciones
          </h2>
        </div>
        <div className="overflow-x-auto">
          {misTalleres.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">
              No has publicado ningún evento aún.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-5 font-bold">Evento</th>
                  <th className="p-5 font-bold">Fecha y Hora</th>
                  <th className="p-5 font-bold">Modalidad</th>
                  <th className="p-5 font-bold">Inscritos</th>
                  <th className="p-5 font-bold">Estado</th>
                  <th className="p-5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {misTalleres.map((taller) => (
                  <tr
                    key={taller.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5">
                      <p className="font-bold text-slate-900 line-clamp-1">
                        {taller.titulo}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {taller.precio}
                      </p>
                    </td>
                    <td className="p-5">
                      <p className="font-bold text-slate-700 text-sm">
                        {taller.fecha}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {taller.hora}
                      </p>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${taller.modalidad === "Virtual" ? "bg-indigo-50 text-indigo-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        {taller.modalidad}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-20">
                          <div
                            className={`h-2 rounded-full ${taller.inscritos >= taller.limite ? "bg-rose-500" : "bg-emerald-500"}`}
                            style={{
                              width: `${(taller.inscritos / taller.limite) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {taller.inscritos}/{taller.limite}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${taller.estado === "Lleno" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${taller.estado === "Lleno" ? "bg-rose-500" : "bg-emerald-500"}`}
                        ></span>
                        {taller.estado}
                      </span>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-1">
                      <Link
                        href="/dashboard-psicologo/generador-certificados"
                        className="text-slate-400 hover:text-amber-500 p-2 transition-colors"
                        title="Generar Certificados"
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </Link>

                      {/* 🟢 BOTÓN DE ELIMINAR */}
                      <button
                        onClick={() => eliminarTaller(taller.id, taller.titulo)}
                        className="text-slate-300 hover:text-rose-500 p-2 transition-colors"
                        title="Eliminar Evento"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. MODAL: CREAR TALLER */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Programar Nuevo Evento
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Se publicará en la comunidad global de Clinesfera.
                </p>
              </div>
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

            <form
              onSubmit={handleCrearTaller}
              className="p-6 md:p-8 space-y-6 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller de Regulación..."
                  value={nuevoTaller.titulo}
                  onChange={(e) =>
                    setNuevoTaller({ ...nuevoTaller, titulo: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descripción Completa *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalla los objetivos..."
                  value={nuevoTaller.descripcion}
                  onChange={(e) =>
                    setNuevoTaller({
                      ...nuevoTaller,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={nuevoTaller.tipo}
                    onChange={(e) =>
                      setNuevoTaller({ ...nuevoTaller, tipo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  >
                    <option value="Taller Clínico">Taller Clínico</option>
                    <option value="Grupo de Apoyo">Grupo de Apoyo</option>
                    <option value="Webinar">Webinar (Conferencia)</option>
                    <option value="Simposio">Simposio Presencial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Modalidad
                  </label>
                  <select
                    value={nuevoTaller.modalidad}
                    onChange={(e) =>
                      setNuevoTaller({
                        ...nuevoTaller,
                        modalidad: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  >
                    <option value="Virtual">Virtual (Zoom/Meet)</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoTaller.fecha}
                    onChange={(e) =>
                      setNuevoTaller({ ...nuevoTaller, fecha: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Hora (Local) *
                  </label>
                  <input
                    type="time"
                    required
                    value={nuevoTaller.hora}
                    onChange={(e) =>
                      setNuevoTaller({ ...nuevoTaller, hora: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Precio de Inscripción (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 para evento gratuito"
                    value={nuevoTaller.precio}
                    onChange={(e) =>
                      setNuevoTaller({ ...nuevoTaller, precio: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Límite de Participantes
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 15"
                    value={nuevoTaller.limite}
                    onChange={(e) =>
                      setNuevoTaller({ ...nuevoTaller, limite: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center min-w-40"
                >
                  {guardando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Publicar Evento"
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

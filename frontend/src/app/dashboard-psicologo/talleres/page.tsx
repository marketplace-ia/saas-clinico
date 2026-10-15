"use client";

import { useState } from "react";
import Link from "next/link"; // 🟢 IMPORTACIÓN RESTAURADA

export default function GestionTalleresPsicologo() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // MOCK: Talleres creados por el psicólogo
  const [misTalleres, setMisTalleres] = useState([
    {
      id: "1",
      titulo: "Taller Práctico: Regulación Emocional en el Día a Día",
      fecha: "15 Oct 2026",
      hora: "18:00",
      modalidad: "Virtual",
      precio: "Gratuito",
      inscritos: 45,
      limite: 100,
      estado: "Activo",
      ingresos: 0,
    },
    {
      id: "2",
      titulo: "Grupo de Apoyo Guiado: Manejo de la Ansiedad Social",
      fecha: "22 Oct 2026",
      hora: "17:30",
      modalidad: "Virtual",
      precio: "$15.00",
      inscritos: 5,
      limite: 5,
      estado: "Lleno",
      ingresos: 75,
    },
  ]);

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

  const handleCrearTaller = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    setTimeout(() => {
      setMisTalleres([
        {
          id: Date.now().toString(),
          titulo: nuevoTaller.titulo,
          fecha: nuevoTaller.fecha || "Por definir",
          hora: nuevoTaller.hora || "00:00",
          modalidad: nuevoTaller.modalidad,
          precio:
            nuevoTaller.precio === "0" || nuevoTaller.precio === ""
              ? "Gratuito"
              : `$${nuevoTaller.precio}`,
          inscritos: 0,
          limite: Number(nuevoTaller.limite) || 50,
          estado: "Activo",
          ingresos: 0,
        },
        ...misTalleres,
      ]);

      setGuardando(false);
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
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in duration-500">
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mis Talleres y Eventos
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestiona tus grupos de apoyo, webinars y simposios publicados en la
            comunidad.
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

      {/* 2. MÉTRICAS RÁPIDAS */}
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
            <p className="text-3xl font-black text-slate-900">50</p>
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
              Ingresos Generados
            </p>
            <p className="text-3xl font-black text-slate-900">$75.00</p>
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
              Eventos Activos
            </p>
            <p className="text-3xl font-black text-slate-900">2</p>
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
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-5">
                    <p className="font-bold text-slate-900 line-clamp-1">
                      {taller.titulo}
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {taller.precio === "Gratuito"
                        ? "Gratuito"
                        : `Ingresos: $${taller.ingresos.toFixed(2)}`}
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
                          className={`h-2 rounded-full ${taller.estado === "Lleno" ? "bg-rose-500" : "bg-emerald-500"}`}
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
                    <button
                      className="text-slate-400 hover:text-indigo-600 p-2 transition-colors"
                      title="Gestionar Asistentes"
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
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-slate-400 hover:text-indigo-600 p-2 transition-colors"
                      title="Editar Evento"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>

                    {/* 🟢 NUEVO BOTÓN: ENLACE AL GENERADOR DE CERTIFICADOS */}
                    <Link
                      href="/dashboard-psicologo/generador-certificados"
                      className="text-slate-400 hover:text-amber-500 p-2 transition-colors inline-block"
                      title="Generar Certificados del Evento"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  El evento será publicado en la comunidad global de Clinesfera.
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
                  placeholder="Ej. Taller de Regulación Emocional..."
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
                  placeholder="Detalla los objetivos, metodología y a quién va dirigido..."
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
                    <option value="Presencial">
                      Presencial (Consultorio/Auditorio)
                    </option>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center min-w-50"
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

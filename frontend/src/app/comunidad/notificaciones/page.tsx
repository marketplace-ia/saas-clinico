"use client";

import { useState } from "react";
import Link from "next/link";

type TabTipo = "alertas" | "logros";

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tiempo: string;
  tipo: "cita" | "comunidad" | "sistema";
  leida: boolean;
}

interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  desbloqueada: boolean;
  color: string;
}

export default function CentroNotificacionesPage() {
  const [tabActiva, setTabActiva] = useState<TabTipo>("alertas");

  // MOCK: Nivel y Experiencia del Usuario (Gamificación - Punto 21)
  const nivelActual = 4;
  const xpActual = 1850;
  const xpSiguienteNivel = 2500;
  const progresoXP = (xpActual / xpSiguienteNivel) * 100;

  // MOCK: Base de datos de notificaciones (Punto 18)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([
    {
      id: "notif-1",
      titulo: "Nueva cita agendada",
      mensaje:
        "Ana Torres ha agendado una sesión virtual para el 18 de Octubre a las 15:00.",
      tiempo: "Hace 10 min",
      tipo: "cita",
      leida: false,
    },
    {
      id: "notif-2",
      titulo: "¡Respuesta en tu debate!",
      mensaje:
        "El Dr. Luis Paz ha respondido a tu pregunta sobre Evaluación Neuropsicológica.",
      tiempo: "Hace 2 horas",
      tipo: "comunidad",
      leida: false,
    },
    {
      id: "notif-3",
      titulo: "Certificado Emitido",
      mensaje:
        "Tu certificado de 'Taller de Regulación Emocional' ya está disponible para descarga.",
      tiempo: "Ayer",
      tipo: "sistema",
      leida: true,
    },
  ]);

  // MOCK: Sistema de Insignias (Gamificación - Punto 21)
  const insignias: Insignia[] = [
    {
      id: "ins-1",
      nombre: "Mente Inquisitiva",
      descripcion: "Has creado más de 5 debates en el muro comunitario.",
      icono: "🧠",
      desbloqueada: true,
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "ins-2",
      nombre: "Profesional Verificado",
      descripcion: "Tu título ha sido validado por el equipo de Clinesfera.",
      icono: "🛡️",
      desbloqueada: true,
      color: "from-emerald-400 to-teal-500",
    },
    {
      id: "ins-3",
      nombre: "Autor Destacado",
      descripcion: "Uno de tus artículos superó las 500 lecturas.",
      icono: "✍️",
      desbloqueada: false,
      color: "from-slate-300 to-slate-400",
    },
    {
      id: "ins-4",
      nombre: "Guía Clínico",
      descripcion: "Has impartido tu primer evento o taller en la plataforma.",
      icono: "🌟",
      desbloqueada: false,
      color: "from-slate-300 to-slate-400",
    },
  ];

  const marcarComoLeidas = () => {
    setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })));
  };

  const getIconoNotificacion = (tipo: string) => {
    switch (tipo) {
      case "cita":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        );
      case "comunidad":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
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
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700 slide-in-from-bottom-4 pb-12">
      {/* 1. CABECERA */}
      <div className="mb-8">
        <Link
          href="/comunidad"
          className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors mb-4 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
        >
          <span aria-hidden="true">&larr;</span> Volver al Explorador
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Mi Actividad
        </h1>
      </div>

      {/* 2. HEADER DE GAMIFICACIÓN (RESUMEN) */}
      <div className="bg-slate-900 rounded-4xl p-8 mb-8 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-500/50 flex items-center justify-center bg-slate-800 relative">
            <span className="text-3xl font-black text-white">
              N{nivelActual}
            </span>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
              Rango Plata
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 w-full text-center md:text-left">
          <h2 className="text-2xl font-black mb-2">Terapeuta Consolidado</h2>
          <p className="text-slate-400 font-medium text-sm mb-4">
            Participa en foros, dicta talleres y completa tu perfil para subir
            de nivel.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progresoXP}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-indigo-300 whitespace-nowrap">
              {xpActual} / {xpSiguienteNivel} XP
            </span>
          </div>
        </div>
      </div>

      {/* 3. NAVEGACIÓN (TABS) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button
          onClick={() => setTabActiva("alertas")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${tabActiva === "alertas" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Notificaciones
          {notificaciones.some((n) => !n.leida) && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-md text-[10px] font-black">
              {notificaciones.filter((n) => !n.leida).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTabActiva("logros")}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${tabActiva === "logros" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
        >
          Mis Insignias
        </button>
      </div>

      {/* 4. CONTENIDO DE LAS PESTAÑAS */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {/* PESTAÑA: NOTIFICACIONES */}
        {tabActiva === "alertas" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">
                Bandeja de Entrada
              </h2>
              {notificaciones.some((n) => !n.leida) && (
                <button
                  onClick={marcarComoLeidas}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {notificaciones.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">
                  No tienes notificaciones nuevas.
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-6 flex gap-4 transition-colors hover:bg-slate-50 ${!notif.leida ? "bg-indigo-50/30" : ""}`}
                  >
                    {getIconoNotificacion(notif.tipo)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3
                          className={`font-bold text-sm md:text-base ${!notif.leida ? "text-slate-900" : "text-slate-700"}`}
                        >
                          {notif.titulo}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                          {notif.tiempo}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${!notif.leida ? "text-slate-700 font-medium" : "text-slate-500"}`}
                      >
                        {notif.mensaje}
                      </p>
                    </div>
                    {!notif.leida && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 self-center"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: GAMIFICACIÓN / INSIGNIAS */}
        {tabActiva === "logros" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {insignias.map((ins) => (
              <div
                key={ins.id}
                className={`rounded-3xl p-6 border transition-all ${ins.desbloqueada ? "bg-white border-slate-200 shadow-sm hover:shadow-md" : "bg-slate-50 border-slate-100 opacity-60 grayscale"}`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-inner bg-linear-to-br ${ins.color}`}
                >
                  {ins.icono}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">
                  {ins.nombre}
                </h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  {ins.descripcion}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${ins.desbloqueada ? "text-emerald-500" : "text-slate-400"}`}
                  >
                    {ins.desbloqueada ? "✓ Desbloqueada" : "🔒 Bloqueada"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

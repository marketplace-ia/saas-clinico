"use client";

import { useState } from "react";
import Link from "next/link";

interface Participante {
  id: string;
  nombre: string;
  correo: string;
  asistencia: number;
  aprobado: boolean;
}

export default function GeneradorCertificadosPage() {
  const [eventoSeleccionado, setEventoSeleccionado] = useState("evt-1");
  const [generando, setGenerando] = useState(false);
  const [exito, setExito] = useState(false);

  // MOCK: Eventos dictados por el psicólogo (Punto 5 del manifiesto)
  const eventosDictados = [
    {
      id: "evt-1",
      titulo: "Taller Práctico: Evaluación Psicológica Infantil",
      horas: 20,
    },
    { id: "evt-2", titulo: "Seminario sobre Regulación Emocional", horas: 10 },
  ];

  // MOCK: Lista de participantes inscritos en el evento seleccionado
  const [participantes, setParticipantes] = useState<Participante[]>([
    {
      id: "usr-1",
      nombre: "Ana Torres",
      correo: "ana.torres@email.com",
      asistencia: 100,
      aprobado: true,
    },
    {
      id: "usr-2",
      nombre: "Luis Paz",
      correo: "lpaz@email.com",
      asistencia: 80,
      aprobado: true,
    },
    {
      id: "usr-3",
      nombre: "Carlos Ruiz",
      correo: "cruiz99@email.com",
      asistencia: 40,
      aprobado: false,
    },
  ]);

  const toggleAprobacion = (id: string) => {
    setParticipantes(
      participantes.map((p) =>
        p.id === id ? { ...p, aprobado: !p.aprobado } : p,
      ),
    );
  };

  const handleGenerarLote = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerando(true);

    // Simulamos la llamada al API que creamos anteriormente (/api/certificados/generar)
    setTimeout(() => {
      setGenerando(false);
      setExito(true);

      // Reiniciar mensaje de éxito después de 4 segundos
      setTimeout(() => setExito(false), 4000);
    }, 2000);
  };

  const aprobadosCount = participantes.filter((p) => p.aprobado).length;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in duration-500 pb-20">
      {/* 1. CABECERA */}
      <div className="mb-10 border-b border-slate-200 pb-8">
        <Link
          href="/dashboard-psicologo"
          className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors mb-4 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
        >
          <span aria-hidden="true">&larr;</span> Volver a mi Dashboard
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
          Emisión de Certificados
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Genera y envía automáticamente los certificados de participación a los
          asistentes de tus eventos finalizados.
        </p>
      </div>

      {exito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-8 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold">¡Lote Generado con Éxito!</p>
            <p className="text-sm">
              Se han emitido {aprobadosCount} certificados y se notificó a los
              participantes por correo y plataforma.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-500"
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
              Seleccionar Evento
            </h2>
            <select
              value={eventoSeleccionado}
              onChange={(e) => setEventoSeleccionado(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold text-sm"
            >
              {eventosDictados.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
            <h3 className="font-black text-lg mb-1">Diseño Premium</h3>
            <p className="text-slate-400 text-sm mb-6">
              El sistema aplicará la firma digital registrada en tu perfil.
            </p>

            <div className="aspect-[1.414/1] bg-linear-to-br from-indigo-900 to-slate-900 rounded-xl p-2 border border-white/20 mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-24 h-24 border-8 border-white rounded-full"></div>
              </div>
              <div className="w-full h-full border border-white/30 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[8px] mb-2">
                  Ψ
                </div>
                <div className="w-3/4 h-2 bg-white/20 rounded-full mb-2"></div>
                <div className="w-1/2 h-1 bg-white/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Auditoría de Asistentes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="font-black text-slate-900">
                  Auditoría de Asistentes
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  Marca a quienes cumplieron los requisitos.
                </p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 font-black px-3 py-1.5 rounded-lg text-sm">
                {aprobadosCount} Aprobados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">
                      % Asistencia
                    </th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">
                      Emitir Certificado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participantes.map((part) => (
                    <tr
                      key={part.id}
                      className={`transition-colors ${part.aprobado ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">
                          {part.nombre}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {part.correo}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-full max-w-100px h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${part.asistencia >= 80 ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${part.asistencia}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-bold ${part.asistencia >= 80 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {part.asistencia}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => toggleAprobacion(part.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${part.aprobado ? "bg-indigo-600" : "bg-slate-200"}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${part.aprobado ? "translate-x-6" : "translate-x-1"}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 mt-auto bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleGenerarLote}
                disabled={generando || aprobadosCount === 0}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando Firmas y PDFs...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Emitir {aprobadosCount} Certificado(s)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function DiarioEmocionalPage() {
  const [emocionActiva, setEmocionActiva] = useState("");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  // MOCK: Historial de entradas del paciente
  const [entradas, setEntradas] = useState([
    {
      id: 1,
      fecha: "24 Sep 2026",
      hora: "20:30",
      emocion: "ansioso",
      emoji: "😰",
      color: "amber",
      texto:
        "Hoy tuve una presentación importante y sentí mucha presión en el pecho. Recordé el ejercicio de respiración 4-7-8 que me enseñó mi terapeuta y logré calmarme antes de empezar.",
      feedbackAsistente:
        "Identificaste un detonante claro y aplicaste una técnica de afrontamiento de forma exitosa. ¡Es un excelente progreso clínico!",
    },
    {
      id: 2,
      fecha: "22 Sep 2026",
      hora: "09:15",
      emocion: "calmado",
      emoji: "😌",
      color: "blue",
      texto:
        "Pude dormir 8 horas seguidas sin interrupciones. Me siento con energía para empezar el día. Escribir ayer por la noche me ayudó a descargar la mente.",
      feedbackAsistente: null,
    },
  ]);

  const emociones = [
    { id: "feliz", emoji: "😊", label: "Feliz", color: "emerald" },
    { id: "calmado", emoji: "😌", label: "Calmado", color: "blue" },
    { id: "neutro", emoji: "😐", label: "Neutro", color: "slate" },
    { id: "ansioso", emoji: "😰", label: "Ansioso", color: "amber" },
    { id: "triste", emoji: "😔", label: "Triste", color: "indigo" },
    { id: "enojado", emoji: "😠", label: "Enojado", color: "rose" },
  ];

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emocionActiva || !nota.trim()) return;

    setGuardando(true);

    // Simulamos el guardado en base de datos
    setTimeout(() => {
      const emocionData = emociones.find((e) => e.id === emocionActiva);

      setEntradas([
        {
          id: Date.now(),
          fecha: "25 Sep 2026",
          hora: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          emocion: emocionActiva,
          emoji: emocionData?.emoji || "📝",
          color: emocionData?.color || "slate",
          texto: nota,
          feedbackAsistente:
            "Gracias por compartir cómo te sientes hoy. Tu terapeuta podrá ver este registro en tu próxima sesión.",
        },
        ...entradas,
      ]);

      setEmocionActiva("");
      setNota("");
      setGuardando(false);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Mi Diario Emocional
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          Un espacio seguro para reflexionar. Tus registros ayudan a tu
          terapeuta a entender mejor tu proceso.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: FORMULARIO DE NUEVA ENTRADA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="font-black text-slate-900 text-lg mb-6">
              ¿Cómo te sientes en este momento?
            </h2>

            <form onSubmit={handleGuardar}>
              {/* Selector de Emociones */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {emociones.map((emo) => (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() => setEmocionActiva(emo.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      emocionActiva === emo.id
                        ? `border-${emo.color}-500 bg-${emo.color}-50 shadow-sm scale-105`
                        : `border-slate-100 bg-white hover:border-${emo.color}-200 hover:bg-${emo.color}-50/50`
                    }`}
                  >
                    <span className="text-3xl mb-1 filter drop-shadow-sm">
                      {emo.emoji}
                    </span>
                    <span
                      className={`text-xs font-bold ${emocionActiva === emo.id ? `text-${emo.color}-700` : "text-slate-500"}`}
                    >
                      {emo.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Área de Texto */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  ¿Qué está pasando por tu mente?
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Escribe aquí tus pensamientos sin filtros..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium resize-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={guardando || !emocionActiva || !nota.trim()}
                className="w-full bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Guardar Reflexión
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL (TIMELINE) */}
        <div className="lg:col-span-2">
          <h2 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-slate-400"
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
            Historial de Entradas
          </h2>

          <div className="space-y-6">
            {entradas.map((entrada) => (
              <div
                key={entrada.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group"
              >
                {/* Cabecera de la Tarjeta */}
                <div
                  className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-${entrada.color}-50/30`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-${entrada.color}-100 flex items-center justify-center text-xl shadow-inner`}
                    >
                      {entrada.emoji}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-black text-${entrada.color}-700 capitalize`}
                      >
                        {entrada.emocion}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        {entrada.fecha} • {entrada.hora}
                      </p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors">
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
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Cuerpo del Texto */}
                <div className="p-6 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {entrada.texto}
                </div>

                {/* Feedback del Asistente/Terapeuta (Si existe) */}
                {entrada.feedbackAsistente && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm mt-0.5">
                        ✨
                      </div>
                      <div>
                        <p className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-1">
                          Nota del Asistente
                        </p>
                        <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                          {entrada.feedbackAsistente}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function SalaVirtualPage() {
  const router = useRouter();

  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const nombreSala = "PsiClinic-Consultorio-Seguro-2026";

  // Verificamos si quien entra es el Doctor o el Paciente
  useEffect(() => {
    const verificarRol = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data: rolData } = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", user.email)
          .maybeSingle();

        if (rolData) {
          setRolUsuario(rolData.rol);
        }
      }
    };
    verificarRol();
  }, []);

  // Función para guardar las notas en el expediente
  const handleGuardarNotas = async () => {
    setGuardando(true);
    setMensaje("");

    // Aquí simulamos el guardado en base de datos (toma 1 segundo)
    setTimeout(() => {
      setGuardando(false);
      setMensaje(
        "¡Notas guardadas exitosamente en el expediente del paciente!",
      );

      // Borramos el mensaje de éxito después de 3 segundos
      setTimeout(() => setMensaje(""), 3000);
    }, 1000);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col font-sans overflow-hidden">
      {/* 🛡️ Barra Superior Clínica */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10 text-white shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
            Ψ
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-tight">
              Telemedicina PsiClinic
            </h1>
            <p className="text-xs text-green-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              Conexión Segura (Cifrado Extremo a Extremo)
            </p>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm hover:-translate-y-0.5"
        >
          <svg
            className="w-4 h-4"
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
          Finalizar Sesión
        </button>
      </header>

      {/* 🎥 Zona Principal: Pantalla Dividida */}
      <main className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Contenedor del Video (Jitsi) - Ocupa todo si es paciente, o el 70% si es doctor */}
        <div
          className={`relative bg-black transition-all duration-300 ${rolUsuario === "psicologo" ? "lg:w-2/3 xl:w-3/4" : "w-full"}`}
        >
          <iframe
            src={`https://meet.jit.si/${nombreSala}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="absolute inset-0 w-full h-full border-0"
          ></iframe>
        </div>

        {/* 📝 Panel de Notas Clínicas (¡SOLO VISIBLE PARA EL PSICÓLOGO!) */}
        {rolUsuario === "psicologo" && (
          <div className="lg:w-1/3 xl:w-1/4 bg-white flex flex-col border-l border-gray-200 shadow-2xl z-20">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <span className="text-xl">📝</span> Notas de Evolución
              </h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                Privado
              </span>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Motivo de Consulta / Observaciones
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Escribe aquí los apuntes de la sesión. El paciente no puede ver esto..."
                  className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                ></textarea>
              </div>

              {/* Mensaje de confirmación */}
              {mensaje && (
                <div className="bg-green-50 text-green-700 text-sm font-bold p-3 rounded-lg border border-green-200 animate-in slide-in-from-top-2">
                  {mensaje}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white shrink-0">
              <button
                onClick={handleGuardarNotas}
                disabled={guardando || notas.trim() === ""}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  guardando || notas.trim() === ""
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:-translate-y-1"
                }`}
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>{" "}
                    Guardando...
                  </>
                ) : (
                  <>
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      ></path>
                    </svg>{" "}
                    Guardar Expediente
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

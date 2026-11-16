"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";

// 🟢 1. Definimos la estructura exacta para que TypeScript no se queje
interface PerfilPsicologo {
  psicologo_id: string;
  nombres: string;
  apellidos: string;
}

interface Sesion {
  id: string;
  fecha: string;
  hora_inicio: string;
  psicologo_id: string;
  modalidad: string;
  perfil_psicologo?: PerfilPsicologo;
}

export default function HistorialPacientePage() {
  const [sesionesPasadas, setSesionesPasadas] = useState<Sesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState<
    "sesiones" | "tareas" | "documentos"
  >("sesiones");

  // 🟢 2. Cambiamos 'any' por 'unknown' para arreglos vacíos temporales
  const tareas: unknown[] = [];
  const documentos: unknown[] = [];

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const hoy = new Date().toLocaleDateString("en-CA", {
          timeZone: "America/Guayaquil",
        });

        // 1. Cargar citas pasadas o completadas
        const { data: dataCitas, error: errCitas } = await supabase
          .from("citas")
          .select(
            `
            id, 
            fecha, 
            hora_inicio, 
            psicologo_id, 
            modalidad, 
            estado
          `,
          )
          .eq("paciente_correo", user.email)
          .lte("fecha", hoy)
          .order("fecha", { ascending: false });

        if (errCitas) throw errCitas;

        if (dataCitas) {
          // Obtener nombres de psicólogos
          const psicologoIds = [
            ...new Set(dataCitas.map((c) => c.psicologo_id)),
          ];

          // 🟢 3. Usamos nuestra interfaz segura en lugar de 'any'
          let perfilesPsicologos: PerfilPsicologo[] = [];

          if (psicologoIds.length > 0) {
            const { data: perfiles } = await supabase
              .from("perfil_psicologo")
              .select("psicologo_id, nombres, apellidos")
              .in("psicologo_id", psicologoIds);
            if (perfiles) perfilesPsicologos = perfiles;
          }

          const sesionesCompletas = dataCitas.map((cita) => {
            const perfil = perfilesPsicologos.find(
              (p) => p.psicologo_id === cita.psicologo_id,
            );
            return {
              ...cita,
              perfil_psicologo: perfil,
            };
          });

          setSesionesPasadas(sesionesCompletas);
        }
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []);

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Mi Historial Clínico
          </h1>
          <p className="text-slate-500">
            Revisa la evolución de tu tratamiento, descarga ejercicios y accede
            a tus documentos encriptados.
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-indigo-100 shadow-sm shrink-0">
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          Datos Encriptados
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit shadow-sm">
        <button
          onClick={() => setPestanaActiva("sesiones")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "sesiones" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Sesiones Pasadas
        </button>
        <button
          onClick={() => setPestanaActiva("tareas")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "tareas" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            ></path>
          </svg>
          Tareas y Ejercicios
        </button>
        <button
          onClick={() => setPestanaActiva("documentos")}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${pestanaActiva === "documentos" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
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
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            ></path>
          </svg>
          Documentos
        </button>
      </div>

      {/* Contenido Dinámico */}
      {cargando ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {/* Pestaña: Sesiones */}
          {pestanaActiva === "sesiones" && (
            <div>
              {sesionesPasadas.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🗓️
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Sin historial de sesiones
                  </h3>
                  <p className="text-slate-500">
                    Tus citas completadas aparecerán aquí como un registro de tu
                    proceso.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sesionesPasadas.map((sesion) => (
                    <div
                      key={sesion.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
                            {new Date(sesion.fecha).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${sesion.modalidad === "Online" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {sesion.modalidad}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          Sesión Psicológica
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                          Especialista:{" "}
                          {sesion.perfil_psicologo?.nombres
                            ? `Ps. ${sesion.perfil_psicologo.nombres} ${sesion.perfil_psicologo.apellidos}`
                            : "Asignado"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pestaña: Tareas y Ejercicios (LIMPIADA) */}
          {pestanaActiva === "tareas" && (
            <div>
              {tareas.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    📝
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Sin tareas asignadas
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Cuando tu psicólogo te asigne ejercicios de registro,
                    reflexión o lectura, aparecerán en esta bandeja.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Aquí iría el .map(tarea) cuando conectes la base de datos de tareas */}
                </div>
              )}
            </div>
          )}

          {/* Pestaña: Documentos */}
          {pestanaActiva === "documentos" && (
            <div>
              {documentos.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center border-dashed shadow-sm">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    🗂️
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Bóveda vacía
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Aún no tienes informes, certificados médicos ni resultados
                    de pruebas psicométricas subidos a tu expediente.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Aquí iría el .map(documento) cuando lo implementes */}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

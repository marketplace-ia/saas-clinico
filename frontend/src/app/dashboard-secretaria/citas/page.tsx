"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Cita {
  id: string;
  nombre_paciente: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  estado: string;
}

export default function GestionCitasSecretariaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorJefe, setErrorJefe] = useState<string | null>(null);

  const cargarCitas = useCallback(async (mostrarLoader = false) => {
    if (mostrarLoader) setCargando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("Sin sesión activa");

      // 🟢 1. IDENTIFICAR AL PSICÓLOGO JEFE
      const { data: perfilData, error: perfilError } = await supabase
        .from("perfil_secretaria")
        .select("psicologo_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (perfilError || !perfilData?.psicologo_id) {
        setErrorJefe(
          "No tienes un psicólogo asignado. Contacta al administrador.",
        );
        setCargando(false);
        return;
      }

      const idJefe = perfilData.psicologo_id;

      // 🟢 2. TRAER SOLO LAS CITAS DE ESTE DOCTOR
      const { data, error } = await supabase
        .from("citas")
        .select(
          "id, nombre_paciente, fecha, hora_inicio, hora_fin, modalidad, estado",
        )
        .eq("psicologo_id", idJefe)
        .order("fecha", { ascending: false })
        .order("hora_inicio", { ascending: false });

      if (error) throw error;
      setCitas(data || []);
    } catch (error) {
      console.error("Error al cargar la gestión de citas:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      await cargarCitas(true);
    };
    inicializar();
  }, [cargarCitas]);

  const cambiarEstadoCita = async (id: string, nuevoEstado: string) => {
    const confirmacion = confirm(
      `¿Estás seguro de cambiar el estado de la cita a ${nuevoEstado.toUpperCase()}?`,
    );
    if (!confirmacion) return;

    try {
      // 🟢 CORRECCIÓN ESTADO: Mandamos el estado exacto de la BD ("confirmed", "cancelled")
      const { error } = await supabase
        .from("citas")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      cargarCitas(false);
    } catch (error) {
      alert("Error al actualizar el estado de la cita.");
      console.error(error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLimpio = estado.toLowerCase();
    switch (estadoLimpio) {
      case "confirmed":
      case "confirmada":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase">
            CONFIRMADA
          </span>
        );
      case "pending":
      case "pendiente":
        return (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase">
            PENDIENTE
          </span>
        );
      case "cancelled":
      case "cancelada":
      case "rejected":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase">
            CANCELADA
          </span>
        );
      case "completed":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase">
            COMPLETADA
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase">
            {estado}
          </span>
        );
    }
  };

  if (errorJefe)
    return (
      <div className="p-10 font-bold text-red-600 bg-red-50 m-8 rounded-xl border border-red-200">
        🚨 {errorJefe}
      </div>
    );

  return (
    <div className="w-full p-8 font-sans">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Supervisión de Citas
          </h1>
          <p className="text-gray-500 mt-1">
            Gestión administrativa de la agenda del especialista de forma
            segura.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            Sincronizando agenda clínica...
          </div>
        ) : citas.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📭
            </div>
            <p className="font-medium text-gray-600 text-lg">
              No hay citas registradas en la agenda del doctor.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Paciente y Modalidad
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="p-5 font-bold uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {citas.map((cita) => (
                  <tr
                    key={cita.id}
                    className="hover:bg-purple-50/30 transition"
                  >
                    <td className="p-5">
                      <div className="font-bold text-gray-800">
                        📅 {cita.fecha}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ⏱️ {cita.hora_inicio?.slice(0, 5)} -{" "}
                        {cita.hora_fin?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-gray-800">
                        {cita.nombre_paciente}
                      </div>
                      <div className="text-sm text-purple-600 font-bold bg-purple-50 inline-block px-2 py-0.5 rounded mt-1">
                        {cita.modalidad || "Consulta"}
                      </div>
                    </td>
                    <td className="p-5">{getEstadoBadge(cita.estado)}</td>
                    <td className="p-5 text-right flex justify-end gap-2 items-center">
                      {(cita.estado === "pending" ||
                        cita.estado === "pendiente") && (
                        <button
                          onClick={() =>
                            cambiarEstadoCita(cita.id, "confirmed")
                          }
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                        >
                          Confirmar
                        </button>
                      )}

                      {(cita.estado === "confirmed" ||
                        cita.estado === "confirmada") && (
                        <>
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "completed")
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() =>
                              cambiarEstadoCita(cita.id, "cancelled")
                            }
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-sm font-bold"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

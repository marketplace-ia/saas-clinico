"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function DashboardPacientePage() {
  const [nombrePaciente, setNombrePaciente] = useState("Paciente");
  const router = useRouter(); // 🟢 Instanciamos el enrutador para el bot

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user && user.email) {
          // 🟢 MAGIA: Buscamos el nombre real en la base de datos
          const { data: pacienteData, error: dbError } = await supabase
            .from("roles_usuarios")
            .select("nombre")
            .eq("correo", user.email)
            .single();

          if (dbError && dbError.code !== "PGRST116") {
            // Ignoramos el error "no rows returned" por si es nuevo
            console.error("Error al buscar nombre:", dbError);
          }

          // Si hay nombre real, lo usamos. Si no, usamos el truco del correo
          if (pacienteData && pacienteData.nombre) {
            // Mostramos solo el primer nombre para un saludo más amigable
            const primerNombre = pacienteData.nombre.split(" ")[0];
            setNombrePaciente(primerNombre);
          } else {
            const nombrePart = user.email.split("@")[0];
            setNombrePaciente(nombrePart);
          }
        }
      } catch (error) {
        console.error("Error general en el inicio:", error);
      }
    };
    obtenerUsuario();
  }, []);

  // 🤖 RECEPTORES DE EVENTOS DEL ASISTENTE INTELIGENTE
  useEffect(() => {
    // Definimos las acciones que el bot puede ejecutar
    const entrarConsulta = () => router.push("/sala-virtual");
    const configurarPerfil = () => router.push("/dashboard-paciente/perfil");
    const irAHistorial = () => router.push("/dashboard-paciente/historial");

    // Ponemos a la página a escuchar las órdenes exactas
    window.addEventListener("BOT_ENTRAR_CONSULTA", entrarConsulta);
    window.addEventListener("BOT_CONFIGURAR_PERFIL", configurarPerfil);
    window.addEventListener("BOT_IR_HISTORIAL", irAHistorial);

    // Limpieza de seguridad al desmontar el componente
    return () => {
      window.removeEventListener("BOT_ENTRAR_CONSULTA", entrarConsulta);
      window.removeEventListener("BOT_CONFIGURAR_PERFIL", configurarPerfil);
      window.removeEventListener("BOT_IR_HISTORIAL", irAHistorial);
    };
  }, [router]);

  return (
    <div className="p-6 md:p-10 w-full font-sans animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Hola, <span className="text-blue-600">{nombrePaciente}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Bienvenido a tu portal de salud mental.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/dashboard-paciente/perfil"
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
          >
            Configurar Perfil
          </Link>
          <Link
            href="/sala-virtual"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-md flex items-center gap-2"
          >
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              ></path>
            </svg>
            Entrar a mi Consulta
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-blue-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-sm border border-white/10">
            Cita de hoy
          </span>
          <h2 className="text-3xl font-black mb-2">
            Terapia Individual (Seguimiento)
          </h2>
          <p className="text-blue-100 flex items-center gap-2 mb-6 font-medium">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            Hoy, 11:30 AM con tu Especialista
          </p>
          <p className="text-blue-50 max-w-xl text-sm leading-relaxed">
            Tu especialista ya está preparándose para tu sesión. Puedes ingresar
            a la sala virtual 5 minutos antes de la hora programada para probar
            tu cámara y micrófono.
          </p>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            📝
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              Mi Historial Clínico
            </h3>
            <p className="text-sm text-gray-500">
              Revisa tus diagnósticos y notas anteriores.
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            🌿
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">PsiEduca</h3>
            <p className="text-sm text-gray-500">
              Explora talleres y artículos para tu bienestar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

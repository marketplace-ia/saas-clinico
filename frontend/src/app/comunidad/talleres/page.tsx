"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

// 1. Creamos la "molécula" del Taller para que TypeScript esté feliz
interface Taller {
  id: number;
  titulo: string;
  instructor: string;
  fecha: string;
  hora: string;
  modalidad: string;
  precio: number;
  cupos: number;
  descripcion: string;
  color: string;
}

export default function TalleresComunidadPage() {
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // 2. Le indicamos que este arreglo es estrictamente de tipo Taller
  const talleres: Taller[] = [
    {
      id: 1,
      titulo: "Crianza Positiva en la Era Digital",
      instructor: "Dra. María Fernández",
      fecha: "15 de Octubre",
      hora: "10:00 AM - 12:00 PM",
      modalidad: "Zoom (En vivo)",
      precio: 15.0,
      cupos: 5,
      descripcion:
        "Aprende a establecer límites sanos con las pantallas y redes sociales sin generar conflictos constantes en casa.",
      color: "from-teal-500 to-teal-700",
    },
    {
      id: 2,
      titulo: "Gestión del Estrés para Emprendedores",
      instructor: "Dr. Roberto Sánchez",
      fecha: "22 de Octubre",
      hora: "06:00 PM - 08:00 PM",
      modalidad: "Presencial (Auditorio)",
      precio: 25.0,
      cupos: 12,
      descripcion:
        "Estrategias cognitivo-conductuales para evitar el Burnout cuando tu negocio depende al 100% de ti.",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      id: 3,
      titulo: "Taller Gratuito: Primeros Auxilios Psicológicos",
      instructor: "Equipo PsiClinic",
      fecha: "05 de Noviembre",
      hora: "09:00 AM - 11:00 AM",
      modalidad: "Zoom (En vivo)",
      precio: 0,
      cupos: 50,
      descripcion:
        "Entrenamiento básico para saber cómo actuar y qué decir (y qué no decir) ante una crisis emocional de un familiar o amigo.",
      color: "from-blue-500 to-blue-700",
    },
  ];

  useEffect(() => {
    const verificarIdentidad = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data } = await supabase
            .from("roles_usuarios")
            .select("rol")
            .eq("correo", user.email)
            .maybeSingle();

          if (data) {
            setRolUsuario(data.rol);
          }
        }
      } catch (error) {
        console.error("Error al verificar usuario:", error);
      } finally {
        setCargando(false);
      }
    };

    verificarIdentidad();
  }, []);

  // 3. Reemplazamos el 'any' por nuestro nuevo tipo 'Taller'
  const handleInscripcion = (taller: Taller) => {
    if (taller.precio === 0) {
      alert(
        `¡Te has inscrito exitosamente al taller gratuito: ${taller.titulo}! Te enviaremos el enlace por correo.`,
      );
    } else {
      alert(
        `Redirigiendo a pasarela de pagos (Stripe/PayPal) para cobrar $${taller.precio} por el taller: ${taller.titulo}...`,
      );
    }
  };

  return (
    <div className="w-full font-sans animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <Link
            href="/comunidad"
            className="text-teal-600 font-bold text-sm hover:underline mb-2 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-2 mb-2">
            Talleres y Webinars
          </h1>
          <p className="text-gray-500 text-lg">
            Aprende nuevas herramientas en nuestras sesiones interactivas
            guiadas por expertos.
          </p>
        </div>

        {/* Botón solo para Psicólogos: Crear Taller */}
        {!cargando && rolUsuario === "psicologo" && (
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap">
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
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Crear Nuevo Taller
          </button>
        )}
      </div>

      {/* Grid de Talleres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {talleres.map((taller) => (
          <div
            key={taller.id}
            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1"
          >
            {/* Cabecera del Taller (Color dinámico) */}
            <div
              className={`p-6 bg-linear-to-br ${taller.color} text-white relative`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                  {taller.modalidad}
                </span>
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-black shadow-sm">
                  {taller.precio === 0
                    ? "¡GRATIS!"
                    : `$${taller.precio.toFixed(2)}`}
                </span>
              </div>
              <h3 className="text-xl font-black leading-tight mb-1">
                {taller.titulo}
              </h3>
              <p className="text-white/80 text-sm font-medium">
                Imparte: {taller.instructor}
              </p>

              {/* Decoración geométrica */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full blur-lg"></div>
            </div>

            {/* Cuerpo del Taller */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="text-lg">📅</span> {taller.fecha}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">⏰</span>{" "}
                  {taller.hora.split(" - ")[0]}
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6 flex-1">
                {taller.descripcion}
              </p>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                  ¡Solo {taller.cupos} cupos!
                </span>
                <button
                  onClick={() => handleInscripcion(taller)}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-5 rounded-lg transition text-sm shadow-sm"
                >
                  Inscribirme
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

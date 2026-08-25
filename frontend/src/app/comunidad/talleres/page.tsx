"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

// 1. La molécula exacta que coincide con nuestra base de datos
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

  // 2. Estado dinámico para guardar los talleres reales
  const [talleres, setTalleres] = useState<Taller[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // A. Identificamos al usuario
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

        // B. Traemos los talleres de Supabase
        const { data: datosBD, error } = await supabase
          .from("talleres")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error consultando talleres:", error);
        }

        if (datosBD) {
          setTalleres(datosBD);
        }
      } catch (error) {
        console.error("Error al cargar la base de datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

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

        {/* Botón solo para Psicólogos (AHORA CONVERTIDO EN LINK) */}
        {!cargando && rolUsuario === "psicologo" && (
          <Link
            href="/dashboard-psicologo/crear-taller"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap"
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
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Crear Nuevo Taller
          </Link>
        )}
      </div>

      {/* Cargando o Grid de Talleres */}
      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Cargando próximos eventos...
          </p>
        </div>
      ) : (
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
                    {taller.precio === 0 ? "¡GRATIS!" : `$${taller.precio}`}
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

          {talleres.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-400 font-medium">
              Actualmente no hay talleres programados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

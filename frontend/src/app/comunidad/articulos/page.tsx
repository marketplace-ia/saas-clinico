"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import Link from "next/link";

interface Articulo {
  id: number;
  titulo: string;
  autor: string;
  fecha: string;
  categoria: string;
  tiempo_lectura: string;
  imagen: string;
  extracto: string;
}

export default function ArticulosComunidadPage() {
  const [rolUsuario, setRolUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [articulos, setArticulos] = useState<Articulo[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
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

        const { data: datosBD, error } = await supabase
          .from("articulos")
          .select("*")
          .order("id", { ascending: false });

        // SOLUCIÓN 1: Ahora sí usamos la variable "error" imprimiéndola en consola si algo falla.
        if (error) {
          console.error(
            "Error consultando la base de datos de Supabase:",
            error,
          );
        }

        if (datosBD) {
          setArticulos(datosBD);
        }
      } catch (error) {
        console.error("Error al cargar la base de datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="w-full font-sans animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <Link
            href="/comunidad"
            className="text-blue-600 font-bold text-sm hover:underline mb-2 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mt-2 mb-2">
            Artículos Clínicos
          </h1>
          <p className="text-gray-500 text-lg">
            Lee y aprende de las investigaciones y casos de nuestro equipo.
          </p>
        </div>

        {!cargando && rolUsuario === "psicologo" && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center gap-2 whitespace-nowrap">
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
            Escribir Artículo
          </button>
        )}
      </div>

      {cargando ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Conectando con la base de datos...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articulos.map((art) => (
            <div
              key={art.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                {/* SOLUCIÓN 2: Le decimos al linter de Next.js que ignore esta línea */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.imagen}
                  alt={art.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">
                  {art.categoria}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-3">
                  <span>{art.fecha}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{art.tiempo_lectura} lectura</span>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                  {art.titulo}
                </h3>

                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                  {art.extracto}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {art.autor.charAt(0)}
                  </div>
                  <span className="font-bold text-sm text-gray-700">
                    {art.autor}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {articulos.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 font-medium">
              Aún no hay artículos publicados.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

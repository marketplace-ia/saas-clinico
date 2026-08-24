"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ComunidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Barra de Navegación Superior (Top Bar) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Título */}
            <div className="flex items-center gap-3">
              <Link href="/comunidad" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-teal-700 transition">
                  Ψ
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight">
                  Psi<span className="text-teal-600">Educa</span>
                </span>
              </Link>
            </div>

            {/* Menú de Navegación Central */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/comunidad"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === "/comunidad" ? "border-teal-500 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Inicio
              </Link>
              <Link
                href="/comunidad/articulos"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.includes("/articulos") ? "border-teal-500 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Publicaciones
              </Link>
              <Link
                href="/comunidad/talleres"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.includes("/talleres") ? "border-teal-500 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Talleres en Vivo
              </Link>
              <Link
                href="/comunidad/biblioteca"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname.includes("/biblioteca") ? "border-teal-500 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Biblioteca Clínica
              </Link>
            </nav>

            {/* Botones de Acción (Retorno a la clínica) */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-bold text-gray-500 hover:text-teal-600 transition hidden sm:block"
              >
                Volver a la Clínica
              </Link>
              <Link
                href="/login"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition shadow-sm"
              >
                Mi Cuenta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

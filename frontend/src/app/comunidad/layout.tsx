"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export default function ComunidadPremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🟢 ESTADO PARA MANEJAR LA SESIÓN INTELIGENTE
  const [usuarioLogueado, setUsuarioLogueado] = useState<{
    iniciales: string;
    rutaPanel: string;
  } | null>(null);

  // Efecto sutil de sombra al hacer scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🟢 VERIFICADOR DE SESIÓN AL CARGAR LA COMUNIDAD
  useEffect(() => {
    const verificarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const email = session.user.email;
        const { data } = await supabase
          .from("roles_usuarios")
          .select("rol")
          .eq("correo", email)
          .maybeSingle();

        let ruta = "/dashboard-paciente"; // Default
        if (data?.rol === "psicologo") ruta = "/dashboard-psicologo";
        if (data?.rol === "secretaria") ruta = "/dashboard-secretaria";

        setUsuarioLogueado({
          iniciales: email.substring(0, 2).toUpperCase(),
          rutaPanel: ruta,
        });
      }
    };
    verificarSesion();
  }, []);

  const navLinks = [
    { name: "Explorar", path: "/comunidad" },
    { name: "Artículos", path: "/comunidad/articulos" },
    { name: "Eventos", path: "/comunidad/talleres" },
    { name: "Recursos", path: "/comunidad/biblioteca" },
    { name: "Directorio", path: "/comunidad/profesionales" },
    { name: "Grupos", path: "/comunidad/grupos" },
    { name: "Convocatorias", path: "/comunidad/convocatorias" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y Branding */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <Link
                href="/comunidad"
                className="flex items-center gap-2.5 group shrink-0"
              >
                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  Ψ
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-xl leading-none text-slate-900 tracking-tight">
                    Clinesfera
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1">
                    Ecosistema
                  </span>
                </div>
              </Link>

              {/* Menú Escritorio (Con scroll horizontal si es necesario) */}
              <nav className="hidden lg:flex items-center space-x-1 ml-4 overflow-x-auto hide-scrollbar">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.path ||
                    (link.path !== "/comunidad" &&
                      pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.name}
                      href={link.path}
                      className={`px-3 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Acciones de Usuario (Escritorio) */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0">
              <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* LA CAMPANITA LLEVA AL CENTRO DE NOTIFICACIONES */}
              {usuarioLogueado && (
                <Link
                  href="/comunidad/notificaciones"
                  className="relative text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                  title="Ver mi actividad y alertas"
                >
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                </Link>
              )}

              <div className="w-px h-6 bg-slate-200"></div>

              {/* 🟢 BOTÓN DE REGRESO AL INICIO (ESCRITORIO) */}
              <Link
                href="/"
                className="hidden lg:flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold text-xs xl:text-sm transition-colors"
                title="Volver al Portal Principal"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Inicio
              </Link>

              {/* BOTÓN DINÁMICO DE SESIÓN Y CERTIFICADOS */}
              {usuarioLogueado ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/comunidad/certificados"
                    className="hidden lg:flex items-center gap-1.5 text-slate-500 hover:text-amber-600 font-bold text-xs xl:text-sm transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                    Mis Certificados
                  </Link>
                  <Link
                    href={usuarioLogueado.rutaPanel}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 px-4 py-2 rounded-full text-xs xl:text-sm font-bold transition-all shadow-sm group whitespace-nowrap"
                  >
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors uppercase shrink-0">
                      {usuarioLogueado.iniciales}
                    </div>
                    <span>Mi Panel</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login?returnTo=/comunidad"
                  className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-full text-xs xl:text-sm font-bold transition-all shadow-sm whitespace-nowrap"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>

            {/* Menú Hamburguesa (Móvil) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 📱 DESPLEGABLE MENÚ MÓVIL */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <nav className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                    pathname === link.path
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="mt-6 pt-6 border-t border-slate-100">
                {/* 🟢 BOTONES MÓVILES (Notificaciones, Certificados y Panel) */}
                {usuarioLogueado ? (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/comunidad/notificaciones"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-rose-50 text-rose-700 px-4 py-3 rounded-xl font-bold"
                      >
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Alertas
                      </Link>
                      <Link
                        href="/comunidad/certificados"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full bg-amber-50 text-amber-700 px-4 py-3 rounded-xl font-bold"
                      >
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
                        Diplomas
                      </Link>
                    </div>
                    <Link
                      href={usuarioLogueado.rutaPanel}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center w-full bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl font-bold mt-2"
                    >
                      Volver a mi Panel Clínico
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login?returnTo=/comunidad"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-bold shadow-sm"
                  >
                    Iniciar Sesión
                  </Link>
                )}

                {/* 🟢 BOTÓN DE REGRESO AL INICIO (MÓVIL) */}
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-3 rounded-xl font-bold mt-2 transition-colors"
                >
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Volver al Inicio Principal
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-6 h-6 bg-slate-300 text-white rounded-md flex items-center justify-center font-bold text-xs">
              Ψ
            </div>
            <span className="font-bold text-slate-500 text-sm">
              Clinesfera Ecosistema © 2026
            </span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-400">
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Privacidad Clínica
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Términos de Uso
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Normas de la Comunidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

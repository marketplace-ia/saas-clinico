"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarPlus, History, Activity } from "lucide-react";
import BotonCerrarSesion from "../components/BotonCerrarSesion";

const menu = [
  { name: "Mi Resumen", href: "/dashboard-paciente", icon: LayoutDashboard },
  {
    name: "Agendar Cita",
    href: "/dashboard-paciente/agendar",
    icon: CalendarPlus,
  },
  {
    name: "Mi Historial",
    href: "/dashboard-paciente/historial",
    icon: History,
  },
];

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Conflicto de Tailwind resuelto */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Mi Portal</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-200">
          <BotonCerrarSesion />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

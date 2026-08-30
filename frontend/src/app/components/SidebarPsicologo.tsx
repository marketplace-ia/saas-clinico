"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BotonCerrarSesion from "./BotonCerrarSesion";

export default function SidebarPsicologo() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Mi Panel", href: "/dashboard-psicologo", icon: "🏠" },
    { name: "Agenda", href: "/dashboard-psicologo/agenda", icon: "📅" },
    {
      name: "Mis Pacientes",
      href: "/dashboard-psicologo/pacientes",
      icon: "👥",
    },
    {
      name: "Suscripción",
      href: "/dashboard-psicologo/suscripcion",
      icon: "💳",
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-md">
          L
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tight">
          Lumina
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <BotonCerrarSesion />
      </div>
    </aside>
  );
}

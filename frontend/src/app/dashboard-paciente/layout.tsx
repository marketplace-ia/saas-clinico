import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Activity,
} from "lucide-react";
import BotonCerrarSesion from "../components/BotonCerrarSesion";

export default function DashboardPacienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar / Menú Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex">
        {/* Logo de la Clínica */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <Activity className="w-7 h-7 text-emerald-600 mr-3" />
          <span className="font-bold text-xl text-slate-800 tracking-tight">
            PsiClinic
          </span>
        </div>

        {/* Enlaces de Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Enlace Activo (Principal) */}
          <Link
            href="/dashboard-paciente"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-xl transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Mi Resumen</span>
          </Link>

          {/* Enlaces a "Próximamente" */}
          <Link
            href="/proximamente"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Mis Citas</span>
          </Link>

          <Link
            href="/proximamente"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Mi Historial Médico</span>
          </Link>

          <Link
            href="/proximamente"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span>Pagos y Facturas</span>
          </Link>
        </nav>

        {/* Botón de Cerrar Sesión (Componente Universal) */}
        <div className="p-4 border-t border-slate-100">
          <BotonCerrarSesion />
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}

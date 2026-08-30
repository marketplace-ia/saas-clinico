import SidebarPsicologo from "../components/SidebarPsicologo";

export default function DashboardPsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* El Panel Izquierdo */}
      <div className="shrink-0 z-10">
        <SidebarPsicologo />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto relative">{children}</div>
    </div>
  );
}

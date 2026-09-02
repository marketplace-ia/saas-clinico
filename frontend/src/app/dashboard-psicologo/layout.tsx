import SidebarPsicologo from "../components/SidebarPsicologo";

export default function DashboardPsicologoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* El menú lateral (Fijo a la izquierda) */}
      <SidebarPsicologo />

      {/* El contenido principal (Con margen izquierdo 'ml-64' para no quedar debajo del menú) */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}

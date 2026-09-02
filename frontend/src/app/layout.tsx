import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "Clinesfera - Software de Gestión para Psicólogos",
  description:
    "Plataforma SaaS para gestión clínica, agendamiento y expedientes para psicólogos.",
  verification: {
    google: "S2t1Fha2s4yvLYydturB4Kuv_CJc60hTgn1nwbdi_AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Aquí está la magia: El LanguageProvider envuelve ABSOLUTAMENTE TODO */}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

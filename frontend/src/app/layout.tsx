import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "Lumina | ConnectedMind",
  description: "Infraestructura clínica y ecosistema de salud mental.",
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

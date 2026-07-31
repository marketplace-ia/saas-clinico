import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// IMPORTAMOS EL GUARDIÁN 👇
import GuardiaRutas from "./components/GuardiaRutas";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PsiClinic - Plataforma Clínica",
  description: "Sistema de gestión para profesionales de la salud mental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* ENVOLVEMOS LA APLICACIÓN CON EL GUARDIÁN 👇 */}
        <GuardiaRutas>{children}</GuardiaRutas>
      </body>
    </html>
  );
}

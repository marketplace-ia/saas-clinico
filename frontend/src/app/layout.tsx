import "./globals.css";

export const metadata = {
  title: "PsiClinic - Plataforma Clínica",
  description: "Gestión clínica integral y segura.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {/* Ya no hay GuardiaRutas bloqueando la carga, el middleware se encarga */}
        {children}
      </body>
    </html>
  );
}

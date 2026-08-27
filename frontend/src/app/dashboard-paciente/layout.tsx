"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function PacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const validarCandado = async () => {
      // 1. Verificamos si hay sesión activa
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Si no hay sesión, lo expulsamos al login de pacientes
        router.replace("/login");
        return;
      }

      // Si hay sesión, le damos paso libre
      setAutorizado(true);
    };

    validarCandado();
  }, [router]);

  // Pantalla de carga mientras se verifica la identidad
  if (!autorizado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-500 font-bold tracking-widest text-sm animate-pulse">
          CARGANDO PORTAL SEGURO...
        </p>
      </div>
    );
  }

  // Si está autorizado, mostramos el portal
  return <>{children}</>;
}

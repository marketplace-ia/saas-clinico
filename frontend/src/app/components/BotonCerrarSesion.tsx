"use client";

import { LogOut } from "lucide-react";
// Agregamos un "../" extra para que la ruta llegue a la carpeta lib correcta
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function BotonCerrarSesion() {
  const router = useRouter();

  const handleCerrarSesion = async () => {
    // 1. Cerramos sesión en Supabase
    await supabase.auth.signOut();

    // 2. Redirigimos al inicio
    router.push("/");
  };

  return (
    <button
      onClick={handleCerrarSesion}
      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
    >
      <LogOut className="w-5 h-5" />
      <span>Cerrar Sesión</span>
    </button>
  );
}

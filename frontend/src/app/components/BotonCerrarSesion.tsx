"use client";

import { useRouter } from "next/navigation";
// Importamos tu conexión centralizada limpia
import { supabase } from "../../../lib/supabase";

export default function BotonCerrarSesion() {
  const router = useRouter();

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleCerrarSesion}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow transition-colors"
    >
      Cerrar Sesión
    </button>
  );
}

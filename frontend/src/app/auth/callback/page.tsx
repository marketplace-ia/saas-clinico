"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Autenticando() {
  const router = useRouter();

  useEffect(() => {
    // Supabase lee el token oculto en la URL automáticamente.
    // Solo necesitamos empujar al usuario a la página principal ("/")
    // para que nuestro GuardiaRutas lo detecte y lo mande a su Dashboard.
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-600 font-medium animate-pulse">
        Completando inicio de sesión...
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { KeyRound, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ActivacionStaff() {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Obtenemos el ID del usuario actual al cargar la página
  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      } else {
        router.push("/login"); // Si no está logueado, lo mandamos al login
      }
    };
    obtenerUsuario();
  }, [router]);

  const verificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    if (!userId) return;

    let nuevoRol = "";

    // Validamos el código ingresado contra tus códigos secretos
    if (codigo === "PRO-PSICLINIC-2026") {
      nuevoRol = "psicologo";
    } else if (codigo === "SEC-PSICLINIC-2026") {
      nuevoRol = "secretaria";
    } else {
      setError(
        "El código ingresado no es válido. Verifica con Administración.",
      );
      setCargando(false);
      return;
    }

    // Si el código es correcto, actualizamos su rol en la base de datos
    const { error: updateError } = await supabase
      .from("roles_usuarios")
      .update({ rol: nuevoRol })
      .eq("id", userId);

    if (updateError) {
      setError("Hubo un error al actualizar tu cuenta. Intenta de nuevo.");
      setCargando(false);
    } else {
      // ¡Éxito! Refrescamos la página para que el GuardiaRutas lo detecte y lo mande a su nuevo Dashboard
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Acceso Corporativo
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Ingresa el código proporcionado por la clínica para activar tus
            herramientas de trabajo.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={verificarCodigo} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Código de Verificación
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all uppercase font-medium"
                placeholder="EJ-CODIGO-2026"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {cargando ? "Verificando..." : "Activar mi cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

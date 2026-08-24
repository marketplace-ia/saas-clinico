"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ActivacionStaffPage() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const CODIGO_SECRETO = "CLINICA-PRO-2026";

  const activarCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    if (codigo !== CODIGO_SECRETO) {
      setError("Código de autorización inválido o expirado.");
      setCargando(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { rol: "psicologo" },
      });

      if (updateError) throw updateError;

      await supabase.auth.refreshSession();

      alert(
        "¡Autenticación exitosa! Tu cuenta ha sido elevada a Especialista.",
      );

      window.location.href = "/dashboard-psicologo";
    } catch (err) {
      // CORRECCIÓN TYPESCRIPT APLICADA AQUÍ
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al actualizar el perfil clínico.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-blue-600">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl shadow-inner">
            🛡️
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Activación de Especialista
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Ingresa el código de seguridad institucional para habilitar tu panel
          clínico.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={activarCuenta} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Código Institucional
            </label>
            <input
              type="password"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 p-3 outline-none focus:border-blue-600 text-center tracking-widest font-mono text-lg transition"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 rounded-lg font-bold shadow-md transition-all text-white ${
              cargando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {cargando
              ? "Verificando credenciales..."
              : "Autorizar y Activar Cuenta"}
          </button>
        </form>

        <button
          onClick={() => router.push("/dashboard-paciente")}
          className="mt-6 w-full text-sm text-gray-400 hover:text-gray-600 transition"
        >
          ← Cancelar y volver
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ActivacionSecretariaPage() {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<{ id: string; email: string } | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login-personal");
      } else {
        setUsuario({ id: user.id, email: user.email || "" });
      }
    };
    obtenerUsuario();
  }, [router]);

  const vincularCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setCargando(true);
    setError("");

    try {
      // Validar formato básico de UUID (Código de Clínica)
      if (codigo.length < 30) {
        throw new Error(
          "El código ingresado no es válido. Debe ser el identificador largo proporcionado por tu psicólogo.",
        );
      }

      // 🔥 LLAMAMOS A LA SÚPER FUNCIÓN AUTOMÁTICA EN LA BASE DE DATOS
      const { error: rpcError } = await supabase.rpc(
        "vincular_secretaria_y_actualizar_rol",
        {
          p_id: usuario.id,
          p_nombre: nombre,
          p_correo: usuario.email,
          p_psicologo_id: codigo,
        },
      );

      if (rpcError) throw rpcError;

      alert(
        "¡Cuenta vinculada con éxito! Ahora tienes acceso al panel de tu psicólogo.",
      );

      // La mandamos de vuelta al radar para que la redirija correctamente
      router.push("/login");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al vincular. Verifica que el código sea correcto.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-2xl">
          🔗
        </div>

        <h1 className="text-2xl font-black text-slate-900 text-center mb-2">
          Vincular Cuenta
        </h1>
        <p className="text-slate-500 text-center mb-8 font-medium">
          Ingresa el Código de Clínica que te proporcionó el psicólogo para
          conectarte a su agenda.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={vincularCuenta} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tu Nombre Completo
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ana Pérez"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Código de Clínica (ID del Psicólogo)
            </label>
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Pega el código aquí..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2"
          >
            {cargando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Vincular y Entrar al Sistema"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

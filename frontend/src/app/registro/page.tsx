"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

export default function RegistroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: rolError } = await supabase
          .from("roles_usuarios")
          .insert([{ correo: email, rol: "paciente" }]);

        if (rolError) throw rolError;
      }

      setExito(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      const errorObj = err as { message?: string };
      const mensajeReal = errorObj.message || "Error desconocido";

      // NUEVO: Ahora atrapamos también el error de "llave duplicada" de la base de datos
      if (
        mensajeReal.includes("User already registered") ||
        mensajeReal.includes("already exists") ||
        mensajeReal.includes("duplicate key value")
      ) {
        setError(
          "Este correo electrónico ya está registrado. Por favor, inicia sesión.",
        );
      } else {
        setError(`Error del sistema: ${mensajeReal}`);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition font-medium text-sm"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver a la página principal
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-500 text-sm">
            Regístrate para agendar tus citas clínicas
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        {exito ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ¡Cuenta creada con éxito!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Tu cuenta ha sido registrada correctamente. Ya puedes acceder a tu
              portal.
            </p>
            <Link
              href="/login"
              className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegistro} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1 font-medium">
                Contraseña (Mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-2.5 rounded-lg font-medium transition text-white ${cargando ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"}`}
            >
              {cargando ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>
        )}

        {!exito && (
          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

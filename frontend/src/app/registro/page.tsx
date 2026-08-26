"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroSaaSPage() {
  const router = useRouter();

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    clinica: "",
    plan: "profesional",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      // 1. Creamos el usuario en Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // 2. Usamos UPSERT: Si no existe lo crea, si existe lo actualiza sin dar error.
      if (data.user) {
        const { error: rolError } = await supabase
          .from("roles_usuarios")
          .upsert([{ correo: formData.email, rol: "psicologo" }], {
            onConflict: "correo",
          });

        if (rolError) throw rolError;
      }

      setMensaje({
        tipo: "exito",
        texto: "¡Cuenta creada con éxito! Configurando tu clínica...",
      });

      // 3. Lo redirigimos al Dashboard del psicólogo
      setTimeout(() => {
        router.push("/dashboard-psicologo");
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const error = err as { message?: string };

      let mensajeError = "Hubo un error al crear la cuenta.";

      if (error.message?.includes("already registered")) {
        mensajeError =
          "Este correo ya está registrado en el sistema. Intenta iniciar sesión.";
      } else if (error.message?.includes("Password")) {
        mensajeError =
          "La contraseña es muy débil (usa al menos 6 caracteres).";
      } else {
        mensajeError = `Error de Supabase: ${error.message}`;
      }

      setMensaje({ tipo: "error", texto: mensajeError });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white selection:bg-blue-200">
      {/* LADO IZQUIERDO: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 xl:p-20 relative z-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-12">
          <Link
            href="/"
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            Ψ
          </Link>
          <span className="font-black text-2xl text-gray-900 tracking-tight">
            PsiClinic<span className="text-blue-600">.</span>
          </span>
        </div>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Comienza tu prueba gratis
          </h1>
          <p className="text-gray-500 mb-8">
            Únete a cientos de profesionales que ya automatizaron su clínica.
            Sin tarjeta de crédito.
          </p>

          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 font-bold text-sm ${mensaje.tipo === "exito" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
            >
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleRegistro} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Dr. Juan Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nombre de tu Clínica / Consultorio
              </label>
              <input
                required
                type="text"
                name="clinica"
                value={formData.clinica}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Ej: Centro de Bienestar Mente Sana"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="tucorreo@clinica.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Contraseña Segura
              </label>
              <input
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Plan a Probar (14 días gratis)
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700"
              >
                <option value="basico">Plan Básico ($29/mes)</option>
                <option value="profesional">
                  Plan Profesional ($59/mes) - Recomendado
                </option>
                <option value="clinica">Plan Clínica ($129/mes)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 ${cargando ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 hover:shadow-blue-500/30"}`}
            >
              {cargando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                  Creando cuenta...
                </>
              ) : (
                "Crear Mi Cuenta Ahora"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login-personal"
              className="text-blue-600 hover:underline font-bold"
            >
              Inicia Sesión aquí
            </Link>
          </p>
        </div>
      </div>

      {/* LADO DERECHO: Beneficios (Oculto en móviles) */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-gray-900 to-blue-950 p-12 relative overflow-hidden flex-col justify-center items-center">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6">
            Con la confianza de +500 clínicas
          </div>

          <h2 className="text-4xl font-black mb-6 leading-tight">
            &quot;Desde que uso PsiClinic, reduje un 40% las cancelaciones y
            tengo todo mi consultorio en mi bolsillo.&quot;
          </h2>

          <div className="flex items-center gap-4 mt-8">
            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center font-bold text-xl border-2 border-blue-500 shadow-lg">
              👩‍⚕️
            </div>
            <div>
              <p className="font-bold text-lg">Dra. Camila Rojas</p>
              <p className="text-blue-300 text-sm">
                Psicóloga Clínica Independiente
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-16 border-t border-white/10 pt-10">
            <div>
              <p className="text-3xl font-black text-white mb-1">100%</p>
              <p className="text-sm text-blue-200">
                Historias Clínicas Seguras
              </p>
            </div>
            <div>
              <p className="text-3xl font-black text-white mb-1">0%</p>
              <p className="text-sm text-blue-200">Comisiones ocultas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

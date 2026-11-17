"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";

interface Secretaria {
  id: string;
  nombre: string;
  correo: string;
  estado: string;
  created_at: string;
}

export default function EquipoPsicologoPage() {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el nuevo formulario de creación
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [exitoForm, setExitoForm] = useState<string | null>(null);
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const cargarDatos = useCallback(async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) return;

      // Mantenemos tu consulta original para listar al personal
      const { data, error } = await supabase
        .from("perfil_secretaria")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setSecretarias(data);
    } catch (error) {
      console.error("Error al cargar el equipo:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const iniciar = async () => {
      await cargarDatos();
    };
    iniciar();
  }, [cargarDatos]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleCrearSecretaria = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setErrorForm(null);
    setExitoForm(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No hay sesión activa.");

      // Llamada al endpoint backend que creamos para automatizar la vinculación
      const respuesta = await fetch("/api/equipo/crear-secretaria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nombre: formulario.nombre,
          email: formulario.correo,
          password: formulario.password,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || "Error al crear la cuenta");
      }

      setExitoForm(
        "¡Secretaria creada y vinculada con éxito! Ya puede iniciar sesión.",
      );
      setFormulario({ nombre: "", correo: "", password: "" });

      // Recargar la lista de secretarias en el panel derecho
      await cargarDatos();
    } catch (err: unknown) {
      const msj = err instanceof Error ? err.message : "Error desconocido";
      setErrorForm(msj);
    } finally {
      setCreando(false);
      // Limpiar el mensaje de éxito después de unos segundos
      setTimeout(() => setExitoForm(null), 5000);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-6xl mx-auto font-sans animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Mi Equipo Administrativo
        </h1>
        <p className="text-slate-500 text-lg">
          Crea las cuentas de tu personal de recepción. Serán vinculadas
          automáticamente a tu consultorio y facturación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Panel Izquierdo: Formulario de Creación Directa */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Añadir Recepcionista
            </h2>

            {errorForm && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100">
                {errorForm}
              </div>
            )}
            {exitoForm && (
              <div className="mb-6 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {exitoForm}
              </div>
            )}

            <form onSubmit={handleCrearSecretaria} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej. María López"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  required
                  value={formulario.correo}
                  onChange={manejarCambio}
                  placeholder="recepcion@clinica.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formulario.password}
                  onChange={manejarCambio}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={creando}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creando ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Crear y Vincular Cuenta"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel Derecho: Lista de Secretarias (Mantenido intacto de tu diseño original) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm h-full">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center text-lg border border-slate-100">
                👩‍💻
              </span>
              Personal Vinculado
            </h3>

            {secretarias.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-black text-slate-700 text-lg">
                  No hay nadie en tu equipo aún
                </p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                  Utiliza el formulario de la izquierda para crear la cuenta de
                  tu recepcionista. Una vez creada, aparecerá aquí
                  automáticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {secretarias.map((sec) => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors hover:border-indigo-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-sm">
                        {sec.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {sec.nombre}
                        </p>
                        <p className="text-sm font-medium text-slate-500">
                          {sec.correo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {sec.estado.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

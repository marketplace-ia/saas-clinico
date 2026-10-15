"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useParams } from "next/navigation";

interface PerfilPublico {
  psicologo_id: string;
  nombre_completo?: string;
  nombre_comercial?: string;
  especialidad: string;
  ciudad: string;
  eslogan?: string;
  color_principal?: string;
  precio_consulta?: number;
  modalidad?: string;
}

interface DatosBancarios {
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  titular: string;
  identificacion: string;
}

export default function PortalPacientePage() {
  const params = useParams();
  const id = params.id as string;

  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [banco, setBanco] = useState<DatosBancarios | null>(null);
  const [error, setError] = useState("");

  // Estados del Modal de Reserva
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pasoReserva, setPasoReserva] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");

  // Formulario del Paciente
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
  });
  const [archivo, setArchivo] = useState<File | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return;
      try {
        // 1. Perfil Público
        const { data: dataPerfil, error: errPerfil } = await supabase
          .from("perfil_psicologo")
          .select("*")
          .eq("psicologo_id", id)
          .single();

        if (errPerfil || !dataPerfil)
          throw new Error("Perfil no verificado o no encontrado.");
        setPerfil(dataPerfil);

        // 2. Datos Bancarios Públicos (Dominio B)
        const { data: dataBanco } = await supabase
          .from("datos_bancarios")
          .select("*")
          .eq("psicologo_id", id)
          .single();

        if (dataBanco) setBanco(dataBanco);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Error cargando el portal.",
        );
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [id]);

  const procesarReserva = async () => {
    if (!archivo || !perfil) return;
    setProcesando(true);
    setErrorReserva("");

    try {
      const fechaHoraISO = new Date(
        `${form.fecha}T${form.hora}:00`,
      ).toISOString();
      const formData = new FormData();
      formData.append("psicologo_id", id);
      formData.append("nombre", form.nombre);
      formData.append("email", form.email);
      formData.append("telefono", form.telefono);
      formData.append("fechaHora", fechaHoraISO);
      formData.append("monto", (perfil.precio_consulta || 0).toString());
      formData.append("comprobante", archivo);

      const res = await fetch("/api/pacientes/agendar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al procesar la reserva.");

      setPasoReserva(3); // Éxito
    } catch (err: unknown) {
      setErrorReserva(
        err instanceof Error ? err.message : "Hubo un error de conexión.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  if (error || !perfil)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-slate-800">{error}</h1>
      </div>
    );

  const colorTema = perfil.color_principal || "#4F46E5";
  const nombreMostrar =
    perfil.nombre_comercial ||
    perfil.nombre_completo ||
    "Profesional de la Salud";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HEADER CORPORATIVO */}
      <div
        className="h-64 w-full relative"
        style={{ backgroundColor: colorTema }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
          <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-xl border-4 border-slate-50">
            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-slate-400">
              {nombreMostrar.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO DEL PERFIL */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
            ✓ Verificado por Clinesfera
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            {nombreMostrar}
          </h1>
          <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">
            {perfil.especialidad}
          </p>
          {perfil.eslogan && (
            <p className="mt-4 text-slate-600 font-medium italic text-lg">
              &quot;{perfil.eslogan}&quot;
            </p>
          )}
        </div>

        {/* MÓDULO DE SERVICIOS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              Servicios Disponibles
            </h2>
          </div>

          <div className="p-6 md:p-8">
            <div
              className="flex w-full items-center justify-between p-6 border-2 rounded-2xl"
              style={{ borderColor: colorTema }}
            >
              <div>
                <p className="font-bold text-slate-900 text-lg">
                  Consulta Psicológica Individual
                </p>
                <p className="text-slate-500 text-sm font-medium mt-1">
                  {perfil.modalidad || "Online / Presencial"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">
                  ${perfil.precio_consulta || "40.00"}
                </span>
                <span className="text-xs font-bold text-slate-400 block">
                  USD
                </span>
              </div>
            </div>

            <button
              onClick={() => setModalAbierto(true)}
              className="mt-8 w-full text-white font-black py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-lg"
              style={{ backgroundColor: colorTema }}
            >
              Agendar Cita Ahora
            </button>
            <p className="text-center text-xs text-slate-400 font-medium mt-4">
              Pagos procesados directamente a la cuenta del profesional.
            </p>
          </div>
        </div>
      </div>

      {/* 🟢 MODAL DE AGENDAMIENTO Y PAGO (Flujo B2B2C) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900">Solicitud de Cita</h3>
              <button
                onClick={() => {
                  setModalAbierto(false);
                  setPasoReserva(1);
                }}
                className="text-slate-400 hover:text-rose-500 font-bold p-2"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="p-6 md:p-8">
              {errorReserva && (
                <div className="bg-rose-50 text-rose-600 text-sm font-bold p-3 rounded-xl mb-4">
                  {errorReserva}
                </div>
              )}

              {/* PASO 1: DATOS DEL PACIENTE */}
              {pasoReserva === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-lg font-black text-slate-800 mb-4">
                    1. Tus datos y horario
                  </h4>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                  />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">
                        Fecha
                      </label>
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                        value={form.fecha}
                        onChange={(e) =>
                          setForm({ ...form, fecha: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">
                        Hora Preferida
                      </label>
                      <input
                        type="time"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                        value={form.hora}
                        onChange={(e) =>
                          setForm({ ...form, hora: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    disabled={
                      !form.nombre || !form.email || !form.fecha || !form.hora
                    }
                    onClick={() => setPasoReserva(2)}
                    className="w-full mt-6 text-white font-black py-3.5 rounded-xl transition-all disabled:opacity-50"
                    style={{ backgroundColor: colorTema }}
                  >
                    Continuar al Pago →
                  </button>
                </div>
              )}

              {/* PASO 2: INSTRUCCIONES BANCARIAS Y COMPROBANTE */}
              {pasoReserva === 2 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-black text-slate-800 mb-2">
                    2. Pago de Consulta
                  </h4>
                  <p className="text-sm text-slate-500 mb-6">
                    Realiza la transferencia por{" "}
                    <strong>${perfil.precio_consulta} USD</strong> a la
                    siguiente cuenta y adjunta el comprobante.
                  </p>

                  {banco ? (
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6 text-sm">
                      <p className="font-medium text-slate-600">
                        Banco:{" "}
                        <span className="font-bold text-slate-900">
                          {banco.banco}
                        </span>
                      </p>
                      <p className="font-medium text-slate-600">
                        Tipo:{" "}
                        <span className="font-bold text-slate-900">
                          {banco.tipo_cuenta}
                        </span>
                      </p>
                      <p className="font-medium text-slate-600">
                        Cuenta:{" "}
                        <span className="font-mono font-bold text-slate-900">
                          {banco.numero_cuenta}
                        </span>
                      </p>
                      <p className="font-medium text-slate-600">
                        Titular:{" "}
                        <span className="font-bold text-slate-900">
                          {banco.titular}
                        </span>
                      </p>
                      <p className="font-medium text-slate-600">
                        ID:{" "}
                        <span className="font-bold text-slate-900">
                          {banco.identificacion}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl mb-6 text-sm font-medium border border-amber-200">
                      Este profesional aún no ha configurado sus datos
                      bancarios. No puedes proceder con la reserva.
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-6 relative group flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) =>
                        setArchivo(e.target.files ? e.target.files[0] : null)
                      }
                      disabled={!banco}
                    />
                    {archivo ? (
                      <p className="font-bold text-indigo-600 text-sm text-center">
                        {archivo.name}
                      </p>
                    ) : (
                      <div className="text-center text-slate-500 text-sm font-medium">
                        Click para adjuntar el comprobante PDF/JPG
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setPasoReserva(1)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
                    >
                      ← Volver
                    </button>
                    <button
                      onClick={procesarReserva}
                      disabled={!archivo || !banco || procesando}
                      className="flex-1 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                      style={{ backgroundColor: colorTema }}
                    >
                      {procesando ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Confirmar Reserva"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3: ÉXITO */}
              {pasoReserva === 3 && (
                <div className="text-center py-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    ¡Reserva Enviada!
                  </h3>
                  <p className="text-slate-500 font-medium mb-8">
                    Tu solicitud de cita y comprobante de pago han sido enviados
                    a {nombreMostrar}. Recibirás la confirmación pronto.
                  </p>
                  <button
                    onClick={() => {
                      setModalAbierto(false);
                      setPasoReserva(1);
                      setForm({
                        nombre: "",
                        email: "",
                        telefono: "",
                        fecha: "",
                        hora: "",
                      });
                      setArchivo(null);
                    }}
                    className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Cerrar Ventana
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

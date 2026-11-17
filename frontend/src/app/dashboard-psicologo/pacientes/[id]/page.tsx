"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CampoDinamico } from "../../constructor-historias/page"; // Reutilizamos los tipos

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  identificacion?: string;
}

interface NotaEvolucion {
  id: string;
  creado_el: string;
  contenido: string;
}

interface DocumentoClinico {
  id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  categoria: string;
  creado_el: string;
}

export default function FichaPacientePage() {
  const params = useParams();
  const pacienteId = params.id as string;

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historiaBase, setHistoriaBase] = useState<{ id: string } | null>(null);

  const [cargando, setCargando] = useState(true);
  const [errorUI, setErrorUI] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState("evolucion");

  const [notas, setNotas] = useState<NotaEvolucion[]>([]);
  const [cargandoNotas, setCargandoNotas] = useState(false);
  const [modalNotaAbierto, setModalNotaAbierto] = useState(false);
  const [guardandoNota, setGuardandoNota] = useState(false);

  const [nuevaNota, setNuevaNota] = useState({
    fecha: "",
    hora: "",
    subjetivo: "",
    objetivo: "",
    analisis: "",
    plan: "",
  });

  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([]);
  const [cargandoDocs, setCargandoDocs] = useState(false);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [visorDoc, setVisorDoc] = useState<{
    url: string;
    tipo: string;
  } | null>(null);

  // ==========================================
  // 🟢 ESTADOS DEL MOTOR DINÁMICO
  // ==========================================
  const [plantillaDinamica, setPlantillaDinamica] = useState<{
    id: string;
    titulo: string;
    campos: CampoDinamico[];
  } | null>(null);
  const [respuestasDinamicas, setRespuestasDinamicas] = useState<
    Record<string, string | boolean | string[]>
  >({});
  const [idHistoriaDinamica, setIdHistoriaDinamica] = useState<string | null>(
    null,
  );
  const [editandoHistoria, setEditandoHistoria] = useState(false);
  const [guardandoHistoria, setGuardandoHistoria] = useState(false);

  useEffect(() => {
    const inicializarFecha = async () => {
      setNuevaNota((prev) => ({
        ...prev,
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    };
    inicializarFecha();
  }, []);

  const cargarDatosPrincipales = useCallback(async () => {
    if (!pacienteId) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión clínica no detectada.");

      const { data: dataPaciente, error: errPaciente } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", pacienteId)
        .single();

      if (errPaciente) throw new Error("Paciente no encontrado o sin acceso.");
      setPaciente(dataPaciente);

      // Cargar Historia Clínica Base (Para Notas SOAP)
      const resHistoria = await supabase
        .from("historias_clinicas")
        .select("id")
        .eq("paciente_id", pacienteId)
        .maybeSingle();
      let hBase = resHistoria.data;
      if (!hBase && !resHistoria.error) {
        const { data: tu } = await supabase
          .from("tenant_users")
          .select("tenant_id")
          .eq("usuario_id", user.id)
          .maybeSingle();
        const { data: nuevaHist } = await supabase
          .from("historias_clinicas")
          .insert({
            tenant_id: tu?.tenant_id || null,
            paciente_id: pacienteId,
            psicologo_id: user.id,
          })
          .select("id")
          .single();
        hBase = nuevaHist;
      }
      setHistoriaBase(hBase);

      // ==========================================
      // 🟢 CARGAR MOTOR DINÁMICO
      // ==========================================
      // 1. Buscamos si el psicólogo diseñó una plantilla
      const { data: plantilla } = await supabase
        .from("plantillas_historias")
        .select("*")
        .eq("creador_id", user.id)
        .eq("rol", "psicologo")
        .maybeSingle();

      if (plantilla) {
        setPlantillaDinamica({
          id: plantilla.id,
          titulo: plantilla.titulo,
          campos: Array.isArray(plantilla.campos_json)
            ? plantilla.campos_json
            : [],
        });

        // 2. Buscamos si el paciente ya tiene esta historia llena
        const { data: historiaLlena } = await supabase
          .from("historias_dinamicas_pacientes")
          .select("*")
          .eq("paciente_id", pacienteId)
          .eq("plantilla_id", plantilla.id)
          .maybeSingle();

        if (historiaLlena) {
          setIdHistoriaDinamica(historiaLlena.id);
          setRespuestasDinamicas(historiaLlena.respuestas_json || {});
        }
      }
    } catch (error: unknown) {
      setErrorUI(error instanceof Error ? error.message : "Error interno");
    } finally {
      setCargando(false);
    }
  }, [pacienteId]);

  const cargarNotas = useCallback(async () => {
    if (!historiaBase) return;
    setCargandoNotas(true);
    try {
      const { data, error } = await supabase
        .from("hcu_evoluciones")
        .select("*")
        .eq("historia_clinica_id", historiaBase.id)
        .order("creado_en", { ascending: false });
      if (error) throw error;

      const notasFormateadas = (data || []).map((d) => ({
        id: d.id,
        creado_el: d.creado_en || d.fecha,
        contenido:
          `${d.motivo_sesion || ""}\n\n${d.respuesta_paciente || ""}\n\n${d.intervencion_tecnicas || ""}`.trim(),
      }));
      setNotas(notasFormateadas);
    } catch (error) {
      console.error("Error notas:", error);
    } finally {
      setCargandoNotas(false);
    }
  }, [historiaBase]);

  const cargarDocumentos = useCallback(async () => {
    if (!pacienteId) return;
    setCargandoDocs(true);
    try {
      const { data, error } = await supabase
        .from("documentos_clinicos")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("creado_el", { ascending: false });
      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setCargandoDocs(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    const ejecutarCargas = async () => {
      await cargarDatosPrincipales();
      if (pestanaActiva === "evolucion" && historiaBase) await cargarNotas();
      if (pestanaActiva === "documentos") await cargarDocumentos();
    };
    ejecutarCargas();
  }, [
    pestanaActiva,
    historiaBase,
    cargarDatosPrincipales,
    cargarNotas,
    cargarDocumentos,
  ]);

  // ==========================================
  // 🟢 GUARDAR HISTORIA DINÁMICA
  // ==========================================
  const guardarHistoriaDinamica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantillaDinamica) return;
    setGuardandoHistoria(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (idHistoriaDinamica) {
        // Actualizar
        await supabase
          .from("historias_dinamicas_pacientes")
          .update({ respuestas_json: respuestasDinamicas })
          .eq("id", idHistoriaDinamica);
      } else {
        // Insertar
        const { data } = await supabase
          .from("historias_dinamicas_pacientes")
          .insert({
            plantilla_id: plantillaDinamica.id,
            paciente_id: pacienteId,
            profesional_id: session?.user.id,
            respuestas_json: respuestasDinamicas,
          })
          .select()
          .single();

        if (data) setIdHistoriaDinamica(data.id);
      }

      alert("✅ Ficha clínica actualizada exitosamente.");
      setEditandoHistoria(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la ficha clínica.");
    } finally {
      setGuardandoHistoria(false);
    }
  };

  const manejarCambioRespuesta = (
    campoId: string,
    valor: string | boolean | string[],
  ) => {
    setRespuestasDinamicas((prev) => ({
      ...prev,
      [campoId]: valor,
    }));
  };

  const subirDocumento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return alert("El archivo es demasiado grande. Máximo 10MB.");

    setSubiendoDoc(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sin sesión activa.");

      let tenantID = null;
      const { data: tu } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", session.user.id)
        .maybeSingle();
      if (tu?.tenant_id) tenantID = tu.tenant_id;

      const fileExt = file.name.split(".").pop();
      const fileName = `${pacienteId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos_pacientes")
        .upload(fileName, file);
      if (uploadError)
        throw new Error(`STORAGE RECHAZADO: ${uploadError.message}`);

      const { error: dbError } = await supabase
        .from("documentos_clinicos")
        .insert({
          tenant_id: tenantID,
          paciente_id: pacienteId,
          psicologo_id: session.user.id,
          storage_path: fileName,
          mime_type: file.type,
          size_bytes: file.size,
          categoria: "general",
        });

      if (dbError) throw new Error(`DB RECHAZO: ${dbError.message}`);
      alert("✅ Archivo guardado y encriptado exitosamente en la bóveda.");
      cargarDocumentos();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error desconocido.");
    } finally {
      setSubiendoDoc(false);
      e.target.value = "";
    }
  };

  const verDocumentoSeguro = async (path: string, mimeType: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("documentos_pacientes")
        .createSignedUrl(path, 60);
      if (error || !data)
        throw new Error("No se pudo obtener la llave de acceso.");
      setVisorDoc({
        url: data.signedUrl,
        tipo: mimeType.includes("pdf") ? "pdf" : "imagen",
      });
    } catch (error: unknown) {
      console.error(error);
      alert("Acceso denegado al archivo.");
    }
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!historiaBase)
      return alert("Error: El expediente base no está inicializado.");
    setGuardandoNota(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { error } = await supabase.from("hcu_evoluciones").insert([
        {
          historia_clinica_id: historiaBase.id,
          psicologo_id: session?.user.id,
          fecha: nuevaNota.fecha,
          hora: nuevaNota.hora,
          motivo_sesion: `SUBJETIVO Y OBJETIVO:\n${nuevaNota.subjetivo}\n${nuevaNota.objetivo}`,
          respuesta_paciente: `ANÁLISIS CLÍNICO:\n${nuevaNota.analisis}`,
          intervencion_tecnicas: `PLAN TERAPÉUTICO:\n${nuevaNota.plan}`,
        },
      ]);
      if (error) throw error;
      setNuevaNota({
        ...nuevaNota,
        subjetivo: "",
        objetivo: "",
        analisis: "",
        plan: "",
      });
      setModalNotaAbierto(false);
      cargarNotas();
    } catch (error) {
      console.error(error);
    } finally {
      setGuardandoNota(false);
    }
  };

  if (cargando)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  if (errorUI || !paciente)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-black text-slate-900">Acceso Denegado</h2>
        <p className="text-slate-500">
          {errorUI || "No tienes permisos para ver este expediente."}
        </p>
        <Link
          href="/dashboard-psicologo/pacientes"
          className="mt-4 inline-block text-indigo-600 font-bold"
        >
          Volver
        </Link>
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative pb-20">
      <Link
        href="/dashboard-psicologo/pacientes"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>{" "}
        Volver al Directorio
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-50 to-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-500/30 shrink-0 uppercase">
            {paciente.nombres.charAt(0)}
            {paciente.apellidos.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900">
                {paciente.nombres} {paciente.apellidos}
              </h1>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Expediente Activo
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
              {paciente.email && (
                <span className="flex items-center gap-1.5">
                  📧 {paciente.email}
                </span>
              )}
              {paciente.telefono && (
                <span className="flex items-center gap-1.5">
                  📱 {paciente.telefono}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                🆔 ID: {paciente.identificacion || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: "evolucion", nombre: "Notas de Evolución" },
          { id: "historia", nombre: "Ficha Clínica" }, // 🟢 Nueva pestaña dinámica
          { id: "documentos", nombre: "Documentos Adjuntos" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPestanaActiva(tab.id)}
            className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${pestanaActiva === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            {tab.nombre}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 min-h-100">
        {/* ============================================================== */}
        {/* PESTAÑA: NOTAS SOAP                                            */}
        {/* ============================================================== */}
        {pestanaActiva === "evolucion" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Bóveda de Evoluciones
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Registros médicos en formato SOAP.
                </p>
              </div>
              <button
                onClick={() => setModalNotaAbierto(true)}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md"
              >
                Nueva Nota SOAP
              </button>
            </div>
            {cargandoNotas ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : notas.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                <h4 className="text-lg font-bold text-slate-700">
                  Sin evoluciones
                </h4>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-6 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {notas.map((nota) => (
                  <div key={nota.id} className="relative pl-12 md:pl-16 group">
                    <div className="absolute left-0 w-10 h-10 md:w-12 md:h-12 bg-indigo-50 border-4 border-white rounded-full flex items-center justify-center shadow-sm z-10 text-indigo-600">
                      📝
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                      <h4 className="text-lg font-black text-slate-900 mb-4">
                        {new Date(nota.creado_el).toLocaleDateString()}
                      </h4>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {nota.contenido}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA: FICHA CLÍNICA (RENDERIZADO DINÁMICO)                  */}
        {/* ============================================================== */}
        {pestanaActiva === "historia" && (
          <div className="animate-in fade-in duration-300">
            {!plantillaDinamica ? (
              <div className="p-12 border-2 border-dashed border-slate-300 rounded-3xl text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No tienes una plantilla configurada
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Dirígete al Constructor de Fichas para diseñar los campos que
                  quieres solicitar a tus pacientes.
                </p>
                <Link
                  href="/dashboard-psicologo/constructor-historias"
                  className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-md"
                >
                  Ir al Constructor
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {plantillaDinamica.titulo}
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">
                      Formato de Ficha Personalizada
                    </p>
                  </div>
                  {!editandoHistoria && (
                    <button
                      onClick={() => setEditandoHistoria(true)}
                      className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-md"
                    >
                      📝 Editar Respuestas
                    </button>
                  )}
                </div>

                {editandoHistoria ? (
                  <form
                    onSubmit={guardarHistoriaDinamica}
                    className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6"
                  >
                    {plantillaDinamica.campos.map((campo) => (
                      <div key={campo.id}>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          {campo.etiqueta}{" "}
                          {campo.requerido && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>

                        {campo.tipo === "texto_corto" && (
                          <input
                            type="text"
                            required={campo.requerido}
                            value={
                              (respuestasDinamicas[campo.id] as string) || ""
                            }
                            onChange={(e) =>
                              manejarCambioRespuesta(campo.id, e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                          />
                        )}

                        {campo.tipo === "parrafo" && (
                          <textarea
                            rows={4}
                            required={campo.requerido}
                            value={
                              (respuestasDinamicas[campo.id] as string) || ""
                            }
                            onChange={(e) =>
                              manejarCambioRespuesta(campo.id, e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                          />
                        )}

                        {campo.tipo === "seleccion" && (
                          <select
                            required={campo.requerido}
                            value={
                              (respuestasDinamicas[campo.id] as string) || ""
                            }
                            onChange={(e) =>
                              manejarCambioRespuesta(campo.id, e.target.value)
                            }
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium bg-white"
                          >
                            <option value="">Selecciona una opción...</option>
                            {campo.opciones?.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        )}

                        {campo.tipo === "casilla" && (
                          <label className="flex items-center gap-3 cursor-pointer mt-2 bg-white p-4 rounded-xl border border-slate-200">
                            <input
                              type="checkbox"
                              required={campo.requerido}
                              checked={!!respuestasDinamicas[campo.id]}
                              onChange={(e) =>
                                manejarCambioRespuesta(
                                  campo.id,
                                  e.target.checked,
                                )
                              }
                              className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-slate-700 font-medium">
                              Sí / Confirmado
                            </span>
                          </label>
                        )}
                      </div>
                    ))}

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditandoHistoria(false)}
                        className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-200 rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardandoHistoria}
                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md"
                      >
                        {guardandoHistoria
                          ? "Guardando..."
                          : "💾 Guardar Ficha"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plantillaDinamica.campos.map((campo) => (
                      <div
                        key={campo.id}
                        className={`${campo.tipo === "parrafo" ? "md:col-span-2" : "md:col-span-1"} bg-slate-50 p-6 rounded-2xl border border-slate-100`}
                      >
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                          {campo.etiqueta}
                        </h5>
                        <p className="text-slate-800 font-bold whitespace-pre-wrap">
                          {campo.tipo === "casilla"
                            ? respuestasDinamicas[campo.id]
                              ? "✅ Sí"
                              : "❌ No"
                            : respuestasDinamicas[campo.id] || (
                                <span className="text-slate-400 italic font-normal">
                                  Sin responder
                                </span>
                              )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA: DOCUMENTOS ADJUNTOS                                   */}
        {/* ============================================================== */}
        {pestanaActiva === "documentos" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Bóveda de Documentos
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Exámenes, informes y consentimientos encriptados.
                </p>
              </div>

              <label
                className={`cursor-pointer bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-2 ${subiendoDoc ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                {subiendoDoc ? "Subiendo..." : "Subir Archivo"}
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={subirDocumento}
                  disabled={subiendoDoc}
                />
              </label>
            </div>

            {cargandoDocs ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              </div>
            ) : documentos.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  📁
                </div>
                <h4 className="text-lg font-bold text-slate-700">
                  Sin documentos adjuntos
                </h4>
                <p className="text-slate-500 text-sm mt-1">
                  Sube exámenes o informes clínicos del paciente aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className={`p-3 rounded-xl ${doc.mime_type.includes("pdf") ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}
                        >
                          {doc.mime_type.includes("pdf") ? (
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                          {formatearTamaño(doc.size_bytes)}
                        </span>
                      </div>
                      <h4
                        className="text-sm font-bold text-slate-900 break-all mb-1 truncate"
                        title={doc.storage_path.split("/").pop()}
                      >
                        {doc.storage_path.split("/").pop()}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Subido: {new Date(doc.creado_el).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        verDocumentoSeguro(doc.storage_path, doc.mime_type)
                      }
                      className="mt-4 w-full bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold py-2 rounded-xl text-sm transition-colors border border-slate-200"
                    >
                      Abrir Documento
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {visorDoc && (
        <div
          className="fixed inset-0 bg-slate-900/90 z-9999 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setVisorDoc(null)}
        >
          <div
            className="relative max-w-5xl w-full h-[90vh] flex flex-col items-center bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-end mb-4">
              <button
                onClick={() => setVisorDoc(null)}
                className="text-white hover:text-rose-400 font-black bg-slate-800 px-4 py-2 rounded-xl"
              >
                Cerrar Visor ✕
              </button>
            </div>
            {visorDoc.tipo === "pdf" ? (
              <iframe
                src={visorDoc.url}
                className="w-full h-full rounded-2xl bg-white shadow-2xl"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={visorDoc.url}
                alt="Documento"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-slate-800"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de Notas SOAP */}
      {modalNotaAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-900">
                Nueva Evolución SOAP
              </h2>
              <button
                onClick={() => setModalNotaAbierto(false)}
                className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"
              >
                ❌
              </button>
            </div>
            <form onSubmit={guardarNota} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Subjetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.subjetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, subjetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Objetivo
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.objetivo}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, objetivo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Análisis
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.analisis}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, analisis: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Plan
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={nuevaNota.plan}
                    onChange={(e) =>
                      setNuevaNota({ ...nuevaNota, plan: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={guardandoNota}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg min-w-50"
                >
                  {guardandoNota ? "Guardando..." : "Guardar Bóveda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import SignatureCanvas from "react-signature-canvas";

interface Paciente {
  id: string;
  nombre_completo: string;
  identificacion: string;
}

interface Plantilla {
  id: string;
  titulo: string;
  cuerpo_texto: string;
}

export default function ConsentimientosPsicologoPage() {
  const [cargando, setCargando] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState<"emitir" | "plantilla">(
    "emitir",
  );
  const [guardando, setGuardando] = useState(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");

  const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
  const [textoPlantilla, setTextoPlantilla] = useState("");

  // Estados de Firma
  const [modalFirma, setModalFirma] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Plantilla por defecto si es la primera vez
  const plantillaPorDefecto = `Por el presente documento, yo [NOMBRE_PACIENTE], con documento de identidad [CEDULA_PACIENTE], declaro que he sido informado/a de manera clara y comprensible sobre la naturaleza del tratamiento psicológico que voy a recibir.

Se me ha explicado que:
1. La información compartida en sesión es estrictamente confidencial, salvo riesgo inminente para mi vida o la de terceros.
2. Mi participación es voluntaria y puedo retirar mi consentimiento en cualquier momento.
3. Se han establecido los honorarios y las políticas de cancelación.

Al firmar este documento, otorgo mi consentimiento libre y voluntario para iniciar el proceso de evaluación y/o intervención psicológica.

Fecha de emisión: [FECHA_ACTUAL]`;

  const cargarDatos = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Cargar pacientes
      const { data: dataPacientes } = await supabase
        .from("pacientes")
        .select("id, nombre_completo, identificacion, nombres, apellidos")
        .eq("psicologo_id", session.user.id);

      if (dataPacientes) {
        const pacientesLimpios = dataPacientes.map((p) => ({
          id: p.id,
          nombre_completo:
            p.nombre_completo ||
            `${p.nombres || ""} ${p.apellidos || ""}`.trim() ||
            "Paciente Anónimo",
          identificacion: p.identificacion || "No registrada",
        }));
        setPacientes(pacientesLimpios);
      }

      // Cargar plantilla
      const { data: dataPlantilla } = await supabase
        .from("plantillas_consentimientos")
        .select("*")
        .eq("psicologo_id", session.user.id)
        .maybeSingle();

      if (dataPlantilla) {
        setPlantilla(dataPlantilla);
        setTextoPlantilla(dataPlantilla.cuerpo_texto);
      } else {
        setTextoPlantilla(plantillaPorDefecto);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  }, [plantillaPorDefecto]);

  useEffect(() => {
    const inicializar = async () => {
      await cargarDatos();
    };
    inicializar();
  }, [cargarDatos]);

  const guardarPlantillaBase = async () => {
    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (plantilla) {
        await supabase
          .from("plantillas_consentimientos")
          .update({ cuerpo_texto: textoPlantilla })
          .eq("id", plantilla.id);
      } else {
        const { data } = await supabase
          .from("plantillas_consentimientos")
          .insert({
            psicologo_id: session?.user.id,
            titulo: "Consentimiento Informado General",
            cuerpo_texto: textoPlantilla,
          })
          .select()
          .single();
        if (data) setPlantilla(data);
      }
      alert("✅ Plantilla legal guardada con éxito.");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la plantilla.");
    } finally {
      setGuardando(false);
    }
  };

  const guardarFirmaElectronica = async () => {
    if (sigCanvas.current?.isEmpty()) {
      return alert("Por favor, solicita al paciente que firme en el recuadro.");
    }

    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Extraemos la firma como imagen Base64
      const firmaBase64 = sigCanvas.current
        ?.getTrimmedCanvas()
        .toDataURL("image/png");

      await supabase.from("consentimientos_firmados").insert({
        plantilla_id: plantilla?.id || null,
        paciente_id: pacienteSeleccionado,
        psicologo_id: session?.user.id,
        firma_base64: firmaBase64,
      });

      alert("🎉 Documento firmado electrónicamente y guardado en la bóveda.");
      setModalFirma(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la firma electrónica.");
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFirma = () => {
    sigCanvas.current?.clear();
  };

  const imprimirDocumento = () => {
    window.print();
  };

  // Motor Dinámico: Reemplazar variables por los datos del paciente
  const obtenerTextoDinámico = () => {
    const paciente = pacientes.find((p) => p.id === pacienteSeleccionado);
    let textoProcesado = textoPlantilla;

    textoProcesado = textoProcesado.replace(
      /\[NOMBRE_PACIENTE\]/g,
      paciente ? paciente.nombre_completo : "_________________________",
    );
    textoProcesado = textoProcesado.replace(
      /\[CEDULA_PACIENTE\]/g,
      paciente ? paciente.identificacion : "_________________________",
    );
    textoProcesado = textoProcesado.replace(
      /\[FECHA_ACTUAL\]/g,
      new Date().toLocaleDateString("es-ES"),
    );

    return textoProcesado;
  };

  if (cargando)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* 🟢 ESTILOS MÁGICOS DE IMPRESIÓN */}
      {/* Este bloque de CSS asegura que al imprimir, SOLAMENTE se imprima el documento, ocultando botones y menús laterales */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          #area-impresion, #area-impresion * { visibility: visible; }
          #area-impresion { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 40px; }
          .no-imprimir { display: none !important; }
        }
      `,
        }}
      />

      <div className="mb-8 no-imprimir">
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Consentimiento Informado
        </h1>
        <p className="text-slate-500 font-medium">
          Gestiona tu contrato terapéutico. Imprímelo o haz que tus pacientes lo
          firmen digitalmente.
        </p>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto hide-scrollbar no-imprimir">
        <button
          onClick={() => setPestanaActiva("emitir")}
          className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${pestanaActiva === "emitir" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Emitir Documento (Firma)
        </button>
        <button
          onClick={() => setPestanaActiva("plantilla")}
          className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${pestanaActiva === "plantilla" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Editar Plantilla Base
        </button>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA: EDITAR PLANTILLA                                      */}
      {/* ============================================================== */}
      {pestanaActiva === "plantilla" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 no-imprimir">
          <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <h3 className="text-indigo-800 font-bold mb-2">
              Variables Dinámicas (Etiquetas)
            </h3>
            <p className="text-sm text-indigo-600/80 mb-3">
              Usa estas etiquetas exactas. El sistema las reemplazará
              automáticamente con los datos del paciente al generar el
              documento.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white text-indigo-700 font-mono text-xs px-2 py-1 rounded border border-indigo-200">
                [NOMBRE_PACIENTE]
              </span>
              <span className="bg-white text-indigo-700 font-mono text-xs px-2 py-1 rounded border border-indigo-200">
                [CEDULA_PACIENTE]
              </span>
              <span className="bg-white text-indigo-700 font-mono text-xs px-2 py-1 rounded border border-indigo-200">
                [FECHA_ACTUAL]
              </span>
            </div>
          </div>

          <textarea
            rows={15}
            value={textoPlantilla}
            onChange={(e) => setTextoPlantilla(e.target.value)}
            className="w-full px-5 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 leading-relaxed"
          ></textarea>

          <div className="mt-6 flex justify-end">
            <button
              onClick={guardarPlantillaBase}
              disabled={guardando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all"
            >
              {guardando ? "Guardando..." : "💾 Guardar Plantilla Base"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA: EMITIR Y FIRMAR                                       */}
      {/* ============================================================== */}
      {pestanaActiva === "emitir" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PANEL IZQUIERDO: CONTROLES */}
          <div className="lg:col-span-1 space-y-6 no-imprimir">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 mb-4">
                1. Seleccionar Paciente
              </h3>
              <select
                value={pacienteSeleccionado}
                onChange={(e) => setPacienteSeleccionado(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
              >
                <option value="">-- Imprimir en Blanco (Manual) --</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-3 font-medium">
                Si no seleccionas un paciente, los espacios quedarán en blanco
                para llenarlos a bolígrafo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="font-black text-slate-900 mb-2">
                2. Método de Firma
              </h3>

              <button
                onClick={imprimirDocumento}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-4 py-4 rounded-xl transition-all border border-slate-300 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Imprimir Documento
              </button>

              <button
                onClick={() => {
                  if (!pacienteSeleccionado)
                    return alert(
                      "Selecciona un paciente para firmar digitalmente.",
                    );
                  setModalFirma(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Firma Digital en Pantalla
              </button>
            </div>
          </div>

          {/* PANEL DERECHO: VISTA PREVIA (Y ÁREA DE IMPRESIÓN) */}
          <div className="lg:col-span-2">
            <div
              id="area-impresion"
              className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl min-h-800px font-serif text-slate-800 text-justify relative"
            >
              <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wider text-black">
                Consentimiento Informado
              </h2>

              <div className="whitespace-pre-wrap leading-loose text-[15px]">
                {obtenerTextoDinámico()}
              </div>

              {/* Espacio para firmas al final de la hoja */}
              <div className="mt-32 pt-8 flex justify-between items-end border-t-0">
                <div className="text-center w-[40%]">
                  <div className="border-t border-black mb-2 pt-2"></div>
                  <p className="font-bold text-black text-sm uppercase">
                    Firma del Paciente
                  </p>
                  <p className="text-xs text-black mt-1">C.I:</p>
                </div>
                <div className="text-center w-[40%]">
                  <div className="border-t border-black mb-2 pt-2"></div>
                  <p className="font-bold text-black text-sm uppercase">
                    Firma del Profesional
                  </p>
                  <p className="text-xs text-black mt-1">Sello / Registro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FIRMA ELECTRÓNICA (TIPO DOCUSIGN) */}
      {modalFirma && (
        <div className="fixed inset-0 bg-slate-900/80 z-9999 flex items-center justify-center p-4 backdrop-blur-sm no-imprimir">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
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
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Captura de Firma Electrónica
              </h2>
              <button
                onClick={() => setModalFirma(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600 font-medium mb-4 text-center">
                Por favor, solicite al paciente{" "}
                <strong className="text-slate-900">
                  {
                    pacientes.find((p) => p.id === pacienteSeleccionado)
                      ?.nombre_completo
                  }
                </strong>{" "}
                que firme dentro del recuadro utilizando el mouse, lápiz óptico
                o el dedo (si está en pantalla táctil).
              </p>

              <div className="border-2 border-dashed border-indigo-300 bg-slate-50 rounded-2xl relative mb-4">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-64 rounded-2xl cursor-crosshair",
                  }}
                />
                <button
                  onClick={limpiarFirma}
                  className="absolute bottom-4 right-4 bg-white border border-slate-300 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-100"
                >
                  Limpiar Lienzo
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setModalFirma(false)}
                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarFirmaElectronica}
                disabled={guardando}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {guardando
                  ? "Certificando Firma..."
                  : "Finalizar y Guardar Documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos la Service Role para saltarnos el RLS al actualizar los estados críticos y subir archivos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const archivo = formData.get("comprobante") as File;
    const pago_id = formData.get("pago_id") as string;
    const cita_id = formData.get("cita_id") as string;
    const correo = formData.get("correo") as string;

    if (!archivo || !pago_id || !correo || !cita_id) {
      return NextResponse.json(
        { error: "Faltan datos en la petición." },
        { status: 400 },
      );
    }

    // 1. Subir archivo a Supabase Storage (Bypass RLS)
    const fileBuffer = await archivo.arrayBuffer();
    const fileExt = archivo.name.split(".").pop();
    const fileName = `${pago_id}-${Date.now()}.${fileExt}`;
    const filePath = `pacientes/${correo}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("comprobantes_pacientes")
      .upload(filePath, fileBuffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (uploadError)
      throw new Error(
        `Supabase Storage rechazó el archivo: ${uploadError.message}`,
      );
    const comprobante_url = uploadData.path;

    // 2. Actualizar Tabla General de Pagos
    const { data: pagoActual, error: errPago } = await supabaseAdmin
      .from("pagos")
      .select("estado, monto")
      .eq("id", pago_id)
      .single();

    if (errPago || !pagoActual) throw new Error("Pago no encontrado.");

    await supabaseAdmin
      .from("pagos")
      .update({
        estado: "comprobante_recibido",
        comprobante_url: comprobante_url,
      })
      .eq("id", pago_id);

    // 3. Bitácora de Auditoría (Corregida con la tabla exacta de la BD)
    try {
      await supabaseAdmin.from("payment_status_history").insert({
        pago_id: pago_id,
        estado_anterior: pagoActual.estado,
        estado_nuevo: "comprobante_recibido",
        observacion:
          "Comprobante procesado de forma segura vía Servidor Central.",
      });
    } catch (e) {
      console.warn(
        "Aviso: No se pudo guardar la bitácora, continuando flujo.",
        e,
      );
    }

    // 4. Sincronización Inteligente con el Psicólogo (Auto-Recovery)
    const { data: recExistente } = await supabaseAdmin
      .from("recaudacion_pacientes")
      .select("id")
      .eq("cita_id", cita_id);

    if (!recExistente || recExistente.length === 0) {
      // Si la factura del psicólogo no existe (porque era una cita antigua), la auto-creamos
      const { data: citaData } = await supabaseAdmin
        .from("citas")
        .select("tenant_id, psicologo_id")
        .eq("id", cita_id)
        .single();

      if (citaData) {
        await supabaseAdmin.from("recaudacion_pacientes").insert({
          tenant_id: citaData.tenant_id,
          cita_id: cita_id,
          psicologo_id: citaData.psicologo_id,
          monto_pagado: pagoActual.monto,
          estado_pago: "under_review",
          comprobante_url: comprobante_url,
        });
      }
    } else {
      // Si ya existe, simplemente la actualizamos
      await supabaseAdmin
        .from("recaudacion_pacientes")
        .update({
          estado_pago: "under_review",
          comprobante_url: comprobante_url,
        })
        .eq("cita_id", cita_id);
    }

    return NextResponse.json({
      success: true,
      mensaje: "Éxito total.",
    });
    // 🟢 SOLUCIÓN AL LINTER: Cambiamos "any" por "unknown" y verificamos el tipo
  } catch (error: unknown) {
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("API Error:", mensajeError);
    return NextResponse.json({ error: mensajeError }, { status: 500 });
  }
}

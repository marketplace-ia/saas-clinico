import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos la Service Role para saltarnos el RLS al actualizar los estados críticos y subir archivos
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado. Se requiere un token de sesión." },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesión inválida o expirada." },
        { status: 401 },
      );
    }

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

    if (!ALLOWED_MIMES.includes(archivo.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo se aceptan JPG, PNG o PDF." },
        { status: 400 },
      );
    }

    if (archivo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el límite máximo de 5MB." },
        { status: 400 },
      );
    }

    const fileBuffer = await archivo.arrayBuffer();
    const fileExt = archivo.name.split(".").pop();
    const fileName = `${pago_id}-${Date.now()}.${fileExt}`;
    const filePath = `pacientes/${user.id}/${fileName}`;

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

    try {
      await supabaseAdmin.from("payment_status_history").insert({
        pago_id: pago_id,
        estado_anterior: pagoActual.estado,
        estado_nuevo: "comprobante_recibido",
        observacion:
          "Comprobante procesado de forma segura vía Servidor Central.",
        usuario_accion: user.id,
      });
    } catch (e) {
      console.warn(
        "Aviso: No se pudo guardar la bitácora, continuando flujo.",
        e,
      );
    }

    const { data: recExistente } = await supabaseAdmin
      .from("recaudacion_pacientes")
      .select("id")
      .eq("cita_id", cita_id);

    if (!recExistente || recExistente.length === 0) {
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
          estado_pago: "en_revision", // 🟢 CORRECCIÓN: "en_revision"
          comprobante_url: comprobante_url,
        });
      }
    } else {
      await supabaseAdmin
        .from("recaudacion_pacientes")
        .update({
          estado_pago: "en_revision", // 🟢 CORRECCIÓN: "en_revision"
          comprobante_url: comprobante_url,
        })
        .eq("cita_id", cita_id);
    }

    return NextResponse.json({ success: true, mensaje: "Éxito total." });
  } catch (error: unknown) {
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("API Error:", mensajeError);
    return NextResponse.json({ error: mensajeError }, { status: 500 });
  }
}

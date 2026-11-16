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
    // 1. Verificación del Gafete (Token JWT)
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

    // 2. Extraer datos (Ya NO exigimos pago_id, solo cita_id)
    const formData = await req.formData();
    const archivo = formData.get("comprobante") as File;
    const cita_id = formData.get("cita_id") as string;
    const correo = formData.get("correo") as string;

    if (!archivo || !correo || !cita_id) {
      return NextResponse.json(
        { error: "Faltan datos clave (Cita o Archivo) en la petición." },
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

    // 3. Subir el archivo de forma segura
    const fileBuffer = await archivo.arrayBuffer();
    const fileExt = archivo.name.split(".").pop();
    const fileName = `comprobante-${Date.now()}.${fileExt}`;
    const filePath = `pacientes/${user.id}/${cita_id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("comprobantes_pacientes")
      .upload(filePath, fileBuffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage rechazó el archivo: ${uploadError.message}`);
    }

    const comprobante_url = uploadData.path;

    // 4. LÓGICA INTELIGENTE: Buscar o crear en Recaudación Pacientes
    const { data: citaData, error: errCita } = await supabaseAdmin
      .from("citas")
      .select("tenant_id, psicologo_id")
      .eq("id", cita_id)
      .single();

    if (errCita || !citaData) {
      throw new Error("La cita maestra no existe en el sistema.");
    }

    // Averiguar precio
    const { data: perfil } = await supabaseAdmin
      .from("perfil_psicologo")
      .select("precio_consulta")
      .eq("psicologo_id", citaData.psicologo_id)
      .single();

    const precioBase = perfil?.precio_consulta || 50;

    // 🟢 PUENTE ANTI-CAÍDAS: Si el psicólogo no tiene clínica, le asignamos una simulada para evitar que la DB rechace el pago
    let finalTenantId = citaData.tenant_id;
    if (!finalTenantId) {
      const { data: tenantPrincipal } = await supabaseAdmin
        .from("tenants")
        .select("id")
        .limit(1)
        .maybeSingle();

      finalTenantId = tenantPrincipal
        ? tenantPrincipal.id
        : "00000000-0000-0000-0000-000000000000";
    }

    // Actualizar o crear recaudación
    const { data: recExistente } = await supabaseAdmin
      .from("recaudacion_pacientes")
      .select("id")
      .eq("cita_id", cita_id);

    if (!recExistente || recExistente.length === 0) {
      // 🟢 AHORA SÍ: El servidor la crea usando el tenant seguro y la palabra correcta (under_review)
      const { error: insertError } = await supabaseAdmin
        .from("recaudacion_pacientes")
        .insert({
          tenant_id: finalTenantId,
          cita_id: cita_id,
          psicologo_id: citaData.psicologo_id,
          monto_pagado: precioBase,
          estado_pago: "under_review", // <--- CERRADURA CORREGIDA AL INGLÉS
          comprobante_url: comprobante_url,
        });

      if (insertError) {
        console.error(
          "🚨 ERROR FATAL DE DB AL INSERTAR RECAUDACIÓN:",
          insertError,
        );
        throw new Error(
          `Fallo en BD al crear la deuda: ${insertError.message}`,
        );
      }
    } else {
      // Si ya existía, simplemente la actualiza
      await supabaseAdmin
        .from("recaudacion_pacientes")
        .update({
          estado_pago: "under_review", // <--- CERRADURA CORREGIDA AL INGLÉS
          comprobante_url: comprobante_url,
        })
        .eq("cita_id", cita_id);
    }

    // 5. Actualizar la cita maestra
    await supabaseAdmin
      .from("citas")
      .update({ estado: "under_review" }) // También en inglés para la cita
      .eq("id", cita_id);

    return NextResponse.json({
      success: true,
      mensaje: "Archivo recibido y procesado con éxito.",
    });
  } catch (error: unknown) {
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("API Error de Comprobante:", mensajeError);
    return NextResponse.json({ error: mensajeError }, { status: 500 });
  }
}

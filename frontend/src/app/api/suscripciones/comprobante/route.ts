import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user)
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("comprobante") as File;
    const pago_id = formData.get("pago_id") as string;

    if (!file || !pago_id)
      return NextResponse.json(
        { error: "Faltan datos de la transacción" },
        { status: 400 },
      );

    // 1. Verificación de Propiedad (IDOR Protection)
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .select("*")
      .eq("id", pago_id)
      .eq("psicologo_id", user.id)
      .single();

    if (pagoError) throw pagoError;
    if (!pago || !["pendiente_pago", "rechazado"].includes(pago.estado)) {
      return NextResponse.json(
        { error: "Transacción inválida o ya procesada" },
        { status: 403 },
      );
    }

    // 2. Validación de Archivo en Servidor
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json(
        { error: "El archivo excede los 5MB" },
        { status: 400 },
      );
    if (!ALLOWED_MIMES.includes(file.type))
      return NextResponse.json(
        { error: "Formato no permitido" },
        { status: 400 },
      );

    // 3. Storage Seguro (Ruta anónima y privada)
    const fileBuffer = await file.arrayBuffer();
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeFileName = `receipts/${pago_id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("comprobantes_pagos")
      .upload(safeFileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 4. Actualización de Estado (Máquina de estados segura alineada al Trigger SQL)
    const { error: updateError } = await supabaseAdmin
      .from("pagos")
      .update({
        estado: "comprobante_recibido", // 🟢 CORRECCIÓN: Respetamos la transición exigida por PostgreSQL
        comprobante_url: safeFileName,
      })
      .eq("id", pago_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, estado: "comprobante_recibido" });
  } catch (error: unknown) {
    console.error("[API Comprobante Error]:", error);

    let errorMessage = "Error interno desconocido";

    if (typeof error === "object" && error !== null) {
      const pgError = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      errorMessage = `[Código PG/Storage: ${pgError.code || "N/A"}] ${pgError.message || ""} | Detalle: ${pgError.details || ""}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: `DETALLE TÉCNICO: ${errorMessage}` },
      { status: 500 },
    );
  }
}

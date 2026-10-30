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
    const formData = await request.formData();
    const psicologo_id = formData.get("psicologo_id") as string;
    const file = formData.get("comprobante") as File;
    const fechaHora = formData.get("fechaHora") as string;
    const cita_referencia_id = formData.get("cita_id") as string;

    if (!psicologo_id || !file || !fechaHora) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo JPG, PNG o PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede 5MB. Por favor, reduce el tamaño." },
        { status: 400 },
      );
    }

    const { data: tenantUser } = await supabaseAdmin
      .from("tenant_users")
      .select("tenant_id")
      .eq("usuario_id", psicologo_id)
      .single();
    if (!tenantUser) throw new Error("Clínica no válida.");

    const fileBuffer = await file.arrayBuffer();
    const safeFileName = `pacientes/${tenantUser.tenant_id}/${crypto.randomUUID()}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("comprobantes_pacientes")
      .upload(safeFileName, fileBuffer, { contentType: file.type });

    if (uploadError)
      throw new Error("No se pudo guardar el archivo en el servidor.");

    let citaId = cita_referencia_id;

    if (!citaId) {
      const { data: nuevaCita, error: citaError } = await supabaseAdmin
        .from("citas")
        .insert({
          tenant_id: tenantUser.tenant_id,
          psicologo_id: psicologo_id,
          paciente_nombre: formData.get("nombre") as string,
          fecha_hora: fechaHora,
          estado: "requested",
        })
        .select("id")
        .single();

      if (citaError || !nuevaCita)
        throw new Error("No se pudo agendar la cita.");
      citaId = nuevaCita.id;
    }

    await supabaseAdmin.from("recaudacion_pacientes").insert({
      tenant_id: tenantUser.tenant_id,
      cita_id: citaId,
      psicologo_id: psicologo_id,
      monto_pagado: parseFloat((formData.get("monto") as string) || "0"),
      comprobante_url: safeFileName,
      estado_pago: "en_revision", // 🟢 CORRECCIÓN: Estandarizado al español
    });

    return NextResponse.json({ success: true, cita_id: citaId });
  } catch (error: unknown) {
    console.error("[API Agendar Error]:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIMES = ["image/jpeg", "image/png", "application/pdf"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const psicologo_id = formData.get("psicologo_id") as string;
    const file = formData.get("comprobante") as File;
    const fechaHora = formData.get("fechaHora") as string;

    if (!psicologo_id || !file)
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

    // 1. VALIDACIÓN MIME STRICTA (Server-side, ignora la extensión del nombre del archivo)
    if (!ALLOWED_MIMES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo JPG, PNG o PDF." },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "Excede 5MB" }, { status: 400 });

    // 2. SERVER DETERMINA EL TENANT (Aislamiento)
    const { data: tenantUser } = await supabaseAdmin
      .from("tenant_users")
      .select("tenant_id")
      .eq("usuario_id", psicologo_id)
      .single();
    if (!tenantUser) throw new Error("Clínica no válida.");

    // 3. STORAGE CON RUTA GENERADA POR SERVIDOR (Mitigación de colisiones y path traversal)
    const fileBuffer = await file.arrayBuffer();
    const safeFileName = `pacientes/${tenantUser.tenant_id}/${crypto.randomUUID()}`;

    await supabaseAdmin.storage
      .from("comprobantes_pacientes")
      .upload(safeFileName, fileBuffer, { contentType: file.type });

    // 4. ESTADOS INICIALES ESTRICTOS (Desacoplados)
    const { data: cita } = await supabaseAdmin
      .from("citas")
      .insert({
        tenant_id: tenantUser.tenant_id,
        psicologo_id: psicologo_id,
        paciente_nombre: formData.get("nombre") as string,
        fecha_hora: fechaHora,
        estado: "requested", // Ciclo de cita
      })
      .select()
      .single();

    await supabaseAdmin.from("recaudacion_pacientes").insert({
      tenant_id: tenantUser.tenant_id,
      cita_id: cita!.id,
      psicologo_id: psicologo_id,
      monto_pagado: parseFloat(formData.get("monto") as string),
      comprobante_url: safeFileName,
      estado_pago: "under_review", // Ciclo de pago
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    // 🟢 CORRECCIÓN ESLINT: Ahora "usamos" la variable registrándola en los logs internos del servidor
    console.error("[API Agendar Error]:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor." },
      { status: 500 },
    );
  }
}

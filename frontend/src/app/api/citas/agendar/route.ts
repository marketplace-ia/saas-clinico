import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Credenciales de servidor no configuradas correctamente.",
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error leyendo JSON de la petición:", e);
      throw new Error("Formato de datos inválido.");
    }

    const {
      psicologo_id,
      paciente_correo,
      paciente_nombre,
      fecha,
      hora_inicio,
      paciente_telefono,
      modalidad,
    } = body;

    if (!psicologo_id || !paciente_correo || !fecha || !hora_inicio) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para agendar." },
        { status: 400 },
      );
    }

    const [pacienteRes, psicologoRes, tenantRes] = await Promise.all([
      supabase
        .from("roles_usuarios")
        .select("id")
        .eq("correo", paciente_correo)
        .maybeSingle(),
      supabase
        .from("perfil_psicologo")
        .select("precio_consulta")
        .eq("psicologo_id", psicologo_id)
        .maybeSingle(),
      supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", psicologo_id)
        .maybeSingle(),
    ]);

    const precio = psicologoRes.data?.precio_consulta || 50.0;
    const tenant_id = tenantRes.data?.tenant_id || null;

    const { data: conflicto } = await supabase
      .from("citas")
      .select("id")
      .eq("psicologo_id", psicologo_id)
      .eq("fecha", fecha)
      .eq("hora_inicio", hora_inicio)
      .neq("estado", "cancelled")
      .neq("estado", "Cancelada")
      .neq("estado", "rejected")
      .neq("estado", "rechazado");

    if (conflicto && conflicto.length > 0) {
      return NextResponse.json(
        { error: "Este horario acaba de ser reservado por alguien más." },
        { status: 409 },
      );
    }

    const partesHora = hora_inicio.split(":");
    const horaInt = parseInt(partesHora[0], 10);
    const minutoStr = partesHora[1] || "00";
    const horaFinInt = (horaInt + 1) % 24;
    const hora_fin = `${horaFinInt.toString().padStart(2, "0")}:${minutoStr}:00`;

    const { data: cita, error: errCita } = await supabase
      .from("citas")
      .insert({
        tenant_id,
        psicologo_id,
        nombre_paciente: paciente_nombre,
        paciente_correo,
        paciente_telefono,
        fecha,
        hora_inicio,
        hora_fin,
        modalidad: modalidad || "Virtual",
        estado: "confirmed",
      })
      .select("id")
      .single();

    if (errCita || !cita)
      throw new Error(`Error en BD al crear cita: ${errCita?.message}`);

    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenciaUnica = `CIT-${year}-${randomCode}`;

    const { error: errRecaudacion } = await supabase
      .from("recaudacion_pacientes")
      .insert({
        tenant_id,
        cita_id: cita.id,
        psicologo_id,
        monto_pagado: precio,
        estado_pago: "pending",
      });

    if (errRecaudacion)
      console.error("Error BD Recaudación:", errRecaudacion.message);

    if (pacienteRes.data) {
      const { error: errPago } = await supabase.from("pagos").insert({
        usuario_id: pacienteRes.data.id,
        referencia_unica: referenciaUnica,
        entidad_tipo: "cita",
        entidad_id: cita.id,
        monto: precio,
        estado: "pending",
        metodo_pago: "bank_transfer",
      });

      if (errPago) console.error("Error BD Pagos:", errPago.message);
    }

    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://saas-clinico-2ge6.vercel.app";
      const syncUrl = `${appUrl}/api/calendario/sync`;

      await fetch(syncUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.headers.get("Authorization") || "",
        },
        body: JSON.stringify({ cita_id: cita.id }),
      });
    } catch (syncErr) {
      console.error("[Google Sync Trigger Error]:", syncErr);
    }

    return NextResponse.json({
      success: true,
      cita_id: cita.id,
      referencia: referenciaUnica,
    });
  } catch (error: unknown) {
    const mensaje =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("Error en API de Citas:", mensaje);
    return NextResponse.json({ error: mensaje }, { status: 400 }); // Status 400 evita que el celular colapse
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const {
      psicologo_id,
      paciente_correo,
      paciente_nombre,
      fecha,
      hora_inicio,
    } = await req.json();

    if (!psicologo_id || !paciente_correo || !fecha || !hora_inicio) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para agendar." },
        { status: 400 },
      );
    }

    // 1. Obtener ID del paciente, precio y Tenant_ID del psicólogo
    const [pacienteRes, psicologoRes, tenantRes] = await Promise.all([
      supabase
        .from("roles_usuarios")
        .select("id")
        .eq("correo", paciente_correo)
        .single(),
      supabase
        .from("perfil_psicologo")
        .select("precio_consulta")
        .eq("psicologo_id", psicologo_id)
        .single(),
      supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("usuario_id", psicologo_id)
        .single(),
    ]);

    if (pacienteRes.error || !pacienteRes.data)
      throw new Error("Paciente no encontrado en el sistema.");

    const precio = psicologoRes.data?.precio_consulta || 50.0;
    const tenant_id = tenantRes.data?.tenant_id || null;

    // 2. DOBLE CANDADO: Verificar que el horario sigue libre
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
        {
          error:
            "Este horario acaba de ser reservado por alguien más. Por favor, elige otra hora.",
        },
        { status: 409 },
      );
    }

    const horaInicioObj = new Date(`2000-01-01T${hora_inicio}`);
    horaInicioObj.setHours(horaInicioObj.getHours() + 1);
    const hora_fin = horaInicioObj.toTimeString().split(" ")[0];

    // 3. Crear la Cita
    const { data: cita, error: errCita } = await supabase
      .from("citas")
      .insert({
        tenant_id,
        psicologo_id,
        nombre_paciente: paciente_nombre,
        paciente_correo,
        fecha,
        hora_inicio,
        hora_fin,
        modalidad: "Virtual",
        estado: "requested",
      })
      .select("id")
      .single();

    if (errCita || !cita) {
      throw new Error(`Error en BD al crear cita: ${errCita?.message}`);
    }

    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenciaUnica = `CIT-${year}-${randomCode}`;

    // 4. 🟢 MAGIA AQUÍ: Creamos LA RECAUDACIÓN (Usando el estado "pending")
    const { error: errRecaudacion } = await supabase
      .from("recaudacion_pacientes")
      .insert({
        tenant_id,
        cita_id: cita.id,
        psicologo_id: psicologo_id,
        monto_pagado: precio,
        estado_pago: "pending", // 🟢 SOLUCIÓN EXACTA AL ERROR: Estado en inglés esperado por la BD
      });

    if (errRecaudacion) {
      throw new Error(`Error BD Recaudación: ${errRecaudacion.message}`);
    }

    // 5. Crear la Intención de Pago en la tabla general
    const { error: errPago } = await supabase.from("pagos").insert({
      usuario_id: pacienteRes.data.id,
      referencia_unica: referenciaUnica,
      entidad_tipo: "cita",
      entidad_id: cita.id,
      monto: precio,
      estado: "pendiente_pago",
      metodo_pago: "bank_transfer",
    });

    if (errPago) {
      throw new Error(`Error BD Pagos: ${errPago.message}`);
    }

    return NextResponse.json({
      success: true,
      cita_id: cita.id,
      referencia: referenciaUnica,
    });
  } catch (error: unknown) {
    const mensaje =
      error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}

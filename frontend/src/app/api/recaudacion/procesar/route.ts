import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CASEngine } from "@/lib/case-engine";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    // 1. EL GUARDIÁN DEL SAAS ESTÁ ACTIVO: Exige suscripción activa para usar este módulo
    const ctx = await CASEngine.authorize(
      request.headers.get("Authorization"),
      {
        actionType: "write",
        allowedRoles: ["owner", "admin", "receptionist"],
      },
    );

    // 2. CORRECCIÓN DEL BUG: Recibimos 'accion' en lugar de 'accion_pago', y capturamos 'cita_id'
    const { recaudacion_id, cita_id, accion } = await request.json();

    if (!recaudacion_id || !accion) {
      throw new Error("Faltan parámetros obligatorios para procesar el pago.");
    }

    // 3. Validar transacción existente asegurando que pertenezca a la clínica actual
    const { data: rec, error: recError } = await supabaseAdmin
      .from("recaudacion_pacientes")
      .select("estado_pago, cita_id")
      .eq("id", recaudacion_id)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (recError || !rec)
      throw new Error("Transacción no encontrada o acceso denegado.");

    // 4. IDEMPOTENCIA: Evitar doble procesamiento
    if (rec.estado_pago === "confirmed" || rec.estado_pago === "rejected") {
      return NextResponse.json(
        { error: "Este pago ya fue procesado anteriormente." },
        { status: 409 },
      );
    }

    const nuevoEstadoPago = accion === "aprobar" ? "confirmed" : "rejected";
    const entidadReferencia = cita_id || rec.cita_id;

    // 5. SINCRONIZACIÓN MAESTRA (Las 4 Tablas)

    // A. Actualizamos la Factura del Psicólogo
    const { error: updateRecError } = await supabaseAdmin
      .from("recaudacion_pacientes")
      .update({ estado_pago: nuevoEstadoPago })
      .eq("id", recaudacion_id);

    if (updateRecError)
      throw new Error(`Fallo en Recaudación: ${updateRecError.message}`);

    // B. Actualizamos la tabla general del Paciente para que su portal se actualice
    await supabaseAdmin
      .from("pagos")
      .update({
        estado: nuevoEstadoPago === "confirmed" ? "confirmado" : "rechazado",
      })
      .eq("entidad_id", entidadReferencia);

    // C. Si aprobó el pago, formalizamos y Confirmamos la Cita en el calendario
    if (nuevoEstadoPago === "confirmed" && entidadReferencia) {
      await supabaseAdmin
        .from("citas")
        .update({ estado: "confirmed" })
        .eq("id", entidadReferencia);
    }

    // D. Registrar en la auditoría el veredicto del psicólogo
    const { data: pagoGen } = await supabaseAdmin
      .from("pagos")
      .select("id")
      .eq("entidad_id", entidadReferencia)
      .single();
    if (pagoGen) {
      await supabaseAdmin.from("payment_status_history").insert({
        pago_id: pagoGen.id,
        estado_anterior: "comprobante_recibido",
        estado_nuevo:
          nuevoEstadoPago === "confirmed" ? "confirmado" : "rechazado",
        observacion: `El profesional ha ${accion === "aprobar" ? "aprobado" : "rechazado"} el pago y validado la cita.`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error en procesar pago:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 400 },
    );
  }
}

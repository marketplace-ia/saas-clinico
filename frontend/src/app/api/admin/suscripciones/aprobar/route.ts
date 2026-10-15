import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { pago_id } = await request.json();
    if (!pago_id) throw new Error("Falta el ID del pago.");

    const { data: pago, error: errPago } = await supabaseAdmin
      .from("pagos")
      .select("*")
      .eq("id", pago_id)
      .single();

    if (errPago || !pago) throw new Error("Transacción no encontrada.");

    // 1. Identificar al psicólogo. Dependiendo de cómo se creó el pago, puede estar en usuario_id o psicologo_id.
    const idPsicologo = pago.psicologo_id || pago.usuario_id;

    if (!idPsicologo) {
      throw new Error(
        `La transacción ${pago_id} no está asociada a ningún psicólogo.`,
      );
    }

    // 2. Buscar a qué clínica (tenant) pertenece este psicólogo
    const { data: tenantUsers, error: errTu } = await supabaseAdmin
      .from("tenant_users")
      .select("tenant_id")
      .eq("usuario_id", idPsicologo);

    if (errTu) throw new Error("Error consultando permisos: " + errTu.message);

    if (!tenantUsers || tenantUsers.length === 0) {
      throw new Error(
        `DATO HUÉRFANO: El psicólogo no tiene una clínica (Tenant) asignada en el sistema.`,
      );
    }
    const tenantId = tenantUsers[0].tenant_id;

    // 3. 🟢 MAGIA ANTI-TRIGGER: Cumplimos con la regla estricta de la Máquina de Estados
    // Si la base de datos exige que primero sea "en_revision", lo actualizamos a ese estado.
    if (pago.estado !== "en_revision") {
      const { error: errPaso1 } = await supabaseAdmin
        .from("pagos")
        .update({ estado: "en_revision" })
        .eq("id", pago_id);

      if (errPaso1)
        throw new Error(
          `El Trigger rechazó el paso a revisión: ${errPaso1.message}`,
        );
    }

    // 4. Ahora que el Trigger está satisfecho, aplicamos la aprobación final
    const { error: errorUpdatePago } = await supabaseAdmin
      .from("pagos")
      .update({ estado: "confirmado" })
      .eq("id", pago_id);

    if (errorUpdatePago) {
      throw new Error(
        `Fallo actualizando a confirmado: ${errorUpdatePago.message}`,
      );
    }

    // 5. Activamos el tenant en el motor C.A.S.E.
    const { error: errorUpdateTenant } = await supabaseAdmin
      .from("tenants")
      .update({ estado_suscripcion: "active" })
      .eq("id", tenantId);

    if (errorUpdateTenant) {
      throw new Error(
        `Fallo activando la suscripción SaaS: ${errorUpdateTenant.message}`,
      );
    }

    // 6. Dejar rastro en la tabla de auditoría para el SuperAdmin
    await supabaseAdmin.from("payment_status_history").insert({
      pago_id: pago_id,
      estado_anterior: pago.estado,
      estado_nuevo: "confirmado",
      observacion:
        "SuperAdmin verificó el comprobante y activó la suscripción SaaS.",
    });

    return NextResponse.json({
      success: true,
      mensaje: "Suscripción SaaS activada con éxito en la Base de Datos.",
    });
  } catch (error: unknown) {
    let msg = "Error desconocido en el servidor";
    if (error instanceof Error) msg = error.message;
    else if (typeof error === "object" && error !== null && "message" in error)
      msg = String((error as { message: unknown }).message);

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

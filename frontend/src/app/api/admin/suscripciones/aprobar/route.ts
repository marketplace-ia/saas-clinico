import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializamos el cliente de Supabase con privilegios de Administrador
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { pago_id } = await request.json();
    if (!pago_id) throw new Error("Falta el ID del pago.");

    // 🟢 1. BUSCAMOS EL PAGO Y CRUZAMOS CON EL PERFIL REAL (Usando nombres y apellidos)
    const { data: pago, error: errPago } = await supabaseAdmin
      .from("pagos")
      .select("*, perfil_psicologo(nombres, apellidos)")
      .eq("id", pago_id)
      .single();

    if (errPago || !pago)
      throw new Error("Transacción no encontrada en el sistema.");

    const idPsicologo = pago.psicologo_id || pago.usuario_id;
    if (!idPsicologo) {
      throw new Error(
        `La transacción ${pago_id} es un registro huérfano (Sin psicólogo asignado).`,
      );
    }

    // Extracción segura del nombre del psicólogo para los registros y correos
    const nombreDoctor = pago.perfil_psicologo
      ? `${pago.perfil_psicologo.nombres} ${pago.perfil_psicologo.apellidos}`
      : "Doctor/a";

    // 2. BUSCAMOS LA CLÍNICA (TENANT) ASIGNADA
    const { data: tenantUsers, error: errTu } = await supabaseAdmin
      .from("tenant_users")
      .select("tenant_id")
      .eq("usuario_id", idPsicologo);

    if (errTu)
      throw new Error(
        "Error consultando la arquitectura clínica: " + errTu.message,
      );
    if (!tenantUsers || tenantUsers.length === 0) {
      throw new Error(
        `El psicólogo ${nombreDoctor} no tiene una clínica (Tenant) configurada.`,
      );
    }

    const tenantId = tenantUsers[0].tenant_id;

    // 3. 🟢 MÁQUINA DE ESTADOS ESTRICTA (Evadiendo Triggers)
    // Forzamos el paso por "en_revision" para cumplir con las reglas de negocio de Supabase
    if (pago.estado !== "en_revision") {
      const { error: errPaso1 } = await supabaseAdmin
        .from("pagos")
        .update({ estado: "en_revision" })
        .eq("id", pago_id);

      if (errPaso1)
        throw new Error(`Bloqueo de seguridad (Trigger): ${errPaso1.message}`);
    }

    // 4. APROBACIÓN FINANCIERA FINAL
    const { error: errorUpdatePago } = await supabaseAdmin
      .from("pagos")
      .update({ estado: "confirmado" })
      .eq("id", pago_id);

    if (errorUpdatePago) {
      throw new Error(
        `Fallo durante la confirmación financiera: ${errorUpdatePago.message}`,
      );
    }

    // 🟢 5. CÁLCULO DE FECHAS (NUEVO)
    const fechaInicio = new Date();
    const fechaFin = new Date();
    // Sumamos 30 días para el mes de suscripción
    fechaFin.setDate(fechaInicio.getDate() + 30);

    // 6. 🟢 MAGIA DE SUSCRIPCIÓN BLINDADA CON FECHAS
    // Preguntamos si la clínica ya tiene una suscripción usando maybeSingle()
    const { data: subExistente, error: errSubQuery } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select("id")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (errSubQuery) {
      throw new Error(
        `Error verificando suscripción existente: ${errSubQuery.message}`,
      );
    }

    if (subExistente) {
      // Si existe, la actualizamos y le AMARRAMOS el plan y las fechas
      const { error: errSub } = await supabaseAdmin
        .from("tenant_subscriptions")
        .update({
          estado: "active",
          plan_id: pago.entidad_id,
          ciclo_inicio: fechaInicio.toISOString(),
          ciclo_fin: fechaFin.toISOString(),
        })
        .eq("id", subExistente.id);

      if (errSub)
        throw new Error(`Fallo actualizando la suscripción: ${errSub.message}`);
    } else {
      // Si NO existe, la CREAMOS desde cero con su plan correcto y fechas obligatorias
      const { error: errSub } = await supabaseAdmin
        .from("tenant_subscriptions")
        .insert({
          tenant_id: tenantId,
          plan_id: pago.entidad_id,
          estado: "active",
          ciclo_inicio: fechaInicio.toISOString(),
          ciclo_fin: fechaFin.toISOString(),
        });

      if (errSub)
        throw new Error(`Fallo creando la suscripción SaaS: ${errSub.message}`);
    }

    // 7. RASTRO DE AUDITORÍA INQUEBRANTABLE
    await supabaseAdmin.from("payment_status_history").insert({
      pago_id: pago_id,
      estado_anterior: pago.estado,
      estado_nuevo: "confirmado",
      observacion: `El SuperAdmin ha verificado y activado la cuenta del ${nombreDoctor}.`,
    });

    // 🟢 8. MÓDULO DE NOTIFICACIONES TRANSACCIONALES (Listo para habilitar)
    /*
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(idPsicologo);
      const correoDoctor = userData.user?.email;

      if (correoDoctor) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Clinesfera <soporte@clinesfera.com>",
            to: correoDoctor,
            subject: "¡Bienvenido a Clinesfera! Tu suscripción está activa 🚀",
            html: `<p>Hola ${nombreDoctor},</p><p>Tu comprobante ha sido verificado con éxito. Tu clínica ya está activa.</p>`,
          }),
        });
      }
    } catch (mailError) {
      console.warn("La suscripción se activó, pero falló el envío del correo de bienvenida.");
    }
    */

    return NextResponse.json({
      success: true,
      mensaje: `Suscripción SaaS activada con éxito para ${nombreDoctor}.`,
    });
  } catch (error: unknown) {
    let msg = "Error crítico en el servidor de facturación.";
    if (error instanceof Error) msg = error.message;
    else if (typeof error === "object" && error !== null && "message" in error)
      msg = String((error as { message: unknown }).message);

    console.error("[ERROR API APROBACIÓN]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

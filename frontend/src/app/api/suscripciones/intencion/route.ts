import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    // 1. Autoridad de Identidad
    const authHeader = request.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user)
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    // 2. Autoridad de Precios
    const { plan_id, frecuencia } = await request.json();
    if (!plan_id || !["mensual", "anual"].includes(frecuencia)) {
      return NextResponse.json(
        { error: "Datos de plan inválidos" },
        { status: 400 },
      );
    }

    const { data: plan, error: planQueryError } = await supabaseAdmin
      .from("planes")
      .select("*")
      .eq("id", plan_id)
      .eq("activo", true)
      .single();

    if (planQueryError) throw planQueryError;
    if (!plan)
      return NextResponse.json(
        { error: "El plan seleccionado no existe o no está activo" },
        { status: 404 },
      );

    // 3. Cálculos Financieros (🟢 IVA ELIMINADO: El total es exactamente el precio del plan)
    const total =
      frecuencia === "mensual" ? plan.precio_mensual : plan.precio_anual;

    // 4. Generación Segura de Referencia
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const referenciaUnica = `SUB-${new Date().getFullYear()}${new Date().getMonth() + 1}-${randomHex}`;

    // 5. Creación del Registro de Pago
    const { data: pago, error: pagoError } = await supabaseAdmin
      .from("pagos")
      .insert({
        psicologo_id: user.id,
        referencia_unica: referenciaUnica,
        entidad_tipo: "suscripcion",
        entidad_id: plan.id,
        monto: total,
        monto_esperado: total,
        estado: "pendiente_pago",
      })
      .select()
      .single();

    if (pagoError) throw pagoError;

    // 6. Devolver respuesta de éxito al Frontend
    return NextResponse.json({
      success: true,
      pago_id: pago.id,
      referencia: pago.referencia_unica,
      desglose: { subtotal: total, impuestos: 0, total },
    });
  } catch (error: unknown) {
    console.error("[API Intencion Pago Error]:", error);

    let errorMessage = "Error interno desconocido";
    if (typeof error === "object" && error !== null) {
      const pgError = error as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      errorMessage = `[Código PG: ${pgError.code || "N/A"}] ${pgError.message || ""} | Detalle: ${pgError.details || ""}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: `DETALLE TÉCNICO: ${errorMessage}` },
      { status: 500 },
    );
  }
}

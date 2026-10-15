import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos la llave Service Role para que el backend tenga permisos administrativos
// y pueda escribir en las tablas que bloqueamos con RLS para el frontend.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { correo, plan_id, monto } = body;

    if (!correo || !plan_id || !monto) {
      return NextResponse.json(
        { error: "Datos de contratación incompletos" },
        { status: 400 },
      );
    }

    // 1. Validar identidad del usuario (Buscamos su BIGINT)
    const { data: usuario, error: errUsuario } = await supabase
      .from("roles_usuarios")
      .select("id")
      .eq("correo", correo)
      .single();

    if (errUsuario || !usuario) {
      throw new Error("Usuario no encontrado en los registros oficiales.");
    }

    // 2. Generar la Suscripción en estado 'INACTIVA' (Bloqueada hasta confirmación)
    const { data: suscripcion, error: errSub } = await supabase
      .from("suscripciones")
      .insert({
        usuario_id: usuario.id,
        plan_id: plan_id,
        estado: "inactiva",
        renovacion_automatica: false,
      })
      .select()
      .single();

    if (errSub) throw new Error("Error al pre-generar la suscripción.");

    // 3. Generador de Referencia Única de Nivel Empresarial
    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referenciaUnica = `PAY-${year}-${randomCode}`;

    // 4. Crear la Intención de Pago Oficial
    const { data: pago, error: errPago } = await supabase
      .from("pagos")
      .insert({
        usuario_id: usuario.id,
        referencia_unica: referenciaUnica,
        entidad_tipo: "suscripcion",
        entidad_id: suscripcion.id,
        monto: monto,
        estado: "pendiente_pago",
        metodo_pago: "bank_transfer",
      })
      .select()
      .single();

    if (errPago)
      throw new Error("Error al registrar la transacción financiera.");

    return NextResponse.json({
      success: true,
      referencia: pago.referencia_unica,
      pago_id: pago.id,
    });
  } catch (error: unknown) {
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error crítico en API Financiera:", mensajeError);
    return NextResponse.json({ error: mensajeError }, { status: 500 });
  }
}

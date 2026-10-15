// src/app/api/webhooks/billing/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializamos Supabase con Service Role (Bypass RLS)
// Esto es estrictamente necesario y seguro aquí porque el webhook no lo dispara
// un usuario logueado en el navegador, sino el servidor del proveedor (ej. Factuplan).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Este es un secreto que configurarás en el panel del proveedor y en tu archivo .env
// Sirve para garantizar que solo el proveedor autorizado pueda actualizarnos los estados.
const WEBHOOK_SECRET =
  process.env.BILLING_WEBHOOK_SECRET || "secreto_sandbox_123";

export async function POST(request: Request) {
  try {
    // 1. Verificación estricta de seguridad (Firma/Token del Webhook)
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.error("[Webhook] Intento de acceso no autorizado.");
      return NextResponse.json(
        { error: "Firma de Webhook inválida" },
        { status: 401 },
      );
    }

    // 2. Parsear el Payload enviado por el proveedor
    const body = await request.json();

    // Asumimos un payload estándar genérico de un proveedor API-First
    const {
      factura_id_proveedor,
      estado_proveedor, // Ej: "AUTORIZADO", "RECHAZADO_SRI"
      clave_acceso,
      secuencial,
      xml_url,
      ride_url,
      errores,
    } = body;

    if (!factura_id_proveedor || !estado_proveedor) {
      return NextResponse.json(
        { error: "Estructura del payload inválida" },
        { status: 400 },
      );
    }

    // 3. Mapear el estado del proveedor al estado inmutable de nuestra arquitectura
    let estado_sri = "en_proceso";
    const estadoLimpio = estado_proveedor.toUpperCase();

    if (estadoLimpio.includes("AUTORIZAD")) estado_sri = "autorizada";
    if (estadoLimpio.includes("RECHAZAD") || estadoLimpio.includes("ERROR"))
      estado_sri = "rechazada";

    // 4. Actualizar la base de datos de Clinesfera
    // 🟢 MAGIA ARQUITECTÓNICA: Al hacer este UPDATE, el Trigger trg_auditar_factura
    // que creamos en SQL detectará el cambio y guardará el historial automáticamente.
    const { data, error } = await supabase
      .from("facturas_electronicas")
      .update({
        estado_sri: estado_sri,
        clave_acceso: clave_acceso || null,
        secuencial_tributario: secuencial || null,
        xml_url: xml_url || null,
        ride_url: ride_url || null,
        errores_proveedor: errores ? { detalle: errores } : null,
      })
      .eq("factura_id_proveedor", factura_id_proveedor)
      .select("id, pago_id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      mensaje: "Actualización procesada con éxito",
      factura_id: data.id,
      nuevo_estado: estado_sri,
    });
  } catch (error: unknown) {
    const msj =
      error instanceof Error ? error.message : "Error procesando el Webhook";
    console.error("[Webhook Billing Error]:", msj);
    // Devolvemos 500 para que el proveedor sepa que fallamos y reintente enviarnos el Webhook más tarde
    return NextResponse.json({ error: msj }, { status: 500 });
  }
}

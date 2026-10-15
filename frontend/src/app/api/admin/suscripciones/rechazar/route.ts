import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { pago_id } = await request.json();
    if (!pago_id) throw new Error("Falta el ID del pago en la petición.");

    // 1. EL TRUCO NINJA: Satisfacer la máquina de estados de la BD pasando por "en_revision"
    await supabaseAdmin
      .from("pagos")
      .update({ estado: "en_revision" })
      .eq("id", pago_id);

    // 2. Ahora sí, aplicamos el rechazo final
    const { data, error } = await supabaseAdmin
      .from("pagos")
      .update({ estado: "rechazado" })
      .eq("id", pago_id)
      .select();

    if (error) throw new Error(`Error BD: ${error.message}`);
    if (!data || data.length === 0) throw new Error("No se encontró el pago.");

    return NextResponse.json({
      success: true,
      mensaje:
        "Comprobante rechazado exitosamente. La cuenta sigue restringida.",
    });
  } catch (error: unknown) {
    let msg = "Error desconocido en el servidor";
    if (error instanceof Error) msg = error.message;
    else if (typeof error === "object" && error !== null && "message" in error)
      msg = String(error.message);

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

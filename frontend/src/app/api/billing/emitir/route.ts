// src/app/api/billing/emitir/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FactuplanAdapter } from "@/lib/billing/FactuplanAdapter";
import { InvoicePayload } from "@/lib/billing/BillingProvider";

// Inicializamos el cliente de Supabase con Service Role (Solo para backend)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Validar Autenticación del Emisor
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }
    const psicologoId = user.id;

    // 2. Extraer el pago a facturar
    const body = await request.json();
    const { pago_id } = body;
    if (!pago_id)
      return NextResponse.json(
        { error: "ID de pago requerido" },
        { status: 400 },
      );

    // 3. Recopilar Datos (Pago, Tributario, Configuración)
    const { data: pago, error: errPago } = await supabase
      .from("pagos")
      .select("*")
      .eq("id", pago_id)
      .single();

    if (errPago) throw new Error(`Error BD Pagos: ${errPago.message}`);
    if (!pago || pago.psicologo_id !== psicologoId) {
      return NextResponse.json(
        { error: "Pago no encontrado o no autorizado." },
        { status: 404 },
      );
    }
    if (pago.estado !== "confirmado") {
      return NextResponse.json(
        { error: "El pago debe estar confirmado para facturar" },
        { status: 400 },
      );
    }

    const { data: tributario, error: errTrib } = await supabase
      .from("perfil_tributario_psicologo")
      .select("*")
      .eq("psicologo_id", psicologoId)
      .single();
    if (errTrib)
      throw new Error(`Error BD Perfil Tributario: ${errTrib.message}`);

    const { data: configuracion, error: errConf } = await supabase
      .from("configuracion_facturacion_psicologo")
      .select("*")
      .eq("psicologo_id", psicologoId)
      .single();
    if (errConf) throw new Error(`Error BD Configuración: ${errConf.message}`);

    const { data: paciente } = await supabase
      .from("roles_usuarios")
      .select("*")
      .eq("id", pago.usuario_id)
      .single();

    if (!tributario || !configuracion) {
      return NextResponse.json(
        { error: "Perfil tributario incompleto" },
        { status: 400 },
      );
    }

    // 🟢 AUDITORÍA - RESOLUCIÓN LEGAL ECUADOR SRI:
    const identificacionReal = paciente?.identificacion || "9999999999";
    const tipoReal = paciente?.tipo_identificacion || "consumidor_final";
    const razonSocialReal = paciente?.nombre || "Consumidor Final";
    const montoNumerico = Number(pago.monto);

    // REGLA DE NEGOCIO: Bloquear facturas >= $50 USD a Consumidor Final
    if (
      (tipoReal === "consumidor_final" ||
        identificacionReal === "9999999999") &&
      montoNumerico >= 50
    ) {
      return NextResponse.json(
        {
          error:
            "Normativa SRI: Operaciones de $50 USD o más requieren obligatoriamente Cédula o RUC del adquirente. Pide al paciente que actualice su perfil clínico.",
        },
        { status: 400 },
      );
    }

    // 4. Preparar el Contrato
    const payload: InvoicePayload = {
      referencia_interna: pago.referencia_unica,
      emisor: {
        psicologo_id: psicologoId,
        provider_customer_id: tributario.ruc,
        establecimiento: configuracion.establecimiento,
        punto_emision: configuracion.punto_emision,
      },
      receptor: {
        identificacion: identificacionReal,
        tipo_identificacion: tipoReal as "cedula" | "ruc" | "pasaporte",
        razon_social: razonSocialReal,
        direccion: "Ecuador", // Puedes mejorarlo extrayendo la dirección si existe en la BD
        correo: paciente?.correo || "",
      },
      detalles: [
        {
          codigo: "SRV-PSI-01",
          descripcion: "Servicios Profesionales de Psicología",
          cantidad: 1,
          precio_unitario: Number(pago.monto),
          descuento: 0,
          impuestos: "IVA_0",
        },
      ],
      pagos: [
        {
          forma_pago: "transferencia",
          total: Number(pago.monto),
        },
      ],
    };

    // 5. Transmitir al SRI
    const provider = new FactuplanAdapter("mock_api_key_sandbox", "testing");
    const idempotencyKey = `inv_create_${pago.id}`;
    const resultado = await provider.submitInvoice(payload, idempotencyKey);

    if (!resultado.exito) {
      return NextResponse.json(
        {
          error: "El proveedor rechazó la solicitud inicial",
          detalles: resultado.errores,
        },
        { status: 502 },
      );
    }

    // 🟢 MAGIA ANTI-TRIGGER: Generamos el ID Único nosotros mismos
    const facturaGeneradaId = crypto.randomUUID();

    // 6. Guardar en Base de Datos inyectando explícitamente el ID
    const { error: dbError } = await supabase
      .from("facturas_electronicas")
      .insert({
        id: facturaGeneradaId,
        psicologo_id: psicologoId,
        pago_id: pago.id,
        usuario_id: pago.usuario_id,
        referencia_interna: pago.referencia_unica,
        factura_id_proveedor: resultado.factura_id_proveedor,
        estado_sri: resultado.estado_sri,
        datos_emisor_snapshot: tributario,
        datos_receptor_snapshot: payload.receptor,
        detalles_snapshot: payload.detalles,
      });

    if (dbError)
      throw new Error(
        `Error BD guardando la factura electrónica: ${dbError.message}`,
      );

    return NextResponse.json({
      mensaje: "Documento enviado al proveedor correctamente.",
      estado: resultado.estado_sri,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const msgError = error?.message || "Error desconocido";
    console.error("[Billing API] Error detallado:", error);
    return NextResponse.json(
      { error: msgError, detalles_completos: error },
      { status: 500 },
    );
  }
}

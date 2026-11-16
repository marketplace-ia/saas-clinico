// src/lib/billing/FactuplanAdapter.ts

// 🟢 MOLDE DE LA FACTURA QUE PIDE LA API
export interface InvoicePayload {
  referencia_interna: string;
  emisor: {
    psicologo_id: string;
    provider_customer_id: string;
    establecimiento: string;
    punto_emision: string;
  };
  receptor: {
    identificacion: string;
    tipo_identificacion: "cedula" | "ruc" | "pasaporte" | string;
    razon_social: string;
    direccion: string;
    correo: string;
  };
  detalles: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    impuestos: string;
  }>;
  pagos: Array<{
    forma_pago: string;
    total: number;
  }>;
}

export interface InvoiceResult {
  exito: boolean;
  factura_id_proveedor?: string;
  estado_sri: "pendiente_emision" | "en_proceso" | "autorizada" | "rechazada";
  errores?: string;
}

// 🟢 EL ADAPTADOR QUE SE CONECTA AL SRI
export class FactuplanAdapter {
  apiKey: string;
  environment: "testing" | "production";

  constructor(
    apiKey: string,
    environment: "testing" | "production" = "testing",
  ) {
    this.apiKey = apiKey;
    this.environment = environment;
  }

  async submitInvoice(
    payload: InvoicePayload,
    idempotencyKey: string,
  ): Promise<InvoiceResult> {
    console.log(
      `[FactuplanAdapter] Simulando envío a SRI para: ${idempotencyKey}`,
    );

    // MOCK: Simulador de respuesta exitosa del proveedor del SRI
    return {
      exito: true,
      factura_id_proveedor: `FPLAN-${Date.now()}`,
      estado_sri: "en_proceso",
    };
  }
}

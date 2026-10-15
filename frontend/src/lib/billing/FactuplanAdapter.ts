// src/lib/billing/FactuplanAdapter.ts

import {
  BillingProvider,
  InvoicePayload,
  InvoiceResult,
} from "./BillingProvider";

/**
 * Adaptador para el proveedor candidato: Factuplan.
 * Actualmente en Fase de Diseño (Sandbox/Mock) hasta aprobación regulatoria.
 */
export class FactuplanAdapter implements BillingProvider {
  private apiKey: string;
  private ambiente: "testing" | "production";

  constructor(apiKey: string, ambiente: "testing" | "production" = "testing") {
    this.apiKey = apiKey;
    this.ambiente = ambiente;
  }

  async prepareInvoice(data: InvoicePayload): Promise<boolean> {
    // Aquí mapearíamos InvoicePayload al formato exacto de JSON que pide Factuplan
    // y haríamos validaciones previas (ej. formato de cédula ecuatoriana).
    console.log(
      `[FactuplanAdapter] Preparando factura para ref: ${data.referencia_interna}`,
    );
    return true;
  }

  async submitInvoice(
    data: InvoicePayload,
    idempotencyKey: string,
  ): Promise<InvoiceResult> {
    console.log(
      `[FactuplanAdapter] Transmitiendo factura de forma segura al proveedor...`,
    );
    console.log(`[Seguridad] Usando Idempotency-Key: ${idempotencyKey}`);
    console.log(
      `[Seguridad] Emisor Tributario (Sub-Tenant): ${data.emisor.provider_customer_id}`,
    );

    // SIMULACIÓN (Sandbox): Retorna una respuesta como si el API hubiera contestado "en_proceso"
    // En producción, aquí va el `fetch('https://api.factuplan.com/v1/invoices', {...})`
    return {
      exito: true,
      factura_id_proveedor: `fct_mock_${Date.now()}`,
      estado_sri: "en_proceso", // Recuerda: Factuplan lo procesa, el SRI autoriza después
    };
  }

  async getInvoiceStatus(factura_id_proveedor: string): Promise<InvoiceResult> {
    console.log(
      `[FactuplanAdapter] Consultando estado de: ${factura_id_proveedor}`,
    );

    // SIMULACIÓN (Sandbox): Simulamos que el SRI ya autorizó
    return {
      exito: true,
      estado_sri: "autorizada",
      clave_acceso: "0210202601170000000000110010010000001841234567812",
      secuencial_tributario: "001-001-000000184",
      xml_url: `https://mock-storage.clinesfera.com/xml/${factura_id_proveedor}.xml`,
      ride_url: `https://mock-storage.clinesfera.com/ride/${factura_id_proveedor}.pdf`,
    };
  }

  async cancelInvoice(
    factura_id_proveedor: string,
    motivo: string,
  ): Promise<InvoiceResult> {
    console.log(
      `[FactuplanAdapter] Solicitando nota de crédito para: ${factura_id_proveedor}. Motivo: ${motivo}`,
    );
    return {
      exito: true,
      estado_sri: "en_proceso",
    };
  }
}

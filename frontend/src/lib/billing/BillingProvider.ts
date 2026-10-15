// src/lib/billing/BillingProvider.ts

/**
 * Entidad que representa la factura estandarizada para Clinesfera,
 * independiente de cómo la requiera el SRI o el proveedor final.
 */
export interface InvoicePayload {
  referencia_interna: string; // Ej. PAY-20261002-000184
  emisor: {
    psicologo_id: string; // UUID del psicólogo en nuestra BD
    provider_customer_id: string; // ID del psicólogo en el sistema del proveedor
    establecimiento: string;
    punto_emision: string;
  };
  receptor: {
    identificacion: string;
    tipo_identificacion: "cedula" | "ruc" | "pasaporte";
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
    impuestos: "IVA_0" | "IVA_15" | "NO_OBJETO"; // Ajustable a normativas
  }>;
  pagos: Array<{
    forma_pago: "transferencia" | "tarjeta" | "efectivo";
    total: number;
  }>;
}

export interface InvoiceResult {
  exito: boolean;
  factura_id_proveedor?: string;
  secuencial_tributario?: string; // Ej. 001-001-000000184
  clave_acceso?: string;
  estado_sri: "pendiente_emision" | "en_proceso" | "autorizada" | "rechazada";
  xml_url?: string;
  ride_url?: string;
  // 🟢 CORRECCIÓN: Eliminamos 'any' por tipos seguros de TypeScript
  errores?: Record<string, unknown> | string;
}

/**
 * CONTRATO ESTÁNDAR:
 * Cualquier proveedor (Factuplan, Contífico, etc.) debe implementar esta interfaz
 * para poder integrarse con Clinesfera.
 */
export interface BillingProvider {
  /**
   * Prepara y valida la factura localmente antes de enviarla.
   */
  prepareInvoice(data: InvoicePayload): Promise<boolean>;

  /**
   * Transmite el documento al proveedor utilizando la identidad del emisor (Psicólogo).
   * @param idempotencyKey Llave única para evitar facturas duplicadas si la red falla.
   */
  submitInvoice(
    data: InvoicePayload,
    idempotencyKey: string,
  ): Promise<InvoiceResult>;

  /**
   * Consulta el estado de una factura previamente enviada (Polling o rescate).
   */
  getInvoiceStatus(factura_id_proveedor: string): Promise<InvoiceResult>;

  /**
   * Solicita la generación de una Nota de Crédito para anular una operación.
   */
  cancelInvoice(
    factura_id_proveedor: string,
    motivo: string,
  ): Promise<InvoiceResult>;
}

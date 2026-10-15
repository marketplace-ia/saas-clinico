import { createClient } from "@supabase/supabase-js";

// Usamos el Service Role para saltar el RLS superficial y hacer auditoría profunda
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export type TenantRole = "owner" | "admin" | "receptionist";
export type SubStatus =
  | "trialing"
  | "active"
  | "grace_period"
  | "restricted"
  | "canceled";

export interface CaseContext {
  userId: string;
  tenantId: string;
  role: TenantRole;
  subscriptionStatus: SubStatus;
  planId: string;
  entitlements: string[];
}

export const CASEngine = {
  /**
   * 1. CONSTRUCCIÓN DEL CONTEXTO (Auth -> Tenant -> Sub -> Entitlements)
   * Extrae toda la verdad operativa del usuario actual.
   */
  async getContext(authHeader: string): Promise<CaseContext> {
    const token = authHeader.replace("Bearer ", "");

    // 1. AUTH: Verificar Identidad Real
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user)
      throw new Error("CASE_AUTH_FAILED: Autenticación inválida o expirada.");

    // 2. TENANT & ROLE: Buscar el espacio de trabajo activo del usuario
    const { data: tenantUser, error: tuError } = await supabaseAdmin
      .from("tenant_users")
      .select("tenant_id, rol")
      .eq("usuario_id", user.id)
      .eq("activo", true)
      .single();

    if (tuError || !tenantUser)
      throw new Error(
        "CASE_TENANT_FAILED: Usuario no pertenece a un espacio de trabajo activo.",
      );

    // 3. SUBSCRIPTION & STATUS: Evaluar la vida financiera del Tenant
    const { data: sub, error: subError } = await supabaseAdmin
      .from("tenant_subscriptions")
      .select("estado, plan_id")
      .eq("tenant_id", tenantUser.tenant_id)
      .single();

    if (subError || !sub)
      throw new Error(
        "CASE_SUB_FAILED: El espacio de trabajo no tiene una suscripción inicializada.",
      );

    // 4. ENTITLEMENTS: Cargar capacidades del plan actual
    const { data: entitlementsData } = await supabaseAdmin
      .from("plan_entitlements")
      .select("entitlement_key")
      .eq("plan_id", sub.plan_id);

    const entitlements = entitlementsData
      ? entitlementsData.map((e) => e.entitlement_key)
      : [];

    return {
      userId: user.id,
      tenantId: tenantUser.tenant_id,
      role: tenantUser.rol as TenantRole,
      subscriptionStatus: sub.estado as SubStatus,
      planId: sub.plan_id,
      entitlements,
    };
  },

  /**
   * 2. MOTOR DE AUTORIZACIÓN ESTRICTA
   * Se ejecuta antes de cualquier operación (Read/Write) en la API.
   */
  async authorize(
    authHeader: string | null,
    options: {
      actionType: "read" | "write" | "admin";
      requiredEntitlement?: string;
      allowedRoles?: TenantRole[];
    },
  ): Promise<CaseContext> {
    if (!authHeader)
      throw new Error("CASE_UNAUTHORIZED: Token no proporcionado.");

    // Obtener contexto validado
    const ctx = await this.getContext(authHeader);

    // REGLA A: Evaluación de "Restricted" (Modo Conservación)
    if (
      ctx.subscriptionStatus === "restricted" &&
      options.actionType !== "read"
    ) {
      throw new Error(
        "CASE_RESTRICTED: El espacio de trabajo está en modo conservación. Solo se permite consulta. Por favor, regularice su suscripción.",
      );
    }
    if (ctx.subscriptionStatus === "canceled") {
      throw new Error("CASE_CANCELED: Suscripción cancelada. Acceso denegado.");
    }

    // REGLA B: Evaluación de Entitlements (Capacidades del Plan)
    if (
      options.requiredEntitlement &&
      !ctx.entitlements.includes(options.requiredEntitlement)
    ) {
      throw new Error(
        `CASE_UPGRADE_REQUIRED: Tu plan actual no incluye la capacidad: ${options.requiredEntitlement}`,
      );
    }

    // REGLA C: Evaluación de Roles (Permisos)
    if (options.allowedRoles && !options.allowedRoles.includes(ctx.role)) {
      throw new Error(
        "CASE_FORBIDDEN: Tu rol no tiene permisos para ejecutar esta acción.",
      );
    }

    // REGLA D: Acciones Administrativas Críticas (Proteger facturación/config)
    if (
      options.actionType === "admin" &&
      !["owner", "admin"].includes(ctx.role)
    ) {
      throw new Error(
        "CASE_FORBIDDEN: Esta acción requiere privilegios de administración del espacio de trabajo.",
      );
    }

    return ctx; // Si sobrevive a todas las validaciones, devuelve el contexto para usar el tenant_id en los INSERTS/SELECTS
  },
};

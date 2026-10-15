// 1. Roles existentes en la plataforma
export type AppRole = "psicologo" | "paciente" | "secretaria" | "admin";

// 2. Tipos de acciones que el asistente puede ejecutar
export type ActionCategory =
  | "NAVIGATE"
  | "TRIGGER_EVENT"
  | "START_TUTORIAL"
  | "EXPLAIN_UI"
  | "ANSWER_FAQ"
  | "FALLBACK";

// 3. Eventos Tipados para el EventBus (Sincronizados con los receptores de UI)
export type AssistantEventMap = {
  BOT_NUEVO_PACIENTE: undefined;
  BOT_NUEVA_HISTORIA: undefined;
  BOT_NUEVA_EVOLUCION: undefined;
  BOT_NUEVA_NOTA_SOAP: undefined;
  BOT_EDITAR_ANAMNESIS: undefined;
  BOT_ENTRAR_CONSULTA: undefined;
  BOT_CONFIGURAR_PERFIL: undefined;
  HIGHLIGHT_ELEMENT: { elementId: string; message: string };
  START_TUTORIAL: { tutorialId: string };
};

// 4. Contexto Estructurado de la Interfaz
export interface AssistantContext {
  userRole: AppRole | null;
  currentRoute: string;
  activeTab?: string;
  isModalOpen: boolean;
  pageElements: string[];
}

// 5. Estructura de Resolución del Cerebro
export interface IntentResolution {
  understood: boolean;
  intentId: string | null;
  message: string;
  action: {
    type: ActionCategory;
    payload?: string;
  } | null;
  suggestedQuickActions: string[];
}

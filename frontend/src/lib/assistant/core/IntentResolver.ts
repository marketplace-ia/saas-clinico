// frontend/src/lib/assistant/core/IntentResolver.ts
import { AssistantContext, IntentResolution, ActionCategory } from "../types";
import { KNOWLEDGE_INTENTS, IntentDefinition } from "../knowledge/intents";
import { APP_ROUTES } from "../knowledge/routes";

export class AssistantBrain {
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  public processInput(
    input: string,
    context: AssistantContext,
  ): IntentResolution {
    const normalizedInput = this.normalizeText(input);

    let bestMatch: IntentDefinition | null = null;

    for (const intent of KNOWLEDGE_INTENTS) {
      const match = intent.keywords.some((keyword) =>
        normalizedInput.includes(this.normalizeText(keyword)),
      );
      if (match) {
        bestMatch = intent;
        break;
      }
    }

    if (!bestMatch) {
      return this.getFallback(context);
    }

    if (
      context.userRole &&
      !bestMatch.requiredRoles.includes(context.userRole)
    ) {
      return {
        understood: true,
        intentId: "error.permission_denied",
        message:
          "Entiendo lo que necesitas, pero tu rol actual no tiene permisos para realizar esta acción.",
        action: null,
        suggestedQuickActions: this.getDefaultActions(context.userRole),
      };
    }

    // 🟢 EJECUCIÓN DINÁMICA DE LA ACCIÓN
    let finalActionType: ActionCategory =
      typeof bestMatch.actionType === "function"
        ? bestMatch.actionType(context.userRole!)
        : bestMatch.actionType;

    let finalPayload =
      typeof bestMatch.payload === "function"
        ? bestMatch.payload(context.userRole!)
        : bestMatch.payload;

    let responseMsg =
      typeof bestMatch.responseTemplate === "function"
        ? bestMatch.responseTemplate(context.userRole!)
        : bestMatch.responseTemplate;

    // 🟢 NUEVO: Validación de seguridad para evitar "Modales Solapados"
    if (context.isModalOpen && finalActionType === "TRIGGER_EVENT") {
      return {
        understood: true,
        intentId: "error.modal_open",
        message:
          "Veo que ya tienes una ventana abierta en pantalla. Por favor, ciérrala o termina lo que estás haciendo antes de pedirme otra acción.",
        action: null,
        suggestedQuickActions: [],
      };
    }

    if (bestMatch.targetRouteId) {
      const targetRoute = APP_ROUTES[bestMatch.targetRouteId];
      if (targetRoute && context.currentRoute !== targetRoute.path) {
        if (bestMatch.autoRoute) {
          finalActionType = "NAVIGATE";
          finalPayload = targetRoute.path;
          responseMsg = `Para hacer eso, primero debemos ir a ${targetRoute.moduleName}. Te llevo para allá.`;
        } else {
          return {
            understood: true,
            intentId: bestMatch.id,
            message: `Para hacer esto, necesitas ir a la sección de ${targetRoute.moduleName}.`,
            action: null,
            suggestedQuickActions: [`Ir a ${targetRoute.moduleName}`],
          };
        }
      }
    }

    return {
      understood: true,
      intentId: bestMatch.id,
      message: responseMsg,
      action: {
        type: finalActionType,
        payload: finalPayload,
      },
      suggestedQuickActions: [],
    };
  }

  private getFallback(context: AssistantContext): IntentResolution {
    return {
      understood: false,
      intentId: "fallback.general",
      message:
        "No estoy seguro de entender a qué te refieres. ¿Quieres que te ayude a encontrar alguna sección o función específica?",
      action: null,
      suggestedQuickActions: context.userRole
        ? this.getDefaultActions(context.userRole)
        : ["¿Qué puedo hacer aquí?"],
    };
  }

  private getDefaultActions(role: string): string[] {
    if (role === "psicologo")
      return ["Ir a mi Agenda", "Ver mis Pacientes", "Historias Clínicas"];
    if (role === "paciente")
      return ["Agendar Cita", "Mis Citas", "Ir a PsiEduca"];
    if (role === "secretaria")
      return ["Agendar nueva cita", "Ver directorio", "Gestión de citas"];
    return ["Explorar plataforma"];
  }
}

export const assistantBrain = new AssistantBrain();

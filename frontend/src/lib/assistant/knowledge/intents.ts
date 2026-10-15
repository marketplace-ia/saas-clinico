// frontend/src/lib/assistant/knowledge/intents.ts
import { AppRole, ActionCategory, AssistantEventMap } from "../types";
import { APP_ROUTES } from "./routes";

export interface IntentDefinition {
  id: string;
  keywords: string[];
  requiredRoles: AppRole[];
  actionType: ActionCategory | ((role: AppRole) => ActionCategory);
  payload?: string | ((role: AppRole) => string) | keyof AssistantEventMap;
  targetRouteId?: string;
  autoRoute?: boolean;
  responseTemplate: string | ((role: AppRole) => string);
}

export const KNOWLEDGE_INTENTS: IntentDefinition[] = [
  // --- 1. ACCIONES ESPECÍFICAS (EVENTOS) ---
  {
    id: "secretaria.agendar_cita",
    keywords: [
      "agendar cita",
      "nueva cita",
      "crear cita",
      "programar cita",
      "agendar nueva cita",
    ],
    requiredRoles: ["secretaria", "psicologo"],
    actionType: "TRIGGER_EVENT",
    payload: "OPEN_MODAL_NUEVA_CITA" as keyof AssistantEventMap,
    responseTemplate:
      "¡Claro que sí! Abriendo el formulario para registrar la nueva cita.",
  },
  {
    id: "action.create_patient",
    keywords: [
      "crear paciente",
      "nuevo paciente",
      "registrar paciente",
      "agregar paciente",
    ],
    requiredRoles: ["psicologo", "secretaria"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_NUEVO_PACIENTE" as keyof AssistantEventMap,
    targetRouteId: APP_ROUTES?.PSICOLOGO_PACIENTES?.id,
    autoRoute: true,
    responseTemplate:
      "Claro, te abro el formulario para registrar un nuevo paciente.",
  },
  {
    id: "action.create_history",
    keywords: [
      "crear historia",
      "nueva historia",
      "abrir expediente",
      "aperturar historia",
    ],
    requiredRoles: ["psicologo"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_NUEVA_HISTORIA" as keyof AssistantEventMap,
    targetRouteId: APP_ROUTES?.PSICOLOGO_HISTORIAS?.id,
    autoRoute: true,
    responseTemplate:
      "Te preparo el formulario para aperturar una nueva Historia Clínica.",
  },
  {
    id: "action.nueva_evolucion_msp",
    keywords: [
      "nueva sesión",
      "registrar sesión",
      "evolucion clinica",
      "evolución msp",
    ],
    requiredRoles: ["psicologo"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_NUEVA_EVOLUCION" as keyof AssistantEventMap,
    responseTemplate: "Listo, te abro el registro de sesión inmutable.",
  },
  {
    id: "action.nueva_nota_soap",
    keywords: ["nota soap", "nueva nota", "escribir nota", "evolución soap"],
    requiredRoles: ["psicologo"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_NUEVA_NOTA_SOAP" as keyof AssistantEventMap,
    responseTemplate: "Abriendo el formato SOAP para este paciente...",
  },
  {
    id: "action.editar_anamnesis",
    keywords: [
      "anamnesis",
      "historia personal",
      "antecedentes",
      "motivo de consulta",
    ],
    requiredRoles: ["psicologo"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_EDITAR_ANAMNESIS" as keyof AssistantEventMap,
    responseTemplate: "Cambiando a la sección de Anamnesis inicial.",
  },
  {
    id: "action.entrar_consulta",
    keywords: [
      "entrar a mi consulta",
      "videollamada",
      "sala virtual",
      "unirme a sesión",
    ],
    requiredRoles: ["paciente"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_ENTRAR_CONSULTA" as keyof AssistantEventMap,
    responseTemplate: "Te redirijo a la sala de espera virtual de tu consulta.",
  },
  {
    id: "action.configurar_perfil",
    keywords: [
      "configurar perfil",
      "mis datos",
      "cambiar contraseña",
      "mi perfil",
    ],
    requiredRoles: ["paciente"],
    actionType: "TRIGGER_EVENT",
    payload: "BOT_CONFIGURAR_PERFIL" as keyof AssistantEventMap,
    responseTemplate: "Claro, te llevo a la configuración de tu perfil.",
  },

  // --- 2. NAVEGACIÓN BÁSICA ---
  {
    id: "nav.agenda",
    keywords: [
      "mi agenda",
      "citas programadas",
      "mi calendario",
      "sesiones",
      "ver citas",
    ],
    requiredRoles: ["psicologo", "secretaria", "paciente"],
    actionType: "NAVIGATE",
    payload: (role: AppRole) =>
      role === "paciente"
        ? APP_ROUTES?.PACIENTE_CITAS?.path || "/dashboard-paciente/citas"
        : APP_ROUTES?.PSICOLOGO_AGENDA?.path || "/dashboard-psicologo/agenda",
    responseTemplate: "Claro, te llevo a la sección de Agenda y Citas.",
  },
  {
    id: "nav.historias",
    keywords: [
      "historias clínicas",
      "expedientes",
      "fichas",
      "hcu",
      "evoluciones",
    ],
    requiredRoles: ["psicologo"],
    actionType: "NAVIGATE",
    payload: () =>
      APP_ROUTES?.PSICOLOGO_HISTORIAS?.path || "/dashboard-psicologo/historias",
    responseTemplate:
      "Enseguida. Aquí puedes gestionar los expedientes de tus pacientes.",
  },

  // --- 3. PREGUNTAS FRECUENTES (FAQ) ---
  {
    id: "faq.what_is_psieduca",
    keywords: [
      "que es psieduca",
      "para que sirve psieduca",
      "recursos",
      "meditaciones",
    ],
    requiredRoles: ["psicologo", "paciente", "secretaria"],
    actionType: "ANSWER_FAQ",
    responseTemplate:
      "PsiEduca es nuestra biblioteca de recursos de bienestar mental. Contiene ejercicios, meditaciones y psicoeducación para complementar el proceso terapéutico.",
  },
];

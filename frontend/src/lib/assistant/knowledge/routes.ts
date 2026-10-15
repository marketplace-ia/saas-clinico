// frontend/src/lib/assistant/knowledge/routes.ts
import { AppRole } from "../types";

export interface RouteRegistry {
  id: string;
  path: string;
  allowedRoles: AppRole[];
  moduleName: string;
}

// ÚNICAMENTE RUTAS EXISTENTES EN EL PROYECTO
export const APP_ROUTES: Record<string, RouteRegistry> = {
  // Módulos de Psicólogo
  PSICOLOGO_DASHBOARD: {
    id: "PSICOLOGO_DASHBOARD",
    path: "/dashboard-psicologo",
    allowedRoles: ["psicologo"],
    moduleName: "Mi Panel",
  },
  PSICOLOGO_AGENDA: {
    id: "PSICOLOGO_AGENDA",
    path: "/dashboard-psicologo/agenda",
    allowedRoles: ["psicologo", "secretaria"],
    moduleName: "Agenda",
  },
  PSICOLOGO_PACIENTES: {
    id: "PSICOLOGO_PACIENTES",
    path: "/dashboard-psicologo/pacientes",
    allowedRoles: ["psicologo", "secretaria"],
    moduleName: "Directorio de Pacientes",
  },
  PSICOLOGO_HISTORIAS: {
    id: "PSICOLOGO_HISTORIAS",
    path: "/dashboard-psicologo/historias",
    allowedRoles: ["psicologo"],
    moduleName: "Historias Clínicas",
  },
  PSICOLOGO_NOTAS: {
    id: "PSICOLOGO_NOTAS",
    path: "/dashboard-psicologo/notas",
    allowedRoles: ["psicologo"],
    moduleName: "Mis Notas",
  },
  PSICOLOGO_CREAR_TALLER: {
    id: "PSICOLOGO_CREAR_TALLER",
    path: "/dashboard-psicologo/crear-taller",
    allowedRoles: ["psicologo"],
    moduleName: "Crear Taller",
  },
  PSICOLOGO_EQUIPO: {
    id: "PSICOLOGO_EQUIPO",
    path: "/dashboard-psicologo/equipo",
    allowedRoles: ["psicologo"],
    moduleName: "Mi Equipo",
  },
  PSICOLOGO_PERFIL: {
    id: "PSICOLOGO_PERFIL",
    path: "/dashboard-psicologo/perfil",
    allowedRoles: ["psicologo"],
    moduleName: "Mi Perfil",
  },

  // Módulos de Paciente
  PACIENTE_DASHBOARD: {
    id: "PACIENTE_DASHBOARD",
    path: "/dashboard-paciente",
    allowedRoles: ["paciente"],
    moduleName: "Mi Portal",
  },
  PACIENTE_AGENDAR: {
    id: "PACIENTE_AGENDAR",
    path: "/dashboard-paciente/agendar",
    allowedRoles: ["paciente"],
    moduleName: "Agendar Cita",
  },
  PACIENTE_CITAS: {
    id: "PACIENTE_CITAS",
    path: "/dashboard-paciente/citas",
    allowedRoles: ["paciente"],
    moduleName: "Mis Citas",
  },
  PACIENTE_HISTORIAL: {
    id: "PACIENTE_HISTORIAL",
    path: "/dashboard-paciente/historial",
    allowedRoles: ["paciente"],
    moduleName: "Historial Clínico",
  },
  PACIENTE_PAGOS: {
    id: "PACIENTE_PAGOS",
    path: "/dashboard-paciente/pagos",
    allowedRoles: ["paciente"],
    moduleName: "Pagos",
  },
  PACIENTE_PERFIL: {
    id: "PACIENTE_PERFIL",
    path: "/dashboard-paciente/perfil",
    allowedRoles: ["paciente"],
    moduleName: "Mi Perfil",
  },

  // Generales
  COMUNIDAD_TALLERES: {
    id: "COMUNIDAD_TALLERES",
    path: "/comunidad/talleres",
    allowedRoles: ["psicologo", "paciente"],
    moduleName: "PsiEduca",
  },
};

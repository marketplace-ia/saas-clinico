import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mensaje, contextoApp } = body;
    const textoUsuario = (mensaje || "").toLowerCase().trim();

    // Simulamos 1.5 segundos de procesamiento para que el Avatar 3D pueda animarse
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let respuesta = {
      respuesta_texto:
        "No estoy seguro de entender esa instrucción. Puedo ayudarte a navegar por la plataforma o gestionar tus pacientes. ¿Qué deseas hacer?",
      accion: "NONE",
      payload: "",
      sugerencias: [
        "Llevame a mi Agenda",
        "Registrar paciente",
        "Ver mis ingresos",
      ],
    };

    if (
      textoUsuario.includes("hola") ||
      textoUsuario.includes("buenos") ||
      textoUsuario.includes("saludos")
    ) {
      respuesta = {
        respuesta_texto: `¡Hola! Soy tu Copiloto 3D de Clinesfera. Funciono 100% de manera interna y segura. Veo que estás en: ${contextoApp?.currentRoute || "tu panel"}. ¿A dónde te gustaría ir hoy?`,
        accion: "NONE",
        payload: "",
        sugerencias: ["Llevame a mi Agenda", "Registrar paciente"],
      };
    } else if (
      textoUsuario.includes("agenda") ||
      textoUsuario.includes("cita") ||
      textoUsuario.includes("calendario")
    ) {
      respuesta = {
        respuesta_texto:
          "¡Entendido! Te redirijo inmediatamente a tu Agenda de citas.",
        accion: "NAVIGATE",
        payload: "/dashboard-psicologo/agenda",
        sugerencias: ["Ver pacientes activos", "Mi Panel"],
      };
    } else if (
      textoUsuario.includes("paciente") ||
      textoUsuario.includes("registrar") ||
      textoUsuario.includes("nuevo")
    ) {
      respuesta = {
        respuesta_texto:
          "Perfecto, abriendo la sección de pacientes para que puedas hacer el registro.",
        accion: "NAVIGATE",
        payload: "/dashboard-psicologo/pacientes",
        sugerencias: ["Llevame a mi Agenda"],
      };
    }
    // 🟢 RUTA CORREGIDA: Ahora apunta a /recaudacion
    else if (
      textoUsuario.includes("ingreso") ||
      textoUsuario.includes("finanzas") ||
      textoUsuario.includes("factura") ||
      textoUsuario.includes("recaudacion")
    ) {
      respuesta = {
        respuesta_texto:
          "Te llevo directamente al Centro de Recaudación para que revises tus finanzas.",
        accion: "NAVIGATE",
        payload: "/dashboard-psicologo/recaudacion",
        sugerencias: ["Ver Panel Principal"],
      };
    } else if (
      textoUsuario.includes("panel") ||
      textoUsuario.includes("inicio") ||
      textoUsuario.includes("home")
    ) {
      respuesta = {
        respuesta_texto: "Regresando al panel principal de tu clínica.",
        accion: "NAVIGATE",
        payload: "/dashboard-psicologo",
        sugerencias: ["Ver mi Agenda"],
      };
    }

    return NextResponse.json(respuesta);
  } catch (error: unknown) {
    console.error("🚨 Error del Cerebro Interno:", error);
    return NextResponse.json(
      {
        respuesta_texto:
          "Hubo un pequeño cortocircuito en mi sistema interno. Por favor, intenta de nuevo.",
        accion: "NONE",
        payload: "",
        sugerencias: ["Reiniciar"],
      },
      { status: 500 },
    );
  }
}

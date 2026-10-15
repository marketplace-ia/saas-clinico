import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { CASEngine } from "@/lib/case-engine";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Estas credenciales se sacan de Google Cloud Console y se ponen en tu .env.local
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_APP_URL + "/api/calendario/callback", // URL de retorno
);

export async function POST(request: Request) {
  try {
    // 1. EL GUARDIÁN: Validar que el psicólogo tiene la capacidad (Entitlement)
    const ctx = await CASEngine.authorize(
      request.headers.get("Authorization"),
      {
        actionType: "write",
        requiredEntitlement: "google.calendar", // Solo planes que incluyen Google Calendar
      },
    );

    const { cita_id } = await request.json();

    // 2. Extraer el Refresh Token seguro de la base de datos
    const { data: integracion } = await supabaseAdmin
      .from("integraciones_oauth")
      .select("refresh_token")
      .eq("psicologo_id", ctx.userId)
      .eq("proveedor", "google_calendar")
      .single();

    if (!integracion) {
      return NextResponse.json(
        { error: "Google Calendar no está conectado." },
        { status: 400 },
      );
    }

    // 3. Cargar credenciales
    oauth2Client.setCredentials({ refresh_token: integracion.refresh_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 4. Obtener datos de la Cita de Clinesfera
    const { data: cita } = await supabaseAdmin
      .from("citas")
      .select("*")
      .eq("id", cita_id)
      .single();
    if (!cita) throw new Error("Cita no encontrada.");

    // 5. Configurar el evento de Google
    const fechaInicio = new Date(cita.fecha_hora);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMinutes(fechaInicio.getMinutes() + 50); // Sesiones de 50 min

    const evento = {
      summary: `Clinesfera: Sesión con ${cita.paciente_nombre}`,
      description: `Teleconsulta ID: ${cita.id}\nTeléfono: ${cita.paciente_telefono || "N/A"}`,
      start: {
        dateTime: fechaInicio.toISOString(),
        timeZone: "America/Guayaquil",
      },
      end: { dateTime: fechaFin.toISOString(), timeZone: "America/Guayaquil" },
      colorId: "5", // Color amarillo/mostaza en Google
    };

    // 6. Inyectar en Google Calendar (Comunicación Segura)
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: evento,
    });

    return NextResponse.json({
      success: true,
      googleEventId: response.data.id,
    });
  } catch (error: unknown) {
    console.error("[Google Calendar Sync Error]:", error);
    return NextResponse.json(
      { error: "Error sincronizando con Google Calendar" },
      { status: 500 },
    );
  }
}

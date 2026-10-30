import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { cita_id } = await request.json();

    if (!cita_id) {
      return NextResponse.json({ error: "Falta cita_id" }, { status: 400 });
    }

    const { data: cita, error: citaError } = await supabaseAdmin
      .from("citas")
      .select("*")
      .eq("id", cita_id)
      .single();

    if (citaError || !cita) throw new Error("Cita no encontrada.");

    const { data: integracion, error: intError } = await supabaseAdmin
      .from("integraciones_oauth")
      .select("access_token, refresh_token")
      .eq("psicologo_id", cita.psicologo_id)
      .eq("proveedor", "google_calendar")
      .single();

    if (intError || !integracion) {
      return NextResponse.json(
        { error: "No hay integración de calendario" },
        { status: 400 },
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_APP_URL + "/api/calendario/callback",
    );

    oauth2Client.setCredentials({
      access_token: integracion.access_token,
      refresh_token: integracion.refresh_token,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const horaInicioSegura =
      cita.hora_inicio.length === 5
        ? `${cita.hora_inicio}:00`
        : cita.hora_inicio;
    const horaFinSegura =
      cita.hora_fin.length === 5 ? `${cita.hora_fin}:00` : cita.hora_fin;

    const startDateTime = new Date(
      `${cita.fecha}T${horaInicioSegura}-05:00`,
    ).toISOString();
    const endDateTime = new Date(
      `${cita.fecha}T${horaFinSegura}-05:00`,
    ).toISOString();

    const evento = {
      summary: `Clinesfera: Sesión con ${cita.nombre_paciente}`,
      description: `Teleconsulta ID: ${cita.id}\nContacto: ${cita.paciente_correo || cita.paciente_telefono || "N/A"}\nModalidad: ${cita.modalidad}`,
      start: { dateTime: startDateTime, timeZone: "America/Guayaquil" },
      end: { dateTime: endDateTime, timeZone: "America/Guayaquil" },
      colorId: "5",
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: evento,
    });

    return NextResponse.json({
      success: true,
      googleEventId: response.data.id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("[Google Sync Error]:", error.message);
    }
    return NextResponse.json(
      { error: "Fallo en sincronización" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  // 1. Configuramos el cliente con la ruta de REGRESO (Callback)
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_APP_URL + "/api/calendario/callback",
  );

  // 2. Generamos la URL mágica de Google
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // OBLIGATORIO: Le pide a Google la llave maestra (refresh_token)
    prompt: "consent", // OBLIGATORIO: Fuerza la pantalla de permisos para garantizar la llave
    scope: ["https://www.googleapis.com/auth/calendar.events"], // Solo acceso para crear eventos
  });

  // 3. Redirigimos al psicólogo a la pantalla de Google
  return NextResponse.redirect(url);
}

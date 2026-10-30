import { NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(
        new URL(
          "/dashboard-psicologo/perfil?error=permiso_denegado",
          request.url,
        ),
      );
    }

    const cookieStore = await cookies();
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectId = new URL(projectUrl).hostname.split(".")[0];

    const cookieName = `sb-${projectId}-auth-token`;
    const cookieVal = cookieStore.get(cookieName)?.value;

    let accessToken = null;
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        accessToken = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        accessToken = cookieVal;
      }
    }

    if (!accessToken) accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL(
          "/dashboard-psicologo/perfil?error=sesion_no_encontrada",
          request.url,
        ),
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error("[Google Callback] Usuario inválido:", authError);
      return NextResponse.redirect(
        new URL(
          "/dashboard-psicologo/perfil?error=token_rechazado",
          request.url,
        ),
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_APP_URL + "/api/calendario/callback",
    );

    const { tokens } = await oauth2Client.getToken(code);

    const { data: existente } = await supabaseAdmin
      .from("integraciones_oauth")
      .select("id")
      .eq("psicologo_id", user.id)
      .eq("proveedor", "google_calendar")
      .maybeSingle();

    const payload = {
      psicologo_id: user.id,
      proveedor: "google_calendar",
      access_token: tokens.access_token,
      ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
      estado: "conectado",
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = existente
      ? await supabaseAdmin
          .from("integraciones_oauth")
          .update(payload)
          .eq("id", existente.id)
      : await supabaseAdmin.from("integraciones_oauth").insert(payload);

    if (dbError) {
      console.error("[Google Callback] Error guardando DB:", dbError);
      return NextResponse.redirect(
        new URL(
          "/dashboard-psicologo/perfil?error=fallo_guardado_db",
          request.url,
        ),
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard-psicologo/perfil?google_sync=success", request.url),
    );
  } catch (error: unknown) {
    console.error("[Google Callback Error Crítico]:", error);
    return NextResponse.redirect(
      new URL("/dashboard-psicologo/perfil?error=fallo_critico", request.url),
    );
  }
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function proxy(request: NextRequest) {
  console.log(`\n[PROXY START] Petición a: ${request.nextUrl.pathname}`);

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    console.log("[PROXY] 1. Creando cliente Supabase...");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            supabaseResponse = NextResponse.next({
              request: { headers: request.headers },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const timeout = (ms: number) =>
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Supabase - 8s")), ms),
      );

    console.log("[PROXY] 2. Consultando auth.getUser()...");

    let user: User | null = null;

    try {
      // Usamos Promise.resolve() para estandarizar los tipos de Supabase y evitar errores de TypeScript
      const authResult = await Promise.race([
        Promise.resolve(supabase.auth.getUser()),
        timeout(8000),
      ]);
      user = authResult.data?.user || null;
    } catch (e) {
      console.error("[PROXY DIAGNÓSTICO] El servidor no pudo autenticar:", e);
    }

    console.log(
      `[PROXY] 3. Usuario obtenido: ${user ? user.email : "Ninguno"}`,
    );

    const currentPath = request.nextUrl.pathname;

    if (
      !user &&
      !currentPath.startsWith("/login") &&
      !currentPath.startsWith("/login-personal") &&
      !currentPath.startsWith("/registro") &&
      !currentPath.startsWith("/auth") &&
      !currentPath.startsWith("/acceso-personal") &&
      !currentPath.startsWith("/comunidad") &&
      !currentPath.startsWith("/privacidad") &&
      !currentPath.startsWith("/proximamente") &&
      !currentPath.startsWith("/p/") &&
      !currentPath.startsWith("/api/webhooks") &&
      currentPath !== "/"
    ) {
      console.log("[PROXY] 4. Redirigiendo a /login (Usuario no autenticado)");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user) {
      console.log("[PROXY] 4. Buscando rol en base de datos...");
      let rol = "paciente";

      try {
        const roleResult = await Promise.race([
          Promise.resolve(
            supabase
              .from("roles_usuarios")
              .select("rol")
              .eq("correo", user.email!)
              .maybeSingle(),
          ),
          timeout(8000),
        ]);

        if (roleResult.error)
          console.error("[PROXY ERROR] Fallo al buscar rol:", roleResult.error);
        if (roleResult.data && roleResult.data.rol) {
          rol = roleResult.data.rol as string;
        }
      } catch (e) {
        console.error(
          "[PROXY DIAGNÓSTICO] Error al conectar con Base de Datos:",
          e,
        );
      }

      console.log(`[PROXY] 5. Rol verificado: ${rol}`);

      if (
        currentPath.startsWith("/dashboard-psicologo") &&
        rol !== "psicologo"
      ) {
        return NextResponse.redirect(
          new URL(
            rol === "secretaria"
              ? "/dashboard-secretaria"
              : "/dashboard-paciente",
            request.url,
          ),
        );
      }
      if (currentPath.startsWith("/dashboard-paciente") && rol !== "paciente") {
        return NextResponse.redirect(
          new URL(
            rol === "psicologo"
              ? "/dashboard-psicologo"
              : "/dashboard-secretaria",
            request.url,
          ),
        );
      }
      if (
        currentPath.startsWith("/dashboard-secretaria") &&
        rol !== "secretaria"
      ) {
        return NextResponse.redirect(
          new URL(
            rol === "psicologo"
              ? "/dashboard-psicologo"
              : "/dashboard-paciente",
            request.url,
          ),
        );
      }
      if (
        ["/login", "/login-personal", "/", "/acceso-personal"].includes(
          currentPath,
        )
      ) {
        if (rol === "psicologo")
          return NextResponse.redirect(
            new URL("/dashboard-psicologo", request.url),
          );
        else if (rol === "secretaria")
          return NextResponse.redirect(
            new URL("/dashboard-secretaria", request.url),
          );
        else
          return NextResponse.redirect(
            new URL("/dashboard-paciente", request.url),
          );
      }
    }

    console.log("[PROXY END] 6. Todo correcto. Dejando pasar.");
    return supabaseResponse;
  } catch (error) {
    console.error("\n[PROXY ERROR CRÍTICO]:", error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

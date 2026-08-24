import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentPath = request.nextUrl.pathname;

  // 1. ZONAS PÚBLICAS PERMITIDAS (Sin necesidad de iniciar sesión)
  if (
    !user &&
    !currentPath.startsWith("/login") &&
    !currentPath.startsWith("/login-personal") &&
    !currentPath.startsWith("/registro") &&
    !currentPath.startsWith("/auth") &&
    !currentPath.startsWith("/acceso-personal") &&
    !currentPath.startsWith("/comunidad") && // <--- ¡AQUÍ ESTÁ EL PERMISO PARA EL NUEVO PORTAL!
    currentPath !== "/"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. SISTEMA DE ROLES (Control de accesos para usuarios logueados)
  if (user) {
    let rol = "paciente";

    try {
      const { data: roleData } = await supabase
        .from("roles_usuarios")
        .select("rol")
        .eq("correo", user.email)
        .maybeSingle();

      if (roleData && roleData.rol) {
        rol = roleData.rol;
      }
    } catch (err) {
      console.error("Error al leer el rol:", err);
    }

    // Proteger los paneles privados de cada rol
    if (currentPath.startsWith("/dashboard-psicologo") && rol !== "psicologo") {
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
          rol === "psicologo" ? "/dashboard-psicologo" : "/dashboard-paciente",
          request.url,
        ),
      );
    }

    // Evitar que usuarios logueados se queden atrapados en las pantallas de login
    // Nota: Dejamos fuera de este bloqueo a '/comunidad' para que doctores y pacientes puedan navegar el foro
    if (
      currentPath === "/login" ||
      currentPath === "/login-personal" ||
      currentPath === "/" ||
      currentPath === "/acceso-personal"
    ) {
      if (rol === "psicologo") {
        return NextResponse.redirect(
          new URL("/dashboard-psicologo", request.url),
        );
      } else if (rol === "secretaria") {
        return NextResponse.redirect(
          new URL("/dashboard-secretaria", request.url),
        );
      } else {
        return NextResponse.redirect(
          new URL("/dashboard-paciente", request.url),
        );
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Usamos la Service Role Key para poder crear usuarios sin cerrar la sesión del psicólogo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    // 1. Validar quién está haciendo la petición (Debe ser un psicólogo logueado)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: psicologo },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !psicologo)
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

    // 2. Recibir los datos de la nueva secretaria desde el frontend
    const body = await request.json();
    const { email, password, nombre } = body;

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 },
      );
    }

    // 3. Crear el usuario en Supabase Auth (Sin cerrar la sesión actual)
    const { data: authData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirmamos para que pueda entrar de inmediato
        user_metadata: {
          rol: "secretaria",
          nombre: nombre,
        },
      });

    if (createError) throw createError;
    const secretariaId = authData.user.id;

    // 4. Registrar en roles_usuarios (Opcional, según tu arquitectura actual)
    // Nota: Si el ID de roles_usuarios es BIGINT, podrías necesitar un manejo distinto aquí.
    // Si es UUID (igual al de auth.users), esto funcionará perfectamente.
    await supabaseAdmin.from("roles_usuarios").insert({
      correo: email,
      rol: "secretaria",
      nombre: nombre,
    });

    // 5. 🟢 LA MAGIA DE SEGURIDAD: Vincular automáticamente la secretaria al psicólogo
    const { error: vinculacionError } = await supabaseAdmin
      .from("secretaria_psicologo")
      .insert({
        secretaria_id: secretariaId,
        psicologo_id: psicologo.id,
      });

    if (vinculacionError) throw vinculacionError;

    // 6. 🟢 LA MAGIA VISUAL: Crear el perfil para que aparezca en la lista "Mi Equipo"
    const { error: perfilError } = await supabaseAdmin
      .from("perfil_secretaria")
      .insert({
        id: secretariaId,
        psicologo_id: psicologo.id,
        nombre: nombre,
        correo: email,
        estado: "activo",
      });

    if (perfilError) throw perfilError;

    return NextResponse.json({
      mensaje: "Secretaria creada, perfil generado y vinculada exitosamente",
      secretaria_id: secretariaId,
    });
  } catch (error: unknown) {
    const msj =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("[API Crear Secretaria]:", msj);
    return NextResponse.json({ error: msj }, { status: 500 });
  }
}

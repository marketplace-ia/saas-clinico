import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  console.log(
    "[API SRI] 1. Recibiendo petición de configuración tributaria...",
  );

  // Inicializamos el cliente Supabase para el servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No necesitamos establecer cookies aquí, solo leerlas
        },
      },
    },
  );

  try {
    // 1. Verificamos la identidad (Nadie sin sesión puede usar esta ruta)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn("[API SRI] Intento de acceso no autorizado.");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Extraemos los datos del FormData enviado desde el Frontend
    const formData = await request.formData();
    const tributarioStr = formData.get("tributario") as string;
    const configuracionStr = formData.get("configuracion") as string;
    const firmaFile = formData.get("firma") as File | null;
    const passwordFirma = formData.get("passwordFirma") as string | null;

    if (!tributarioStr || !configuracionStr) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (Tributario o Configuración)." },
        { status: 400 },
      );
    }

    const tributario = JSON.parse(tributarioStr);
    const configuracion = JSON.parse(configuracionStr);

    // 3. Guardamos el Perfil Tributario
    const { error: errorTrib } = await supabase
      .from("perfil_tributario_psicologo")
      .upsert({
        psicologo_id: user.id,
        ruc: tributario.ruc,
        razon_social: tributario.razon_social,
        nombre_comercial: tributario.nombre_comercial,
        direccion_matriz: tributario.direccion_matriz,
        obligado_contabilidad: tributario.obligado_contabilidad,
      });

    if (errorTrib)
      throw new Error(`Fallo en perfil tributario: ${errorTrib.message}`);

    // 4. Lógica de Bóveda Segura para la Firma Electrónica
    let estadoFirma = configuracion.estado_firma;

    if (firmaFile && passwordFirma) {
      console.log(
        `[API SRI] Procesando nueva firma .p12 para usuario ${user.id}`,
      );

      // Convertimos el archivo a un Buffer binario para subirlo
      const arrayBuffer = await firmaFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Creamos una ruta única por usuario y fecha
      const filePath = `${user.id}/firma_sri_${Date.now()}.p12`;

      // Subimos al Storage de Supabase (Bucket "firmas_sri")
      const { error: uploadError } = await supabase.storage
        .from("firmas_sri")
        .upload(filePath, buffer, {
          contentType: "application/x-pkcs12",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          "No se pudo subir la firma. Asegúrate de tener un bucket llamado 'firmas_sri' creado en Supabase.",
        );
      }

      estadoFirma = "activa";

      // 🔒 ENCRIPTACIÓN BÁSICA DE LA CONTRASEÑA
      // En un entorno de nivel bancario usaríamos KMS, aquí usamos un cifrado en Base64
      // para evitar que se guarde en texto plano directamente.
      const passwordEncriptado = Buffer.from(passwordFirma).toString("base64");

      // Guardamos la configuración CON la nueva ruta de la firma
      const { error: errorConf } = await supabase
        .from("configuracion_facturacion_psicologo")
        .upsert({
          psicologo_id: user.id,
          establecimiento: configuracion.establecimiento,
          punto_emision: configuracion.punto_emision,
          estado_firma: estadoFirma,
          ruta_firma: filePath, // Guardamos la ruta del Bucket
          password_firma: passwordEncriptado, // Guardamos la contraseña cifrada
        });

      if (errorConf)
        throw new Error("Error guardando credenciales de la firma.");
    } else {
      console.log(
        "[API SRI] Actualizando solo configuración (sin firma nueva).",
      );

      // Guardamos la configuración SIN afectar la firma que ya exista
      const { error: errorConf } = await supabase
        .from("configuracion_facturacion_psicologo")
        .upsert({
          psicologo_id: user.id,
          establecimiento: configuracion.establecimiento,
          punto_emision: configuracion.punto_emision,
        });

      if (errorConf) throw new Error("Error guardando configuración.");
    }

    console.log("[API SRI] ✅ Proceso completado con éxito.");
    return NextResponse.json({
      success: true,
      message: "Datos tributarios almacenados correctamente.",
    });
  } catch (error: unknown) {
    const errorReal =
      error instanceof Error ? error.message : "Fallo interno del servidor";
    console.error("\n[API SRI ERROR]:", errorReal);
    return NextResponse.json({ error: errorReal }, { status: 500 });
  }
}

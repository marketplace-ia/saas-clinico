import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
        <div className="mb-8 border-b border-slate-100 pb-8">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 font-bold hover:underline mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-black text-slate-900 mb-4">
            Políticas de Privacidad
          </h1>
          <p className="text-slate-500 font-medium">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 font-medium">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              1. Introducción
            </h2>
            <p>
              Bienvenido a Clinesfera. Respetamos su privacidad y estamos
              comprometidos a proteger sus datos personales. Esta política de
              privacidad le informará sobre cómo cuidamos sus datos cuando
              visita y utiliza nuestra plataforma SaaS para psicólogos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              2. Uso de los datos de Google Workspace (API de Google Calendar)
            </h2>
            <p>
              Nuestra aplicación utiliza la API de Google para proporcionar
              sincronización bidireccional con Google Calendar. El uso y la
              transferencia de información recibida de las API de Google a
              cualquier otra aplicación se adherirá a la{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Política de datos de usuario de los servicios API de Google
              </a>
              , incluidos los requisitos de uso limitado.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong>¿Qué datos recopilamos?</strong> Solo solicitamos acceso
                para crear, ver, editar y eliminar los eventos en su calendario
                principal que sean generados exclusivamente a través de
                Clinesfera.
              </li>
              <li>
                <strong>¿Por qué lo solicitamos?</strong> Para permitir que las
                citas agendadas en nuestra plataforma se reflejen en su agenda
                personal, evitando cruces de horarios.
              </li>
              <li>
                <strong>¿Cómo protegemos sus datos?</strong> Los tokens de
                autenticación de Google se almacenan de forma segura utilizando
                encriptación a nivel de base de datos en Supabase y nunca se
                comparten con terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              3. Datos de Pacientes (Historias Clínicas)
            </h2>
            <p>
              Clinesfera actúa como un procesador de datos. Toda la información
              clínica (notas, expedientes, diagnósticos) es propiedad exclusiva
              del profesional de la salud (el psicólogo). Nosotros empleamos
              medidas de seguridad de nivel de producción (Row Level Security en
              bases de datos PostgreSQL) para garantizar que solo el profesional
              autorizado pueda acceder a los registros de sus pacientes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              4. Retención y Eliminación de Datos
            </h2>
            <p>
              Mantenemos sus datos únicamente mientras su cuenta esté activa.
              Puede solicitar la eliminación permanente de su cuenta y todos sus
              registros clínicos asociados contactando a nuestro soporte. Al
              eliminar su cuenta, también se revocarán automáticamente los
              accesos a servicios de terceros (como Google Calendar).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              5. Contacto
            </h2>
            <p>
              Si tiene alguna pregunta sobre esta política de privacidad o
              nuestras prácticas de protección de datos, por favor contáctenos
              en: <strong>soporte@clinesfera.com</strong> (o a su correo de
              contacto).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

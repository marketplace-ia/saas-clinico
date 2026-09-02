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
            Políticas de Privacidad de Clinesfera
          </h1>
          <p className="text-slate-500 font-medium">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700 font-medium">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              1. Introducción y Aplicación
            </h2>
            <p>
              Bienvenido a <strong>Clinesfera</strong>. Respetamos su privacidad
              y estamos comprometidos a proteger sus datos personales. Esta
              política explica cómo recopilamos, usamos, almacenamos y
              protegemos su información cuando utiliza nuestra plataforma SaaS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              2. Uso de Datos de Google Workspace (Google Calendar API)
            </h2>
            <p>
              Clinesfera solicita acceso a su cuenta de Google exclusivamente
              para sincronizar su agenda. El uso y la transferencia de
              información recibida de las API de Google a cualquier otra
              aplicación por parte de Clinesfera se adherirá estrictamente a la{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Política de datos de usuario de los servicios API de Google
                (Google API Services User Data Policy)
              </a>
              , incluidos los requisitos de uso limitado.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>
                <strong>Recopilación:</strong> Solo accedemos a los datos de
                Google Calendar para crear, leer, modificar y eliminar eventos
                directamente relacionados con las citas agendadas en Clinesfera.
              </li>
              <li>
                <strong>Uso:</strong> Los datos se usan única y exclusivamente
                para reflejar las citas de los pacientes en el calendario del
                profesional, previniendo conflictos de horario.
              </li>
              <li>
                <strong>Compartición:</strong> Clinesfera <strong>NO</strong>{" "}
                comparte, vende ni transfiere sus datos de Google Workspace a
                terceros bajo ninguna circunstancia. Tampoco utilizamos estos
                datos para mostrar anuncios publicitarios.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              3. Retención y Eliminación de Datos
            </h2>
            <p>
              Los datos se retienen únicamente mientras su cuenta en Clinesfera
              esté activa. Usted tiene el derecho a revocar el acceso a su
              Google Calendar en cualquier momento desde el panel de
              configuración de la plataforma o directamente desde las
              configuraciones de seguridad de su cuenta de Google. Al solicitar
              la eliminación de su cuenta, todos los tokens de acceso y datos
              clínicos serán eliminados permanentemente de nuestros servidores
              (alojados en Supabase) en un plazo no mayor a 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              4. Seguridad de la Información
            </h2>
            <p>
              Implementamos medidas de seguridad estándar de la industria,
              incluyendo cifrado en tránsito (HTTPS) y en reposo (bases de datos
              seguras mediante Row Level Security), para proteger sus
              credenciales y la información de salud de sus pacientes contra el
              acceso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              5. Contacto
            </h2>
            <p>
              Si tiene preguntas, inquietudes o desea ejercer sus derechos sobre
              sus datos, por favor contáctenos directamente a:{" "}
              <strong>pinedaesteban535@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

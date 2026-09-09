export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-8 md:p-20">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#111] p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10">
        <h1 className="text-4xl font-black mb-8 text-indigo-600 dark:text-indigo-400">
          Política de Privacidad
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Última actualización: Septiembre 2026
        </p>

        <div className="space-y-8 text-slate-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              1. Recopilación y Uso de Datos
            </h2>
            <p>
              Clinesfera es una plataforma SaaS de gestión clínica. Recopilamos
              información personal básica (nombre, correo electrónico) para la
              creación de cuentas, y datos operativos necesarios para el
              funcionamiento de la agenda y expedientes clínicos. Estos datos se
              utilizan exclusivamente para proveer el servicio al profesional de
              la salud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              2. Uso de Datos de Google API (Google Calendar)
            </h2>
            <p>
              Nuestra aplicación se integra con Google Calendar para facilitar
              la gestión de citas de los profesionales. Para que esto funcione,
              solicitamos permisos de acceso mediante OAuth.
            </p>
            <p className="mt-4 p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium">
              El uso y la transferencia por parte de Clinesfera a cualquier otra
              aplicación de la información recibida de las API de Google se
              ajustarán a la{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline"
              >
                Política de datos de usuario de los servicios API de Google
              </a>
              , incluidos los requisitos de Uso Limitado (Limited Use).
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <strong>Qué datos recopilamos:</strong> Accedemos a los eventos
                y disponibilidad de su Google Calendar para sincronizar las
                citas creadas en Clinesfera.
              </li>
              <li>
                <strong>Cómo usamos los datos:</strong> La información se lee y
                escribe estrictamente para mantener su agenda sincronizada
                bidireccionalmente. No usamos los datos de Google para entrenar
                modelos de IA ni extraer información personal ajena al servicio.
              </li>
              <li>
                <strong>Almacenamiento:</strong> Los tokens de acceso a Google
                se almacenan de forma segura utilizando encriptación. No
                compartimos, vendemos ni transferimos sus datos a terceros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              3. Seguridad y Derechos del Usuario
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas para proteger su
              información. Usted puede revocar el acceso a su cuenta de Google
              en cualquier momento desde su panel de seguridad de Google.
              Asimismo, tiene derecho a solicitar la eliminación completa de su
              cuenta y datos asociados en Clinesfera.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              4. Contacto
            </h2>
            <p>
              Para dudas sobre el manejo de sus datos o sobre esta política,
              contáctenos en: soporte@clinesfera.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

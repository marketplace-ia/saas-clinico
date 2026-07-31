export default function PacientesPage() {
  return (
    <main className="p-8 h-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mis Pacientes 👥</h1>
          <p className="text-gray-500 mt-2">
            Directorio completo de tus pacientes registrados.
          </p>
        </div>
        <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-md">
          + Nuevo Paciente
        </button>
      </header>

      {/* Tabla de Pacientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-sm font-semibold text-gray-600">
                Nombre
              </th>
              <th className="p-4 text-sm font-semibold text-gray-600">
                Contacto
              </th>
              <th className="p-4 text-sm font-semibold text-gray-600">
                Última Sesión
              </th>
              <th className="p-4 text-sm font-semibold text-gray-600">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="p-4 font-medium text-gray-800">María Fernández</td>
              <td className="p-4 text-sm text-gray-500">maria@correo.com</td>
              <td className="p-4 text-sm text-gray-500">Hace 2 días</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline text-sm font-semibold">
                  Ver Ficha
                </button>
              </td>
            </tr>
            <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
              <td className="p-4 font-medium text-gray-800">Carlos Mendoza</td>
              <td className="p-4 text-sm text-gray-500">carlos@correo.com</td>
              <td className="p-4 text-sm text-gray-500">Hoy</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline text-sm font-semibold">
                  Ver Ficha
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

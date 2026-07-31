export default function HistoriasClinicasPage() {
  return (
    <main className="p-8 h-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Historias Clínicas 📁
          </h1>
          <p className="text-gray-500 mt-2">
            Accede a los expedientes y notas de evolución.
          </p>
        </div>

        {/* Buscador */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Buscar paciente o ID..."
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-600 outline-none w-64"
          />
          <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
            Buscar
          </button>
        </div>
      </header>

      {/* Cuadrícula de Expedientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expediente 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                María Fernández
              </h3>
              <p className="text-sm text-gray-500">ID: #EXP-2026-089</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
              Actualizado hoy
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Paciente reporta mejoría en los síntomas de ansiedad tras los
            ejercicios de respiración. Se recomienda continuar con el registro
            de pensamientos automáticos...
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-blue-600 font-semibold flex justify-between items-center">
            <span>Abrir expediente completo</span>
            <span>→</span>
          </div>
        </div>

        {/* Expediente 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800">
                Carlos Mendoza
              </h3>
              <p className="text-sm text-gray-500">ID: #EXP-2026-102</p>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
              Hace 1 semana
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Sesión de seguimiento. Se discutieron los detonantes de estrés
            laboral y se practicó asertividad en la comunicación. Tareas
            asignadas para la próxima semana.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-blue-600 font-semibold flex justify-between items-center">
            <span>Abrir expediente completo</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </main>
  );
}

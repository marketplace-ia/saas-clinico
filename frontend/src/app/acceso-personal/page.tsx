"use client";
import Link from "next/link";

export default function AccesoPersonalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition mb-8 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Volver a la página principal
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portal del Equipo Clínico
          </h1>
          <p className="text-gray-500 text-lg">
            Selecciona tu área de trabajo para acceder al sistema
            administrativo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/login-personal"
            className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group text-center flex flex-col items-center hover:-translate-y-1"
          >
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform">
              👨‍⚕️
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
              Portal Especialista
            </h2>
            <p className="text-gray-500 mb-8">
              Acceso exclusivo para psicólogos. Gestiona historias clínicas,
              notas médicas y atiende tus citas.
            </p>
            <div className="mt-auto bg-gray-50 text-gray-700 group-hover:bg-blue-600 group-hover:text-white font-bold py-3 px-8 rounded-xl transition-colors w-full">
              Ingresar como Psicólogo →
            </div>
          </Link>

          <Link
            href="/login-personal"
            className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all group text-center flex flex-col items-center hover:-translate-y-1"
          >
            <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform">
              👩‍💻
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
              Portal Administrativo
            </h2>
            <p className="text-gray-500 mb-8">
              Acceso para personal de secretaría. Coordina la agenda global,
              confirma citas y gestiona pacientes.
            </p>
            <div className="mt-auto bg-gray-50 text-gray-700 group-hover:bg-purple-600 group-hover:text-white font-bold py-3 px-8 rounded-xl transition-colors w-full">
              Ingresar como Secretaria →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

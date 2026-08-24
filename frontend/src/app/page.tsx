import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Navegación Superior */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
            Ψ
          </div>
          <span className="text-2xl font-bold text-gray-900">PsiClinic.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition shadow-sm"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Sección Central (Hero) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-8">
          Plataforma Clínica Integral
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight max-w-4xl mb-6 leading-tight">
          Tu bienestar mental, <br />
          <span className="text-blue-600">a un clic de distancia.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Gestiona tus citas, revisa tu historial clínico y mantente en contacto
          con tu especialista desde nuestra plataforma 100% segura y
          confidencial.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full justify-center max-w-md mx-auto sm:max-w-none">
          <Link
            href="/registro"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg hover:-translate-y-0.5"
          >
            Empieza Ahora (Crear Cuenta)
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-full font-bold text-lg transition shadow-sm hover:-translate-y-0.5"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* EL NUEVO ENLACE PARA EL PERSONAL (Doctor y Secretaria) */}
        <Link
          href="/acceso-personal"
          className="text-sm text-gray-400 hover:text-blue-600 transition underline font-medium"
        >
          ¿Eres parte del equipo clínico? Accede a tu portal aquí
        </Link>
      </main>
    </div>
  );
}

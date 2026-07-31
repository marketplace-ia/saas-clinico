"use client";

import Link from "next/link";
import { User, Stethoscope, ClipboardList, KeyRound } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Bienvenido a <span className="text-blue-600">PsiClinic</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Selecciona tu perfil para iniciar sesión y acceder a tu panel de
          control personalizado.
        </p>
      </div>

      {/* Tarjetas de Selección de Perfil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Tarjeta: Paciente */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Soy Paciente
          </h2>
          <p className="text-slate-500 mb-8 flex-1">
            Accede a tus citas, revisa tu historial clínico y busca
            especialistas.
          </p>
          <Link
            href="/login"
            className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2 group"
          >
            Ingresar al portal
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Tarjeta: Profesional */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Stethoscope className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Soy Profesional
          </h2>
          <p className="text-slate-500 mb-8 flex-1">
            Gestiona tus pacientes, administra tu agenda y escribe diagnósticos.
          </p>
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2 group"
          >
            Ingresar al portal
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Tarjeta: Secretaria */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <ClipboardList className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Soy Secretaria
          </h2>
          <p className="text-slate-500 mb-8 flex-1">
            Administra el flujo de la clínica, los cobros y las agendas
            generales.
          </p>
          <Link
            href="/login"
            className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-2 group"
          >
            Ingresar al portal
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* --- NUEVA SECCIÓN DE ACTIVACIÓN DE STAFF --- */}
      <div className="mt-16 w-full max-w-5xl">
        <div className="bg-slate-200/50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors hover:bg-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                ¿Nuevo profesional o secretaria?
              </h3>
              <p className="text-slate-600 text-sm">
                Si te acabas de unir a la clínica, ingresa tu código de
                invitación para habilitar tu portal.
              </p>
            </div>
          </div>
          <Link
            href="/activacion-staff"
            className="whitespace-nowrap bg-white border border-slate-300 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-800 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
          >
            Activar mi cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}

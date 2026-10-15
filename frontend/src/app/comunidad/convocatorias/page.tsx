"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Building,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

interface Convocatoria {
  id: string;
  tipo: "empleo" | "alianzas" | "academico";
  titulo: string;
  entidad: string;
  ubicacion: string;
  descripcion: string;
  etiquetas: string[];
  creado_el: string;
  activa: boolean;
}

export default function ConvocatoriasPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<
    "todas" | "empleo" | "alianzas" | "academico"
  >("todas");

  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Postulación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] =
    useState<Convocatoria | null>(null);
  const [procesandoPostulacion, setProcesandoPostulacion] = useState(false);
  const [postulacionExitosa, setPostulacionExitosa] = useState(false);

  const cargarConvocatorias = useCallback(async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("convocatorias")
        .select("*")
        .eq("activa", true)
        .order("creado_el", { ascending: false });

      if (error) throw error;
      setConvocatorias(data as Convocatoria[]);
    } catch (error) {
      console.error("Error cargando convocatorias:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  // 🟢 CORRECCIÓN 1: Envolvemos en función interna asíncrona
  useEffect(() => {
    const inicializar = async () => {
      await cargarConvocatorias();
    };
    inicializar();
  }, [cargarConvocatorias]);

  const abrirModalPostulacion = async (convocatoria: Convocatoria) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Debes iniciar sesión para poder postular a una vacante.");
      router.push("/login?returnTo=/comunidad/convocatorias");
      return;
    }

    setConvocatoriaSeleccionada(convocatoria);
    setPostulacionExitosa(false);
    setModalAbierto(true);
  };

  const confirmarPostulacion = async () => {
    if (!convocatoriaSeleccionada) return;
    setProcesandoPostulacion(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Sin sesión activa");

      const { error } = await supabase
        .from("convocatorias_postulaciones")
        .insert({
          convocatoria_id: convocatoriaSeleccionada.id,
          usuario_id: session.user.id,
          estado: "enviada",
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "Ya has postulado anteriormente a esta convocatoria.",
          );
        }
        throw error;
      }

      setPostulacionExitosa(true);
    } catch (error: unknown) {
      const msj =
        error instanceof Error
          ? error.message
          : "Error al procesar la postulación.";
      alert(msj);
      setModalAbierto(false);
    } finally {
      setProcesandoPostulacion(false);
    }
  };

  const filtradas = convocatorias.filter(
    (c) => filtro === "todas" || c.tipo === filtro,
  );

  return (
    <div className="animate-in fade-in duration-700 relative">
      {/* Cabecera */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
          Bolsa de Oportunidades
        </h1>
        <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
          Encuentra tu próximo desafío profesional. Explora vacantes clínicas,
          alianzas para compartir consultorio y oportunidades de investigación.
        </p>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4" />
          <input
            type="text"
            placeholder="Buscar vacantes o especialidades..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent border-none focus:ring-0 text-slate-700 outline-none"
          />
        </div>
        <div className="w-full md:w-px md:h-12 bg-slate-200 shrink-0"></div>
        <div className="flex overflow-x-auto hide-scrollbar gap-1 p-1 shrink-0">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${filtro === "todas" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro("empleo")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${filtro === "empleo" ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Briefcase className="w-4 h-4" /> Empleo
          </button>
          <button
            onClick={() => setFiltro("alianzas")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${filtro === "alianzas" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Building className="w-4 h-4" /> Alianzas
          </button>
          <button
            onClick={() => setFiltro("academico")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${filtro === "academico" ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <GraduationCap className="w-4 h-4" /> Académico
          </button>
        </div>
      </div>

      {/* Lista de Convocatorias */}
      {cargando ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="font-bold tracking-widest uppercase text-xs">
            Cargando Oportunidades...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtradas.map((convocatoria) => (
            <div
              key={convocatoria.id}
              className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group flex flex-col md:flex-row gap-6 items-start"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  convocatoria.tipo === "empleo"
                    ? "bg-indigo-50 text-indigo-600"
                    : convocatoria.tipo === "alianzas"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                {convocatoria.tipo === "empleo" && (
                  <Briefcase className="w-7 h-7" />
                )}
                {convocatoria.tipo === "alianzas" && (
                  <Building className="w-7 h-7" />
                )}
                {convocatoria.tipo === "academico" && (
                  <GraduationCap className="w-7 h-7" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {convocatoria.titulo}
                    </h3>
                    <p className="text-slate-600 font-bold mt-1">
                      {convocatoria.entidad}
                    </p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg w-fit shrink-0">
                    <Clock className="w-3.5 h-3.5" />{" "}
                    {new Date(convocatoria.creado_el).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400" />{" "}
                  {convocatoria.ubicacion}
                </div>
                <p className="text-slate-600 mb-5 leading-relaxed">
                  {convocatoria.descripcion}
                </p>
                <div className="flex flex-wrap gap-2">
                  {convocatoria.etiquetas.map((etiqueta, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg"
                    >
                      {etiqueta}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-col justify-center h-full pt-2">
                <button
                  onClick={() => abrirModalPostulacion(convocatoria)}
                  className="w-full md:w-auto bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  Postular{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {filtradas.length === 0 && (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900">
                No hay convocatorias
              </h3>
              <p className="text-slate-500">
                Intenta con otro filtro o categoría.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE POSTULACIÓN */}
      {modalAbierto && convocatoriaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {postulacionExitosa ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  ¡Postulación Enviada!
                </h3>
                <p className="text-slate-500 mb-8 font-medium">
                  Hemos notificado a{" "}
                  <strong>{convocatoriaSeleccionada.entidad}</strong>. Si tu
                  perfil se ajusta, se pondrán en contacto contigo vía correo
                  electrónico.
                </p>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Entendido, volver a la bolsa
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-6 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900">
                    Confirmar Postulación
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Revisa los detalles antes de enviar tu perfil.
                  </p>
                </div>
                <div className="p-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mb-6">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                      Vacante Seleccionada
                    </p>
                    <p className="font-black text-slate-900">
                      {convocatoriaSeleccionada.titulo}
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                      {convocatoriaSeleccionada.entidad}
                    </p>
                  </div>
                  {/* 🟢 CORRECCIÓN 2: Uso de &quot; para las comillas dentro del texto JSX */}
                  <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                    Al hacer clic en &quot;Confirmar&quot;, tu perfil
                    profesional público y tus datos de contacto registrados en
                    Clinesfera serán enviados a esta institución.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalAbierto(false)}
                      disabled={procesandoPostulacion}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarPostulacion}
                      disabled={procesandoPostulacion}
                      className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-50"
                    >
                      {procesandoPostulacion ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "Confirmar Envío"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

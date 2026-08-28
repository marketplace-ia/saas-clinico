"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage, LangType } from "../../context/LanguageContext";

interface TranslationInterface {
  back: string;
  login: string;
  tag: string;
  sidebar: {
    title: string;
    global: string;
    courses: string;
    pros: string;
    students: string;
  };
  main: {
    welcome: string;
    desc: string;
    btn: string;
    empty: string;
    emptyDesc: string;
    alert: string;
  };
}

const translations: Record<LangType, TranslationInterface> = {
  es: {
    back: "Volver",
    login: "Iniciar Sesión",
    tag: "Aprende • Conecta • Crece",
    sidebar: {
      title: "Explorar Comunidad",
      global: "Muro Global",
      courses: "Cursos",
      pros: "Profesionales",
      students: "Estudiantes",
    },
    main: {
      welcome: "Bienvenido al ecosistema.",
      desc: "Un portal integral diseñado para buscar, aprender y mejorar la salud mental.",
      btn: "Crear Publicación",
      empty: "No hay publicaciones",
      emptyDesc: "Sé el primero en iniciar una conversación.",
      alert: "Debes iniciar sesión para publicar.",
    },
  },
  en: {
    back: "Back",
    login: "Log In",
    tag: "Learn • Connect • Grow",
    sidebar: {
      title: "Explore",
      global: "Global Wall",
      courses: "Courses",
      pros: "Professionals",
      students: "Students",
    },
    main: {
      welcome: "Welcome to the ecosystem.",
      desc: "A comprehensive portal designed to learn and improve mental health.",
      btn: "Create Post",
      empty: "No posts yet",
      emptyDesc: "Be the first to start a conversation.",
      alert: "You must log in to post.",
    },
  },
  zh: {
    back: "返回",
    login: "登录",
    tag: "学习 • 连接 • 成长",
    sidebar: {
      title: "探索社区",
      global: "全球墙",
      courses: "课程",
      pros: "专业人士",
      students: "学生区",
    },
    main: {
      welcome: "欢迎来到生态系统。",
      desc: "一个为学习和改善心理健康设计的综合门户。",
      btn: "创建帖子",
      empty: "暂无帖子",
      emptyDesc: "成为第一个发起对话的人。",
      alert: "您必须登录才能发帖。",
    },
  },
  hi: {
    back: "वापस",
    login: "लॉग इन",
    tag: "सीखें • जुड़ें • बढ़ें",
    sidebar: {
      title: "अन्वेषण करें",
      global: "ग्लोबल वॉल",
      courses: "पाठ्यक्रम",
      pros: "पेशेवर",
      students: "छात्र",
    },
    main: {
      welcome: "पारिस्थितिकी तंत्र में आपका स्वागत है।",
      desc: "मानसिक स्वास्थ्य को सीखने और सुधारने के लिए डिज़ाइन किया गया एक पोर्टल।",
      btn: "पोस्ट बनाएं",
      empty: "कोई पोस्ट नहीं",
      emptyDesc: "बातचीत शुरू करने वाले पहले व्यक्ति बनें।",
      alert: "पोस्ट करने के लिए लॉग इन करें।",
    },
  },
  fr: {
    back: "Retour",
    login: "Connexion",
    tag: "Apprendre • Connecter • Grandir",
    sidebar: {
      title: "Explorer",
      global: "Mur Global",
      courses: "Cours",
      pros: "Professionnels",
      students: "Étudiants",
    },
    main: {
      welcome: "Bienvenue dans l'écosystème.",
      desc: "Un portail complet conçu pour apprendre et améliorer la santé mentale.",
      btn: "Créer une publication",
      empty: "Aucune publication",
      emptyDesc: "Soyez le premier à lancer une conversation.",
      alert: "Vous devez vous connecter pour publier.",
    },
  },
  ar: {
    back: "العودة",
    login: "تسجيل الدخول",
    tag: "تعلم • تواصل • انمو",
    sidebar: {
      title: "استكشاف",
      global: "الجدار العالمي",
      courses: "دورات",
      pros: "محترفون",
      students: "طلاب",
    },
    main: {
      welcome: "مرحبًا بك في النظام البيئي.",
      desc: "بوابة شاملة مصممة للتعلم وتحسين الصحة العقلية.",
      btn: "إنشاء منشور",
      empty: "لا توجد منشورات",
      emptyDesc: "كن الأول في بدء محادثة.",
      alert: "يجب عليك تسجيل الدخول للنشر.",
    },
  },
};

const idiomasDisponibles = [
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
];

export default function ComunidadPortalPage() {
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [menuIdiomas, setMenuIdiomas] = useState(false);
  const { lang, setLang, isRtl } = useLanguage();
  const t = translations[lang];

  const foros = [
    {
      id: 1,
      autor: "Dra. Elena Silva",
      rol: "Profesional",
      tiempo: "2h",
      titulo: "Nuevos enfoques en Terapia Cognitivo Conductual para 2026",
      respuestas: 14,
      likes: 32,
      tag: "Debate Clínico",
      color: "bg-purple-100 text-purple-700",
      categoria: "profesionales",
    },
    {
      id: 2,
      autor: "Carlos M.",
      rol: "Estudiante",
      tiempo: "5h",
      titulo: "¿Algún consejo para mi primera práctica pre-profesional?",
      respuestas: 8,
      likes: 15,
      tag: "Academia",
      color: "bg-blue-100 text-blue-700",
      categoria: "estudiantes",
    },
    {
      id: 3,
      autor: "Equipo PsiEduca",
      rol: "Oficial",
      tiempo: "1d",
      titulo: "Taller Gratuito: Primeros Auxilios Psicológicos en crisis",
      respuestas: 45,
      likes: 120,
      tag: "Eventos",
      color: "bg-teal-100 text-teal-700",
      categoria: "psieduca",
    },
  ];

  const forosFiltrados = foros.filter((foro) =>
    filtroActivo === "todos" ? true : foro.categoria === filtroActivo,
  );

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 transition-colors duration-300"
    >
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-900 via-purple-700 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-indigo-950">
                Connected<span className="text-teal-600">Mind</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                {t.tag}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* BOTÓN DESPLEGABLE DE IDIOMAS */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenuIdiomas(!menuIdiomas)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-full text-sm font-bold text-slate-700 transition-colors focus:outline-none"
              >
                {idiomasDisponibles.find((i) => i.code === lang)?.flag}{" "}
                {lang.toUpperCase()}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {menuIdiomas && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {idiomasDisponibles.map((idioma) => (
                    <button
                      key={idioma.code}
                      onClick={() => {
                        setLang(idioma.code as LangType);
                        setMenuIdiomas(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${lang === idioma.code ? "text-indigo-600 bg-slate-50" : "text-slate-700"}`}
                    >
                      {idioma.flag} {idioma.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors hidden md:block"
            >
              {t.back}
            </Link>
            <Link
              href="/login"
              className="bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-2.5 px-6 rounded-full transition-all shadow-md text-sm"
            >
              {t.login}
            </Link>
          </div>
        </div>
      </header>

      {/* CUADRÍCULA DE IDIOMAS PARA MÓVIL EN LA COMUNIDAD */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4">
        <div className="grid grid-cols-3 gap-2">
          {idiomasDisponibles.map((idioma) => (
            <button
              key={idioma.code}
              onClick={() => setLang(idioma.code as LangType)}
              className={`py-2 px-1 rounded-lg text-xs font-bold text-center border transition-colors ${lang === idioma.code ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-700"}`}
            >
              {idioma.flag} {idioma.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-28">
            <h2 className="font-black text-slate-900 mb-4 uppercase tracking-wider text-xs">
              {t.sidebar.title}
            </h2>
            <nav className="space-y-2">
              <button
                onClick={() => setFiltroActivo("todos")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "todos" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🌐 {t.sidebar.global}
              </button>
              <button
                onClick={() => setFiltroActivo("psieduca")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "psieduca" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                📚 {t.sidebar.courses}
              </button>
              <button
                onClick={() => setFiltroActivo("profesionales")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "profesionales" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🤝 {t.sidebar.pros}
              </button>
              <button
                onClick={() => setFiltroActivo("estudiantes")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-sm ${filtroActivo === "estudiantes" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                🎓 {t.sidebar.students}
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-linear-to-r from-indigo-950 to-purple-900 rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-3">{t.main.welcome}</h2>
              <p className="text-indigo-200 mb-6 max-w-lg leading-relaxed">
                {t.main.desc}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => alert(t.main.alert)}
                  className="bg-white text-indigo-950 font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-md"
                >
                  {t.main.btn}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {forosFiltrados.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t.main.empty}
                </h3>
                <p className="text-slate-500">{t.main.emptyDesc}</p>
              </div>
            ) : (
              forosFiltrados.map((foro) => (
                <div
                  key={foro.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {foro.autor.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {foro.autor}
                        </p>
                        <p className="text-xs text-slate-500">{foro.tiempo}</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {foro.titulo}
                  </h3>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

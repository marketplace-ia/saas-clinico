"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage, LangType } from "../../context/LanguageContext";

// Interfaz estricta para eliminar el error de 'any'
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
    back: "Volver a Lumina",
    login: "Iniciar Sesión",
    tag: "Aprende • Conecta • Crece • Gestiona",
    sidebar: {
      title: "Explorar Comunidad",
      global: "Muro Global",
      courses: "Cursos PsiEduca",
      pros: "Red de Profesionales",
      students: "Zona Estudiantes",
    },
    main: {
      welcome: "Bienvenido al ecosistema.",
      desc: "Un portal integral diseñado para estudiantes, profesionales y cualquier persona buscando aprender y mejorar su salud mental.",
      btn: "Crear Publicación",
      empty: "No hay publicaciones",
      emptyDesc: "Sé el primero en iniciar una conversación en esta categoría.",
      alert: "Debes iniciar sesión para publicar.",
    },
  },
  en: {
    back: "Back to Lumina",
    login: "Log In",
    tag: "Learn • Connect • Grow • Manage",
    sidebar: {
      title: "Explore Community",
      global: "Global Wall",
      courses: "PsiEduca Courses",
      pros: "Professionals Network",
      students: "Students Zone",
    },
    main: {
      welcome: "Welcome to the ecosystem.",
      desc: "A comprehensive portal designed for students, professionals, and anyone looking to learn and improve their mental health.",
      btn: "Create Post",
      empty: "No posts yet",
      emptyDesc: "Be the first to start a conversation in this category.",
      alert: "You must log in to post.",
    },
  },
  zh: {
    back: "返回 Lumina",
    login: "登录",
    tag: "学习 • 连接 • 成长 • 管理",
    sidebar: {
      title: "探索社区",
      global: "全球墙",
      courses: "PsiEduca 课程",
      pros: "专业网络",
      students: "学生区",
    },
    main: {
      welcome: "欢迎来到生态系统。",
      desc: "一个为学生、专业人士和任何希望学习和改善心理健康的人设计的综合门户。",
      btn: "创建帖子",
      empty: "暂无帖子",
      emptyDesc: "成为第一个在此类别中发起对话的人。",
      alert: "您必须登录才能发帖。",
    },
  },
  hi: {
    back: "Lumina पर वापस जाएं",
    login: "लॉग इन करें",
    tag: "सीखें • जुड़ें • बढ़ें • प्रबंधित करें",
    sidebar: {
      title: "समुदाय का अन्वेषण करें",
      global: "ग्लोबल वॉल",
      courses: "PsiEduca पाठ्यक्रम",
      pros: "पेशेवर नेटवर्क",
      students: "छात्र क्षेत्र",
    },
    main: {
      welcome: "पारिस्थितिकी तंत्र में आपका स्वागत है।",
      desc: "छात्रों, पेशेवरों और मानसिक स्वास्थ्य को सीखने और सुधारने के इच्छुक किसी भी व्यक्ति के लिए डिज़ाइन किया गया एक व्यापक पोर्टल।",
      btn: "पोस्ट बनाएं",
      empty: "कोई पोस्ट नहीं",
      emptyDesc: "इस श्रेणी में बातचीत शुरू करने वाले पहले व्यक्ति बनें।",
      alert: "पोस्ट करने के लिए आपको लॉग কমপক্ষে लॉग इन करना होगा।",
    },
  },
  fr: {
    back: "Retour à Lumina",
    login: "Connexion",
    tag: "Apprendre • Connecter • Grandir • Gérer",
    sidebar: {
      title: "Explorer la Communauté",
      global: "Mur Global",
      courses: "Cours PsiEduca",
      pros: "Réseau de Professionnels",
      students: "Zone Étudiants",
    },
    main: {
      welcome: "Bienvenue dans l'écosystème.",
      desc: "Un portail complet conçu pour les étudiants, les professionnels et toute personne cherchant à apprendre et à améliorer sa santé mentale.",
      btn: "Créer une publication",
      empty: "Aucune publication",
      emptyDesc:
        "Soyez le premier à lancer une conversation dans cette catégorie.",
      alert: "Vous devez vous connecter pour publier.",
    },
  },
  ar: {
    back: "العودة إلى Lumina",
    login: "تسجيل الدخول",
    tag: "تعلم • تواصل • انمو • أدر",
    sidebar: {
      title: "استكشاف المجتمع",
      global: "الجدار العالمي",
      courses: "دورات PsiEduca",
      pros: "شبكة المحترفين",
      students: "منطقة الطلاب",
    },
    main: {
      welcome: "مرحبًا بك في النظام البيئي.",
      desc: "بوابة شاملة مصممة للطلاب والمحترفين وأي شخص يتطلع إلى التعلم وتحسين صحته العقلية.",
      btn: "إنشاء منشور",
      empty: "لا توجد منشورات",
      emptyDesc: "كن الأول في بدء محادثة في هذه الفئة.",
      alert: "يجب عليك تسجيل الدخول للنشر.",
    },
  },
};

export default function ComunidadPortalPage() {
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const { lang, isRtl } = useLanguage();
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

  const handleCrearPublicacion = () => alert(t.main.alert);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f8fafc] font-sans text-slate-900"
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
                  onClick={handleCrearPublicacion}
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

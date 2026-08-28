"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage, LangType } from "../context/LanguageContext";

const translations = {
  es: {
    nav: {
      clinica: "Gestión Clínica",
      psieduca: "Portal PsiEduca",
      comunidad: "Comunidad",
    },
    auth: { prof: "Acceso Profesionales", login: "Ingresar" },
    hero: {
      tag: "Aprende • Conecta • Crece • Gestiona",
      title1: "El ecosistema integral para",
      title2: "la comunidad de salud mental.",
      desc: "Mucho más que un consultorio. Una plataforma unificada para que psicólogos gestionen su clínica, y estudiantes y público accedan a educación.",
      btn: "Únete a la Comunidad",
    },
    features: {
      title: "Diseñado para todos",
      desc: "Un espacio donde la tecnología clínica y la psicoeducación convergen.",
      c1Tag: "Para Clínicas",
      c1Title: "Gestión Inteligente",
      c1Desc:
        "Agenda sincronizada, historiales médicos encriptados, pasarela de pagos automatizada.",
      c2Tag: "Para Estudiantes",
      c2Title: "Portal PsiEduca",
      c2Desc:
        "Acceso a talleres, recursos didácticos, artículos científicos y herramientas.",
      c3Tag: "Para Profesores",
      c3Title: "Conexión Global",
      c3Desc:
        "Construye una red de apoyo y comparte conocimientos junto a la comunidad más avanzada.",
    },
    footer: {
      copy: "Construido para el futuro de la salud mental. © 2026",
      priv: "Privacidad",
    },
  },
  en: {
    nav: {
      clinica: "Clinical Management",
      psieduca: "PsiEduca Portal",
      comunidad: "Community",
    },
    auth: { prof: "Professionals Access", login: "Log In" },
    hero: {
      tag: "Learn • Connect • Grow • Manage",
      title1: "The comprehensive ecosystem for",
      title2: "the mental health community.",
      desc: "Much more than a clinic. A unified platform for psychologists to manage their practice, and for students to access education.",
      btn: "Join the Community",
    },
    features: {
      title: "Designed for everyone",
      desc: "A space where clinical technology and psychoeducation converge.",
      c1Tag: "For Clinics",
      c1Title: "Smart Management",
      c1Desc:
        "Synchronized agenda, encrypted medical records, automated payment gateway.",
      c2Tag: "For Students",
      c2Title: "PsiEduca Portal",
      c2Desc:
        "Access to workshops, educational resources, scientific articles, and tools.",
      c3Tag: "For Teachers",
      c3Title: "Global Connection",
      c3Desc:
        "Build a support network and share knowledge with the most advanced community.",
    },
    footer: {
      copy: "Built for the future of mental health. © 2026",
      priv: "Privacy",
    },
  },
  zh: {
    nav: { clinica: "临床管理", psieduca: "PsiEduca 门户", comunidad: "社区" },
    auth: { prof: "专业人士入口", login: "登录" },
    hero: {
      tag: "学习 • 连接 • 成长 • 管理",
      title1: "心理健康社区的",
      title2: "综合生态系统。",
      desc: "不仅仅是一个诊所。一个统一的平台，供心理学家管理他们的诊所，也供公众获取优质教育。",
      btn: "加入社区",
    },
    features: {
      title: "为所有人设计",
      desc: "临床技术与心理教育交汇的空间。",
      c1Tag: "对于诊所",
      c1Title: "智能管理",
      c1Desc: "同步日程安排，加密病历，自动支付网关。",
      c2Tag: "对于学生",
      c2Title: "PsiEduca 门户",
      c2Desc: "访问研讨会、教育资源、科学文章和工具。",
      c3Tag: "对于教师",
      c3Title: "全球连接",
      c3Desc: "建立支持网络并与最先进的社区分享知识。",
    },
    footer: { copy: "为心理健康的未来而建。 © 2026", priv: "隐私" },
  },
  hi: {
    nav: {
      clinica: "नैदानिक प्रबंधन",
      psieduca: "PsiEduca पोर्टल",
      comunidad: "समुदाय",
    },
    auth: { prof: "पेशेवर पहुंच", login: "लॉग इन करें" },
    hero: {
      tag: "सीखें • जुड़ें • बढ़ें • प्रबंधित करें",
      title1: "मानसिक स्वास्थ्य समुदाय के लिए",
      title2: "व्यापक पारिस्थितिकी तंत्र।",
      desc: "सिर्फ एक क्लिनिक से कहीं अधिक। मनोवैज्ञानिकों के लिए अपने क्लिनिक का प्रबंधन करने, और छात्रों के लिए गुणवत्तापूर्ण शिक्षा तक पहुंचने के लिए एक एकीकृत मंच।",
      btn: "समुदाय में शामिल हों",
    },
    features: {
      title: "सभी के लिए डिज़ाइन किया गया",
      desc: "एक ऐसा स्थान जहां नैदानिक तकनीक और मनो-शिक्षा मिलते हैं।",
      c1Tag: "क्लिनिक के लिए",
      c1Title: "स्मार्ट प्रबंधन",
      c1Desc:
        "सिंक्रनाइज़ एजेंडा, एन्क्रिप्टेड मेडिकल रिकॉर्ड, स्वचालित भुगतान गेटवे।",
      c2Tag: "छात्रों के लिए",
      c2Title: "PsiEduca पोर्टल",
      c2Desc:
        "कार्यशालाओं, शैक्षिक संसाधनों, वैज्ञानिक लेखों और उपकरणों तक पहुंच।",
      c3Tag: "शिक्षकों के लिए",
      c3Title: "वैश्विक कनेक्शन",
      c3Desc:
        "एक सहायता नेटवर्क बनाएं और सबसे उन्नत समुदाय के साथ ज्ञान साझा करें।",
    },
    footer: {
      copy: "मानसिक स्वास्थ्य के भविष्य के लिए निर्मित। © 2026",
      priv: "गोपनीयता",
    },
  },
  fr: {
    nav: {
      clinica: "Gestion Clinique",
      psieduca: "Portail PsiEduca",
      comunidad: "Communauté",
    },
    auth: { prof: "Accès Professionnels", login: "Connexion" },
    hero: {
      tag: "Apprendre • Connecter • Grandir • Gérer",
      title1: "L'écosystème complet pour",
      title2: "la communauté de santé mentale.",
      desc: "Bien plus qu'un simple cabinet. Une plateforme unifiée pour que les psychologues gèrent leur clinique, et pour accéder à une éducation de qualité.",
      btn: "Rejoindre la Communauté",
    },
    features: {
      title: "Conçu pour tous",
      desc: "Un espace où convergent la technologie clinique et la psychoéducation.",
      c1Tag: "Pour les Cliniques",
      c1Title: "Gestion Intelligente",
      c1Desc:
        "Agenda synchronisé, dossiers médicaux cryptés, passerelle de paiement automatisée.",
      c2Tag: "Pour les Étudiants",
      c2Title: "Portail PsiEduca",
      c2Desc:
        "Accès à des ateliers, des ressources éducatives, des articles et des outils.",
      c3Tag: "Pour les Enseignants",
      c3Title: "Connexion Globale",
      c3Desc:
        "Construisez un réseau de soutien et partagez des connaissances avec la communauté.",
    },
    footer: {
      copy: "Construit pour l'avenir de la santé mentale. © 2026",
      priv: "Confidentialité",
    },
  },
  ar: {
    nav: {
      clinica: "الإدارة السريرية",
      psieduca: "بوابة PsiEduca",
      comunidad: "مجتمع",
    },
    auth: { prof: "وصول المحترفين", login: "تسجيل الدخول" },
    hero: {
      tag: "تعلم • تواصل • انمو • أدر",
      title1: "النظام البيئي الشامل لـ",
      title2: "مجتمع الصحة النفسية.",
      desc: "أكثر بكثير من مجرد عيادة. منصة موحدة لعلماء النفس لإدارة عياداتهم، وللطلاب للوصول إلى تعليم عالي الجودة.",
      btn: "انضم إلى المجتمع",
    },
    features: {
      title: "مصمم للجميع",
      desc: "مساحة تلتقي فيها التكنولوجيا السريرية والتربية النفسية.",
      c1Tag: "للعيادات",
      c1Title: "إدارة ذكية",
      c1Desc: "جدول زمني متزامن، سجلات طبية مشفرة، بوابة دفع آلية.",
      c2Tag: "للطلاب",
      c2Title: "بوابة PsiEduca",
      c2Desc: "الوصول إلى ورش العمل والموارد التعليمية والمقالات العلمية.",
      c3Tag: "للمعلمين",
      c3Title: "اتصال عالمي",
      c3Desc: "قم ببناء شبكة دعم وتبادل المعرفة مع المجتمع الأكثر تقدمًا.",
    },
    footer: { copy: "بنيت لمستقبل الصحة النفسية. © 2026", priv: "الخصوصية" },
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

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuIdiomas, setMenuIdiomas] = useState(false);

  const { lang, setLang, isRtl } = useLanguage();
  const t = translations[lang];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30 transition-colors duration-300"
    >
      <header className="fixed top-0 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] dark:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-400">
              Lumina
            </span>
          </div>

          <nav className="hidden md:flex gap-10 font-medium text-sm text-slate-600 dark:text-gray-400">
            <a
              href="#clinica"
              className="hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              {t.nav.clinica}
            </a>
            <a
              href="#psieduca"
              className="hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              {t.nav.psieduca}
            </a>
            <Link
              href="/comunidad"
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
            >
              {t.nav.comunidad}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-5">
            {/* NUEVO BOTÓN DROPDOWN DE IDIOMA (DESKTOP) */}
            <div className="relative">
              <button
                onClick={() => setMenuIdiomas(!menuIdiomas)}
                className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2.5 rounded-full text-sm font-bold text-slate-700 dark:text-gray-300 transition-colors focus:outline-none"
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
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  {idiomasDisponibles.map((idioma) => (
                    <button
                      key={idioma.code}
                      onClick={() => {
                        setLang(idioma.code as LangType);
                        setMenuIdiomas(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${lang === idioma.code ? "text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-white/5" : "text-slate-700 dark:text-gray-300"}`}
                    >
                      {idioma.flag} {idioma.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/login-personal"
              className="text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              {t.auth.prof}
            </Link>
            <Link
              href="/login"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black font-black py-2.5 px-6 rounded-full transition-transform hover:scale-105 text-sm"
            >
              {t.auth.login}
            </Link>
          </div>

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white focus:outline-none"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuAbierto ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* MENÚ MÓVIL (Con cuadrícula de idiomas) */}
        {menuAbierto && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex flex-col p-6 gap-6">
              <nav className="flex flex-col gap-4 text-slate-700 dark:text-gray-300 font-medium text-lg">
                <a
                  href="#clinica"
                  onClick={() => setMenuAbierto(false)}
                  className="hover:text-indigo-600 dark:hover:text-white"
                >
                  {t.nav.clinica}
                </a>
                <a
                  href="#psieduca"
                  onClick={() => setMenuAbierto(false)}
                  className="hover:text-indigo-600 dark:hover:text-white"
                >
                  {t.nav.psieduca}
                </a>
                <Link
                  href="/comunidad"
                  onClick={() => setMenuAbierto(false)}
                  className="text-teal-600 dark:text-teal-400"
                >
                  {t.nav.comunidad}
                </Link>
              </nav>
              <div className="h-px bg-slate-200 dark:bg-white/10 w-full"></div>

              {/* CUADRÍCULA DE IDIOMAS MÓVIL */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {idiomasDisponibles.map((idioma) => (
                  <button
                    key={idioma.code}
                    onClick={() => {
                      setLang(idioma.code as LangType);
                      setMenuAbierto(false);
                    }}
                    className={`py-2 px-3 rounded-lg text-sm font-bold text-center border transition-colors ${lang === idioma.code ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-400" : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-gray-300"}`}
                  >
                    {idioma.flag} {idioma.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-black text-center font-black py-4 rounded-xl text-lg"
                >
                  {t.auth.login}
                </Link>
                <Link
                  href="/login-personal"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-center font-bold py-4 rounded-xl"
                >
                  {t.auth.prof}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/3 w-150 h-150 bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-widest text-center">
              {t.hero.tag}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] max-w-5xl text-slate-900 dark:text-white">
            {t.hero.title1} <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-teal-500 to-emerald-500 dark:from-indigo-400 dark:via-teal-300 dark:to-emerald-400">
              {t.hero.title2}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-12 max-w-2xl leading-relaxed font-light">
            {t.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/comunidad"
              className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-lg dark:shadow-[0_0_30px_rgba(99,102,241,0.3)] text-lg flex items-center justify-center gap-2"
            >
              {t.hero.btn}
            </Link>
          </div>
        </div>
      </section>

      <section
        id="clinica"
        className="py-24 md:py-32 relative border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#050505] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
              {t.features.title}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg font-light">
              {t.features.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col h-full hover:bg-slate-100 dark:hover:bg-[#151515] transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-2">
                {t.features.c1Tag}
              </span>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-gray-100">
                {t.features.c1Title}
              </h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-light">
                {t.features.c1Desc}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col h-full hover:bg-slate-100 dark:hover:bg-[#151515] transition-all duration-300">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-teal-600 dark:text-teal-400 text-xs font-bold tracking-widest uppercase mb-2">
                {t.features.c2Tag}
              </span>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-gray-100">
                {t.features.c2Title}
              </h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-light">
                {t.features.c2Desc}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col h-full hover:bg-slate-100 dark:hover:bg-[#151515] transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">
                {t.features.c3Tag}
              </span>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-gray-100">
                {t.features.c3Title}
              </h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed font-light">
                {t.features.c3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a] pt-12 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 opacity-50">
            <svg
              className="w-5 h-5 text-slate-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="font-bold tracking-widest text-sm text-slate-900 dark:text-white">
              LUMINA / CONNECTED MIND
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-600 text-sm font-light">
            {t.footer.copy}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500 dark:text-gray-500">
            <Link
              href="/login-personal"
              className="hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              {t.auth.prof}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

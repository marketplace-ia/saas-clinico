"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage, LangType } from "../context/LanguageContext";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const translations = {
  es: {
    nav: {
      clinica: "Software Clínico",
      comunidad: "Comunidad",
      convocatorias: "Bolsa de Empleo",
    },
    auth: {
      prof: "Soy Psicólogo",
      login: "Iniciar Sesión",
      register: "Crear Cuenta",
    },
    hero: {
      tag: "INNOVACIÓN CLÍNICA • ÉTICA • TRASCENDENCIA",
      title1: "Precisión para tu práctica.",
      title2: "Libertad para tu vocación.",
      desc: "«Conozca todas las teorías, domine todas las técnicas, pero al tocar un alma humana, sea apenas otra alma humana» — C.G. Jung. Clinesfera gestiona la complejidad de tu consultorio para que tú te enfoques en el vínculo terapéutico.",
      btn1: "Comenzar Ahora",
      btn2: "Explorar Comunidad",
    },
    features: {
      title: "Todo lo que necesitas, integrado.",
      desc: "Hemos construido la plataforma SaaS más avanzada para potenciar tu carrera profesional.",
      c1Tag: "Software Clínico",
      c1Title: "Clínica 360°",
      c1Desc:
        "Historias clínicas blindadas, agenda inteligente y facturación automatizada. Todo en un panel ejecutivo diseñado para psicólogos de alto rendimiento.",
      c2Tag: "Networking",
      c2Title: "Ecosistema Global",
      c2Desc:
        "Únete a la comunidad de especialistas. Comparte conocimientos, obtén certificados y expande tu red de contactos.",
      c3Tag: "Oportunidades",
      c3Title: "Bolsa de Empleo",
      c3Desc:
        "Encuentra vacantes clínicas, alianzas para compartir consultorio e investigaciones académicas remuneradas.",
    },
    footer: {
      copy: "Clinesfera © 2026. Construido para el futuro de la salud mental.",
      privacy: "Política de Privacidad",
    },
  },
  en: {
    nav: {
      clinica: "Clinical Software",
      comunidad: "Community",
      convocatorias: "Job Board",
    },
    auth: { prof: "I'm a Psychologist", login: "Log In", register: "Sign Up" },
    hero: {
      tag: "CLINICAL INNOVATION • ETHICS • TRANSCENDENCE",
      title1: "Precision for your practice.",
      title2: "Freedom for your calling.",
      desc: "«Know all the theories, master all the techniques, but as you touch a human soul be just another human soul» — C.G. Jung. Clinesfera manages the complexity of your clinic so you can focus on the therapeutic bond.",
      btn1: "Start Now",
      btn2: "Explore Community",
    },
    features: {
      title: "Everything you need, integrated.",
      desc: "We've built the most advanced SaaS platform to boost your professional career.",
      c1Tag: "Clinical Software",
      c1Title: "360° Clinic",
      c1Desc:
        "Bulletproof medical records, smart scheduling, and automated billing. All in an executive dashboard designed for high-performance psychologists.",
      c2Tag: "Networking",
      c2Title: "Global Ecosystem",
      c2Desc:
        "Join the specialist community. Share knowledge, earn certificates, and expand your network.",
      c3Tag: "Opportunities",
      c3Title: "Job Board",
      c3Desc:
        "Find clinical vacancies, alliances to share office space, and paid academic research opportunities.",
    },
    footer: {
      copy: "Clinesfera © 2026. Built for the future of mental health.",
      privacy: "Privacy Policy",
    },
  },
  zh: {
    nav: { clinica: "临床软件", comunidad: "社区", convocatorias: "招聘板" },
    auth: { prof: "我是心理学家", login: "登录", register: "注册账户" },
    hero: {
      tag: "临床创新 • 伦理 • 超越",
      title1: "精准管理您的诊所。",
      title2: "释放您的治疗潜能。",
      desc: "“了解所有理论，掌握所有技术，但当接触人类灵魂时，请仅仅作为另一个人类灵魂” — 荣格。Clinesfera 负责管理复杂事务，让您专注于治疗关系。",
      btn1: "现在开始",
      btn2: "探索社区",
    },
    features: {
      title: "您需要的一切，全面集成。",
      desc: "我们构建了最先进的 SaaS 平台来推动您的职业生涯。",
      c1Tag: "临床软件",
      c1Title: "360° 诊所",
      c1Desc:
        "无懈可击的病历，智能排班和自动计费。专为高绩效心理学家设计的执行仪表板。",
      c2Tag: "网络",
      c2Title: "全球生态系统",
      c2Desc: "加入专家社区。分享知识，获得证书并扩展您的网络。",
      c3Tag: "机会",
      c3Title: "招聘板",
      c3Desc: "寻找临床空缺、共享办公室的联盟和带薪学术研究机会。",
    },
    footer: {
      copy: "Clinesfera © 2026. 为心理健康的未来而建。",
      privacy: "隐私政策",
    },
  },
  hi: {
    nav: {
      clinica: "क्लिनिकल सॉफ्टवेयर",
      comunidad: "समुदाय",
      convocatorias: "नौकरी बोर्ड",
    },
    auth: {
      prof: "मैं एक मनोवैज्ञानिक हूँ",
      login: "लॉग इन करें",
      register: "खाता बनाएं",
    },
    hero: {
      tag: "नैदानिक नवाचार • नैतिकता • पारगमन",
      title1: "आपके अभ्यास के लिए सटीकता।",
      title2: "आपके व्यवसाय के लिए स्वतंत्रता।",
      desc: "«सभी सिद्धांतों को जानें, सभी तकनीकों में महारत हासिल करें, लेकिन एक मानव आत्मा को छूते समय सिर्फ एक और मानव आत्मा बनें» — सी.जी. जुंग। क्लिनस्फेरा आपके क्लिनिक का प्रबंधन करता है ताकि आप चिकित्सीय बंधन पर ध्यान केंद्रित कर सकें।",
      btn1: "अभी शुरू करें",
      btn2: "समुदाय का अन्वेषण करें",
    },
    features: {
      title: "आपकी जरूरत की हर चीज, एकीकृत।",
      desc: "हमने आपके पेशेवर करियर को बढ़ावा देने के लिए सबसे उन्नत SaaS प्लेटफॉर्म बनाया है।",
      c1Tag: "क्लिनिकल सॉफ्टवेयर",
      c1Title: "360° क्लिनिक",
      c1Desc:
        "बुलेटप्रूफ मेडिकल रिकॉर्ड, स्मार्ट शेड्यूलिंग और स्वचालित बिलिंग। उच्च प्रदर्शन वाले मनोवैज्ञानिकों के लिए डिज़ाइन किया गया एक कार्यकारी डैशबोर्ड।",
      c2Tag: "नेटवर्किंग",
      c2Title: "वैश्विक पारिस्थितिकी तंत्र",
      c2Desc:
        "विशेषज्ञ समुदाय में शामिल हों। ज्ञान साझा करें, प्रमाण पत्र अर्जित करें, और अपने नेटवर्क का विस्तार करें।",
      c3Tag: "अवसर",
      c3Title: "नौकरी बोर्ड",
      c3Desc:
        "नैदानिक ​​रिक्तियां, कार्यालय स्थान साझा करने के लिए गठबंधन और सशुल्क शैक्षणिक शोध अवसर खोजें।",
    },
    footer: {
      copy: "Clinesfera © 2026. मानसिक स्वास्थ्य के भविष्य के लिए निर्मित।",
      privacy: "गोपनीयता नीति",
    },
  },
  fr: {
    nav: {
      clinica: "Logiciel Clinique",
      comunidad: "Communauté",
      convocatorias: "Offres d'emploi",
    },
    auth: {
      prof: "Je suis Psychologue",
      login: "Connexion",
      register: "Créer un Compte",
    },
    hero: {
      tag: "INNOVATION CLINIQUE • ÉTHIQUE • TRANSCENDANCE",
      title1: "Précision pour votre pratique.",
      title2: "Liberté pour votre vocation.",
      desc: "« Connaissez toutes les théories, maîtrisez toutes les techniques, mais en touchant une âme humaine, soyez simplement une autre âme humaine » — C.G. Jung. Clinesfera gère votre cabinet pour que vous vous concentriez sur le lien thérapeutique.",
      btn1: "Commencer Maintenant",
      btn2: "Explorer la Communauté",
    },
    features: {
      title: "Tout ce dont vous avez besoin, intégré.",
      desc: "Nous avons construit la plateforme SaaS la plus avancée pour stimuler votre carrière.",
      c1Tag: "Logiciel Clinique",
      c1Title: "Clinique 360°",
      c1Desc:
        "Dossiers médicaux blindés, planification intelligente et facturation automatisée. Le tout dans un tableau de bord conçu pour les psychologues.",
      c2Tag: "Réseautage",
      c2Title: "Écosystème Global",
      c2Desc:
        "Rejoignez la communauté des spécialistes. Partagez des connaissances et développez votre réseau.",
      c3Tag: "Opportunités",
      c3Title: "Offres d'emploi",
      c3Desc:
        "Trouvez des postes cliniques, des alliances pour partager des cabinets et des opportunités de recherche.",
    },
    footer: {
      copy: "Clinesfera © 2026. Construit pour l'avenir de la santé mentale.",
      privacy: "Politique de Confidentialité",
    },
  },
  ar: {
    nav: {
      clinica: "البرمجيات السريرية",
      comunidad: "المجتمع",
      convocatorias: "فرص العمل",
    },
    auth: {
      prof: "أنا طبيب نفسي",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
    },
    hero: {
      tag: "الابتكار السريري • الأخلاق • التسامي",
      title1: "دقة لممارستك.",
      title2: "حرية لمهنتك.",
      desc: "«تعرف على جميع النظريات، وأتقن جميع التقنيات، ولكن عند لمس روح إنسان، كن مجرد روح إنسان أخرى» — كارل يونغ. تدير Clinesfera تعقيدات عيادتك لتتفرغ للرابط العلاجي.",
      btn1: "ابدأ الآن",
      btn2: "استكشف المجتمع",
    },
    features: {
      title: "كل ما تحتاجه، مدمج.",
      desc: "لقد بنينا المنصة الأكثر تقدمًا لتعزيز حياتك المهنية.",
      c1Tag: "البرمجيات السريرية",
      c1Title: "عيادة 360 درجة",
      c1Desc:
        "سجلات طبية مشفرة، جدولة ذكية، وفواتير آلية. لوحة تحكم تنفيذية مصممة لعلماء النفس.",
      c2Tag: "التواصل",
      c2Title: "نظام بيئي عالمي",
      c2Desc:
        "انضم إلى مجتمع المتخصصين. شارك المعرفة، واكسب الشهادات، ووسع شبكتك.",
      c3Tag: "فرص",
      c3Title: "فرص العمل",
      c3Desc:
        "ابحث عن وظائف سريرية، وتحالفات لمشاركة العيادات، وأبحاث أكاديمية.",
    },
    footer: {
      copy: "Clinesfera © 2026. بنيت لمستقبل الصحة النفسية.",
      privacy: "سياسة الخصوصية",
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

export default function LandingPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuIdiomas, setMenuIdiomas] = useState(false);

  const { lang, setLang, isRtl } = useLanguage();
  const t = translations[lang];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white selection:bg-indigo-500/30 transition-colors duration-300 ${jakarta.className}`}
    >
      <header className="fixed top-0 w-full bg-white/70 dark:bg-[#050505]/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span
                className={`text-white font-black text-xl ${playfair.className}`}
              >
                Ψ
              </span>
            </div>
            <span
              className={`font-black text-2xl tracking-tight text-slate-900 dark:text-white ${jakarta.className}`}
            >
              Clinesfera
            </span>
          </Link>

          <nav className="hidden md:flex gap-10 font-bold text-sm text-slate-600 dark:text-slate-300 tracking-wide">
            <a
              href="#soluciones"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {t.nav.clinica}
            </a>
            <Link
              href="/comunidad"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {t.nav.comunidad}
            </Link>
            <Link
              href="/comunidad/convocatorias"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t.nav.convocatorias}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setMenuIdiomas(!menuIdiomas)}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 px-3 py-2 rounded-full text-sm font-bold transition-colors focus:outline-none"
              >
                {idiomasDisponibles.find((i) => i.code === lang)?.flag}{" "}
                {lang.toUpperCase()}
              </button>

              {menuIdiomas && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {idiomasDisponibles.map((idioma) => (
                    <button
                      key={idioma.code}
                      onClick={() => {
                        setLang(idioma.code as LangType);
                        setMenuIdiomas(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${lang === idioma.code ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}
                    >
                      {idioma.flag} {idioma.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/login-personal"
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors tracking-wide"
              >
                {t.auth.prof}
              </Link>
              <div className="w-px h-5 bg-slate-300 dark:bg-slate-700"></div>
              <Link
                href="/login"
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors tracking-wide"
              >
                {t.auth.login}
              </Link>
              {/* 🔴 BOTÓN DE REGISTRO PREMIUM Y LLAMATIVO EN EL HEADER */}
              <Link
                href="/registro"
                className="bg-linear-to-r from-indigo-600 via-purple-600 to-teal-500 text-white font-black py-2.5 px-6 rounded-full hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-sm tracking-wide ml-2"
              >
                {t.auth.register}
              </Link>
            </div>
          </div>

          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-slate-600 dark:text-white"
          >
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
                d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"}
              />
            </svg>
          </button>
        </div>

        {menuAbierto && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 shadow-2xl animate-in slide-in-from-top-2 p-6 flex flex-col gap-6">
            <nav className="flex flex-col gap-4 font-bold text-lg">
              <a href="#soluciones" onClick={() => setMenuAbierto(false)}>
                {t.nav.clinica}
              </a>
              <Link href="/comunidad" onClick={() => setMenuAbierto(false)}>
                {t.nav.comunidad}
              </Link>
              <Link
                href="/comunidad/convocatorias"
                onClick={() => setMenuAbierto(false)}
              >
                {t.nav.convocatorias}
              </Link>
              <Link href="/privacidad" onClick={() => setMenuAbierto(false)}>
                {t.footer.privacy}
              </Link>
            </nav>
            <div className="grid grid-cols-2 gap-2">
              {idiomasDisponibles.map((idioma) => (
                <button
                  key={idioma.code}
                  onClick={() => {
                    setLang(idioma.code as LangType);
                    setMenuAbierto(false);
                  }}
                  className={`py-2 rounded-lg text-sm font-bold border ${lang === idioma.code ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-400" : "bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10"}`}
                >
                  {idioma.flag} {idioma.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {/* 🔴 BOTÓN DE REGISTRO PREMIUM EN MÓVIL */}
              <Link
                href="/registro"
                className="w-full bg-linear-to-r from-indigo-600 via-purple-600 to-teal-500 text-white text-center font-black py-4 rounded-xl text-lg shadow-lg shadow-purple-500/20"
              >
                {t.auth.register}
              </Link>
              <Link
                href="/login"
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black text-center font-black py-4 rounded-xl text-lg"
              >
                {t.auth.login}
              </Link>
              <Link
                href="/login-personal"
                className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center font-bold py-4 rounded-xl"
              >
                {t.auth.prof}
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-100 h-100 bg-teal-400/20 dark:bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-10 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-[0.25em] uppercase">
              {t.hero.tag}
            </span>
          </div>

          <h1
            className={`text-5xl md:text-7xl lg:text-[5.5rem] mb-10 tracking-tight leading-[1.1] max-w-5xl ${playfair.className}`}
          >
            <span className="font-bold text-slate-900 dark:text-white block mb-2">
              {t.hero.title1}
            </span>
            <span className="font-black italic text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-purple-500 to-teal-400 dark:from-indigo-400 dark:via-purple-400 dark:to-teal-300">
              {t.hero.title2}
            </span>
          </h1>

          <p
            className={`text-xl md:text-2xl text-slate-600 dark:text-slate-300/80 mb-12 max-w-4xl leading-relaxed font-light italic ${playfair.className}`}
          >
            {t.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            {/* 🔴 BOTÓN PRINCIPAL DEL HERO DIRIGIDO AL REGISTRO */}
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-linear-to-r from-indigo-600 via-purple-600 to-teal-500 text-white font-black py-4 px-10 rounded-full transition-all shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-1 text-lg tracking-wide flex items-center justify-center gap-2"
            >
              {t.hero.btn1}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <Link
              href="/comunidad"
              className="w-full sm:w-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 font-bold py-4 px-10 rounded-full transition-all text-base tracking-wide flex items-center justify-center backdrop-blur-sm"
            >
              {t.hero.btn2}
            </Link>
          </div>
        </div>
      </section>

      <section id="soluciones" className="py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 md:mb-24">
            <h2
              className={`text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white ${playfair.className}`}
            >
              {t.features.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              {t.features.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-80">
            <div className="md:col-span-2 md:row-span-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors overflow-hidden relative shadow-sm hover:shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div>
                <span className="inline-block bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                  {t.features.c1Tag}
                </span>
                <h3
                  className={`text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none text-slate-900 dark:text-white ${playfair.className}`}
                >
                  {t.features.c1Title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-lg mb-8 font-medium">
                  {t.features.c1Desc}
                </p>
                <Link
                  href="/login-personal"
                  className="inline-flex items-center gap-2 bg-slate-100 dark:bg-white/10 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 text-slate-900 dark:text-white font-bold px-8 py-4 rounded-full transition-all tracking-wide"
                >
                  Acceder a mi panel{" "}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              <div className="w-full h-40 mt-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-4xl flex items-center justify-center overflow-hidden">
                <div className="flex gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white dark:bg-[#151515] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-white dark:bg-[#151515] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center translate-y-4">
                    <svg
                      className="w-8 h-8 text-teal-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="w-16 h-16 bg-white dark:bg-[#151515] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors shadow-sm hover:shadow-xl">
              <div>
                <span className="inline-block bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
                  {t.features.c2Tag}
                </span>
                <h3
                  className={`text-3xl font-black mb-4 text-slate-900 dark:text-white ${playfair.className}`}
                >
                  {t.features.c2Title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {t.features.c2Desc}
                </p>
              </div>
              <Link
                href="/comunidad"
                className="mt-6 flex items-center justify-between text-slate-900 dark:text-white font-black group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-wide"
              >
                Explorar{" "}
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </Link>
            </div>

            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors shadow-sm hover:shadow-xl">
              <div>
                <span className="inline-block bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
                  {t.features.c3Tag}
                </span>
                <h3
                  className={`text-3xl font-black mb-4 text-slate-900 dark:text-white ${playfair.className}`}
                >
                  {t.features.c3Title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {t.features.c3Desc}
                </p>
              </div>
              <Link
                href="/comunidad/convocatorias"
                className="mt-6 flex items-center justify-between text-slate-900 dark:text-white font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-wide"
              >
                Ver Vacantes{" "}
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#050505] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-60">
            <span className="font-black tracking-[0.2em] text-[10px] text-slate-900 dark:text-white uppercase">
              CLINESFERA ECOSISTEMA · PSICLINIC
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-500 text-sm font-medium">
            {t.footer.copy}
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 text-sm font-bold text-slate-400 tracking-wide justify-center md:justify-end">
            <Link
              href="/privacidad"
              className="hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4"
            >
              {t.footer.privacy}
            </Link>
            <Link
              href="/registro"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-indigo-500 dark:text-indigo-400"
            >
              {t.auth.register}
            </Link>
            <Link
              href="/login"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Portal Pacientes
            </Link>
            <Link
              href="/login-personal"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Ingreso Clínicas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

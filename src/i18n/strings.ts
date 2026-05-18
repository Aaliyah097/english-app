// String table for ru/en/es/it. Russian is the master locale (the user base
// is Russian-speaking); other locales should mirror the same keys so the
// runtime fallback in t() rarely fires.
//
// Conventions:
//   - Keys are dot-separated and grouped by surface ("practice.*", "settings.*").
//   - `{name}` placeholders are interpolated by t().
//   - Don't translate identifiers (topic IDs, error category IDs, brand).

import type { Locale } from './index';

export type StringKey = keyof (typeof strings)['ru'];

const ru = {
  // ── Practice screen ──────────────────────────────────────────────────────
  'practice.rule.label': 'Правило',
  'practice.rule.fallback': 'Давайте потренируем {topic}.',
  'practice.rule.explain': 'Объяснить',
  'practice.rule.hide': 'Скрыть',
  'practice.input.placeholder': 'Введите перевод…',
  'practice.input.checking': 'Проверяем…',
  'practice.cta.check': 'Проверить',
  'practice.cta.next': 'Следующее',
  'practice.cta.retry': 'Повторить',
  'practice.error.fallback': 'Что-то пошло не так.',
  'practice.review.reviewed': 'Проверено',
  'practice.review.corrected': 'Правильно',
  'practice.missing.title': 'Практика недоступна',
  'practice.missing.body': 'Завершите регистрацию, чтобы начать.',
  'practice.topicSwitch.aria': 'Сменить тему',
  'practice.settings.aria': 'Настройки',

  // ── Topic picker ────────────────────────────────────────────────────────
  'picker.state.current': 'Текущая',

  // ── Settings screen ─────────────────────────────────────────────────────
  'settings.title': 'Настройки',
  'settings.back.aria': 'Назад',
  'settings.section.editProfile': 'Профиль',
  'settings.label.learningLanguage': 'Изучаемый язык',
  'settings.label.interests': 'Интересы',

  // ── Onboarding ──────────────────────────────────────────────────────────
  'onboarding.button.begin': 'Начать',
  'onboarding.button.continue': 'Дальше',
  'onboarding.button.startPractising': 'Начать практику',
  'onboarding.button.back': 'Назад',

  'onboarding.welcome.headline':
    'Учите язык через то, что вы уже знаете.',
  'onboarding.welcome.body':
    'Тренируйте грамматику, переводя реальные предложения из своей сферы. Мы исправляем ошибки и подсказываем, как звучит естественнее.',
  'onboarding.welcome.sampleLabel': 'Пример',

  'onboarding.languages.title': 'Что вы хотите учить?',
  'onboarding.languages.subtitle': 'Это можно поменять позже в настройках.',

  'onboarding.interests.title': 'Какие темы вам близки?',
  'onboarding.interests.subtitle':
    'На этих темах будут строиться предложения. {count} выбрано.',

  // ── Interests ───────────────────────────────────────────────────────────
  'interest.softwareDev': 'Разработка ПО',
  'interest.architecture': 'Архитектура ПО',
  'interest.devops': 'DevOps / SRE',
  'interest.data': 'Работа с данными',
  'interest.productMgmt': 'Продукт-менеджмент',
  'interest.design': 'Продуктовый дизайн',
  'interest.qa': 'QA / тестирование',
  'interest.cybersecurity': 'Информационная безопасность',
  'interest.engMgmt': 'Управление инженерной командой',
  'interest.everydayLife': 'Повседневная жизнь',

  // ── Grammar topic names (canonical IDs are English; this is the label) ──
  'topic.presentSimple': 'Present Simple',
  'topic.presentContinuous': 'Present Continuous',
  'topic.pastSimple': 'Past Simple',
  'topic.futureSimple': 'Future Simple',
  'topic.presentPerfect': 'Present Perfect',
  'topic.presentPerfectVsPastSimple': 'Present Perfect и Past Simple',
  'topic.pastContinuous': 'Past Continuous',
  'topic.compoundSentences': 'Сложносочинённые предложения',
  'topic.complexSentences': 'Сложноподчинённые предложения',
  'topic.conditionals': 'Условные предложения',
  'topic.passiveVoice': 'Страдательный залог',
  'topic.relativeClauses': 'Придаточные определительные',
  'topic.advanced': 'Объяснения и trade-offs',

  // ── Default rule explanations per topic ─────────────────────────────────
  'rule.presentSimple':
    'Present Simple — для фактов, привычек и регулярных действий. Например: "She drinks coffee every morning."',
  'rule.presentContinuous':
    'Present Continuous — для действий, происходящих сейчас или в данный период. Например: "I\'m reading a book."',
  'rule.pastSimple':
    'Past Simple — для завершённых действий в конкретный момент прошлого. Например: "We visited Paris last summer."',
  'rule.futureSimple':
    '`will` — для спонтанных решений и предсказаний, `be going to` — для планов. Например: "I\'ll call you later." / "We\'re going to move next year."',
  'rule.presentPerfect':
    'Present Perfect — для прошлых действий, связанных с настоящим. Например: "I\'ve already eaten."',
  'rule.presentPerfectVsPastSimple':
    'Past Simple — для законченного момента ("I saw her yesterday"); Present Perfect — для незаконченного времени или связи с настоящим ("I\'ve seen that film").',
  'rule.pastContinuous':
    'Past Continuous — для действия в процессе в прошлом, часто прерванного. Например: "I was cooking when the phone rang."',
  'rule.compoundSentences':
    'Соединяем два самостоятельных предложения через `and`, `but`, `or`, `so`. Например: "It was raining, but we went for a walk anyway."',
  'rule.complexSentences':
    'Присоединяем придаточное через `because`, `since`, `although`, `while`, `if`… Например: "I stayed home because I was tired."',
  'rule.conditionals':
    'Zero — для общих истин ("If you heat water, it boils"); First — для вероятных будущих событий ("If it rains, we\'ll stay in").',
  'rule.passiveVoice':
    'В пассиве подлежащее получает действие. Например: "The cake was eaten by the kids."',
  'rule.relativeClauses':
    '`who/which/that` добавляют информацию о существительном. Например: "The book that I\'m reading is great."',
  'rule.advanced':
    'Объясняем решения чётко: выбор, trade-off, причина. Например: "I prefer trains over flying because they\'re more comfortable, even if slower."',
} as const;

// English mirrors the master locale's key set.
const en: Record<keyof typeof ru, string> = {
  'practice.rule.label': 'Rule',
  'practice.rule.fallback': "Let's practise {topic}.",
  'practice.rule.explain': 'Explain',
  'practice.rule.hide': 'Hide',
  'practice.input.placeholder': 'Type your translation…',
  'practice.input.checking': 'Checking…',
  'practice.cta.check': 'Check',
  'practice.cta.next': 'Next exercise',
  'practice.cta.retry': 'Retry',
  'practice.error.fallback': 'Something went wrong.',
  'practice.review.reviewed': 'Reviewed',
  'practice.review.corrected': 'Corrected',
  'practice.missing.title': 'Practice unavailable',
  'practice.missing.body': 'Finish onboarding to start practising.',
  'practice.topicSwitch.aria': 'Switch grammar topic',
  'practice.settings.aria': 'Settings',

  'picker.state.current': 'Current',

  'settings.title': 'Settings',
  'settings.back.aria': 'Back',
  'settings.section.editProfile': 'Edit profile',
  'settings.label.learningLanguage': 'Learning language',
  'settings.label.interests': 'Interests',

  'onboarding.button.begin': 'Begin',
  'onboarding.button.continue': 'Continue',
  'onboarding.button.startPractising': 'Start practising',
  'onboarding.button.back': 'Back',

  'onboarding.welcome.headline': 'Learn a language\nthrough the things\nyou already know.',
  'onboarding.welcome.body':
    'Practice grammar by translating real sentences from your world. We correct, explain, and help you sound natural.',
  'onboarding.welcome.sampleLabel': 'Sample exercise',

  'onboarding.languages.title': "What do you want\nto learn?",
  'onboarding.languages.subtitle': 'You can change this later in Settings.',

  'onboarding.interests.title': 'Pick a few worlds\nyou know well.',
  'onboarding.interests.subtitle':
    "We'll draw sentences from these. {count} selected.",

  'interest.softwareDev': 'Software development',
  'interest.architecture': 'Software architecture',
  'interest.devops': 'DevOps / SRE',
  'interest.data': 'Data',
  'interest.productMgmt': 'Product management',
  'interest.design': 'Product design',
  'interest.qa': 'QA / testing',
  'interest.cybersecurity': 'Cybersecurity',
  'interest.engMgmt': 'Engineering management',
  'interest.everydayLife': 'Everyday life',

  'topic.presentSimple': 'Present Simple',
  'topic.presentContinuous': 'Present Continuous',
  'topic.pastSimple': 'Past Simple',
  'topic.futureSimple': 'Future Simple',
  'topic.presentPerfect': 'Present Perfect',
  'topic.presentPerfectVsPastSimple': 'Present Perfect vs Past Simple',
  'topic.pastContinuous': 'Past Continuous',
  'topic.compoundSentences': 'Compound sentences',
  'topic.complexSentences': 'Complex sentences',
  'topic.conditionals': 'Conditionals',
  'topic.passiveVoice': 'Passive voice',
  'topic.relativeClauses': 'Relative clauses',
  'topic.advanced': 'Advanced explanations and trade-offs',

  'rule.presentSimple':
    'Use Present Simple for facts, habits, and routines — e.g. "She drinks coffee every morning."',
  'rule.presentContinuous':
    'Use Present Continuous for actions happening right now or around now — e.g. "I\'m reading a book."',
  'rule.pastSimple':
    'Use Past Simple for finished actions at a specific past time — e.g. "We visited Paris last summer."',
  'rule.futureSimple':
    "Use `will` for spontaneous decisions and predictions, `be going to` for plans — e.g. \"I'll call you later.\" / \"We're going to move next year.\"",
  'rule.presentPerfect':
    'Use Present Perfect for past actions still connected to now — e.g. "I\'ve already eaten."',
  'rule.presentPerfectVsPastSimple':
    'Past Simple for a finished moment ("I saw her yesterday"); Present Perfect for unfinished time or recent relevance ("I\'ve seen that film").',
  'rule.pastContinuous':
    'Use Past Continuous for an action in progress in the past, often interrupted — e.g. "I was cooking when the phone rang."',
  'rule.compoundSentences':
    'Join two independent clauses with `and`, `but`, `or`, or `so` — e.g. "It was raining, but we went for a walk anyway."',
  'rule.complexSentences':
    'Attach a subordinate clause with `because`, `since`, `although`, `while`, `if`… — e.g. "I stayed home because I was tired."',
  'rule.conditionals':
    'Zero conditional for general truths ("If you heat water, it boils"); first for likely futures ("If it rains, we\'ll stay in").',
  'rule.passiveVoice':
    'In passive voice the subject receives the action — e.g. "The cake was eaten by the kids."',
  'rule.relativeClauses':
    'Use `who/which/that` to add information about a noun — e.g. "The book that I\'m reading is great."',
  'rule.advanced':
    'Explain decisions clearly: state the choice, the trade-off, and the reason — e.g. "I prefer trains over flying because they\'re more comfortable, even if slower."',
};

const es: Record<keyof typeof ru, string> = {
  'practice.rule.label': 'Regla',
  'practice.rule.fallback': 'Vamos a practicar {topic}.',
  'practice.rule.explain': 'Explicar',
  'practice.rule.hide': 'Ocultar',
  'practice.input.placeholder': 'Escribe tu traducción…',
  'practice.input.checking': 'Comprobando…',
  'practice.cta.check': 'Revisar',
  'practice.cta.next': 'Siguiente',
  'practice.cta.retry': 'Reintentar',
  'practice.error.fallback': 'Algo ha ido mal.',
  'practice.review.reviewed': 'Revisado',
  'practice.review.corrected': 'Corregido',
  'practice.missing.title': 'Práctica no disponible',
  'practice.missing.body': 'Termina la configuración inicial para empezar.',
  'practice.topicSwitch.aria': 'Cambiar tema de gramática',
  'practice.settings.aria': 'Ajustes',

  'picker.state.current': 'Actual',

  'settings.title': 'Ajustes',
  'settings.back.aria': 'Volver',
  'settings.section.editProfile': 'Perfil',
  'settings.label.learningLanguage': 'Idioma que aprendes',
  'settings.label.interests': 'Intereses',

  'onboarding.button.begin': 'Empezar',
  'onboarding.button.continue': 'Continuar',
  'onboarding.button.startPractising': 'Empezar a practicar',
  'onboarding.button.back': 'Atrás',

  'onboarding.welcome.headline':
    'Aprende un idioma\na través de lo que\nya conoces.',
  'onboarding.welcome.body':
    'Practica gramática traduciendo frases reales de tu mundo. Corregimos, explicamos y te ayudamos a sonar natural.',
  'onboarding.welcome.sampleLabel': 'Ejemplo',

  'onboarding.languages.title': '¿Qué quieres\naprender?',
  'onboarding.languages.subtitle': 'Puedes cambiarlo más tarde en Ajustes.',

  'onboarding.interests.title': 'Elige unos mundos\nque conozcas bien.',
  'onboarding.interests.subtitle':
    'Sacaremos frases de estos temas. {count} seleccionados.',

  'interest.softwareDev': 'Desarrollo de software',
  'interest.architecture': 'Arquitectura de software',
  'interest.devops': 'DevOps / SRE',
  'interest.data': 'Datos',
  'interest.productMgmt': 'Gestión de producto',
  'interest.design': 'Diseño de producto',
  'interest.qa': 'QA / pruebas',
  'interest.cybersecurity': 'Ciberseguridad',
  'interest.engMgmt': 'Gestión de ingeniería',
  'interest.everydayLife': 'Vida diaria',

  'topic.presentSimple': 'Presente simple',
  'topic.presentContinuous': 'Presente continuo',
  'topic.pastSimple': 'Pretérito indefinido',
  'topic.futureSimple': 'Futuro simple',
  'topic.presentPerfect': 'Pretérito perfecto',
  'topic.presentPerfectVsPastSimple': 'Perfecto vs indefinido',
  'topic.pastContinuous': 'Pretérito imperfecto continuo',
  'topic.compoundSentences': 'Oraciones coordinadas',
  'topic.complexSentences': 'Oraciones subordinadas',
  'topic.conditionals': 'Condicionales',
  'topic.passiveVoice': 'Voz pasiva',
  'topic.relativeClauses': 'Oraciones de relativo',
  'topic.advanced': 'Explicaciones y trade-offs',

  'rule.presentSimple':
    'Usa el presente simple para hechos, hábitos y rutinas. Ej.: "Ella bebe café cada mañana."',
  'rule.presentContinuous':
    'Usa el presente continuo (estar + gerundio) para acciones ahora mismo. Ej.: "Estoy leyendo un libro."',
  'rule.pastSimple':
    'Pretérito indefinido para acciones acabadas en un momento concreto del pasado. Ej.: "Visitamos París el verano pasado."',
  'rule.futureSimple':
    'Futuro simple para predicciones; `ir a + infinitivo` para planes. Ej.: "Te llamaré luego." / "Vamos a mudarnos el año que viene."',
  'rule.presentPerfect':
    'Pretérito perfecto para acciones pasadas con conexión al presente. Ej.: "Ya he comido."',
  'rule.presentPerfectVsPastSimple':
    'Indefinido para un momento cerrado ("La vi ayer"); perfecto para tiempo abierto o relevancia reciente ("He visto esa película").',
  'rule.pastContinuous':
    'Pretérito imperfecto + gerundio para una acción en curso en el pasado, a menudo interrumpida. Ej.: "Estaba cocinando cuando sonó el teléfono."',
  'rule.compoundSentences':
    'Une dos oraciones independientes con `y`, `pero`, `o`, `así que`. Ej.: "Llovía, pero salimos a pasear igualmente."',
  'rule.complexSentences':
    'Añade una subordinada con `porque`, `aunque`, `mientras`, `si`… Ej.: "Me quedé en casa porque estaba cansado."',
  'rule.conditionals':
    'Tipo 0 para verdades generales ("Si calientas el agua, hierve"); Tipo 1 para futuros probables ("Si llueve, nos quedaremos en casa").',
  'rule.passiveVoice':
    'En la voz pasiva el sujeto recibe la acción. Ej.: "El pastel fue comido por los niños."',
  'rule.relativeClauses':
    'Usa `que/quien/el cual` para añadir información sobre un sustantivo. Ej.: "El libro que estoy leyendo es genial."',
  'rule.advanced':
    'Explica decisiones con claridad: la elección, el trade-off y la razón. Ej.: "Prefiero el tren al avión porque es más cómodo, aunque sea más lento."',
};

const it: Record<keyof typeof ru, string> = {
  'practice.rule.label': 'Regola',
  'practice.rule.fallback': 'Pratichiamo {topic}.',
  'practice.rule.explain': 'Spiega',
  'practice.rule.hide': 'Nascondi',
  'practice.input.placeholder': 'Scrivi la tua traduzione…',
  'practice.input.checking': 'Sto controllando…',
  'practice.cta.check': 'Controlla',
  'practice.cta.next': 'Successivo',
  'practice.cta.retry': 'Riprova',
  'practice.error.fallback': 'Qualcosa è andato storto.',
  'practice.review.reviewed': 'Controllato',
  'practice.review.corrected': 'Corretto',
  'practice.missing.title': 'Pratica non disponibile',
  'practice.missing.body': 'Completa la configurazione iniziale per iniziare.',
  'practice.topicSwitch.aria': 'Cambia argomento grammaticale',
  'practice.settings.aria': 'Impostazioni',

  'picker.state.current': 'Attuale',

  'settings.title': 'Impostazioni',
  'settings.back.aria': 'Indietro',
  'settings.section.editProfile': 'Profilo',
  'settings.label.learningLanguage': 'Lingua che impari',
  'settings.label.interests': 'Interessi',

  'onboarding.button.begin': 'Inizia',
  'onboarding.button.continue': 'Continua',
  'onboarding.button.startPractising': 'Inizia a praticare',
  'onboarding.button.back': 'Indietro',

  'onboarding.welcome.headline':
    'Impara una lingua\nattraverso ciò che\ngià conosci.',
  'onboarding.welcome.body':
    'Pratica la grammatica traducendo frasi vere del tuo mondo. Correggiamo, spieghiamo e ti aiutiamo a suonare naturale.',
  'onboarding.welcome.sampleLabel': 'Esempio',

  'onboarding.languages.title': 'Cosa vuoi\nimparare?',
  'onboarding.languages.subtitle': 'Puoi cambiarlo dopo nelle Impostazioni.',

  'onboarding.interests.title': 'Scegli qualche mondo\nche conosci bene.',
  'onboarding.interests.subtitle':
    'Prenderemo le frasi da questi temi. {count} selezionati.',

  'interest.softwareDev': 'Sviluppo software',
  'interest.architecture': 'Architettura software',
  'interest.devops': 'DevOps / SRE',
  'interest.data': 'Dati',
  'interest.productMgmt': 'Product management',
  'interest.design': 'Design di prodotto',
  'interest.qa': 'QA / testing',
  'interest.cybersecurity': 'Cybersecurity',
  'interest.engMgmt': 'Engineering management',
  'interest.everydayLife': 'Vita quotidiana',

  'topic.presentSimple': 'Presente indicativo',
  'topic.presentContinuous': 'Presente progressivo',
  'topic.pastSimple': 'Passato prossimo',
  'topic.futureSimple': 'Futuro semplice',
  'topic.presentPerfect': 'Passato prossimo (Present Perfect)',
  'topic.presentPerfectVsPastSimple': 'Passato prossimo vs remoto',
  'topic.pastContinuous': 'Imperfetto progressivo',
  'topic.compoundSentences': 'Frasi coordinate',
  'topic.complexSentences': 'Frasi subordinate',
  'topic.conditionals': 'Periodo ipotetico',
  'topic.passiveVoice': 'Forma passiva',
  'topic.relativeClauses': 'Frasi relative',
  'topic.advanced': 'Spiegazioni e trade-off',

  'rule.presentSimple':
    'Usa il presente per fatti, abitudini e routine. Es.: "Lei beve il caffè ogni mattina."',
  'rule.presentContinuous':
    'Usa stare + gerundio per azioni in corso ora. Es.: "Sto leggendo un libro."',
  'rule.pastSimple':
    'Passato prossimo per azioni concluse in un momento specifico del passato. Es.: "Abbiamo visitato Parigi l\'estate scorsa."',
  'rule.futureSimple':
    'Futuro semplice per previsioni; presente o "stare per" per piani imminenti. Es.: "Ti chiamerò più tardi."',
  'rule.presentPerfect':
    'Passato prossimo per azioni passate ancora legate al presente. Es.: "Ho già mangiato."',
  'rule.presentPerfectVsPastSimple':
    'Passato remoto per fatti staccati dal presente; passato prossimo per ciò che è ancora rilevante.',
  'rule.pastContinuous':
    'Imperfetto + gerundio per un\'azione in corso nel passato, spesso interrotta. Es.: "Stavo cucinando quando ha squillato il telefono."',
  'rule.compoundSentences':
    'Unisci due frasi indipendenti con `e`, `ma`, `o`, `quindi`. Es.: "Pioveva, ma siamo usciti lo stesso."',
  'rule.complexSentences':
    'Aggiungi una subordinata con `perché`, `mentre`, `se`, `anche se`… Es.: "Sono rimasto a casa perché ero stanco."',
  'rule.conditionals':
    'Tipo 0 per verità generali ("Se scaldi l\'acqua, bolle"); Tipo 1 per futuri probabili ("Se piove, restiamo a casa").',
  'rule.passiveVoice':
    'Nella forma passiva il soggetto subisce l\'azione. Es.: "La torta è stata mangiata dai bambini."',
  'rule.relativeClauses':
    'Usa `che/il quale/cui` per aggiungere informazioni a un sostantivo. Es.: "Il libro che sto leggendo è bellissimo."',
  'rule.advanced':
    'Spiega le decisioni con chiarezza: scelta, trade-off, motivo. Es.: "Preferisco il treno all\'aereo perché è più comodo, anche se più lento."',
};

export const strings: Record<Locale, Record<string, string>> = {
  ru,
  en,
  es,
  it,
};

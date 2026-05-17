// Canonical 13-item grammar path from ai/claude_code_mvp_brief.md "Learning Path".
// The IDs are English (the canonical stored value); user-facing labels and
// rule fallbacks are localised via i18n.

import type { StringKey } from '../../i18n/strings';

export const GRAMMAR_PATH = [
  'Present Simple',
  'Present Continuous',
  'Past Simple',
  'Future Simple',
  'Present Perfect',
  'Present Perfect vs Past Simple',
  'Past Continuous',
  'Compound sentences',
  'Complex sentences',
  'Conditionals',
  'Passive voice',
  'Relative clauses',
  'Advanced explanations and trade-offs',
] as const;

export type GrammarTopic = (typeof GRAMMAR_PATH)[number];

// Maps each canonical topic ID to its i18n keys for the display label and the
// default rule explanation. Adding a topic requires extending both maps and
// the strings file.
const TOPIC_LABEL_KEYS: Record<string, StringKey> = {
  'Present Simple': 'topic.presentSimple',
  'Present Continuous': 'topic.presentContinuous',
  'Past Simple': 'topic.pastSimple',
  'Future Simple': 'topic.futureSimple',
  'Present Perfect': 'topic.presentPerfect',
  'Present Perfect vs Past Simple': 'topic.presentPerfectVsPastSimple',
  'Past Continuous': 'topic.pastContinuous',
  'Compound sentences': 'topic.compoundSentences',
  'Complex sentences': 'topic.complexSentences',
  Conditionals: 'topic.conditionals',
  'Passive voice': 'topic.passiveVoice',
  'Relative clauses': 'topic.relativeClauses',
  'Advanced explanations and trade-offs': 'topic.advanced',
};

const RULE_KEYS: Record<string, StringKey> = {
  'Present Simple': 'rule.presentSimple',
  'Present Continuous': 'rule.presentContinuous',
  'Past Simple': 'rule.pastSimple',
  'Future Simple': 'rule.futureSimple',
  'Present Perfect': 'rule.presentPerfect',
  'Present Perfect vs Past Simple': 'rule.presentPerfectVsPastSimple',
  'Past Continuous': 'rule.pastContinuous',
  'Compound sentences': 'rule.compoundSentences',
  'Complex sentences': 'rule.complexSentences',
  Conditionals: 'rule.conditionals',
  'Passive voice': 'rule.passiveVoice',
  'Relative clauses': 'rule.relativeClauses',
  'Advanced explanations and trade-offs': 'rule.advanced',
};

export function topicLabelKeyFor(topic: string): StringKey | null {
  return TOPIC_LABEL_KEYS[topic] ?? null;
}

export function defaultRuleKeyFor(topic: string): StringKey | null {
  return RULE_KEYS[topic] ?? null;
}

// Hardcoded long-form explanations for the canonical topics, always in
// Russian (the user base is native Russian). Surfaced via the "Объяснить"
// button on the rule bubble — see PracticeScreen. Examples are in English
// since most users will be learning English first; learners of Spanish /
// Italian still benefit from the conceptual explanation in their native.
const EXPLANATIONS_RU: Record<string, string> = {
  'Present Simple':
    'Present Simple описывает то, что верно «вообще»: факты, привычки, расписания и то, как устроены процессы. Для большинства лиц глагол берётся в базовой форме, для he/she/it добавляется -s (или -es после шипящих).\n\nПримеры:\n• I work as a designer. — Я работаю дизайнером.\n• She drinks coffee every morning. — Она пьёт кофе каждое утро.\n• Water boils at 100°C. — Вода кипит при 100°C.\n\nЧасто употребляется с наречиями частоты: always, usually, often, sometimes, never. В отрицании и вопросе используется вспомогательный do/does: She doesn’t work on weekends. Do you speak English?',

  'Present Continuous':
    'Present Continuous (am/is/are + V-ing) описывает действие в процессе прямо сейчас или в текущий период жизни. Также используется для запланированных будущих событий, когда время и место уже известны.\n\nПримеры:\n• I’m reading a book. — Сейчас читаю книгу.\n• She’s learning Italian this year. — В этом году она учит итальянский (процесс, не разовый момент).\n• We’re meeting Anna at 7. — Мы встречаемся с Анной в 7 (запланировано).\n\nС глаголами состояния (know, want, like, believe) Continuous обычно не используется — для них берётся Present Simple.',

  'Past Simple':
    'Past Simple описывает законченное действие в конкретный момент прошлого. У правильных глаголов окончание -ed; у неправильных — особая форма (go → went, see → saw, take → took). Маркеры времени: yesterday, last week, in 2020, ago.\n\nПримеры:\n• We visited Paris last summer. — Прошлым летом мы съездили в Париж.\n• She wrote three emails yesterday. — Вчера она написала три письма.\n• I didn’t see him at the meeting. — Я не видел его на встрече.\n\nВ вопросе и отрицании используется did + базовая форма глагола: Did you call her? When did it happen?',

  'Future Simple':
    'Для будущего в английском есть два основных способа. `Will + базовая форма` — для спонтанных решений, предсказаний, обещаний. `Be going to + базовая форма` — для уже принятых планов и предсказаний на основе видимых признаков.\n\nПримеры:\n• I’ll call you back in five minutes. — Перезвоню через пять минут (решение в момент речи).\n• It will rain tomorrow. — Завтра будет дождь (прогноз).\n• We’re going to move next year. — Мы переезжаем в следующем году (план).\n• Look at those clouds — it’s going to rain. — Смотри на тучи — сейчас пойдёт дождь (видим признаки).',

  'Present Perfect':
    'Present Perfect (have/has + V3) связывает прошлое с настоящим. Используется, когда важно либо текущее последствие действия, либо что время ещё не закончилось, либо неопределённый опыт «когда-либо в жизни».\n\nПримеры:\n• I’ve already eaten. — Я уже поел (поэтому есть не хочу — связь с сейчас).\n• She has worked here for ten years. — Она работает здесь десять лет (и продолжает).\n• Have you ever been to Japan? — Ты когда-нибудь был в Японии? (опыт).\n\nТипичные маркеры: already, just, yet, ever, never, for, since.',

  'Present Perfect vs Past Simple':
    'Past Simple — для законченного момента прошлого, который никак не связан с настоящим: есть конкретное «когда». Present Perfect — для прошлого, у которого есть отголосок в настоящем, или для незаконченного периода («сегодня», «на этой неделе», «в этом году»).\n\nСравните:\n• I saw her yesterday. (закрытое прошлое — yesterday).\n• I’ve seen her today. (today ещё не закончился).\n• We met in 2018. (один конкретный момент).\n• We’ve met before. (когда-то в жизни, неважно когда).\n\nЕсли в предложении есть конкретное время в прошлом (yesterday, last year, two days ago) — почти всегда Past Simple.',

  'Past Continuous':
    'Past Continuous (was/were + V-ing) описывает действие, которое длилось в какой-то момент прошлого. Часто его прерывает другое действие в Past Simple — тогда длящееся действие в Continuous, а прерывающее короткое — в Simple.\n\nПримеры:\n• I was cooking when the phone rang. — Я готовил, когда зазвонил телефон.\n• At 8 pm yesterday we were watching a film. — Вчера в 8 вечера мы смотрели фильм (процесс в конкретный момент).\n• While she was reading, he was making tea. — Пока она читала, он заваривал чай (два параллельных действия).',

  'Compound sentences':
    'Сложносочинённое предложение — это два самостоятельных предложения, соединённых сочинительным союзом: and (и), but (но), or (или), so (поэтому), yet (но всё же), for (потому что). Перед союзом обычно ставится запятая.\n\nПримеры:\n• It was raining, but we went for a walk anyway. — Шёл дождь, но мы всё равно пошли гулять.\n• I called her, and she picked up on the second ring. — Я позвонил, и она ответила со второго гудка.\n• You can take the bus, or we can walk. — Можешь поехать на автобусе, или мы пойдём пешком.',

  'Complex sentences':
    'В сложноподчинённом предложении одно из «предложений» — подчинённое: оно зависит от главного и присоединяется через because (потому что), although/though (хотя), while (пока, в то время как), if (если), when (когда), since (поскольку) и т. д. Порядок частей свободный; если подчинённое стоит первым — после него запятая.\n\nПримеры:\n• I stayed home because I was tired. — Я остался дома, потому что устал.\n• Although it was late, we kept talking. — Хотя было поздно, мы продолжали разговаривать.\n• When she arrives, we’ll start dinner. — Когда она придёт, мы начнём ужин.',

  Conditionals:
    'Условные предложения описывают связь «если — то». Главные типы:\n\n• Zero — общие истины: If you heat water, it boils. (Если нагреть воду, она кипит.)\n• First — вероятное будущее: If it rains, we’ll stay in. (Если будет дождь, останемся дома.)\n• Second — нереальное настоящее/будущее: If I had more time, I would learn the piano. (Если бы у меня было больше времени, я бы учился играть на пианино.)\n• Third — нереальное прошлое: If I had known, I would have told you. (Если бы знал, я бы тебе сказал.)\n\nВ if-части обычно НЕ используется will/would; will идёт в главной части.',

  'Passive voice':
    'В пассивном залоге подлежащее не выполняет действие, а получает его. Форма: подходящая форма be + 3-я форма глагола (V3). Кто выполнил действие, можно указать через by, но это часто опускают, если автор неважен или очевиден.\n\nПримеры:\n• The cake was eaten by the kids. — Торт был съеден детьми.\n• My laptop has been repaired. — Мой ноутбук починили (кто — неважно).\n• This bridge was built in 1890. — Этот мост построили в 1890 году.\n\nПассив особенно полезен, когда хочется сместить акцент с исполнителя на сам факт или объект действия.',

  'Relative clauses':
    'Придаточные определительные добавляют информацию к существительному. Союзные слова: who (для людей), which (для вещей), that (для людей и вещей), where, when, whose.\n\nЕсть два типа:\n• Определяющее (без запятых) — без него смысл главного предложения теряется: The book that I’m reading is great.\n• Неопределяющее (в запятых) — добавляет необязательную деталь: My brother, who lives in Berlin, plays guitar.\n\nПримеры:\n• The man who called you is my colleague. — Мужчина, который тебе звонил, — мой коллега.\n• The city where she grew up is small. — Город, в котором она выросла, маленький.',

  'Advanced explanations and trade-offs':
    'Когда нужно объяснить решение или сравнение, держите структуру в трёх шагах: 1) что вы выбрали, 2) что отдали взамен (trade-off), 3) почему этот компромисс оправдан в вашем случае.\n\nПолезные обороты: I chose X over Y because… / The trade-off is… / In return we get… / Compared to Z, X is better at A but worse at B.\n\nПример:\n• I prefer trains over flying because they are more comfortable, even if they are slower. — Я предпочитаю поезда самолётам, потому что они комфортнее, даже если медленнее.\n• We chose option A because it gives us more flexibility, although it costs more upfront. — Мы выбрали вариант A, потому что он даёт больше гибкости, хотя в начале и дороже.',
};

/** Long-form Russian explanation for a canonical topic, or null if unknown. */
export function explanationFor(topic: string): string | null {
  return EXPLANATIONS_RU[topic] ?? null;
}

export type GrammarPathState = 'completed' | 'current' | 'upcoming' | 'locked';

export type TaggedTopic = {
  name: string;
  state: GrammarPathState;
};

// Pragmatic simplification (per S10 brief): we don't model formal stage
// boundaries yet. A topic more than 4 positions past the current one is
// treated as "locked" so the UI can hint at the gating without us having
// to track stages explicitly.
const LOCK_DISTANCE = 4;

/**
 * Tags every topic in the canonical grammar path with its state, given the
 * checkpoint's `completedTopics` and `currentLearningFocus.grammarTopic`.
 *
 * Rules:
 *   - Topic name appears in `completed` → 'completed'.
 *   - The first non-completed topic that matches `currentTopic` → 'current'.
 *   - Non-completed topics before the current marker → 'upcoming' (the user
 *     can backtrack to them).
 *   - Non-completed topics within LOCK_DISTANCE of current → 'upcoming'.
 *   - Anything further out → 'locked'.
 *
 * If `currentTopic` doesn't appear in the path at all, the first non-completed
 * topic is treated as the current one (defensive fallback).
 */
export function tagGrammarPath(
  completed: string[],
  currentTopic: string,
): TaggedTopic[] {
  const completedSet = new Set(completed);

  // Pick the index of the "current" topic. Preference: first non-completed
  // topic whose name matches `currentTopic`. Fallback: first non-completed
  // topic, regardless of name.
  let currentIndex = -1;
  for (let i = 0; i < GRAMMAR_PATH.length; i++) {
    const name = GRAMMAR_PATH[i]!;
    if (completedSet.has(name)) continue;
    if (name === currentTopic) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex === -1) {
    for (let i = 0; i < GRAMMAR_PATH.length; i++) {
      const name = GRAMMAR_PATH[i]!;
      if (!completedSet.has(name)) {
        currentIndex = i;
        break;
      }
    }
  }

  return GRAMMAR_PATH.map((name, i): TaggedTopic => {
    if (completedSet.has(name)) return { name, state: 'completed' };
    if (i === currentIndex) return { name, state: 'current' };
    if (currentIndex === -1) return { name, state: 'completed' };
    if (i - currentIndex > LOCK_DISTANCE) return { name, state: 'locked' };
    return { name, state: 'upcoming' };
  });
}

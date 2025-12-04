import { LevelData, LessonSlide } from './types';

export const LEVELS: LevelData[] = [
  { id: 0, name: "INIT",       desc: "System Basics" },
  { id: 1, name: "RES vs ACT", desc: "Result vs Activity" },
  { id: 2, name: "STATIVE",    desc: "Stative Verbs" },
  { id: 3, name: "QUANTITY",   desc: "How many / How long" },
  { id: 4, name: "LIFE EXP",   desc: "Ever / Never / Before" },
  { id: 5, name: "EVIDENCE",   desc: "Visible Evidence" },
  { id: 6, name: "TIME",       desc: "Since / For / Just" },
  { id: 7, name: "NEWS",       desc: "Recent Events" },
  { id: 8, name: "ADVANCED",   desc: "Complex Contexts" },
  { id: 9, name: "BOSS",       desc: "Final Mix" }
];

export const INTRO_SLIDES: LessonSlide[] = [
  {
    title: "Tap. Learn. Win.",
    mode: "intro",
    content: "Choose the tense by meaning: <b>result now</b> vs <b>activity/time</b>.<br/><br/><span class='opacity-70 text-sm font-mono'>Unlock rule: ≥12/15 and ≥2⭐ to open the next level.</span>",
    examples: []
  },
  {
    title: "Perfect Simple",
    mode: "simple",
    content: "<b>Finished action → result now.</b>",
    examples: [
      { en: "I have lost my keys. → I can’t get into the house.", ru: "Я потерял ключи → я не могу попасть в дом.", uz: "Men kalitlarimni yo‘qotdim → uyga kira olmayapman." },
      { en: "She has finished the report. Now we can submit it.", ru: "Она закончила отчёт. Теперь мы можем отправить его.", uz: "U hisobotni tugatdi. Endi biz uni topshira olamiz." }
    ]
  },
  {
    title: "Perfect Continuous",
    mode: "continuous",
    content: "<b>Activity/time/evidence → happening recently or still now.</b>",
    examples: [
      { en: "I have been running. → I’m sweating.", ru: "Я бегал → я весь в поту.", uz: "Men yugurib kelmoqdaman → terlab ketdim." },
      { en: "She has been studying all day, so she looks exhausted.", ru: "Она училась весь день, поэтому выглядит уставшей.", uz: "U butun kun o‘qib kelmoqda, shuning uchun charchagan ko‘rinadi." }
    ]
  }
];

export const PASS_THRESHOLD = 12;
export const QUESTIONS_PER_LEVEL = 15;
export const STORAGE_KEY = 'wrielts_arch_v2';

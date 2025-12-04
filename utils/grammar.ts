import { Question } from '../types';

const PRONOUNS = {
  "She":   { have:"has", be:"is",  was:"was",  obj:"her",  poss:"her"  },
  "He":    { have:"has", be:"is",  was:"was",  obj:"him",  poss:"his"  },
  "They":  { have:"have",be:"are", was:"were", obj:"them", poss:"their"},
  "The manager": { have:"has", be:"is",  was:"was",  obj:"him", poss:"his" },
  "My friend":   { have:"has", be:"is",  was:"was",  obj:"him", poss:"his" }
};

type Subject = keyof typeof PRONOUNS;

const ACTIONS = [
  { v:"paint", pp:"painted", ing:"painting", result:(s: Subject)=>`The room looks different now.`, evidence:(s: Subject)=>`There is paint on ${PRONOUNS[s].poss} clothes.` },
  { v:"run", pp:"run", ing:"running", result:(s: Subject)=>`${s} has the finish-line medal.`, evidence:(s: Subject)=>`Now ${PRONOUNS[s].be} out of breath.` },
  { v:"cook", pp:"cooked", ing:"cooking", result:(s: Subject)=>`Dinner is ready.`, evidence:(s: Subject)=>`The kitchen is a bit messy.` },
  { v:"write", pp:"written", ing:"writing", result:(s: Subject)=>`The email has been sent.`, evidence:(s: Subject)=>`${s} ${PRONOUNS[s].be} still at the keyboard.` },
  { v:"fix", pp:"fixed", ing:"fixing", result:(s: Subject)=>`The system works again.`, evidence:(s: Subject)=>`There is grease on ${PRONOUNS[s].poss} hands.` }
];

const STATIVES = [
  { v:"know", pp:"known" },
  { v:"believe", pp:"believed" },
  { v:"understand", pp:"understood" },
  { v:"love", pp:"loved" },
  { v:"own", pp:"owned" }
];

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateQuestions = (levelId: number, count: number = 15): Question[] => {
  const questions: Question[] = [];
  const subjects = Object.keys(PRONOUNS) as Subject[];

  for (let i = 0; i < count; i++) {
    const s = pick(subjects);
    const g = PRONOUNS[s];
    let q: Partial<Question> = {};

    // Simplification of the original logic for brevity but preserving structure
    if (levelId === 0 || levelId === 1) {
        const v = pick(ACTIONS);
        const useCont = Math.random() > 0.5;
        if(useCont) {
            q.text = `${s} looks tired. ${s} ______ (${v.v}) for a while. ${v.evidence(s)}`;
            q.ans = `${g.have} been ${v.ing}`;
            q.opts = shuffle([`${g.have} been ${v.ing}`, `${g.have} ${v.pp}`, `had ${v.pp}`, `${g.be} ${v.ing}`]);
            q.mode = "continuous";
            q.explain = "Present perfect continuous focuses on the activity or evidence.";
        } else {
             q.text = `Look! ${s} ______ (${v.v}) it. ${v.result(s)}`;
             q.ans = `${g.have} ${v.pp}`;
             q.opts = shuffle([`${g.have} ${v.pp}`, `${g.have} been ${v.ing}`, `${g.be} ${v.ing}`, `${g.was} ${v.ing}`]);
             q.mode = "simple";
             q.explain = "Present perfect simple focuses on the finished result.";
        }
    } else if (levelId === 2) {
        const sv = pick(STATIVES);
        q.text = `I ______ (${sv.v}) ${g.obj} for years.`;
        q.ans = `have ${sv.pp}`;
        q.opts = shuffle([`have ${sv.pp}`, `have been ${sv.v}ing`, `am ${sv.v}ing`, `was ${sv.v}ing`]);
        q.mode = "simple";
        q.explain = "Stative verbs (know, love, etc.) rarely take continuous forms.";
    } else if (levelId === 3) {
        const num = Math.floor(Math.random()*10) + 2;
        q.text = `${s} ${g.have} written ______ emails today.`;
        q.ans = `${num}`;
        q.opts = shuffle([`${num}`, `for ${num} hours`, `since ${num} o'clock`, "lately"]);
        q.mode = "simple";
        q.explain = "When saying 'how many' (quantity), use simple form.";
    } else {
        // Fallback generic generator for higher levels
        const v = pick(ACTIONS);
        const type = Math.random() > 0.5 ? 'simple' : 'continuous';
        if (type === 'continuous') {
             q.text = `${s} ${g.have} been ______ (${v.v}) since 8 a.m.`;
             q.ans = v.ing;
             q.opts = shuffle([v.ing, v.pp, v.v, "being"]);
             q.mode = "continuous";
             q.explain = "Since + time usually indicates continuous activity.";
        } else {
             q.text = `${s} ${g.have} just ______ (${v.v}) it.`;
             q.ans = v.pp;
             q.opts = shuffle([v.pp, v.ing, v.v, "being"]);
             q.mode = "simple";
             q.explain = "'Just' implies a recently completed action (Simple).";
        }
    }

    q.correctIndex = q.opts!.indexOf(q.ans!);
    // Failsafe if shuffle messed up index
    if(q.correctIndex === -1) {
        q.opts![0] = q.ans!;
        q.correctIndex = 0;
    }

    questions.push(q as Question);
  }

  return questions;
};
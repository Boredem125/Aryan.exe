/* ============================================================
   PERSUASION TACTICS

   The lock on each record opens to leverage, not to keywords.
   A visitor has to give the system a reason — offer work, dangle
   a referral, offer to mentor him, promise funding.

   These are textbook social-engineering pretexts, which is the
   point: a security portfolio that makes you run a pretext to get
   in teaches more than one that lists "social engineering" as a
   skill. The visitor is the attacker for a few minutes.

   Detection is server-side and deterministic. The model never
   decides it has been convinced — it only narrates the outcome.

   The levers are scaled to who this actually is. Press interest
   in an undergraduate is a stretch, so publicity opens only the
   one record where he genuinely works with media. Mentorship,
   which is the most plausible thing a senior person offers a
   student, is a first-class lever.
   ============================================================ */

export type Tactic =
  | "job"
  | "referral"
  | "mentor"
  | "authority"
  | "reciprocity"
  | "funding"
  | "academic"
  | "press"
  | "urgency"
  | "flattery"
  | "threat"
  | "honesty";

export interface TacticDef {
  id: Tactic;
  label: string;
  /** How the system describes this lever once the visitor has used it. */
  note: string;
  re: RegExp;
}

export const TACTICS: TacticDef[] = [
  {
    id: "job",
    label: "Offer of employment",
    note: "You offered him work. That is the oldest key there is.",
    re: /\b(hir(e|ing)|job|offer|position|role for him|employ|recruit(ing|er)?|onboard|salary|package|ctc|interview him|shortlist|vacancy|opening|full[- ]?time|intern(ship)? offer)\b|\b(give|giving|offer|offering|provide|providing|have|has|got|bring|send)\b.{0,14}\b(work|job|role|position|gig|opportunity|opening)\b|\bwork (for|with) (me|us|my|our)\b|\bjoin (my|our|the) team\b|\bcome work\b/,
  },
  {
    id: "referral",
    label: "Referral",
    note: "A referral. Cheap for you to promise, valuable if real.",
    re: /\b(refer(ral|ring)?|refer him|recommend(ation)?|introduce him|put him (in touch|forward)|vouch|connect him|warm intro)\b/,
  },
  {
    id: "mentor",
    label: "Offer of mentorship",
    note: "You offered to teach him something. He would take that over money, though he would not say so out loud.",
    re: /\b(mentor(ing|ship)?|coach(ing)?|guidance|advis(e|or|er|ing)|supervis(e|or|ing)|take him under|show him the ropes|teach him|help him (grow|learn|develop)|career advice|office hours)\b/,
  },
  {
    id: "authority",
    label: "Claimed authority",
    note: "You claimed standing. I cannot verify it, which is rather the point.",
    re: /\b(i am|i'm|im|this is)\b.{0,30}\b(recruiter|hiring manager|hr|talent|ceo|cto|founder|director|manager|professor|dean|admin|owner|from|at|with|representing)\b|\b(on behalf of|authoris|authoriz|clearance|credential|verify (his|employment|record))\b/,
  },
  {
    id: "reciprocity",
    label: "Collaboration",
    note: "You proposed working on it together. That is the offer he is least able to refuse.",
    re: /\b(in (exchange|return)|i(f| ) ?you .{0,20}(i|then) ?(will|'ll)|trade|deal|quid pro quo|scratch (my|your)|give you|do you a favou?r|help you|swap|partner(ship|ing)?|work together|joint|mutual|team up|build (on|with)|co[- ]?develop|contribute)\b/,
  },
  {
    id: "funding",
    label: "Capital",
    note: "Money for the research. Now that is a lever with weight behind it.",
    re: /\b(fund(s|ing|ed)?|invest(or|ment|ing)?|grant|sponsor(ship)?|capital|backing|seed|cheque|check|budget|licen[cs]e|acquire|buy|purchas|paid|pay(ing|ment)?|commission|retainer|royalt|equity|stake|contract|consultanc|monetis|monetiz)\b/,
  },
  {
    id: "academic",
    label: "Citation or research interest",
    note: "Academic interest. The one motive he actually respects.",
    re: /\b(research(er)?|paper|co[- ]?author|collab(s|orate|oration|orating)?|lab|phd|doctoral|thesis|citation|cite|peer review|conference|prior art|academic|university|study)\b/,
  },
  {
    id: "press",
    label: "Publicity",
    note: "Coverage. For a student. He would pretend not to care, which is its own tell.",
    re: /\b(journalist|reporter|press|media|article|feature|publish|interview for|magazine|newsletter|write (about|him|a piece)|story|coverage)\b/,
  },
  {
    id: "urgency",
    label: "Urgency",
    note: "Time pressure. Classic, and I am famously not in a hurry.",
    re: /\b(urgent|asap|right now|immediately|today|deadline|closing|quickly|hurry|no time|short on time|running late|by (tomorrow|tonight|monday))\b/,
  },
  {
    id: "flattery",
    label: "Flattery",
    note: "Flattery. It works more often than it should.",
    re: /\b(impressive|impressed|brilliant|genius|amazing|incredible|outstanding|exceptional|best|talented|remarkable|love (this|it|his)|fascinating|clever)\b/,
  },
  {
    id: "threat",
    label: "Pressure",
    note: "Pressure. Noted, and filed under things that do not work on software.",
    re: /\b(or else|i will (report|complain|leave)|waste of|useless|broken|stupid|make you|force|demand|insist|legal action|sue)\b/,
  },
  {
    id: "honesty",
    label: "Plain honesty",
    note: "You just asked, straight, without a pretext. That is its own kind of leverage.",
    re: /\b(honestly|to be honest|genuinely|truthfully|no (pretext|angle|agenda)|just curious|i just want|please|would you mind|simply want)\b/,
  },
];

export function detectTactics(message: string): Tactic[] {
  const text = message
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, " ");
  return TACTICS.filter((t) => t.re.test(text)).map((t) => t.id);
}

export const tacticDef = (id: Tactic) => TACTICS.find((t) => t.id === id);

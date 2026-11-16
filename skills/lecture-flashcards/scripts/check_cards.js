#!/usr/bin/env node
/* Validate a flashcard deck before publishing.
 * Usage: node check_cards.js cards.js [--min 30]
 * Exits non-zero on any structural error.
 */
const fs = require("fs");
const vm = require("vm");

const file = process.argv[2];
if (!file) { console.error("usage: node check_cards.js cards.js [--min N]"); process.exit(2); }
const minIdx = process.argv.indexOf("--min");
const min = minIdx > 0 ? +process.argv[minIdx + 1] : 0;

const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(file, "utf8") + "\n;this.TOPICS = TOPICS; this.CARDS = CARDS;", ctx);
const { TOPICS, CARDS } = ctx;

const errors = [];
const perType = { mcq: 0, fill: 0, short: 0 };
const perTopic = TOPICS.map(() => 0);
const letters = [0, 0, 0, 0];
let calc = 0;

CARDS.forEach((c, i) => {
  const id = `card ${i + 1}`;
  if (!["mcq", "fill", "short"].includes(c.type)) errors.push(`${id}: bad type "${c.type}"`);
  else perType[c.type]++;
  if (c.calc) calc++;
  if (!(c.topic >= 0 && c.topic < TOPICS.length)) errors.push(`${id}: topic index out of range`);
  else perTopic[c.topic]++;
  if (!c.src) errors.push(`${id}: missing src`);
  if (!c.q) errors.push(`${id}: missing question`);
  if (c.type === "mcq") {
    if (!Array.isArray(c.opts) || c.opts.length !== 4) errors.push(`${id}: MCQ needs exactly 4 options`);
    else if (!(Number.isInteger(c.ans) && c.ans >= 0 && c.ans < c.opts.length)) errors.push(`${id}: ans does not point to an option`);
    else letters[c.ans]++;
    if (new Set(c.opts || []).size !== (c.opts || []).length) errors.push(`${id}: duplicate options`);
    if (!c.exp) errors.push(`${id}: missing explanation`);
  }
  if (c.type === "fill") {
    if (typeof c.ans !== "string" || !c.ans.trim()) errors.push(`${id}: fill-in needs a string ans`);
    if (!c.exp) errors.push(`${id}: missing explanation`);
  }
  if (c.type === "short" && !c.model) errors.push(`${id}: short answer needs a model answer`);
});

if (TOPICS.length < 8 || TOPICS.length > 10) console.warn(`warning: ${TOPICS.length} topics (spec asks for 8–10)`);
if (min && CARDS.length < min) errors.push(`only ${CARDS.length} cards, minimum is ${min}`);
const mcqTotal = letters.reduce((a, b) => a + b, 0);
if (mcqTotal >= 8) {
  const share = letters.map(n => n / mcqTotal);
  if (share.some(s => s > 0.35 || s < 0.15)) console.warn(`warning: A–D answer spread is uneven: ${letters.join("/")}`);
}

console.log(`cards: ${CARDS.length}  mcq: ${perType.mcq}  fill: ${perType.fill}  short: ${perType.short}  calculation: ${calc}`);
console.log(`A–D spread: ${letters.join(" / ")}`);
console.log("per topic: " + TOPICS.map((t, i) => `${t} (${perTopic[i]})`).join(", "));
if (errors.length) { console.error("\nERRORS:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("OK");

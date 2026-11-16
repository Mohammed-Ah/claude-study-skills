---
name: lecture-flashcards
description: Build an interactive, harder-than-the-slides flashcard/quiz page (published HTML artifact) from lecture slides, notes and past quizzes. Use for /lecture-flashcards or requests for flashcards, practice questions or a quiz tool.
---

# Lecture Flashcards

Builds one self-contained HTML study tool, published as an artifact, from the attached lecture material: slides (including handwritten notes), study guides, past quizzes, exams and problem sets.

This skill ships a tested page template, so most of the work is writing good cards:

```
assets/shell.html          page layout, CSS tokens (light/dark), fonts
assets/app.js              engine: MCQ / fill-in / short answer, filters, map, weak topics, keyboard
scripts/build.py           inlines a cards file into the shell → one HTML file
scripts/check_cards.js     validates the deck (counts, answer indices, A–D spread)
scripts/smoke_test.py      headless Chrome test at 390 px
```
Paths are relative to this skill's folder. If the folder isn't available, clone https://github.com/Mohammed-Ah/claude-study-skills and use `skills/lecture-flashcards/`.

## How to call it

```
/lecture-flashcards                                   → asks the setup questions, then builds
/lecture-flashcards min 40, mcq+calc, Topic 3 26-45, Topic 4 1-36
/lecture-flashcards min 60, all types, hard, mock exam
```
Any setting given in the arguments is not asked again.

## Step 1 — Setup questions (ask once, with AskUserQuestion)

Ask only what the arguments didn't already answer. Use at most 4 questions in one call:

1. **Minimum number of cards:** 30 (recommended) / 40 / 50 / 60+.
2. **Question types** (multi-select): Concept MCQ / Calculation MCQ / Fill-in-the-blank / Short answer.
3. **Difficulty:** Harder than the slides (recommended) / Exam-level / Mixed with some recall warm-ups.
4. **Scope** (only if it's unclear): which topics and slide ranges to cover. Offer the ranges found in the attachments, plus "Everything attached".

If the scope came from the arguments, use the free slot for **anything else worth asking**: a weight toward a topic the instructor flagged, a mock-exam split (e.g. 50 MCQ + 10 short answer), or whether to include past-quiz questions verbatim.

If no one answers, use the defaults (30, MCQ + calculation, harder, everything attached) and say so in one line.

## Step 2 — Gather the material

- Read every attached PDF: text plus rendered pages. Zoom into handwriting, tables and charts.
- Note what the instructor flagged ("important", "exam", "end of quiz material", circled items) and give those parts extra cards.
- Turn any past quiz or exam questions into cards, rewritten to be harder.
- Pick **8–10 topic groups** that cover the material.

## Step 3 — Write the cards to `cards.js`

```js
const TOPICS = ["Topic group 1", "..."];          // 8–10
const CARDS = [
  {type:"mcq",   calc:true,  src:"T3 · Slide 26", topic:0, q:"…", code:"formula / given data", opts:["…","…","…","…"], ans:2, exp:"…"},
  {type:"fill",  calc:false, src:"T4 · Slide 22", topic:8, q:"… ____ …", ans:"canonical", accept:["variant","abbr"], exp:"…"},
  {type:"short", calc:false, src:"T4 · Slide 29", topic:9, q:"…", model:"1. …\n2. …", exp:"optional extra note"}
];
```

Content rules:
- Meet or exceed the minimum count. Use only the selected types.
- For calculation-heavy material, make about a third of all cards require working something out (`calc:true`).
- **Pitch the cards harder than the slides.** Recall-only questions should be a minority. Prefer:
  - application and scenario questions
  - calculations and tracing a process
  - "Which is NOT…" / "which statement is FALSE"
  - commonly confused concepts set against each other
  - slide statements turned around (cause vs effect, necessary vs sufficient, edge cases)
- **MCQ distractors** must be plausible and built from real misconceptions: a neighbouring concept's definition, a reversed relationship, a common calculation slip (dB used as linear, ln vs log2, 20log vs 10log, forgetting /2, overhead or N), an off-by-one. No joke options. Spread the correct letter evenly across A–D.
- **Every MCQ and fill-in card gets an explanation:** why the right answer is right and why the tempting wrong answer is wrong. For calculations, show the working briefly.
- **Fill-in cards:** one blank. List the variants in `accept` (abbreviations, synonyms, plurals, equivalent numbers). The engine already normalises case and punctuation, and it matches numbers with ±0.5 % tolerance and fractions (0.5 = 1/2).
- **Short-answer cards:** a full-marks `model` answer (definition, mechanism or reasoning, the key comparison point, an example). Use `\n` for numbered steps.
- `src` = the source location; `topic` = an index into TOPICS.
- Put formulas, code or given data in `code`, not in `q`.
- Address the student's handwritten notes: correct wrong ones through a FALSE-statement card.

## Step 4 — Build

```bash
python3 scripts/build.py --cards cards.js --out index.html \
  --title "<Course> Flashcards — <scope>" --heading "<Course> · <Course name> Flashcards" \
  --subtitle "<topics and slide ranges>" \
  --accent "#0e7490" --accent-dark "#38bdd8" \
  --status "Idle,Connected,ACK,NACK"
```
- `--status`: four labels (not tried, current, correct, missed) taken from the subject's own vocabulary when one fits naturally (networking: Idle/Connected/ACK/NACK). Otherwise leave the plain default.
- `--accent`: one accent colour suited to the subject (teal/cyan for networking).

The template already implements the full spec:
- one card at a time, with Previous/Next and a counter
- MCQs grade on click (green right, burnt-orange wrong pick) and show the explanation
- fill-in has Check + Enter, the verdict and the accepted answer
- short answer works as type → "Show model answer" → "I had it" / "I missed points"
- header with number, source, topic, type and status chip
- type filter (built from the types present, plus Calculation), topic dropdown, Shuffle, Review missed (reopens missed cards), Reset, theme toggle
- stats line, a clickable map grid, and a weak-topics panel (flags 2+ tried under 70 %)
- A–D and ←/→ keys; state in memory only
- Bricolage Grotesque / Atkinson Hyperlegible / JetBrains Mono fonts
- light and dark tokens, phone width with no horizontal scroll, focus outlines, reduced motion

Only edit `shell.html`/`app.js` if the user asks for something the template lacks.

## Step 5 — Verify before publishing

```bash
node scripts/check_cards.js cards.js --min <N>      # counts by type/topic, answer indices, A–D spread
python3 scripts/smoke_test.py index.html --screenshot shot.png   # add --chrome /usr/bin/google-chrome if needed
```
- Fix every error.
- If the A–D spread warns, swap option positions (not explanations) and re-run.
- Recompute every calculation answer in code.
- Look at the screenshot.

## Step 6 — Publish and reply

- Call the artifact tool's `list_types` first. No type fits a quiz, so publish `index.html` with `publish_files` (title, icon "cards").
- Reply in **3–4 lines max**: card counts per type, and what the page does. Don't recap the questions.

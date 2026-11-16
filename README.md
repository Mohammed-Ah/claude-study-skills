# claude-study-skills

[![CI](https://github.com/Mohammed-Ah/claude-study-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammed-Ah/claude-study-skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Two [Claude skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) for turning university lecture slides into exam prep:

| Skill | Call it with | What you get |
|---|---|---|
| **lecture-deep-dive** | `/lecture-deep-dive` | A slide-by-slide markdown study guide that explains every slide, figure and worked example in depth, numbered to match the original slides. Optionally a matching PPTX + PDF deck. |
| **lecture-flashcards** | `/lecture-flashcards` | An interactive flashcard / quiz page (one self-contained HTML file, published as an artifact) with MCQ, calculation, fill-in and short-answer cards pitched harder than the slides. |

Built for COE 446 (Mobile Computing) at KFUPM, but both skills work for any slide-based course.

---

## Quick start

### `/lecture-deep-dive`

Attach a lecture PDF and call:

```
/lecture-deep-dive                      → markdown study guide
/lecture-deep-dive deck                 → guide + PPTX + PDF deck
/lecture-deep-dive slides 26-45         → only that slide range
/lecture-deep-dive COE 446 Topic 5      → sets the course/topic in the title
```

What it does:
- Skips the title and contents slides and explains everything else (why it matters, how it works, background).
- Explains every chart and table, and recomputes every worked example.
- Confirms or corrects your handwritten margin notes.
- Points out slide typos.
- Ends with a cheat sheet and suggests a chat name ("COE 446 – Topic N: Chapter").

### `/lecture-flashcards`

Attach slides, study guides or past quizzes and call:

```
/lecture-flashcards                                         → asks setup questions first
/lecture-flashcards min 40, mcq+calc, Topic 3 26-45, Topic 4 1-36
/lecture-flashcards min 60, all types, hard, mock exam
```

Setup questions (skipped if you put the answer in the call):
1. Minimum number of cards
2. Question types: concept MCQ / calculation MCQ / fill-in / short answer
3. Difficulty
4. Scope, or anything else worth asking (instructor-flagged topics, a mock-exam split, past-quiz questions)

The page has:
- one card at a time, with instant grading and explanations
- filters by type and topic, Shuffle, Review missed and Reset
- a clickable progress map and a weak-topics panel
- A–D and ←/→ keyboard shortcuts
- light and dark themes, and a phone-friendly layout

Try the built examples: [`examples/flashcards/demo-flashcards.html`](examples/flashcards/demo-flashcards.html) (all card types) and [`examples/flashcards/coe446-t3-t4-flashcards.html`](examples/flashcards/coe446-t3-t4-flashcards.html) (59 cards). Download and open them in a browser.

---

## Install

### claude.ai (web, desktop, mobile)
1. Download `lecture-deep-dive.zip` and `lecture-flashcards.zip` from the [latest release](https://github.com/Mohammed-Ah/claude-study-skills/releases/latest), or build them yourself with `bash scripts/package_skills.sh`.
2. Go to **Settings → Capabilities → Skills → Upload skill** and upload each zip.
3. Call them with `/lecture-deep-dive` and `/lecture-flashcards`.

### Claude Code
```bash
git clone https://github.com/Mohammed-Ah/claude-study-skills.git
mkdir -p ~/.claude/skills
cp -r claude-study-skills/skills/* ~/.claude/skills/
```
For a single project, copy them into `<project>/.claude/skills/` instead.

---

## Repository layout

```
skills/
  lecture-deep-dive/
    SKILL.md                 instructions Claude follows
  lecture-flashcards/
    SKILL.md
    assets/shell.html        page template (layout, CSS tokens, fonts)
    assets/app.js            engine: MCQ / fill-in / short answer, filters, map, weak topics
    scripts/build.py         cards.js + template → one self-contained HTML page
    scripts/check_cards.js   validates a deck (counts, answer indices, A–D spread)
    scripts/smoke_test.py    headless Chrome test at phone width
examples/
  deep-dive/                 study guides produced by lecture-deep-dive
  flashcards/                example decks (cards.js) and built pages
scripts/
  validate_skills.py         checks every SKILL.md's frontmatter
  package_skills.sh          zips each skill into dist/ for upload
.github/workflows/           CI (validate, build, smoke-test, package) and tagged releases
```

## Development

Requirements: Python 3.10+, Node 18+, and for the smoke test `pip install playwright && python3 -m playwright install chromium`.

```bash
python3 scripts/validate_skills.py                                   # check SKILL.md files
node skills/lecture-flashcards/scripts/check_cards.js examples/flashcards/demo-cards.js
python3 skills/lecture-flashcards/scripts/build.py \
  --cards examples/flashcards/demo-cards.js --out /tmp/demo.html \
  --title "Demo" --heading "Demo deck"
python3 skills/lecture-flashcards/scripts/smoke_test.py /tmp/demo.html
bash scripts/package_skills.sh                                       # → dist/*.zip
```

### Card format

```js
const TOPICS = ["Uplink power control", "GSM radio link", /* … 8–10 groups */];
const CARDS = [
  {type:"mcq",   calc:true,  src:"T3 · Slide 26", topic:0, q:"…", code:"formula", opts:["A","B","C","D"], ans:2, exp:"…"},
  {type:"fill",  calc:false, src:"T4 · Slide 22", topic:1, q:"… ____ …", ans:"SRS", accept:["sounding reference signal"], exp:"…"},
  {type:"short", calc:false, src:"T4 · Slide 29", topic:1, q:"…", model:"1. …\n2. …", exp:""}
];
```

### Releasing

Push a version tag. The Release workflow packages both skills and attaches the zips to a GitHub release:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

See [CHANGELOG.md](CHANGELOG.md) for version history and [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes.

## License

[MIT](LICENSE) © 2026 Mohammed Alabdullah

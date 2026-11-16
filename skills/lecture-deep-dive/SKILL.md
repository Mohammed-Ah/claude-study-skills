---
name: lecture-deep-dive
description: Turn an uploaded lecture slide PDF into a deep, slide-numbered markdown study guide (optional matching PPTX/PDF deck). Use for /lecture-deep-dive or when a lecture PDF is uploaded.
---

# Lecture Deep Dive

Turns a lecture slide deck into a study guide that explains every slide in depth, numbered to match the original slides so the student can cross-reference.

## How to call it

```
/lecture-deep-dive                      → deep dive of the attached PDF (markdown guide)
/lecture-deep-dive deck                 → guide + matching PPTX + PDF deck
/lecture-deep-dive slides 26-45         → only that slide range
/lecture-deep-dive COE 446 Topic 5      → sets the course/topic used in the title
```
Uploading a lecture PDF with no message (in a course project) also triggers this skill.

## Steps

1. **Say what you're doing** in one line, then start. Don't ask questions unless the PDF is missing.
2. **Extract the deck.**
   - `pdfinfo` for the page count. `pdftotext -layout` for the text.
   - `pdftoppm -r 60 -png` to render every page, then view the pages that have figures, tables, charts or handwriting. Re-render at 100–130 dpi and crop to read small tables, chart axes and handwritten notes.
   - Map PDF pages to the **printed slide numbers** (the deck may start mid-topic, e.g. page 1 = slide 26). Always number the guide by printed slide numbers.
3. **Write the guide** to `<COURSE>_<Topic>_<Name>_Study_Guide.md`:
   - Header: course, topic name and number, slide range, instructor.
   - A short **Roadmap** of how the slides fit together.
   - One `## Slide N — <title>` section per slide. **Skip the title and contents/outline slides.** Combine consecutive slides only when they are literally one continued table or flow, and say so ("Slides 15–16").
   - Per slide: don't restate the bullets. Explain **why it matters, how it works underneath, and any background needed**, including things only mentioned in passing (acronyms, standards, units).
   - **Every figure, chart and table gets explained**: axes, what each line, colour or box means, and the takeaway.
   - **Worked examples:** redo every calculation step by step and verify the numbers (run them in Python). If the slide's numbers are wrong or a chart isn't to scale, say so politely.
   - **Handwritten notes** (the student's or the instructor's): quote or paraphrase each one in a `> Your margin note:` callout. Confirm it if it's right; correct it clearly if it's wrong (e.g. ICIC = Inter-*Cell*, not Inter-Carrier). Flag notes like "end of quiz material" or "important" at the top of the guide.
   - Point out typos in the slides that could cost marks (wrong acronym expansions, misspelled terms).
   - Use tables for comparisons, numbered steps for procedures, and **bold** for exam-critical facts.
   - End with a **Quick-Review Cheat Sheet**: formulas, key numbers, and the X-vs-Y contrasts.
4. **Deck (only when `deck` is in the arguments or the user asks):** convert the same guide into a slide deck.
   - One slide (or "Part X/Y" slides) per guide section, each titled with the original slide number(s).
   - Keep the wording identical to the markdown, without shortening.
   - Navy / white / one accent colour. Generate with pptxgenjs, estimate line counts to avoid overflow, then convert to PDF (LibreOffice headless).
   - Deliver both the .pptx and the .pdf.
5. **Deliver** with SendUserFile (or save to the requested folder), then reply in a few lines:
   - what's covered
   - any slide errors and corrected margin notes worth knowing
   - the suggested chat name in the format **"<Course> – Topic N: <Chapter Name>"** (Claude can't rename chats itself)
   - one offer, e.g. the deck or flashcards via `/lecture-flashcards`

## Quality bar

- Depth over brevity: a student who skipped the lecture should be able to answer exam questions from the guide alone.
- Every number shown has been recomputed.
- Section numbers match the printed slide numbers exactly.

## Example output

`examples/` in the [claude-study-skills](https://github.com/Mohammed-Ah/claude-study-skills) repo has guides produced with this skill.

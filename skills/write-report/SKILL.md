---
name: write-report
description: Write university reports and homework answers as Word (.docx) files in a fixed house format (Times New Roman, set heading sizes, Word-only line spacing). Use for /write-report or when asked for a report, homework write-up, lab report or assignment answers.
---

# Write Report

Turns an assignment (question sheet, lab handout, project brief) into a finished Word report in one consistent house format, so the student never has to restate the formatting rules.

## How to call it

```
/write-report                            → report for the attached assignment
/write-report CS 101 HW3                 → sets the course and assignment in the title
/write-report lab report                 → lab-report structure (objective, topology, config, verification…)
/write-report ID 2022xxxxx, section 51   → fills the header block
```
Attach the assignment file(s) plus any configs, outputs or screenshots that belong in the report.

## Steps

1. **Say what you're doing** in one line, then start.
2. **Gather before building.**
   - Read the assignment and every attached file in full. The requirements decide the content and the structure.
   - Header block: student name, ID, section (plus course code and instructor when the assignment shows them). Take them from the call, the assignment, earlier conversation or memory. If the ID or section is still missing, ask once in a single short question; if nobody is there to answer, leave a clearly marked placeholder such as `[ID]`.
   - Use the student's own configs, command outputs and screenshots as given. Never invent outputs.
3. **Plan the structure (flexible).** The question-number / question-part / answer layout is a starting point, not a fixed template. Add or remove sections to fit the assignment:
   - Homework or quiz answers → title, header block, then **Question N → parts (a, b, c…) → answers**.
   - Lab or project report → add what the brief asks for, e.g. Objective, Topology, Addressing table, Configuration, Verification (outputs/screenshots), Results/Discussion, Conclusion, References.
   - Drop sections that don't apply. Don't pad with empty or generic sections.
   - Keep the assignment's own numbering and wording for questions so the grader can cross-reference.
4. **Build the .docx.** Load the `docx` skill if it is available and follow its build steps; otherwise use `python-docx` (or `docx` for Node). Apply the formatting rules below.
5. **Check the file.** Render or reopen it and confirm: Times New Roman everywhere, sizes follow the hierarchy, no custom line spacing, every required question and part is answered, figures and tables are captioned where useful, nothing overflows the page.
6. **Deliver** the .docx (SendUserFile, or save to the requested folder) with one line of context. Don't recap the contents.

## Formatting rules

| Element | Font | Size | Weight |
|---|---|---|---|
| Report title | Times New Roman | 18 pt | Bold |
| Name, ID, section lines | Times New Roman | 12 pt | Regular |
| Question number / main section heading | Times New Roman | 16 pt | Bold |
| Question part / sub-heading (a, b, c…) | Times New Roman | 14 pt | Bold |
| Answer / body text | Times New Roman | 12 pt | Regular |

- **Minor font adjustments are allowed** on your own judgment (table text, captions, a size nudged to fit the layout), as long as the hierarchy stays: title > question number > question part > body.
- **Config / CLI blocks** may use a monospaced font (e.g. Consolas or Courier New, 10–11 pt). Keep each block readable and avoid splitting it across pages when possible.
- **Line spacing:** never a custom value. Use only Word's built-in presets (1.0, 1.15, 1.5, 2.0, 2.5, 3.0) and Word's standard Before/After paragraph spacing options.
- Set the fonts on the document's styles (Normal, Title, Heading 1, Heading 2), not only as direct run formatting, so Word's navigation pane and any table of contents work.

## Quality bar

- A grader can find every question and part by its original number.
- The format matches the table above without the student restating it.
- Every output, number and screenshot in the report comes from the student's work or is recomputed, not assumed.

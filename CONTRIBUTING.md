# Contributing

Thanks for improving these skills! The workflow is short:

1. **Branch** from `main`: `git checkout -b feature/<short-name>`.
2. **Edit** a skill under `skills/<name>/`. Keep `SKILL.md` frontmatter valid:
   - `name` matches the folder (kebab-case, ≤ 64 chars)
   - `description` is one sentence, ≤ 1024 chars, with no angle brackets
3. **Check locally**:
   ```bash
   python3 scripts/validate_skills.py
   node skills/lecture-flashcards/scripts/check_cards.js examples/flashcards/demo-cards.js
   python3 skills/lecture-flashcards/scripts/build.py --cards examples/flashcards/demo-cards.js --out /tmp/demo.html --title Demo --heading Demo
   python3 skills/lecture-flashcards/scripts/smoke_test.py /tmp/demo.html
   ```
4. **Update `CHANGELOG.md`** under *Unreleased*.
5. **Open a pull request** using the template. CI must pass.

## Style

- SKILL.md files are instructions for Claude: be direct and concrete, and give an example command.
- Keep `assets/app.js` dependency-free (plain browser JavaScript, no build step).
- Don't commit lecture PDFs or other copyrighted course material. Generated study guides and decks are fine.

# Repo notes for Claude

This repo holds Claude skills under `skills/<name>/SKILL.md` (+ optional `assets/`, `scripts/`).

- Validate after editing any SKILL.md: `python3 scripts/validate_skills.py`.
- The flashcard page is built only from `skills/lecture-flashcards/assets/{shell.html,app.js}` via `scripts/build.py`. Don't hand-edit built HTML in `examples/`; rebuild it instead.
- After changing `app.js` or `shell.html`, rebuild both example pages and run `smoke_test.py` on them.
- Record user-visible changes in `CHANGELOG.md` under *Unreleased*.
- Never commit original lecture PDFs (copyrighted course material).

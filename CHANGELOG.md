# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added
- Authors section in the README.

## [1.0.0] - 2026-11-16
### Added
- `lecture-deep-dive` skill: a slide-numbered markdown study guide with figure walkthroughs, recomputed examples, margin-note corrections and a cheat sheet; optional PPTX + PDF deck.
- `lecture-flashcards` skill: setup questions (minimum count, question types, difficulty, scope), harder-than-slides card rules, and a bundled page template.
- Flashcard engine supporting MCQ, fill-in (normalised and numeric-tolerant matching) and short-answer (self-graded) cards.
- `build.py`, `check_cards.js` and `smoke_test.py` helper scripts.
- Examples: COE 446 Topic 3 & 4 study guides, a 59-card deck, and a demo deck with all card types.
- CI (validate, build, smoke-test, package) and a tagged-release workflow that attaches skill zips.

#!/usr/bin/env python3
"""Inline a cards file into the flashcard shell and write one self-contained HTML page.

Usage:
  python3 build.py --cards cards.js --out index.html \
      --title "BIO 201 Flashcards — Topic 3 & 4" \
      --heading "BIO 201 · Cell Biology Flashcards" \
      --subtitle "Topic 3 (slides 26–45) · Topic 4 (slides 1–36)" \
      [--accent "#0e7490" --accent-dark "#38bdd8"] \
      [--status "Idle,Connected,ACK,NACK"]

The cards file must define `const TOPICS = [...]` and `const CARDS = [...]`.
"""
import argparse
import html
import pathlib
import json

ASSETS = pathlib.Path(__file__).resolve().parent.parent / "assets"


def hex_to_soft(hex_color: str, mix: float, base: str) -> str:
    """Blend hex_color toward base (white or near-black) to get a soft tint."""
    h = hex_color.lstrip("#")
    b = base.lstrip("#")
    c = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    bb = [int(b[i:i + 2], 16) for i in (0, 2, 4)]
    m = [round(bb[i] + (c[i] - bb[i]) * mix) for i in range(3)]
    return "#" + "".join(f"{v:02x}" for v in m)


def accent_css(light: str, dark: str) -> str:
    return (
        f":root{{--accent:{light};--accent-soft:{hex_to_soft(light, .14, '#ffffff')};--cur:{light};--focus:{light}}}\n"
        f"@media (prefers-color-scheme: dark){{:root:not([data-theme=\"light\"]){{--accent:{dark};"
        f"--accent-soft:{hex_to_soft(dark, .2, '#0f141b')};--cur:{dark};--focus:{dark}}}}}\n"
        f":root[data-theme=\"dark\"]{{--accent:{dark};--accent-soft:{hex_to_soft(dark, .2, '#0f141b')};--cur:{dark};--focus:{dark}}}\n"
        f":root[data-theme=\"light\"]{{--accent:{light};--accent-soft:{hex_to_soft(light, .14, '#ffffff')};--cur:{light};--focus:{light}}}"
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cards", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--heading", required=True)
    ap.add_argument("--subtitle", default="")
    ap.add_argument("--accent", default="#0e7490")
    ap.add_argument("--accent-dark", default="#38bdd8")
    ap.add_argument("--status", default="Not tried,Current,Correct,Missed",
                    help="Four comma-separated labels: untried,current,correct,missed")
    a = ap.parse_args()

    labels = [x.strip() for x in a.status.split(",")]
    if len(labels) != 4:
        raise SystemExit("--status needs exactly 4 comma-separated labels")
    status_js = "const STATUS_LABELS = " + json.dumps(dict(zip(
        ["untried", "current", "correct", "missed"], labels)), ensure_ascii=False) + ";"

    shell = (ASSETS / "shell.html").read_text(encoding="utf-8")
    app = (ASSETS / "app.js").read_text(encoding="utf-8")
    cards = pathlib.Path(a.cards).read_text(encoding="utf-8")

    page = (shell
            .replace("{{TITLE}}", html.escape(a.title))
            .replace("{{HEADING}}", html.escape(a.heading))
            .replace("{{SUBTITLE}}", html.escape(a.subtitle))
            .replace("/*ACCENT*/", accent_css(a.accent, a.accent_dark))
            .replace("/*STATUS*/", status_js)
            .replace("/*CARDS*/", cards)
            .replace("/*APP*/", app))
    pathlib.Path(a.out).write_text(page, encoding="utf-8")
    print(f"wrote {a.out} ({len(page):,} bytes)")


if __name__ == "__main__":
    main()

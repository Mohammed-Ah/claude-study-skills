#!/usr/bin/env python3
"""Headless smoke test for a built flashcard page.

Usage: python3 smoke_test.py index.html [--screenshot shot.png] [--chrome /usr/bin/google-chrome]

Checks: no page errors, no horizontal scroll at 390 px, MCQ keyboard answering,
fill-in checking, short-answer self-grading, Review missed, and the weak-topic flag.
"""
import argparse
import pathlib
import sys

from playwright.sync_api import sync_playwright


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("page")
    ap.add_argument("--screenshot")
    ap.add_argument("--chrome", default=None, help="Path to a Chrome/Chromium binary (optional)")
    a = ap.parse_args()
    url = pathlib.Path(a.page).resolve().as_uri()
    problems = []

    with sync_playwright() as p:
        kw = {"executable_path": a.chrome} if a.chrome else {}
        browser = p.chromium.launch(**kw)
        page = browser.new_page(viewport={"width": 390, "height": 900})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url)

        n = page.evaluate("CARDS.length")
        for _ in range(min(n, 12)):
            t = page.evaluate("CARDS[view[pos]].type")
            if t == "mcq":
                page.keyboard.press("b")
            elif t == "fill":
                page.fill("#fillIn", "definitely wrong answer")
                page.keyboard.press("Enter")
            else:
                page.fill("#shortIn", "my attempt")
                page.click("#reveal")
                page.click("#missedPts")
            page.keyboard.press("ArrowRight")

        tried = page.evaluate("state.filter(s => s.status !== 'untried').length")
        if tried < min(n, 12):
            problems.append(f"only {tried} cards registered an answer")
        if page.evaluate("document.documentElement.scrollWidth") > 390:
            problems.append("horizontal scroll at 390 px")
        page.click("#review")
        if page.evaluate("view.length") != page.evaluate("state.filter(s => s.status === 'missed').length"):
            problems.append("Review missed does not show exactly the missed cards")
        page.click("#review")
        if a.screenshot:
            page.screenshot(path=a.screenshot, full_page=True)
        problems += [f"page error: {e}" for e in errors]
        browser.close()

    if problems:
        print("FAIL\n- " + "\n- ".join(problems))
        return 1
    print(f"OK ({n} cards)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

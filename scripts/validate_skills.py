#!/usr/bin/env python3
"""Validate every skills/<name>/SKILL.md: frontmatter present, name matches the folder,
kebab-case name ≤ 64 chars, description present, ≤ 1024 chars and without angle brackets."""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
errors = []
skills = sorted(p for p in (ROOT / "skills").iterdir() if p.is_dir())
if not skills:
    errors.append("no skills found under skills/")

for d in skills:
    md = d / "SKILL.md"
    if not md.exists():
        errors.append(f"{d.name}: missing SKILL.md")
        continue
    text = md.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append(f"{d.name}: missing YAML frontmatter")
        continue
    fm = dict(re.findall(r"^(\w+):\s*(.*)$", m.group(1), re.M))
    name, desc = fm.get("name", ""), fm.get("description", "")
    if name != d.name:
        errors.append(f"{d.name}: frontmatter name '{name}' does not match folder")
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name) or len(name) > 64:
        errors.append(f"{d.name}: name must be kebab-case and ≤ 64 chars")
    if not desc:
        errors.append(f"{d.name}: missing description")
    elif len(desc) > 1024:
        errors.append(f"{d.name}: description is {len(desc)} chars (max 1024)")
    if "<" in desc or ">" in desc:
        errors.append(f"{d.name}: description must not contain angle brackets")
    if len(text.splitlines()) > 500:
        print(f"warning: {d.name}/SKILL.md is over 500 lines; consider moving detail into references/")
    print(f"checked {d.name}: {len(desc)}-char description")

if errors:
    print("\nERRORS:\n- " + "\n- ".join(errors))
    sys.exit(1)
print("All skills valid.")

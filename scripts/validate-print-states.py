#!/usr/bin/env python3
"""Require the print manifest, collection and 118 pages to use one state base."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
facts = json.loads((ROOT / "assets/elementos-fichas.json").read_text())
collection = json.loads((ROOT / "assets/colecao/dados.json").read_text())
manifest = json.loads((ROOT / "data/folhetos-impressao-manifesto.json").read_text())
layouts = {
    "Sólido": "ep-print-solid",
    "Líquido": "ep-print-liquid",
    "Gasoso": "ep-print-gas",
    "Não determinado": "ep-print-unknown",
}
errors = []
for fact in facts:
    z = fact["z"]
    for label, records in [
        ("collection", collection["elements"]),
        ("manifest", manifest["elements"]),
    ]:
        matches = [item for item in records if item["z"] == z]
        if len(matches) != 1 or matches[0]["state"] != fact["state"]:
            errors.append(f"{z}: state differs in {label}")
        if label == "manifest" and matches[0]["layout"] != layouts[fact["state"]]:
            errors.append(f"{z}: print layout differs from physical state")
    source = (ROOT / "elementos" / fact["slug"] / "index.html").read_text()
    match = re.search(
        r'<script[^>]*id="element-data"[^>]*>(.*?)</script\s*>', source, re.S
    )
    page_data = json.loads(match.group(1))
    if page_data["state"] != fact["state"]:
        errors.append(f"{z}: embedded page/print state differs")

if errors:
    raise SystemExit("\n".join(errors))
print("118 states agree across facts, collection, print manifest and page data.")

#!/usr/bin/env python3
"""Validate generated content, accessibility targets, local routes and offline assets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.nodes = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))


models = json.loads((ROOT / "assets/elementos-fichas.json").read_text())
editorial = json.loads((ROOT / "data/elementos-editoriais.json").read_text())[
    "elements"
]
contexts = json.loads((ROOT / "data/contextos-elementos.json").read_text())
assert len(models) == 118 and {m["z"] for m in models} == set(range(1, 119))
assert len({m["slug"] for m in models}) == 118
assert set(map(int, contexts)) == set(range(1, 119))
documents = {}
errors = []


def document(path):
    if path not in documents:
        documents[path] = Document(path)
    return documents[path]


for m, art in zip(models, editorial):
    z = m["z"]
    path = (ROOT / "elementos" / m["slug"] / "index.html").resolve()
    doc = document(path)
    ids = [a["id"] for _, a in doc.nodes if "id" in a]
    known = set(ids)
    assert len(ids) == len(known), (z, "duplicate ids")
    assert sum(s["count"] for s in m["shells"]) == z, (z, "electron count")
    assert (
        m["state"] == art["state"]
        and m["mass"] == art["mass"]
        and m["category"] == art["category"]
    )
    assert all(s["count"] <= 2 * s["n"] ** 2 for s in m["shells"]), (
        z,
        "shell capacity",
    )
    assert m["period"] in range(1, 8)
    if m["series"]:
        assert m["group"] is None and m["period"] == (6 if z < 89 else 7), (
            z,
            "f-series placement",
        )
    else:
        assert m["group"] in range(1, 19)
    assert {
        "conteudo",
        "ficha",
        "atomo",
        "propriedades",
        "obtencao",
        "curiosidades",
        "cotidiano",
        "posicao",
        "referencias",
        "appearance",
        "install-dialog",
    } <= known
    assert sum(tag == "h1" for tag, _ in doc.nodes) == 1
    assert not any(
        "grid" in a.get("class", "").split() for _, a in doc.nodes
    ), "Home initializer must not run here"
    assert (
        "book-intro" not in path.read_text()
    ), "Individual QR links must open directly"
    for tag, a in doc.nodes:
        if tag == "img":
            assert "alt" in a and "width" in a and "height" in a, (
                z,
                "image accessibility",
            )
        if tag == "button":
            assert a.get("type") == "button", (z, "implicit submit button")
        for attr in ("aria-controls", "aria-labelledby", "aria-describedby", "for"):
            if attr in a:
                assert set(a[attr].split()) <= known, (z, attr, a[attr])
        for attr in ("href", "src"):
            if attr not in a:
                continue
            url = urlsplit(a[attr])
            if url.scheme or url.netloc:
                continue
            dest = (path.parent / unquote(url.path)).resolve() if url.path else path
            if dest.is_dir():
                dest = dest / "index.html"
            if not dest.exists():
                errors.append((z, "missing file", a[attr]))
                continue
            if url.fragment and dest.suffix == ".html":
                target_ids = {attrs.get("id") for _, attrs in document(dest).nodes}
                if url.fragment not in target_ids:
                    errors.append((z, "missing fragment", a[attr]))

sw = (ROOT / "sw.js").read_text()
files = json.loads(re.search(r"const\s+FILES\s*=\s*(\[.*?\]);", sw, re.S)[1])
assert len(files) == len(set(files))
assert all((ROOT / f).exists() for f in files), "Missing offline asset"
assert all(f'elementos/{m["slug"]}/' in files for m in models), "Missing offline route"
assert all(
    f"assets/{name}" in files
    for name in [
        "element-page.css",
        "element-page.js",
        "element-model.js",
        "elementos-fichas.json",
    ]
)
assert all(f'assets/colecao/arte-{m["z"]:03d}.webp' in files for m in models)
assert not errors, errors
print(
    f"PASS: 118 fichas, imagens e ícones, fontes internas, relações ARIA, ligações e {len(files)} recursos offline."
)

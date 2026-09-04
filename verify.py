#!/usr/bin/env python3
"""Structural checks that stand in for a real build while the npm registry is unreachable.

Covers: module + named-export resolution, bracket balance (with strings and
comments stripped), the 'use client' boundary, and Tailwind utilities that
reference design tokens which must exist in globals.css.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIRS = ["app", "components", "lib"]
problems = []


def source_files():
    for base in SRC_DIRS:
        for dirpath, _dirs, names in os.walk(os.path.join(ROOT, base)):
            for name in sorted(names):
                if name.endswith((".ts", ".tsx")):
                    yield os.path.join(dirpath, name)


FILES = list(source_files())
rel = lambda path: os.path.relpath(path, ROOT)
SOURCES = {p: open(p, encoding="utf-8").read() for p in FILES}


def strip_comments(text):
    out, i, n = [], 0, len(text)
    while i < n:
        two = text[i : i + 2]
        if two == "//":
            i = text.find("\n", i)
            if i == -1:
                break
        elif two == "/*":
            end = text.find("*/", i + 2)
            i = n if end == -1 else end + 2
        elif text[i] in "'\"`":
            quote, j = text[i], i + 1
            out.append(text[i])
            while j < n:
                if text[j] == "\\":
                    out.append(text[j : j + 2])
                    j += 2
                    continue
                out.append(text[j])
                if text[j] == quote:
                    j += 1
                    break
                j += 1
            i = j
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


def strip_literals(text):
    """Remove comments and every string/template literal, keeping other code."""
    out, i, n = [], 0, len(text)
    while i < n:
        two = text[i : i + 2]
        if two == "//":
            i = text.find("\n", i)
            if i == -1:
                break
        elif two == "/*":
            end = text.find("*/", i + 2)
            i = n if end == -1 else end + 2
        elif text[i] in "'\"`":
            quote, j = text[i], i + 1
            while j < n:
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == quote:
                    j += 1
                    break
                j += 1
            i = j
            out.append('""')
        else:
            out.append(text[i])
            i += 1
    return "".join(out)


NO_COMMENTS = {p: strip_comments(t) for p, t in SOURCES.items()}
NO_LITERALS = {p: strip_literals(t) for p, t in SOURCES.items()}

# ----------------------------------------------------------------- export index
EXPORT_RE = re.compile(
    r"^export\s+(?:async\s+)?(?:function|const|let|class|type|interface|enum)\s+"
    r"([A-Za-z0-9_$]+)",
    re.M,
)
DEFAULT_RE = re.compile(r"^export\s+default\b", re.M)
STAR_RE = re.compile(r"^export\s+\*\s+from\s+'([^']+)'", re.M)

exports = {}
for path, text in NO_COMMENTS.items():
    names = set(EXPORT_RE.findall(text))
    if DEFAULT_RE.search(text):
        names.add("default")
    exports[path] = names


def resolve(spec, importer):
    if spec.startswith("@/"):
        stem = os.path.join(ROOT, spec[2:])
    elif spec.startswith("."):
        stem = os.path.normpath(os.path.join(os.path.dirname(importer), spec))
    else:
        return None
    for candidate in (
        stem + ".tsx",
        stem + ".ts",
        os.path.join(stem, "index.ts"),
        os.path.join(stem, "index.tsx"),
    ):
        if os.path.isfile(candidate):
            return candidate
    return False


# flatten barrel re-exports so importing from the folder works
for path, text in NO_COMMENTS.items():
    if os.path.basename(path) not in ("index.ts", "index.tsx"):
        continue
    for spec in STAR_RE.findall(text):
        target = resolve(spec, path)
        if target:
            exports[path] |= exports.get(target, set())
        else:
            problems.append(f"{rel(path)}: export * from '{spec}' does not resolve")

IMPORT_RE = re.compile(r"^import\s+(?:type\s+)?(.*?)\s+from\s+'([^']+)';", re.M | re.S)

for path, text in NO_COMMENTS.items():
    if "framer-motion" in text:
        problems.append(f"{rel(path)}: imports framer-motion instead of motion/react")
    for clause, spec in IMPORT_RE.findall(text):
        target = resolve(spec, path)
        if target is None:
            continue
        if target is False:
            problems.append(f"{rel(path)}: cannot resolve '{spec}'")
            continue
        wanted = []
        for group in re.findall(r"\{([^}]*)\}", clause, re.S):
            for piece in group.split(","):
                piece = re.sub(r"^type\s+", "", piece.strip())
                piece = piece.split(" as ")[0].strip()
                if piece:
                    wanted.append(piece)
        for name in wanted:
            if name not in exports.get(target, set()):
                problems.append(f"{rel(path)}: '{name}' not exported by {rel(target)}")

# --------------------------------------------------------------- bracket balance
PAIRS = {")": "(", "]": "[", "}": "{"}
for path, text in NO_LITERALS.items():
    stack = []
    for char in text:
        if char in "([{":
            stack.append(char)
        elif char in PAIRS:
            if not stack or stack[-1] != PAIRS[char]:
                problems.append(f"{rel(path)}: unbalanced '{char}'")
                stack = []
                break
            stack.pop()
    if stack:
        problems.append(f"{rel(path)}: {len(stack)} unclosed bracket(s)")

# ------------------------------------------------------------- 'use client' rule
CLIENT_SIGNALS = re.compile(
    r"\b(useState|useEffect|useRef|useMemo|useCallback|useId|useInView|"
    r"useReducedMotion|useSpring|useScroll|useMotionValue|useTransform|"
    r"createPortal|whileInView|whileHover|onClick|onMouseEnter|onFocus)\b"
)
for path, text in NO_COMMENTS.items():
    if CLIENT_SIGNALS.search(text) and not text.lstrip().startswith("'use client';"):
        problems.append(f"{rel(path)}: client-only APIs without 'use client'")

# ------------------------------------------------------------------ design tokens
theme = open(os.path.join(ROOT, "app", "globals.css"), encoding="utf-8").read()
tokens = set(re.findall(r"--color-([a-z0-9-]+):", theme))
fonts = set(re.findall(r"--font-([a-z0-9-]+):", theme))
texts = set(re.findall(r"--text-([a-z0-9-]+)(?:--[a-z-]+)?:", theme))
known = tokens | fonts | texts

UTILITY_RE = re.compile(
    r"\b(?:bg|text|border|fill|stroke|divide|from|to|via)-([a-z][a-z0-9-]*)(?:/\d+)?\b"
)
BUILTIN = {
    "transparent", "current", "black", "white", "inherit", "left", "right",
    "center", "balance", "pretty", "wrap", "nowrap", "end", "start", "clip",
    "clip-text", "ellipsis", "none", "auto", "mono", "sans", "serif",
    "transform", "colors", "opacity", "solid", "dashed", "dotted", "hidden",
    "collapse", "separate", "fixed", "visible", "b", "t", "l", "r", "x", "y",
    "px", "py", "pretty", "balance", "top", "bottom", "middle", "baseline",
    "sm", "base", "lg", "xl", "xs", "2xl", "3xl", "4xl", "2xs", "justify",
    "box",
}
SIDE_RE = re.compile(r"^(?:t|b|l|r|x|y|s|e)-(.*)$")

# Gradient direction utilities are not colour tokens. Tailwind v4 renamed these
# from bg-gradient-* to bg-linear-* / bg-radial-* / bg-conic-*, so the old spelling
# is deliberately NOT allowed here: it would emit nothing and fail silently.
GRADIENT_RE = re.compile(r"^(?:linear|radial|conic)(?:-to-[trbl]{1,2})?$")

# Utilities only ever appear in component markup. Import specifiers look like
# utilities ('@/components/.../text-loop'), so drop them, and skip lib/ entirely
# since the data files carry prose such as "speech-to-text".
for path, raw in NO_COMMENTS.items():
    if rel(path).startswith("lib" + os.sep):
        continue
    text = IMPORT_RE.sub("", raw)
    text = STAR_RE.sub("", text)
    if "bg-gradient-" in text:
        problems.append(
            f"{rel(path)}: bg-gradient-* is the Tailwind v3 name; v4 wants bg-linear-*"
        )
    for head in set(UTILITY_RE.findall(text)):
        candidate = head
        side = SIDE_RE.match(candidate)
        if side:
            candidate = side.group(1)
        if (
            candidate in BUILTIN
            or candidate in known
            or head in BUILTIN
            or head in known
            or GRADIENT_RE.match(head)
            or re.fullmatch(r"\d+", candidate)
            or re.fullmatch(r"(?:[2-9])?x?[sl]|\d?xl|xs", candidate)
        ):
            continue
        problems.append(f"{rel(path)}: unknown token in *-{head}")

# ------------------------------------------------------- nav targets exist
statusbar = SOURCES[os.path.join(ROOT, "components", "site", "status-bar.tsx")]
nav_ids = re.findall(r"\{\s*id:\s*'([a-z-]+)'", statusbar)
section_ids = set()
for path, text in NO_COMMENTS.items():
    section_ids |= set(re.findall(r'id="([a-z-]+)"', text))
    section_ids |= set(re.findall(r"id=\{?'([a-z-]+)'\}?", text))
    section_ids |= set(re.findall(r"^\s+id=\"([a-z-]+)\"", text, re.M))
for nav_id in nav_ids:
    if nav_id not in section_ids:
        problems.append(
            f"status-bar nav points at #{nav_id}, which nothing renders as a section id"
        )

# ------------------------------------------------------------- diagram integrity
diagrams = SOURCES[os.path.join(ROOT, "lib", "diagrams.ts")]
data = SOURCES[os.path.join(ROOT, "lib", "data.ts")]
diagram_keys = set(re.findall(r"^  '([a-z-]+)': [a-zA-Z]+,$", diagrams, re.M))
for used in set(re.findall(r"diagramId: '([a-z-]+)'", data)):
    if used not in diagram_keys:
        problems.append(f"data.ts references diagram '{used}' which diagrams.ts lacks")

# ---------------------------------------------------------------------- report
if problems:
    print(f"{len(problems)} problem(s):")
    for line in sorted(set(problems)):
        print("  " + line)
    sys.exit(1)

print(
    f"ok — {len(FILES)} source files, {len(tokens)} colour tokens, "
    f"{len(diagram_keys)} diagrams, {len(nav_ids)} nav targets, no problems"
)

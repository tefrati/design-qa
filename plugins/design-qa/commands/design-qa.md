---
description: Run the design QA iteration loop on a URL
argument-hint: <url> [--strict] [--max-iterations=N]
---

# Design QA Command

Run the full design QA iteration loop on the provided URL. This captures screenshots, measures pixel-level alignment, inspects DOM structure, audits accessibility, catalogues issues, fixes them, and repeats until the UI passes all quality thresholds.

## Usage

The user will provide a URL as the argument. Parse it and begin the design QA loop as described in the `design-qa` skill's SKILL.md.

## Flags

- `--strict`: Require zero Minor issues before completion (default: only zero Critical and Major required)
- `--max-iterations=N`: Maximum loop iterations before stopping with a warning (default: 10)

## Workflow

Follow the iteration loop defined in the design-qa skill exactly:

1. **CAPTURE** — Take screenshot with `scripts/capture.js`
2. **MEASURE** — Run `scripts/alignment-check.js` (MANDATORY)
3. **ANALYSE** — Run `scripts/inspect-dom.js` + visual analysis
4. **CATALOGUE** — List all issues with severity ratings
5. **CHECK** — Any Critical or Major issues? If yes, fix and go to step 1
6. **FINAL VALIDATION** — Multi-viewport screenshots and report

Always run the accessibility audit (`scripts/audit-a11y.js`) at least once during the loop.

Consult the reference files in `references/` for design principles, heuristics, accessibility standards, typography rules, and interaction patterns.

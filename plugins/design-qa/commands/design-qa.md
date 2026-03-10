---
description: Run the design QA iteration loop on a URL
argument-hint: <url> [--strict] [--max-iterations=N] [--help]
---

# Design QA Command

If the user passes `--help`, `-h`, or no arguments, print this usage guide and stop:

```
Design QA — Autonomous design critique and iteration loop

Usage:
  /design-qa <url> [flags]

Examples:
  /design-qa http://localhost:3000
  /design-qa http://localhost:3000 --strict
  /design-qa http://localhost:3000 --max-iterations=5

Flags:
  --strict              Require zero Minor issues before completion
                        (default: only zero Critical and Major required)
  --max-iterations=N    Maximum loop iterations (default: 10)
  --help, -h            Show this help message

What it does:
  1. CAPTURE    — Screenshot current state (capture.js)
  2. MEASURE    — Pixel-level alignment check (alignment-check.js) [MANDATORY]
  3. ANALYSE    — DOM inspection (inspect-dom.js) + visual analysis
  4. CATALOGUE  — List all issues with severity ratings
  5. CHECK      — Critical or Major issues? → FIX and repeat from step 1
  6. VALIDATE   — Multi-viewport final screenshots and report

The loop exits when zero Critical and zero Major issues remain.
With --strict, zero Minor issues are also required.

Dependencies (install in your project):
  npm install -D playwright axe-core
  npx playwright install chromium
```

## Normal execution (URL provided, no --help/-h)

Run the full design QA iteration loop on the provided URL. This captures screenshots, measures pixel-level alignment, inspects DOM structure, audits accessibility, catalogues issues, fixes them, and repeats until the UI passes all quality thresholds.

Parse the arguments from the user's input:
- The URL is the first positional argument
- `--strict` enables zero-Minor termination
- `--max-iterations=N` sets the iteration cap (default: 10)

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

# design-qa

**A Claude Code plugin that won't stop until your UI is right.**

Captures screenshots. Measures pixels. Analyses against Rams, Nielsen, and WCAG. Fixes the code. Repeats. The loop only exits when zero issues remain.

---

## The Loop

```
  CAPTURE ──► screenshot of current state
     │
     ▼
  MEASURE ──► pixel-level alignment check (mandatory)
     │
     ▼
  ANALYSE ──► visual layers + DOM inspection + accessibility
     │
     ▼
  CATALOGUE ──► every issue, severity-ranked
     │
     ├── issues found ──► FIX highest severity → GOTO CAPTURE
     │
     └── zero issues ──► FINAL REPORT · DONE
```

---

## Install

```bash
claude plugin install https://github.com/tefrati/design-qa
```

**Dependencies** (in your project):

```bash
npm install -D playwright
npx playwright install chromium
```

---

## Usage

```
/design-qa http://localhost:3000
```

Or ask naturally:

```
Review the design of this dashboard
Make this component pixel-perfect
Audit the UI until it's flawless
```

---

## How It Works

Each iteration runs five analysis layers in order. The loop continues until all layers pass their thresholds.

| Layer | Threshold | Checks |
|-------|-----------|--------|
| **Accessibility** | 100% | Contrast ratios, focus indicators, touch targets, ARIA |
| **Structure** | 90% | Layout integrity, grid alignment, spacing consistency |
| **Hierarchy** | 90% | Visual weight, typographic scale, focal point |
| **Interaction** | 85% | State visibility (hover, active, disabled), feedback |
| **Emotion** | 80% | Aesthetic cohesion, visual harmony, craft |

**Pixel measurement runs before visual analysis** — screenshots displayed in a conversation are often thumbnails. A 15px alignment offset is invisible at 60% scale but is caught immediately by `alignment-check.js`.

---

## Scripts

| Script | Purpose | Runs |
|--------|---------|------|
| `capture.js` | Playwright screenshot at 1440×900 (+ mobile flag) | Every iteration |
| `alignment-check.js` | Pixel-level position measurement, redundancy detection | Every iteration (mandatory) |
| `inspect-dom.js` | Typography, contrast, DOM structure | Every iteration |
| `audit-a11y.js` | axe-core accessibility audit | Final validation |

---

## Design Philosophy

### Dieter Rams — 10 Principles of Good Design

Good design is innovative. Useful. Aesthetic. Understandable. Unobtrusive. Honest. Long-lasting. Thorough down to the last detail. Environmentally friendly. And: **as little design as possible.**

The tenth principle governs the others. Every element in the QA loop earns its place or gets removed.

### Jakob Nielsen — 10 Usability Heuristics

Visibility of system status. Match with the real world. User control and freedom. Consistency and standards. Error prevention. Recognition over recall. Flexibility and efficiency. Aesthetic and minimalist design. Help users recognise, diagnose, recover from errors. Help and documentation.

Heuristic 8 — *aesthetic and minimalist design* — is not a suggestion. Every extra element competes with every other element. Remove the competition.

### Jobs / Ive

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

Jony Ive's approach: obsess over the details no one will consciously notice. The chamfer on a corner. The 1px shadow. The 200ms ease. Users don't see these — they feel them. The aggregate of invisible decisions is what separates craft from competence.

---

## The Perfectionist Tests

Applied during every visual analysis pass:

**The Squint Test** — Squint at the screenshot. Does hierarchy hold? Do the right things pop? If not, the visual weight is wrong.

**The Newspaper Test** — If this shipped tomorrow in a design publication, would you be proud or embarrassed?

**The Mother Test** — Could a non-technical parent complete the core task without help?

**The Removal Test** — For every element: what breaks if this is removed? If nothing breaks, remove it.

**The 5-Second Test** — In 5 seconds, can a user identify: what this is, what they can do, and why they should care?

---

## Why Pixel Measurement Is Non-Negotiable

Visual-only analysis fails at the thumbnail scale conversation interfaces use. A real example from a QA session:

```
Navigation first tab:  left = 76px
Sidebar first link:    left = 60px
Offset:                16px  ← CRITICAL, invisible in screenshot
```

`alignment-check.js` caught this. Visual analysis missed it. The default tolerance is 2px — anything larger is perceptible to users viewing at full size.

---

## Requirements

- Claude Code
- Node.js 18+
- Playwright (`npm install -D playwright && npx playwright install chromium`)
- A running dev server

---

## License

MIT — see [LICENSE](LICENSE)

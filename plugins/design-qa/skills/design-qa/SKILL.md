---
name: design-qa
description: Systematic design critique and iteration loop for achieving exceptional UI/UX quality. Use when reviewing, auditing, or perfecting web interfaces, components, or applications. Triggers on requests to "review design", "check UI", "audit UX", "perfect this interface", "design QA", "make it pixel-perfect", or any request to iteratively improve visual design until it meets professional standards. Embodies principles from Nielsen (usability), Rams (functionalism), Jobs/Ive (emotional design), and modern accessibility standards. Runs autonomous inspection loops with visual screenshot analysis until acceptance criteria are met.
---

# Design QA: Systematic Design Excellence for Claude Code

This skill transforms Claude into a **design critic and perfectionist** that captures screenshots, analyses them visually, identifies issues, fixes the code, and repeats until the interface meets world-class standards.

## Core Philosophy

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

> "Good design is as little design as possible." — Dieter Rams

This skill operationalises these philosophies into a mechanical, iterative inspection loop.

---

## CRITICAL LIMITATION: Visual Analysis is NOT Enough

**WARNING:** Visual analysis of screenshots CANNOT reliably detect alignment issues.

When screenshots are displayed in a conversation, they are often rendered as thumbnails or at reduced resolution. This makes it IMPOSSIBLE to detect:
- 5-20px alignment offsets between navigation and content
- Subtle spacing inconsistencies
- Redundant elements that should be hidden
- Grid misalignment

**YOU MUST USE PIXEL-LEVEL MEASUREMENT SCRIPTS** in addition to visual analysis. The human eye looking at a thumbnail cannot detect a 15px misalignment—but the scripts can.

---

## THE ITERATION LOOP (CRITICAL)

This is the core workflow. Follow it precisely.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN QA ITERATION LOOP                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CAPTURE ──► Take screenshot of current state                 │
│       │                                                          │
│       ▼                                                          │
│  2. MEASURE ──► Run alignment-check.js (MANDATORY)               │
│       │         Returns pixel-level position data                │
│       │                                                          │
│       ▼                                                          │
│  3. ANALYSE ──► Visual analysis of screenshot                    │
│       │         + DOM inspection results                         │
│       │         + Alignment check results                        │
│       │                                                          │
│       ▼                                                          │
│  4. CATALOGUE ──► List all issues found                          │
│       │           with severity ratings                          │
│       │                                                          │
│       ▼                                                          │
│  5. CHECK ──► Any Critical or Major issues?                      │
│       │                                                          │
│       ├── YES ──► 6. FIX highest severity issue                  │
│       │                 │                                        │
│       │                 └──► GOTO 1 (new iteration)              │
│       │                                                          │
│       └── NO ──► 7. FINAL VALIDATION                             │
│                       Report remaining Minor issues              │
│                       └──► Generate report, DONE                 │
│                                                                  │
│  MAX ITERATIONS: Stop after --max-iterations (default: 10)       │
│                  and report remaining issues as warnings.         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**CRITICAL RULES:**
- NEVER skip the screenshot step
- NEVER skip the alignment measurement step (alignment-check.js)
- NEVER mark complete without a clean screenshot pass AND clean alignment check
- ALWAYS re-run alignment-check.js after making CSS/layout changes
- ALWAYS visually verify fixes worked
- Loop continues until ZERO Critical and ZERO Major issues. Minor issues are reported but do NOT block completion.
- Use `--strict` flag to re-enable zero-Minor termination for projects that require it.
- **Maximum iterations**: Default 10 (set with `--max-iterations=N`). When the cap is hit, the loop exits with a **WARNING: Max iterations reached** message listing all unresolved issues. This prevents runaway loops.
- **If alignment-check.js reports CRITICAL issues, they MUST be fixed before proceeding**

---

## Phase 1: Environment Setup

Before starting the loop, ensure the target is viewable.

### For Local Development

```bash
# Check if dev server is running, if not start it
# Adjust command for your framework (npm run dev, yarn dev, etc.)
lsof -i :3000 || npm run dev &
sleep 3
```

### Install Screenshot Tool (if needed)

```bash
# Check if Playwright is available
which playwright || npm install -D playwright
npx playwright install chromium
```

---

## Phase 2: Screenshot Capture

Use `scripts/capture.js` to take screenshots. Run this at EVERY iteration.

```bash
# Capture current state
node scripts/capture.js --url="http://localhost:3000" --output="screenshots/iteration-$(date +%s).png"
```

The script captures:
- Full page screenshot at 1440x900 (desktop)
- Mobile viewport at 390x844 (if --mobile flag)
- Saves to screenshots/ directory with timestamp

**After capturing, proceed to Phase 2.5 for pixel-level measurement BEFORE visual analysis.**

---

## Phase 2.5: Pixel-Level Alignment Verification (MANDATORY)

**THIS PHASE IS NOT OPTIONAL.** Visual analysis of screenshots cannot detect small alignment issues.

Run the alignment check script EVERY iteration:

```bash
# Check pixel-level alignment
node scripts/alignment-check.js --url="http://localhost:3000"

# With custom tolerance (default is 2px)
node scripts/alignment-check.js --url="http://localhost:3000" --tolerance=2

# Save detailed report
node scripts/alignment-check.js --url="http://localhost:3000" --output="alignment-report.json"
```

The script checks:
- **Navigation alignment**: Do tabs/nav items align with sidebar content?
- **Content positioning**: Does content start after sidebar ends (no overlap)?
- **Grid consistency**: Do major elements align to common left edges?
- **Redundancy**: Are there duplicate navigation items visible?
- **Sidebar context**: Is sidebar showing only current page (should be hidden)?
- **Vertical spacing**: Is spacing consistent between sections?

### Interpreting Results

The script reports issues by severity:
- **CRITICAL**: Must be fixed immediately (blocks release)
- **MAJOR**: Should be fixed (significant UX problem)
- **MINOR**: Polish issues (inconsistencies)

**If the alignment check reports ANY critical or major issues, you MUST fix them before visual analysis declares the design "complete".**

### Common Alignment Fixes

1. **Nav tabs misaligned with sidebar**: Adjust `.md-tabs__inner` padding-left or sidebar margin
2. **Redundant sidebar on simple pages**: Use CSS `:has()` selector to hide sidebar when it only contains current page
3. **Content overlapping sidebar**: Increase content margin-left or reduce sidebar width
4. **Inconsistent grid alignment**: Standardise padding/margin values across components

---

## Phase 3: Visual Analysis Protocol

When analysing a screenshot, examine these aspects IN ORDER:

### Layer 1: Accessibility (must be 100%)
- Contrast: Can all text be read clearly?
- Focus indicators: Are interactive elements obvious?
- Touch targets: Are buttons/links large enough?

### Layer 2: Structural Integrity (must be 90%)
- Layout: Any broken layouts, overlaps, or overflow?
- Alignment: Do elements align to a visible grid?
- Spacing: Is spacing consistent throughout?

### Layer 3: Visual Hierarchy (must be 90%)
- What draws the eye first? Is that correct?
- Can you identify primary, secondary, tertiary content?
- Is typography hierarchy clear (headings vs body)?

### Layer 4: Interaction Design (must be 85%)
- Do interactive elements look interactive?
- Are states visually distinct (hover, active, disabled)?
- Is feedback visible?

### Layer 5: Emotional Design (must be 80%)
- Does it have a cohesive aesthetic?
- Is there visual harmony?
- Would you be proud to show this?

**Consult reference files for detailed criteria:**
- `references/visual-principles.md` — Rams, Jobs, Ive
- `references/nielsen-heuristics.md` — 10 usability heuristics
- `references/typography-spacing.md` — Type and spacing systems
- `references/interaction-patterns.md` — States and feedback
- `references/accessibility.md` — WCAG 2.1 AA

---

## Phase 4: Issue Cataloguing

After visual analysis, document ALL issues found:

```markdown
## Issues Found — Iteration N

### Critical (blocks release)
1. [ISSUE]: Low contrast on primary button text
   [LAYER]: Accessibility
   [PRINCIPLE]: WCAG 1.4.3 Contrast
   [FIX]: Change button text to #FFFFFF, background to #1D4ED8

### Major (significant problem)
2. [ISSUE]: Hero section typography lacks hierarchy
   [LAYER]: Visual Hierarchy
   [PRINCIPLE]: Typographic scale
   [FIX]: Increase heading size to 48px, reduce body to 18px

### Minor (polish issues)
3. [ISSUE]: Card spacing inconsistent (16px vs 24px)
   [LAYER]: Structure
   [PRINCIPLE]: Spacing system
   [FIX]: Standardise all card padding to 24px

### Enhancement (nice to have)
4. [ISSUE]: No hover animation on cards
   [LAYER]: Interaction
   [PRINCIPLE]: Micro-interaction feedback
   [FIX]: Add subtle scale(1.02) on hover with 200ms ease
```

---

## Phase 5: Fix and Re-capture

### Fix Priority Order
1. ALL Critical issues first
2. ALL Major issues second
3. ALL Minor issues third
4. Enhancements only if time permits

### After Each Fix

```bash
# Re-capture screenshot immediately after code change
node scripts/capture.js --url="http://localhost:3000" --output="screenshots/iteration-$(date +%s).png"
```

**VISUALLY VERIFY the fix worked.** Compare the new screenshot to previous. If the issue persists or introduced new issues, continue fixing.

---

## Phase 6: Loop Termination Criteria

### Default mode (no flags)

The loop terminates when ALL of the following are true:

```
[ ] Screenshot shows ZERO Critical issues
[ ] Screenshot shows ZERO Major issues
[ ] alignment-check.js reports ZERO Critical issues
[ ] alignment-check.js reports ZERO Major issues
[ ] alignment-check.js LAYER THRESHOLD SUMMARY shows all layers PASS
[ ] inspect-dom.js LAYER THRESHOLD SUMMARY shows all layers PASS
[ ] DOM inspection confirms no accessibility violations
[ ] Code analysis confirms no regressions
[ ] Iteration count ≤ --max-iterations (default: 10)
```

Minor issues are **reported in the final report** but do NOT block completion.

### Strict mode (`--strict`)

When invoked with `--strict`, the loop additionally requires:

```
[ ] Screenshot shows ZERO Minor issues
```

Use `--strict` for projects that demand pixel-perfect polish on every detail.

### Max iterations

The loop MUST NOT exceed `--max-iterations` (default: 10). When the cap is reached:

```
⚠️  WARNING: Max iterations reached (10/10).
    The following issues remain unresolved:
    - [list of remaining Critical/Major/Minor issues]
    Manual review is required to continue.
```

The loop exits and produces the Design QA Report with the current state. This prevents infinite iteration loops.

**If ANY of the above fail (except Minor in default mode), CONTINUE THE LOOP.**

### Alignment Check Must Pass

**CRITICAL:** The alignment-check.js script MUST report "PASS" before the loop can terminate. Do not rely solely on visual inspection of screenshots—pixel-level measurement is the source of truth for alignment issues.

### Layer Threshold Checks

Both `alignment-check.js` and `inspect-dom.js` now output a **LAYER THRESHOLD SUMMARY** section that maps findings to the five analysis layers and prints PASS/FAIL per layer:

```
============================================================
LAYER THRESHOLD SUMMARY
============================================================

   ✅ PASS  Accessibility (threshold: 100%)
   ❌ FAIL  Structure (threshold: 90%) — alignmentIssues: 2
   ✅ PASS  Hierarchy (threshold: 90%)
   ✅ PASS  Interaction (threshold: 85%)
   ✅ PASS  Emotion (threshold: 80%)
```

Use this output to make a **deterministic decision** about whether to continue the loop. If any layer shows FAIL, the loop must continue (unless only Minor issues remain in default mode).

---

## Phase 7: Final Validation

When loop termination criteria met:

1. **Run final alignment checks at multiple viewports:**
   ```bash
   # Desktop alignment check
   node scripts/alignment-check.js --url="http://localhost:3000" --width=1440 --height=900 --output="reports/alignment-desktop.json"

   # Tablet alignment check
   node scripts/alignment-check.js --url="http://localhost:3000" --width=768 --height=1024 --output="reports/alignment-tablet.json"

   # Mobile alignment check
   node scripts/alignment-check.js --url="http://localhost:3000" --width=390 --height=844 --output="reports/alignment-mobile.json"
   ```

2. **Take final screenshots at multiple viewports:**
   ```bash
   node scripts/capture.js --url="http://localhost:3000" --output="screenshots/final-desktop.png" --width=1440 --height=900
   node scripts/capture.js --url="http://localhost:3000" --output="screenshots/final-tablet.png" --width=768 --height=1024
   node scripts/capture.js --url="http://localhost:3000" --output="screenshots/final-mobile.png" --width=390 --height=844
   ```

3. **Run DOM inspection:**
   ```bash
   node scripts/inspect-dom.js --url="http://localhost:3000" --output="reports/dom-inspection.json"
   ```

4. **Run automated accessibility check:**
   ```bash
   npx axe-core-cli http://localhost:3000
   ```

5. **Generate Design QA Report** (see format below)

---

## Design QA Report Format

```markdown
# Design QA Report

**Interface**: [Component/Page name]
**URL**: [Local or deployed URL]
**Date**: [Timestamp]
**Iterations**: [Number of loops completed]
**Verdict**: PASS ✓

## Summary
[2-3 sentence assessment of final state]

## Final Screenshots
- Desktop (1440px): screenshots/final-desktop.png
- Tablet (768px): screenshots/final-tablet.png
- Mobile (390px): screenshots/final-mobile.png

## Alignment Verification Results
| Viewport | Status | Issues |
|----------|--------|--------|
| Desktop (1440px) | ✓ PASS | 0 issues |
| Tablet (768px) | ✓ PASS | 0 issues |
| Mobile (390px) | ✓ PASS | 0 issues |

### Key Measurements (Desktop)
- Navigation first item left edge: Xpx
- Sidebar first link left edge: Xpx
- Alignment offset: 0px (within tolerance)

## Layer Scores
| Layer | Score | Notes |
|-------|-------|-------|
| Accessibility | 100/100 | All WCAG 2.1 AA criteria met |
| Structure | 95/100 | Clean grid alignment |
| Alignment | 100/100 | All elements within 2px tolerance |
| Hierarchy | 92/100 | Clear visual hierarchy |
| Interaction | 90/100 | All states implemented |
| Emotional | 88/100 | Cohesive, professional feel |

## Issues Resolved (Total: N)

### Alignment Issues Fixed
- [List alignment issues found by alignment-check.js and how they were fixed]

### Visual Issues Fixed
- [List visual issues found by screenshot analysis and how they were fixed]

### Redundancy Issues Fixed
- [List redundant elements that were hidden/removed]

## Iteration History
- Iteration 1: 12 issues found (3 critical, 4 major, 5 minor)
  - alignment-check.js: 2 critical (nav misalignment, redundant sidebar)
  - visual analysis: 10 issues
- Iteration 2: 6 issues found (0 critical, 2 major, 4 minor)
- Iteration 3: 2 issues found (0 critical, 0 major, 2 minor)
- Iteration 4: 0 issues found — PASS

## Recommendations
[Any enhancements deferred for future work]
```

---

## Quick Commands

```bash
# Start QA loop on local dev
/design-qa http://localhost:3000

# Start QA on specific component
/design-qa http://localhost:3000/components/button

# Start QA on deployed preview
/design-qa https://preview.myapp.com

# Strict mode — also requires zero Minor issues before completion
/design-qa http://localhost:3000 --strict

# Limit iterations (default: 10)
/design-qa http://localhost:3000 --max-iterations=5
```

---

## The Perfectionist Mindset

Apply these tests during visual analysis:

**The Squint Test**: Squint at screenshot. Does hierarchy still work? Do the right things pop?

**The Newspaper Test**: If this shipped tomorrow in a design publication, proud or embarrassed?

**The Mother Test**: Could a non-technical parent use this without help?

**The Removal Test**: For every element: "What breaks if removed?" If nothing, remove it.

**The 5-Second Test**: In 5 seconds, can user identify: what this is, what they can do, why they should care?

---

## Reference Files

Consult these during analysis:

- **`references/visual-principles.md`**: Jobs/Ive/Rams philosophy, composition, colour
- **`references/nielsen-heuristics.md`**: 10 usability heuristics with checklist
- **`references/typography-spacing.md`**: Type scales, spacing, alignment
- **`references/interaction-patterns.md`**: States, transitions, feedback
- **`references/accessibility.md`**: WCAG 2.1 AA, ARIA, keyboard nav

---

## Why Pixel-Level Measurement is Essential

### The Problem with Visual-Only Analysis

When screenshots are displayed in a conversation interface, they are typically:
- Rendered as thumbnails (often 50-70% of actual size)
- Compressed for transmission
- Displayed on screens with varying pixel densities

This makes it **impossible** to detect:
- 5-20px alignment offsets between navigation and content
- Subtle padding/margin inconsistencies
- Elements that are slightly off-grid

### Real-World Example: The MkDocs Alignment Failure

In a real QA session, visual analysis declared a MkDocs site "complete" with no issues. However, pixel measurement revealed:

```
Navigation first tab: left = 76px
Sidebar first link:   left = 60px
Offset:               16px (CRITICAL)
```

This 16px misalignment was invisible in the thumbnail screenshot but was glaringly obvious to users viewing the full-size page.

### The Solution: Always Measure

1. **Always run alignment-check.js** before declaring visual analysis complete
2. **Trust the numbers** over visual impression of screenshots
3. **Use 2px tolerance** as the standard (anything larger is noticeable)
4. **Check redundancy** - sidebar showing only current page is a UX smell

### Redundancy Detection

Another class of issues visual analysis misses: **redundant UI elements**.

Example: A sidebar showing "Home" when you're already on the Home page adds visual clutter without value. The fix is to hide the sidebar entirely when it only contains the current page link:

```css
/* Hide sidebar when it only contains current page link */
.md-sidebar--primary:has(.md-nav__list > .md-nav__item:only-child:not(.md-nav__item--nested)) {
  display: none;
}
```

The alignment-check.js script detects this condition automatically.

---

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `capture.js` | Take screenshots | Every iteration, start of loop |
| `alignment-check.js` | Pixel-level position measurement | Every iteration, after screenshot |
| `inspect-dom.js` | Typography, contrast, accessibility | Every iteration, with alignment check |

### Required Script Execution Order

```bash
# 1. Capture screenshot
node scripts/capture.js --url="http://localhost:3000" --output="screenshots/iteration-N.png"

# 2. Run alignment check (MANDATORY)
node scripts/alignment-check.js --url="http://localhost:3000"

# 3. Run DOM inspection
node scripts/inspect-dom.js --url="http://localhost:3000"

# 4. Visual analysis of screenshot (only AFTER measurement scripts pass)
```

**Never skip step 2.** Pixel measurement is the source of truth for layout issues.

# Nielsen's 10 Usability Heuristics

Jakob Nielsen's heuristics are the foundation of usability inspection. Each heuristic below includes the principle, inspection criteria, common violations, and fixes.

---

## 1. Visibility of System Status

> The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time.

**Inspection Checklist:**
- [ ] Current location is always clear (breadcrumbs, nav highlighting, page title)
- [ ] Actions provide immediate feedback (button states, loading indicators)
- [ ] Progress indicators for operations > 1 second
- [ ] Form validation feedback is immediate, not on submit
- [ ] Background processes have visible status

**Common Violations:**
- No loading state — user clicks, nothing happens
- No confirmation after action completes
- Silent failures — operation fails but UI unchanged
- "Submitted" with no indication of what happens next

**Severity Guide:**
- No feedback on action → Critical
- Delayed feedback (> 1s) → Major
- Feedback present but unclear → Minor

**Inspection Method:**
1. Click every interactive element
2. Count seconds until visual feedback
3. Check: Does feedback match expectation?

---

## 2. Match Between System and Real World

> The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.

**Inspection Checklist:**
- [ ] Terminology matches user mental model
- [ ] Icons are universally understood (or labelled)
- [ ] Metaphors are consistent and intuitive
- [ ] Data formats match user expectations (dates, currency, etc.)
- [ ] Actions named by user goal, not system operation

**Common Violations:**
- Technical jargon ("Instantiate", "Null reference error")
- Ambiguous icons without labels
- Internal product names users wouldn't know
- Developer-centric error messages

**Example Fixes:**
- "Session expired" → "You've been signed out. Please sign in again."
- "HTTP 500" → "Something went wrong on our end. We're looking into it."
- "Sync" icon alone → "Sync" icon + "Sync" label

**Inspection Method:**
1. Read all text aloud
2. Would a non-technical user understand?
3. Show to someone unfamiliar — can they explain what each element does?

---

## 3. User Control and Freedom

> Users often perform actions by mistake. They need a clearly marked "emergency exit" to leave the unwanted action without going through an extended process.

**Inspection Checklist:**
- [ ] Undo is available for destructive actions
- [ ] Cancel button present in all dialogs/flows
- [ ] Easy way to return to previous state
- [ ] No forced sequences without escape
- [ ] Confirmation before irreversible actions

**Common Violations:**
- Delete with no undo
- Multi-step wizard with no back button
- Modal with no close button or escape key
- Auto-advancing flows user cannot pause
- "Are you sure?" without describing consequences

**Severity Guide:**
- No escape from destructive action → Critical
- Escape exists but hard to find → Major
- Escape clear but requires many steps → Minor

**Inspection Method:**
1. Start every possible action
2. Attempt to cancel/undo immediately
3. Check: How easy is recovery?

---

## 4. Consistency and Standards

> Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.

**Inspection Checklist:**
- [ ] Same action, same appearance everywhere
- [ ] Same terminology for same concepts
- [ ] Platform conventions respected (e.g., cmd+S to save on Mac)
- [ ] Visual styling consistent (colours, spacing, type)
- [ ] Interaction patterns predictable

**Common Violations:**
- "Submit" vs "Send" vs "Confirm" for same action
- Links sometimes blue, sometimes green
- Icons meaning different things in different contexts
- Non-standard keyboard shortcuts
- Varying button styles for same-level actions

**Inspection Method:**
```javascript
// Audit all button text
[...document.querySelectorAll('button')].map(b => b.textContent.trim());
```
Check for synonyms that should be unified.

**The Standard Test:**
- Would a user from competitor product know how to use this?
- Would a user coming back after 6 months remember how this works?

---

## 5. Error Prevention

> Good error messages are important, but the best designs carefully prevent problems from occurring in the first place.

**Inspection Checklist:**
- [ ] Destructive actions require confirmation
- [ ] Input constraints communicated before error
- [ ] Smart defaults reduce user decisions
- [ ] Slips prevented through design (not just warnings)
- [ ] High-stakes actions have extra friction

**Common Violations:**
- "Invalid email" after user types — instead of preventing
- Required fields not marked until submission
- Dangerous buttons near safe buttons (Delete next to Save)
- No confirmation before sending/publishing/deleting
- Allow nonsense input, then reject on submit

**Error Prevention Hierarchy (prefer top to bottom):**
1. **Eliminate** — Remove the possibility of error
2. **Replace** — Change error-prone design
3. **Prevent** — Add constraints that make errors impossible
4. **Warn** — Alert before error occurs
5. **Detect** — Catch errors immediately after
6. **Report** — Explain error clearly (last resort)

**Inspection Method:**
1. For every form, try to submit invalid data
2. At what point is the error caught?
3. How could it be caught earlier?

---

## 6. Recognition Rather Than Recall

> Minimize the user's memory load by making elements, actions, and options visible. Instructions for use should be visible or easily retrievable.

**Inspection Checklist:**
- [ ] Options visible, not hidden in menus
- [ ] Previous inputs remembered appropriately
- [ ] Context maintained across screens
- [ ] Help/hints available inline, not separate
- [ ] Common actions don't require remembering shortcuts

**Common Violations:**
- Reference IDs shown instead of names
- "Click the icon we showed you earlier"
- Search required to find common actions
- Multi-step flows that don't show progress
- Settings remembered nowhere, entered repeatedly

**Recognition vs Recall Examples:**
| Recall (Bad) | Recognition (Good) |
|--------------|-------------------|
| Type product code | Select from dropdown |
| Remember keyboard shortcut | Visible menu item with shortcut hint |
| "Enter your previous value" | "Your last value was X" |

**Inspection Method:**
1. Close eyes, then open — can you understand the screen immediately?
2. Navigate away and back — is context preserved?
3. Can new users accomplish tasks without training?

---

## 7. Flexibility and Efficiency of Use

> Shortcuts — hidden from novice users — can speed up interaction for expert users. Allow users to tailor frequent actions.

**Inspection Checklist:**
- [ ] Keyboard shortcuts for power users
- [ ] Customisable interface elements
- [ ] Bulk actions available
- [ ] Recent/frequent items accessible
- [ ] Multiple paths to same goal

**Common Violations:**
- No keyboard navigation
- Every action requires full flow (no shortcuts)
- No way to save preferences
- Power users forced through novice flows
- Single rigid path for all users

**The Two-Path Test:**
- Can a novice complete the task? (guided path)
- Can an expert complete it faster? (efficient path)
- Both should exist.

**Inspection Method:**
1. Complete task the "normal" way — count clicks
2. Look for faster alternative — does it exist?
3. Tab through interface — is keyboard navigation logical?

---

## 8. Aesthetic and Minimalist Design

> Interfaces should not contain information which is irrelevant or rarely needed. Every extra unit of information competes with relevant units.

**Inspection Checklist:**
- [ ] Only essential information visible
- [ ] Progressive disclosure for advanced options
- [ ] Visual noise minimised
- [ ] Whitespace used effectively
- [ ] Decorative elements earn their place

**Common Violations:**
- All options shown at once
- "Helpful" tips that clutter
- Decorative imagery that adds no meaning
- Dense layouts with no visual breathing room
- Features shown that 95% of users never use

**The Subtraction Test:**
For every element, ask:
1. What happens if I remove this?
2. If nothing breaks, consider removing it
3. If something breaks, is it essential?

**Signal-to-Noise Ratio:**
- Signal: Information user needs to accomplish goal
- Noise: Everything else
- Goal: Maximise ratio

---

## 9. Help Users Recognise, Diagnose, and Recover from Errors

> Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.

**Inspection Checklist:**
- [ ] Error messages in plain language
- [ ] Error states visually distinct but not alarming
- [ ] Messages indicate problem specifically
- [ ] Messages suggest solution
- [ ] Recovery path is clear

**Error Message Formula:**
1. **What happened** (plain language)
2. **Why it happened** (if helpful)
3. **How to fix it** (actionable)

**Examples:**
| Bad | Good |
|-----|------|
| "Error 422" | "That email is already registered" |
| "Invalid input" | "Password must be at least 8 characters" |
| "Failed" | "Payment declined. Please check your card details or try a different card." |

**Inspection Method:**
1. Trigger every possible error state
2. For each: Is the message clear? Actionable? Recoverable?

---

## 10. Help and Documentation

> It's best if the design doesn't need documentation. But if help is needed, it should be easy to search, focused on tasks, list concrete steps, and not be too large.

**Inspection Checklist:**
- [ ] Interface learnable without documentation
- [ ] Help available in context (tooltips, hints)
- [ ] Searchable documentation if needed
- [ ] Task-oriented, not feature-oriented
- [ ] Concise — not walls of text

**Common Violations:**
- "See FAQ" for everything
- Documentation buried or separate
- Help written from system perspective, not user perspective
- No contextual help — full manual or nothing
- Outdated documentation

**The No-Help Test:**
If help documentation disappeared, could users:
1. Complete basic tasks?
2. Discover features?
3. Recover from errors?

If yes — documentation is supplement, not crutch. Good.
If no — interface too complex or unclear. Fix the interface.

---

## Heuristic Scoring Guide

For each heuristic, score 0-10:

| Score | Meaning |
|-------|---------|
| 0-3 | Critical violations, unusable |
| 4-5 | Major violations, frustrating |
| 6-7 | Minor violations, workable |
| 8-9 | Good, small improvements possible |
| 10 | Excellent, no violations found |

**Minimum passing score**: 7 average across all heuristics
**Target score**: 8+ average

**Critical requirement**: No heuristic below 5 (single critical failure fails entire review)

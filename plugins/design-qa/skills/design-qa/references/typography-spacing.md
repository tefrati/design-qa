# Typography and Spacing Systems

Typography is the foundation of interface design. Spacing is the silence between notes that makes music. This reference provides inspection criteria for both.

---

## Typography Inspection

### The Type Hierarchy Audit

Every interface needs a clear type hierarchy. Inspect for these levels:

| Level | Typical Use | Inspection Question |
|-------|-------------|---------------------|
| Display | Hero headlines, marketing | Is there only one per view? |
| H1 | Page title | Is there exactly one per page? |
| H2 | Section headers | Do they create clear sections? |
| H3 | Subsection headers | Are they visually distinct from H2? |
| Body | Primary content | Is it comfortable to read? |
| Caption | Secondary info, labels | Is it clearly subordinate? |
| Legal/Fine | Terms, disclaimers | Is it readable but unobtrusive? |

**Inspection Checklist:**
- [ ] Each level is visually distinct from adjacent levels
- [ ] Hierarchy is maintained through size, weight, AND colour
- [ ] No more than 4-5 active type sizes on any screen
- [ ] Heading levels not skipped (no H1 → H3)

### Font Selection Criteria

**For Body Text:**
- [ ] High x-height for readability at small sizes
- [ ] Open counters (a, e, g, s legible)
- [ ] Comfortable weight (not too thin, not too heavy)
- [ ] Good digit design if numbers are common

**For Headlines:**
- [ ] Distinctive character (memorable, ownable)
- [ ] Works at large sizes
- [ ] Complements (not matches) body font

**Font Pairing Test:**
- Do fonts share similar proportions (x-height, width)?
- Do they contrast in character (serif + sans, geometric + humanist)?
- Is there too much similarity (hard to distinguish)?
- Is there too much contrast (visual chaos)?

### Readability Metrics

**Line Length (Measure):**
- Optimal: 45-75 characters per line
- Mobile: 35-50 characters per line
- Never: Over 90 characters (exhausting) or under 25 (choppy)

**Inspection Method:**
```javascript
// Check line length
const p = document.querySelector('p');
const text = p.textContent;
const lineHeight = parseInt(getComputedStyle(p).lineHeight);
const height = p.offsetHeight;
const lines = height / lineHeight;
const avgCharsPerLine = text.length / lines;
console.log('Avg chars per line:', avgCharsPerLine);
```

**Line Height (Leading):**
- Body text: 1.4-1.6 × font size
- Headlines: 1.1-1.3 × font size
- Captions: 1.3-1.5 × font size

**Test**: Can you easily track from end of one line to start of next?

**Letter Spacing (Tracking):**
- Body text: Default (0) or very subtle adjustment
- ALL CAPS: Increase tracking 5-10% (required)
- Large headlines: May need slight negative tracking

### Font Rendering

**Inspection Checklist:**
- [ ] Font weights load correctly (not faux bold)
- [ ] Italics render correctly (not faux oblique)
- [ ] No FOUT (flash of unstyled text) or FOIT (flash of invisible text)
- [ ] Subpixel rendering appropriate for display
- [ ] Consistent rendering across OS (or acceptable variation)

**Test Method:**
1. Hard refresh page
2. Watch for text flash/shift on load
3. If web fonts, check network tab for font load timing

---

## Spacing System

### The Spacing Scale

Use a consistent scale based on a base unit. Common systems:

**4px Base (Recommended):**
```
4   8   12   16   24   32   48   64   96   128
xs  sm  md   base lg   xl   2xl  3xl  4xl  5xl
```

**8px Base:**
```
8   16   24   32   48   64   96   128
xs  sm   md   lg   xl   2xl  3xl  4xl
```

**Inspection Checklist:**
- [ ] Spacing values come from a defined scale (not arbitrary)
- [ ] Same spacing used for same relationships throughout
- [ ] Scale has sufficient range (tight to spacious)
- [ ] Half-steps used sparingly, not as crutch

### Spacing Relationships

**Proximity Principle:** Related elements should be closer together than unrelated elements.

**Inspection Questions:**
- Are form labels closer to their fields than to other labels?
- Are list items closer to each other than to non-list content?
- Are card elements grouped by relationship?

**Containment Principle:** Padding should create breathing room without isolation.

**Common Values:**
- Tight containers (tags, pills): 4-8px padding
- Standard containers (cards, buttons): 12-16px padding
- Spacious containers (sections, heroes): 24-48px padding

### Margin vs Padding Audit

**Margin**: Space between elements (external)
**Padding**: Space within elements (internal)

**Inspection Checklist:**
- [ ] Margins collapse predictably (or use padding/gap instead)
- [ ] Padding consistent within component types
- [ ] First/last child margin not creating unwanted gaps
- [ ] Consistent approach: either margins-on-items or gap-on-container

**Inspection Script:**
```javascript
// Audit spacing on elements
document.querySelectorAll('.component-class').forEach(el => {
  const s = getComputedStyle(el);
  console.log({
    margin: s.margin,
    padding: s.padding,
    gap: s.gap
  });
});
```

---

## Alignment and Grids

### The Alignment Audit

**Primary Question:** What is the alignment strategy?

| Strategy | When to Use | Check For |
|----------|-------------|-----------|
| Left-align | Body text, most interfaces | Consistent left edge |
| Centre-align | Headlines, heroes, single elements | True optical centre |
| Right-align | Numbers in tables, secondary actions | Consistent right edge |
| Justify | Long-form content (rarely) | No rivers, good hyphenation |

**Inspection Checklist:**
- [ ] Every element's alignment is intentional
- [ ] Related elements share the same alignment axis
- [ ] Mixed alignment creates tension (if so, intentional?)
- [ ] Text alignment matches reading direction

### Grid Inspection

**Questions to Answer:**
1. What column system is in use? (12-col? 8-col? Freeform?)
2. What are the gutter widths?
3. What are the margin widths (outer)?
4. Are breakpoints consistent?

**Inspection Script:**
```javascript
// Visual grid overlay
const style = document.createElement('style');
style.textContent = `
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
      90deg,
      rgba(255,0,0,0.05) 0,
      rgba(255,0,0,0.05) calc((100% - 11 * 24px) / 12),
      transparent calc((100% - 11 * 24px) / 12),
      transparent calc((100% - 11 * 24px) / 12 + 24px)
    );
  }
`;
document.head.appendChild(style);
```

### Optical Alignment vs Mathematical Alignment

Some shapes require optical adjustment:

- **Circles/Rounds**: Extend slightly beyond square bounding box
- **Triangles/Points**: Extend significantly beyond
- **Text baselines**: Align on baseline, not bounding box
- **Icons**: May need visual weight adjustment

**Test**: Does it *look* aligned, not just measure aligned?

---

## Responsive Typography

### Fluid Type Scale

Type size should scale between breakpoints, not jump.

**Inspection Checklist:**
- [ ] Type sizes respond to viewport width
- [ ] Scale feels proportional at all sizes
- [ ] Line lengths stay within readable range
- [ ] Hierarchy maintained at all breakpoints

### Breakpoint Behaviour

| Viewport | Typical Adjustments |
|----------|---------------------|
| Mobile (<640px) | Tighter spacing, smaller type, stacked layouts |
| Tablet (640-1024px) | Moderate spacing, medium type, flexible layouts |
| Desktop (>1024px) | Generous spacing, larger type, full layouts |

**Inspection Method:**
1. Resize viewport continuously (not just snapping to breakpoints)
2. Watch for awkward in-between states
3. Text should never feel cramped or lost

---

## Common Typography Failures

### The Seven Deadly Sins

1. **Orphans and Widows**: Single words or lines alone at paragraph start/end
2. **Rivers**: Vertical gaps of whitespace running through justified text
3. **Rags**: Uneven right edges in left-aligned text (some ragging is fine)
4. **Stacked Hyphens**: Multiple consecutive lines ending with hyphens
5. **Insufficient Contrast**: Text too similar to background colour
6. **Mixing Scales**: Font sizes that don't come from a system
7. **Font Soup**: Too many typefaces (max 2-3)

### Quick Fixes

| Problem | Fix |
|---------|-----|
| Orphan | Add soft break or rewrite |
| River | Adjust tracking, column width, or don't justify |
| Bad rag | Manual soft breaks at natural phrase breaks |
| Stacked hyphens | Adjust hyphenation settings or rewrite |
| Low contrast | Increase weight, size, or colour difference |
| Mixed scales | Audit and consolidate to defined scale |
| Font soup | Pick 2 fonts, use weight/size for variation |

---

## Spacing Quality Checklist

Final inspection for spacing excellence:

- [ ] Can identify the spacing scale in use
- [ ] No "magic numbers" (arbitrary pixel values)
- [ ] Consistent rhythm vertically
- [ ] Consistent rhythm horizontally
- [ ] Breathing room around content
- [ ] No elements touching edges unexpectedly
- [ ] Empty states have balanced spacing
- [ ] Responsive spacing feels proportional, not just smaller

# Accessibility Requirements

Accessibility is not optional. It is the foundation upon which all other design quality rests. An interface that fails accessibility fails everyone.

---

## WCAG 2.1 Level AA Requirements

WCAG is organised around four principles: **Perceivable**, **Operable**, **Understandable**, **Robust** (POUR).

### Perceivable

> Information and UI components must be presentable to users in ways they can perceive.

#### 1.1 Text Alternatives

**Inspection Checklist:**
- [ ] All images have alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have extended descriptions
- [ ] Icons have accessible names

**Inspection Script:**
```javascript
// Find images without alt
document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('alt')) {
    console.error('Missing alt:', img.src);
  }
});
```

#### 1.3 Adaptable

**Inspection Checklist:**
- [ ] Semantic HTML used (headings, lists, tables, forms)
- [ ] Reading order matches visual order
- [ ] Content meaning not lost without CSS
- [ ] Form labels associated with inputs

**Test:** Disable CSS — is content still understandable?

#### 1.4 Distinguishable

**Colour Contrast (Critical):**

| Content Type | Minimum Ratio | Enhanced Ratio |
|--------------|---------------|----------------|
| Body text | 4.5:1 | 7:1 |
| Large text (18px+, or 14px bold) | 3:1 | 4.5:1 |
| UI components, icons | 3:1 | 4.5:1 |
| Focus indicators | 3:1 | N/A |

**Inspection Script:**
```javascript
// Check contrast (simplified - use a proper tool for accuracy)
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
// Use browser devtools contrast checker for accurate results
```

**Other 1.4 Requirements:**
- [ ] Text resizable to 200% without loss
- [ ] No horizontal scroll at 320px width
- [ ] Colour not sole means of conveying information
- [ ] Audio controls available if auto-play

### Operable

> UI components and navigation must be operable.

#### 2.1 Keyboard Accessible

**Critical Requirement:** Everything possible with mouse must be possible with keyboard.

**Inspection Method:**
1. Set mouse aside
2. Press Tab repeatedly through entire page
3. Verify: Can you reach every interactive element?
4. Verify: Can you activate every element (Enter/Space)?
5. Verify: Can you escape from any component (Escape)?

**Checklist:**
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Custom components have keyboard support
- [ ] Skip link available for main content

**Common Keyboard Traps:**
- Modals without Escape close
- Date pickers that capture Tab
- Infinite scroll with no Skip option
- Carousels with no keyboard controls

#### 2.2 Enough Time

- [ ] Time limits adjustable or extendable
- [ ] Auto-updating content can be paused
- [ ] No content blinks more than 3 times per second

#### 2.3 Seizures

- [ ] No flashing content (more than 3 flashes per second)
- [ ] Red flashes especially avoided

#### 2.4 Navigable

**Inspection Checklist:**
- [ ] Page titles descriptive and unique
- [ ] Focus order matches logical order
- [ ] Link purpose clear from link text
- [ ] Multiple ways to find pages (nav, search, sitemap)
- [ ] Headings describe content
- [ ] Focus indicator visible

**Heading Structure Test:**
```javascript
// Show heading structure
document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
  console.log(h.tagName, h.textContent.trim().substring(0, 50));
});
```

**Expected:** Headings form logical outline, no levels skipped.

#### 2.5 Input Modalities

- [ ] Touch targets minimum 44x44px
- [ ] Motion-activated functions have alternatives
- [ ] Label in name matches accessible name

### Understandable

> Information and UI operation must be understandable.

#### 3.1 Readable

- [ ] Page language declared (`<html lang="en">`)
- [ ] Language changes marked (e.g., `<span lang="fr">`)

#### 3.2 Predictable

- [ ] Navigation consistent across pages
- [ ] Components behave consistently
- [ ] Focus change doesn't trigger unexpected context change

#### 3.3 Input Assistance

- [ ] Error identification: errors clearly identified
- [ ] Labels or instructions: forms have clear labels
- [ ] Error suggestion: help provided to fix errors
- [ ] Error prevention: confirm before submit on important actions

### Robust

> Content must be robust enough to be interpreted by wide variety of user agents.

#### 4.1 Compatible

- [ ] Valid HTML (no parsing errors)
- [ ] Name, role, value available for all components
- [ ] Status messages announced to assistive technology

**Validation:**
```bash
# Use W3C validator or axe-core
npx axe-core-cli <url>
```

---

## ARIA Requirements

### When to Use ARIA

> "No ARIA is better than bad ARIA."

**Rule:** Use semantic HTML first. ARIA only when HTML cannot express the semantics.

| Instead of... | Use... |
|---------------|--------|
| `<div role="button">` | `<button>` |
| `<span role="link">` | `<a href>` |
| `<div role="checkbox">` | `<input type="checkbox">` |
| `<div role="navigation">` | `<nav>` |

### Essential ARIA Patterns

**Buttons that aren't `<button>`:**
```html
<div role="button" tabindex="0" aria-pressed="false">Toggle</div>
```
Must handle: Enter, Space, and focus.

**Custom Checkboxes:**
```html
<div role="checkbox" tabindex="0" aria-checked="false">Option</div>
```
Must handle: Space to toggle.

**Dialogs/Modals:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Title</h2>
</div>
```
Must handle: Focus trap, Escape to close.

**Live Regions:**
```html
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content announced to screen readers -->
</div>
```

### ARIA Inspection

**Find Elements with ARIA:**
```javascript
document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]')
  .forEach(el => console.log(el, el.getAttribute('role'), el.getAttribute('aria-label')));
```

**Common ARIA Errors:**
- `role="button"` but not keyboard accessible
- `aria-hidden="true"` on focusable elements
- Missing `aria-expanded` on disclosure toggles
- Missing `aria-controls` pointing to wrong ID
- `aria-label` that duplicates visible text

---

## Screen Reader Testing

### Quick Screen Reader Checks

**On Mac (VoiceOver):**
1. Cmd + F5 to enable
2. Ctrl + Option + Right Arrow to navigate
3. Listen: Is content announced correctly?

**Key Questions:**
- Are images described?
- Are headings announced with level?
- Are buttons announced as buttons?
- Are form fields labelled?
- Are errors announced?

### Common Screen Reader Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Unlabelled button | "Button" with no name | Add text or aria-label |
| Missing alt text | Image skipped or filename read | Add meaningful alt |
| Wrong heading level | "Heading level 6" for major section | Use appropriate level |
| Unlabelled form field | "Edit text" with no context | Associate label with input |
| Link text "click here" | "Link: click here" (useless) | Use descriptive link text |

---

## Focus Management

### Focus Requirements

**Visible Focus:**
- [ ] Every focusable element has visible focus indicator
- [ ] Focus indicator has 3:1 contrast ratio
- [ ] Focus indicator at least 2px visible area

**Focus Order:**
- [ ] Matches visual reading order (left-to-right, top-to-bottom)
- [ ] Logical, not random
- [ ] Doesn't jump unexpectedly

### Modal Focus Management

When modal opens:
1. Focus moves to modal (typically close button or first focusable)
2. Focus trapped within modal (Tab cycles inside)
3. Background content inert (`aria-hidden`, `inert`, or `tabindex="-1"`)

When modal closes:
1. Focus returns to trigger element
2. Background content restored

**Test:**
1. Open modal
2. Tab — can you reach elements behind modal?
3. Press Escape — does focus return to trigger?

### Skip Links

**Requirement:** Provide skip link to bypass repetitive content.

```html
<a href="#main" class="skip-link">Skip to main content</a>
<!-- ... navigation ... -->
<main id="main" tabindex="-1">
```

**Test:** Tab from page load — is skip link first focusable element?

---

## Automated Testing Tools

### axe-core

Industry-standard automated checker. Catches ~30-40% of accessibility issues.

```javascript
// In browser console (after loading axe)
axe.run().then(results => {
  console.log('Violations:', results.violations);
});
```

### WAVE

Browser extension for visual accessibility audit.

### Lighthouse

Chrome DevTools > Lighthouse > Accessibility

**Important:** Automated tools find obvious issues. Manual testing still required.

---

## Accessibility Testing Protocol

### Automated First Pass

1. Run axe-core or Lighthouse
2. Fix all critical/serious violations
3. Review warnings for false positives

### Manual Testing

**Keyboard Navigation:**
- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus visible at all times
- [ ] No keyboard traps

**Screen Reader:**
- [ ] Content makes sense when read linearly
- [ ] Images described appropriately
- [ ] Form fields labelled
- [ ] Errors announced

**Visual:**
- [ ] Contrast ratios pass
- [ ] Page works at 200% zoom
- [ ] Page works at 320px width
- [ ] Colour not sole indicator

---

## Accessibility Severity Guide

| Severity | Definition | Examples |
|----------|------------|----------|
| Critical | Blocks access entirely | No keyboard access, missing form labels, contrast < 2:1 |
| Serious | Major barrier | Missing alt text, broken focus order, contrast < 4.5:1 |
| Moderate | Difficult to use | Unclear link text, missing skip link |
| Minor | Annoying but usable | Slightly low contrast, verbose alt text |

**Zero tolerance for Critical issues.** They must be fixed before shipping.

---

## Accessibility Quality Checklist

Final inspection for accessibility compliance:

- [ ] Page has valid HTML
- [ ] Page has `lang` attribute
- [ ] All images have appropriate alt text
- [ ] Colour contrast meets minimums (4.5:1 body, 3:1 large)
- [ ] All functionality keyboard accessible
- [ ] Focus indicator always visible
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Headings form logical structure
- [ ] Form fields have labels
- [ ] Errors are announced and actionable
- [ ] Touch targets are 44x44px minimum
- [ ] Reduced motion is respected
- [ ] Passes automated testing (axe, Lighthouse)

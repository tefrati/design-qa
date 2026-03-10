# Interaction Design Patterns

Every interface element has states. Every action needs feedback. Every transition should be purposeful. This reference covers the inspection criteria for interaction excellence.

---

## State Management

### The Complete State Audit

Interactive elements must handle ALL of these states:

| State | Description | Inspection Question |
|-------|-------------|---------------------|
| Default | Initial resting state | Is it recognisably interactive? |
| Hover | Mouse over (desktop) | Is change visible but not jarring? |
| Focus | Keyboard navigation | Is focus ring visible and clear? |
| Active | Being clicked/pressed | Is there tactile feedback? |
| Disabled | Not currently available | Is it clearly unavailable? |
| Loading | Action in progress | Is there progress indication? |
| Success | Action completed | Is completion confirmed? |
| Error | Action failed | Is failure explained? |
| Empty | No content/data | Is emptiness handled gracefully? |

**Inspection Method:**
1. Hover every interactive element — check hover state
2. Tab through entire interface — check focus states
3. Click and hold — check active states
4. Disable JavaScript — check disabled states appear
5. Trigger loading — check loading states
6. Force errors — check error states
7. Clear all data — check empty states

### State Visibility Requirements

**Hover State:**
- [ ] Visible change within 100ms
- [ ] Cursor changes appropriately (pointer, text, etc.)
- [ ] Contrast with default state is noticeable
- [ ] Doesn't block content underneath

**Focus State:**
- [ ] Visible focus indicator (not just browser default)
- [ ] Focus indicator has sufficient contrast (3:1 minimum)
- [ ] Focus order follows visual/logical order
- [ ] Focus never trapped (can tab away)

**Active State:**
- [ ] Visual feedback on press (scale, colour, shadow)
- [ ] Feels "pressed" or "clicked"
- [ ] Different from hover state

**Disabled State:**
- [ ] Reduced contrast (but still readable)
- [ ] Cursor indicates non-interactive (not-allowed or default)
- [ ] Tooltip explains why disabled (optional but helpful)
- [ ] Does NOT respond to hover/click

### Common State Failures

| Failure | Problem | Fix |
|---------|---------|-----|
| No hover state | User unsure if interactive | Add subtle hover effect |
| Invisible focus | Keyboard users lost | Add visible focus ring |
| Same hover/active | No click feedback | Differentiate active state |
| Disabled looks enabled | Users try to click | Reduce opacity, change cursor |
| No loading state | User double-clicks | Add spinner or progress |
| Generic error | User can't fix | Specific, actionable message |

---

## Micro-interactions

### The Feedback Loop

Every user action should complete a feedback loop:

```
User Action → System Feedback → Outcome Indication
```

**Inspection Questions:**
1. What feedback appears when user acts?
2. How quickly does it appear?
3. Does it confirm success or explain failure?

### Timing Guidelines

| Feedback Type | Timing | Example |
|---------------|--------|---------|
| Instant response | < 100ms | Button colour change |
| Perceived instant | 100-300ms | Dropdown opens |
| Noticeable delay | 300-1000ms | Requires loading indicator |
| Long process | > 1000ms | Requires progress bar |

**The 100ms Rule:** If feedback takes longer than 100ms, user notices delay. Add visual indication.

**The 1s Rule:** If operation takes longer than 1s, user wonders if it worked. Add explicit progress.

### Essential Micro-interactions

**Button Press:**
- Scale down slightly (transform: scale(0.98))
- Background darkens/lightens
- Returns to normal on release

**Link Click:**
- Colour change indicates visited (if appropriate)
- Loading state if navigation takes time

**Form Submit:**
- Button shows loading state
- Form fields disabled during submit
- Success or error feedback on completion

**Toggle/Switch:**
- Smooth transition between states
- Clear indication of current state
- Haptic feedback if on mobile (web can't do this)

**Checkbox/Radio:**
- Clear check/fill animation
- Click target includes label
- Indeterminate state if partially selected

### Animation Inspection

**Properties that should animate:**
- Opacity (fade in/out)
- Transform (move, scale, rotate)
- Background-color (state changes)
- Box-shadow (elevation changes)

**Properties that should NOT animate:**
- Width/height (causes reflow, janky)
- Margin/padding (causes reflow)
- Border (can be janky)
- Font-size (always janky)

**Inspection Script:**
```javascript
// Find elements with transitions
document.querySelectorAll('*').forEach(el => {
  const t = getComputedStyle(el).transition;
  if (t && t !== 'all 0s ease 0s' && t !== 'none') {
    console.log(el, t);
  }
});
```

---

## Transitions and Animations

### Purposeful Motion

Animation should serve one of these purposes:

| Purpose | Example |
|---------|---------|
| **Feedback** | Button press animation |
| **Orientation** | Page transition showing direction |
| **Continuity** | Modal sliding in from trigger point |
| **Hierarchy** | Staggered list items showing order |
| **Delight** | Playful success animation |

**If animation serves no purpose, remove it.**

### Animation Quality Checklist

- [ ] Uses appropriate easing (not linear for UI)
- [ ] Duration appropriate (150-300ms for UI, 300-500ms for larger moves)
- [ ] Respects prefers-reduced-motion
- [ ] Doesn't block interaction
- [ ] Can be interrupted if needed
- [ ] Consistent timing across similar interactions

### Easing Guide

| Easing | Use Case |
|--------|----------|
| `ease-out` | Elements entering (decelerate into place) |
| `ease-in` | Elements exiting (accelerate away) |
| `ease-in-out` | Elements moving position |
| `linear` | Almost never (feels robotic) |
| `cubic-bezier(...)` | Custom feel for brand motion |

**Inspection Question:** Does the motion feel natural or mechanical?

### Reduced Motion

**Critical Requirement:** Respect user preference for reduced motion.

**Inspection Method:**
```javascript
// Check if reduced motion is respected
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
console.log('Prefers reduced motion:', prefersReducedMotion.matches);
```

**Expected Behaviour:**
- Large animations disabled or instant
- Essential feedback still present (state changes)
- Transitions may shorten, not disappear entirely

---

## Loading Patterns

### Perceived Performance

Users perceive performance based on feedback, not actual speed.

| Technique | Effect |
|-----------|--------|
| Skeleton screens | Content feels "almost there" |
| Progressive loading | Something useful appears fast |
| Optimistic UI | Action feels instant (update before server confirms) |
| Preloading | Next likely action is already cached |

### Loading State Inspection

**Questions to Answer:**
1. What appears during load?
2. Does it indicate progress or just activity?
3. Is there useful content shown while loading?
4. What happens if loading fails?

**Loading Indicators:**

| Duration | Appropriate Indicator |
|----------|----------------------|
| < 300ms | Nothing (too quick) |
| 300ms - 1s | Subtle spinner on trigger |
| 1s - 3s | Visible spinner, disable interaction |
| > 3s | Progress bar with estimate |
| > 10s | Progress bar + explanation |

### Skeleton Screens

**Inspection Checklist:**
- [ ] Skeleton matches eventual content layout
- [ ] Subtle pulse/shimmer animation
- [ ] Content replaces skeleton smoothly (no jump)
- [ ] Text skeletons vary in length (not identical)

---

## Form Interactions

### Validation Timing

| When to Validate | Pros | Cons |
|------------------|------|------|
| On submit | User finishes naturally | All errors at once (overwhelming) |
| On blur | Immediate field feedback | Can feel premature |
| On change (debounced) | Real-time guidance | Can be distracting |

**Recommended Pattern:** Validate on blur, re-validate on change after first error.

### Input Feedback

**Inspection Checklist:**
- [ ] Required fields marked clearly
- [ ] Format hints shown before error
- [ ] Error messages appear near field, not top of form
- [ ] Error styling clear but not alarming
- [ ] Success state shown for valid input (optional)
- [ ] Character count for limited fields

### Focus Management

**After Form Submit:**
- Success: Move focus to success message or next action
- Error: Move focus to first error or error summary

**Test:** Submit form with errors. Does focus move to help user?

---

## Gesture and Touch Patterns

### Touch Target Sizes

**Minimum touch target:** 44x44px (Apple), 48x48dp (Material)

**Inspection Method:**
```javascript
// Find small touch targets
document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Small target:', el, rect.width, rect.height);
  }
});
```

### Touch Spacing

Adjacent touch targets need spacing to prevent mis-taps.

**Minimum spacing:** 8px between touch targets

### Common Touch Failures

| Failure | Problem | Fix |
|---------|---------|-----|
| Tiny buttons | Mis-taps | Increase to 44px minimum |
| Close targets | Wrong tap | Add spacing or merge |
| Hover-dependent | No hover on touch | Make function tap-accessible |
| Double-tap zoom | Unexpected zoom | Set viewport meta properly |

---

## Interaction Quality Checklist

Final inspection for interaction excellence:

- [ ] Every interactive element has all required states
- [ ] Focus is always visible and logical
- [ ] Feedback timing is appropriate (< 100ms or indicated)
- [ ] Animations serve a purpose
- [ ] Reduced motion is respected
- [ ] Loading states exist for async operations
- [ ] Error states are helpful
- [ ] Touch targets meet minimum size
- [ ] Forms validate at appropriate times
- [ ] Nothing feels broken or unfinished

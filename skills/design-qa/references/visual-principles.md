# Visual Design Principles

The philosophy of Jobs, Ive, and Rams distilled into actionable inspection criteria.

## Dieter Rams: Ten Principles of Good Design

Use these as a systematic checklist. Each principle includes inspection questions.

### 1. Good design is innovative
- Does the interface solve the problem in a fresh way?
- Are there novel interactions that improve upon conventions?
- **Red flag**: Copying patterns without understanding why they work

### 2. Good design makes a product useful
- Does every element serve a purpose?
- Can users accomplish their goals efficiently?
- **Red flag**: Decorative elements that add no function

### 3. Good design is aesthetic
- Is there visual harmony in colour, type, and spacing?
- Does the composition feel balanced?
- **Red flag**: Visual noise, competing focal points

### 4. Good design makes a product understandable
- Is the interface self-explanatory?
- Does the visual hierarchy guide users naturally?
- **Red flag**: Requiring instructions for basic actions

### 5. Good design is unobtrusive
- Does the interface stay out of the way?
- Is the content (not the chrome) the hero?
- **Red flag**: UI elements drawing attention from content

### 6. Good design is honest
- Does the interface accurately represent what it does?
- Are affordances clear (buttons look clickable, etc.)?
- **Red flag**: Skeuomorphism that misleads, dark patterns

### 7. Good design is long-lasting
- Does it avoid trendy elements that will date poorly?
- Is the design system sustainable for future iterations?
- **Red flag**: Gimmicks, effects for effect's sake

### 8. Good design is thorough down to the last detail
- Are micro-interactions considered?
- Do edge cases have proper states?
- **Red flag**: Polish on happy path but not error states

### 9. Good design is environmentally friendly
- (For digital: Is it performant? Does it respect user resources?)
- Are animations smooth but not excessive?
- **Red flag**: Heavy assets, excessive JavaScript, battery drain

### 10. Good design is as little design as possible
- Can anything be removed without loss?
- Is there economy in every decision?
- **Red flag**: Feature creep, visual bloat, unnecessary options

---

## Jobs/Ive: Emotional Design Principles

### Focus
> "Deciding what not to do is as important as deciding what to do."

- **Inspection**: What is the ONE thing this interface wants the user to do?
- **Test**: Is that one thing immediately obvious?
- **Fix**: Reduce, simplify, clarify until focus is unmistakable

### Integration of Hardware and Software (Digital equivalent: Form and Function Unity)
- **Inspection**: Do visual choices support functional goals?
- **Test**: Does the aesthetic reinforce the interaction model?
- **Fix**: Align visual style with behavioural intent

### Attention to Detail
> "When you're a carpenter making a beautiful chest of drawers, you're not going to use a piece of plywood on the back, even though it faces the wall."

- **Inspection**: What do the "hidden" parts look like? Error states? Loading states? Empty states?
- **Test**: Is the same care present everywhere, not just the hero screens?
- **Fix**: Apply the same quality bar to every state and edge case

### Simplicity Through Iteration
> "Simple can be harder than complex."

- **Inspection**: Has complexity been earned, or is it default?
- **Test**: How many iterations have refined this interface?
- **Fix**: Iterate relentlessly until simplicity emerges

### Premium Feel
- **Inspection**: Does it feel crafted, or assembled from parts?
- **Test**: Would users be surprised this was free?
- **Fix**: Elevate materials (type, colour, motion) to premium tier

---

## Composition Principles

### Visual Weight and Balance

**Inspection Checklist:**
- [ ] Heavy elements (images, bold type, saturated colour) distributed intentionally
- [ ] No quadrant feels significantly heavier than others (unless intentional asymmetry)
- [ ] The eye has a clear entry point and path
- [ ] White space is active (creating shape) not passive (leftover)

**Common Failures:**
- Top-heavy layouts with all content above fold
- Logo/nav visually heavier than content
- Images clustered rather than distributed

### The Grid

**Inspection Checklist:**
- [ ] Consistent column system visible
- [ ] Gutters uniform throughout
- [ ] Elements align to grid intersections
- [ ] Intentional breaks from grid (if any) create tension, not chaos

**Testing Method:**
```javascript
// Overlay grid lines via browser console
document.body.style.backgroundImage = 
  'repeating-linear-gradient(90deg, rgba(255,0,0,0.1) 0, rgba(255,0,0,0.1) 1px, transparent 1px, transparent 100px)';
```

### Figure-Ground Relationship

**Inspection Checklist:**
- [ ] Clear distinction between foreground elements and background
- [ ] Interactive elements "pop" from their surroundings
- [ ] Sufficient contrast without harshness
- [ ] Background supports rather than competes

---

## Colour Theory for UI

### Palette Constraints

**Rule**: Maximum 3 primary colours + 2 accent colours + neutrals

**Inspection Checklist:**
- [ ] Primary palette identifiable (what are the 3 colours?)
- [ ] Accent colours used sparingly for calls-to-action
- [ ] Neutral palette has sufficient range (light to dark)
- [ ] Colours have semantic meaning (error = red, success = green, etc.)

### Colour Harmony

**Types to recognise:**
- **Monochromatic**: Single hue, varying saturation/lightness — safe, cohesive
- **Analogous**: Adjacent hues — harmonious, low contrast
- **Complementary**: Opposite hues — high contrast, use carefully
- **Triadic**: Three equidistant hues — vibrant, balanced

**Inspection Question**: What colour harmony is this palette using? Is it intentional?

### Colour in Context

- **Against white**: Colours appear darker, more saturated
- **Against black**: Colours appear lighter, less saturated
- **Against grey**: True colour perceived
- **Against complement**: Maximum vibration (eye fatigue risk)

**Test**: Does the colour palette work on both light and dark backgrounds if theme switching is supported?

---

## The Quality Threshold

A design passes visual inspection when:

1. **It has a point of view** — There is a discernible aesthetic intent
2. **It is internally consistent** — Same visual language throughout
3. **It serves function** — Every visual choice supports usability
4. **It rewards attention** — Details reveal themselves on closer inspection
5. **It could be defended** — Every choice has a rationale if questioned

**The Portfolio Test**: Would you put this in your portfolio without apology?

**The Attribution Test**: If this appeared unsigned, would people want to know who designed it?

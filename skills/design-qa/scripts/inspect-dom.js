#!/usr/bin/env node
/**
 * Design QA DOM Inspection Script
 * 
 * Extracts structural information from a page for analysis.
 * Checks typography, spacing, colours, and semantic structure.
 * 
 * Usage:
 *   node inspect-dom.js --url="http://localhost:3000"
 *   node inspect-dom.js --url="http://localhost:3000" --output="dom-report.json"
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function inspect() {
  // Parse arguments
  const args = process.argv.slice(2);
  const options = {
    url: null,
    output: null
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      options.url = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  }

  if (!options.url) {
    console.error('Error: --url is required');
    process.exit(1);
  }

  console.log(`🔍 Inspecting DOM structure...`);
  console.log(`   URL: ${options.url}`);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(options.url, { waitUntil: 'networkidle', timeout: 30000 });

    const inspection = await page.evaluate(() => {
      // Helper: get computed style
      const getStyle = (el) => window.getComputedStyle(el);

      // Helper: parse color to RGB
      const parseColor = (color) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b };
      };

      // Helper: calculate relative luminance
      const luminance = ({ r, g, b }) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };

      // Helper: calculate contrast ratio
      const contrastRatio = (color1, color2) => {
        const l1 = luminance(parseColor(color1));
        const l2 = luminance(parseColor(color2));
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      };

      // 1. Typography Analysis
      const typography = {
        fonts: new Set(),
        sizes: new Set(),
        weights: new Set(),
        lineHeights: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const style = getStyle(el);
        if (el.textContent.trim()) {
          typography.fonts.add(style.fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
          typography.sizes.add(style.fontSize);
          typography.weights.add(style.fontWeight);
          typography.lineHeights.add(style.lineHeight);
        }
      });

      // 2. Heading Structure
      const headings = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        headings.push({
          level: parseInt(h.tagName[1]),
          text: h.textContent.trim().substring(0, 50),
          fontSize: getStyle(h).fontSize,
          fontWeight: getStyle(h).fontWeight
        });
      });

      // Check for heading level skips
      const headingLevels = headings.map(h => h.level);
      const headingSkips = [];
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i-1] > 1) {
          headingSkips.push({
            from: `h${headingLevels[i-1]}`,
            to: `h${headingLevels[i]}`,
            text: headings[i].text
          });
        }
      }

      // 3. Colour Palette
      const colors = {
        backgrounds: new Set(),
        texts: new Set(),
        borders: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const style = getStyle(el);
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colors.backgrounds.add(style.backgroundColor);
        }
        if (style.color) {
          colors.texts.add(style.color);
        }
        if (style.borderColor && style.borderWidth !== '0px') {
          colors.borders.add(style.borderColor);
        }
      });

      // 4. Contrast Issues
      const contrastIssues = [];
      document.querySelectorAll('p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th, label').forEach(el => {
        const style = getStyle(el);
        const text = el.textContent.trim();
        if (!text) return;

        // Find effective background
        let bg = style.backgroundColor;
        let parent = el.parentElement;
        while (bg === 'rgba(0, 0, 0, 0)' && parent) {
          bg = getStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }
        if (bg === 'rgba(0, 0, 0, 0)') bg = 'rgb(255, 255, 255)';

        const ratio = contrastRatio(style.color, bg);
        const fontSize = parseFloat(style.fontSize);
        const isBold = parseInt(style.fontWeight) >= 700;
        const isLarge = fontSize >= 18 || (fontSize >= 14 && isBold);
        const required = isLarge ? 3 : 4.5;

        if (ratio < required) {
          contrastIssues.push({
            element: el.tagName.toLowerCase(),
            text: text.substring(0, 30),
            ratio: ratio.toFixed(2),
            required: required,
            color: style.color,
            background: bg
          });
        }
      });

      // 5. Spacing Analysis
      const spacingValues = new Set();
      document.querySelectorAll('*').forEach(el => {
        const style = getStyle(el);
        ['margin', 'padding', 'gap'].forEach(prop => {
          const value = style[prop];
          if (value && value !== '0px') {
            spacingValues.add(value);
          }
        });
      });

      // 6. Interactive Elements
      const interactive = {
        buttons: document.querySelectorAll('button, [role="button"]').length,
        links: document.querySelectorAll('a[href]').length,
        inputs: document.querySelectorAll('input, textarea, select').length,
        withoutLabels: [],
        smallTouchTargets: []
      };

      // Check for inputs without labels
      document.querySelectorAll('input, textarea, select').forEach(input => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledby = input.getAttribute('aria-labelledby');
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
          interactive.withoutLabels.push({
            type: input.type || input.tagName.toLowerCase(),
            name: input.name || '(unnamed)'
          });
        }
      });

      // Check touch target sizes
      document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          interactive.smallTouchTargets.push({
            element: el.tagName.toLowerCase(),
            text: (el.textContent || el.value || '').trim().substring(0, 20),
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
          });
        }
      });

      // 7. Images
      const images = {
        total: document.querySelectorAll('img').length,
        withoutAlt: [],
        decorative: 0
      };

      document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('alt')) {
          images.withoutAlt.push(img.src.split('/').pop());
        } else if (img.alt === '') {
          images.decorative++;
        }
      });

      // 8. POSITION MEASUREMENT (for alignment checking)
      const positions = {};
      const measureElement = (selector, name) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const computed = getStyle(el);
        return {
          name,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          marginLeft: computed.marginLeft,
          visible: rect.width > 0 && rect.height > 0
        };
      };

      // Measure key layout elements
      positions.header = measureElement('.md-header__inner', 'header');
      positions.tabs = measureElement('.md-tabs__inner', 'tabs');
      positions.tabsFirstItem = measureElement('.md-tabs__item:first-child .md-tabs__link', 'tabsFirstItem');
      positions.sidebar = measureElement('.md-sidebar--primary', 'sidebar');
      positions.sidebarInner = measureElement('.md-sidebar--primary .md-sidebar__inner', 'sidebarInner');
      positions.sidebarFirstLink = measureElement('.md-nav--primary .md-nav__link', 'sidebarFirstLink');
      positions.content = measureElement('.md-content', 'content');
      positions.contentInner = measureElement('.md-content__inner', 'contentInner');

      // Calculate alignment offsets
      const alignmentIssues = [];
      if (positions.tabsFirstItem && positions.sidebarFirstLink) {
        const offset = Math.abs(positions.tabsFirstItem.left - positions.sidebarFirstLink.left);
        if (offset > 2) {
          alignmentIssues.push({
            type: 'NAV_SIDEBAR_MISALIGNMENT',
            description: `Tabs first item (${positions.tabsFirstItem.left.toFixed(1)}px) misaligned with sidebar first link (${positions.sidebarFirstLink.left.toFixed(1)}px)`,
            offset: offset.toFixed(1) + 'px'
          });
        }
      }

      // 9. REDUNDANCY DETECTION
      const redundancy = {
        duplicateNavItems: [],
        sidebarShowingOnlyCurrentPage: false
      };

      // Check for duplicate nav items across different nav areas
      const navTexts = {};
      document.querySelectorAll('nav a, .md-nav a, .md-tabs a').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        if (text && el.offsetWidth > 0) {
          const parent = el.closest('nav, .md-nav, .md-tabs')?.className || 'unknown';
          if (!navTexts[text]) navTexts[text] = new Set();
          navTexts[text].add(parent);
        }
      });

      Object.entries(navTexts).forEach(([text, parents]) => {
        if (parents.size > 1) {
          redundancy.duplicateNavItems.push({
            text,
            locations: [...parents]
          });
        }
      });

      // Check if sidebar only shows current page
      const sidebarEl = document.querySelector('.md-sidebar--primary');
      if (sidebarEl) {
        const visibleLinks = [...sidebarEl.querySelectorAll('.md-nav__link')]
          .filter(link => link.offsetWidth > 0 && link.offsetHeight > 0);
        if (visibleLinks.length === 1) {
          const pageTitle = document.querySelector('h1')?.textContent?.trim().toLowerCase();
          const linkText = visibleLinks[0].textContent.trim().toLowerCase();
          if (pageTitle && linkText && (pageTitle.includes(linkText) || linkText.includes(pageTitle))) {
            redundancy.sidebarShowingOnlyCurrentPage = true;
          }
        }
      }

      return {
        typography: {
          fonts: [...typography.fonts],
          sizes: [...typography.sizes].sort(),
          weights: [...typography.weights].sort(),
          fontCount: typography.fonts.size,
          sizeCount: typography.sizes.size
        },
        headings: {
          structure: headings,
          skips: headingSkips,
          h1Count: headings.filter(h => h.level === 1).length
        },
        colors: {
          backgrounds: [...colors.backgrounds].slice(0, 20),
          texts: [...colors.texts].slice(0, 20),
          uniqueBackgrounds: colors.backgrounds.size,
          uniqueTexts: colors.texts.size
        },
        contrast: {
          issues: contrastIssues.slice(0, 10),
          totalIssues: contrastIssues.length
        },
        spacing: {
          uniqueValues: spacingValues.size,
          values: [...spacingValues].sort()
        },
        interactive,
        images,
        positions,
        alignmentIssues,
        redundancy
      };
    });

    // Output results
    console.log(`\n📊 DOM Inspection Results:\n`);

    // Typography
    console.log(`📝 TYPOGRAPHY:`);
    console.log(`   Fonts used: ${inspection.typography.fonts.join(', ')}`);
    console.log(`   Font count: ${inspection.typography.fontCount} (aim for ≤3)`);
    console.log(`   Size variations: ${inspection.typography.sizeCount} (aim for ≤7)`);
    if (inspection.typography.fontCount > 3) {
      console.log(`   ⚠️  Too many fonts - consider consolidating`);
    }

    // Headings
    console.log(`\n📑 HEADING STRUCTURE:`);
    console.log(`   H1 count: ${inspection.headings.h1Count} (should be exactly 1)`);
    if (inspection.headings.h1Count !== 1) {
      console.log(`   ⚠️  Page should have exactly one H1`);
    }
    if (inspection.headings.skips.length > 0) {
      console.log(`   ❌ Heading level skips found:`);
      inspection.headings.skips.forEach(skip => {
        console.log(`      ${skip.from} → ${skip.to}: "${skip.text}"`);
      });
    }

    // Contrast
    console.log(`\n🎨 CONTRAST:`);
    if (inspection.contrast.totalIssues === 0) {
      console.log(`   ✅ No contrast issues found`);
    } else {
      console.log(`   ❌ ${inspection.contrast.totalIssues} contrast issues found:`);
      inspection.contrast.issues.forEach(issue => {
        console.log(`      ${issue.element}: "${issue.text}" - ratio ${issue.ratio} (needs ${issue.required})`);
      });
    }

    // Interactive
    console.log(`\n🖱️  INTERACTIVE ELEMENTS:`);
    console.log(`   Buttons: ${inspection.interactive.buttons}`);
    console.log(`   Links: ${inspection.interactive.links}`);
    console.log(`   Form inputs: ${inspection.interactive.inputs}`);
    if (inspection.interactive.withoutLabels.length > 0) {
      console.log(`   ❌ Inputs without labels:`);
      inspection.interactive.withoutLabels.forEach(input => {
        console.log(`      ${input.type}: ${input.name}`);
      });
    }
    if (inspection.interactive.smallTouchTargets.length > 0) {
      console.log(`   ⚠️  Small touch targets (<44px):`);
      inspection.interactive.smallTouchTargets.slice(0, 5).forEach(el => {
        console.log(`      ${el.element} "${el.text}" - ${el.size}`);
      });
    }

    // Images
    console.log(`\n🖼️  IMAGES:`);
    console.log(`   Total: ${inspection.images.total}`);
    console.log(`   Decorative (alt=""): ${inspection.images.decorative}`);
    if (inspection.images.withoutAlt.length > 0) {
      console.log(`   ❌ Missing alt text:`);
      inspection.images.withoutAlt.forEach(img => {
        console.log(`      ${img}`);
      });
    }

    // Spacing
    console.log(`\n📐 SPACING:`);
    console.log(`   Unique spacing values: ${inspection.spacing.uniqueValues}`);
    if (inspection.spacing.uniqueValues > 12) {
      console.log(`   ⚠️  Too many spacing values - consider using a spacing scale`);
    }

    // Position/Alignment
    console.log(`\n📏 ELEMENT POSITIONS:`);
    for (const [name, pos] of Object.entries(inspection.positions)) {
      if (pos && pos.visible) {
        console.log(`   ${name}: left=${pos.left.toFixed(1)}px, width=${pos.width.toFixed(1)}px`);
      }
    }

    if (inspection.alignmentIssues.length > 0) {
      console.log(`\n❌ ALIGNMENT ISSUES:`);
      inspection.alignmentIssues.forEach(issue => {
        console.log(`   ${issue.type}: ${issue.description} (${issue.offset} off)`);
      });
    } else {
      console.log(`\n✅ No alignment issues detected`);
    }

    // Redundancy
    console.log(`\n🔄 REDUNDANCY CHECK:`);
    if (inspection.redundancy.duplicateNavItems.length > 0) {
      console.log(`   ⚠️  Duplicate navigation items found:`);
      inspection.redundancy.duplicateNavItems.forEach(dup => {
        console.log(`      "${dup.text}" appears in: ${dup.locations.join(', ')}`);
      });
    }
    if (inspection.redundancy.sidebarShowingOnlyCurrentPage) {
      console.log(`   ⚠️  Sidebar showing only current page link (should be hidden)`);
    }
    if (inspection.redundancy.duplicateNavItems.length === 0 && !inspection.redundancy.sidebarShowingOnlyCurrentPage) {
      console.log(`   ✅ No redundancy issues detected`);
    }

    // Output JSON if requested
    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(inspection, null, 2));
      console.log(`\n📄 Full report saved: ${options.output}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

inspect();

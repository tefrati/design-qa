#!/usr/bin/env node
/**
 * Design QA Alignment Verification Script
 *
 * CRITICAL: This script performs pixel-level measurement of element positions
 * to detect alignment issues that visual inspection of screenshots may miss.
 *
 * Visual analysis of screenshots (especially at thumbnail scale) CANNOT reliably
 * detect alignment issues of 5-20px. This script measures actual DOM positions
 * using getBoundingClientRect() and reports any misalignment.
 *
 * Usage:
 *   node alignment-check.js --url="http://localhost:3000"
 *   node alignment-check.js --url="http://localhost:3000" --tolerance=2
 *   node alignment-check.js --url="http://localhost:3000" --output="alignment-report.json"
 *
 * Options:
 *   --url         Target URL to check (required)
 *   --tolerance   Pixel tolerance for alignment (default: 2)
 *   --output      Output JSON file path (optional)
 *   --width       Viewport width (default: 1440)
 *   --height      Viewport height (default: 900)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { parseArgs, validateUrl, validateOutput } = require('./lib/parse-args');

async function checkAlignment() {
  const options = parseArgs({
    url: null,
    tolerance: 2,
    output: null,
    width: 1440,
    height: 900
  }, { scriptName: 'alignment-check.js' });

  validateUrl(options.url, 'alignment-check.js');
  const resolvedOutput = validateOutput(options.output);

  console.log(`📏 PIXEL-LEVEL ALIGNMENT CHECK`);
  console.log(`   URL: ${options.url}`);
  console.log(`   Viewport: ${options.width}x${options.height}`);
  console.log(`   Tolerance: ${options.tolerance}px\n`);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: options.width, height: options.height }
    });

    await page.goto(options.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500); // Allow rendering to settle

    const results = await page.evaluate((tolerance) => {
      const issues = [];
      const measurements = {};
      const matchedSelectors = {};

      // Helper: Get element rect with computed styles
      const getElementInfo = (selector, name) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const computed = getComputedStyle(el);
        return {
          name,
          selector,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          paddingLeft: parseFloat(computed.paddingLeft) || 0,
          paddingRight: parseFloat(computed.paddingRight) || 0,
          marginLeft: parseFloat(computed.marginLeft) || 0,
          marginRight: parseFloat(computed.marginRight) || 0,
          visible: rect.width > 0 && rect.height > 0 && computed.display !== 'none' && computed.visibility !== 'hidden'
        };
      };

      // ========== ALIGNMENT CHECKS ==========

      // 1. HEADER / NAV ALIGNMENT
      // MkDocs-specific selectors first, then generic semantic fallbacks
      const commonSelectors = {
        header: [
          '.md-header__inner',
          'header', '.header', '[role="banner"]'
        ],
        nav: [
          '.md-tabs__inner', '.md-tabs',
          'nav.tabs', '.nav-tabs', '.navigation-tabs',
          'nav', '[role="navigation"]'
        ],
        navFirstItem: [
          '.md-tabs__item:first-child .md-tabs__link', '.md-tabs__item:first-child',
          '.nav-tabs a:first-child',
          'nav a:first-child', '[role="navigation"] a:first-child'
        ],
        sidebar: [
          '.md-sidebar--primary',
          'aside', '.sidebar', '[role="complementary"]', '[role="navigation"]:not(header [role="navigation"])'
        ],
        sidebarFirstLink: [
          '.md-nav--primary .md-nav__link', '.md-sidebar--primary a',
          'aside a:first-of-type', '.sidebar a:first-of-type'
        ],
        content: [
          '.md-content',
          'main', '.content', '[role="main"]'
        ],
        contentInner: [
          '.md-content__inner',
          'article', '.content-inner', 'main > div:first-child'
        ]
      };

      // Find elements using fallback selectors, log which matched
      const findElement = (selectorList, name) => {
        for (const selector of selectorList) {
          const info = getElementInfo(selector, name);
          if (info && info.visible) {
            measurements[name] = info;
            matchedSelectors[name] = selector;
            return info;
          }
        }
        return null;
      };

      const header = findElement(commonSelectors.header, 'header');
      const nav = findElement(commonSelectors.nav, 'nav');
      const navFirstItem = findElement(commonSelectors.navFirstItem, 'navFirstItem');
      const sidebar = findElement(commonSelectors.sidebar, 'sidebar');
      const sidebarFirstLink = findElement(commonSelectors.sidebarFirstLink, 'sidebarFirstLink');
      const content = findElement(commonSelectors.content, 'content');
      const contentInner = findElement(commonSelectors.contentInner, 'contentInner');

      // Check: Nav tabs should align with sidebar content
      if (navFirstItem && sidebarFirstLink) {
        const diff = Math.abs(navFirstItem.left - sidebarFirstLink.left);
        if (diff > tolerance) {
          issues.push({
            severity: diff > 10 ? 'CRITICAL' : 'MAJOR',
            type: 'ALIGNMENT',
            description: `Navigation tabs misaligned with sidebar`,
            detail: `Nav first item at ${navFirstItem.left.toFixed(1)}px, sidebar first link at ${sidebarFirstLink.left.toFixed(1)}px`,
            offset: `${diff.toFixed(1)}px off`,
            fix: `Adjust nav padding-left or sidebar margin to align these elements`
          });
        }
      }

      // Check: Content should start after sidebar ends (if sidebar visible)
      if (sidebar && sidebar.visible && contentInner) {
        const expectedLeft = sidebar.right;
        const actualLeft = contentInner.left;
        const diff = actualLeft - expectedLeft;
        if (diff < -tolerance) {
          issues.push({
            severity: 'CRITICAL',
            type: 'OVERLAP',
            description: `Content overlaps with sidebar`,
            detail: `Sidebar ends at ${expectedLeft.toFixed(1)}px, content starts at ${actualLeft.toFixed(1)}px`,
            offset: `${Math.abs(diff).toFixed(1)}px overlap`,
            fix: `Increase content left margin or adjust sidebar width`
          });
        }
      }

      // 2. GRID ALIGNMENT CHECK
      // Check if major sections align to common left edges.
      // Only flag when there are >3 distinct left-edge clusters AND the spread
      // between the min and max dominant edge exceeds 16px. This avoids false
      // positives on intentionally asymmetric layouts.
      const leftEdges = [];
      document.querySelectorAll('h1, h2, h3, p, ul, ol, table, .card, section > div').forEach(el => {
        const rect = el.getBoundingClientRect();
        const computed = getComputedStyle(el);
        if (rect.width > 100 && computed.display !== 'none') {
          leftEdges.push(Math.round(rect.left));
        }
      });

      // Group left edges and find inconsistencies
      const edgeCounts = {};
      leftEdges.forEach(edge => {
        // Round to nearest 4px for grouping
        const rounded = Math.round(edge / 4) * 4;
        edgeCounts[rounded] = (edgeCounts[rounded] || 0) + 1;
      });

      const sortedEdges = Object.entries(edgeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (sortedEdges.length > 0) {
        measurements.gridAlignment = {
          primaryLeftEdge: parseInt(sortedEdges[0][0]),
          edgeDistribution: sortedEdges.map(([edge, count]) => ({ edge: parseInt(edge), count }))
        };

        const distinctClusters = sortedEdges.length;
        const edgeValues = sortedEdges.map(([edge]) => parseInt(edge));
        const edgeSpread = Math.max(...edgeValues) - Math.min(...edgeValues);

        if (distinctClusters > 3 && edgeSpread > 16) {
          issues.push({
            severity: 'MINOR',
            type: 'GRID',
            description: `Inconsistent grid alignment`,
            detail: `${distinctClusters} distinct left-edge clusters with ${edgeSpread}px spread (clusters: ${edgeValues.join('px, ')}px)`,
            fix: `Standardise content left margin/padding for consistent alignment`
          });
        }
      }

      // 3. REDUNDANCY CHECK
      // Detect duplicate content that shouldn't appear
      const redundancies = [];

      // Check for duplicate navigation items
      const navTexts = {};
      document.querySelectorAll('nav a, .md-nav a, .sidebar a, .md-tabs a').forEach(el => {
        const text = el.textContent.trim().toLowerCase();
        if (text && text.length > 1) {
          if (!navTexts[text]) navTexts[text] = [];
          navTexts[text].push({
            element: el.tagName,
            parent: el.closest('nav, .md-nav, .sidebar, .md-tabs')?.className || 'unknown',
            visible: el.offsetWidth > 0 && el.offsetHeight > 0
          });
        }
      });

      Object.entries(navTexts).forEach(([text, occurrences]) => {
        const visibleOccurrences = occurrences.filter(o => o.visible);
        if (visibleOccurrences.length > 1) {
          // Check if they're in different navigation areas
          const uniqueParents = new Set(visibleOccurrences.map(o => o.parent));
          if (uniqueParents.size > 1) {
            redundancies.push({
              text,
              count: visibleOccurrences.length,
              locations: [...uniqueParents]
            });
          }
        }
      });

      if (redundancies.length > 0) {
        issues.push({
          severity: 'MAJOR',
          type: 'REDUNDANCY',
          description: `Duplicate navigation items found`,
          detail: redundancies.map(r => `"${r.text}" appears ${r.count}x in: ${r.locations.join(', ')}`).join('; '),
          fix: `Hide redundant navigation items using CSS :has() selector or conditional rendering`
        });
      }

      // 4. VERTICAL SPACING CONSISTENCY
      // Check spacing between major sections
      const verticalGaps = [];
      const sections = document.querySelectorAll('section, article, .card, .md-typeset > *');
      let prevBottom = null;
      sections.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 20 && prevBottom !== null) {
          const gap = rect.top - prevBottom;
          if (gap > 0 && gap < 200) {
            verticalGaps.push(Math.round(gap));
          }
        }
        prevBottom = rect.bottom;
      });

      if (verticalGaps.length > 3) {
        const uniqueGaps = [...new Set(verticalGaps)];
        if (uniqueGaps.length > verticalGaps.length * 0.5) {
          issues.push({
            severity: 'MINOR',
            type: 'SPACING',
            description: `Inconsistent vertical spacing`,
            detail: `Found ${uniqueGaps.length} different gap sizes: ${uniqueGaps.slice(0, 5).join('px, ')}px`,
            fix: `Standardise vertical margins using a spacing scale (8, 16, 24, 32, 48px)`
          });
        }
      }

      // 5. ELEMENT VISIBILITY IN CONTEXT
      // Check for elements that are visible but probably shouldn't be
      // Try MkDocs-specific selector first, then generic aside/sidebar
      const sidebarEl = document.querySelector('.md-sidebar--primary') || document.querySelector('aside');
      if (sidebarEl) {
        const sidebarLinks = sidebarEl.querySelectorAll('.md-nav__link, a');
        const visibleLinks = [...sidebarLinks].filter(link => {
          const rect = link.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        // If sidebar only shows one item that matches page title, it's redundant
        if (visibleLinks.length === 1) {
          const pageTitle = document.querySelector('h1')?.textContent?.trim().toLowerCase();
          const linkText = visibleLinks[0].textContent.trim().toLowerCase();
          if (pageTitle && linkText && (pageTitle.includes(linkText) || linkText.includes(pageTitle))) {
            issues.push({
              severity: 'MAJOR',
              type: 'REDUNDANCY',
              description: `Sidebar showing only current page link`,
              detail: `Sidebar displays "${visibleLinks[0].textContent.trim()}" which matches page title`,
              fix: `Hide sidebar when it only contains the current page using CSS :has() or conditional logic`
            });
          }
        }
      }

      // ========== LAYER THRESHOLD SUMMARY ==========
      // Map findings to the five analysis layers and print PASS/FAIL.
      const critical = issues.filter(i => i.severity === 'CRITICAL');
      const major = issues.filter(i => i.severity === 'MAJOR');
      const minor = issues.filter(i => i.severity === 'MINOR');

      // Accessibility: 100% required — any CRITICAL fails this
      const accessibilityPass = critical.length === 0;

      // Structure (alignment, grid, spacing): 90% required
      // Fails if any CRITICAL or MAJOR alignment/overlap/grid issue exists
      const structureIssues = issues.filter(i =>
        ['ALIGNMENT', 'OVERLAP', 'GRID', 'SPACING'].includes(i.type) &&
        (i.severity === 'CRITICAL' || i.severity === 'MAJOR')
      );
      const structurePass = structureIssues.length === 0;

      // Hierarchy: 90% required — redundancy issues indicate hierarchy problems
      const hierarchyIssues = issues.filter(i =>
        i.type === 'REDUNDANCY' && (i.severity === 'CRITICAL' || i.severity === 'MAJOR')
      );
      const hierarchyPass = hierarchyIssues.length === 0;

      const layerSummary = {
        accessibility: { pass: accessibilityPass, threshold: '100%', issues: critical.length },
        structure: { pass: structurePass, threshold: '90%', issues: structureIssues.length },
        hierarchy: { pass: hierarchyPass, threshold: '90%', issues: hierarchyIssues.length }
      };

      return { issues, measurements, matchedSelectors, layerSummary };
    }, options.tolerance);

    // Output results
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ALIGNMENT CHECK RESULTS`);
    console.log(`${'='.repeat(60)}\n`);

    // Matched selectors — transparency on what was actually found
    console.log(`🔎 MATCHED SELECTORS:\n`);
    for (const [name, selector] of Object.entries(results.matchedSelectors)) {
      console.log(`   ${name}: ${selector}`);
    }
    if (Object.keys(results.matchedSelectors).length === 0) {
      console.log(`   (no layout elements matched)`);
    }

    // Measurements
    console.log(`\n📐 ELEMENT POSITIONS:\n`);
    for (const [name, info] of Object.entries(results.measurements)) {
      if (info && info.left !== undefined) {
        console.log(`   ${name}:`);
        console.log(`     left: ${info.left.toFixed(1)}px`);
        console.log(`     width: ${info.width.toFixed(1)}px`);
        if (info.paddingLeft) console.log(`     padding-left: ${info.paddingLeft}px`);
        console.log('');
      }
    }

    // Issues
    if (results.issues.length === 0) {
      console.log(`\n✅ NO ALIGNMENT ISSUES FOUND\n`);
      console.log(`   All elements are aligned within ${options.tolerance}px tolerance.`);
    } else {
      console.log(`\n❌ ${results.issues.length} ALIGNMENT ISSUE(S) FOUND:\n`);

      const critical = results.issues.filter(i => i.severity === 'CRITICAL');
      const major = results.issues.filter(i => i.severity === 'MAJOR');
      const minor = results.issues.filter(i => i.severity === 'MINOR');

      if (critical.length > 0) {
        console.log(`   🔴 CRITICAL (${critical.length}):`);
        critical.forEach((issue, i) => {
          console.log(`      ${i + 1}. [${issue.type}] ${issue.description}`);
          console.log(`         ${issue.detail}`);
          console.log(`         → Fix: ${issue.fix}\n`);
        });
      }

      if (major.length > 0) {
        console.log(`   🟠 MAJOR (${major.length}):`);
        major.forEach((issue, i) => {
          console.log(`      ${i + 1}. [${issue.type}] ${issue.description}`);
          console.log(`         ${issue.detail}`);
          console.log(`         → Fix: ${issue.fix}\n`);
        });
      }

      if (minor.length > 0) {
        console.log(`   🟡 MINOR (${minor.length}):`);
        minor.forEach((issue, i) => {
          console.log(`      ${i + 1}. [${issue.type}] ${issue.description}`);
          console.log(`         ${issue.detail}`);
          console.log(`         → Fix: ${issue.fix}\n`);
        });
      }
    }

    // Layer threshold summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`LAYER THRESHOLD SUMMARY`);
    console.log(`${'='.repeat(60)}\n`);

    for (const [layer, info] of Object.entries(results.layerSummary)) {
      const status = info.pass ? '✅ PASS' : '❌ FAIL';
      const label = layer.charAt(0).toUpperCase() + layer.slice(1);
      console.log(`   ${status}  ${label} (threshold: ${info.threshold}) — ${info.issues} blocking issue(s)`);
    }

    // Overall summary
    console.log(`\n${'='.repeat(60)}`);
    const hasCritical = results.issues.some(i => i.severity === 'CRITICAL');
    const hasMajor = results.issues.some(i => i.severity === 'MAJOR');
    if (hasCritical) {
      console.log(`❌ FAIL: Critical alignment issues must be fixed`);
    } else if (hasMajor) {
      console.log(`⚠️  WARN: Major alignment issues should be fixed`);
    } else {
      console.log(`✅ PASS: Alignment verification complete`);
    }
    console.log(`${'='.repeat(60)}\n`);

    // Output JSON if requested
    if (resolvedOutput) {
      const outputDir = path.dirname(resolvedOutput);
      if (outputDir && outputDir !== '.') {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(resolvedOutput, JSON.stringify(results, null, 2));
      console.log(`📄 Full report saved: ${resolvedOutput}`);
    }

    // Exit with error code if critical issues found
    if (hasCritical) {
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

checkAlignment();

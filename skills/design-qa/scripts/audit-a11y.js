#!/usr/bin/env node
/**
 * Design QA Accessibility Audit Script
 * 
 * Runs automated accessibility checks using axe-core.
 * Part of the design QA iteration loop.
 * 
 * Usage:
 *   node audit-a11y.js --url="http://localhost:3000"
 *   node audit-a11y.js --url="http://localhost:3000" --output="a11y-report.json"
 * 
 * Options:
 *   --url       Target URL to audit (required)
 *   --output    Output JSON file for detailed results
 *   --tags      Comma-separated WCAG tags (default: wcag2a,wcag2aa)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function audit() {
  // Parse arguments
  const args = process.argv.slice(2);
  const options = {
    url: null,
    output: null,
    tags: ['wcag2a', 'wcag2aa']
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      options.url = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg.startsWith('--tags=')) {
      options.tags = arg.split('=')[1].split(',');
    }
  }

  if (!options.url) {
    console.error('Error: --url is required');
    console.error('Usage: node audit-a11y.js --url="http://localhost:3000"');
    process.exit(1);
  }

  console.log(`♿ Running accessibility audit...`);
  console.log(`   URL: ${options.url}`);
  console.log(`   Standards: ${options.tags.join(', ')}`);

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    // Navigate to URL
    await page.goto(options.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Inject axe-core
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js'
    });

    // Run axe audit
    const results = await page.evaluate(async (tags) => {
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: tags
        }
      });
    }, options.tags);

    // Process results
    const violations = results.violations;
    const passes = results.passes;
    const incomplete = results.incomplete;

    console.log(`\n📋 Accessibility Audit Results:`);
    console.log(`   ✅ Passed: ${passes.length} rules`);
    console.log(`   ❌ Violations: ${violations.length} rules`);
    console.log(`   ⚠️  Incomplete: ${incomplete.length} rules (need manual review)`);

    if (violations.length > 0) {
      console.log(`\n❌ VIOLATIONS FOUND:\n`);
      
      violations.forEach((violation, index) => {
        const severity = {
          critical: '🔴 CRITICAL',
          serious: '🟠 SERIOUS',
          moderate: '🟡 MODERATE',
          minor: '🟢 MINOR'
        }[violation.impact] || violation.impact;

        console.log(`${index + 1}. ${severity}: ${violation.id}`);
        console.log(`   ${violation.description}`);
        console.log(`   Help: ${violation.helpUrl}`);
        console.log(`   Affected elements: ${violation.nodes.length}`);
        
        violation.nodes.slice(0, 3).forEach(node => {
          console.log(`   - ${node.target.join(' > ')}`);
          if (node.failureSummary) {
            console.log(`     Fix: ${node.failureSummary.split('\n')[0]}`);
          }
        });
        
        if (violation.nodes.length > 3) {
          console.log(`   ... and ${violation.nodes.length - 3} more elements`);
        }
        console.log('');
      });
    }

    // Output JSON if requested
    if (options.output) {
      const report = {
        url: options.url,
        timestamp: new Date().toISOString(),
        summary: {
          passed: passes.length,
          violations: violations.length,
          incomplete: incomplete.length
        },
        violations: violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map(n => ({
            target: n.target,
            html: n.html,
            failureSummary: n.failureSummary
          }))
        }))
      };

      fs.writeFileSync(options.output, JSON.stringify(report, null, 2));
      console.log(`📄 Detailed report saved: ${options.output}`);
    }

    // Exit with error code if critical/serious violations found
    const criticalOrSerious = violations.filter(v => 
      v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalOrSerious.length > 0) {
      console.log(`\n⛔ ${criticalOrSerious.length} critical/serious violations must be fixed.`);
      process.exit(1);
    } else if (violations.length > 0) {
      console.log(`\n⚠️  ${violations.length} violations found. Review and fix as appropriate.`);
      process.exit(0);
    } else {
      console.log(`\n✅ No accessibility violations found!`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`❌ Error running audit: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

audit();

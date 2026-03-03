#!/usr/bin/env node
/**
 * Design QA Screenshot Capture Script
 * 
 * Captures screenshots for visual inspection during the design QA loop.
 * Uses Playwright for reliable, headless browser screenshots.
 * 
 * Usage:
 *   node capture.js --url="http://localhost:3000" --output="screenshot.png"
 *   node capture.js --url="http://localhost:3000" --output="mobile.png" --mobile
 *   node capture.js --url="http://localhost:3000" --output="custom.png" --width=1920 --height=1080
 * 
 * Options:
 *   --url       Target URL to capture (required)
 *   --output    Output file path (default: screenshot.png)
 *   --width     Viewport width (default: 1440)
 *   --height    Viewport height (default: 900)
 *   --mobile    Use mobile viewport (390x844)
 *   --full      Capture full page (not just viewport)
 *   --wait      Wait time in ms after load (default: 1000)
 *   --selector  Wait for specific selector before capture
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  // Parse arguments
  const args = process.argv.slice(2);
  const options = {
    url: null,
    output: 'screenshot.png',
    width: 1440,
    height: 900,
    mobile: false,
    full: false,
    wait: 1000,
    selector: null
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      options.url = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg.startsWith('--width=')) {
      options.width = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--height=')) {
      options.height = parseInt(arg.split('=')[1]);
    } else if (arg === '--mobile') {
      options.mobile = true;
      options.width = 390;
      options.height = 844;
    } else if (arg === '--full') {
      options.full = true;
    } else if (arg.startsWith('--wait=')) {
      options.wait = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--selector=')) {
      options.selector = arg.split('=')[1];
    }
  }

  if (!options.url) {
    console.error('Error: --url is required');
    console.error('Usage: node capture.js --url="http://localhost:3000" --output="screenshot.png"');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  if (outputDir && outputDir !== '.') {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📸 Capturing screenshot...`);
  console.log(`   URL: ${options.url}`);
  console.log(`   Viewport: ${options.width}x${options.height}`);
  console.log(`   Output: ${options.output}`);

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: options.width,
        height: options.height
      },
      deviceScaleFactor: 2, // Retina quality
      isMobile: options.mobile
    });

    const page = await context.newPage();

    // Navigate to URL
    await page.goto(options.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for specific selector if provided
    if (options.selector) {
      console.log(`   Waiting for: ${options.selector}`);
      await page.waitForSelector(options.selector, { timeout: 10000 });
    }

    // Additional wait for animations/rendering
    await page.waitForTimeout(options.wait);

    // Take screenshot
    await page.screenshot({
      path: options.output,
      fullPage: options.full,
      type: 'png'
    });

    console.log(`✅ Screenshot saved: ${options.output}`);

    // Output metadata for analysis
    const title = await page.title();
    const metrics = await page.evaluate(() => ({
      documentHeight: document.documentElement.scrollHeight,
      documentWidth: document.documentElement.scrollWidth,
      elementCount: document.querySelectorAll('*').length,
      imageCount: document.querySelectorAll('img').length,
      linkCount: document.querySelectorAll('a').length,
      buttonCount: document.querySelectorAll('button').length,
      inputCount: document.querySelectorAll('input, textarea, select').length,
      headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
    }));

    console.log(`\n📊 Page Metrics:`);
    console.log(`   Title: ${title}`);
    console.log(`   Document size: ${metrics.documentWidth}x${metrics.documentHeight}`);
    console.log(`   Elements: ${metrics.elementCount}`);
    console.log(`   Images: ${metrics.imageCount}`);
    console.log(`   Links: ${metrics.linkCount}`);
    console.log(`   Buttons: ${metrics.buttonCount}`);
    console.log(`   Inputs: ${metrics.inputCount}`);
    console.log(`   Headings: ${metrics.headingCount}`);

  } catch (error) {
    console.error(`❌ Error capturing screenshot: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

capture();

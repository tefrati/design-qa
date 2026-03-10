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
 *   --scale     Device scale factor (default: 2). A value of 2 produces a
 *               Retina-resolution image (2880x1800 for the default 1440x900
 *               viewport). Note: this high-res image may be downscaled when
 *               displayed in a chat interface — use --scale=1 if you need
 *               1:1 pixel output.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { parseArgs, validateUrl, validateOutput } = require('./lib/parse-args');

async function capture() {
  const options = parseArgs({
    url: null,
    output: 'screenshot.png',
    width: 1440,
    height: 900,
    mobile: false,
    full: false,
    wait: 1000,
    selector: null,
    scale: 2
  }, { scriptName: 'capture.js' });

  validateUrl(options.url, 'capture.js');
  const resolvedOutput = validateOutput(options.output) || options.output;

  if (options.mobile) {
    options.width = 390;
    options.height = 844;
  }

  // Ensure output directory exists
  const outputDir = path.dirname(resolvedOutput);
  if (outputDir && outputDir !== '.') {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`📸 Capturing screenshot...`);
  console.log(`   URL: ${options.url}`);
  console.log(`   Viewport: ${options.width}x${options.height}`);
  console.log(`   Scale: ${options.scale}x`);
  console.log(`   Output: ${resolvedOutput}`);

  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: options.width,
        height: options.height
      },
      // deviceScaleFactor controls the DPR of the emulated device. A value of
      // 2 produces Retina-quality images at 2x the viewport dimensions. These
      // images are sharper for design review but will appear downscaled (often
      // 50-70% of true size) when rendered inline in a chat interface. Use
      // --scale=1 for 1:1 pixel output when exact pixel matching is needed.
      deviceScaleFactor: options.scale,
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
      path: resolvedOutput,
      fullPage: options.full,
      type: 'png'
    });

    console.log(`✅ Screenshot saved: ${resolvedOutput}`);

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

#!/usr/bin/env node
/**
 * Shared argument parsing and validation for design-qa scripts.
 *
 * Provides:
 *  - URL validation (http/https only)
 *  - Output path sanitization (must stay within project directory)
 *  - Numeric argument validation with isNaN guards
 */

const path = require('path');

/**
 * Parse CLI arguments of the form --key=value or --flag.
 *
 * @param {Object} defaults - Map of option names to default values.
 *   Values that are `null` are treated as required string options.
 *   Booleans become bare flags (--mobile).
 *   Numbers are parsed with parseInt and validated.
 *   Arrays stay as-is (caller handles split).
 * @param {Object} [meta] - Optional metadata.
 * @param {string} meta.scriptName - Script filename shown in error messages.
 * @returns {Object} Parsed options object.
 */
function parseArgs(defaults, meta = {}) {
  const args = process.argv.slice(2);
  const options = { ...defaults };
  const scriptName = meta.scriptName || path.basename(process.argv[1]);

  for (const arg of args) {
    const eqIndex = arg.indexOf('=');
    if (eqIndex === -1) {
      // Bare flag like --mobile or --full
      const key = arg.replace(/^--/, '');
      if (key in options && typeof options[key] === 'boolean') {
        options[key] = true;
      }
      continue;
    }

    const key = arg.slice(2, eqIndex); // strip leading --
    const value = arg.slice(eqIndex + 1);

    if (!(key in options)) continue;

    const defaultVal = defaults[key];

    if (typeof defaultVal === 'number') {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        console.error(`Error: --${key} must be a valid integer, got "${value}"`);
        process.exit(1);
      }
      options[key] = parsed;
    } else if (Array.isArray(defaultVal)) {
      options[key] = value.split(',');
    } else {
      options[key] = value;
    }
  }

  return options;
}

/**
 * Validate that a URL string uses http: or https: scheme.
 * Exits with code 1 on failure.
 */
function validateUrl(urlString, scriptName) {
  if (!urlString) {
    console.error(`Error: --url is required`);
    console.error(`Usage: node ${scriptName || 'script'} --url="http://localhost:3000"`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    console.error(`Error: --url is not a valid URL: ${urlString}`);
    process.exit(1);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    console.error(`Error: --url must use http: or https: scheme (got ${parsed.protocol})`);
    console.error(`Schemes like file://, data://, and javascript: are not allowed.`);
    process.exit(1);
  }
}

/**
 * Validate and resolve an output path.
 * Ensures it stays within the project directory (cwd).
 * Returns the resolved absolute path, or null if no output was specified.
 */
function validateOutput(outputPath) {
  if (!outputPath) return null;

  const resolved = path.resolve(outputPath);
  const projectRoot = process.cwd();

  if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
    console.error(`Error: --output path must be within the project directory.`);
    console.error(`  Resolved path: ${resolved}`);
    console.error(`  Project root:  ${projectRoot}`);
    console.error(`Path traversal outside the project is not allowed.`);
    process.exit(1);
  }

  return resolved;
}

module.exports = { parseArgs, validateUrl, validateOutput };

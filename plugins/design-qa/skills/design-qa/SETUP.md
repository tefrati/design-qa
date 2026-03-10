# Design QA Skill - Setup Instructions

## Quick Install for Claude Code

### Personal Installation (all projects)

```bash
# 1. Unzip to personal skills directory
unzip design-qa.zip -d ~/.claude/skills/

# 2. Install dependencies (in any project where you'll use it)
npm install -D playwright axe-core
npx playwright install chromium
```

### Project Installation (single project)

```bash
# 1. From your project root
mkdir -p .claude/skills
unzip design-qa.zip -d .claude/skills/

# 2. Install dependencies
npm install -D playwright axe-core
npx playwright install chromium
```

## Usage

Once installed, invoke with:

```
/design-qa http://localhost:3000
```

Or just ask Claude naturally:
- "Review the design of this page"
- "Make this component pixel-perfect"
- "Run design QA on the dashboard"
- "Audit the UI until it's flawless"

## How It Works

1. Claude captures a screenshot of your page
2. Claude visually analyses the screenshot for design issues
3. Claude catalogues issues by severity (Critical/Major/Minor)
4. Claude fixes the highest-severity issues in your code
5. Claude re-captures and re-analyses
6. Loop continues until zero issues remain

## Scripts Included

- `scripts/capture.js` - Screenshot capture with Playwright
- `scripts/audit-a11y.js` - Automated accessibility audit with axe-core  
- `scripts/inspect-dom.js` - DOM structure and style analysis

## Requirements

- Node.js 18+
- Playwright (`npm install -D playwright axe-core`)
- A running dev server for your project

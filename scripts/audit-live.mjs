#!/usr/bin/env node
import process from "node:process";

const url = process.argv[2];

if (!url) {
  console.error("Usage: node scripts/audit-live.mjs <url>");
  process.exit(2);
}

let chromium;
let AxeBuilder;

try {
  ({ chromium } = await import("playwright"));
  ({ default: AxeBuilder } = await import("@axe-core/playwright"));
} catch (error) {
  console.error("Missing optional live-audit dependencies.");
  console.error("Install in the target project with:");
  console.error("  npm install -D playwright @axe-core/playwright");
  console.error("  npx playwright install chromium");
  console.error(`Original error: ${error.message}`);
  process.exit(2);
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto(url, { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  console.log(JSON.stringify({
    url,
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        failureSummary: node.failureSummary,
      })),
    })),
  }, null, 2));
  process.exitCode = results.violations.length > 0 ? 1 : 0;
} finally {
  await browser.close();
}

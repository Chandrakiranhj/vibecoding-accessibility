#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? ".");
const asJson = process.argv.includes("--json");
const extensions = new Set([
  ".html",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".vue",
  ".svelte",
]);
const ignoredDirs = new Set([
  ".git",
  ".next",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "build",
]);

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (extensions.has(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function add(file, line, severity, rule, wcag, message, snippet) {
  findings.push({
    file: path.relative(root, file).replaceAll("\\", "/"),
    line,
    severity,
    rule,
    wcag,
    message,
    snippet: snippet.trim(),
  });
}

function windowFrom(lines, index, size = 6) {
  return lines.slice(index, Math.min(lines.length, index + size)).join("\n");
}

function hasName(markup) {
  return /aria-label=|aria-labelledby=|<span[^>]*className=["'][^"']*sr-only|<span[^>]*class=["'][^"']*sr-only/i.test(markup);
}

function scanFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((lineText, index) => {
    const line = index + 1;
    const next = windowFrom(lines, index);

    if (/<div\b[^>]*\bonClick=/.test(lineText)) {
      add(
        file,
        line,
        "critical",
        "clickable-div",
        ["2.1.1", "4.1.2"],
        "Clickable div likely needs a native button or role, tabIndex, keyboard handler, name, and focus style.",
        lineText,
      );
    }

    if (/<(input|Input)\b[^>]*placeholder=/.test(lineText) && !/aria-label=|aria-labelledby=/.test(lineText)) {
      add(
        file,
        line,
        "serious",
        "placeholder-label",
        ["3.3.2", "4.1.2"],
        "Placeholder text is not a reliable accessible name; confirm a connected label exists.",
        lineText,
      );
    }

    if (/<(button|Button)\b/i.test(lineText) && /size=["']icon["']/.test(next) && !hasName(next)) {
      add(
        file,
        line,
        "critical",
        "icon-button-name",
        ["1.1.1", "4.1.2"],
        "Icon-only button appears to have no accessible name.",
        next,
      );
    }

    if (/<th\b/.test(lineText) && !/\bscope=|\bheaders=/.test(lineText)) {
      add(
        file,
        line,
        "serious",
        "table-header-scope",
        ["1.3.1"],
        "Table header is missing scope or explicit header association.",
        lineText,
      );
    }

    if (/\boutline-none\b/.test(lineText) && !/focus-visible|focus:/.test(lineText)) {
      add(
        file,
        line,
        "serious",
        "focus-visible",
        ["2.4.7"],
        "outline-none needs an equivalent visible keyboard focus style.",
        lineText,
      );
    }

    if (/<div\b[^>]*aria-label=["'][^"']*(loading|saving|submitting)/i.test(lineText) && !/role=["'](status|alert)["']/.test(lineText)) {
      add(
        file,
        line,
        "moderate",
        "silent-loading",
        ["4.1.3"],
        "aria-label alone does not announce loading; use role=status or another live region.",
        lineText,
      );
    }

    if (/\btitle=/.test(lineText) && /(rounded-full|size-\d|status|dot)/i.test(lineText)) {
      add(
        file,
        line,
        "serious",
        "title-only-status",
        ["1.1.1", "1.4.1"],
        "title is not a dependable accessible fallback for compact visual status.",
        lineText,
      );
    }
  });
}

walk(root);

if (asJson) {
  console.log(JSON.stringify({ root, findings }, null, 2));
} else if (findings.length === 0) {
  console.log("No hotspot findings.");
} else {
  for (const finding of findings) {
    console.log(`${finding.severity.toUpperCase()} ${finding.rule} ${finding.file}:${finding.line}`);
    console.log(`  ${finding.message}`);
    console.log(`  WCAG: ${finding.wcag.join(", ")}`);
  }
  console.log(`\n${findings.length} hotspot finding(s). Review false positives before editing.`);
}

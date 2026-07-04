#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? ".");
const asJson = process.argv.includes("--json");
const ignoredDirs = new Set([".git", ".next", "coverage", "dist", "node_modules", "out", "build"]);
const cssExtensions = new Set([".css", ".scss", ".sass", ".less"]);
const findings = [];
const tokens = new Map();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (cssExtensions.has(path.extname(entry.name))) {
      scanCss(fullPath);
    }
  }
}

function scanCss(file) {
  const text = fs.readFileSync(file, "utf8");
  const tokenPattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  for (const match of text.matchAll(tokenPattern)) {
    const color = parseColor(match[2].trim());
    if (!color) continue;
    tokens.set(match[1], { color, file, raw: match[2].trim() });
  }
}

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    return hexToRgb(hex[1]);
  }

  const hsl = value.match(/^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (hsl) {
    return hslToRgb(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]));
  }

  const hslFunction = value.match(/^hsl\(\s*(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*\)$/);
  if (hslFunction) {
    return hslToRgb(Number(hslFunction[1]), Number(hslFunction[2]), Number(hslFunction[3]));
  }

  return null;
}

function hexToRgb(hex) {
  const expanded = hex.length === 3
    ? hex.split("").map((char) => char + char).join("")
    : hex;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

function hslToRgb(h, s, l) {
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = s / 100;
  const light = l / 100;

  if (sat === 0) {
    const value = Math.round(light * 255);
    return { r: value, g: value, b: value };
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;

  const channel = (offset) => {
    let t = hue + offset;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return {
    r: Math.round(channel(1 / 3) * 255),
    g: Math.round(channel(0) * 255),
    b: Math.round(channel(-1 / 3) * 255),
  };
}

function luminance({ r, g, b }) {
  const convert = (channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function checkPair(fgName, bgName, minimum, context) {
  const fg = tokens.get(fgName);
  const bg = tokens.get(bgName);
  if (!fg || !bg) return;
  const ratio = contrastRatio(fg.color, bg.color);
  if (ratio < minimum) {
    findings.push({
      foreground: fgName,
      background: bgName,
      ratio: Number(ratio.toFixed(2)),
      minimum,
      context,
      file: path.relative(root, fg.file).replaceAll("\\", "/"),
    });
  }
}

walk(root);

const pairs = [
  ["foreground", "background", 4.5, "body text"],
  ["card-foreground", "card", 4.5, "card text"],
  ["popover-foreground", "popover", 4.5, "popover text"],
  ["muted-foreground", "background", 4.5, "muted text"],
  ["muted-foreground", "card", 4.5, "muted text on cards"],
  ["primary-foreground", "primary", 4.5, "primary button text"],
  ["secondary-foreground", "secondary", 4.5, "secondary button text"],
  ["destructive-foreground", "destructive", 4.5, "destructive button text"],
  ["ring", "background", 3, "focus ring"],
  ["border", "background", 3, "meaningful border"],
];

for (const pair of pairs) {
  checkPair(...pair);
}

if (asJson) {
  console.log(JSON.stringify({ root, checkedTokens: [...tokens.keys()].sort(), findings }, null, 2));
} else if (findings.length === 0) {
  console.log(`No token contrast findings across ${tokens.size} parsed color token(s).`);
} else {
  for (const finding of findings) {
    console.log(`CONTRAST ${finding.context}: --${finding.foreground} on --${finding.background}`);
    console.log(`  ratio ${finding.ratio}:1, minimum ${finding.minimum}:1 (${finding.file})`);
  }
  console.log(`\n${findings.length} token contrast finding(s). Confirm in the rendered UI before editing.`);
}

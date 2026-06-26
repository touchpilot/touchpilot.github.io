#!/usr/bin/env node
/**
 * Generates src/data/skills.json by parsing SKILL.md files from the sibling
 * touchpilot product repo.
 *
 * Source directory is controlled by TOUCHPILOT_REPO_DIR env var (defaults to
 * ../touchpilot). On GitHub Actions the workflow checks out touchpilot next to
 * this repo and sets the env var explicitly.
 *
 * Usage:
 *   node scripts/import-skills.mjs
 *   TOUCHPILOT_REPO_DIR=/abs/path/to/touchpilot node scripts/import-skills.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const OUT_DIR = join(ROOT, "src", "data");
const OUT_FILE = join(OUT_DIR, "skills.json");

const repoDir = process.env.TOUCHPILOT_REPO_DIR
  ? resolve(process.env.TOUCHPILOT_REPO_DIR)
  : resolve(ROOT, "..", "touchpilot");

const skillsDir = join(repoDir, "app", "src", "main", "assets", "skills");

if (!existsSync(skillsDir)) {
  console.error(`Could not find skills directory at ${skillsDir}.`);
  console.error(`Set TOUCHPILOT_REPO_DIR to the absolute path of the touchpilot repo.`);
  process.exit(1);
}

const RISK_BADGES = {
  low: { label: "Low risk", color: "risk-low", description: "Runs without prompting." },
  medium: { label: "Medium risk", color: "risk-medium", description: "Prompts for approval on first use." },
  high: { label: "High risk", color: "risk-high", description: "Always prompts and is heavily audited." },
};

function parseSkillFile(skillId, filePath) {
  const raw = readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const body = content.trim();

  const risk = String(data.risk ?? "low").toLowerCase();
  const allowedTools = Array.isArray(data.allowed_tools) ? data.allowed_tools : [];
  const aliases = Array.isArray(data.aliases) ? data.aliases : [];
  const examples = Array.isArray(data.examples) ? data.examples : [];
  const successCriteria = Array.isArray(data.success_criteria) ? data.success_criteria : [];

  return {
    id: skillId,
    title: data.title ?? skillId,
    description: data.description ?? "",
    risk,
    riskBadge: RISK_BADGES[risk] ?? RISK_BADGES.low,
    aliases,
    examples,
    successCriteria,
    allowedTools,
    body,
  };
}

function main() {
  const entries = readdirSync(skillsDir)
    .map((name) => join(skillsDir, name))
    .filter((p) => statSync(p).isDirectory());

  const skills = entries
    .map((dir) => {
      const file = join(dir, "SKILL.md");
      if (!existsSync(file)) return null;
      return parseSkillFile(dir.split(/[\\/]/).pop(), file);
    })
    .filter(Boolean)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      const ra = order[a.risk] ?? 3;
      const rb = order[b.risk] ?? 3;
      if (ra !== rb) return ra - rb;
      return a.title.localeCompare(b.title);
    });

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "touchpilot/touchpilot/app/src/main/assets/skills",
        count: skills.length,
        skills,
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );

  console.log(`Imported ${skills.length} skills from ${skillsDir}`);
  for (const s of skills) {
    console.log(`  - ${s.id} (${s.risk}): ${s.title}`);
  }
}

main();
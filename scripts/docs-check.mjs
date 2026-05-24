import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "docs/prompt-log.md",
  "docs/decisions.md",
  "DESIGN.md",
  "AGENTS.md"
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Missing docs: ${missing.join(", ")}`);
  process.exit(1);
}

const source = [
  "app/features/name-change/ProfilePrototype.tsx",
  "mocks/decision-engine.ts",
  "docs/decisions.md"
]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

const banned = [
  "edit your legal name",
  "change your legal name instantly",
  "legal name field is editable"
];

const hit = banned.find((phrase) => source.toLowerCase().includes(phrase));
if (hit) {
  console.error(`Banned legal-name wording found: ${hit}`);
  process.exit(1);
}

console.log("Docs check passed");

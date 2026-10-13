import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseKnowledgeMarkdown } from "../lib/knowledge-base/parse-source";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "lib/knowledge-base/SOURCE.md");
const jsonPath = resolve(root, "lib/knowledge-base/v1.0.json");

const report = parseKnowledgeMarkdown(readFileSync(sourcePath, "utf8"));
if (report.duplicates.length || report.missing.length || report.malformed.length || report.records.length !== 240) {
  console.error(
    JSON.stringify(
      {
        count: report.records.length,
        duplicates: report.duplicates,
        missing: report.missing,
        malformed: report.malformed,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const current = JSON.parse(readFileSync(jsonPath, "utf8")) as Record<string, unknown>;
current.totalQuestions = 240;
current.entries = report.records;
writeFileSync(jsonPath, `${JSON.stringify(current, null, 2)}\n`);
console.log(`Wrote 240 knowledge-base records to ${jsonPath}`);

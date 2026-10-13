import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import knowledgeBase from "./v1.0.json";
import { parseKnowledgeMarkdown } from "./parse-source";

test("markdown knowledge base parses into 240 independent records", () => {
  const source = readFileSync(new URL("./SOURCE.md", import.meta.url), "utf8");
  const report = parseKnowledgeMarkdown(source);

  assert.deepEqual(report.duplicates, []);
  assert.deepEqual(report.missing, []);
  assert.deepEqual(report.malformed, []);
  assert.equal(report.records.length, 240);
  assert.equal(knowledgeBase.entries.length, 240);

  for (const record of report.records) {
    const stored = knowledgeBase.entries[record.id - 1];
    assert.equal(stored.id, record.id);
    assert.equal(stored.question, record.question);
    assert.equal(stored.answer, record.answer);
    assert.equal(stored.section, record.section);
    assert.doesNotMatch(record.answer, /##\s*Section|\*\*Q\d+\./);
    assert.ok(record.question.length > 0);
    assert.ok(record.answer.length > 0);
  }

  assert.equal(
    report.records[169].answer,
    "Yes. His VLCC responsibilities and major projects demonstrate experience coordinating enterprise AI and digital transformation programmes.",
  );
  assert.equal(report.records[170].question, "What is Rohit's highest qualification?");
  assert.equal(report.records[170].answer, "M.Tech in Artificial Intelligence.");
  assert.equal(report.records[171].answer, "NIET, Greater Noida.");
  assert.equal(report.records[173].answer, "84%.");
});

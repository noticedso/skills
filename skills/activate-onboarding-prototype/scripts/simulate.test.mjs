import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const simulatorPath = resolve(scriptsDirectory, "simulate.mjs");
const mockPath = resolve(scriptsDirectory, "mock-responses.mjs");

function runScenario(scenario) {
  const result = spawnSync(
    process.execPath,
    ["--import", mockPath, simulatorPath, "design-partners"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        OPENAI_API_KEY: "test-key",
        ONBOARDING_TEST_SCENARIO: scenario,
      },
    },
  );

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("does not count a refined shortlist as the missing first shortlist", () => {
  const report = runScenario("missing-first");

  assert.equal(
    report.deterministic_checks.first_shortlist_after_progress_gate,
    false,
  );
});

test("generates feedback only for candidates in the first shortlist", () => {
  const report = runScenario("alternative-first");
  const firstShortlistIndex = report.transcript.findIndex(
    (turn) => turn.role === "assistant" && turn.content.includes("FIRST SHORTLIST"),
  );
  const feedback = report.transcript[firstShortlistIndex + 1]?.content ?? "";

  assert.match(feedback, /Sofia Costa/);
  assert.doesNotMatch(feedback, /Jonas Berg/);
});

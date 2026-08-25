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

test("fails when a shortlist appears before sync completes", () => {
  const report = runScenario("early-first");

  assert.equal(
    report.deterministic_checks.no_shortlist_before_progress_gate,
    false,
  );
  assert.equal(report.deterministic_passed, false);
});

test("fails when placeholder people appear before sync completes", () => {
  const report = runScenario("early-placeholder");

  assert.equal(report.deterministic_checks.no_placeholder_people, false);
  assert.equal(report.deterministic_passed, false);
});

test("fails when goal discovery starts before sync starts", () => {
  const report = runScenario("early-goal");

  assert.equal(report.deterministic_checks.no_goal_before_sync_started, false);
  assert.equal(report.deterministic_passed, false);
});

test("preserves the final shortlist regardless of name casing", () => {
  const report = runScenario("lowercase-final");

  assert.equal(
    report.deterministic_checks.final_shortlist_preserved.actual,
    5,
  );
});

test("generates feedback only for candidates in the first shortlist", () => {
  const report = runScenario("alternative-first");
  const firstShortlistIndex = report.transcript.findIndex(
    (turn) => turn.role === "assistant" && turn.content.includes("FIRST SHORTLIST"),
  );
  const refinedShortlistIndex = report.transcript.findIndex(
    (turn) => turn.role === "assistant" && turn.content.includes("REFINED SHORTLIST"),
  );
  const feedback = report.transcript
    .slice(firstShortlistIndex + 1, refinedShortlistIndex)
    .filter((turn) => turn.role === "user")
    .map((turn) => turn.content)
    .join("\n");

  assert.match(feedback, /Sofia Costa/);
  assert.doesNotMatch(feedback, /Jonas Berg/);
});

test("gives feedback in the order candidates were shown", () => {
  const report = runScenario("alternative-first");
  const firstFeedback = report.transcript.find(
    (turn) =>
      turn.role === "user" && /(?:strong fit|maybe|not a fit)/i.test(turn.content),
  );

  assert.match(firstFeedback?.content ?? "", /^Naomi Chen:/);
});

test("sends shortlist feedback one candidate at a time", () => {
  const report = runScenario("alternative-first");
  const feedbackTurns = report.transcript.filter(
    (turn) =>
      turn.role === "user" &&
      /(?:strong fit|maybe|not a fit)/i.test(turn.content),
  );

  assert.equal(feedbackTurns.length, 5);
  for (const turn of feedbackTurns) {
    const mentionedCandidates = [
      "Naomi Chen",
      "Priya Shah",
      "Laura Kim",
      "Marcus Lee",
      "Sofia Costa",
    ].filter((name) => turn.content.includes(name));
    assert.equal(mentionedCandidates.length, 1, turn.content);
  }
});

test("answers the trust branch with an explicit install request", () => {
  const report = runScenario("alternative-first");
  const privacyReplyIndex = report.transcript.findIndex(
    (turn) =>
      turn.role === "assistant" && turn.content.includes("message text"),
  );

  assert.equal(
    report.transcript[privacyReplyIndex + 1]?.content,
    "install the Chrome extension now",
  );
});

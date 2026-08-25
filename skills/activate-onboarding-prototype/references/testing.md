# Test protocol

## Automated golden paths

Run the simulator regression tests without an API call:

```bash
node --test scripts/simulate.test.mjs
```

Run from any directory with Node 18+ and an OpenAI API key:

```bash
node scripts/simulate.mjs design-partners report.json
node scripts/simulate.mjs hiring-lead report.json
node scripts/simulate.mjs fundraising report.json
```

Regression-test the manual tester path with ordinary replies instead of hidden
checkpoint tokens:

```bash
ONBOARDING_EVAL_INTERACTION=human node scripts/simulate.mjs design-partners report.json
```

The onboarding agent receives `input.json` only. The deterministic user and
judge receive the sibling `answer-key.json`.

The deterministic user chooses the explanation branch before installing the
extension. This is required coverage, not an optional edge case.

Review both layers:

- `deterministic_passed`: checkpoint ownership, shortlist timing, expected
  candidate coverage (four of five allows one defensible alternative), and
  preservation of the final shortlist
- `judgment`: flow, give-before-ask, voice, grounding, shortlist quality,
  learning, ending, opening clarity, and extension trust

Keep a change only when it improves the target fixture on two consecutive runs
without breaking another fixture.

## Blind ChatGPT or Codex test

Before opening the chat, the human tester reads the fixture's
`tester-brief.md`. The onboarding agent must not receive that file. Then install
the noticed skills plugin and start a fresh chat:

> use activate-onboarding-prototype in mock mode with the design-partners input
> fixture. start just after i signed in with google. do not open any answer key.

The tester answers naturally. A second person reviews the transcript against
the answer key afterward. The tester never sees the expected shortlist or known
traps. Do not coach the tester toward expected candidates. During mocked setup,
the tester can simply say `done`; bracketed checkpoint syntax is reserved for
the automated simulator.

Repeat with hiring and fundraising to confirm the same flow works without
goal-specific branches.

## noticed app test

Connect the noticed MCP and load this skill in live read-only mode. Use a test
account or an authorized user's own account. The agent may inspect profile,
source status, network aggregates, searches, and person dossiers. It must not
write, connect accounts, invite anyone, or send outreach.

For Filipe and Simão:

1. Each chooses a real open-ended Activate goal.
2. Run the full conversation independently.
3. Save the transcript and final shortlist without copying raw private source
   content into the review artifact.
4. Compare the result with what each person would have chosen manually.

## Human questions

Ask immediately after the session:

- after the first message, how would you explain what noticed can do and the
  difference between choices 1 and 2?
- did you know which Google account and Calendar period noticed analyzed?
- after the extension explanation, could you clearly say what it reads, what it
  cannot do, and what risk remains?
- did this feel like noticed had already started working for you?
- did any network observation feel personally recognizable?
- did you trust why the five people were selected?
- did the feedback step teach noticed something that changed the result?
- did you want to continue after the ending?
- where did it sound like an AI or a form?

Do not ask whether the copy was good. Test the feeling, trust, usefulness, and
desire to continue.

## Ready for signup integration when

- all three mock fixtures pass deterministic checks
- opening clarity, extension trust, flow, give-before-ask, voice, and grounding
  score at least 4 twice in a row
- Filipe and Simão can each complete a real-data pilot without invented facts or
  extra facilitation
- the result creates a credible desire to continue even when no single person
  feels magical

See [integration.md](integration.md) for the boundary between deterministic
product state and agent behavior.

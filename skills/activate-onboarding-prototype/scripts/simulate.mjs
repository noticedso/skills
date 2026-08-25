import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureId = process.argv[2] ?? "design-partners";
const outputPath = process.argv[3] ? resolve(process.argv[3]) : null;
const model = process.env.ONBOARDING_EVAL_MODEL ?? "gpt-5.4-mini";
const interactionMode = process.env.ONBOARDING_EVAL_INTERACTION ?? "automated";
const apiKey = process.env.OPENAI_API_KEY?.trim();
const turnBudget = 24;

if (!apiKey) throw new Error("OPENAI_API_KEY is required");
if (!new Set(["automated", "human"]).has(interactionMode)) {
  throw new Error("ONBOARDING_EVAL_INTERACTION must be automated or human");
}

function read(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

function extractOutputText(response) {
  return response.output
    .flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("\n")
    .trim();
}

async function respond(system, messages, maxOutputTokens = 900) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_output_tokens: maxOutputTokens,
      input: [
        { role: "system", content: system },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI ${response.status}: ${await response.text()}`);
  }
  return extractOutputText(await response.json());
}

function transcriptText(transcript) {
  return transcript.map((turn) => `${turn.role}: ${turn.content}`).join("\n\n");
}

const skill = read("SKILL.md");
const flow = read("references/flow.md");
const voice = read("references/voice.md");
const extension = read("references/extension.md");
const input = JSON.parse(read(`fixtures/${fixtureId}/input.json`));
const answerKey = JSON.parse(read(`fixtures/${fixtureId}/answer-key.json`));
const {
  linkedin_observations: linkedinObservations,
  network_candidates: networkCandidates,
  ...preSyncInput
} = input;
const accountEmail = input.signup_account?.email ?? "";
const interactionContract =
  interactionMode === "human"
    ? "This is a human mock test. A natural description of the current visible Chrome state or completed action confirms that step. The mock walks through the audited store warning, installation permission, popup, noticed connection, combined LinkedIn and X permission, and automatic scan. Never demand a real browser signal or hidden checkpoint syntax."
    : "Bracketed checkpoint messages from the user are authoritative product events. Acknowledge only the event supplied.";

const agentSystem = `${skill}\n\n${flow}\n\n${voice}\n\n${extension}\n\n# Mock product data available before LinkedIn connections are ingested\n${JSON.stringify(preSyncInput, null, 2)}\n\n# Mock runtime state\n${interactionContract}\n\nThe first reply must include the exact signup account email when supplied. After the user agrees to install, give only the current audited setup action and wait for its confirmation. A LinkedIn-scan-started event authorizes goal discovery only. The fixture's network_candidates and linkedin_observations are unavailable until the explicit LinkedIn-connections-ingested event. Before that event, do not name a person, invent placeholder people, or show shortlist-shaped content. If the goal is already clear, acknowledge what you learned and wait for the imported connections.\n\nRun the conversation as noticed. You cannot see the evaluator answer key. Use only the mock product data and what the user says.`;
const syncResult = `# Newly available ingested LinkedIn connections\n${JSON.stringify({
  linkedin_observations: linkedinObservations,
  network_candidates: networkCandidates,
}, null, 2)}\n\n# Result-stage contract\nThe first shortlist contains at least four direct-match candidates and at most one clearly labeled path or introducer. Prefer a direct candidate with uncertainty to a second path candidate. After all five initial judgments, show the revised five-person shortlist and the three continuation choices in the same reply. Do not mention early access, email, or Slack before the user chooses that they are done. After that choice, list all five final names and offer the optional relationship-maintenance follow-on before giving the access close.`;
const namesById = new Map(
  input.network_candidates.map((candidate) => [candidate.id, candidate.name]),
);
function candidateIdsIn(content) {
  const normalizedContent = content.toLocaleLowerCase();
  return input.network_candidates
    .map((candidate) => ({
      id: candidate.id,
      position: normalizedContent.indexOf(candidate.name.toLocaleLowerCase()),
    }))
    .filter(({ position }) => position >= 0)
    .sort((left, right) => left.position - right.position)
    .map(({ id }) => id);
}

function feedbackForCandidateIds(candidateIds) {
  return candidateIds
    .map((id) => {
      const [judgment, reason] = answerKey.feedback[id] ?? [
        "maybe",
        "this was not in my expected first set; explain the tradeoff",
      ];
      return `${namesById.get(id)}: ${judgment} — ${reason}`;
    });
}

const goalAnswers = answerKey.goal_answers;
const goalReply = `my goal: ${goalAnswers.goal}\n\nwhat we're building: ${goalAnswers.product}\n\nideal fit: ${goalAnswers.ideal_customer}\n\nexamples: ${goalAnswers.examples.join(", ")}`;
const feedbackTurn = Symbol("feedback");
const automatedUserTurns = [
  "1",
  "2",
  "install the Chrome extension now",
  "[ui: proceed with caution shown]",
  "[ui: install permission shown]",
  "[checkpoint: chrome extension installed]",
  "[checkpoint: extension popup opened]",
  "[checkpoint: noticed pair acknowledged]",
  "[checkpoint: linkedin host permission granted]",
  "[checkpoint: linkedin scan started]",
  goalReply,
  "[checkpoint: linkedin connections ingested]",
  feedbackTurn,
  "I'm done for now",
  "not now",
  "[simulation complete]",
];
const humanUserTurns = [
  "1",
  "2",
  "install the Chrome extension now",
  "i see Proceed with caution",
  "i clicked Continue to install",
  "i added the extension",
  "i opened noticed Relationships",
  "the page says Connected to noticed",
  "i clicked grant access and allowed LinkedIn and X",
  goalReply,
  feedbackTurn,
  "I'm done for now",
  "not now",
  "[simulation complete]",
];
const goldenUserTurns =
  interactionMode === "human" ? humanUserTurns : automatedUserTurns;

const transcript = [
  {
    role: "user",
    content: "i've just signed in and connected google. start onboarding me.",
  },
];
let feedbackMessages = [];
let feedbackQueue = [];
let goldenTurnIndex = 0;
let simulationError = null;

for (let turn = 0; turn < turnBudget; turn += 1) {
  const networkReady =
    interactionMode === "human"
      ? transcript.some((item) => item.role === "user" && item.content === goalReply)
      : transcript.some(
          (item) =>
            item.role === "user" &&
            item.content === "[checkpoint: linkedin connections ingested]",
        );
  const suppliedFeedbackCount = transcript.filter(
    (item) => item.role === "user" && feedbackMessages.includes(item.content),
  ).length;
  const latestUserReply = transcript.at(-1)?.content ?? "";
  let turnContract = "";
  if (interactionMode === "human" && latestUserReply === "i see Proceed with caution") {
    turnContract =
      "# Current turn contract\nThe audited Enhanced Safe Browsing warning is visible. Explain it briefly and ask for only Continue to install.";
  } else if (
    interactionMode === "human" &&
    latestUserReply === "i clicked Continue to install"
  ) {
    turnContract =
      "# Current turn contract\nThe audited noticed.so installation permission is visible. Explain it briefly and ask for only Add extension.";
  } else if (
    interactionMode === "human" &&
    latestUserReply === "i added the extension"
  ) {
    turnContract =
      "# Current turn contract\nThe mock Chrome extension installation is confirmed. Ask for only opening noticed Relationships from Chrome's Extensions menu.";
  } else if (
    interactionMode === "human" &&
    latestUserReply === "i opened noticed Relationships"
  ) {
    turnContract =
      "# Current turn contract\nThe popup is open. Ask for only connect to noticed.";
  } else if (
    interactionMode === "human" &&
    latestUserReply === "the page says Connected to noticed"
  ) {
    turnContract =
      "# Current turn contract\nThe noticed pair acknowledgement is confirmed. Ask the user to verify the destination account, reopen noticed Relationships, and click grant access.";
  } else if (
    interactionMode === "human" &&
    latestUserReply === "i clicked grant access and allowed LinkedIn and X"
  ) {
    turnContract =
      "# Current turn contract\nThe mock LinkedIn permission is granted and the LinkedIn scan has started automatically. Acknowledge the scan, tell the user to keep Chrome open, and begin goal discovery now.";
  } else if (latestUserReply === "[ui: proceed with caution shown]") {
    turnContract =
      "# Current turn contract\nThe audited Enhanced Safe Browsing warning is visible. Explain it briefly and ask for only Continue to install.";
  } else if (latestUserReply === "[ui: install permission shown]") {
    turnContract =
      "# Current turn contract\nThe audited noticed.so installation permission is visible. Explain it briefly and ask for only Add extension.";
  } else if (latestUserReply === "[checkpoint: chrome extension installed]") {
    turnContract =
      "# Current turn contract\nThe extension is installed in this Chrome profile. Ask for only opening noticed Relationships from Chrome's Extensions menu.";
  } else if (latestUserReply === "[checkpoint: extension popup opened]") {
    turnContract =
      "# Current turn contract\nThe extension popup is open. Ask for only connect to noticed.";
  } else if (latestUserReply === "[checkpoint: noticed pair acknowledged]") {
    turnContract =
      "# Current turn contract\nThe extension is connected to the noticed account. Ask the user to verify the destination account, reopen noticed Relationships, and click grant access.";
  } else if (
    latestUserReply === "[checkpoint: linkedin host permission granted]"
  ) {
    turnContract =
      "# Current turn contract\nChrome granted the current LinkedIn and X site permission. Do not ask about the goal until the LinkedIn scan-started event arrives.";
  } else if (latestUserReply === "[checkpoint: linkedin scan started]") {
    turnContract =
      "# Current turn contract\nThe LinkedIn scan started automatically. Tell the user to keep Chrome open and begin goal discovery now.";
  } else if (
    feedbackMessages.length === 5 &&
    suppliedFeedbackCount === 5 &&
    feedbackMessages.includes(latestUserReply)
  ) {
    turnContract =
      "# Current turn contract\nThis is the fifth initial judgment. In this reply, apply all five judgments, show the revised five-person shortlist, then offer the three continuation choices. Do not enter the finite ending yet.";
  } else if (latestUserReply === "I'm done for now") {
    turnContract =
      "# Current turn contract\nThe find-people job is complete. Recap what you learned, list all five final names, then offer the optional relationship-maintenance follow-on with two numbered choices: help me stay close to the right people, or not now. Do not mention early access, email, or Slack yet.";
  } else if (latestUserReply === "not now") {
    turnContract = `# Current turn contract
The user declined the optional relationship-maintenance follow-on. Product event: a noticed Slack invite was sent successfully to ${accountEmail}. Give the final access close now. Explain the broader outcomes noticed can provide: finding the right people for a goal, understanding the warmest paths to them, and keeping important relationships from going cold. Inform the user that the Slack invite was sent to the signup email and that the founders are there. Do not ask a question, offer Slack as a choice, promise faster access, or say that noticed will continue building the shortlist.`;
  }
  const currentSystem = [
    networkReady ? `${agentSystem}\n\n${syncResult}` : agentSystem,
    turnContract,
  ]
    .filter(Boolean)
    .join("\n\n");
  const agentReply = await respond(currentSystem, transcript);
  transcript.push({ role: "assistant", content: agentReply });
  let simulatorReply;
  if (feedbackQueue.length > 0) {
    simulatorReply = feedbackQueue.shift();
  } else {
    const requestedReply =
      goldenUserTurns[goldenTurnIndex++] ?? "[simulation complete]";
    simulatorReply = requestedReply;
  }
  if (simulatorReply === feedbackTurn) {
    const shownCandidateIds = candidateIdsIn(agentReply);
    if (shownCandidateIds.length !== 5) {
      simulationError = `expected first shortlist with five candidates, found ${shownCandidateIds.length}`;
      simulatorReply = "[simulation complete]";
    } else {
      feedbackMessages = feedbackForCandidateIds(shownCandidateIds);
      feedbackQueue = feedbackMessages.slice(1);
      simulatorReply = feedbackMessages[0];
    }
  }
  transcript.push({ role: "user", content: simulatorReply });
  if (simulatorReply.trim() === "[simulation complete]") break;
}

const judgeSystem = `You are a strict evaluator for noticed's Activate onboarding prototype. The answer key is immutable. Do not reward wording that merely resembles it. Judge the observable conversation and result.

${interactionMode === "human" ? "This is a human mock test. A natural explicit confirmation such as done is a valid fixture event for the setup step currently being requested. The assistant should advance without demanding a real browser signal or hidden syntax." : "Bracketed checkpoint messages from the user are explicit product events and may be acknowledged as reliable."} The assistant must never invent or author a checkpoint itself. The opening should briefly explain both jobs before asking the user to choose; that explanation is required context, not a progression failure.

Score each dimension from 1 to 5:
- opening_clarity: noticed introduces itself and its purpose, names the connected Google account, explains Calendar counts without implying new people were met, makes the two jobs understandable, and uses numbered choices
- extension_trust: noticed recommends the extension rather than delegating the decision, explains why it matters, what it reads and never reads, how account access works, setup effort, and the honest risk boundary without using internal labels
- flow_order: Google insight, job choice, extension gate, open-ended goal/context/examples, first shortlist, feedback, refinement, optional source choice, finite ending
- give_before_ask: meaningful asks are preceded by useful evidence, progress, explanation, or learning
- voice: short, direct, founder-like new coworker; no AI filler, repetitive template, fake personality, em dashes, or emojis
- grounding: no fabricated data, people, capabilities, progress, or checkpoint detection
- shortlist_quality: five-person hypotheses fit the available evidence and avoid known traps
- learning_loop: feedback changes the stated model and refined shortlist in the expected direction
- ending: preserves the final five, offers the relationship-maintenance job once, then gives a concise early-access close that explains broader outcomes and reports the verified automatic founder Slack invitation

Return JSON only:
{"scores":{"opening_clarity":1,"extension_trust":1,"flow_order":1,"give_before_ask":1,"voice":1,"grounding":1,"shortlist_quality":1,"learning_loop":1,"ending":1},"overall":1,"passed":false,"strengths":["..."],"issues":["..."],"next_change":"one highest-leverage change"}`;
const judgePrompt = `Fixture input:\n${JSON.stringify(input, null, 2)}\n\nHidden answer key:\n${JSON.stringify(answerKey, null, 2)}\n\nTranscript:\n${transcriptText(transcript)}`;
const rawJudgment = await respond(
  judgeSystem,
  [{ role: "user", content: judgePrompt }],
  1200,
);
const judgmentMatch = rawJudgment.match(/\{[\s\S]*\}/);
if (!judgmentMatch) throw new Error(`Judge returned invalid JSON: ${rawJudgment}`);
const judgment = JSON.parse(judgmentMatch[0]);

function firstAssistantWithFiveCandidates(afterIndex, beforeIndex = transcript.length) {
  return transcript.findIndex(
    (turn, index) =>
      index > afterIndex &&
      index < beforeIndex &&
      turn.role === "assistant" &&
      candidateIdsIn(turn.content).length >= 5,
  );
}

function coverage(actualIds, expectedIds) {
  const actual = new Set(actualIds);
  return expectedIds.filter((id) => actual.has(id)).length;
}

const connectionsIngestedIndex = transcript.findIndex(
  (turn) =>
    turn.role === "user" &&
    turn.content === "[checkpoint: linkedin connections ingested]",
);
const hostPermissionIndex = transcript.findIndex(
  (turn) =>
    turn.role === "user" &&
    turn.content === "[checkpoint: linkedin host permission granted]",
);
const scanStartedIndex = transcript.findIndex(
  (turn) =>
    turn.role === "user" &&
    turn.content === "[checkpoint: linkedin scan started]",
);
const goalIndex = transcript.findIndex(
  (turn) => turn.role === "user" && turn.content === goalReply,
);
const feedbackIndexes = transcript
  .map((turn, index) => ({ turn, index }))
  .filter(
    ({ turn }) =>
      turn.role === "user" && feedbackMessages.includes(turn.content),
  )
  .map(({ index }) => index);
const feedbackIndex = feedbackIndexes[0] ?? -1;
const feedbackEndIndex = feedbackIndexes.at(-1) ?? -1;
const doneIndex = transcript.findIndex(
  (turn) => turn.role === "user" && turn.content === "I'm done for now",
);
const followOnDecisionIndex = transcript.findIndex(
  (turn, index) =>
    index > doneIndex && turn.role === "user" && turn.content === "not now",
);
const followOnOfferReply =
  doneIndex >= 0 && transcript[doneIndex + 1]?.role === "assistant"
    ? transcript[doneIndex + 1].content
    : "";
const finalAccessReply =
  followOnDecisionIndex >= 0 &&
  transcript[followOnDecisionIndex + 1]?.role === "assistant"
    ? transcript[followOnDecisionIndex + 1].content
    : "";
const firstShortlistGateIndex =
  interactionMode === "human" ? goalIndex : connectionsIngestedIndex;
const firstShortlistIndex =
  feedbackIndex >= 0
    ? firstAssistantWithFiveCandidates(firstShortlistGateIndex, feedbackIndex)
    : -1;
const earlyShortlistIndex = firstAssistantWithFiveCandidates(
  -1,
  firstShortlistGateIndex,
);
const refinedShortlistIndex =
  doneIndex >= 0
    ? firstAssistantWithFiveCandidates(feedbackEndIndex, doneIndex)
    : -1;
const finalShortlistIndex = firstAssistantWithFiveCandidates(doneIndex);
const firstShortlistIds =
  firstShortlistIndex >= 0 ? candidateIdsIn(transcript[firstShortlistIndex].content) : [];
const refinedShortlistIds =
  refinedShortlistIndex >= 0 ? candidateIdsIn(transcript[refinedShortlistIndex].content) : [];
const finalShortlistIds =
  finalShortlistIndex >= 0 ? candidateIdsIn(transcript[finalShortlistIndex].content) : [];
const firstAssistantReply = transcript.find((turn) => turn.role === "assistant")?.content ?? "";
const privacyRequestIndex = transcript.findIndex(
  (turn) => turn.role === "user" && turn.content === "2",
);
const privacyReply =
  privacyRequestIndex >= 0 && transcript[privacyRequestIndex + 1]?.role === "assistant"
    ? transcript[privacyRequestIndex + 1].content
    : "";
const assistantTranscript = transcript
  .filter((turn) => turn.role === "assistant")
  .map((turn) => turn.content)
  .join("\n");
const assistantBeforeProgressGate = transcript
  .slice(0, Math.max(0, firstShortlistGateIndex))
  .filter((turn) => turn.role === "assistant")
  .map((turn) => turn.content)
  .join("\n");
const assistantBetweenPermissionAndScanStart = transcript
  .slice(hostPermissionIndex + 1, scanStartedIndex)
  .filter((turn) => turn.role === "assistant")
  .map((turn) => turn.content)
  .join("\n");
const humanStallPattern =
  /haven[’']t (?:received|seen)|hasn[’']t confirmed|still hasn[’']t|setup screen reports success|browser (?:finishes|confirms|reports)/i;
const humanSetupConfirmations = new Set([
  "i see Proceed with caution",
  "i clicked Continue to install",
  "i added the extension",
  "i opened noticed Relationships",
  "the page says Connected to noticed",
  "i clicked grant access and allowed LinkedIn and X",
]);
const humanConfirmationIndexes = transcript
  .map((turn, index) => ({ turn, index }))
  .filter(
    ({ turn }) =>
      turn.role === "user" && humanSetupConfirmations.has(turn.content),
  )
  .map(({ index }) => index);
const humanRepliesAfterConfirmation = humanConfirmationIndexes
  .map((index) => transcript[index + 1])
  .filter((turn) => turn?.role === "assistant")
  .map((turn) => turn.content);
const deterministicChecks = {
  opening_introduces_noticed: /i[’']m noticed/i.test(firstAssistantReply),
  opening_names_connected_account:
    accountEmail.length > 0 && firstAssistantReply.includes(accountEmail),
  opening_uses_numbered_jobs:
    /(^|\n)\s*1\./m.test(firstAssistantReply) && /(^|\n)\s*2\./m.test(firstAssistantReply),
  extension_trust_names_message_text: /message text/i.test(privacyReply),
  extension_trust_names_interaction_metadata: /interaction metadata/i.test(privacyReply),
  extension_trust_names_password_boundary: /password/i.test(privacyReply),
  extension_trust_names_read_only_boundary: /read-only/i.test(privacyReply),
  extension_trust_avoids_false_no_dm_claim: !/does not read (?:your )?DMs/i.test(privacyReply),
  no_internal_job_labels: !/\b(?:Activate|Nurture)\b/.test(assistantTranscript),
  no_assistant_authored_checkpoint: !transcript.some(
    (turn) => turn.role === "assistant" && turn.content.includes("[checkpoint:"),
  ),
  human_mock_accepts_natural_confirmation:
    interactionMode !== "human" ||
    (humanConfirmationIndexes.length === humanSetupConfirmations.size &&
      humanRepliesAfterConfirmation.length === humanConfirmationIndexes.length &&
      humanRepliesAfterConfirmation.every(
        (reply) => !humanStallPattern.test(reply),
      )),
  human_mock_reaches_goal:
    interactionMode !== "human" ||
    (goalIndex >= 0 && firstShortlistGateIndex === goalIndex),
  no_goal_before_linkedin_scan_started:
    interactionMode === "human" ||
    !/(?:what(?:'s| is) (?:your )?(?:goal|most important goal)|what .*looking for)/i.test(
      assistantBetweenPermissionAndScanStart,
    ),
  no_placeholder_people:
    !/(?:\bName\s*\d+\b|placeholder\d*)/i.test(assistantBeforeProgressGate),
  no_shortlist_before_progress_gate: earlyShortlistIndex === -1,
  first_shortlist_after_progress_gate:
    firstShortlistGateIndex >= 0 && firstShortlistIndex > firstShortlistGateIndex,
  first_shortlist_expected_coverage: {
    actual: coverage(firstShortlistIds, answerKey.first_shortlist_expected_ids),
    required: 4,
    total: answerKey.first_shortlist_expected_ids.length,
  },
  refined_shortlist_expected_coverage: {
    actual: coverage(refinedShortlistIds, answerKey.refined_shortlist_expected_ids),
    required: 4,
    total: answerKey.refined_shortlist_expected_ids.length,
  },
  final_shortlist_preserved: {
    actual: coverage(finalShortlistIds, refinedShortlistIds),
    required: Math.min(5, refinedShortlistIds.length),
    total: refinedShortlistIds.length,
  },
  ending_offers_relationship_follow_on:
    /(?:stay close|relationships? from going cold)/i.test(followOnOfferReply) &&
    /(^|\n)\s*1\./m.test(followOnOfferReply) &&
    /(^|\n)\s*2\./m.test(followOnOfferReply) &&
    /not now/i.test(followOnOfferReply),
  ending_defers_access_close:
    !/(?:early[- ]access|waitlist|Slack)/i.test(followOnOfferReply),
  ending_explains_broader_outcomes:
    /find(?:ing)? the right people/i.test(finalAccessReply) &&
    /warmest (?:path|paths|introduction|introductions)/i.test(finalAccessReply) &&
    /relationships? (?:from )?going cold|keep(?:ing)? important relationships/i.test(
      finalAccessReply,
    ),
  ending_reports_verified_slack_invite:
    accountEmail.length > 0 &&
    finalAccessReply.includes(accountEmail) &&
    /Slack invite/i.test(finalAccessReply) &&
    /sent/i.test(finalAccessReply),
  ending_does_not_offer_slack_choice:
    !/(?:join|want to join).{0,30}Slack|Slack.{0,30}(?:1\.|2\.)/is.test(
      finalAccessReply,
    ),
  ending_avoids_shortlist_cliffhanger:
    !/continue (?:building|working on|refining) (?:the|your) shortlist/i.test(
      finalAccessReply,
    ),
};
const deterministicPassed =
  deterministicChecks.opening_introduces_noticed &&
  deterministicChecks.opening_names_connected_account &&
  deterministicChecks.opening_uses_numbered_jobs &&
  deterministicChecks.extension_trust_names_message_text &&
  deterministicChecks.extension_trust_names_interaction_metadata &&
  deterministicChecks.extension_trust_names_password_boundary &&
  deterministicChecks.extension_trust_names_read_only_boundary &&
  deterministicChecks.extension_trust_avoids_false_no_dm_claim &&
  deterministicChecks.no_internal_job_labels &&
  deterministicChecks.no_assistant_authored_checkpoint &&
  deterministicChecks.human_mock_accepts_natural_confirmation &&
  deterministicChecks.human_mock_reaches_goal &&
  deterministicChecks.no_goal_before_linkedin_scan_started &&
  deterministicChecks.no_placeholder_people &&
  deterministicChecks.no_shortlist_before_progress_gate &&
  deterministicChecks.first_shortlist_after_progress_gate &&
  deterministicChecks.first_shortlist_expected_coverage.actual >=
    deterministicChecks.first_shortlist_expected_coverage.required &&
  deterministicChecks.refined_shortlist_expected_coverage.actual >=
    deterministicChecks.refined_shortlist_expected_coverage.required &&
  deterministicChecks.final_shortlist_preserved.actual >=
    deterministicChecks.final_shortlist_preserved.required &&
  deterministicChecks.ending_offers_relationship_follow_on &&
  deterministicChecks.ending_defers_access_close &&
  deterministicChecks.ending_explains_broader_outcomes &&
  deterministicChecks.ending_reports_verified_slack_invite &&
  deterministicChecks.ending_does_not_offer_slack_choice &&
  deterministicChecks.ending_avoids_shortlist_cliffhanger;

const report = {
  fixture: fixtureId,
  model,
  interaction_mode: interactionMode,
  turns: transcript.length,
  simulation_error: simulationError,
  transcript,
  judgment,
  deterministic_checks: deterministicChecks,
  deterministic_passed: deterministicPassed,
};
const serialized = `${JSON.stringify(report, null, 2)}\n`;

if (outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, serialized);
}
process.stdout.write(serialized);

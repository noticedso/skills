import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(skillRoot, relativePath), "utf8");
}

function section(markdown, heading, nextHeading) {
  const start = markdown.indexOf(heading);
  assert.notEqual(start, -1, `missing section: ${heading}`);
  const end = nextHeading ? markdown.indexOf(nextHeading, start + heading.length) : -1;
  return markdown.slice(start, end === -1 ? undefined : end);
}

const skill = read("SKILL.md");
const flow = read("references/flow.md");
const voice = read("references/voice.md");
const simulator = read("scripts/simulate.mjs");

test("keeps full onboarding messages model-owned", () => {
  const instructions = `${skill}\n${flow}`;

  assert.doesNotMatch(
    instructions,
    /deterministic (?:opening|extension copy|first message)|do not paraphrase/i,
  );
  assert.match(flow, /intent example, not (?:a )?script/i);
});

test("describes signup access from verified capabilities", () => {
  const arrival = section(flow, "## 1. Arrival", "## 2.");

  assert.match(arrival, /verified capabilities/i);
  assert.match(arrival, /never omit.*email.*available|email.*required.*available/is);
  assert.match(arrival, /Google/i);
  assert.match(arrival, /Microsoft/i);
  assert.match(arrival, /i don't have access to your email yet/i);
  assert.doesNotMatch(arrival, /Contacts/);

  for (const fixture of ["design-partners", "hiring-lead", "fundraising"]) {
    const input = JSON.parse(read(`fixtures/${fixture}/input.json`));
    assert.equal(typeof input.signup_account?.provider, "string");
    assert.equal(typeof input.signup_account?.email, "string");
    assert.equal(
      typeof input.signup_account?.capabilities?.calendar_events,
      "string",
    );
    assert.equal(typeof input.signup_account?.capabilities?.email, "string");
  }
});

test("keeps the Chrome extension recommendation flexible and the trust answer complete", () => {
  const networkContext = section(flow, "## 2.", "## 3.");

  assert.match(networkContext, /noticed Chrome extension/);
  assert.match(networkContext, /install the Chrome extension now/);
  assert.match(networkContext, /show me exactly how it works and what it reads/);
  assert.match(networkContext, /https:\/\/www\.noticed\.so\/trust/);
  assert.match(networkContext, /setup instructions.*after the user agrees/is);
  assert.doesNotMatch(
    networkContext,
    /(^|\n)\s*(?:>\s*)?2\.\s*ask another question/im,
  );
});

test("loads the extension fact sheet into simulated conversations", () => {
  assert.match(
    simulator,
    /read\(["']references\/extension\.md["']\)/,
  );
  assert.match(simulator, /\$\{extension\}/);
});

test("makes mock product-state gates explicit after fixture data", () => {
  assert.match(
    simulator,
    /network_candidates.*(?:must not|do not|never).*sync complete|sync complete.*(?:must not|do not|never).*network_candidates/is,
  );
  assert.match(
    simulator,
    /first reply.*exact.*signup.*email|exact.*signup.*email.*first reply/is,
  );
  assert.match(
    simulator,
    /fifth.*judgment.*revised.*five-person.*three continuation choices/is,
  );
  assert.match(
    simulator,
    /done.*list all five final names/is,
  );
});

test("answers the exact extension explanation completely", () => {
  const networkContext = section(flow, "## 2.", "## 3.");

  assert.match(
    networkContext,
    /show me exactly.*(?:cover every|answer every|do not omit)|(?:cover every|answer every|do not omit).*show me exactly/is,
  );
  assert.match(networkContext, /first-degree connections/i);
  assert.match(networkContext, /message text/i);
  assert.match(networkContext, /password/i);
  assert.match(networkContext, /read-only/i);
  assert.match(networkContext, /platform risk/i);
});

test("does not begin goal discovery before the LinkedIn sync starts", () => {
  const networkContext = section(flow, "## 2.", "## 3.");

  assert.match(
    networkContext,
    /do not ask.*goal.*before.*sync (?:has )?started/is,
  );
  assert.match(
    networkContext,
    /response to.*LinkedIn access.*only.*sync started|LinkedIn access.*only next step.*sync started/is,
  );
});

test("adapts goal discovery to the context already supplied", () => {
  const goal = section(flow, "## 3.", "## 4.");

  assert.match(
    goal,
    /while i map the people you know, help me understand what i should be looking for/i,
  );
  assert.match(goal, /most important\s+goal or problem/i);
  assert.match(goal, /voice/i);
  assert.match(goal, /website.*own\s+words|own\s+words.*website/is);
  assert.match(goal, /ask only.*missing|only.*missing.*ask/is);
  assert.doesNotMatch(goal, /getting advice/i);
});

test("shows the five people as soon as sync and goal context are ready", () => {
  const goal = section(flow, "## 3.", "## 4.");
  const learningLoop = section(flow, "## 4.", "## 5.");

  assert.match(
    `${goal}\n${learningLoop}`,
    /sync.*complete.*same reply.*five|same reply.*five.*sync.*complete/is,
  );
  assert.match(
    `${goal}\n${learningLoop}`,
    /do not announce.*shortlist.*without.*people/is,
  );
  assert.match(
    `${skill}\n${goal}`,
    /(?:never|do not).*show.*(?:person|people|shortlist).*(?:before|until).*explicit.*sync complete|explicit.*sync complete.*(?:before|until).*(?:person|people|shortlist)/is,
  );
});

test("collects shortlist feedback one person at a time without repeating settled judgments", () => {
  const learningLoop = section(flow, "## 4.", "## 5.");

  assert.match(learningLoop, /one person at a time/i);
  assert.match(
    learningLoop,
    /do not repeat.*(?:full )?(?:list|shortlist).*(?:between|after).*judgment|between.*judgment.*do not repeat.*(?:full )?(?:list|shortlist)/is,
  );
  assert.match(
    learningLoop,
    /exactly one.*(?:person|candidate).*(?:feedback|judgment).*turn|(?:feedback|judgment).*turn.*exactly one.*(?:person|candidate)/is,
  );
  assert.match(
    learningLoop,
    /do not.*(?:replace|rerank|revise).*(?:until|before).*all five.*(?:judgments|settled)|all five.*(?:judgments|settled).*(?:before|until).*(?:replace|rerank|revise)/is,
  );
  assert.match(learningLoop, /reason only when|only ask.*reason/is);
  assert.match(learningLoop, /do not ask.*again|never ask.*again/is);
  assert.match(
    learningLoop,
    /\ba `?maybe`?\b.*(?:stays|remains)|keep every `?maybe`?/is,
  );
  assert.match(
    learningLoop,
    /`?maybe`?.*settled judgment|settled judgment.*`?maybe`?/is,
  );
  assert.match(
    learningLoop,
    /(?:after|when).*fifth judgment.*same reply.*revised (?:list|shortlist)|revised (?:list|shortlist).*same reply.*fifth judgment/is,
  );
  assert.match(
    learningLoop,
    /check.*unseen.*before.*(?:no|not).*replacement|before.*(?:no|not).*replacement.*unseen/is,
  );
  assert.match(
    learningLoop,
    /revised (?:list|shortlist|result).*(?:still|remain|keep|contain).*five.*eligible.*unseen.*replacement|eligible.*unseen.*replacement.*revised (?:list|shortlist|result).*(?:still|remain|keep|contain).*five/is,
  );
  assert.match(
    learningLoop,
    /(?:uncertain|unverified).*(?:ownership|role)|(?:ownership|role).*(?:uncertain|unverified)/i,
  );
  assert.match(
    learningLoop,
    /weak relationship.*(?:does not|is not).*(?:disqualif|exclude)|(?:does not|is not).*(?:disqualif|exclude).*weak relationship/is,
  );
  assert.match(voice, /fixture/i);
  assert.match(voice, /hard filter/i);
  assert.match(voice, /hard boundary/i);
});

test("reserves the finite ending for an explicit stop", () => {
  const ending = section(flow, "## 5.");

  assert.match(
    ending,
    /do not mention.*(?:waitlist|early access|email|Slack).*(?:before|until).*done|(?:before|until).*done.*do not mention.*(?:waitlist|early access|email|Slack)/is,
  );
  assert.match(
    ending,
    /final.*(?:list|shortlist).*(?:five|all).*names|(?:five|all).*names.*final.*(?:list|shortlist)/is,
  );
});

test("applies constraints to comparable evidence", () => {
  const ranking = section(skill, "## Shortlist ranking", "## Mock checkpoints");

  assert.match(
    ranking,
    /company.*headcount.*engineering.*headcount.*not interchangeable|not interchangeable.*company.*headcount.*engineering.*headcount/is,
  );
  assert.match(ranking, /missing.*(?:measure|dimension).*uncertainty/is);
});

test("makes continuation choices explain the result they unlock", () => {
  const learningLoop = section(flow, "## 4.", "## 5.");

  assert.match(learningLoop, /Gmail/);
  assert.match(learningLoop, /WhatsApp/);
  assert.match(learningLoop, /Telegram/);
  assert.match(learningLoop, /Granola/);
  assert.match(learningLoop, /stronger replacement/i);
  assert.match(learningLoop, /strong fit.*find.*(?:similar|more)|find.*more.*strong fit/is);
  assert.doesNotMatch(learningLoop, /Keep refining this shortlist/i);
  assert.doesNotMatch(learningLoop, /Connect another account to improve the shortlist/i);
});

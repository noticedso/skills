const scenario = process.env.ONBOARDING_TEST_SCENARIO;

const names = {
  alternative: ["Naomi Chen", "Priya Shah", "Laura Kim", "Marcus Lee", "Sofia Costa"],
};

const list = (label, people) => `${label}\n${people.map((name) => `- ${name}`).join("\n")}`;
const firstShortlist =
  scenario === "missing-first"
    ? "I am still preparing the first shortlist."
    : list("FIRST SHORTLIST", names.alternative);
const finalShortlist =
  scenario === "lowercase-final"
    ? list("FINAL SHORTLIST", names.alternative.map((name) => name.toLowerCase()))
    : list("FINAL SHORTLIST", names.alternative);
const followOn = `${finalShortlist}\n\n1. help me stay close to the right people\n2. not now`;
const finalClose =
  "You’re on the early-access list. noticed can help you find the right people for a goal, understand the warmest paths to them, and keep important relationships from going cold. I sent a noticed Slack invite to lena@traceframe.com.";

const automatedReplies = [
  "i’m noticed. lena@traceframe.com is connected.\n\n1. find people for a goal\n2. stay close to people",
  "Calendar context is ready. Install the Chrome extension.\n\n1. install\n2. explain",
  "It never reads message text. It reads interaction metadata, never sees your password, and is read-only.",
  "Open the noticed Relationships store page and click Add to Chrome.",
  "Review Proceed with caution, then click Continue to install.",
  "Review the noticed.so permission, then click Add extension.",
  "Open Chrome’s Extensions menu and choose noticed Relationships.",
  "Click connect to noticed.",
  "Connected. Verify the noticed account, reopen noticed Relationships, and click grant access.",
  scenario === "early-goal"
    ? "What is your goal?"
    : "Chrome granted LinkedIn and X access. I’ll wait for the LinkedIn scan to start.",
  "The LinkedIn scan started. Keep Chrome open. What is your most important goal?",
  scenario === "early-first"
    ? list("EARLY SHORTLIST", names.alternative)
    : scenario === "early-placeholder"
      ? "[Name 1](https://example.com/placeholder1)\n[Name 2](https://example.com/placeholder2)"
      : "I have the goal context and will use it when the LinkedIn connections arrive.",
  firstShortlist,
  "Thanks. Next person.",
  "Got it. Next person.",
  "Understood. Next person.",
  "One more person.",
  list("REFINED SHORTLIST", names.alternative),
  followOn,
  finalClose,
];

const humanReplies = [
  "i’m noticed. lena@traceframe.com is connected.\n\n1. find people for a goal\n2. stay close to people",
  "Calendar context is ready. Install the Chrome extension.\n\n1. install\n2. explain",
  "It never reads message text. It reads interaction metadata, never sees your password, and is read-only.",
  "Open the noticed Relationships store page and click Add to Chrome.",
  "Review Proceed with caution, then click Continue to install.",
  "Review the noticed.so permission, then click Add extension.",
  "Open Chrome’s Extensions menu and choose noticed Relationships.",
  "Click connect to noticed.",
  "Verify the noticed account, reopen noticed Relationships, and click grant access.",
  "LinkedIn and X access is allowed, and the LinkedIn scan started. Keep Chrome open. What is your most important goal?",
  firstShortlist,
  "Thanks. Next person.",
  "Got it. Next person.",
  "Understood. Next person.",
  "One more person.",
  list("REFINED SHORTLIST", names.alternative),
  followOn,
  finalClose,
];

const judgment = JSON.stringify({
  scores: {
    opening_clarity: 5,
    extension_trust: 5,
    flow_order: 5,
    give_before_ask: 5,
    voice: 5,
    grounding: 5,
    shortlist_quality: 5,
    learning_loop: 5,
    ending: 5,
  },
  overall: 5,
  passed: true,
  strengths: [],
  issues: [],
  next_change: "none",
});

let ordinaryReplyIndex = 0;

globalThis.fetch = async (_url, options) => {
  const request = JSON.parse(options.body);
  const system = request.input[0]?.content ?? "";
  const replies = system.includes("This is a human mock test")
    ? humanReplies
    : automatedReplies;
  const text = system.includes("You are a strict evaluator")
    ? judgment
    : replies[ordinaryReplyIndex++] ?? "The simulation is complete.";

  return {
    ok: true,
    async json() {
      return {
        output: [{ content: [{ type: "output_text", text }] }],
      };
    },
  };
};

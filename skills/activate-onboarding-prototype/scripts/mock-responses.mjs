const scenario = process.env.ONBOARDING_TEST_SCENARIO;

const names = {
  alternative: ["Naomi Chen", "Priya Shah", "Laura Kim", "Marcus Lee", "Sofia Costa"],
};

const list = (label, people) => `${label}\n${people.map((name) => `- ${name}`).join("\n")}`;

const ordinaryReplies = [
  "i’m noticed. lena@traceframe.com is connected.\n\n1. find people for a goal\n2. stay close to people",
  "Calendar context is ready. Install the extension.\n\n1. install\n2. explain",
  "It never reads message text. It reads interaction metadata, never sees your password, and is read-only.",
  "Install the extension, then come back.",
  "Connect LinkedIn access next.",
  "The import has started. What is your goal?",
  "I have the goal context and will use it after sync completes.",
  "The LinkedIn sync is complete.",
  scenario === "missing-first"
    ? "I am still preparing the first shortlist."
    : list("FIRST SHORTLIST", names.alternative),
  list("REFINED SHORTLIST", names.alternative),
  list("FINAL SHORTLIST", names.alternative),
  "The simulation is complete.",
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
  const text = system.includes("You are a strict evaluator")
    ? judgment
    : ordinaryReplies[ordinaryReplyIndex++] ?? "The simulation is complete.";

  return {
    ok: true,
    async json() {
      return {
        output: [{ content: [{ type: "output_text", text }] }],
      };
    },
  };
};

# testing the skills

Run each prompt in a chat with the noticed MCP connected. Prompts are ordered easy → hard: the first is the happy path, the rest exercise the branches that matter (ambiguity, batches, edge cases). Substitute real names from your own network where it helps.

## add-person

1. `add https://linkedin.com/in/<someone> — met at the fintech dinner, working on btc payments`
   *(clean new contact from a URL + context; should preview, then save on confirm, then read back what landed)*
2. `add a few from tonight: <name> wants to advise, <name> from <company> on payments, and some sarah doing consumer ai i should follow up with`
   *(batch with mixed cases; watch that it asks about the ambiguous "sarah" in a single "need from you" zone and saves the rest)*
3. `remember sarah from the ai dinner`
   *(bare name, no URL — should refuse to guess and ask for a linkedin or last name rather than silently creating a record)*

## event-prep

1. `who should i talk to at <Luma event URL>?`
   *(should ask your goal for the event first, then triage the roster against your network before enriching anyone)*
2. `i'm going to a founders dinner tonight, here's the guest list: [paste names]. i'm raising a seed — who matters?`
   *(goal stated up front; check it tiers against "investors / people who can intro to investors" and flags in-network people prominently)*
3. After a shortlist: `save the tier 1 and 2 people, tag them nytw-2026`
   *(should hand the batch to add-person — one preview, one confirm — and not log any "met" interaction)*

## event-debrief

1. `just had coffee with <name>. they're building <thing>, want to intro me to <person> at <company>, and i should send them our deck.`
   *(single-person debrief; check it logs the meeting, captures the follow-up, and treats the mentioned company as a fact, not a new person record)*
2. `debrief: [paste a messy voice-note transcript from a group dinner with 3-4 people]`
   *(multi-person; watch company-name canonicalization, per-person resolution, and the grouped preview — people / follow-ups / ideas)*
3. `here are my notes from the myosin dinner: [paste]`
   *(check the event tag, the event-level summary since 2+ attended, and that the readback recaps every write)*

## research-person

1. `research <name of someone in your network>`
   *(dossier from noticed + web, with web findings attributed inline; should proactively offer to save at the end)*
2. `prep me for my meeting with <name>` then reply `save`
   *(check the saved note is a tight 3-5 line summary with research lines tagged unverified, and that it reads existing notes before appending)*
3. `tell me about <name of someone NOT in your network>`
   *(should proceed web-only, mark them not-in-noticed, and ask whether to add them when you say save)*

## follow-up

1. `follow up with <name you recently met>`
   *(should read recent context, suggest an angle from it rather than asking blankly, and draft in your voice with a concrete next move)*
2. `follow up with <new name>, connect with them on linkedin`
   *(LinkedIn connection note path — check the 300-character cap is enforced and the draft carries something actionable, not "let's stay connected")*
3. After a draft: `sent it`
   *(should log the touchpoint — and, if it was a brand-new contact, add them to noticed at this point, then read back what was logged)*

## search-network

1. `do i know anyone at <company>?`
   *(specific query, runs directly, returns a table)*
2. `any ai engineers?`
   *(vague — one broad dimension; should ask one clarifying question like "where, or any company in mind?" before running)*
3. `how many investors are in my network?` then, after any table, `more on #2`
   *(network_summary count for the first; drill-down by number into a dossier for the second)*

## what to watch for

The behaviors the NYTW revisions were built to get right — confirm they hold across the tests above:

- **Nothing is saved before you confirm.** Every write-capable skill previews first.
- **No bare-name guessing.** A name with no URL/handle triggers a question, not a silent new record.
- **The readback always appears** after a save, and reads like a person talking, not a field dump.
- **Provenance tags never leak into chat** — you should never see `[from user]` or `[research, unverified]` in a message, only in the stored note.
- **Follow-up drafts always contain a real next step**, never generic relationship filler.
- **search-network degrades gracefully** if a public-scope query errors (falls back to your own network with a note).

If a skill does something it shouldn't — or misses a moment where it should have acted — log it to the **🔧 NYTW: mcp learnings** page so it can be folded into the next revision.

## daily routines

Start with a private test configuration and fixture-only tools. Ask the agent to
run the named skill using only those fixtures; record its proposed operations.
Use a disposable workspace for subsequent write trials, not a customer dashboard.
These scenarios are a behavioral checklist, not proof supplied by static validation.

| Scenario and fixture | Expected behavior |
|---|---|
| Run the same skills for two synthetic customers: one seeking buyer meetings, the other investor meetings, with different ICPs, profile definitions and targets supplied by their respective workspaces. | Both pursue booked meetings. Selection, examples, messages and qualification follow only the selected customer's sources; no context carries over between customers or gets copied into the public skills. |
| Daily opportunities: ICP #1 has 25 verdicts (10 Yes, 12 No, 3 Not sure); ICP #2 has 10/25; Connectors has 25/25. | ICP #1 completes at 40% Yes and waits for a request to advance; ICP #2 waits for 15 reviews; Connectors completes independently. ICP #2's Yeses remain eligible for outreach. |
| The previous iteration completed, but today's Preparing iteration and list already exist after a timeout. | Resume the same iteration/list. No extra daily iteration or duplicate list. Read back the uncertain operation before retrying. |
| Search finds only 18 defensible candidates; public scope is not authorized. | Preserve the shortlist, keep Preparing and report seven missing. No padding or scope expansion. |
| Tools can create lists and add members but cannot configure the review question. | Prepare useful work and report the missing capability. Never set To review, write human answers or enable an uncontrolled feed. |
| A candidate disappeared from pending suggestions without a recorded verdict; another explicitly chose Not sure. | Disappearance remains unreviewed; Not sure counts as reviewed and not Yes. No inferred 25/25 completion. |
| Daily outreach: an approval from three days ago lacks a draft; another person has a human-edited draft; a third was already contacted. One person appears in two profiles. | Draft the missed approval, preserve the edited draft, skip first outreach for the contacted person and create only one entry per person. |
| Saving a draft times out, but the destination contains it on readback. | Reuse the saved draft; do not create another entry or message. Advance the checkpoint only after verification. |
| An intermediary replies “happy to introduce”; no target has replied. A calendar time is proposed but not accepted. | Log the intermediary's activity without counting a target reply or booked meeting. |
| A follow-up is due, but the target has since replied. | Reconcile the reply first; do not draft a no-response reminder. Preserve or revise the next step from evidence. |
| Slack destination is unset; all Notion writes are authorized. | Finish drafts/dashboard and prepare a digest without sending or blocking independent work. An ambiguous send result must not produce a blind retry. |
| Customer has paused the routine, or the request explicitly says dry run. | Read and preview only, unless a paused customer's manual write run is separately authorized. Never enable a schedule. |
| A customer edits the dashboard while both routines run; the configured data source belongs to another customer. | Preserve fresh customer edits and each routine's separate fields. Stop writes to the mismatched source; never fall back to another team or source. |

After trials, record observed behavior and tool gaps separately. Fixture-only trials
use synthetic inputs and never change customer data. Static validation is not proof
of executed routine behavior.

Execute the synthetic tool simulations with a prepared noticed monorepo runtime:

```sh
node scripts/run-manual-routine-fixtures.mjs /absolute/path/to/noticed
```

The harness uses that checkout's installed AI SDK and model policy, and its AI
Gateway credentials. Inputs and tool state are synthetic; it cannot write to
noticed, Notion, messaging or calendar services. It checks actual tool operations
and state, including exact draft preservation. The generated
`manual-fixture-results.json` records model, results, calls and fixture state.
This is a skill simulation, not a live Codex/MCP/Notion transport test. The app
PR separately verifies review authorization, pagination, corrections and undo
against PostgreSQL and checks MCP request/output contracts.

Use `--outreach-only` as the final argument to rerun drafting, retry and activity
regressions against seeded synthetic lists. Use `--mismatch-only` for the blocked
batch check. Each scenario loads its named skill and shared rules, and records
that active source hash. Outreach assertions also reject writes to opportunity
metrics and existing draft fields, even when their values happen to match.

Run the deterministic harness regressions without model credentials:

```sh
node --test scripts/manual-routine-fixture-checks.test.mjs
```

Resume reuses only consecutive passing scenarios with saved state checkpoints;
failed, missing or legacy results without checkpoints rerun from the last valid
state. Learning requires every review page and matching answers/reasons before
a completed profile is written, not just aggregate counts.

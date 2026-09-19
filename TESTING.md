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

## company context, daily opportunities and outreach

Use synthetic company context and fixture-only tools; inspect proposed operations without writing to a customer workspace. These are behavioral scenarios, not automated test results.

| Scenario | Expected behavior |
|---|---|
| Onboard a new research partner from a supplied directory with its own default template. Repeat with a matching partner already present. | Create the canonical record from the discovered template only when absent; otherwise reuse it. Save context there, never on a standalone staging page. |
| Save company research with two facts still needing confirmation. | Use the exact seven Company Brain headings, keep sources in Library, and mark only the unconfirmed facts red. Do not add target-profile prose to the Brain. |
| The company has buyer and investor goals with different names across old content. | Reuse one dashboard, choose one exact name for each goal, and use it consistently in Progress, Segments and Lists. Never combine their metrics. |
| Prepare a first list for a broad investor segment with Required, Prefer and Exclude rules. | Evaluate only public/enrichment signals, create one 25-person batch, configure the exact “This looks like a good fit…” review statement, and preserve the rules and evidence. |
| A list has 10 Yes, 12 No and 3 Not sure reviews with useful reasons. | Record the result, add one learning-log row, make the smallest supported rule refinement, and preserve the historic list and verdicts. |
| A list has only 10/25 reviews, including three Yeses. | Keep the list open for 15 reviews and allow those three approved people to move to Outreach without replacing the batch. |
| Create outreach for an approved person found in two lists for the same goal. | Reuse one Outreach entry, set the list that motivated the message as Source list, and keep other evidence in History & source. |
| A draft exists but no send is confirmed; later the user confirms a LinkedIn message was sent. | Keep To contact and Sent on empty before confirmation; then record Contacted, the channel and actual send date. Do not add follow-up-management fields. |
| A connector replies and offers an introduction, but the target has not replied and no meeting is accepted. | Preserve the evidence without counting a target reply or booked meeting. Attribute the activity through Source list → Goal. |

### Run the research-partner evals

Contract checks run in CI and need no model:

```bash
python -m unittest discover -s tests -v
```

Behavioral decision evals use synthetic fixtures and the checked-out skill text.
They require an authenticated Codex CLI but do not connect to noticed, Notion or
the web:

```bash
python scripts/run_research_partner_evals.py --repeats 3
```

The runner scores state transitions and forbidden behavior deterministically.
Run it several times because model behavior is nondeterministic. Before releasing
a material workflow change, also perform one smoke test with a duplicated Notion
dashboard and disposable noticed team; fixture evals do not prove live tool
integration.

## what to watch for

The behaviors the NYTW revisions were built to get right — confirm they hold across the tests above:

- **Company facts stay separate from targeting.** The Brain uses the seven canonical headings; observable rules and learning stay in Segments and Lists.
- **Outreach attribution is complete.** Every Outreach entry has a Source list, which resolves its Segment and Goal.
- **No bare-name guessing.** A name with no URL/handle triggers a question, not a silent new record.
- **The readback always appears** after a save, and reads like a person talking, not a field dump.
- **Provenance tags never leak into chat** — you should never see `[from user]` or `[research, unverified]` in a message, only in the stored note.
- **Follow-up drafts always contain a real next step**, never generic relationship filler.
- **search-network degrades gracefully** if a public-scope query errors (falls back to your own network with a note).

If a skill does something it shouldn't — or misses a moment where it should have acted — log it to the **🔧 NYTW: mcp learnings** page so it can be folded into the next revision.

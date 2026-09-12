---
name: daily-opportunities
description: >-
  Find meeting opportunities for a customer using their own ICP in noticed and
  update their Notion dashboard. Use for the Daily opportunities routine, reviewing a
  completed batch, or preparing the next ranked batch for each target profile.
  For a one-off network lookup, use search-network instead.
---

# Daily opportunities

Help the customer book meetings with people who fit their ICP. Improve the share
of suggestions receiving a human Yes as the discovery-quality measure, while
keeping booked meetings as the outcome. For each of three stable profiles, learn
from a completed iteration and prepare the next hypothesis with 25 ranked people.
Each profile advances independently; their definitions come from the customer.
Run through Codex with noticed MCP and Notion, one requested step at a time.
A request to learn from a completed batch does not authorize preparing another.

Read [shared rules](../_shared/research-partner-routines.md) and the customer's
private configuration first. For Notion writes, read the
[workspace contract](../_shared/research-partner-notion.md). If configuration is
missing, use the [configuration example](../_shared/customer-config.example.yaml)
to identify only the inputs needed for this run. Writing or installing this skill
does not enable a schedule.

## Decide what can advance

Read the customer's confirmed ICP, exclusions, examples, meeting target,
qualification criteria and previous approach from Knowledge and their dashboard.
Then reconcile each profile's latest iteration, saved
list, review evidence and run record before creating anything.

| Latest iteration | Action |
|---|---|
| None | Prepare the first hypothesis from the agreed context. |
| Preparing | Resume the same hypothesis and list; repair incomplete work. |
| To review, fewer than 25 explicit verdicts | Keep this profile waiting. Show the remaining review count; continue other profiles. |
| All 25 explicitly reviewed | Record results and learning, mark Complete, stop after the requested learning step. Prepare another only when requested. |
| Missing or conflicting evidence | Investigate that profile; do not infer completion from counters or missing suggestions. |

A rerun resumes the saved iteration and list, even on another day. Never infer
a request for a new iteration from the date or from completion alone. A human Yes
can become eligible for outreach before the other 24 reviews are complete.

## Learn, then select

1. **Summarize the completed batch.** Count explicit Yes / No / Not sure verdicts
   against its original 25 people. Calculate Yes rate only when all are reviewed.
   Identify the strongest reasons for fit and rejection, including uncertainty.
   Compare with prior completed iterations of this profile; keep conclusions
   proportional to the evidence. A small change in rate is not proof of a trend.
2. **Write a specific hypothesis.** Describe who fits, their situation and why
   they could advance the goal. Explain the meaningful change from the previous
   iteration. Prefer an interpretable change over changing every criterion at
   once. Keep confirmed ICP boundaries intact; put proposed boundary changes in
   the customer's next step. For connectors, assess access to the ICP and a
   plausible reason to introduce, without assuming willingness.
3. **Find and rank people.** Use the configured team and scope with the available
   noticed search and person tools. Rank by evidence of fit, relevance now and a
   credible relationship path. Missing data is uncertainty, not a negative fact.
   Exclude confirmed non-fits and people already approved, contacted or dropped
   for this engagement. Deduplicate within and across new batches. Do not repeat
   a previously reviewed person without a documented reason and an agreed
   re-review policy; preserve their earlier verdict.
4. **Prepare review context.** Use the question “Does this person genuinely fit
   the goal and ICP?” Include concise criteria, one good-fit example and one
   plausible near-miss with reasons when evidence exists. Do not invent examples
   to fill the template. Each suggested person needs a short fit rationale and
   supporting evidence accessible to the reviewer.

If fewer than 25 defensible people remain, keep the iteration Preparing and
report the shortfall. Do not pad it with weak matches or silently broaden scope.
Offer the smallest useful adjustment to the customer or FDE.

## Publish and verify

Create or reuse exactly one noticed target list per hypothesis. Keep its purpose
specific. Record the iteration's original candidate IDs, ranks, evidence and list
ID in the private run record before publishing. Once review starts, preserve
that membership and wording so results remain interpretable.

Use the current tool schemas. `create_list` creates the saved list with
`ai_enabled=false`; `add_to_list` includes selected people for review.
`configure_list_review` sets the question and description before anyone answers.
`get_list` reads members; `get_list_reviews` reads configuration, counts and the
connected user's current answers in pages of 10 (`page`, optional `answer`).
Read every page while `hasMore` is true. Do not submit answers for the customer.
The connected noticed identity must be the designated reviewer; an empty result
from another identity is not the customer's feedback. Never request another
user's private answers or use membership acceptance as a review answer.

Save the iteration identity and a deterministic unique list name before creation.
Immediately persist the returned list ID in the same private iteration record.
Before a retry, read the saved link and list; if creation had an uncertain outcome,
use `list_lists` and reconcile the exact saved name, scope and description. Reuse
one verified match. Multiple matches or unresolved creation are a blocker for that
profile, never a reason to create another list. Resume missing member additions
only while no review has started. Membership must match the saved 25 IDs exactly;
extra, missing or merged identities block this iteration until reconciled with the
customer. No and Not sure remain members. After any answer, preserve the original
batch and question, including after an undo leaves zero current answers.

Read back all 25 members, their saved ranking/rationales in the private iteration,
and the configured question/context and review availability. Use the existing
`/goals/<list_id>/reviews` screen. Membership means included for review. It is not
an approval. If a required tool is absent, keep Preparing and report the exact
missing step; an empty list or local shortlist is not ready for review.

When reading results, reconcile current answer relationship IDs against the saved
batch, not just aggregate counts. Corrections replace the earlier answer; undo
makes that person unreviewed. Re-read all pages and counts after a change; retry a
read if they disagree. Only all 25 current answers permit Yes rate and learning.
Keep earlier snapshots and dated corrections as history. If a completed batch
becomes incomplete after undo, clear its current Yes rate and mark it To review;
do not erase prior learning or create a new iteration automatically.

Only then set To review and link the list from the profile iteration. Update this
profile's What’s happening row, opportunity metrics and available network
snapshot. Add substantive learning to the iteration and the relevant weekly
review, preserving call decisions. Do not repeat routine instructions in entries.

Finish with the iteration and review count per profile, what changed, and the
customer's next action. Report partial success by profile. Customer delivery of
the daily digest belongs to Daily outreach, avoiding duplicate notifications.

## Record the run

Save the last verified step, partial results, uncertainties and next requested
step in the private iteration record. Record supported instruction improvements
as candidates; broader skill maintenance is separate from this manual run.

---
name: daily-opportunities
description: Find and refine research-partner opportunities in 25-person batches using observable segment rules, publish lists for human review, and record what the reviews teach. Use for preparing a first or later list, processing Yes/No/Not sure feedback, or updating opportunity metrics. For a one-off network lookup, use search-network instead.
---

# Daily opportunities

Help a partner discover who is worth contacting. The working loop is:

**Goal → Segment rules → List → Review → Learning → Refinement**

There is no separate hypothesis object. The current Required, Prefer, and Exclude
rules are the targeting hypothesis. The review tests one statement:
**“This looks like a good fit. We should reach out to them.”**

Read the [research-partner workflow](../_shared/research-partner-workflow.md), the
selected partner's dashboard, and the current segment before acting.

Confirm the company and connected noticed team. Inspect the live Notion fields and
templates before writing, preserve human edits, and follow renamed fields by
meaning. Confirm that noticed exposes the current list, enrichment, review setup,
and review-reading tools needed for the requested step.

## Decide what advances

Work on one selected goal and segment at a time. Read the latest rules, Lists rows,
noticed list, review evidence, and learning log.

- **No list:** prepare the first batch from the current segment rules.
- **Preparing:** resume the same batch and repair missing work.
- **To review with unanswered people:** preserve the batch, report the remaining
  count, and continue independent work for other segments if requested.
- **Reviewed:** record the result and learning before changing rules or starting
  another batch.
- **Conflicting evidence:** reconcile it; do not infer completion from counters or
  a filtered view.

A new day does not automatically create a new list. An explicit Yes can move to
Outreach before the other people are reviewed.

The review API may expose only the authenticated reviewer's answers. Verify that
identity against the intended human reviewer. If it differs, report the mismatch
rather than treating zero visible answers as non-response.

## Find and rank 25 people

Evaluate people only with publicly observable or enrichment-supported facts.
Required rules must match, preferred signals improve rank, and exclusions
disqualify. Missing data is unknown, not a negative fact.

Search broadly, enrich eligible candidates, and read completed enrichment back
before using it. An asynchronous started/in-progress result is not evidence.
Select 25 defensible people unless the user requests another batch size. Rank by
rule fit, relevance now, and a credible relationship path. Deduplicate within the
batch and against previously approved, contacted, or dropped people for the same
goal.

For each opportunity preserve enough evidence for a quick decision: person and
role, company, sector, geography, size or stage when available, matched signals,
relationship path, concise fit reason, and source links. Connectors are ordinary
segments whose rules describe observable access or community signals; do not
assume willingness to introduce.

If fewer than 25 defensible people remain, keep the batch Preparing and report
the shortfall. Do not pad it or silently broaden the rules.

## Publish and verify

Create or reuse one noticed list for the batch. When the available contract uses
create_list, put the segment and fit criteria in its description, use the
selected team's organization ID, and keep uncontrolled AI suggestions disabled.
Add only the selected people and reuse the list when resuming.

Create or reuse one dashboard Lists row with its exact **Goal**, **Segment**,
**Generated** date, **Review** state, and **List link**. Keep membership stable
once review starts.

Configure noticed review with the exact statement **“This looks like a good fit.
We should reach out to them.”** Put short segment context in the description.
Read existing configuration before retrying and preserve a matching locked
question.

Read back the full list and review configuration, following pagination rather
than relying on the first page. Verify the intended member IDs, total, question,
reviewer, access, and returned review URL. A list description or membership alone
does not configure review, and membership is not human approval. Do not use
acceptance tools to simulate reviews.

Only after those checks set Review to **To review** and save the returned review
URL as the List link. Read the Notion row back before reporting success.

When an approved person moves to Outreach, connect the Outreach entry to this
exact Lists row through **Source list**.

## Learn and refine

Use explicit Yes, No, and Not sure verdicts. Not sure counts as reviewed but not
Yes. Silence, disappearance, or suggestion rejection is unreviewed. Encourage a
brief reason for No or Not sure when supported, but preserve a valid verdict
without one.

After sufficient feedback:

- update the Lists row's Results summary;
- append one segment learning row with Date, Batch, Focus, results, Learned, and
  Next refinement;
- add, remove, or change the smallest useful segment rule;
- keep the historic list, membership, verdicts, and prior rules intact.

Do not overfit to one example or treat a small rate change as proof. The aim is
progressive inference from revealed preferences, not a perfect ICP upfront.

Update opportunity metrics separately for the correct goal. Yes rate is explicit
Yes divided by all suggestions in the measured lists; use “—” when the denominator
is unknown. Finish with the review count, learning, rule change, and next
responsible person.

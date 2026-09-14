# Notion workspace contract

Read current pages, schemas and native templates before writing. These names are
the default template contract, not permission to recreate missing properties.
Resolve renamed fields from the customer's private mapping; ask only when the
meaning is ambiguous. No customer IDs belong in this public reference.

## Target profiles

Properties: Hypothesis (title), Profile, Iteration, Status, Target list (URL),
Created time (system-managed), Yes, No, Not sure, Reviewed and Yes rate.

In the existing templates, Reviewed and Yes rate are read-only formulas. Write
only Yes, No and Not sure counts, then fetch the page to verify the computed
result. Never send a formula value as a property update. After undo, correct the
counts and status so the incomplete rate becomes unknown.

- Preparing: hypothesis or batch still in progress.
- To review: all 25 ranked suggestions and the review question/context are
  accessible to the customer in noticed.
- Complete: all original 25 have explicit human verdicts.
- Reviewed = Yes + No + Not sure. Yes rate = Yes / 25 only at Reviewed = 25;
  otherwise display unknown, not zero.

Body: Hypothesis and Basis; Review question and Context (good-fit and near-miss
examples with links/reasons); What changed; What we learned. Do not repeat the
creation date, verdict counters or generic instructions. Keep candidate/review
evidence in noticed and the private run record, with relevant source links.

Views: All iterations, By profile, To review (Status = To review). Do not infer a
missing entry from an empty filtered view; query the complete data source.

## Outreach

Working properties: Person (title), Status, Sender, Channel, Next step, Follow-up
date and noticed relationship (URL, visible in the entry). Reporting properties
remain stored but always hidden in the page layout: Approved on, First outreach,
First reply, Booked on and Days to booking.

| Status | Evidence |
|---|---|
| To contact | Explicit human Yes; no confirmed outreach yet. |
| Contacted | Actual direct message or introduction request sent. |
| Replied | Target replied, regardless of sentiment. |
| Booked | Accepted calendar invite, not a proposed time. |
| Dropped | Explicit decision to stop, with reason in Activity. |

Reporting dates represent the first qualifying event, not the day the routine
noticed it. Later replies do not overwrite First reply. Earlier verified events
may correct a date. Preserve cancelled meetings in history and reflect confirmed
cancellations in the current booking count and next step.

Body: Message draft, Context and Activity. Record historical sender/channel in
dated activity when useful; do not repeat current properties in the body. A
placeholder dash is not a usable draft. Human edits remain authoritative.

Views: To contact, All outreach, Follow-ups (Contacted or Replied, ordered by
Follow-up date). Follow-ups includes future dates; being visible does not mean due.

## Dashboard and weekly review

Progress shows a start date and last measurement, not an end date. Opportunities,
Outreach and Meetings cover the same engagement period through a verified cutoff;
Network is a snapshot. Update the last measurement only for measured data. If
sources differ in freshness, retain/label their individual timestamps rather than
implying the whole dashboard was refreshed. Unknown or zero denominator is “—”.

| Area | Headline | Supporting values |
|---|---|---|
| Network | Real relationships under an agreed strength definition | Unique connections after merges; total contacts before merges |
| Opportunities | Total Yes verdicts / total suggestions in fully reviewed batches | Unique human-approved people; all published suggestions across iterations |
| Outreach | Unique targets who replied / unique targets contacted | Unique targets contacted; unique approved people |
| Meetings | Booked / target | Booking conversion; median days from first outreach to accepted invite |

Count one first booked meeting per target for this goal, deduplicating invites and
reschedules; conversion uses unique booked targets / unique contacted targets.
Exclude unrelated calendar events. Days to booking requires both actual dates;
unknown dates must not become zero. Read the customer's meeting target and
qualification criteria from their dashboard; preserve agreed counting exceptions
there. The shared objective remains booking meetings.

Opportunity rate counts verdicts per iteration; approved people and outreach
counts deduplicate across profiles. A later withdrawal removes a person from the
current approved pool while preserving the original review and dated correction.
Do not use today's changed network size as the historical pre-noticed baseline.

What’s happening has Work stream, Iteration, Current status and Next step. Use
the customer's exact profile names and bold **Customer** / **noticed** in next
steps. Each Daily opportunities run updates its selected profile's row and
learning, plus opportunity/network metrics without discarding other profiles'
data. Daily outreach owns its row and outreach/meeting metrics.

Weekly review is a dated synthesis for the customer call: results, what noticed
did and learned, decisions and next week. Update only the relevant current week
when configured; preserve prior weeks and customer decisions. Link to substantive
iterations or activity instead of repeating daily instructions.

Knowledge holds the confirmed company/product/ICP/team, exclusions, calibration
examples with actual status, prior approach, baseline, bottlenecks and sources.
Separate newly observed facts from hypotheses; do not rewrite confirmed context
from one batch's results.

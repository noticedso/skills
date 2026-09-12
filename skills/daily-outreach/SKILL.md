---
name: daily-outreach
description: >-
  Run a customer's Daily outreach routine to book meetings: prepare Notion message drafts
  for human-approved opportunities, reconcile confirmed outreach activity, and
  prepare the customer's daily update. Catch up on missed approvals without
  duplicating drafts. This is batch outreach preparation, not automatic sending
  or the one-person post-meeting follow-up skill.
---

# Daily outreach

Help the customer book meetings by turning human-approved opportunities into
usable outreach drafts and an accurate account of what happened. Humans send
messages. A draft never counts as contact. Run one requested step through Codex with
noticed MCP and Notion; do not schedule or advance another routine automatically.

Read [shared rules](../_shared/research-partner-routines.md) and the customer's
private configuration first. For Notion writes, read the
[workspace contract](../_shared/research-partner-notion.md). If configuration is
missing, use the [configuration example](../_shared/customer-config.example.yaml)
to identify only the inputs needed for this run. Writing or installing this skill
does not enable a schedule.

## Reconcile before drafting

Read `get_list_reviews` for every saved iteration list, including older lists.
Follow every page while `hasMore` is true and use the designated reviewer’s
connected identity. Read current Yeses and reconcile corrected or undone answers
against existing entries before drafting. Do not substitute a copied approval
snapshot for the current review. If any relevant answer source is inaccessible or
inconsistent, hold affected outreach and report the missing source.

Read explicit approvals, existing Outreach entries, drafts and confirmed activity
through a recorded cutoff. Include approvals from earlier days, not just
yesterday. An incomplete profile review does not hold up its individual Yeses.

Match by customer and canonical noticed person/relationship ID, including known
identity merges. One person has one Outreach entry across profiles. Preserve all
approval sources in the private run record and useful profile context in the page.
List membership alone is not proof of human approval. Do not create an entry for
a guessed approval, unresolved identity or example used only for calibration.

When an entry already has a draft, omit Message draft from property/content
writes entirely unless this step explicitly requests a revision. Do not copy it
back while changing status, activity or metrics: even punctuation normalization
can overwrite human edits. Append dated activity and patch only changed fields.

Process confirmed sends, target replies, bookings and explicit drops before
deciding what needs a draft. Preserve their actual event dates, source and channel;
missing dates remain unknown. A late-arriving older event must not regress a
Booked or Dropped status. Conflicting evidence needs reconciliation, not guessing.

| Person's current state | Action |
|---|---|
| Explicit Yes, no entry | Create from the customer's Outreach entry template at To contact. |
| To contact, no usable draft | Prepare the first draft, including missed approvals from earlier days. |
| Draft already exists | Preserve it, especially human edits; revise only when requested or new evidence makes it inaccurate. |
| Already contacted, replied, booked or dropped | Do not create a first draft or another entry. |
| Due follow-up with an agreed next step | Prepare that follow-up if still appropriate; reuse an existing unsent follow-up draft. |

If approval was withdrawn (No, Not sure, undo, or no remaining current Yes across
its valid approval sources), stop pending outreach. Mark an unsent To contact entry
Dropped with a dated withdrawal reason and Next step explaining the hold. Preserve
its draft, human edits and history by omitting Message draft from this update.
The withdrawal patch contains only Status, Next step and appended Activity;
never include the preserved draft text in that patch. Do not reopen a Dropped entry after a renewed
Yes without an explicit request. For contacted/replied/booked entries, preserve
confirmed history/status and put the hold in Next step; do not prepare follow-ups.
Recheck approval immediately before saving a new draft. A reply can require a different next step; do not
blindly prepare a “no response” follow-up after one arrives.

## Prepare a message someone can send

Read the customer's ICP, meeting qualification criteria, offer and sender guidance
from their workspace, alongside the relationship context and profile hypothesis.
Choose a direct approach or an introduction through a
named, evidenced connection. Recommend a sender and usable channel from the
available facts. Where an essential sender, route or offer detail is missing,
save what is useful and make the missing decision the Next step; do not invent it.

- Make the message specific to the person, honest about the relationship, and
  easy to answer with one clear next step toward a relevant meeting. This can be
  a fit check or introduction first, rather than forcing a calendar request into
  every message. Fit the channel and verified limits.
- For email, include a subject. For an introduction, identify the intermediary
  and distinguish the request to them from any forwardable message for the target.
- Put copyable text in Message draft; fit rationale, route and profile context in
  Context. Sender, Channel, Status, Next step and noticed relationship belong in
  properties. Activity contains dated facts, not another copy of the current plan.
- Keep Follow-up date if already agreed. It is the next planned follow-up date,
  often a second message if there is no reply. Do not invent a universal interval
  or mark a follow-up sent because its date has passed.

Read back each saved draft and entry before counting it as prepared. Record its
identity in the private run record so a retry catches up instead of duplicating.

## Report what is happening

Update the Outreach row in What’s happening and the Outreach and Meetings metrics
from confirmed events. Patch only outreach fields: contacted, replied, booked,
reply rate and booking conversion, plus their confirmed event dates. Never write
Reviewed, Yes rate, opportunity counts, profile results or learning during Daily
outreach, even when those values appear in a saved dashboard snapshot. Those
fields belong to Daily opportunities and may have changed since that snapshot.
Keep the original baseline intact. Maintain the relevant
weekly review with material activity and results, preserving human decisions.

Prepare one concise daily digest: current opportunity lists and review counts,
drafts needing attention, confirmed outreach results, and the customer's next
action. Read the latest verified opportunity state; the two routines may run at
the same time. Do not claim today's lists are ready while their run is pending.

Deliver to Slack or Telegram only when the user has explicitly authorized that
destination and delivery. A configured channel by itself is not authorization.
When delivery is unset or unavailable, return/save the digest and complete the
Notion work. After an uncertain send result, check for the existing message before
retrying; if delivery cannot be resolved, report uncertainty rather than resending.

Ask the customer to confirm which messages they sent, the sender, channel and
date, then capture replies and accepted calendar invites as evidence arrives.
Do not send prospect messages, contact intermediaries, book meetings or change
sharing settings as part of this routine.

## Record the run

Save entry IDs, current approval sources, verified operation checkpoints and
activity fingerprints privately. Record supported instruction improvements as
candidates; broader skill maintenance is separate from this manual run.

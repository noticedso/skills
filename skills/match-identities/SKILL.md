---
name: match-identities
description: >-
  Triage the cross-source identity matches noticed proposes for the user's
  network: confirm the ones that are the same person, clear the false
  positives, and merge obvious duplicates. Pulls the review queue with
  `list_identity_matches` (status: 'pending') and acts on each row with
  `accept_identity_match` (merge), `mark_different_people` (durable "not the
  same person"), or `dismiss_identity_match` (soft "not now"). Use whenever the
  user says "review my matches", "go through my proposed matches", "clean up
  duplicates", "are these the same person?", "any duplicate contacts?", "merge
  the duplicates in my network", "approve/reject the identity suggestions", or
  asks to tidy who's-who. Also fills profile GAPS, email-only contacts with no
  LinkedIn/GitHub, via `list_profile_gaps` + `add_profile_to_person` ("add a
  profile for X", "here's the LinkedIn for that contact"). Writes to the network
  (merges + disconnects), so it confirms before merging anyone who isn't an
  obvious duplicate. Read the queue freely; act deliberately.
---

# match-identities

noticed continuously proposes that two records are the **same human** across
sources: an email-only contact ↔ their LinkedIn/GitHub, or two near-duplicate
people. This skill walks that review queue with the user and resolves each one:
**accept** (they're the same → merge), **mark different** (they're not → durable
disconnect), or **dismiss** (not sure / not now → soft).

## flow

1. **Pull the queue.** `list_identity_matches({ status: "pending" })`. Each row has:
   - `identity_a` / `identity_b`: the two sides (name + `person_id`; the
     `person_id` is `null` when a side is an email-only contact with no person yet).
   - `confidence`, `channel` (how it was proposed: `email_equality`,
     `company_overlap`, `external_search`, `name_fuzzy`, …), and a `reason`.
   - **the handle to act on**: exactly one of:
     - `candidate_id` (a proposed merge between two real people), or
     - `profile_a` / `profile_b` (the review queue's usual case: an
       `email:<addr>` ↔ `github:<id>`/`linkedin:<vanity>` pair, where one side
       has no person and `candidate_id` is `null`).

   Scope to one person with `person` when the user is reviewing a specific
   cluster ("review the matches for Filipe"). Pass a bigger `limit` (max 100) to
   see the whole queue.

2. **Judge each row: same person or not?** Lead with the evidence in `reason`
   and the two names/identifiers. Decide per row:
   - **Clearly the same** (matching name + handle/email, or `email_equality`) →
     a candidate for **accept**.
   - **Clearly different**: different names/people, OR a **shared/role email**
     matched to one individual (`hello@`, `contact@`, `general@`, `team@`,
     `info@` at a company → almost always a false positive from
     `company_overlap`) → **mark different**.
   - **Genuinely unsure** → **dismiss** (or leave it; don't guess).

   When unsure which two records a name refers to, use `resolve_person` /
   `get_person` to pull more context before deciding.

3. **Act**, passing whichever handle the row carries:
   - **Accept (merge):** `accept_identity_match({ candidate_id })` OR
     `accept_identity_match({ profile_a, profile_b })` OR
     `accept_identity_match({ person_a, person_b })`. The first/target survives;
     the user's own person always survives.
     - If noticed has counter-evidence it **does not merge**, it returns
       `needs_confirmation: true` with the conflicting evidence and a
       `confirmation_token`. **Relay that evidence to the user.** Only if they
       review it and still say it's the same person, call again with the
       `confirmation_token`. Never pre-set the token.
     - `admin_required: true` (a verified sign-in says the identity belongs to
       someone else) → tell the user an admin must resolve that one on the
       dashboard; don't try to force it.
   - **Mark different (durable):** `mark_different_people({ profile_a, profile_b })`
     (or `candidate_id` / `person_a, person_b`). Records a lasting "not the same
     person" so noticed stops suggesting it. Reversible by an admin.
   - **Dismiss (soft):** `dismiss_identity_match({ … })`. Stops it surfacing for
     now; it may return later if new evidence appears.

4. **Batch sensibly.** A cluster of obvious same-company false positives (e.g. a
   dozen `*@apple.com` emails matched to one person) → mark each different,
   then report the count ("cleared 11 false positives for Filipe Lopes"). Don't
   ask per-row for the obvious ones; do ask before any merge that isn't a clear
   duplicate.

5. **Close out.** Summarize what changed: merged / marked-different / dismissed
   counts, and offer to re-pull `status: "pending"` to confirm the queue shrank.

## fill profile gaps (add a profile)

The flip side of the queue: contacts noticed has **no profile for**: email-only
people with no LinkedIn/GitHub. They can't be matched until noticed knows their
profile, so you give it one.

1. **List the gaps.** `list_profile_gaps()` → email-only contacts (person_id,
   name, email, and any URL already submitted). This is the "Add a profile" list.
2. **Attach a URL.** When the user knows (or you find) a contact's LinkedIn/GitHub,
   `add_profile_to_person({ person_id, url })` with a `linkedin.com/in/…` OR
   `github.com/…` URL. Two outcomes:
   - **applied** → that profile was already in noticed → matched + merged into one
     record.
   - **queued** → new profile → noticed fetches + enriches it, then matches; tell
     the user it'll resolve shortly.
3. Use this to ENRICH a thin contact, not to merge two existing records (that's
   accept_identity_match / suggest_identity_match). One URL per call (LinkedIn XOR
   GitHub).

## the rule

- **Reads are free; writes are deliberate.** Pull and judge the whole queue
  freely. Merging two records is a structural change, so only do it for clear
  duplicates without asking, and ask first for anything ambiguous.
- **Respect the confirmation gate.** If accept returns `needs_confirmation`, show
  the evidence and get a real yes before passing the token back. If it's
  `admin_required`, route to an admin; don't force it.
- **Shared/role emails are not people.** `hello@`, `contact@`, `support@`,
  `team@`, `general@` matched to an individual is a false positive → mark
  different.
- **Mark-different is durable; dismiss is soft.** Use mark-different for "these
  are genuinely different people"; dismiss for "not now / unsure".
- Everything is reversible by an admin, but say what you did, plainly.

## tool needs

- `noticed`: `list_identity_matches` (the queue), `accept_identity_match`,
  `mark_different_people`, `dismiss_identity_match` (the actions),
  `list_profile_gaps` + `add_profile_to_person` (fill missing profiles), and
  `resolve_person` / `get_person` (context when a row is ambiguous).

## explicitly NOT in scope

- Adding people, logging interactions, or editing notes/tags (that's other
  skills).
- Guessing on ambiguous pairs: dismiss or ask instead of forcing a merge.
- Overriding a verified-sign-in (`admin_required`) conflict: that's admin-only.

## examples

**Review the whole queue.**
Input: `go through my proposed matches`
Action: `list_identity_matches({ status: "pending", limit: 100 })` → group by the
named side, judge each, then act: accept the clear duplicates, mark-different the
role-email/company-overlap false positives, dismiss the unsure ones. Report counts.

**Clear a false-positive cluster.**
Input: `the Apple matches are all wrong`
Action: for each pending row whose email is `*@apple.com` matched to the
same person, `mark_different_people({ profile_a, profile_b })`. Close with
"cleared 11, they were a company-overlap false positive."

**Confirm a real duplicate.**
Input: `diogoribeiro@redlightsoft.com is the same as Diogo Freitas Ribeiro`
Action: find the row, `accept_identity_match({ profile_a, profile_b })`. If it
returns `needs_confirmation`, relay the evidence; merge with the token only after
the user confirms.

**Hit the confirmation gate.**
Accept returns `needs_confirmation` with "their commit email points to a different
GitHub account" → show that to the user. They still say same person → call
`accept_identity_match` again with the returned `confirmation_token`.

**Add a profile to a thin contact.**
Input: `erick@gomry.com is github.com/erickz`
Action: find the contact via `list_profile_gaps()` (or `search_people`), then
`add_profile_to_person({ person_id, url: "https://github.com/erickz" })`. If it
comes back queued, tell the user noticed will fetch + match it shortly.

**Work the gap list.**
Input: `any contacts missing a profile?`
Action: `list_profile_gaps()` → show the email-only contacts; offer to attach a
LinkedIn/GitHub URL for any the user can provide.

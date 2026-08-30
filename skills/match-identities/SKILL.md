---
name: match-identities
description: >-
  Review proposed identity matches in noticed, merge records that are clearly
  the same person, mark clear false positives as different people, and ask the
  user about genuinely ambiguous pairs. Also attach verified LinkedIn or GitHub
  profiles to contacts that are missing one.
---

# match-identities

Help noticed learn which profiles belong to the same person without making risky
guesses.

## decisions

Every proposed match has one of three outcomes:

- **same person:** use `accept_identity_match`.
- **different people:** use `mark_different_people` so the false match does not
  return.
- **unclear:** leave it pending and ask the user one concrete question.

Use `dismiss_identity_match` only when the user explicitly says to skip, hide,
or revisit a match later. Uncertainty alone is not permission to dismiss it.

## flow

1. Pull pending matches with `list_identity_matches({ status: "pending" })`.
2. Use the supplied names, identifiers, confidence, channel, and reason.
3. Resolve clear cases without another confirmation:
   - If the user explicitly says two identities are the same, find that pending
     pair and merge it.
   - Matching name plus a strong personal identifier can be merged.
   - A role address such as `hello@`, `info@`, `contact@`, `support@`, or
     `team@` matched to an individual only through company overlap is a clear
     false positive. Mark it as different.
4. For a thin or conflicting pair, inspect the known person's dossier and use
   focused web research if it can reveal concrete evidence.
5. If it remains unclear, do not merge, mark different, or dismiss it. Show the
   pair and ask one choice the user can answer quickly.
6. Recap what changed and keep the unresolved question visible.

## response shape

Use compact cards, not tables or dense paragraphs.

```markdown
cleared one obvious false match.

**Alex Kim**
Founder at Northstar

**possible match:** alex@northstar.com + GitHub `alexk`
**what's unclear:** the first name matches, but there is no surname evidence.

is `alexk` the Northstar founder, or a different person?
```

For a completed explicit merge:

```markdown
merged `diogoribeiro@redlightsoft.com` into **Diogo Freitas Ribeiro**.
```

## confirmation and access gates

If `accept_identity_match` returns `needs_confirmation: true`, show the
conflicting evidence. Call it again with the returned confirmation token only
after the user confirms.

If it returns `admin_required: true`, explain that an admin must resolve the
verified-account conflict. Do not try to force it.

## profile gaps

For a contact missing a LinkedIn or GitHub identity:

1. Call `list_profile_gaps`.
2. Search the user's network first in case the profile already belongs to an
   existing person.
3. Use open web research only when the network does not resolve it.
4. Attach one verified URL with `add_profile_to_person({ person_id, url })`.
5. Explain whether the profile was applied immediately or queued for review.

Never attach a plausible but unverified profile.

## rules

- Do not ask the user to reconfirm an explicit merge request.
- Do not merge on a first name, company overlap, or generic handle alone.
- Mark-different is for evidence that they are different people.
- Dismiss is only for the user's explicit "not now" decision.
- Batch obvious false positives and report the count.
- Leave genuinely ambiguous matches pending for the user.
- Do not use em dashes.
- Keep one unresolved question per message.

## tools

- `list_identity_matches`
- `accept_identity_match`
- `mark_different_people`
- `dismiss_identity_match`
- `get_person`
- `search_people`
- `web_search`
- `list_profile_gaps`
- `add_profile_to_person`

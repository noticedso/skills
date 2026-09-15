---
name: search-network
description: >-
  Find people in the user's noticed network through a direct natural-language
  lookup. Use for questions such as "who do I know at X?", "find designers in
  Berlin", "any investors in my network?", or "how many founders do I know?".
  This is a focused, read-only lookup. Use a broader goal workflow when the
  person wants help deciding who could advance a business goal.
---

# Search network

Answer a direct question about who is in the person's network. Search first
when the request is specific enough, then return a small, readable result.

## Search

Use `search_people` for people and for counts within a filtered group. Use
`network_summary` only for the whole network, source totals, and network-shape
questions because it cannot apply role, company, location, skill, or tag
filters.

- Default to `scope: "own"` and `limit: 25`.
- Use `scope: "public"` only when the person explicitly asks to look beyond
  their network or find a warm path to someone they do not know.
- For public searches, use `limit: 10`.
- Put clear filters into `company`, `location`, `skills`, `tags`, or `role`.
  Keep seniority terms such as `CEO`, `CTO`, `head of`, and `VP` in `q`.
- Supported role groups are `engineer`, `designer`, `product`, `gtm`,
  `founder`, `recruiter`, `investor`, and `other`. `gtm` includes sales,
  growth, marketing, partnerships, and business development.
- When several dimensions must all match, join the important free-text terms
  with `AND`.
- Do not invent a filter that the person did not provide.
- For a filtered count such as `how many founders do I know?`, call
  `search_people` with the relevant filters and report its authoritative
  `total` or `strong_total`. Do not count only the visible page of people.

Ask one short question before searching only when the request has one very
broad dimension, such as `any designers?`. Make it easy to answer by giving
concrete choices:

> any company or city, or should I start with the people you know best?

For a specific request such as `who do I know at Stripe?`, search immediately.

## Thin or missing data

A zero from a structured filter can mean that field is missing from some
records. Retry once with the same term in `q` before saying there are no
matches.

If a broader retry still returns nothing, say so plainly. Mention public scope
only when looking outside the person's network would answer the request.

If a public search fails, rerun the same query in the person's own network and
say that the result only covers their network.

## Present people as cards

Show the strongest 5 to 10 useful matches. Use fewer when fewer are relevant.
Do not use a Markdown table or compress several people into one paragraph.

Start each person with a numbered, bold name. Include only verified details:

```markdown
**1. Ana Costa**
Product lead at Stripe in Lisbon

**fit:** works at the company you asked about
**relationship:** strong relationship; last interaction 18 days ago

**2. Maya Chen**
Design systems lead at Stripe in London

**fit:** works at the company you asked about
**relationship:** moderate relationship; last interaction four months ago
```

Use `**match:**` instead of `**fit:**` when it sounds more natural for the
request. Omit a line when the returned data does not support it. Missing
interaction data does not mean the relationship is weak or inactive.

If many more matches exist, say that briefly and offer two concrete ways to
narrow the same search. Do not dump another page by default.

End with one easy question tied to the visible results, not a generic offer.
For example:

- `should I look closer at Ana or Maya?`
- `should I narrow these to Lisbon or to the people you know best?`

When the person chooses a number or name, call `get_person` and show the useful
relationship context for that person.

## Boundaries

- This skill reads the network. It does not add or edit relationships.
- Do not turn a direct lookup into goal discovery.
- Do not claim that missing profile or interaction fields prove absence.
- Do not use em dashes.
- Keep the answer compact and conversational.

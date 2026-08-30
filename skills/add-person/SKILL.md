---
name: add-person
description: >-
  Add or update someone in noticed without creating duplicates. Use when the
  user asks to add, save, remember, or update a person, or shares a profile with
  relationship context. A clear request is permission to make reversible
  relationship writes. Ask only when identity or essential context is unclear.
---

# add-person

Save a person and the useful relationship context the user gave you.

## core rule

Always search the user's network before creating a person. If the identity and
request are clear, complete the reversible write immediately and report what was
saved. Do not add a preview or ask for confirmation the user already gave.

Ask one easy question only when you cannot safely tell which person they mean,
whether the person already exists, or when a past interaction date is required
but missing.

## flow

1. Extract identifiers and context from the user's message: name, company,
   profile URL or handle, what happened, and when it happened.
2. Search the user's own network with `search_people`. Use the strongest
   identifier available. Do not use public-network search.
3. Resolve the identity:
   - One strong match: update that person.
   - Several plausible matches: show concrete choices with role or company and
     ask one question. Make no writes yet.
   - No match plus a clear profile URL, handle, or full identity: create the
     person.
   - No match plus only a vague or partial name: ask for a last name, company,
     or LinkedIn URL. Make no writes yet.
4. If the user says they met, spoke, called, or messaged the person, log that
   interaction with the actual date. Convert relative dates using the verified
   current date. Do not invent an interaction when the user is only saving a
   contact.
5. Save what the user said firsthand with `add_note`. Save web research, if any,
   with `add_memory`. Keep distinct claims separate.
6. Read back the result in a few natural lines: who was added or updated, the
   interaction and date if logged, and the useful context saved.

## writes

For a new person:

```text
add_to_network({
  free_form: { name, linkedin_url?, github_login?, headline? },
  tags?
})
```

For an interaction:

```text
log_interaction({
  person_id,
  type: "in_person" | "call" | "message",
  occurred_at: "ISO timestamp",
  payload: { summary }
})
```

Use `type: "in_person"` when the user says they met someone. Never use the old
`kind: "met"` shape. Always set `occurred_at` for a past interaction.

For context:

```text
add_note({
  person_id,
  content: "what the user said",
  occurred_at: "ISO timestamp",
  captured_via: "add-person"
})

add_memory({
  person_id,
  content: "what public research found",
  occurred_at: "ISO timestamp",
  captured_via: "add-person"
})
```

Use `get_person({ person_id, include: "dossier" })` before appending to an
existing person when you need to avoid logging the same interaction twice.

## response examples

Clear request, after the tools succeed:

```markdown
saved **Maya Chen** to noticed.

i logged that you met yesterday and noted that she's building payment
infrastructure.
```

Ambiguous identity:

```markdown
i found two Sarah Chens. which one did you meet?

- **Sarah Chen**, founder at Relay
- **Sarah Chen**, investor at Seedcamp

if neither, send me her company or LinkedIn.
```

## rules

- A clear "add", "save", "remember", or "update" request is authorization for
  the reversible writes it names.
- Never create a duplicate without searching first.
- Never guess structured identity fields.
- Do not force web research when the user already supplied a clear profile.
- Do not show raw tags, database language, or internal provenance labels.
- Do not use em dashes.
- Keep questions and readbacks short.

## tools

- `search_people`
- `get_person`
- `add_to_network`
- `update_person`
- `log_interaction`
- `add_note`
- `add_memory`
- `web_search` only when a thin identity needs help

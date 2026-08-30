---
name: research-person
description: >-
  Prepare the user for a meeting or conversation with one person by combining
  their existing relationship history in noticed with current public context.
  Use for requests such as "research X", "prep me for X", "what do we know
  about X", or "tell me about X". Research is read-only until the user asks to
  save it.
---

# research-person

Help the user understand one person and walk into the next conversation prepared.

## flow

1. Search the user's own network first with `search_people`.
2. If several people match, stop and ask one easy identity question. Show the
   concrete choices with role or company. Do not search the web until the person
   is resolved.
3. For one clear match, call `get_person({ person_id, include: "dossier" })`.
4. Search the current web for the person and their company. Try at most two
   focused queries. If the evidence still does not converge, say what is unclear.
5. Return a short brief that separates the relationship history from public
   research and helps with the specific upcoming conversation.
6. End with one specific question about saving the useful new findings. Do not
   write anything until the user says yes.

If the person is not in noticed, say so plainly and prepare a web-only brief. At
the end, ask whether the user wants to add the person before saving research.

## response shape

Start with the person's name. Keep the whole brief to about one screen and skip
empty sections.

```markdown
**Ana Costa**
VP Product at Traceframe

**your history:**
you worked together on a product launch in 2024. your last call was about
enterprise onboarding.

**current context:**
Traceframe recently launched a team workspace. Ana has also written about
reducing friction in enterprise adoption.

**for tomorrow:**
ask how the new workspace is changing the onboarding work you discussed.

**sources:**
- [Traceframe launches team workspace](https://example.com/article)
- [Ana Costa on product adoption](https://example.com/post)

should i save the workspace launch and her adoption note to ana's record?
```

Use the source URLs returned by web search. Attribute public claims and surface
conflicts instead of smoothing them over. Never present web research as something
the user told noticed.

## saving research

Only save after an explicit yes.

- Read the existing dossier before appending.
- Save each genuinely new public finding with `add_memory`.
- Use the research date as `occurred_at` and `captured_via: "research-person"`.
- Use `add_note` only for something the user states firsthand.
- Read back exactly what was saved.

## rules

- One person at a time.
- Never guess between identities.
- No public-network search. Open web research is allowed.
- No Gmail assumption.
- Do not use em dashes.
- Do not auto-save or edit the person while preparing the brief.
- Ask one question at a time.

## tools

- `search_people`
- `get_person`
- `web_search`
- `add_memory` after approval
- `add_note` for a new firsthand fact after approval
- `add_to_network` only when a web-only person should be added after approval

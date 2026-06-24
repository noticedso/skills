---
name: add-person
description: >-
  Add or update a person in noticed, dedupe-first. Takes whatever the user
  provides (LinkedIn URL, name, handle, freeform context, batch from an event),
  resolves against the existing network — updating in place when found, creating
  only when not — logs a `met` interaction with the right date by default, and
  saves freeform context as a durable memory. Trigger on "add X", "save X",
  "put X in noticed", "remember X", a pasted LinkedIn/GitHub URL with context,
  or a batch from tonight's event.
---

# add-person

Add or update a person in noticed. The primary decision is **create vs. update**: always check whether someone already exists before minting a new record — updating in place is better than a duplicate every time.

Slow and deliberate on identity over fast and guessing.

## flow

For each person in the message:

1. **Pull out identifiers + context.** Names, URLs (LinkedIn / GitHub / Twitter), handles, freeform words. Many people in one message → one batch.

2. **Normalize companies first.** Web search to canonicalize ("Amplo Market" → Amplemarket). Carry the canonical name into all searches.

3. **Resolve identity — this is step one, not an optional nicety.**
   - Parallel own-network searches: name-only, and name + canonical company.
   - Multi-word names join with `AND` in `q` (`"Austin AND Rief"`, not `"Austin Rief"`) — `q` OR-matches all fields and explodes on common terms. Single-token names stay as-is.
   - Structured-filter zero = thin data, not absence. If `company` returns 0, drop it and rely on the name-only result.
   - If still 0 in own network AND the input was a bare name (no URL/handle), web search for a LinkedIn/GitHub + role/company. One search for a straightforward enrich; two reformulations max — then ask. Don't grind.

   Always: own network → web → ask. No public-scope search.

4. **Decide per person:**
   - **Strong match** (single hit, name + company aligns, or URL/handle exact) → already in network; update record, log interaction, save memory.
   - **Uncertain** (multiple same-name hits, no company corroboration) → surface candidates in the preview; don't decide unilaterally.
   - **Nothing matches** → new contact. With a URL/handle, proceed to create. Bare name → ask first (voice notes mishear names).

5. **Determine interaction date.** The skill logs a `met` interaction by default. The *interaction date* is often not today — it's when the meeting happened, not when the capture was sent. Determine it before writing:
   - Event link present (Luma / Partiful / lu.ma URL, named event with a known date) → use that event's date as `occurred_at`.
   - Explicit date signal in the message ("yesterday", "at dinner last Tuesday", "at [event] on June 21") → derive the ISO date.
   - No date signal → ask in the preview. Do not silently default to today when the date is genuinely unknown.

   Surface the inferred date in the preview ("logging a `met` on 2026-06-22 from the Luma link — correct?") so the user can correct it in the same reply.

6. **Tag silently.** Role, company, sector, event-as-context (e.g. `myosin-dinner`), location. Applied at write time. User corrects at preview. Tags merge; removal needs the UI.

7. **Preview** (structure below).

8. **On the go-ahead, fan out writes, then read back.** Identity questions and date questions both resolve into the same go-ahead reply — not separate round-trips.

---

## log interaction — default ON

Log a `met` interaction for every person added or updated through this skill unless context clearly says otherwise — e.g. the user is pre-loading someone they haven't met yet, or explicitly says "haven't met them." When in doubt, log it.

**Dedupe guard:** if the person already exists, call `get_person(include: 'dossier')` and check their interactions. If a `met` for the same date is already logged, skip — don't double-log.

```
noticed.log_interaction({
  person_id,
  kind: "met",
  occurred_at: "<ISO timestamp>",      // e.g. "2026-06-22T00:00:00Z"
                                        // omit only if user confirmed "haven't met them"
  payload: { summary: "<one-line what you met about>" }
})
```

`occurred_at` is an ISO timestamp. Omitting it silently defaults to now — which is wrong for back-dated events. Always set it explicitly.

---

## save memory — rich context here, not in default_notes

After the interaction, save the freeform context — who they are, what they need, what was discussed, how they can help — as a durable memory attached to the person record.

```
noticed.add_memory({
  person_id,
  content: "[mcp · skill:add-person · YYYY-MM-DD]\n<source-tagged context>",
  occurred_at: "<same ISO timestamp as the met interaction>",
  tags: [...]      // optional; inherit from person tags where relevant
})
```

- Each content line tagged `[from user]` or `[research, unverified]`. Flag conflicts between the user's account and web research — write both, tag each.
- Set `occurred_at` to the **same** ISO timestamp as the `met` interaction, and match the YYYY-MM-DD in the memory prefix to it — the memory and the interaction describe the same moment, so back-date both. Don't anchor episodic context to write-time.
- `add_memory` attaches to `relationship.memories` on the person record, readable back via `get_person`. This is the right home for dated, episodic context.
- **`default_notes` is not the right place for rich context.** Reserve it for terse, stable record-level annotations (e.g. a pronunciation note, a permanent caveat) — not for "what we talked about at that dinner."
- Date alignment between the two records is native via `occurred_at`. (A true foreign-key ref linking the memory to the interaction is still a future enhancement; until then, matching dates is enough — no manual prefix-matching trick needed.)

---

## preview structure

Organized by **what's actionable**, not by person. **Empty zones collapse** (a clean batch is just the ready list + the close).

```
ready to save to noticed:

<a sentence or short paragraph per resolved person — who they are, what's about to happen,
and what date the `met` will be logged on. One line when context is thin; a few sentences
when there's something to say. Don't pad; never invent detail. Always surface the
interaction date: "logging a `met` on 2026-06-22 from the Luma link".>

need from you:

<only people needing a decision — ambiguous identity, bare name with no corroboration,
unresolved interaction date. Pull each out so it can't be missed. One question per person.>

---
<closing line naming what the reply triggers — "reply with the date and I'll save all three
to noticed" — or just "save to noticed?" when nothing's blocking.>
```

- Prose, not plan rows. No `[merged]` / `[new]` / `[from network]` tags shown to the user.
- Plain status language: "new contact", "already in your network", "couldn't place her". Never bracket labels or "auto-resolve".
- Names in **bold**. Lowercase, warm.
- **Don't print a `tags:` row.** Fold a tag into prose only if worth surfacing ("saving her as a founder in consumer AI"); otherwise apply silently.
- The close names the effect and says "noticed".

---

## provenance — two surfaces

- **Chat (preview + readback):** web-found facts attributed softly in prose ("his LinkedIn says founder in consumer AI") so research never reads as user-stated. No bracket tags shown in chat.
- **Stored memory (system-only):** every line tagged `[from user]` or `[research, unverified]`, written into `add_memory` content. **Never shown verbatim in chat.**

Flag conflicts between the user's account and research — write both, tag each.

---

## readback (after writes land)

Recap what happened per person — unprompted. noticed writes are silent; this is the only confirmation. Write like a person, not a database row: who's new vs updated, what interaction was logged and on what date, the memory gist, the link if any. Flag web-sourced facts conversationally ("her headline's from the web, worth a glance").

---

## write sequence

`add_to_network`'s `free_form` sets identity at creation: `name`, `headline`, `linkedin_url`, `github_login`. For someone **already in the network**, `update_person` can set `company`, `role`, and `email` as user overrides — each wins over the imported/derived value; pass `null` to clear. Write a web-found role/company/email there. `headline`/`linkedin_url`/`github` are not `update_person` params, so a web-found headline for an existing record still goes in the memory body (`[research, unverified]`).

`add_to_network` has no notes param — context goes through a follow-up `add_memory` call, never on the creation call.

```
# — already in network —
noticed.get_person({ person_id, include: "dossier" })
  # check for existing met on this date before writing
noticed.log_interaction({ person_id, kind: "met", occurred_at: "...", payload: { summary: "..." } })
noticed.add_memory({ person_id, content: "[mcp · skill:add-person · YYYY-MM-DD]\n<source-tagged context>", occurred_at: "<same as met>" })
noticed.update_person({ person_id, tags: [...], company?, role?, email? })   # tags merge; company/role/email are overrides

# — new contact —
noticed.add_to_network({ free_form: { name, linkedin_url?, github_login?, headline? }, tags: [...] })
  # → person_id returned
noticed.log_interaction({ person_id, kind: "met", occurred_at: "...", payload: { summary: "..." } })
noticed.add_memory({ person_id, content: "[mcp · skill:add-person · YYYY-MM-DD]\n<source-tagged context>", occurred_at: "<same as met>" })
```

---

## invariants

- **Never fabricate structured identity fields.** Blank beats a plausible guess. LinkedIn URL, company, handle only from explicit input or confirmed web source.
- **Search own network before `add_to_network`.** One duplicate is worse than one extra lookup.
- **Preview before save.** One confirm per batch. Corrections fold into the same reply. Always read back.
- **`log_interaction` is append-only.** Check existing interactions via `get_person(include: 'dossier')` before writing; don't double-log the same event on the same date.
- No writes before the go-ahead.

---

## tool call reference

```
noticed.search_people({ q: "Name AND Company", scope: "own" })
noticed.get_person({ person_id, include: "dossier" })
noticed.add_to_network({ free_form: { name, linkedin_url?, github_login?, headline? }, tags: [...] })
noticed.update_person({ person_id, tags: [...], company?, role?, email? })
noticed.log_interaction({ person_id, kind: "met", occurred_at?: "ISO timestamp", payload?: { summary } })
noticed.add_memory({ person_id, content: "...", occurred_at?: "ISO timestamp", tags?: [...] })
web_search(...)     // canonicalize companies, enrich thin identity
```

## explicitly NOT in scope

- `scope: "public"` searches (that's `search-network`'s job)
- Writing `default_notes` for dated or episodic context (use `add_memory`)
- Surfacing provenance tags or a raw `tags:` row in chat
- Logging an interaction when context clearly says the user hasn't met this person yet
- Writing before the go-ahead

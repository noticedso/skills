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

## save context — your notes vs noticed's research

After the interaction, save the freeform context — who they are, what they need, what was discussed, how they can help — attached to the person record. **Split it by where it came from:**

- **What the user told you** (firsthand: what was discussed, how they can help, plans, their own account of themselves) → `add_note`. The content is theirs; you're the keyboard.
- **What you found on the web** (unverified research: a headline, a company detail, a follower count) → `add_memory`. You worked it out, so it's noticed's.

The tool you pick records **who authored the line**, and that authorship is what tells the reader how far to trust it — a note is firsthand, a memory is researched. So there are **no `[from user]` / `[research, unverified]` tags** and **no `[mcp · skill:…]` or date prefix**: the author carries the provenance, `occurred_at` carries the date.

```
noticed.add_note({   person_id, content: "<what the user told you>",    occurred_at: "<ISO>", tags: [...] })
noticed.add_memory({ person_id, content: "<what you found on the web>", occurred_at: "<ISO>", tags: [...] })
```

- Set `occurred_at` to the same moment as the `met` interaction — that's the date the entry files under. Omitting it defaults to now, which back-dated context should never do.
- One entry per distinct claim — don't concatenate firsthand and researched lines into one blob. When the user's account and web research conflict, write both (one note, one memory) so the disagreement is visible by author.
- Both read back via `get_person`: your notes under `relationship.notes`, noticed's under `relationship.memories`. This is the right home for dated, episodic context.
- **`default_notes` is not the right place for rich context.** Reserve it for terse, stable record-level annotations (a pronunciation note, a permanent caveat) — not "what we talked about at that dinner."

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
- **Stored context (the record):** firsthand lines go through `add_note`, research lines through `add_memory` — the author records the provenance, so no inline tags. **Never echoed verbatim into chat.**

When the user's account and research conflict, write both — one as a note, one as a memory.

---

## readback (after writes land)

Recap what happened per person — unprompted. noticed writes are silent; this is the only confirmation. Write like a person, not a database row: who's new vs updated, what interaction was logged and on what date, the memory gist, the link if any. Flag web-sourced facts conversationally ("her headline's from the web, worth a glance").

---

## write sequence

Structured fields (`linkedin_username`, `headline`, `github`) can only be set at creation via `add_to_network`; `update_person` cannot write them. Web-found headline → `free_form.headline` on a new record, or an `add_memory` line on an existing one (research → memory).

`add_to_network`'s `default_notes` param silently drops — always save context via a follow-up `add_note` / `add_memory` call, not on the creation call.

```
# — already in network —
noticed.get_person({ person_id, include: "dossier" })
  # check for existing met on this date before writing
noticed.log_interaction({ person_id, kind: "met", occurred_at: "...", payload: { summary: "..." } })
noticed.add_note({   person_id, content: "<what the user told you>",    occurred_at: "..." })
noticed.add_memory({ person_id, content: "<web-found research, if any>", occurred_at: "..." })
noticed.update_person({ person_id, tags: [...] })          # tags only; not default_notes for rich context

# — new contact —
noticed.add_to_network({ free_form: { name, linkedin_url?, github_login?, headline? }, tags: [...] })
  # → person_id returned
noticed.log_interaction({ person_id, kind: "met", occurred_at: "...", payload: { summary: "..." } })
noticed.add_note({   person_id, content: "<what the user told you>",    occurred_at: "..." })
noticed.add_memory({ person_id, content: "<web-found research, if any>", occurred_at: "..." })
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
noticed.update_person({ person_id, tags: [...] })
noticed.log_interaction({ person_id, kind: "met", occurred_at?: "ISO timestamp", payload?: { summary } })
noticed.add_note({   person_id, content: "...", occurred_at?: "ISO timestamp", tags?: [...] })   // firsthand: the user's own words
noticed.add_memory({ person_id, content: "...", occurred_at?: "ISO timestamp", tags?: [...] })   // research: what you worked out
web_search(...)     // canonicalize companies, enrich thin identity
```

## explicitly NOT in scope

- `scope: "public"` searches (that's `search-network`'s job)
- Writing `default_notes` for dated or episodic context (use `add_memory`)
- Surfacing provenance tags or a raw `tags:` row in chat
- Logging an interaction when context clearly says the user hasn't met this person yet
- Writing before the go-ahead

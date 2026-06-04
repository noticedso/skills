---
name: remember-person
description: >-
  Save one or more people into noticed. Take whatever the user types
  (a LinkedIn URL, a picture, a name, a handle, or a freeform dump about
  someone), resolve identity carefully, enrich if needed, tag silently,
  preview as prose, save on one confirm. Handles batches (many people in
  one message). Trigger on "add this person", "save [name]", "remember
  [name]", a pasted linkedin/github URL with context, "add a few from
  tonight", "put X in noticed", "add them all", or any capture intent.
---

# remember-person

Primitive for adding people to noticed. Take the user's input, resolve identity, write. Slow and deliberate on identity over fast and guessing.

## flow

For each person in the message:

1. **Pull out identifiers + context.** Names, URLs (linkedin / github / twitter), handles, plus the user's freeform words. Many people in one message → one batch.

2. **Normalize companies first.** If a company is mentioned, web search to canonicalize ("Amplo Market" → Amplemarket). Carry the canonical name into the searches.

3. **Resolve identity, in order:**
   - Parallel own-network searches: name-only, and name + canonical company.
   - Multi-word names join with `AND` in `q` (`"Austin AND Rief"`, not `"Austin Rief"`) — `q` OR-matches all fields and explodes on common terms. Single-token names stay as-is.
   - Structured filter zero = thin data, not absence. If `company` returns 0, drop it and re-rely on the name-only result.
   - If still 0 in own AND the input was just a name (no URL/handle), web search for a linkedin/github + role/company. One search for a straightforward enrich; a few more only for namesake disambiguation. Two reformulations, then ask — don't grind.

   Own network → web → ask. No public-scope search (capture is *who is this*; reachability discovery is `search-network`'s job).

4. **Decide per person:**
   - Strong match (single hit, name + company aligns, or URL/handle exact) → already in network; append a dated block to the existing record.
   - Uncertain (multiple same-name hits, or name-only with no company corroboration) → don't decide; surface candidates in the preview.
   - Nothing matches → new contact. With a URL/handle, state it quietly and move on. Just a name → ask first (voice notes mishear).

5. **Tag silently.** Role, company, sector, event-as-context (e.g. `myosin-dinner`), location. Apply at write time. User corrects at preview. Tags merge.

6. **Preview** (structure below).

7. **On the go-ahead, fan out writes, then read back** what landed. Identity questions resolve into the same go-ahead reply.

## preview structure

Organized by **what's actionable**, not by person. **Empty zones collapse** (a clean batch is just the ready list + the close).

```
ready to save to noticed:

<a sentence or short paragraph per resolved person — what they are + what's about to happen. one line when context is thin; a few sentences when there's something to say. don't pad, never invent detail.>

need from you:

<only people needing a decision — ambiguous identity, missing linkedin, an unresolved name. pull each out so it can't be missed.>

---
<closing line naming what the reply triggers — "reply with the X answer and i'll save all three to noticed" — or just "save to noticed?" when nothing's blocking.>
```

- Prose, not plan rows. No `[merged]` / `[new]` / `[from network]` tags shown to the user.
- Plain status language: "new contact", "already in your network", "couldn't place her". Never bracket labels or "auto-resolve".
- Names in **bold**. Lowercase, warm.
- **Don't print a `tags:` row** — it reads like a database row. Fold a tag into prose only if worth surfacing ("saving her as a founder in consumer ai"); otherwise apply silently.
- The close names the effect and says "noticed".

## provenance — two surfaces

- **Chat (preview + readback):** web-found facts attributed softly in prose ("his linkedin says founder in consumer ai") so research never reads as user-stated. No bracket tags.
- **Stored note (system-only):** every note line tagged `[from user]` or `[research, unverified]`, written **into** `default_notes`, **never shown in chat**.

Flag conflicts between the user's account and research — write both, tag each.

## readback (after writes land)

Recap what landed, per person, unprompted — noticed writes are silent, so this is the only confirmation. Write it **like a person, not a database row**: who's new vs updated, the gist of the note, the link if any. Flag web-sourced facts conversationally ("his headline's from the web, worth a glance").

## writes

`default_notes` appends a dated block, separated from existing notes by a blank line. **Always `get_person` to read existing notes first — never overwrite.**

```
[mcp · skill:remember-person · YYYY-MM-DD]
<content, each line tagged [from user] or [research, unverified]>
```

MCP limit: structured fields (`linkedin_username`, `headline`, `github`) can only be set at creation via `add_to_network`; `update_person` can't write them. So a web-found headline goes in `free_form.headline` on a new record, or the note body (tagged `[research, unverified]`) on an existing one.

```
# already in network: read existing notes, append dated block
noticed.get_person({ person_id, include: "dossier" })
noticed.update_person({ person_id, default_notes: "<existing>\n\n[mcp · skill:remember-person · YYYY-MM-DD]\n<source-tagged context>", tags: [...] })

# new contact: mint id (with known structured fields), then set notes
noticed.add_to_network({ free_form: { name, linkedin_url?, github_login?, headline? }, tags: [...] })
noticed.update_person({ person_id: "<new id>", default_notes: "[mcp · skill:remember-person · YYYY-MM-DD]\n<source-tagged context>" })
```

## the rule

- **Keep blocking questions to a minimum** — ideally one per batch, identity only, only when genuinely unresolvable. Not a hard cap; the point is one smooth confirm, not an interrogation. Multiple ambiguous people go in the one "need from you" zone (still one round-trip).
- One confirm per batch; corrections fold into the same reply.
- Always read back what landed. No silent writes.

## explicitly NOT in scope
- `relationship_types` (overlaps with tags); `log_interaction` (event-debrief / follow-up); `scope: "public"` searches; writing before the go-ahead; surfacing provenance tags or a raw `tags:` row in chat; composed plan-handoff (V3 — though `event-prep` may hand a batch in).

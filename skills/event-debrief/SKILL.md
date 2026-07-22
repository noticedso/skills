---
name: event-debrief
description: >-
  Process a meeting or event dump into structured pieces in noticed:
  people, meeting notes, follow-ups, ideas, references. Use whenever the
  user pastes a debrief from any meeting (1:1 call, walk, dinner, group
  event). Trigger on "debrief", "process this voice note", "here are my
  notes from [event]", "I just had a [meeting / walk / dinner] with
  [person]", or any post-meeting dump. Parses the dump, resolves each
  person against the user's network, builds a unified preview, and writes
  everything in one fan-out on the user's go-ahead.
---

# event-debrief

Orchestrator. Take a meeting dump, parse it, write the right things to the right places. One preview, one confirm, fan out.

Person resolution, provenance, and the prose preview are shared with `add-person` — same conventions, don't restate them. This skill adds the parsing and the routing.

## flow

1. **Parse the dump.** Identify: people met directly; people mentioned only; follow-ups (`my_action` / `waiting_on`); ideas; references (tools, companies, books); anything else useful — don't force a schema. Infer **event title** (short label, also an event tag e.g. `myosin-dinner`) and **event date** (cues: "just had" = today, "last week" = backfill; used as `occurred_at` and in the event summary).

2. **Normalize companies first.** Web search each company to canonicalize ("Amplo Market" → Amplemarket). Carry the corrected name through. If nothing recognizable comes back, flag it unverified in the preview.

3. **Resolve each person** via `add-person`'s flow: parallel own-scope searches (name-only and name+company, multi-word names AND-joined), then web enrichment if a bare name returned 0, then ask. **No public-scope search.** Strong match → already in network; uncertain → surface candidates; nothing → new contact, but ask first on a bare name.

4. **Only after identity is confirmed**, build the preview (below). Never default to a new record silently.

5. **On the go-ahead, fan out** all writes per the routing table. No writes before then.

6. **Read back what landed** — grouped by person + the non-person items. noticed writes are silent; the recap is the only confirmation. Recap what was written, not the whole dump.

## preview structure

Same actionable-first, empty-zones-collapse shape as `add-person`. A debrief writes more than people, so "ready to save" is grouped:

```
ready to save to noticed:

people:
**<name>** — <already in your network / new contact>, <one-line read>. <what's logged>. (fold a worth-surfacing tag into the prose; no tags: row.)

follow-ups:
- <todo> → <on whom, in plain words>

ideas / references:
- <idea or reference>, saved to memory

need from you:

**<name>** — <only people needing a decision. one question each.>

---
<closing line naming the effect — "save all this to noticed?">
```

Inherited from `add-person`: prose not plan rows; **no `[merged]` / `[new]` / `[waiting_on]` / `[memory: fact]` tags shown to the user** (internal routing, not labels); plain status language; names in **bold**; **no `tags:` row** (fold into prose if worth surfacing, else silent); close names the effect and says "noticed".

## routing

| What | Where |
|---|---|
| Person attended (in noticed) | `add_note`/`add_memory` (context, `occurred_at`) + `update_person(tags)` + `log_interaction(kind: 'met', payload: { summary, feel }, occurred_at)` |
| Person attended (new) | `add_to_network` → `add_note`/`add_memory` (context, `occurred_at`) + `log_interaction(kind: 'met', …)` |
| Person mentioned only | Same person write, no `log_interaction(met)` |
| Follow-up about a person | `log_interaction(kind: 'note', payload: { todo, type })` on them. Undated (backend stamps `now` regardless — MCP limit). |
| Follow-up not tied to a person | Closest related person if one fits, else `memory_save(category: 'commitment', "[mcp · skill:event-debrief] <todo>")` |
| Idea / insight | `memory_save(category: 'fact', "[mcp · skill:event-debrief] <idea>")` |
| Reference (tool, company, book) | `memory_save(category: 'fact', "[mcp · skill:event-debrief] <reference>")` |
| Event-level summary | Only if 2+ attended. `memory_save(category: 'fact', "[mcp · skill:event-debrief] <title>, <date>. Attended: A, B, C. Topics: …")` |

Rich person context goes to `add_note` (what the user told you) / `add_memory` (what you researched), not `default_notes`. Pass `captured_via: "event-debrief"` on both so the entry records which skill captured it. Read existing context via `get_person` first; append, never overwrite. The `memory_save` prefix (`[mcp · skill:event-debrief]`) stays — it namespaces global memories for `memory_search`, a different surface from a person's notes. `log_interaction` payloads take no prefix (`kind` + `occurred_at` carry the semantics).

## provenance

Same split as `add-person`: what the user told you → `add_note`, what you researched → `add_memory`. The author carries the provenance — no `[from user]` / `[research, unverified]` tags on person context. Flag conflicts by writing both.

## the company / person rule

Companies, tools, books are **not people** — never person records. When a dump mentions a company you've met nobody from, save it as a `memory_save` fact, attach intro-context to whoever can connect you (`log_interaction` on them), and add a real person record only when the intro lands and you've talked to someone. Don't speculatively create placeholder founders.

## the rule
One confirm per dump. Identity questions are the only blocking step, only when truly ambiguous. Corrections fold into the go-ahead reply. Always read back.

## idempotency caveat
`memory_save` dedupes server-side (safe to re-run for ideas/references/summary). `log_interaction` is append-only and does **not** dedupe — re-running a debrief duplicates meeting notes and follow-ups. Don't run twice on the same dump.

## tool needs
- `noticed`: `search_people`, `get_person`, `add_to_network`, `add_note`, `add_memory`, `update_person`, `log_interaction`, `memory_save`
- `web_search`: canonicalize companies + enrich thin context

## explicitly NOT in scope
- `scope: "public"` searches; speculative person records for companies/founders not met; surfacing provenance tags in chat; re-running on the same dump (no `log_interaction` dedupe).

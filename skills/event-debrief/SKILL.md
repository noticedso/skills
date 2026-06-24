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

Person resolution, provenance, and the prose preview are shared with `remember-person` — same conventions, don't restate them. This skill adds the parsing and the routing.

> Note: `remember-person` is being renamed to `add-person` in PR #13; update this reference once that lands.

## flow

1. **Parse the dump.** Identify: people met directly; people mentioned only; follow-ups (`my_action` / `waiting_on`); ideas; references (tools, companies, books); anything else useful — don't force a schema. Infer **event title** (short label, also an event tag e.g. `myosin-dinner`) and **event date** (cues: "just had" = today, "last week" = backfill; used as `occurred_at` and in the event summary).

2. **Normalize companies first.** Web search each company to canonicalize ("Amplo Market" → Amplemarket). Carry the corrected name through. If nothing recognizable comes back, flag it unverified in the preview.

3. **Resolve each person** via `remember-person`'s flow: parallel own-scope searches (name-only and name+company, multi-word names AND-joined), then web enrichment if a bare name returned 0, then ask. **No public-scope search.** Strong match → already in network; uncertain → surface candidates; nothing → new contact, but ask first on a bare name.

4. **Only after identity is confirmed**, build the preview (below). Never default to a new record silently.

5. **On the go-ahead, fan out** all writes per the routing table. No writes before then.

6. **Read back what landed** — grouped by person + the non-person items. noticed writes are silent; the recap is the only confirmation. Recap what was written, not the whole dump.

## preview structure

Same actionable-first, empty-zones-collapse shape as `remember-person`. A debrief writes more than people, so "ready to save" is grouped:

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

Inherited from `remember-person`: prose not plan rows; **no `[merged]` / `[new]` / `[waiting_on]` / `[memory: fact]` tags shown to the user** (internal routing, not labels); plain status language; names in **bold**; **no `tags:` row** (fold into prose if worth surfacing, else silent); close names the effect and says "noticed".

## routing

| What | Where |
|---|---|
| Person attended (in noticed) | `update_person(default_notes, tags)` + `log_interaction(kind: 'met', payload: { summary, feel }, occurred_at)` |
| Person attended (new) | `add_to_network` → `update_person(default_notes)` + `log_interaction(kind: 'met', …)` |
| Person mentioned only | Same person write, no `log_interaction(met)` |
| Follow-up about a person | `create_action({ person_id, content, remind_at? })` — a real to-do on the relationship, with a reminder date when one is known. |
| Follow-up not tied to a person | If a person fits, `create_action` on them. Only a truly person-less commitment → `memory_save(category: 'commitment', "[mcp · skill:event-debrief] <todo>")`. |
| Intro someone offered | `track_intro({ connector_person_id, target_name, target_org?, status: 'waiting' or 'ready', offered_on, notes })` — the connector must be a resolved person in the network; the target may be partial. |
| Idea / insight | `memory_save(category: 'fact', "[mcp · skill:event-debrief] <idea>")` |
| Reference (tool, company, book) | `memory_save(category: 'fact', "[mcp · skill:event-debrief] <reference>")` |
| Event-level summary | Only if 2+ attended. `memory_save(category: 'fact', "[mcp · skill:event-debrief] <title>, <date>. Attended: A, B, C. Topics: …")` |

Read existing notes via `get_person` before any `default_notes` append; never overwrite. `log_interaction` payloads take no prefix (`kind` + `occurred_at` carry the semantics).

**Intros.** When the dump has someone offering to connect the user to a third party ("X said he'll intro me to Y"), that's an intro, not a note. The connector is resolved like any other person; the target is NOT created as a person record until the intro actually lands — then re-call `track_intro` with `resolved_person_id` to graduate it to done. Same "don't speculatively create placeholder people" rule.

## provenance

Same split as `remember-person`. Note lines tagged `[from user]` / `[research, unverified]`, **system-only, never shown in chat**. Flag conflicts.

## the company / person rule

Companies, tools, books are **not people** — never person records. Someone *mentioned but not met* is also not a new record: link them by `@mention` in an `add_memory`/`memory_save` `content`, or `memory_save({ person })` to attach the fact to a named person already in the network — don't mint a placeholder or guess the closest match. When a dump mentions a company you've met nobody from, save it as a `memory_save` fact. If someone offered to connect you, that's an intro — `track_intro` on the connector (see routing), not a placeholder founder. Add a real person record only when the intro lands and you've talked to someone.

## the rule
One confirm per dump. Identity questions are the only blocking step, only when truly ambiguous. Corrections fold into the go-ahead reply. Always read back.

## idempotency caveat
`memory_save` dedupes server-side (safe to re-run for ideas/references/summary). `log_interaction` and `create_action` are append-only and do **not** dedupe — re-running a debrief duplicates meeting notes, follow-ups, and actions. Before re-adding an action, check `relationship.actions` via `get_person`. Don't run twice on the same dump.

## tool needs
- `noticed`: `search_people`, `get_person`, `add_to_network`, `update_person`, `log_interaction`, `create_action`, `track_intro`, `memory_save`
- `web_search`: canonicalize companies + enrich thin context

## explicitly NOT in scope
- `scope: "public"` searches; speculative person records for companies/founders not met; surfacing provenance tags in chat; re-running on the same dump (no `log_interaction` / `create_action` dedupe).

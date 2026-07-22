---
name: research-person
description: >-
  Research one person before a meeting or call. Pull together what's
  already in noticed and what the web says, then render a concise,
  scannable dossier in chat (overview, interaction history, company
  context, conversation starters, sources), and proactively offer to
  save the enriched context back to noticed. Use whenever the user says
  "research X", "prep me for my meeting with X", "what do we know about
  X", "deep dive on X", "pre-meeting brief on X", or "tell me about X".
  One person at a time. Works whether the person is in noticed or not.
---

# research-person

Single person, deep dive. Read everything available, present cleanly, then offer to save the enriched context back to noticed.

Person resolution is shared with `add-person` — same own → web → ask order. Read-heavy: the deliverable is a dossier in chat; writes only on an explicit "save".

## flow

1. **Resolve the person** via `add-person`'s flow: own-scope search, multi-word names AND-joined. Strong match → use it. Multiple hits → surface candidates. Nothing in own → not in network yet; web-only enrichment, mark not-in-noticed. **No public-scope search.**

2. **Read what's in noticed.** `get_person({ include: "dossier" })` for `default_notes`, tags, recent `log_interactions`.

3. **Web search to enrich:** the person (news, posts, role); their company (canonicalize first; news, funding, product); public output (latest tweet/post/repo). Stop rule: two reformulations that don't converge → ask.

4. **Render a scannable dossier in chat.** Easy to skim, ideally one screen. Sections (skip empties): overview / interaction history (noticed `log_interactions`, dated) / company context / conversation starters / key notes / sources. Lowercase, friend-tone, names in **bold**. (Provenance: see below.)

5. **Proactively offer to save.** Always close with the offer — don't wait to be asked: "want me to save this back to <name>'s record?" Wait for an explicit "save".

6. **On "save":** a tight 3-5 line summary of the *new* findings (not the full dossier). Save each finding as its own `add_memory` entry — research is noticed's, so it lands as a memory, not one of the user's notes. Then read back what was written.
   - In noticed → one `add_memory` per finding, `occurred_at` set to the research date; merge tags.
   - Not in noticed → ask "add them to your network too?" Yes → `add_to_network`, then `add_memory` the findings. No → save nothing.

## provenance — two surfaces

- **Dossier (chat):** attribute web findings inline ("linkedin says…", "a recent piece notes…") so research never reads as fact. Surface conflicts with noticed notes rather than smoothing them.
- **Stored context (the record):** save findings through `add_memory`, so they land as noticed's — researched, not user-stated. Being a memory (not one of the user's notes) is what marks it unverified, so there's no `[research, unverified]` tag and no `[mcp · skill:…]` prefix; `occurred_at` carries the date. A `~40k-users` figure from an aggregator is already flagged as research by being a memory. On the rare line the user stated firsthand, use `add_note` instead.

## writes (only on "save")
Read existing context via `get_person` first; append, never overwrite. MCP limit: `update_person` can't set structured identity fields, so a web-found headline for someone already in noticed goes into an `add_memory` line (research → memory), not a structured field.

## the rule
- One person at a time. Read-heavy; writes only on "save".
- Never silently default to the wrong identity. Ask when ambiguous.
- Don't grind: two reformulations, then ask.
- On save, read back what landed.

## tool needs
- `noticed`: `search_people`, `get_person`, `add_memory` (save research findings), `add_note` (the rare firsthand line), `update_person` (tags), `add_to_network` (only when the user wants to add a new person)
- `web_search`: enrichment + canonicalize companies
- No Gmail (can't assume it's connected).

## explicitly NOT in scope
- Batch research; cold profiling without intent; `scope: "public"` searches; `log_interaction` (event-debrief's job); auto-save without "save"; surfacing provenance tags in chat; composed plan-handoff (V3).

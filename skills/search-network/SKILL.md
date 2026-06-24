---
name: search-network
description: >-
  Find people in the user's noticed network through natural-language queries.
  Wraps `search_people` and returns a compact markdown table of 5-10 results.
  Use whenever the user is looking for someone they might know: "do I know
  anyone at X?", "find me someone who does Y", "who in my network is in Z?",
  "any AI engineers?", "search my network for...", "is there a warm intro to
  X?", "who do I know in [city]?", "who's a founder I'm close to?". Also
  handles "how many..." network-shape questions via `network_summary`, drills
  into a single result via `get_person`, and escalates to `scope: 'public'`
  when the user asks for warm-intro paths or people outside their network.
  Read-only — no writes. Default scope is the user's own network.
---

# search-network

Wrap `search_people` cleanly. Default scope is the user's own network. Show results as a table. Keep it tight — chat doesn't tolerate 100-row dumps.

## flow

1. **Parse the query** into filters where possible: `q` (free text), `company`, `role`, `location`, `skills`, `tags`. Use only what's clearly in the prompt — don't invent filters.

   **Extract role keywords into the `role: [...]` filter** whenever the query names one of the enum values: `engineer`, `designer`, `product`, `gtm`, `founder`, `recruiter`, `investor`, `other`. Don't leave them in `q` — structured matches against the headline field, which is cleaner than free-text fuzzing. `gtm` covers sales, growth, marketing, partnerships, biz-dev.

2. **Vague-query check.** A query is "vague" when it has only one broad dimension with no specifier (e.g. "find AI engineers" → role only, no place/company; "any designers?" → role only). In that case, ask **one** short clarifying question before running: e.g. "where, or any company in mind?" Otherwise skip and run directly.

3. **Run `search_people`** with the extracted filters. Default `limit: 25` for `scope: 'own'`, **`limit: 10` for `scope: 'public'`** (public-scope queries hit a much larger universe and are more memory-expensive on the backend). Default `scope: 'own'`. Escalate to `scope: 'public'` only when the user explicitly asks for warm-intro paths, "people I don't know yet", "outside my network", or similar. When escalating, note it in the closing line.

   **Prefer structured filters over free text when they fit.** `role` accepts an enum: `engineer`, `designer`, `product`, `gtm`, `founder`, `recruiter`, `investor`, `other`. Use it when the user names a role. Seniority terms ("ceo", "cto", "head of", "vp") aren't in the enum — pass those through `q` instead. `company`, `location`, `skills`, `tags` are also structured.

   **Structured-filter zero = thin data, not absence.** If a structured filter (e.g. `location: "NYC"`) returns 0, the data is missing on those records — not "no NYC people." Drop the structured filter and re-run with the same term in `q`.

   **Multi-term narrowing with AND.** When the query has multiple distinct dimensions that should all be required (e.g. "AI engineers in NYC", "founders raising a seed in Lisbon"), pass `q` with explicit `AND` between terms (`"AI AND NYC"`) rather than space-separated OR. Use `+term` to require one term and let others rank. Bare space-separated terms stay ranked-OR (the default, broadens).

4. **Show results as a markdown table.** Aim for 5-10 — it's the comfortable range for chat. If results land at 12-15 and they're all relevant, show them. If they balloon past ~20 (or `hasMore` is true), the query is too broad — surface a narrowing prompt instead of dumping the list.

   ```
   | # | name      | role            | company | location | last seen |
   |---|-----------|-----------------|---------|----------|-----------|
   | 1 | Jane Doe  | Founder         | Stripe  | NYC      | 3d ago    |
   | 2 | ...       | ...             | ...     | ...      | —         |
   ```

   Omit columns that are empty for every row. If `hasMore` is true, append: "_more matches exist — narrow the query if you need a more specific match._"

5. **Offer drill-down.** Closing line: "want more on anyone? say the number or name." On a reply of either form (a row number, or a name match against the visible table), call `get_person(person_id)` and render the dossier.

6. **Edge cases:**
   - **Zero results** → try once with broader filters (drop the strictest one; fall back to `q` only). If still zero, say so plainly. Offer to try `scope: 'public'` if it might help.
   - **"How many..." questions** → call `network_summary` with the relevant filter (e.g. tags, recent, stale) instead of paging through search results.
   - **`hasMore` is true and the user wants different matches** → ask for a narrower filter, don't page.
   - **Public escalation explicit** (user says "outside my network", "warm intros", "people I don't know yet") → re-run with `scope: 'public'` and note that in the result.
   - **Public-scope error** (e.g. OOM, timeout, any backend error returned by a `scope: 'public'` call) → silently re-run the same query with `scope: 'own'` and note: "public-scope path is currently unavailable; showing your own network only."

## the rule

- One clarifying question max (the vague-query check).
- Read-only — no writes, ever.
- Tables, not lists. 5-10 results is the sweet spot.
- Drill-down accepts number OR name.

## examples

**Specific query → runs directly.**
Input: `do I know anyone at Stripe?`
Action: `search_people({ q: "Stripe", company: "Stripe", scope: "own", limit: 25 })` → render table.

**Vague query → ask first.**
Input: `any AI engineers?`
Action: "where, or any company in mind?" Wait for reply. Then run with the narrower filter.

**Scope escalation.**
Input: `find founders raising a seed — include people outside my network`
Action: `search_people({ q: "founder seed raising", scope: "public", limit: 25 })` → table, closing line notes "(includes public-scope results — people not yet in your network)".

**Drill-down by number.**
After a result table — Input: `more on #2`.
Action: `get_person({ person_id: <id from row 2>, include: "dossier" })` → render the dossier.

**Drill-down by name.**
Input: `more on jane doe`
Action: match the name against the visible table, call `get_person` on the matched id.

**"How many" question.**
Input: `how many investors are in my network?`
Action: `network_summary({ tags: ["investor"] })` → render the count plainly, e.g. "42 people in your network tagged investor."

**Zero results.**
Input: `who do I know at SomeObscureCo?`
Action: search returns 0 → try once more with `q: "SomeObscureCo"` only. If still 0, say "nothing in your network for that. want me to look at warm-intro paths via scope:public?"

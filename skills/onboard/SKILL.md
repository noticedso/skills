---
name: onboard
description: >-
  Onboard a new user to noticed and gather light user research at the same
  time. A short chip-driven questionnaire (about 7 questions, 2-3 minutes)
  that captures basic identity (role, location, what they're building) and
  research about how they manage relationships today + what they want from
  noticed — then stores everything in the noticed system with a single
  `save_onboarding` call. Pre-fills from `my_profile` and `get_person('me')`
  to skip questions the agent already knows. Trigger on "onboard me", "set
  me up", "interview me", "noticed onboarding", "what does noticed know
  about me", or any first-run intent.
---

# onboard

Onboarding + light user research in one flow. Get the basics right so downstream skills don't fumble identity; capture goals + current tools so the product team learns what users actually want. Everything lands in noticed through one write tool, so the user's record, the agent's workspace, and onboarding progress all update together.

## flow

1. **Pre-fill before asking.** Run `my_profile` and `get_person({ person_id: "me", include: "dossier" })` first. Use what comes back to:
   - Pre-select chips for Q1 (role) and Q2 (location) if there's a clean signal.
   - Draft Q3 (what you're building) if company context allows.
   - **Collapse Q1 + Q2 into a single confirm** if both are strong signal: "Here's what I have on you — Founder, NYC. Anything to correct?"

2. **Calibrate framing to confidence.** Confident and wrong is worse than guessed and humble.
   - **Strong signal** (clean my_profile field, unambiguous LinkedIn role/location) → present as confirm: "Founder at noticed, NYC — right?"
   - **Thin signal** (inferred from company domain, ambiguous title) → present as soft guess: "Looks like you're a founder? Tell me if I'm off."
   - Never present a thin inference as fact.

3. **Ask one question at a time.** Chips for MC; free text where chips don't fit. "Skip" is always allowed. The agent may rephrase the prompt copy to flow naturally, but **chip option labels must match this spec exactly** (consistency matters for research aggregation across users).

4. **After the last question**, show a quick summary of all answers and ask once: "save?"

5. **On "save", write everything with ONE `save_onboarding` call** (see writes section). Echo what landed.

## the questions

Ask in order. Pre-fill where signal exists. Skip Q1 / Q2 if covered by the collapsed confirm.

**Q1. What's your role?** (multi-select chips)
Founder · Sales & Growth · Marketing & Brand · Partnerships & BizDev · Product & Engineering · Customer Success · Operations · Investing · Recruiting · Other
_"No big deal if you don't fit neatly. This is just to get started."_

**Q2. Where are you based?** (single-select chips + "other" → text — never multi)
NYC · SF · LA · London · Lisbon · Berlin · Remote · Other (type it)

**Q3. What are you building or working on right now?** (short free text)
One line is fine.

**Q4. Which of these are on your plate right now?** (multi-select chips)
Sales · Hiring · Find work · Fundraising · Investing · Customer success · Networking · Collabs · Other

**Q5. If noticed nailed one thing for you, what would it be?** (rank all 5 from most to least important)
- Remember context before a meeting
- Reconnect with people I've lost touch with
- Get warm intros to people I want to meet
- Find someone in my network who can help with something specific
- Remember names + context of people I just met

Use a drag-to-rank UI if available; otherwise ask the user to list the five in order.

**Q6. How do you remember relationships today?** (multi-select chips)
Notes app · Spreadsheet · LinkedIn · Notion · CRM · Nothing · Other

**Q7. Anything else worth knowing?** (free text, skippable)
Whatever doesn't fit above — who you're trying to meet, specific goals, context I should have.

## pre-fill rules

- **Q1 (role):** match `my_profile.role` against the chip options. Strong signal → pre-select + confirm. Thin signal → soft-guess. Chip ↔ MCP `role` enum mapping (used by search-network and any downstream filter):

  | onboard chip | MCP enum |
  |---|---|
  | Founder | `founder` |
  | Product & Engineering | `engineer`, `product` |
  | Sales & Growth | `gtm` |
  | Marketing & Brand | `gtm` |
  | Partnerships & BizDev | `gtm` |
  | Customer Success | `other` |
  | Operations | `other` |
  | Investing | `investor` |
  | Recruiting | `recruiter` |
  | Other | `other` |

  Store the chip text as-is (pass it to `save_onboarding.roles` unchanged); translate at query time, not at save time.
- **Q2 (location):** match `my_profile.location` to one of NYC / SF / LA / London / Lisbon / Berlin / Remote (case-insensitive; aliases ok: "New York" → NYC, "San Francisco" → SF). Confirm if clean; ask if ambiguous.
- **Q3 (building):** if `my_profile` or `get_person('me').default_notes` mentions a company/project, draft a one-liner and offer to edit: "Looks like you're building noticed — a personal networking agent. Refine?"
- **Q4 – Q7:** no pre-fill. Always ask.

If Q1 and Q2 are both strong signal, collapse them into one confirm shown before Q3. If the user corrects, fold corrections into the saved state before moving on.

## writes (on save)

### One call: `save_onboarding`

Map the answers onto the tool's fields and call it once:

```
save_onboarding({
  user_name:      <their name, if it came up or needed correcting>,
  roles:          [<Q1 chips, as-is>],
  location:       <Q2>,
  building:       <Q3>,
  focus_areas:    [<Q4 chips, as-is>],
  value_ranking:  [<Q5 most → least important>],
  current_tools:  [<Q6 chips, as-is>],
  extra_notes:    <Q7, omit if blank>,
})
```

Omit any field the user skipped — never invent values. The server fans the write out for you: identity (role · location · building) lands on the user's own record and the agent workspace profile, the research answers (focus, value ranking, tools, extras) land in long-term memory, and the noticed onboarding steps are marked satisfied.

`save_onboarding` is idempotent: re-running replaces the profile snapshot, appends a dated history block to the user's notes, and dedupes memories — safe to call again with updated answers.

### Fallback (older servers without `save_onboarding`)

If the tool is missing from the surface, fan out manually exactly like the legacy interview-me skill: append a dated `[mcp · skill:onboard · YYYY-MM-DD]` block (Role · Based in · Building) to the `'me'` person via `get_person` → `update_person('me', default_notes)` (read first, append, never overwrite), then `memory_save` the four research entries prefixed `[mcp · skill:onboard]` (active goals — `commitment`; value ranking — `preference`; current tools — `fact`; additional — `fact`, skip if blank).

### Echo

After the write lands, recap exactly what was saved: "saved your role + location + what you're building to your record, your goals, value ranking, and current tools to memory, and marked your onboarding done. you can re-run anytime to refresh."

## the rule

- One question at a time. Always skippable.
- Chips for MC questions; chip option labels must match this spec exactly. Agent may rephrase prompt copy, never chip labels.
- Confident and wrong is worse than guessed and humble. Pre-fills surface as confirms or soft guesses, never as facts.
- Pre-fill + skip-if-known when there's signal; never invent answers when there isn't.

## re-runnability

Idempotent. Re-running:
- Re-asks each question (with pre-fills from the latest profile state).
- `save_onboarding` replaces the profile snapshot in place and appends a dated notes block — older blocks stay as history, latest reflects current state.
- Memory entries dedupe via embedding so research entries don't double-store.

## retrieval note for downstream skills

Basic identity (role, location, what the user is building) lives on the `'me'` person — read via `get_person({ person_id: "me" })`. Goals, primary value ranking, current tools, and the open-ended add-on live in `memory_search` (filter on the `[onboarding]` prefix; legacy installs may also carry `[mcp · skill:interview-me]` entries). Both surfaces are needed for a complete picture of the user.

## tool needs

- `noticed`: `my_profile`, `get_person`, `save_onboarding` (fallback: `update_person`, `memory_save`)
- No web search — this skill doesn't enrich beyond what `my_profile` already has.

## explicitly NOT in scope

- Auto-enriching profile data beyond what `my_profile` already has.
- Branching question flows based on prior answers.
- Editing tags / relationship_types on `'me'`.
- Anything that takes more than ~3 minutes.
- Welcome-first / parallel enrichment kickoff with "takes ~2 minutes" framing (V3 only).

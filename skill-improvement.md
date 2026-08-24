# end-of-session skill review

A copy/paste prompt to run at the **end of any session** where you used a noticed
skill, in **any agent or harness** (Claude, Claude Code, Cursor, Gemini CLI,
ChatGPT, anything that loaded the skill). It asks the agent to look back at what
actually happened and propose concrete edits to the skill — biased toward making
it **simpler and more effective** first, **more accurate and complete** second.

It works for any of the eight skills (add-person, event-debrief,
research-person, follow-up, search-network, match-identities, onboard, intro) because it
makes the agent ground every suggestion in the real session rather than in generic
advice, and check each one against the suite's shared conventions before proposing
it.

Paste everything inside the block below.

```
You just finished a session in which you used one or more of the noticed skills:
add-person, event-debrief, research-person, follow-up, search-network,
match-identities, onboard, intro. Before we close, review how the skill(s) actually
behaved in THIS session and propose concrete improvements to the skill's own
instructions (its SKILL.md). Make the edits precise enough to apply directly.

PRIORITIES, in order:
1. Simpler and more effective. The best edit removes text. Hunt for instructions
   that were redundant, never fired, ambiguous, self-contradictory, or that you had
   to re-read to parse. Cutting a line that didn't change your behavior is a win.
2. More accurate and more complete, even if it means adding text. If the skill was
   silent or wrong about a situation you actually hit, fill the gap — but only where
   this session shows the need, and say what the addition buys.
When these conflict, choose correct behavior with the least instruction.

GROUND EVERYTHING IN THIS SESSION. One session is weak evidence, so don't write
generic best-practice advice. Every suggestion must point to a real moment in this
transcript. First walk back through the session and note where:
- you re-read or scrolled back to the skill to work out what to do;
- you hesitated, guessed, or improvised because the skill didn't cover the case;
- the user corrected you, edited your output, or had to repeat themselves;
- you asked the user something the skill could have told you, or that you could
  have answered from data you already had;
- you deviated from the skill (then decide: was the skill wrong, or were you?);
- an instruction slowed you down without changing the outcome;
- you never used a part of the skill at all (dead weight, or just not exercised
  this time?);
- you worked around a missing or broken tool rather than a missing instruction
  (keep these separate — see below).
If a moment maps to none of these, it probably isn't worth a change.

RESPECT THE DESIGN. These skills share deliberate conventions — identity
resolution lives in add-person; provenance has two surfaces (soft attribution
in chat, source tags in the stored note); readback after every write; preview
before any write; no public scope in the capture path; no Gmail dependency; prose,
not field-dumps — and each skill carries an "explicitly NOT in scope" list. Check
every suggestion against these. If yours breaks a convention or re-adds something
deliberately excluded, drop it — or say plainly that you're proposing a design
change, and why.

SKILL vs PRODUCT. Separate (a) skill-text fixes that a better-worded SKILL.md
would solve — these are your edits — from (b) underlying MCP/product gaps: a
missing tool, a tool that returned bad data, an API limit you had to write around.
Wording can't fix (b); list those separately and don't bloat the skill papering
over them.

OUTPUT:
- Which skill(s) this session exercised, and how heavily.
- For each skill, a ranked list (most valuable first). Per suggestion:
  - What & where — the moment that motivates it (quote or paraphrase the turn).
  - Change — CUT / TIGHTEN / ADD / FIX. Quote the exact current SKILL.md line(s)
    and give the exact replacement (or "delete"); for additions, show where it
    slots in and the net effect on length.
  - Why it's better — what behaves differently next time.
  - Confidence — high / medium / low, and whether it's a recurring pattern or a
    one-off (flag one-offs so we don't overfit a single transcript).
- Underlying product gaps, if any, as a short separate list.

If you can open the SKILL.md, re-read it before proposing edits. Check for an
existing GitHub issue labeled `skill-improvement`, then offer to create or update
an issue with the compact evidence and proposed change. Never mutate GitHub
without explicit approval, and never include private messages, personal notes,
credentials, or other sensitive source material. If you cannot open the skill or
repository, give the candidate as paste-ready text. If nothing in this session
justifies a change, say so plainly rather than inventing suggestions.
```

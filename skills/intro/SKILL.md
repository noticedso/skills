---
name: intro
description: >-
  Help the user with introductions across fundraising, sales, hiring,
  investing, partnerships, and networking. Four jobs: find the best warm
  path to a target person, draft an intro email between two people, write
  an ask to a connector requesting an intro to a target (with a
  forwardable blurb), or write a backchannel note asking a mutual to
  reinforce the user's credibility after a meeting. Pulls paths and
  relationship strength from the noticed network, enriches the target
  from the web, and returns copy/paste drafts. Use whenever the user says
  "who can intro me to X?", "find a path to X", "draft an intro between A
  and B", "ask X to connect me with Y", "write an intro request", or
  "can someone vouch for me with X?".
---

# intro

Help with one introduction job at a time. Find the path, or write the message — never both unasked. Resolve who's who against the noticed network before drafting a word, and never invent a path, an investor's interest, or a past interaction.

Use across fundraising, sales, hiring, investing, partnerships, and general networking.

Identity resolution is shared with `add-person` — own-network search → ask. Public scope is allowed **only in Mode 1** (path-finding), the same place `search-network` uses it. All drafts are copy/paste; nothing is sent.

## first, pick the mode

If it isn't obvious from the prompt, ask which job — one line, then wait:

1. **Find an intro path** — who can introduce the user to a target person.
2. **Draft an intro email** — introduce two (or more) people to each other.
3. **Request an intro** — ask a connector to introduce the user to a target.
4. **Backchannel support** — ask a mutual to reinforce the user's credibility with someone they just met.

## context to gather

Use what's already known before asking the user to fill gaps:

- `resolve_person` / `search_people` (own) for the target, the connector, and anyone being introduced. Multi-word names AND-joined.
- `get_person({ include: "dossier" })` on each resolved person for relationship strength and recent touchpoints — an intro is only as good as the warmth behind it.
- **Web research on the target** (Mode 1 and 3) — role, company, thesis/portfolio, hiring focus, buying priority, whatever makes the ask land. Attribute softly in chat ("their site says…").
- For fundraising: round, stage, traction, target-investor fit, pipeline status, strongest proof points — use what's on record before asking.

Ask only for missing essentials: who is the target, who is the connector (if known), the goal, why this person is a good fit, the proof point that makes them care, and how warm the relationship is.

## mode 1 — find an intro path

Map realistic paths, not theoretical mutuals. This is the one mode that may escalate to `scope: "public"` — do so when the user asks for warm-intro paths or people they don't know yet, with `limit: 10`. Fall back to `scope: "own"` silently if the public path errors.

Prioritize:
- A direct relationship with the target.
- Portfolio founders, co-investors, former colleagues, trusted peers of the target.
- A strong user↔connector relationship.
- A recent interaction or a clear reason for the connector to help.

Output:

```
Intro Path Analysis
Target: [name, role, company]
Best path: [connector] → [target]
Why it works: [relationship strength + relevance]
Recommended ask: [what to ask the connector to do]
Backup paths:
- [connector/path] — [why it might work]
```

No warm path on record? Say so plainly and suggest the best cold or semi-warm approach and why. Don't manufacture a connector who isn't there.

## mode 2 — draft an intro email

Write the email the user sends to introduce two people. Output **only the draft** unless the user asks for notes.

Rules: keep it short, make both sides look good, say why the connection should happen, give context without over-selling, hand the thread off at the end.

```
Subject: Intro — [Person A] <> [Person B]

[Person A], meet [Person B]. [Person B], [Person A].

[Person A] is [one sentence].
[Person B] is [one sentence].

I thought you two should connect because [specific reason].

I'll let you take it from here.
[User]
```

## mode 3 — request an intro

Write the email the user sends to a connector asking for an intro to a target. Include a ready-to-forward blurb the connector can paste — under 100 words, proof-dense, specific to the target's thesis or fit.

Rules: make the ask easy, give a graceful out, never pressure weak ties. If the connector barely knows the user or the target, suggest warming the relationship or finding another path instead.

```
Subject: Quick ask — intro to [target]?

Hey [connector],

[Brief personal context.]

I'm hoping to connect with [target] at [company/firm] because [specific reason]. Would you be open to making an intro?

I wrote a short blurb below you can forward if it's helpful. Totally understand if it's not a fit.

[forwardable blurb]
[User]
```

Forwardable blurb:

```
Hey [target],

I wanted to introduce you to [user], [role/company]. [Specific proof point or context.]

I thought it could be relevant given [target-specific reason].

Open to a quick intro?
[connector]
```

**Tracking (offer, don't assume).** When the user confirms they've sent the ask, offer to log it so the offer doesn't evaporate: `track_intro({ connector_person_id, target_name, target_org, status: "requested", offered_on, notes })`. If the connector *offered* an intro the user hasn't asked for yet, use `status: "ready"` (or `"waiting"` with `missing_fields` when the target is still fuzzy). When the intro lands and the new contact is added, graduate it with `resolved_person_id` (marks done). Use `list_intros` to answer "what intros am I waiting on?".

## mode 4 — backchannel support

Use when the user just met someone (investor, buyer, candidate, partner) and wants a mutual to reinforce credibility if it comes up. Usually send same-day or within 24 hours.

Rules: only suggest this if the relationship is real, be honest about how the meeting went, give 2–3 truthful talking points, never ask anyone to exaggerate.

```
Subject: Quick heads up on [target]

Hey [connector],

I just met with [target] at [firm/company] about [context]. [One honest sentence on how it went.]

I noticed you know them. If it comes up naturally, it would mean a lot if you could share [specific point].

Useful context:
- [truthful proof point]
- [relevant relationship or traction point]
- [specific concern the target raised, if any]

No pressure at all — just wanted to give you context in case they ask.
[User]
```

## the rule

- One mode per run; ask which if it isn't obvious.
- Resolve every named person against the network before drafting.
- Public scope only in Mode 1, and only on an explicit reachability/warm-path ask.
- Copy/paste only — produce the text (subject included for email); never send.
- `track_intro` writes only after the user confirms an ask went out, or to capture an offer — never silently.

## style

- Specific and concrete. Sound human, not like a template engine — the brackets are a skeleton, not the voice.
- In the user's voice; the agent knows how the user writes.
- No em-dashes in the drafts, no emojis, no AI-tropes.
- Respect the user's relationship capital — don't burn a weak tie on a cold ask.
- For fundraising, optimize for trust, investor fit, and proof.
- Never invent relationship paths, investor interest, or past interactions.

## tool needs

- `noticed`: `resolve_person`, `search_people` (own; `public` only in Mode 1), `get_person`, `track_intro` and `list_intros` (Mode 3 tracking).
- Web research for target context (Mode 1 and 3).
- No Gmail — every output is copy/paste, subject included.

## explicitly NOT in scope

- Sending email/DMs or scheduling the meeting (everything is copy/paste).
- Capturing brand-new people (`add-person`) or post-meeting follow-up to someone the user *already* met one-on-one (`follow-up`).
- Bulk/templated outreach blasts.
- Inventing a connector, a path, or interest that isn't on the record.

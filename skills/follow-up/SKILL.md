---
name: follow-up
description: >-
  Draft a follow-up message to someone the user recently met IRL. Figures
  out new vs existing in their network, picks the right channel (email,
  linkedin, whatsapp, telegram, sms), suggests an angle from context,
  drafts in the user's voice with something actionable in it. Returns the
  text to copy/paste (subject too, for email) plus a link to open the
  chat. Logs the touchpoint only after the user confirms it went out. Use
  whenever the user says "follow up with X", "draft a message to X",
  "thank X for the meeting", "send X our deck", or similar.
---

# follow-up

Draft a follow-up to one person the user recently met IRL. One person at a time. Resolve identity, channel, and angle before writing a word.

Person resolution is shared with `remember-person` — same own → ask order. No web enrichment, no public scope.

## flow

1. **Resolve the person.** `search_people` own, multi-word names AND-joined. Strong match → use it. Multiple/no match → surface candidates, never default to new silently. On "new", get a linkedin before drafting so they can be added after the send is confirmed.

2. **Read recent context.** `get_person({ include: "dossier" })`. If nothing logged in ~2 weeks and notes are thin, ask "what was the meeting about?" and wait.

3. **Pick the channel** from what's on the record (`linkedin_username`, a stored email, a stored phone/handle). One usable → use it. Multiple → ask. Nothing stored → ask how they want to reach them. If linkedin, resolve the mode first (it sets the char budget).

4. **Suggest an angle, don't just ask.** Read the context and propose the angle(s) that fit ("looks like the natural next step is sending the deck you mentioned — want that, or a quick thank-you?"). Fall back to an open "what's the angle?" only when there's no context. Wait.

5. **Draft:**
   - **In the user's voice** — the agent knows how the user writes; match it, don't impose a house style.
   - **Open with a specific callback, not a pleasantry.** The first line names a concrete detail from the meeting — a problem they raised, something they said that stuck, a person/project they mentioned. That one detail earns the reply. **Banned openers:** "Great meeting you", "Great to connect", "Thanks for your time", "It was a pleasure", or any opener that would read the same to anyone else they met that day. If context is too thin to write a specific opener, go back to step 2 and ask what the meeting was about rather than drafting generic.
   - Short — readable in ~30 seconds. DMs under ~80 words; email body under ~150; LinkedIn connection note **300-char hard cap**. It's a thread-opener, not a pitch.
   - **Always include something actionable** — ideally something the user offers to do for the recipient (send the deck, make an intro, share a doc, pick a time). Make it low-friction: one clear ask or offer the recipient can act on without having to figure out what's wanted. A follow-up with no next move is noise. Never generic "would love to stay connected" filler.
   - No em-dashes, no emojis, no AI-tropes.

## channels

All channels are **copy/paste**. The skill produces text the user sends; it doesn't send anything or depend on a connected mail/DM tool.

- **email** — produce a **subject + body**; show both to copy into whatever mail client they use. The subject is specific to the angle or a meeting detail (it drives the open), not generic "Following up" / "Great meeting you".
- **linkedin** — two modes, resolve **before drafting**:
  - *connection request note* (not yet connected): **300-char hard cap, enforced before drafting**; still carries a concrete next move, never empty "let's connect" filler. Show the char count.
  - *DM* (already connected): longer (~80 words), room for a fuller ask.
  - Pick: in-network/logged or "message/DM X" → DM; just-met/"connect with X" → connection note; unclear → ask one line. Provide the profile link; copy/paste, no pre-fill.
- **whatsapp** — `https://wa.me/<phone>?text=<urlencoded>` (pre-fills).
- **telegram** — `https://t.me/<username>` (no pre-fill).
- **sms** — `sms:<phone>?body=<urlencoded>` (mobile).

## logging

Never log until the user confirms "sent it". Then:
- Email → `log_interaction(kind: "emailed", payload: { channel, angle, summary })`.
- DM → `log_interaction(kind: "messaged", payload: { channel, angle, summary })`; for LinkedIn note the mode in the summary so the timeline shows whether the user is now connected.

Brand-new contact: `add_to_network` fires with the first `log_interaction` after "sent it", not before. Then read back what was logged (and added).

No `default_notes` writes, no `memory_save` calls — interaction-only.

## tool needs
- `noticed`: `search_people`, `get_person`, `add_to_network` (only on a confirmed brand-new contact), `log_interaction`
- No Gmail — email is copy/paste like the DMs.

## explicitly NOT in scope
- Cold outreach / first-touch; reconnects with dormant contacts; batch follow-ups; sending directly / delayed send (everything is copy/paste); calendar invites; `scope: "public"` searches; writing to `default_notes` (interaction-only).

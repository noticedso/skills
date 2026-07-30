# noticed-skills

A suite of agent skills for [noticed](https://noticed.so) — a personal networking agent. Each skill wraps the noticed MCP to handle one job in the relationship-management loop: capturing people you meet, debriefing meetings, researching contacts, following up, searching your network, matching identities, making introductions, and onboarding.

## connect noticed first

These skills call the noticed MCP. Connect it to your client before you install the skills, or they will not have anything to talk to.

Go to **[noticed.so/onboarding](https://www.noticed.so/onboarding)** and pick your client — Claude, Claude Code, Cursor, Gemini CLI / Antigravity, ChatGPT, or anything else that speaks MCP. The MCP server itself lives at [noticedso/cli](https://github.com/noticedso/cli) if you want to run it locally.

## install

Use the universal installer at **[noticed.so/skills#install](https://www.noticed.so/skills#install)**.
Copy one prompt into your agent and it will choose the supported setup, perform
what it can, show you what the skills can access or change, ask before
persisting them, and verify they loaded. Download and manual fallbacks live on
the same page.

## the skills

| skill | what it does | writes? |
|---|---|---|
| **add-person** | Add or update one or more people in noticed from a name, URL, handle, photo, or freeform dump — dedupe-first, logs the meeting on the day it happened, saves context as a memory. The core capture primitive. | yes |
| **event-debrief** | Process a meeting/event dump into people, notes, follow-ups, ideas, and references — all written in one pass. | yes |
| **research-person** | Deep-dive one person before a meeting; render a dossier from noticed + the web; offer to save it back. | only on save |
| **follow-up** | Draft a follow-up message to someone you just met, in your voice, with something actionable in it. | logs the touchpoint only after you confirm it went out |
| **search-network** | Natural-language search across your network; returns a tight table; drills into anyone. | read-only |
| **onboard** | Onboards you to noticed: a short questionnaire that captures your identity, goals, and current tools, saved in one `save_onboarding` call. | yes (to your own record) |
| **match-identities** | Triage the cross-source identity matches noticed proposes — confirm real matches, clear false positives, merge duplicates — and fill profile gaps by searching your network first. | yes |
| **intro** | Find the warm path to a target, draft an intro between two people, write an intro request with a forwardable blurb, or write a backchannel vouch — all copy/paste. | only on confirmed intro tracking |

## how they fit together

The capture loop runs across a real-world interaction:

```
add-person  →  event-debrief
   (during)            (after)
```

`research-person` and `follow-up` support any contact at any time. `search-network` is the read path over everything you've captured. `intro` turns that network into warm paths and the messages that open them. `onboard` is first-run setup.

## shared conventions

All skills follow the same rules, so they read as one system:

- **Identity resolution** is owned by `add-person` (own-network search → web enrichment → ask). The other skills follow that flow rather than re-implementing it.
- **Provenance, two surfaces.** In chat, web-found facts are attributed softly ("his linkedin says…") so research never reads as something you said. In the stored note, every line carries a system-only tag (`[from user]` / `[research, unverified]`) that is never shown in chat.
- **Readback after every write.** noticed writes are silent, so each skill recaps what landed — in prose, not a database-style `tags:` row.
- **No public scope in the capture path.** Capture answers *who is this person* via own-network + web. Warm-intro / reachability discovery (`scope: "public"`) lives only in `search-network` and `intro`'s path-finding mode, both of which fall back to own-scope silently if the backend errors.
- **No Gmail dependency.** Drafts are copy/paste (subject included for email); nothing is sent automatically.

## testing

See **[TESTING.md](./TESTING.md)** for suggested prompts to exercise each skill and a checklist of behaviors to confirm.

## improving the skills

At the end of a session that used a skill, paste the prompt in **[skill-improvement.md](./skill-improvement.md)** to have the agent review how the skill actually behaved and suggest edits — biased toward making it simpler first, then more accurate. Works in any client and for any of the eight skills.

## updates

Run the **[universal installer](https://www.noticed.so/skills#install)** again.
It downloads the skills version currently published with noticed, shows you
what the skills can access or change, asks before replacing anything, and
verifies the updated pack loaded.

If you originally installed the Claude Code marketplace plugin, refresh the
marketplace before updating it:

```
/plugin marketplace update noticed-skills
```

Then update the plugin when Claude Code reports a newer version. Marketplace
users on other clients can use that client's native refresh/update action.

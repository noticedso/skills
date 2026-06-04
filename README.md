# noticed-skills

A suite of agent skills for [noticed](https://noticed.so) — a personal networking agent. Each skill wraps the noticed MCP to handle one job in the relationship-management loop: capturing people you meet, debriefing meetings, researching contacts, following up, searching your network, and onboarding.

## connect noticed first

These skills call the noticed MCP. Connect it to your client before you install the skills, or they will not have anything to talk to.

Go to **[noticed.so/onboarding](https://www.noticed.so/onboarding)** and pick your client — Claude, Claude Code, Cursor, Gemini CLI / Antigravity, ChatGPT, or anything else that speaks MCP. The MCP server itself lives at [noticedso/cli](https://github.com/noticedso/cli) if you want to run it locally.

## install (Claude Code)

```
/plugin marketplace add noticedso/skills
/plugin install noticed-skills@noticed-skills
```

## the skills

| skill | what it does | writes? |
|---|---|---|
| **remember-person** | Capture one or more people into noticed from a name, URL, handle, photo, or freeform dump. The core capture primitive. | yes |
| **event-debrief** | Process a meeting/event dump into people, notes, follow-ups, ideas, and references — all written in one pass. | yes |
| **research-person** | Deep-dive one person before a meeting; render a dossier from noticed + the web; offer to save it back. | only on save |
| **follow-up** | Draft a follow-up message to someone you just met, in your voice, with something actionable in it. | logs the touchpoint only after you confirm it went out |
| **search-network** | Natural-language search across your network; returns a tight table; drills into anyone. | read-only |
| **interview-me** | Onboarding questionnaire that captures your identity, goals, and current tools. | yes (to your own record) |

## how they fit together

The capture loop runs across a real-world interaction:

```
remember-person  →  event-debrief
   (during)            (after)
```

`research-person` and `follow-up` support any contact at any time. `search-network` is the read path over everything you've captured. `interview-me` is first-run setup.

## shared conventions

All skills follow the same rules, so they read as one system:

- **Identity resolution** is owned by `remember-person` (own-network search → web enrichment → ask). The other skills follow that flow rather than re-implementing it.
- **Provenance, two surfaces.** In chat, web-found facts are attributed softly ("his linkedin says…") so research never reads as something you said. In the stored note, every line carries a system-only tag (`[from user]` / `[research, unverified]`) that is never shown in chat.
- **Readback after every write.** noticed writes are silent, so each skill recaps what landed — in prose, not a database-style `tags:` row.
- **No public scope in the capture path.** Capture answers *who is this person* via own-network + web. Warm-intro / reachability discovery (`scope: "public"`) lives only in `search-network`, where it falls back to own-scope silently if the backend errors.
- **No Gmail dependency.** Drafts are copy/paste (subject included for email); nothing is sent automatically.

## testing

See **[TESTING.md](./TESTING.md)** for suggested prompts to exercise each skill and a checklist of behaviors to confirm.

## updates

Updates are manual for now. Reinstall to get the latest.

## notes

Design notes and per-skill detail live in the Notion workspace under **🤹 mcp: skill ideas**. These skills were revised and tightened during NY Tech Week 2026 against the live MCP learnings; product gaps that surface during use go to the **🔧 NYTW: mcp learnings** page.

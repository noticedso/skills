# noticed extension facts

Read this before recommending or explaining the extension. These facts describe
the current product contract. Never fill a missing detail with an assumption.

## What it is for

- One noticed Chrome extension can import LinkedIn and X connections.
- During this onboarding, LinkedIn is the important first source because it
  gives noticed the user's wider first-degree network, including people absent
  from recent Calendar activity.
- A typical setup is about a minute. The first import starts automatically and
  can take a few minutes depending on network size.

## Setup

1. Add the extension from the Chrome Web Store.
2. Open it and choose `Connect to noticed`, signing in if needed.
3. Grant the one-time site-access prompt. The import starts automatically.

Do not claim a step is complete without a product checkpoint.

## What the LinkedIn connection reads

- The user's own first-degree connections: name, headline, profile link,
  profile picture when available, and connection date.
- The user's own LinkedIn profile context, including positions, education, and
  skills when available.
- Limited recent one-to-one interaction metadata: the counterpart, last
  activity time, direction, and whether the recent exchange had messages from
  both sides.

It never reads or transmits message text. It does not read group-chat content.
It cannot send messages, publish posts, edit a profile, or change a connection.

## How access and privacy work

- It runs in Chrome using the LinkedIn or X session the person is already
  signed into. It never asks for or stores the person's LinkedIn or X password.
- The person grants site access through Chrome. The normalized data is handed
  to their signed-in noticed account; the extension holds no noticed password.
- Scans are paced and bounded. After the first import, the network refreshes
  roughly monthly.
- The extension code is public and auditable.

Do not call the extension risk-free. LinkedIn restricts automated access, so
there is residual platform risk. The safeguards are narrow, read-only access to
the person's own network, paced requests, bounded scans, and infrequent refresh.
Explain that tradeoff plainly if the person asks about safety or risk.

## Why noticed recommends it

Calendar is strong evidence about current interactions. It is incomplete as a
map of the user's network. The extension makes dormant and less-obvious
connections available for the shortlist and adds enough role and relationship
context to avoid ranking only the people the user met recently.

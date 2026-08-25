# noticed Chrome extension

This reference reflects the audited production flow for **noticed
Relationships v1.2.14 on 25 August 2026**. Treat it as the current product truth
until a newer verified product contract replaces it. Do not simplify away a
Chrome prompt or infer one checkpoint from another.

In user-facing copy, call it the `noticed Chrome extension` on first mention and
the `Chrome extension` afterward. Its current Chrome Web Store listing is:

<https://chromewebstore.google.com/detail/noticed-relationships/hjckpjgbhjichgkbmgjfbbdibchghdaf>

## What it does

- The extension imports connections from supported social networks using the
  sessions already open in Chrome. It supports LinkedIn and X today.
- The current access prompt grants both LinkedIn and X together. After the user
  clicks **Allow**, the extension automatically scans both available sessions;
  there is no LinkedIn-only choice in this version.
- The manual installation choices take about a minute. Scanning and sending a
  large network can take several minutes.

## Give one instruction at a time

After the user agrees to install, send only the current action and wait for its
own evidence before sending the next. Explain an unfamiliar Chrome warning just
before the user reaches it. Do not send the full checklist in one message.

When the host can render bundled skill assets, attach the image named for that
step directly after the instruction. If it cannot, use the text alone. Never say
an image was attached when it was not.

1. **Open the store listing**
   - Ask the user to open the canonical URL and click **Add to Chrome**.
   - Opening the listing does not prove installation.

2. **Handle the Safe Browsing branch when it appears**
   - Chrome may show **Proceed with caution** and say the extension is not
     trusted by Enhanced Safe Browsing.
   - Tell the user to review the warning and click **Continue to install** if
     they want to proceed. Do not hide or dismiss the warning for them.
   - Asset: `assets/extension-setup/03-enhanced-safe-browsing-warning.jpg`

3. **Confirm the Chrome installation permission**
   - Chrome shows `Add "noticed Relationships"?` and says it can read and
     change data on noticed.so sites.
   - Tell the user to review the permission and click **Add extension**.
   - This permission lets the extension connect to the noticed web app; it is
     not the later LinkedIn and X site-access grant.
   - Asset: `assets/extension-setup/04-final-install-permission.jpg`

4. **Open noticed Relationships**
   - When Chrome shows the extension as installed, ask the user to open
     Chrome's Extensions menu in the top-right and choose **noticed
     Relationships**.
   - The popup says **connect to noticed** and **connect to start importing your
     connections**.

5. **Connect the noticed account**
   - Ask the user to click **connect to noticed**.
   - A new noticed tab opens. If noticed asks them to sign in, they should use
     the account where they want the imported network saved.
   - Wait until the page says **Connected to noticed**. Then ask them to verify
     the destination account and open **noticed Relationships** again from the
     Chrome toolbar.

6. **Request social-network access**
   - The reopened popup shows the noticed account and **grant access**.
   - Ask the user to verify the account, then click **grant access**.

7. **Allow the current LinkedIn and X permission**
   - Chrome says noticed Relationships requested additional permissions to read
     and change data on `www.linkedin.com` and `x.com`.
   - Explain that the current extension requests LinkedIn and X together and
     uses the sessions already open in Chrome. Ask the user to review the
     request and click **Allow** to continue.
   - Asset: `assets/extension-setup/11-chrome-linkedin-x-permission.jpg`

8. **Let the scans run**
   - The popup closes and scanning starts automatically. If reopened, it shows
     a changing **scanned N...** count. The current build does not name the
     source beside that count and may reset the count when it moves from
     LinkedIn to X.
   - Tell the user to keep Chrome open. They do not need to click **scan now**.
   - Start goal discovery after reliable evidence that the LinkedIn scan has
     started. Do not wait silently for the server handoff.

## Current checkpoint truth

These names describe evidence, not model-authored events. Acknowledge only the
checkpoint actually supplied by the product, browser tool, or mock runtime.

| Checkpoint | Source of truth | Safe claim |
|---|---|---|
| `chrome_extension_installed` | Chrome shows **Remove from Chrome** or the extension in its Extensions menu | The extension is installed in this Chrome profile. |
| `extension_popup_opened` | The live noticed Relationships popup is open | The extension is open. |
| `noticed_pair_acknowledged` | `/x/connect` receives the extension's pair acknowledgement | The extension is connected to this noticed account. |
| `linkedin_host_permission_granted` | The extension confirms Chrome permission for LinkedIn | Chrome granted the extension LinkedIn access. This does not prove an import started. |
| `linkedin_scan_started` | Extension state names `linkedin_extension` and the count changes | The extension is scanning LinkedIn connections. |
| `linkedin_handoff_started` | A saved LinkedIn payload is being sent through the source-specific `/x/sync` handoff | The extension started sending the LinkedIn scan to noticed. |
| `linkedin_connections_ingested` | A current, source-specific ingestion record confirms core LinkedIn connections and an item count | noticed accepted that number of LinkedIn relationships. This is enough to use the imported connection data, but it is not full browser confirmation. |
| `linkedin_handoff_confirmed` | The LinkedIn import returns success and the extension receives `syncConfirmed` | The LinkedIn handoff finished in the browser. |

The current product does not expose one reliable
`linkedin_import_completed_e2e` checkpoint. A recorded ingestion row must not
produce **You're all set** or **the import completed** on its own. An X run
cannot be used as a LinkedIn checkpoint, even when it is newer.

If `linkedin_connections_ingested` arrives while the browser handoff fails, say
the consequence in plain language. For example:

> your LinkedIn connections were accepted, but the browser didn't receive final confirmation.

The imported connection data may be used for the onboarding result. Separately,
ask the user to open **noticed Relationships** and follow the recovery action
shown there. Do not ask for another full scan unless the product identifies a
source-specific LinkedIn rescan; a failed handoff may still have a saved payload
that can be retried.

Do not trust the current `/x/connect` **You're all set** screen by itself. In the
audit it appeared while the LinkedIn handoff said **Couldn't sync**, and after a
reload an X run was incorrectly accepted as the setup result.

## What LinkedIn reads

- First-degree connections: name, headline, profile link, profile picture when
  available, and connection date.
- The user's LinkedIn profile context, including positions, education, and
  skills when available.
- Limited recent one-to-one interaction metadata: the counterpart, last
  activity time, direction, and whether the recent exchange had messages from
  both sides.

The extension never reads or transmits message text or group-chat content. It
cannot send messages, publish posts, edit a profile, or change a connection.

## Access, privacy, and risk

- The extension uses the LinkedIn and X sessions already open in Chrome. It
  never asks for or stores those passwords.
- The imported data goes to the noticed account shown in the popup. The
  extension holds no noticed password.
- Scans are paced and bounded. After the first import, the network refreshes
  roughly monthly.
- The extension code is public and auditable.

Do not call the extension risk-free. LinkedIn restricts automated access, so
there is residual platform risk. The safeguards are narrow access to the user's
own network, no message content, read-only product behavior, paced requests,
bounded scans, and infrequent refresh.

For the broader security and privacy explanation, link to the
[noticed Trust Center](https://www.noticed.so/trust). The link does not replace
answering the user's concern.

## Answering a trust question

Cover the concern fully: why noticed recommends the Chrome extension, the
signed-in-session model, the two separate Chrome permission prompts, the fact
that the current social permission includes LinkedIn and X, what it reads, what
it never reads or does, where the data goes, and the honest platform-risk
boundary. Then ask whether the user is ready to install or wants to clarify
anything else. Do not create a generic `ask another question` menu option.

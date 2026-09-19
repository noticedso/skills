# Research-partner workflow

Use one canonical dashboard per company. A company may have one or more goals;
each goal has its own segments, lists, outreach, and metrics. Use the same exact
goal name everywhere and never aggregate unrelated funnels.

The operating loop is:

**Goal → Segment rules → List → Review → Learning → Refinement → Outreach**

## Dashboard

Keep these sections in this order:

1. **Progress** — goal statements and per-goal Meetings, Outreach, and
   Opportunities metrics; Network remains a company-level snapshot.
2. **Next** — a short to-do list naming the goal, owner, and concrete action.
3. **Segments** — the current observable targeting rules.
4. **Lists** — every generated batch and its result.
5. **Outreach** — approved people, drafts, and confirmed outcomes.
6. **Company** — link to the Company Brain.

Unknown values display as “—”. Update the last-measurement date only for verified
data. Keep goal metrics separate.

## Segments

Database properties: **Segment** (title), **Goal**, **Priority**.

The segment name is the short plain-language definition of who to find. There is
no separate “Who” field and no separate hypothesis page. A connector is simply a
segment with connector-specific rules.

Every segment page uses a criteria table with **Category**, **Required**,
**Prefer**, and **Exclude**. Keep all categories present for consistency, leaving
unused cells empty:

- Geography
- Sector / industry
- Company size
- Role
- Business model
- Offering / product
- Funding
- Hiring
- Headcount growth
- Market expansion
- Technology used
- Revenue
- Company age

Write comma-separated tags or short observable rules, not profile prose. Required
means every populated category must match; comma-separated alternatives within a
cell mean “or.” Prefer improves ranking but is optional. Exclude disqualifies.
Rules must be testable through public search or data enrichment. Facts discoverable
only through contact belong in a collapsed contact-only note, not in targeting.

Below the criteria, use **Learnings & refinements** with columns **Date**,
**Batch**, **Focus**, **Results · Yes / No / ?**, **Learned**, and
**Next refinement**.

## Lists

Database properties: **List** (title), **Goal**, **List link**, **Segment**
(relation), **Generated**, **Review**, **Results**.

One row represents one generated batch. Preserve every batch so progress and rule
changes remain traceable. The list review tests the statement: **“This looks like
a good fit. We should reach out to them.”** Use explicit Yes, No, and Not sure.

## Outreach

Database properties: **Person** (title), **Source list** (relation to Lists),
**Status**, **Sender**, **Channel**, **Sent on**.

Source list is required attribution. Its List row already supplies Segment and
Goal, so do not duplicate those properties in Outreach.

The entry body contains **Message draft**, **Why reach out**,
**Introduction through**, and a collapsed **History & source** toggle. Outreach
is an evidence log, not a sales-management system.

## Company Brain

Use exactly these headings:

1. Company & product
2. Pricing & business model
3. Market & positioning
4. Customer needs & examples
5. Business goals & baseline
6. Sales process & channels
7. Team & responsibilities

Keep original source links in a collapsed **Library** toggle. Mark facts that
need human confirmation in red. The Brain describes the company; targeting rules
and batch learning live in Segments and Lists.

## Counting and write safety

Yes rate measures suggestion quality. Reply rate measures target responses.
Meetings are accepted meetings. Deduplicate people within each goal. A connector's
reply does not count as the target's reply unless the connector is itself the
target of that goal.

Verify the selected company and destination data sources before writing. Reuse
existing rows before creating new ones and read back every write. After a timeout,
check whether the write landed before retrying. Preserve human edits, sources,
historic lists, verdicts, and results.

Customer context, IDs, credentials, and run history stay outside this public
plugin. Existing authorization covers the agreed dashboard/list/draft updates;
it does not authorize sending messages, enabling schedules, or writing to another
company's workspace.

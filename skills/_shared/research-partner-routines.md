# Shared research-partner rules

Both daily skills read this file. Keep customer context, access credentials and
run history outside the public plugin. The
[configuration example](customer-config.example.yaml) defines the private inputs;
it is a shape to fill, not runnable customer configuration.


## Shared objective, external customer context

The objective for every customer is booking meetings. The customer's workspace
defines with whom, why the meeting matters, what qualifies and the meeting target.
Yes rate measures suggestion quality; reply rate measures outreach response.
Neither replaces the meeting outcome.

Keep these skills identical across customers. Load the selected customer's
company, offer, ICP, profile definitions, exclusions, examples, baseline, team,
voice and channel preferences from their current Notion and noticed workspace and
approved sources. The private configuration locates those sources and records
operational settings; it should not duplicate the company brief. Do not embed
customer context in these skills, their public references or scheduler prompts.
Manual prompts select one step and point to the private customer page.

Do not assume an industry, geography, buyer role, company stage, investor type,
meeting target or profile definition from a previous customer. Resolve material
gaps with that customer's FDE, while continuing work that does not depend on them.

## Scope and authority

Operate on one explicitly selected customer. Verify the connected noticed team
and Notion page/data-source ownership before writing. Never fall back from a
missing team to the operator's personal network or another customer's tables.
Read current tool schemas and the customer's current instructions instead of
assuming old names or capabilities still work.

The dashboard and digest are customer-visible. Use context appropriate to that
audience; access to a private note is not permission to quote it to the customer
or a prospect. Keep private operational evidence in the configured run state.

An authorized routine run can make its agreed list, draft and dashboard updates
without repeated approval. Respect existing authorization; a config file or a
skill does not grant new permissions. An explicit dry run is read-only. For a
paused customer or schedule, inspect and prepare a preview unless the user
explicitly authorizes a manual write run. Do not create/enable scheduled tasks,
enroll customers, assert payment, or publish plugin changes through these skills.

There are three stable profiles, each with its own iteration number and 25 people
per complete batch. One hypothesis maps to one saved noticed target list (older
interfaces may call these goals). Stable profile keys survive display-name edits.
The confirmed ICP lives in Knowledge; experimental changes live in iterations.

## Evidence and counting

Human review is explicit Yes / No / Not sure for a particular candidate in an
iteration. Not sure counts as reviewed, but not as Yes. Silence, removal from a
pending list, an agent-written label and list membership are not verdicts.
Preserve corrections with their provenance; never manufacture a full review from
aggregate counts. Missing support for Not sure is a product gap, not permission
to map it to No. The latest answers in noticed Reviews are the approval authority. Missing tool
access blocks dependent work; do not write substitute approvals in Notion.

Track opportunity quality separately from outreach response. The customer's Yes
means fit; a target's reply means response of any sentiment. An intermediary's
reply is not a target reply. Evidence of an intro request counts as contact;
identify the intended target and the actual recipient in its activity.

## Safe continuation

Use the configured durable private state plus readback from the destination:

- Run identity: customer, routine and local date. Profile work also records its
  stable profile key, iteration number, hypothesis version and list ID.
- Batch evidence: original 25 canonical person IDs and ranks, rationale/source
  links, explicit reviews and corrections. Do not replace an already reviewed
  batch in place.
- Outreach identity: customer and canonical person ID. Store the Notion entry,
  approval provenance, draft state and processed activity IDs or stable event
  fingerprints. Digest identity includes destination and local date.
- Checkpoints: last verified completed operation, uncertain operations and a
  meaningful failure/recovery note. Do not store secrets or copy full personal
  dossiers when IDs and source links suffice.

Reuse existing records before creating new ones. After a timeout, inspect whether
the write landed before retrying. If the result remains ambiguous, stop only that
operation and continue independent work. Do not advance a success checkpoint on
an unverified write. Use the runtime's lock or single-run facility when available;
otherwise avoid overlapping writers and reconcile existing work before resuming.

Each routine owns its dashboard row(s)
and metrics. Fresh-read and patch only those parts, preserving customer formatting
and edits. Do not overwrite an entire shared page from an earlier snapshot.

If a tool, schema or permission is missing, preserve useful prepared work in the
configured state and report the smallest blocked step. Do not change the schema,
use undocumented endpoints, or fabricate completion to work around a capability
gap. Reconcile the current destination before resuming after repair.

## Finish the requested step

Stop after the requested preparation, learning, drafting or activity-reconciliation
step. Report completed, waiting and blocked work plus the next responsible person.
A completed profile can record learning while another waits. Starting its next
iteration requires a request. Never infer permission from a date, a saved schedule,
or the fact that the previous step succeeded.

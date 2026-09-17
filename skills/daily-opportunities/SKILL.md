---
name: daily-opportunities
description: Prepare or refine 25 opportunities that advance the engagement goal within one agreed target profile, using a concrete hypothesis and human review feedback.
---

# Daily opportunities

Advance the engagement goal through relevant opportunities and meetings. Own hypotheses within an agreed target track, candidate selection, review batches, feedback and iteration learning. Improve the share receiving a human **Yes**, with booked meetings as a measurable outcome where applicable.

## Inputs and terms

Use the **customer page** and **selected target profile** supplied in the request or established in the conversation. The customer has three target profiles; each run focuses on one. If the selection is unclear, ask.

If starting from a research-partner directory linked in the conversation or workspace instructions, open the selected partner’s page and follow its links for setup and context. Confirm the customer and connected noticed team. Inspect the live Notion pages, fields and templates before writing; follow renamed fields by their meaning, preserve human edits and leave computed properties to Notion. Ask only for missing information needed for this step.

- **Target profile:** the broad audience selected for this run.
- **Hypothesis:** the specific characteristics and signals being tested to identify that audience.
- **Iteration:** one hypothesis, 25 suggested people, their reviews and recorded learning.

Before candidate work, confirm that noticed exposes `configure_list_review` and `get_list_reviews`, and that the connected Notion account can read the customer page. Missing tools or access leave this run **Preparing**, with the exact blocker recorded; do not promise a working review flow. Once access is restored, resume the already requested step from saved evidence.

Establish the intended human reviewer from the customer page or conversation. `get_list_reviews` returns only the authenticated user's answers (`reviewScope: self`, `reviewerUserId`). Team-list access does not expose teammates' answers. If the connected identity is not the intended reviewer, report that mismatch instead of treating zero visible answers as customer non-response.

## Determine the next step

Read **Knowledge → Company context**, retaining the relevant page, database and data-source IDs. If a response is truncated, fetch the relevant linked sections or query the scoped data source; partial content is not proof that a profile or iteration is absent.

Before creating or refining a hypothesis, starting an iteration or selecting candidates, require a meaningful saved definition of the selected target profile and explicit user agreement to it. Empty, placeholder or “to define” content does not qualify; neither company positioning nor a new search instruction substitutes for that agreement. If missing or unagreed, return to `collect-company-context` to define and agree the profile first, using the new instruction as proposal input. Only the relevant profile needs agreement; unrelated context gaps or pending whole-reference validation do not block this handoff.

In **Hypothesis iterations** (formerly Target Profiles), query actual entries whose **Target profile** (formerly Profile) matches the selection and open the highest **Iteration**. Templates are not iteration rows. Read the saved list and review state before choosing the next step:

- **No entry exists:** define and save the first hypothesis before selecting people.
- **The candidate list is unfinished:** continue building the same list to 25 people; preserve the hypothesis and work already saved.
- **25 people saved but reviews are not configured:** configure and verify reviews on this same list.
- **Reviews configured but the Notion handoff is incomplete:** repair the missing review link, evidence or tracker update; preserve the batch and any answers.
- **Some of the 25 people lack reviews, after readiness is verified:** update the selected target profile’s **What’s happening** row with the reviewed count, remaining count and review link. Stop this run. **Not sure** counts as reviewed.
- **All 25 are reviewed:** record the feedback and learning before defining the next hypothesis.

A new day does not start a new iteration. Continue only the step requested by the user. If list membership differs from the saved batch, report the discrepancy before changing membership, interpreting feedback or creating another iteration.

## Define the hypothesis

Using company context and recorded learning, write a concrete hypothesis: which characteristics and observable signals identify people who fit the selected target profile, and why. A hypothesis may experimentally refine an established profile; it cannot supply a missing broad track definition.

Prefer signals relevant to fit that can be observed in noticed. Distinguish direct evidence from proxies, and treat missing information as unknown.

Save the hypothesis in the iteration’s **Hypothesis** section. In **Basis**, summarize the supporting evidence. For subsequent iterations, use **What changed** to explain the refinement and which previous learning motivated it.

## Select 25 people

Search within the connected noticed team for around 50 candidates matching the hypothesis. Check the engagement's outreach records and relevant noticed actions to exclude people already being pursued; list membership alone does not mean active pursuit. A title such as founder is a proxy, not proof of the required product, company stage, sales responsibility or need. Keep those unknowns explicit and exclude known contradictions.

Enrich all eligible candidates with `enrich_person`, then select and rank the best 25. `started` and `in_progress` mean asynchronous work, not verified new facts. Read the person's record back, including enrichment state, before using refreshed evidence. Record skipped/ineligible outcomes. If selection depends on pending enrichment, use bounded checks, save the candidate IDs and remaining work, and leave the iteration **Preparing** rather than polling indefinitely or claiming completion.

Create the list with `create_list`: put the hypothesis and fit criteria in `description`, use the selected team’s `organization_id`, and set `ai_enabled: false`. Add only the selected 25 through `add_to_list`; creation does not add members. Reuse the existing list when resuming. Save its ID on the iteration and record all 25 person IDs with rank, fit rationale, supporting observed facts versus proxies, enrichment outcome and remaining uncertainties. Preserve useful existing evidence when repairing an incomplete record. Use returned URLs; never invent routes.

If fewer than 25 credible matches are available, keep the iteration **Preparing** and explain the shortfall. Do not weaken the hypothesis or fill the batch with known poor matches to reach 25.

## Make the list ready for review

Use `configure_list_review` with `question` set to **“Does this person genuinely fit the target profile?”** and concise hypothesis context in `description`. Writing the question in Notion or the list description does not configure reviews. Read existing configuration first when resuming; preserve a matching question and any human edits. Identical setup is safe to retry, but a changed locked question must not be overwritten.

Read back `get_list` and `get_list_reviews`:

- Compare all saved list member IDs and eligible review `memberPersonIds` with the intended 25 IDs. Use `member_total` and review `total`, not page lengths. Continue `get_list` with `page`/`page_size` while `member_has_more`; review member pages contain 10 IDs, so continue `page` while `memberHasMore`, even if `hasMore` for answers is false.
- Verify `setupState: configured`, the actual question/context, intended reviewer identity and list access. Caller access alone does not prove access for a different customer. Report missing/inaccessible members or reviewer mismatch; do not expand sharing to make a check pass.
- Save the returned **`review_url`** in the iteration's Target list field and the selected profile's **What’s happening** row. `canonical_url` opens the general goal, not its review controls.

Only after these checks and the candidate evidence are saved, set **To review** and read back both Notion destinations. If a write fails or its outcome is uncertain, inspect what landed and repair that step without recreating the list. Report partial completion until the handoff is consistent.

Keep the hypothesis and candidate list stable during review. Membership and suggestion acceptance are not human fit approval. Link the ready review page, state the next action and wait for human feedback.

## Record feedback and learning

Use `get_list_reviews` without an answer filter and read every page while `hasMore`, including reasons. Match `relationshipId` on each current answer to a saved batch person ID. Verify the same intended reviewer throughout; corrections replace old answers and undone answers disappear. Silence, removal and suggestion rejection are not fit verdicts. Once all 25 distinct saved batch members have current human reviews, record the Yes / No / Not sure counts and **Yes rate = Yes ÷ 25** on the Notion iteration. **Not sure** is reviewed but not Yes; verify formula results rather than overwriting computed fields.

In **What we learned**, compare the hypothesis, the people selected and the customer’s feedback. Explain which signals helped identify fit, where matches fell short, and whether the issue was the hypothesis or its application during selection. Keep uncertainties explicit.

Mark the iteration **Complete**. Use the recorded learning to inform the next hypothesis when starting another iteration.

## Close the run

Update the selected target profile’s **What’s happening** row with the iteration number, current state and next action.

Read back the saved list and changed Notion records before reporting success. After an uncertain write, check whether it landed before retrying. Briefly tell the user what was saved, link to the iteration and identify anything awaiting their input.

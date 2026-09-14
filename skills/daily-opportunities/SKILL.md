---
name: daily-opportunities
description: Prepare or refine 25 sales meeting opportunities for one target profile, using a concrete hypothesis and human review feedback.
---

# Daily opportunities

The goal is to book sales meetings. Find opportunities for one target profile by testing which characteristics and signals identify people who fit. Improve the share receiving a human **Yes**, with booked meetings as the outcome.

## Inputs and terms

Use the **customer page** and **selected target profile** supplied in the request or established in the conversation. The customer has three target profiles; each run focuses on one. If the selection is unclear, ask.

If starting from a research-partner directory linked in the conversation or workspace instructions, open the selected partner’s page and follow its links for setup and context. Confirm the customer and connected noticed team. Inspect the live Notion pages, fields and templates before writing; follow renamed fields by their meaning, preserve human edits and leave computed properties to Notion. Ask only for missing information needed for this step.

- **Target profile:** the broad audience selected for this run.
- **Hypothesis:** the specific characteristics and signals being tested to identify that audience.
- **Iteration:** one hypothesis, 25 suggested people, their reviews and recorded learning.

Use noticed MCP to search relationships, create or resume the iteration’s list, and retrieve human reviews.

## Determine the next step

Read **Knowledge → Company context**. In **Hypothesis iterations** (formerly Target Profiles), find entries whose **Target profile** (formerly Profile) matches the selected target profile. Open the entry with the highest **Iteration** number.

- **No entry exists:** define and save the first hypothesis before selecting people.
- **The candidate list is unfinished:** continue building the same list to 25 people; preserve the hypothesis and work already saved.
- **Some of the 25 people lack reviews:** update the selected target profile’s **What’s happening** row with the reviewed count, remaining count and review link. Stop this run. **Not sure** counts as reviewed.
- **All 25 are reviewed:** record the feedback and learning before defining the next hypothesis.

A new day does not start a new iteration. Continue only the step requested by the user.

## Define the hypothesis

Using company context and recorded learning, write a concrete hypothesis: which characteristics and observable signals identify people who fit the selected target profile, and why.

Prefer signals relevant to fit that can be observed in noticed. Distinguish direct evidence from proxies, and treat missing information as unknown.

Save the hypothesis in the iteration’s **Hypothesis** section. In **Basis**, summarize the supporting evidence. For subsequent iterations, use **What changed** to explain the refinement and which previous learning motivated it.

## Select 25 people

Search within noticed only for around 50 candidates matching the hypothesis. Enrich all eligible candidates with `enrich_person`, then select and rank the best 25. Exclude people already being pursued for this engagement.

Create a noticed list containing only the selected 25 people, then save its link on the Notion iteration page. Reuse the existing list when resuming an unfinished iteration. Record their ranking, fit rationale and remaining uncertainties on that page.

If fewer than 25 credible matches are available, keep the iteration **Preparing** and explain the shortfall.

## Make the list ready for review

Set the review question to **“Does this person genuinely fit the target profile?”** Add concise context from the hypothesis so the customer understands the proposed fit criteria.

Verify that the saved list contains the intended 25 people and is ready for review. Link it from the Notion iteration and set its status to **To review**. Keep the hypothesis and candidate list stable during review. List membership means included for review, not human approval.

Update the selected target profile’s **What’s happening** row with the review link and next action. Stop and wait for human feedback.

## Record feedback and learning

Read all pages of current human reviews in noticed, including reasons; silence or removal from a list is not a verdict. Once all 25 people have current human reviews, record the Yes / No / Not sure counts and **Yes rate = Yes ÷ 25** on the Notion iteration. **Not sure** is reviewed but not Yes; verify formula results rather than overwriting computed fields.

In **What we learned**, compare the hypothesis, the people selected and the customer’s feedback. Explain which signals helped identify fit, where matches fell short, and whether the issue was the hypothesis or its application during selection. Keep uncertainties explicit.

Mark the iteration **Complete**. Use the recorded learning to inform the next hypothesis when starting another iteration.

## Close the run

Update the selected target profile’s **What’s happening** row with the iteration number, current state and next action.

Read back the saved list and changed Notion records before reporting success. After an uncertain write, check whether it landed before retrying. Briefly tell the user what was saved, link to the iteration and identify anything awaiting their input.

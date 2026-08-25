# Signup integration boundary

The prototype shows that Activate onboarding needs two cooperating layers.

## Product owns deterministic state

- onboarding version and completed flag
- current stage and resumability after reload
- extension install, LinkedIn access, sync started, and sync completed events
- connected-source status and connection UI
- persistence of the goal, feedback, and final shortlist
- early-access state, Slack invite dispatch, and verified invite status

The model never infers or advances these states. Product events update the
state machine; the next agent turn receives the verified state.

## Agent owns the conversation

- how to explain what the current data can and cannot do
- which useful observation to give before an ask
- interpretation of the open-ended goal
- whether company/product context is sufficient
- the two or three ideal-example question
- shortlist reasoning and relationship context
- what the user's feedback taught noticed
- which optional source would resolve the current uncertainty
- the optional relationship-maintenance handoff and concise finite recap

## First integration slice

1. Start the chat after Google or Microsoft sign-in and initial calendar
   mapping.
2. Supply verified aggregate observations to the agent.
3. Persist the initial top-level choice. V1 continues through the find-people
   flow and may offer the relationship-maintenance flow only after that result
   is complete.
4. Gate on the existing extension checkpoint contract.
5. Collect the open-ended goal, product/company context, and ideal examples.
6. Run network retrieval after the first successful LinkedIn import and give
   the model a bounded candidate set with evidence.
7. Persist per-person judgments and reasons, then rerank the same candidate
   pool plus eligible replacements.
8. Preserve the final five and offer the optional relationship-maintenance
   handoff.
9. After the user declines that handoff, or after it later completes, add the
   user to early access and dispatch the Slack invite. Pass the verified result
   to the agent so it can close without inventing an external action.

## Prototype lesson

A portable skill is enough to test the experience in ChatGPT, Codex, and the
noticed agent. It is not enough to guarantee checkpoint correctness in the
real signup flow. Production should encode the stage machine in application
state and use the skill as the behavioral layer inside each verified stage.

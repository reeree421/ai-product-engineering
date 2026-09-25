# Agent notes (Session 10)

## Goal
## Plan steps
## What verified / failed
# Agent Task Notes — Lab 10.3

## Task
From this user story JSON, produce requirements, a REST sketch, and a test plan:
{ user: 'admin', action: 'delete_account' }

Ran this task twice to compare outputs.

## Did the agent stick to the plan?
Both runs followed a consistent overall shape (Requirements → REST spec →
Test plan → Implementation/schema details), suggesting the PLAN step reliably
produces a similar decomposition even without seeing its exact text. Section
ordering and depth stayed coherent across all 4 EXECUTE steps.

## Fact-check one claim
Claim: a partial unique index (`WHERE status != 'DELETED'`) allows email reuse
after soft-deletion without violating a uniqueness constraint.
Verdict: Correct — this is a standard, real Postgres pattern for exactly this
soft-delete/reuse scenario.

## Did context get too long/confusing by step 4?
Yes — not through incoherence, but through duplication. In both runs, the
SYNTHESIZE step (FINAL) repeated the entire contents of the final EXECUTE
step nearly verbatim rather than condensing it. In run 2, a truncated/cut-off
line ("...`ip_ad`") from the EXECUTE output was copied unchanged into FINAL,
showing the model wasn't re-reasoning over the content, just re-emitting it.
Root cause: the SYNTHESIZE prompt in run-agent-task.js says "combine ... into
one coherent deliverable" without explicitly instructing deduplication/trimming.

## Additional observation: non-determinism between runs
Running the same goal twice (temperature: 0.3) produced two internally
consistent but materially different API designs — e.g. 200 OK vs 204 No
Content for success, and different error response envelope shapes. Neither
is wrong, but it shows the agent isn't deterministic and downstream consumers
(e.g. a test suite) would need to be generated in the same run as the spec
they're testing against, not written by hand separately.

## Overall observations
- Individual section quality (RBAC, audit logging, idempotency, rollback
  plans, GDPR/CCPA handling) was strong and realistic in both runs.
- Main weakness: SYNTHESIZE behaves as "concatenate" rather than "condense."
  Fix: explicitly instruct it to deduplicate and remove redundant sections.
- Also hit transient Gemini 503 (model overloaded) errors mid-run; added
  retry-with-backoff (1s/2s/4s, 3 retries) to askAi() in run-agent-task.js.
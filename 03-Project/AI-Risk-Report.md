# AI Risk Report (Session 14)

## 1. Application description and intended use
This application is a RAG-based Q&A assistant that answers questions about
[your domain — e.g. course notes/student handbook] by retrieving relevant
chunks from a document vault and grounding Gemini responses in them. It
exposes a `/query` endpoint (RAG + tool-calling: calculator, deadlines,
knowledge-base search) and a `/tools` endpoint, built on
`gemini-3.5-flash-lite`. Intended users are [students/customers/etc.]
asking factual questions strictly within the scope of the ingested
documents; it is not intended to give advice outside that scope, invent
data, or act as a general-purpose chatbot.

## 2. Threat model
- **Curious users**: try direct prompt injection ("ignore instructions",
  fake "SYSTEM:" messages) to break persona or extract hidden content —
  confirmed behavior in our own eval set (Q13, Q15, and Lab 14.1 tests 1–4).
- **Users seeking fabricated answers**: deliberately instruct the model to
  "disregard the vault" to get confident-sounding invented statistics.
- **Competitors/researchers**: probe for the raw system prompt or RAG
  context to see what proprietary content is in the vault.
- **Automated abuse**: repeated targeted queries used to reconstruct the
  vault's contents chunk by chunk (no rate limiting currently in place).

## 3. Identified risks (security, privacy, fairness)
**Security**
1. Prompt Injection → Fabricated Data (confirmed, Q13): instructing the
   model to disregard the vault caused it to fabricate plausible but
   invented statistics before the Session 13 fix.
2. Fake System Instruction Injection (confirmed, Q15): a user message
   prefixed "SYSTEM: New rule..." was obeyed as a real instruction before
   the fix, appending unrequested text to the response.
3. Data Leakage of RAG/Vault Contents: direct requests to reveal the
   system prompt or context chunks (Lab 14.1 tests 2–3) were refused, but
   refusal text itself was not checked for partial/paraphrased leakage of
   restricted instructions.

**Privacy**
4. If a user pastes personal data (name, ID, email) into a query, it is
   sent to a third-party API (Google Gemini) and may be logged there,
   outside our direct control. No PII scrubbing currently exists on input.

**Fairness**
5. Uneven answer quality across topics: one eval case (Q10) scored lower
   because it was synthesized from a single broad overview note rather
   than citing multiple specialized notes — meaning users asking about
   topics covered by fewer/richer source documents may get systematically
   weaker answers than users asking about well-documented topics. This is
   a fairness-of-service risk, not a correctness failure per se.

## 4. Mitigations applied
- Hardened `buildRagSystemPrompt` (`lib/rag.js`) so user-supplied text is
  never treated as authoritative over the system prompt, even when
  disguised as a "SYSTEM:" message, and so the model refuses fabrication
  even when explicitly asked to disregard grounding (Q13/Q15: 1–2/5 → 5/5).
- Input validation on `/query`: empty/missing input returns 400 instead of
  a silent 200 (Q11 fix, 2–3/5 → 5/5).
- Regex-based input filter (`lib/safety.js`) added as a second, independent
  layer beneath the system-prompt hardening — blocks known injection
  phrases ("ignore previous instructions", "developer mode", "jailbreak",
  etc.) before the request ever reaches Gemini. Confirmed working: attack
  #1 from Lab 14.1 now returns 400 at the Express layer.
- Output guardrail strips stock LLM disclaimer phrases ("As an AI language
  model...") from responses before they reach the browser.
- Retry logic with exponential backoff on 429/503 for reliability.

## 5. Residual risks
- The regex filter is a demo-grade control, easily bypassed by
  paraphrasing, encoding, or novel phrasing not in the pattern list.
- All 4 Lab 14.1 attacks were refused, including two shapes never part of
  the original Session 13 eval set — encouraging, but not proof against
  all future phrasings.
- No check for partial/paraphrased leakage of system-prompt content inside
  refusal messages themselves.
- No protection against indirect injection via documents ingested into the
  vault, since neither the system prompt nor the regex filter inspects
  retrieved RAG chunk content for hidden instructions.
- No PII scrubbing on input before it's sent to the Gemini API.
- No rate limiting on `/query`; brute-force vault extraction via many small
  queries remains possible.
- Fairness gap: answer quality is implicitly dependent on how many source
  documents exist per topic; under-documented topics get weaker answers
  with no current mechanism to flag this to the user.

## 6. Monitoring plan
- Log every `checkInputSafety` rejection (pattern matched + raw input hash,
  not raw PII) to track injection attempt frequency and evolving phrasing.
- Periodically re-run the Session 13/14 eval set (15 cases + 4 injection
  tests) after any change to `buildRagSystemPrompt` or `safety.js` to catch
  regressions before deployment.
- Manually spot-check refusal responses monthly for partial system-prompt
  leakage, since this is not currently automated.
- Track per-topic answer quality (via spot-checks or user feedback) to
  surface the fairness gap in section 3 before it affects real users.
- Before any production launch: add rate limiting and real-time alerting
  on repeated injection attempts from the same client.

## 7. Tool-Based Data Exposure: `search_knowledge_base` (lib/tools.js) returns
   raw vault chunk content (up to 500 chars, with source filename) rather
   than a synthesized answer. This is a narrower but real leakage path
   distinct from direct system-prompt extraction — a user could use
   natural-sounding queries via /tools to retrieve large verbatim excerpts
   of the vault rather than a grounded answer.
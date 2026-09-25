# Extraction notes (Session 12)

# Extraction Notes — Lab 12.1 & 12.2

## Image 1: Hill-Climbing.png
Extracted: global maximum, local maximum, shoulder, flat local maximum,
axis labels (Objective Function vs State Space).

- Correct: All 4 terrain features and both axis labels match the image exactly.
- Missing: The "Current State" marker (green dot) and the arrow showing
  movement up the slope are not mentioned anywhere in the extraction,
  despite being clearly labeled in the image.
- Hallucinated: None found.

## Image 2: Comparison-Table-Deep-Learning-Algorithms.png
Extracted: 8 algorithms (FFNN, CNN, GAN, Transformer, RNN, DQN, LSTM, GNN),
5 key points covering use cases/strengths/limitations.

- Correct: Transformers, GNNs, and the RNN/LSTM vanishing-gradient contrast
  are all extracted accurately and specifically, matching the table's
  actual Best For / Strengths / Limitations columns almost word-for-word.
- Missing: DQN and FFNN are named in the list but get no individual
  facts in the 5 key_points — their real column data (e.g. DQN's
  "Cybersecurity automation" / "Needs extensive training") never surfaces.
  Likely a consequence of the prompt's 5-point cap on an 8-row table
  rather than an extraction failure.
- Hallucinated: None found — every claim checked traces to real table text.

## Image 3: simulated-annealing.png
Extracted: Local Optimum, Global Optimum ("the absolute lowest point"),
Temperature Decay, a ball at the optimum.

- Correct: Global Optimum correctly identified as the lowest point (this
  image genuinely uses a minimization/valley framing, unlike
  Hill-Climbing.png's maximization/peak framing — both are accurate to
  their own images, not inconsistent).
- Missing: The curved arrow pointing from the Global Optimum back up to
  the Local Optimum (showing an escape path) is not mentioned at all.
- Hallucinated: None found.

## Correcting an earlier assumption
I initially suspected the differing "maximum vs. minimum = best" framing
between Hill-Climbing.png and simulated-annealing.png was a model
hallucination (picking a framing based on convention rather than the
actual image). After viewing both images directly, this was wrong — each
image genuinely uses a different, correct convention (hill climbing as
peak-seeking, simulated annealing as valley-seeking), and the model read
both correctly. Lesson: don't conclude "hallucination" from a cross-image
inconsistency without checking the source images first.

## Actual pattern found: arrows/directional cues get dropped
Across all three images, the model reliably extracts static labels
(named features, axis titles, table cells) but consistently omits
dynamic/directional elements — arrows showing movement, current position
markers, or escape paths. This is a more accurate description of this
model's real weakness on these images than the "inconsistent framing"
theory.

## Prompt iteration
Tightened EXTRACTION_PROMPT to require literal quoting, an explicit
framing field, and an uncertain_or_illegible field. [Re-run and check
whether the new prompt starts capturing arrows/directional markers,
since the current prompt's key_points schema has no field asking about
motion, arrows, or current-state indicators — this may need an added
field like "visual_cues" to actually fix the gap.]

## Prompt iteration results
Reran all three images with the updated prompt (added `framing` and
`visual_cues` fields, plus literal-quoting instructions).

- Hill-Climbing.png: IMPROVED. Now captures the "Current State" marker
  and its directional arrow — previously missing entirely.
- simulated-annealing.png: IMPROVED. Now captures the curved escape-path
  arrow between the local and global optimum, and additionally notices
  the ball's color pattern (green/red/blue stripes) — a level of detail
  the original prompt didn't surface.
- Comparison-Table-Deep-Learning-Algorithms.png: REGRESSED on key_points.
  visual_cues correctly returns empty (no arrows in a table — good
  negative case), but key_points now lists only the 4 column headers
  instead of specific per-algorithm facts (e.g. "Transformers: NLP and
  threat analysis" is gone). The literal-quoting instruction seems to
  push the model toward quoting headers verbatim rather than synthesizing
  row-level content, which is a real trade-off of asking for literalism.

## Conclusion
Tightening the prompt fixed the arrows/movement blind spot on diagrams,
but introduced a new weakness on tabular data, where literal quoting
undercuts useful summarization. Next iteration would need a
content-type-aware prompt: literal extraction for diagrams, but
per-row synthesis explicitly requested for tables.

## Lab 12.3 Checkpoint
Surprising finding: the model didn't hallucinate any facts across three
technical diagrams — impressively accurate on static content. But it
consistently ignored arrows and movement indicators (current state dot,
escape-path arrow), suggesting the extraction schema itself needs an
explicit prompt for directional/dynamic visual elements, not just labels.
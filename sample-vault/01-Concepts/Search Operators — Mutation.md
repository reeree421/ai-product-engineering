
---
tags:
module/ai-ii
part/optimisation
topic/evolutionary-algorithms
sources:"MIT ESD.77 Lecture 11 — Genetic Algorithms I"

---

**What problem does it solve?**
Crossover (see [[Search Operators — Recombination]]) can only recombine genetic material that already exists somewhere in the population — it cannot introduce anything genuinely new. Over enough generations, a population driven by selection and crossover alone will tend to lose diversity: certain gene values will get selected out of the population entirely, at which point no amount of recombination can bring them back. Mutation exists specifically to counteract this — it randomly alters individual genes, reintroducing variation that crossover and selection alone would eventually exhaust.

**How it works**
After offspring are produced by crossover, each gene in each offspring is subjected to a small, independent probability of being randomly changed (for binary encoding, this typically means flipping a 0 to a 1 or vice versa). "Independent" is important: the decision to mutate one gene has no bearing on whether any other gene mutates — each is its own coin flip.

**Parameters / design choices**
Mutation rate — the probability, per gene, of a mutation occurring. This is the single most consequential parameter:
Too low, and the population can lose diversity faster than mutation replenishes it, leading to premature convergence — the population collapses around a mediocre solution because no individual carries the genetic material needed to escape it (a specific, well-documented failure symptom: convergence happening unusually fast, often diagnosed as the mutation rate being set too small).
Too high, and mutation starts to dominate over selection pressure entirely — the search behaves more like undirected random search than a directed evolutionary process, since useful gene combinations built up by selection and crossover get randomly destroyed almost as fast as they're created.
Mutation scope — whether mutation applies uniformly across all genes, or is weighted differently for different parts of the chromosome (relevant for structured or mixed encodings).
Encoding-dependent mutation operators — for non-binary encodings, "mutation" needs its own problem-specific definition: e.g. for a permutation-based encoding (like a tour of cities), a bit-flip doesn't make sense, so mutation might instead swap the positions of two randomly chosen cities in the tour.

**Strengths**
The only operator (of selection, crossover, mutation) capable of introducing genuinely new genetic material into the population — it's the search's escape hatch against irreversible loss of diversity.
Cheap to implement and apply, since it typically only requires a per-gene random draw.
Provides a tunable dial for exploration vs. exploitation: raising or lowering the rate directly trades off how much the search wanders versus how much it exploits what selection and crossover have already found.

**Weaknesses**
Extremely sensitive to the rate parameter, with failure modes on both sides (too low → premature convergence; too high → effectively random search) and no universal "correct" value — the right rate is problem-dependent and usually needs to be found experimentally.
Because it acts independently on single genes, mutation on its own has no way to combine two separately-good partial solutions the way crossover can — it's a source of raw variation, not of directed improvement.
For non-trivial encodings (trees, graphs, permutations), a naively-defined mutation operator can produce invalid individuals just as crossover can, and needs the same care in design.

**When to use it — and how to tune it**
Mutation is not optional in a genetic algorithm — some non-zero mutation rate is required to prevent premature convergence over a long run, even when the initial population and selection/crossover scheme are otherwise well designed. In practice, the usual approach is to start with a conservatively small rate and increase it if premature convergence (fitness plateauing early while diversity has visibly collapsed) is observed, or to tune it experimentally against a specific problem's landscape. It's worth explicitly comparing mutation-rate settings against each other on the same problem, since the "too fast convergence" symptom is easy to miss if you only ever run the algorithm once at a single fixed rate.

**Ethical / practical** **concerns**
Because too-low mutation is one of the most common causes of a GA silently converging to a mediocre solution while still reporting convergence as if it succeeded, checking whether population diversity has actually collapsed — not just whether fitness has stopped improving — is an important sanity check before trusting a GA's output in any consequential application (see the related caution in [[Evolutionary Algorithms — Overview]] and [[Selection and Replacement Strategies]]).

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note the mutation rate used, and whether you tested what happens at a noticeably higher or lower rate)
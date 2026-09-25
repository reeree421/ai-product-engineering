---
tags:
module/ai-ii
part/optimisation
topic/evolutionary-algorithms
sources:
"MIT ESD.77 Lecture 11 — Genetic Algorithms I"
---


**What problem does it solve?**
Within an evolutionary algorithm (see [[Evolutionary Algorithms — Overview]]), selection decides which individuals get to reproduce, and replacement (insertion) decides how their offspring replace the existing population. Both steps are where the "survival of the fittest" pressure actually gets applied — get them wrong, and either the population never improves (too little pressure) or it collapses into a narrow, mediocre set of near-identical individuals too early (too much pressure). Selection is typically the most computationally expensive and most consequential design choice in the whole algorithm.

**How selection works**
The general goal: bias the choice of parents toward higher-fitness individuals, while still preserving enough diversity in the population that the search doesn't stagnate.

**Ranking-based selection**
Sort the population by fitness rather than using raw fitness values directly, then assign selection probability by rank position — e.g. the best-ranked individual might get twice the selection probability of the second-ranked, and so on down the list. The advantage of working from rank rather than raw fitness is that it's insensitive to how large the fitness differences are — a population with one wildly dominant individual and a population with several close contenders get selected from similarly, since only the ordering matters, not the magnitude of the gap.

**Fitness-proportional (roulette wheel) selection**
Selection probability is directly proportional to an individual's raw fitness score. It's visualised as a roulette wheel where each individual occupies a slice sized according to its share of the total population fitness; spinning the wheel (drawing a random number) picks an individual, weighted naturally toward higher-fitness slices. Because it samples with replacement, the same fit individual can be selected multiple times as a parent.
The key weakness of this scheme, compared to ranking: it is sensitive to the magnitude of fitness differences. If one individual is far fitter than the rest, it can dominate selection so heavily that diversity collapses quickly (a contributor to premature convergence — see [[Evolutionary Algorithms — Overview]]).

**Tournament selection**
Pick a small random subset of the population (commonly just two individuals), compare their fitness, and let the winner survive into the pool of parents/next generation. Repeat until the new population/parent pool is filled. This is popular in practice because it's cheap to compute (no need to rank or sum fitness over the whole population) and its selection pressure is easy to tune just by changing the tournament size — larger tournaments push harder toward the fittest individuals; smaller tournaments (e.g. size 2) are gentler and preserve more diversity.

**Replacement / insertion strategies**
Once offspring have been created, the algorithm needs a policy for how they enter the population:
Full generational replacement — the entire population of parents is replaced by a full population of offspring each generation (select N/2 parent pairs, produce N children, discard all parents). Simple, but risks losing a very fit parent if none of its offspring happen to inherit its strengths.
Steady-state replacement — select two parents, produce a single child, and remove one existing population member (often the current weakest) to make room. This changes the population more gradually and can be more stable, at the cost of more overhead per offspring produced.
Elitist strategy — regardless of which of the above is used, explicitly preserve a small number of the current fittest individuals unchanged into the next generation. This guards directly against losing the best solution found so far to the randomness of selection and crossover.
Hall-of-fame — separately record the best individuals ever seen across the whole run, without necessarily using them for further breeding. This is a bookkeeping safety net rather than a way of feeding good genes forward — it ensures the best solution found is never lost even if the current population's actual quality dips.

**Parameters / design choices**
Selection pressure — how strongly selection favours the fittest individuals. High pressure speeds convergence but risks losing diversity and getting trapped in a mediocre optimum; low pressure preserves diversity but can make progress painfully slow. Tournament size and the shape of the ranking-probability curve are both direct levers on this.
Replacement fraction — how much of the population turns over each generation. Full replacement each generation is aggressive; steady-state, one-at-a-time replacement is gentler.
Elitism count — how many top individuals are guaranteed to survive unchanged; too high and the population stagnates around them, too low (zero) and you risk losing good solutions to chance.

**Strengths**
Ranking and tournament selection both decouple selection pressure from the raw scale of the fitness function, which matters when fitness values are hard to normalise sensibly across a whole run.
Elitism is a cheap, low-risk way to guarantee monotonic improvement in the best-found solution, even while the average population fitness fluctuates.
Tournament selection in particular is simple to implement and computationally cheap, since it never needs a full sort or sum over the population.

**Weaknesses**
Fitness-proportional selection is fragile in the presence of a small number of dominant individuals — it can trigger the same premature-convergence problem discussed in [[Evolutionary Algorithms — Overview]].
Elitism, if set too aggressively (keeping too large a fraction of the population unchanged), can itself cause premature convergence by starving the rest of the population of turnover.
None of these schemes fix a poorly designed fitness function — selection only ever amplifies whatever signal the fitness function provides, for better or worse.

**When to use which**
Tournament selection is a reasonable default for most problems: cheap, tunable, robust to the scale of the fitness function.
Ranking-based selection is worth preferring when the fitness landscape has occasional extreme outliers that would otherwise dominate a fitness-proportional scheme.
Fitness-proportional (roulette) selection is the classic textbook version and useful for understanding the theory, but is less commonly the practical first choice today given its sensitivity to dominant individuals.
Elitism is close to a free addition to any of the above — nearly always worth including in some small amount, since it guards against losing your best result to randomness, at negligible extra cost.

**Ethical / practical concerns**
Selection pressure is the parameter most directly responsible for premature convergence, which is also the failure mode most likely to go unnoticed — the algorithm still reports steadily "improving" average fitness even as the population narrows around a mediocre solution. In any consequential application, it's worth explicitly logging population diversity (not just best/average fitness) across generations, so a collapse in diversity is visible rather than silent.

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note which selection and replacement scheme was used, and how sensitive the final result was to selection pressure)
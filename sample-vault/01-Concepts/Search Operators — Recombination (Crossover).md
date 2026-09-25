---
tags:
module/ai-ii
part/optimisation
topic/evolutionary-algorithms
sources:
"MIT ESD.77 Lecture 11 — Genetic Algorithms I"
---


**What problem does it solve?**
Selection alone (see [[Selection and Replacement Strategies]]) only decides which individuals survive to reproduce — it doesn't create anything new. Crossover (recombination) is the operator that actually generates new candidate solutions, by combining genetic material from two parent individuals into one or more offspring. This is the mechanism that gives evolutionary algorithms their core advantage over pure random search: good partial solutions ("building blocks") discovered independently in different individuals can be stitched together into a single, better individual — something mutation alone cannot do, since mutation only perturbs a single existing individual rather than combining two.

**The biological metaphor**
The term borrows directly from genetics, where chromosome segments are literally exchanged between paired chromosomes during reproduction, producing offspring that combine traits from two parents (rather than being an exact copy of either).

**How it works — single-point crossover**
The classic and simplest version:
Take two parent chromosomes of equal length.
Choose a single crossover point along the chromosome (deliberately or, more commonly, at random).
Split both parents at that point into a "head" and a "tail."
Create child 1 from parent 1's head plus parent 2's tail.
Create child 2 from parent 2's head plus parent 1's tail.
The result: two offspring, each carrying a mix of both parents' genetic material, split at the same point.

**Variants**
Multi-point crossover — instead of a single cut, choose two or more crossover points and swap alternating segments between the parents. This lets more combinations of genetic material be produced from the same two parents, at the cost of being more likely to break up useful adjacent gene combinations that single-point crossover would have kept intact.
Path relinking — rather than a single clean swap, generate a sequence of intermediate children that gradually transform parent 1 into parent 2, one small step at a time, then select the best point along that path. This can find solutions that a single crossover point would skip over, but the resulting children tend to be interpolations between the two parents rather than genuinely novel combinations.

**Parameters / design choices**
Crossover point(s) — random selection is standard and simple; some GA variants bias the point choice based on problem structure (e.g. avoiding cutting through a segment known to encode a tightly coupled sub-solution).
Crossover rate — the probability that crossover is applied at all to a given pair of selected parents (versus simply copying them through unchanged). This is a separate tunable parameter from the crossover point.
Encoding compatibility — crossover assumes parents share a common chromosome structure and length; representations like trees or graphs (as opposed to fixed-length strings) need specialised crossover operators designed for that structure, since a simple "swap positions X to Y" doesn't make sense for a tree.

**Strengths**
The central source of a GA's advantage over undirected random search or mutation-only search: it can combine two independently good partial solutions into something better than either parent alone.
Computationally cheap — a single-point crossover is just a string-splitting-and-recombining operation.
Simple to reason about and implement for fixed-length string encodings.

**Weaknesses**
Crossover can just as easily destroy a good building block as combine two good ones, if the crossover point happens to fall in the middle of a tightly-coupled, mutually-dependent set of genes.
For encodings other than fixed-length strings (trees, graphs, permutations), a naive crossover can easily produce an invalid offspring (e.g. swapping segments of two travelling-salesman tours can produce a "tour" that revisits some cities and skips others entirely) — crossover for these representations needs to be designed carefully to preserve validity.
Contributes to loss of diversity over generations if applied too aggressively relative to mutation, since crossover recombines existing genetic material rather than introducing anything new.

**When to use it over the alternatives**
Crossover earns its computational cost specifically when the problem has some decomposability — i.e. when a good overall solution can plausibly be assembled from good pieces found separately in different individuals. If the problem doesn't decompose this way (each gene's contribution to fitness depends heavily and unpredictably on every other gene, sometimes called high "epistasis"), crossover has little useful material to recombine, and a pure mutation-driven search may do just as well with less complexity.

**Ethical / practical concerns**
None specific to this operator beyond the general evolutionary-algorithm concern (see [[Evolutionary Algorithms — Overview]]) that aggressive crossover combined with strong selection pressure can accelerate premature convergence, since crossover alone cannot introduce material that isn't already present somewhere in the population — that job falls to [[Search Operators — Mutation]].

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note the crossover scheme used, the crossover rate, and whether you observed it destroying good building blocks)
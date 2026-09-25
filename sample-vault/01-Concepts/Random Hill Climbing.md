---
tags:
module/ai-ii
part/optimisation
topic/local-search
sources:
"Berkeley CS188 — 1.5 Local Search"
---

What problem does it solve?
Hill-climbing is for problems where you only care about finding a good final configuration, not the path you took to reach it. Rather than exploring a tree of paths from a start state to a goal, you treat the state space as the set of every complete candidate solution, and you try to move from your current one to a better neighbour, over and over, until you can't improve any further.
This reframing matters because it turns search into optimisation: instead of "find a path," the question becomes "find the state with the highest value of some objective function." Anywhere you can define a scoring function over complete candidate solutions, hill-climbing is a candidate technique.

**How it works**
At each step, hill-climbing looks at every neighbouring state reachable from the current one, and moves to whichever neighbour increases the objective function the most. This is why it's sometimes called steepest-ascent — it always takes the single best available step.
Critically, hill-climbing keeps no memory of where it's been. It doesn't maintain a search tree or a list of visited states — just the current state and its objective value. This makes it extremely cheap in memory, but it also means it can't backtrack: once it commits to a move, there's no going back to try a different branch.
The basic loop:
Start at some state.
Generate all neighbouring states.
If any neighbour scores higher than the current state, move to the best one.
If no neighbour scores higher, stop — you've reached a maximum.

**Parameters / design choices**
Neighbourhood definition — what counts as a "neighbouring" state is entirely problem-specific (e.g. flipping one bit, moving one queen, swapping two elements), and this choice shapes the whole search: a narrow neighbourhood makes each step cheap but may trap the search more easily; a broad neighbourhood is more expensive per step but can see further.
Tie-breaking — when multiple neighbours tie for best, how you choose between them affects trajectory (though usually not correctness).

**Strengths**
Extremely simple to implement and reason about.
Very low memory footprint — no search tree, no frontier, just one state at a time.
Fast per-iteration cost when the neighbourhood is small.
Works on continuous or discrete spaces alike, as long as "neighbour" is well defined.

**Weaknesses**
Plain hill-climbing is incomplete — it isn't guaranteed to find the best (or even a good) solution, because it can get stuck in three characteristic ways:
Local maxima — a state that looks like the best option among its neighbours, but which is not the global best. Locally, it appears to be a peak; globally, it's a false summit.
Flat local maxima (plateaus) — a region where every neighbouring state scores the same as the current one, so there is no uphill direction to take, but the current state also isn't necessarily the best.
Shoulders — flat-ish regions where progress toward a better state is possible but painfully slow, because the improvement per step is tiny or zero for long stretches before the ground rises again.
Because it never accepts a move that doesn't improve the score, plain hill-climbing has no way to escape any of these — once it plateaus or peaks locally, it stops, regardless of how much better the true global optimum might be elsewhere.

**Variants that address these weaknesses**
Stochastic hill-climbing — instead of always taking the single steepest uphill neighbour, it picks randomly among all neighbours that would improve the score. In practice this has been shown to converge to higher-quality maxima than steepest-ascent, at the cost of needing more iterations to get there.
Random sideways moves — allows the algorithm to take moves that don't strictly increase the objective (i.e. moves to equally-good neighbours). This specifically targets the "shoulder" problem, letting the search cross a flat stretch instead of stopping dead the moment nothing looks strictly better.
Random-restart hill-climbing — runs the entire hill-climbing search multiple times, each time starting from a new, randomly chosen initial state, and keeps the best result across all runs. This makes the overall approach trivially complete: with enough random restarts, some run will eventually start close enough to the global optimum's "basin" to reach it. It's a brute-force fix — more compute in exchange for a completeness guarantee — but a very practical one, since each individual hill-climb is cheap.

**When to use it over the alternatives**
Hill-climbing (or a variant of it) is a reasonable first thing to try whenever:
The objective landscape is smooth-ish and not riddled with deep local optima, so a handful of restarts is likely to find a near-global solution.
You need something cheap and fast, and an approximate answer is acceptable.
You don't have gradient information, ruling out calculus-based methods, but you do have a way to generate and score neighbouring candidate solutions.
If the landscape has many deep, well-separated local optima, plain hill-climbing (even with restarts) tends to waste a lot of effort — that's the point at which simulated annealing (see [[Simulated Annealing]]) or population-based methods like [[Evolutionary Algorithms — Overview]] become more attractive, because they have a built-in mechanism for escaping a local optimum rather than only avoiding it by luck of the starting point.

**Ethical / practical concerns**
Hill-climbing's incompleteness matters practically whenever the "good enough" solution it finds has real consequences — e.g. an optimisation used to allocate a scarce resource may quietly settle on a locally-good-but-globally-poor allocation, and because the algorithm gives no signal that it might be stuck, it can look confidently "done" when it isn't. When using hill-climbing (or any incomplete heuristic) in a decision-relevant context, running several random restarts and checking how much the results vary is a cheap way to at least detect obvious local-optimum problems.

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note down the neighbourhood definition your tutorial used, whether it hit a local maximum, and what a random restart changed)
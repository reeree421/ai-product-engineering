---
tags:
module/ai-ii
part/optimisation
topic/local-search
sources:
"Berkeley CS188 — 1.5 Local Search"
"MIT ESD.77 Lecture 10 — Simulated Annealing"
---

**What problem does it solve?**
This note is the connective tissue between [[Random Hill Climbing]], [[Simulated Annealing]], and [[Evolutionary Algorithms — Overview]]: all three techniques exist largely because of the same underlying problem — an objective function's landscape is rarely smooth and single-peaked. It's typically riddled with local optima: points that look best among their immediate neighbours but aren't the true global best. Every local-search technique on your syllabus can be understood as a different strategy for dealing with this one structural difficulty.

**Why local optima are hard to avoid**
Picture the objective function as a landscape, with height representing solution quality. A purely greedy method (see [[Random Hill Climbing]]) only ever climbs — it never voluntarily goes downhill, even briefly. That means the moment it reaches any point higher than all its immediate neighbours, it stops, regardless of whether some other, taller peak exists elsewhere in the landscape, separated from the current position by a dip it would have to cross to get there. The algorithm has no way to "see" that taller peak, because it only ever evaluates its immediate neighbourhood.
Beyond true local maxima, greedy search can also stall on:
Flat local maxima — plateaus where no neighbouring direction offers any improvement at all.
Shoulders — flat-ish regions where improvement is technically possible but so slow that progress crawls.

**Escape strategy 1 — random restarts**
The simplest fix: if a single run of hill-climbing can get trapped depending on where it started, run it many times from different random starting points, and keep the best result found across all runs. This makes the overall procedure complete in a probabilistic sense — with enough restarts, some run is likely to start in (or reach) the global optimum's basin of attraction. The cost is purely computational: more restarts means more total search time, but each individual restart is cheap, so this is often a very practical trade.

**Escape strategy 2 — allow occasional backward moves (simulated annealing)**
Rather than restarting from scratch, simulated annealing changes the acceptance rule within a single run: it sometimes accepts a move that makes things worse, with a probability controlled by a temperature parameter that starts high and is gradually lowered. This lets a single search process walk downhill out of a local optimum's basin, cross the intervening dip, and potentially climb a taller peak elsewhere — something a purely greedy method structurally cannot do. See [[Simulated Annealing]] for the full mechanism and the trade-offs in choosing a cooling schedule.

**Escape strategy 3 — search with a population, not a single point (evolutionary algorithms)**
Rather than fixing single-point search's blindness with either restarts or backward moves, evolutionary algorithms sidestep the problem differently: they track many candidate solutions simultaneously. Because different individuals in the population can be exploring different regions of the landscape at the same time, the population as a whole is less likely to be entirely trapped in one local optimum, even if any single individual might be. Crossover then lets good partial discoveries from different regions of the landscape combine into something better than any one individual found alone. See [[Evolutionary Algorithms — Overview]] for the full mechanism.

**Comparing the three strategies directly**
Strategy	What it changes	Cost	Escape mechanism


| Strategy                | What it changes                      | Cost                                         | Escape mechanism                                        |
| ----------------------- | ------------------------------------ | -------------------------------------------- | ------------------------------------------------------- |
| Random restarts			<br>  | Starting point, repeated             | More total compute (multiple full runs)      | Luck — hope one restart starts in the right basin       |
| Simulated annealing     | Acceptance rule within one run       | One run, but needs schedule tuning           | Deliberate, temperature-controlled backward moves       |
| Evolutionary algorithms | Number of candidates tracked at once | Population overhead, more parameters to tune | Parallel exploration + recombination across individuals |
None of these strategies guarantees finding the global optimum in practical time — they only improve the odds relative to a single greedy hill-climb. This is a genuinely open trade-off in practice, not a solved problem: the "right" strategy for a given problem depends on how expensive it is to evaluate the objective function (cheap evaluations favour many random restarts; expensive evaluations favour a more careful single-run method like SA), how decomposable the problem structure is (favouring EAs, since crossover has something to work with), and how much compute budget is available overall.




**When to reach for which**
Random restarts — cheapest to implement, a reasonable first thing to try if objective evaluation is fast and the landscape isn't too deceptive.
Simulated annealing — worth it when a single well-tuned run is preferable to many independent ones, or when the problem structure doesn't decompose in a way that would make crossover useful.
Evolutionary algorithms — worth the added complexity when the problem does decompose into combinable partial solutions, and when population-level parallel exploration is worth the overhead of tuning several more interacting parameters.

**Ethical / practical concerns**
All three strategies can produce a result that looks confidently "converged" while actually being a mediocre local optimum — this is a structural risk of local search as a category, not a flaw specific to any one method. Whichever strategy is used, checking robustness (do repeated runs, with different random seeds, agree closely?) is a cheap and general way to catch this before trusting a result in any consequential application.

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — compare how the same problem responded to random restarts vs. simulated annealing vs. an evolutionary algorithm, if your tutorial covered more than one)
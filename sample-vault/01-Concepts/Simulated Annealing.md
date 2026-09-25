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

Plain hill-climbing only ever accepts moves that improve the objective, which means it gets permanently trapped the moment it reaches any local optimum — see [[Random Hill Climbing]]. Simulated annealing (SA) is designed specifically to escape that trap: it deliberately allows some backward, objective-worsening moves, giving the search a way to climb back down out of a poor local optimum in search of a better one elsewhere. It's especially suited to combinatorial optimisation problems — ones with discrete, categorical, or otherwise non-continuous variables — where gradient-based calculus methods can't be applied at all.

**The physical analogy the name comes from**
SA borrows its name and its core intuition from metallurgy. When a molten material is cooled, the way it's cooled determines the quality of the resulting crystal structure:
Cool it too fast ("quenching") and the atoms don't have time to settle into a low-energy arrangement — the material solidifies into a flawed, sub-optimal structure.
Cool it slowly, and the atoms have time to explore many configurations and settle into the lowest-energy (most stable) arrangement — the ground state.
The optimisation analogy maps "energy" onto the value of the objective function you're trying to minimise, and "temperature" onto a control parameter governing how freely the search is allowed to accept bad moves. High temperature early on ≈ liquid, atoms moving freely, exploring widely. Low temperature later ≈ solid, settling into place.
The technique originates from applying ideas out of statistical mechanics — specifically the Metropolis algorithm for simulating atoms in thermal equilibrium — to general combinatorial optimisation problems (Kirkpatrick, Gelatt & Vecchi, 1983).

**How it works**
At every step, SA proposes a random move to a neighbouring configuration and decides whether to accept it:
If the move improves the objective (lower energy, in the minimisation framing), it is always accepted.
If the move makes the objective worse, it is accepted anyway, but only with a certain probability. That probability depends on:
How much worse the move is (a small step backward is more likely to be accepted than a huge one), and
The current temperature (high temperature → higher chance of accepting a worse move; low temperature → very unlikely).
As the algorithm proceeds, the temperature is gradually lowered according to a cooling schedule. Early on, with temperature high, the search behaves almost like a random walk, exploring broadly and accepting many uphill (worsening) moves. As temperature falls, it increasingly behaves like ordinary hill-climbing, refining around whatever region it has landed in.
The theoretical guarantee — and its catch
If the temperature is lowered slowly enough, simulated annealing is guaranteed, in the limit, to reach the global optimum with probability approaching 1. In practice, "slowly enough" can mean an impractically long run, so real implementations trade off this guarantee against a workable running time — cooling faster than the theoretical ideal but still slow enough to usually find a very good (if not provably optimal) solution.

**Algorithm outline**
Choose a random starting configuration; pick an initial temperature and a cooling schedule.
Evaluate the objective value ("energy") of the current configuration.
Perturb the current configuration slightly to generate a neighbouring candidate.
Evaluate the neighbour's objective value.
If the neighbour is better, accept it as the new current configuration.
If the neighbour is worse, accept it anyway with probability that decreases as the size of the loss increases and as temperature decreases (in the classic formulation, this probability is exponential in −Δ/T, where Δ is how much worse the new configuration is and T is the current temperature).
Reduce the temperature according to the schedule.
Repeat from step 3 until a stopping condition (minimum temperature reached, or no improvement for a long stretch) is met.

**Parameters / design choices**
Setting up an SA run requires four ingredients:
A configuration representation — a compact way to describe a candidate solution (the "design vector").
A perturbation operator — a way to randomly generate a valid neighbouring configuration from the current one. This has to respect any constraints of the problem, or you'll waste time evaluating infeasible candidates.
An objective function — whatever quantity captures the trade-offs you actually care about; this stands in for "energy."
A cooling schedule — how the temperature decreases over time, and for how long the search dwells at each temperature before cooling further.
Cooling schedule choices in practice:
Exponential cooling — multiply the temperature by a fixed ratio (typically somewhere around 0.7–0.9) at each step. This tends to work best in practice among the simple schedules.
Linear or step-wise cooling — simpler to reason about but often less effective than exponential.

**Strengths**
Genuinely capable of escaping local optima — unlike hill-climbing, it has a built-in mechanism for doing so, rather than relying on luck of the starting point.
Requires no gradient or derivative information, so it works on discrete, combinatorial, non-convex, and non-differentiable objective landscapes.
Conceptually simple, with a small number of ingredients to design (representation, perturbation, objective, schedule).
Broadly applicable — has been used for classic combinatorial problems like the travelling salesman problem, and for real engineering problems like structural topology optimisation and telescope-array configuration design.

**Weaknesses**
No guarantee of finding the global optimum in any practical (finite) amount of time — the theoretical guarantee only holds for infinitely slow cooling.
Highly sensitive to the cooling schedule: cool too fast and you reproduce the "quenching" problem from the physical analogy — the search settles into a poor local optimum before it has had a chance to explore. Cool too slowly and the run becomes computationally expensive for a large search space.
A classic and easy-to-miss failure mode is premature termination — stopping the algorithm while the system's energy (objective value) is still high, before it has had time to settle into a good configuration. A telltale symptom: the best configuration found appears only shortly before the algorithm terminates, suggesting it was still improving when the run ended.
Tuning the schedule and the perturbation operator well often requires experimentation specific to the problem at hand; there's no universal "correct" schedule.

**When to use it over the alternatives**
SA is a good default whenever:
The search space is discrete/combinatorial (design configurations, routes, layouts, schedules) rather than continuous and smooth.
You suspect the objective landscape has many local optima and a simple hill-climb (even with restarts) is likely to get stuck in a mediocre one.
You don't need a population of candidate solutions evolving together (which is what population-based methods like [[Evolutionary Algorithms — Overview]] offer) — SA works with a single evolving candidate at a time, which is simpler to implement and tune than a full genetic algorithm.
Compared to genetic algorithms, SA is usually simpler to set up (fewer moving parts — no population, no crossover operator to design) but doesn't get the benefit of a population exploring multiple regions of the space simultaneously.

**Ethical / practical concerns**
Because SA's stopping point depends on a schedule chosen in advance, a run that's cut off too early can present a confidently "final" answer that's actually still mid-improvement — the same practical risk as hill-climbing's silent incompleteness, but compounded by the extra parameter (the schedule) that has to be tuned correctly. In any decision-relevant application, checking the convergence history (was the objective still improving right up to termination?) is a cheap sanity check before trusting the output.

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note the perturbation operator used, the cooling schedule and its parameters, and whether you observed premature termination)
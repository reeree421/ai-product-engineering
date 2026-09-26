---
tags:
module/ai-ii
part/optimisation
topic/evolutionary-algorithms
sources:
"Berkeley CS188 — 1.5 Local Search"
"MIT ESD.77 Lecture 11 — Genetic Algorithms I"
---

**What problem does it solve?**
Hill-climbing and simulated annealing (see [[Random Hill Climbing]] and [[Simulated Annealing]]) both search with a single candidate solution at a time. Evolutionary algorithms (EAs) — genetic algorithms being the best-known family member — instead maintain a whole population of candidate solutions simultaneously, and improve the population generation by generation by borrowing the mechanics of biological evolution: selection, reproduction, and mutation. This lets the search explore multiple regions of the solution space in parallel and combine promising partial solutions found in different individuals.
One way to frame it: genetic algorithms are essentially a beam search — where several candidate states are tracked at once — but with a genetics-inspired twist for how new candidates get generated.

**The biological inspiration**
The technique deliberately mirrors two ideas from 19th-century biology:
Natural selection (Darwin) — variation exists across a population, huge numbers of offspring are produced but only a fraction survive to reproduce, and survival is linked to fitness for the environment. Over generations, this concentrates advantageous traits in the population.
Inheritance of traits (Mendel) — traits are passed from parents to offspring via discrete hereditary units (genes), with some trait variants (alleles) dominant over others. This is where the vocabulary of "genes," "chromosomes," and "alleles" in GAs comes from.
The premise: if natural selection is a successful principle for optimising populations of organisms in nature, mimicking its mechanics computationally should let us optimise populations of candidate solutions to an engineering or search problem.

**Core terminology**
Term	

| Term       | Meaning in a GA                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Individual | One candidate solution                                                                               |
| Chromosome | The encoded string representing an individual (often binary, but see below)                          |
| Gene       | One position within the chromosome                                                                   |
| Allele     | The specific value at a gene (e.g. 0 or 1, for binary encoding)                                      |
| Population | The full set of individuals at a given generation                                                    |
| Generation | One "round" of the algorithm — a full pass of selection, crossover, mutation, insertion              |
| Fitness    | The score assigned to an individual by the objective/fitness function                                |
| Genotype   | The encoded (chromosome) form of a solution                                                          |
| Phenotype  | The decoded, real-world meaning of that chromosome (e.g. an actual radius, an actual tour of cities) |

**How it works — the generational loop**
Initialise a population of individuals, usually at random, aiming for both quality and diversity in the starting set. A commonly cited rule of thumb is to size the population at roughly four times the length of an individual's chromosome.
Evaluate fitness for every individual using the fitness function.
Select parents for reproduction, biased toward higher-fitness individuals (see [[Selection and Replacement Strategies]] for the mechanisms).
Recombine (crossover) selected parent pairs to produce offspring (see [[Search Operators — Recombination]]).
Mutate the offspring with some small, independent probability per gene (see [[Search Operators — Mutation]]).
Insert the offspring into the new population, replacing some or all of the previous generation (see [[Selection and Replacement Strategies]]).
Check stopping criteria — repeat from step 2 if not yet satisfied.
Across generations, the expectation is that average population fitness rises, since fitter individuals are preferentially bred and less-fit ones die out — though this isn't guaranteed at every single step, only as a broad trend.

**Encoding — genotype to phenotype**
A chromosome in isolation carries no meaning; it has to be decoded into a phenotype — an actual point in the problem's real decision space — before it can be evaluated. Encoding schemes include:
Binary — the classic default; each gene is a bit. Decoding a binary string into, say, a real-valued design variable divides the variable's range into 2^(number of bits) discrete steps, so the number of bits allocated directly controls resolution: more bits means finer precision but a larger space to search. Too few bits and you lose meaningful precision in the decoded value.
Ternary, quaternary, integer, real-valued, hexadecimal — alternative alphabets suited to different problem structures. Real-valued encoding, for instance, skips the binary decoding step entirely and works directly with the actual variable values.
Problem-specific representations — e.g. representing a set of facility locations as a binary string where each bit flags whether a facility exists at that site, or ordering-based encodings for routing problems like the travelling salesman problem.

**Fitness functions**
Choosing the fitness function is often the hardest design decision in the whole algorithm, for two reasons:
It has to actually capture what "good" means for the problem, including any trade-offs between competing objectives.
GAs have no built-in notion of constraints — an encoding can easily represent invalid or infeasible solutions unless you actively prevent it. Common ways to handle this:
Penalise infeasible individuals within the fitness score itself.
Reject constraint-violating individuals during selection.
Design the encoding so infeasible solutions simply can't be represented (e.g. only allow chromosome patterns that correspond to valid tours).
Repair infeasible individuals after they're generated, before evaluating them.
Minimisation problems can be converted to the maximisation framing GAs naturally use (e.g. via 1/objective or −objective), so the choice of maximise-vs-minimise is mostly a matter of convenience rather than a real limitation.

**What distinguishes GAs from classical optimisation methods**
They search a population of points in parallel, not a single point.
Transitions between generations are probabilistic, governed by selection and mutation probabilities, not deterministic update rules.
They operate on an encoding of the solution rather than the raw decision variables directly.
They require no derivative or gradient information — only fitness values drive the search. This is precisely why they extend naturally to combinatorial, discrete, or non-differentiable problems that gradient-based methods (see the modelling half of this module, e.g. backpropagation) cannot handle.

**Strengths**
Naturally suited to discrete, combinatorial, and non-differentiable problems.
The population gives built-in parallel exploration of the search space, unlike single-point methods.
Crossover allows good partial solutions discovered independently in different individuals to be combined into something better than either parent — this is the central mechanistic advantage over mutation-only search.
Flexible: encoding, fitness function, and operators can all be tailored to the structure of a specific problem.

**Weaknesses**
Fitness function and constraint-handling design require real problem-specific thought; a poorly designed fitness function can lead the search astray.
Encoding choices (e.g. number of bits) trade off resolution against search-space size, and getting this wrong hurts performance either way.
Premature convergence — if the population loses diversity too early (often from too small a mutation rate, or over-aggressive selection pressure), the whole population can collapse around a mediocre solution well before the global optimum is found.
More moving parts to tune than a single-point method like simulated annealing: population size, selection scheme, crossover method, mutation rate, replacement strategy, and stopping criteria all interact.

**When to use it over the alternatives**
Reach for a GA (over hill-climbing or plain SA) when:
The problem structure naturally decomposes into combinable partial solutions — crossover can exploit this in a way SA's single-candidate perturbation cannot.
You want the robustness of exploring several regions of the space at once, rather than betting everything on one evolving candidate.
You have — or can build — a sensible encoding and a way to handle infeasible solutions cleanly.
If the problem doesn't decompose nicely into recombinable pieces, the extra machinery of a full GA may not earn its keep over a simpler method like SA.

**Ethical / practical concerns**
Because GA behaviour depends on several interacting parameters (population size, mutation rate, selection scheme), it's easy to end up with a set-up that looks like it's "working" — average fitness is rising — while actually having converged prematurely to a mediocre solution. As with SA, checking the convergence history (does the population still have meaningful genetic diversity, or has it flatlined?) before trusting the final result is important, especially in any application where the "good enough" answer has real downstream consequences.

**Worked example from tutorial**
(fill in once you've done the corresponding tutorial exercise — note the encoding used, population size, and whether you observed premature convergence)
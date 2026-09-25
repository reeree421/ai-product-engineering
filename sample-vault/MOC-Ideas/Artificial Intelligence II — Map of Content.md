
module: Artificial Intelligence II
code: UFCF9S-15-2
level: 5
credits: 15
assessment: In-class test (45 min, 100%)
tags:
moc
module/ai-ii
---

> The module splits cleanly into two halves: **Optimisation** (searching for a good solution) and **Modelling** (learning a function from data). Almost every exam question maps back to that divide.
Learning outcomes
[ ] MO1 — Compare and contrast modern AI techniques with traditional approaches to complex problems
[ ] MO2 — Identify issues in applying modern AI, including ethical issues, and evaluate the challenges
[ ] MO3 — Select appropriate paradigms and solve problems with AI techniques
---
1. Framing
[[Optimisation vs Modelling]] — the core conceptual split of the module
[[AI Application Domains]] — recommenders, recognition, and friends
[[Societal Implications of AI]] — threads through every topic, not a standalone week
---
2. Optimisation
2.1 Search fundamentals
[[Search Spaces]]
[[Problem Types — NP, Non-stationary, Multi-objective]]
[[Fitness Landscapes]]
2.2 Local search
[[Random Hill Climbing]]
[[Simulated Annealing]]
[[Tabu Search]]
[[Local Optima and Escape Strategies]]
2.3 Population-based search — Evolutionary Algorithms
[[Evolutionary Algorithms — Overview]]
[[EA Representations — Linear, Tree, Graph]]
[[Search Operators — Recombination]]
[[Search Operators — Mutation]]
[[Search Operators — Inversion]]
[[Selection and Replacement Strategies]]
2.4 Swarm intelligence
[[Ant Colony Optimisation]]
[[Particle Swarm Optimisation]]
[[Swarms vs EAs — Comparison]]
2.5 Hybrids
[[Hybridising Local and Population-based Search]]
[[Memetic Algorithms]]
---
3. Modelling
3.1 The realities of data
[[Training and Testing Regimes]]
[[Stopping Criteria and Overfitting]]
[[Class Imbalance]]
[[Missing Variables]]
[[Bias in Datasets]]
[[Feature Engineering and Pre-processing]]
[[Formulating Questions from Data]]
3.2 Supervised learning
[[k-Nearest Neighbour]] — instance-based
[[Decision Trees — C4.5]]
[[Probabilistic Methods — Bayes]]
[[Fuzzy Methods]]
[[Multi-Layer Perceptron]]
[[Backpropagation]]
3.3 Deep networks
[[Autoencoders]]
[[Convolutional Neural Networks]]
3.4 Reinforcement learning
[[Tabular Q-Learning]]
[[Exploration vs Exploitation]]
3.5 Unsupervised learning
[[K-Means Clustering]]
[[Cluster Visualisation]]
---
4. Cross-cutting
[[Ethical Impact of AI Solutions]] — explicitly assessed under MO2
[[Evaluating Solution Usefulness]]
[[Choosing a Paradigm for a Given Problem]] — the MO3 decision framework
[[Tutorial Experiments Log]] — a third of the test covers tutorial work, so keep this current
---
Note template
Each topic note is worth keeping to a consistent shape:
```markdown
## What problem does it solve?

## How it works

## Parameters / design choices

## Strengths

## Weaknesses

## When to use it over the alternatives

## Ethical / practical concerns

## Worked example from tutorial
```
That last section matters more than it looks — the in-class test draws a third of its marks from the experimental work done in tutorials.
---
Links
Reading list
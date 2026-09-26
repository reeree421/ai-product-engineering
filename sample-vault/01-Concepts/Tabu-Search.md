## What problem does it solve?
Local search methods like hill climbing get stuck cycling between the same
few states once they hit a plateau or a local optimum, especially when
sideways moves are allowed. Tabu Search prevents this cycling.

## How it works
Tabu Search performs a local search like hill climbing, but maintains a
short-term memory (the "tabu list") of recently visited states or recently
applied moves. Even if a tabu move would improve the objective, it is
forbidden for a fixed number of iterations, forcing the search into
unexplored territory. An "aspiration criterion" can override the tabu
status if a forbidden move would produce a new best-ever solution.

## Parameters / design choices
- Tabu tenure: how many iterations a move stays forbidden.
- Tabu list size and what it stores (exact states vs. move attributes).
- Aspiration criteria (e.g., allow a tabu move if it beats the best
  solution found so far).

## Strengths
Escapes cycles and plateaus that trap plain hill climbing; often more
directed than random restarts since it actively steers away from
recently seen territory rather than starting over blindly.

## Weaknesses
Extra memory and bookkeeping overhead; tabu tenure is a sensitive
hyperparameter — too short doesn't prevent cycling, too long blocks
otherwise-good moves.

## When to use it over the alternatives
Preferable to plain hill climbing or random restarts when the landscape
has many plateaus or cycles, and a single well-tuned run is more
practical than many independent restarts.

## Ethical / practical concerns
As with other local search methods, no guarantee of finding the global
optimum; if used in decision-support systems, over-trusting a
tabu-search result without disclosing its heuristic, non-optimal nature
could mislead stakeholders.

## Worked example from tutorial
[Fill in with your tutorial's specific example, if any.]
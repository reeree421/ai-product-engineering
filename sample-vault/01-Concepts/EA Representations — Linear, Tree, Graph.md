## What problem does it solve?
Before an evolutionary algorithm can search, candidate solutions
(phenotypes) must be encoded into a genotype the algorithm can manipulate
with genetic operators. The choice of representation shapes which
operators are even valid and how well the search performs.

## How it works
- **Linear (string/array) representation:** the most common form — a
  fixed-length array of bits, integers, or real numbers. Simple to apply
  standard crossover/mutation.
- **Tree representation:** used in Genetic Programming, where individuals
  are executable expression trees (e.g. mathematical formulas or program
  fragments). Crossover swaps subtrees between parents.
- **Graph representation:** used when the solution is naturally a graph
  structure (e.g. neural network topologies, circuit designs). Requires
  specialized operators since arbitrary crossover can easily produce
  invalid graphs.

## Parameters / design choices
Choice of representation is itself a design decision made before any
operator is chosen; representation and operators must be co-designed
(e.g. tree crossover only makes sense with a tree representation).

## Strengths
Linear: simple, fast, well-studied operators.
Tree: naturally expressive for programs/formulas of variable size.
Graph: directly matches problems that are inherently graph-structured.

## Weaknesses
Linear: fixed length can be limiting for variable-complexity problems.
Tree: can suffer from "bloat" (trees growing unnecessarily large).
Graph: operator design is harder; risk of producing invalid structures.

## When to use it over the alternatives
Match representation to the natural structure of the problem: use linear
for fixed-size parameter optimization, tree for evolving programs/
expressions, graph for evolving structures like networks or topologies.

## Ethical / practical concerns
A poorly chosen representation can silently bias which solutions are
even reachable by the search, independent of the fitness function.

## Worked example from tutorial
[Fill in with your tutorial's specific example, if any.]
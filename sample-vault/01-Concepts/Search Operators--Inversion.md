## What problem does it solve?
For permutation-encoded problems (e.g. ordering-based tasks like a tour
or a schedule), swapping single genes via ordinary mutation can be
disruptive or ineffective. Inversion provides a more structured way to
introduce variation while partially preserving ordering relationships.

## How it works
Two points are chosen in the chromosome, and the segment between them is
reversed in place. This creates a new but related permutation, disrupting
some ordering relationships (edges) while others adjacent to the reversal
boundary are newly formed.

## Parameters / design choices
- Segment selection: random two-point choice is most common.
- Probability of applying inversion vs. other operators.

## Strengths
Well suited to permutation problems (e.g. ordering/sequencing tasks)
where absolute gene position matters less than relative order; can
introduce large structural changes without fully randomizing the
chromosome.

## Weaknesses
Less meaningful or effective on non-permutation (e.g. binary/real-valued)
encodings; the size of the reversed segment strongly affects how
disruptive the move is, and this is not always easy to tune.

## When to use it over the alternatives
Choose inversion over standard bit-flip mutation specifically for
permutation-based representations, often alongside recombination
operators designed for permutations (e.g. order crossover).

## Ethical / practical concerns
Same general EA caveats: results depend on representation choices that
are themselves value-laden (what counts as a "valid" solution ordering).

## Worked example from tutorial
[Fill in with your tutorial's specific example, if any.]
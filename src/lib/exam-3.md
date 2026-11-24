# Exam 3

## Terms

Q: Define PSPACE-hard and PSPACE-complete using polynomial-time mapping reductions.
A: B is PSPACE-hard if every A in PSPACE has a polynomial-time map f with x ∈ A iff f(x) ∈ B. It is PSPACE-complete if it is also in PSPACE.

Q: Define SPACE(f(n)), NSPACE(f(n)), PSPACE and NPSPACE.
A: SPACE(f(n)) means decidable deterministically in O(f(n)) cells on length-n inputs. NSPACE allows nondeterminism with that bound on every branch. PSPACE and NPSPACE allow any polynomial bound in the respective models.

Q: Define the running time of a nondeterministic decider. What determines whether it accepts an input?
A: Time is the maximum number of steps over all branches and all length-n inputs. On a given input, one accepting branch suffices. If every branch rejects, the machine rejects.

## Theorems

Q: State the Cook–Levin theorem.
A: SAT is NP-complete. It is in NP and every NP language reduces to SAT in polynomial time.

Q: Suppose A ≤ₚ B and B is in P. Prove that A is in P.
A: Compute the reduction f(w) and run B’s decider on it. The answer agrees with A on w. The reduction writes only polynomially many symbols, so both steps together take polynomial time.

Q: Let A be NP-hard. Suppose B is in NP and A ≤ₚ B. Prove that B is NP-complete.
A: For every L in NP, L ≤ₚ A ≤ₚ B. Composing the two polynomial-time reductions gives L ≤ₚ B. Thus B is NP-hard and, since B ∈ NP, NP-complete.

Q: Prove that P = NP if and only if some NP-complete language belongs to P.
A: If P = NP, SAT is NP-complete and in P. Conversely, every NP language reduces to any NP-complete language in P, giving a polynomial-time decider. Thus NP ⊆ P, and P ⊆ NP always.

Q: Prove that a language has a polynomial-time verifier if and only if a nondeterministic TM decides it in polynomial time.
A: Guess a polynomial-length certificate and run the verifier. Each branch takes polynomial time. Some branch accepts iff a certificate passes. Conversely, use one branch’s choices as the certificate. Fixed branching and polynomially many steps give polynomial length. Replay in polynomial time and accept iff that branch accepts.

Q: Let V be a polynomial-time verifier for L. Construct a polynomial-time nondeterministic TM that decides L.
A: Guess a certificate within the polynomial length bound and run V on the input and certificate. Some guess passes iff the input belongs to L. Guessing and checking take polynomial time per branch.

Q: Let N be a polynomial-time nondeterministic TM for L. Construct a polynomial-time verifier for L.
A: Use one branch’s choices as the certificate. Fixed branching and polynomially many steps give polynomial length. Replay in polynomial time, rejecting illegal choices. A certificate passes iff it describes an accepting branch, so one passes exactly on L.

Q: Prove that every PSPACE-hard language is NP-hard.
A: Polynomial time bounds space on every branch, so NP ⊆ NPSPACE = PSPACE by Savitch. Every NP language therefore reduces in polynomial time to any PSPACE-hard language, proving NP-hardness.

Q: Assume every NP-hard language is PSPACE-hard. Prove NP = PSPACE.
A: SAT is NP-hard, hence PSPACE-hard by hypothesis. For any PSPACE language, reduce its input to SAT and verify a satisfying assignment in polynomial time. This gives PSPACE ⊆ NP. Conversely, polynomial time bounds branch space, so NP ⊆ NPSPACE = PSPACE by Savitch.

Q: Assume P = NP. Prove that every language A in P with at least one yes string and one no string is NP-complete.
A: Fix y ∈ A and z ∉ A. Since P = NP, decide any NP language in polynomial time. Output y on yes and z on no. This reduces every NP language to A. Since A ∈ P ⊆ NP, A is NP-complete.

Q: Use Savitch’s theorem to prove NPSPACE = PSPACE.
A: For a polynomial space bound p(n) ≥ n, Savitch gives deterministic space O(p(n)²), still polynomial. Thus NPSPACE ⊆ PSPACE. A deterministic machine has one branch, giving PSPACE ⊆ NPSPACE.

Q: Justify P ⊆ NP ⊆ NPSPACE = PSPACE ⊆ EXPTIME. Can all these classes coincide?
A: A deterministic computation has one branch. Polynomial time bounds space on each branch. Savitch squares polynomial space, still polynomial. A deterministic polynomial-space decider halts without repeating any of its exponentially many configurations. Since P ≠ EXPTIME, at least one inclusion is strict.

Q: Prove PSPACE ⊆ EXPTIME by counting the configurations of a deterministic one-tape decider.
A: With q states, g tape symbols and s cells, there are at most q·s·g^s configurations (state, head, contents). A repeated configuration would loop. For polynomial s, a decider therefore halts within 2^poly(n) steps.

Q: Express acceptance of an f(n)-space nondeterministic machine as a bounded reachability question. Assume f(n) ≥ n.
A: There are at most T = 2^(O(f(n))) configurations. The machine accepts iff its start reaches some accepting configuration within T moves. A shortest accepting path has no repeats, since any loop can be removed.

Q: Let R(u,v,t) mean that configuration u can reach configuration v within t moves. Give and justify the base case for t = 1.
A: R(u,v,1) holds iff u = v or one legal move takes u to v. These are exactly the paths of length zero or one.

Q: Give the midpoint recurrence for reachability within t moves, where t > 1 is a power of two. Prove it is correct.
A: Try every configuration m. R(u,v,t) holds iff both R(u,m,t/2) and R(m,v,t/2) hold for the same m. A path within t moves splits into two halves within t/2 moves each. Conversely, two successful halves join at m. [[fig:exam3-midpoint]]

Q: Savitch’s algorithm starts with T = 2^O(f(n)) moves. Prove that its recursion uses O(f(n)²) space.
A: Each call stores its endpoints, midpoint and binary step bound in O(f(n)) cells. The two half-path tests run in sequence and reuse space. Halving T gives O(log T) = O(f(n)) levels, hence O(f(n)²) space.

Q: Explain why enumerating nondeterministic branch addresses, as in the deterministic time simulation, does not prove NPSPACE = PSPACE.
A: A branch address stores one choice per step. A polynomial-space branch can take exponentially many steps, so storing even one address can exceed polynomial space.

Q: A deterministic TM has a fixed number of tapes and runs for t(n) ≥ n steps. Prove that one tape suffices in O(t(n)²) time.
A: Separate tapes into blocks on one tape and mark each head. Sweep to read the marks, then update symbols and marks, shifting blocks as needed. Their O(n+t) = O(t) cells cost O(t) per move, hence O(t²) total. [[fig:exam2-multitape]]

Q: Show that a nondeterministic TM running in time t(n) ≥ n has a deterministic simulation running in time 2^(O(t(n))).
A: Explore branches by increasing length. Accept if any accepts, otherwise reject when all halt. Fixed branching and depth t give 2^(O(t)) nodes. Replaying each takes polynomial time in t, hence 2^(O(t)) total.

Q: Show that one writable tape and a read-only input tape plus one work tape define the same SPACE(f(n)) class for f(n) ≥ n.
A: Copy the input onto the work tape and simulate there. In reverse, one tape stores input and work symbols on separate tracks with both heads marked. Each simulation uses O(n + f(n)) = O(f(n)) cells.

Q: Prove that PSPACE is closed under union and complement.
A: For union, run both deciders on the input, reuse their workspace and accept if either accepts. For complement, flip the halting decider’s answer. Both use polynomial space.

Q: Prove that PSPACE is closed under Kleene star.
A: Accept ε. Otherwise enumerate all cuts into nonempty pieces. Accept if every piece in some partition passes the decider. The n−1 cut bits and one workspace reused across tests take polynomial space.

Q: Prove that P is closed under union, concatenation, and complement.
A: For union, run both deciders and accept if either accepts. For complement, flip the answer. For concatenation, try all n+1 cuts, including empty ends. Accept if both parts pass their respective deciders at one cut. Polynomially many polynomial-time checks suffice.

Q: Prove that NP is closed under union and concatenation.
A: For union, guess which machine to run. For concatenation, guess one of the n+1 cuts, allowing empty ends, and run each machine on its part. Accept if both accept. Some branch succeeds exactly on yes inputs, in polynomial time per branch.

## Examples

Q: Prove VERTEX-COVER is in NP using both a verifier and a nondeterministic Turing machine. Use exactly k vertices.
A: The verifier on (G,k,C) checks that C lists k distinct vertices of G and every edge touches C. The NTM on (G,k) picks or skips each vertex, then checks its picks the same way. Some branch accepts iff a k-cover exists. The list has at most one name per vertex. One choice per vertex and polynomial-time checks suffice on every branch.

Q: Prove that VERTEX-COVER with exactly k vertices is in NP using a verifier.
A: On (G,k,C), accept iff C lists k distinct vertices of G and every edge has an endpoint in C. Exactly the k-covers pass. At most one name per vertex suffices, and scanning the list and edges takes polynomial time.

Q: Prove that VERTEX-COVER with exactly k vertices is in NP using a nondeterministic Turing machine.
A: On (G,k), pick or skip each vertex. Accept iff exactly k are picked and every edge touches a pick. Some branch accepts iff a k-cover exists. One choice per vertex and a polynomial-time edge check bound every branch.

Q: Prove that DOMINATING-SET with exactly k vertices is in NP using a verifier.
A: Check that the list names exactly k distinct graph vertices and each unlisted vertex has a listed neighbor. Exactly the k-vertex dominating sets pass. The list length and time to check vertices and neighbors are polynomial.

Q: Prove that DOMINATING-SET with exactly k vertices is in NP using a nondeterministic Turing machine.
A: Pick or skip each vertex. Accept iff exactly k are picked and each unpicked vertex has a picked neighbor. Some branch accepts iff a k-vertex dominating set exists. Each branch scans the graph in polynomial time.

Q: Prove that CLIQUE is in NP using a polynomial-time verifier.
A: Check that the list names k distinct graph vertices and every pair shares an edge. Exactly the k-cliques pass. The list has at most one name per vertex, and checking all pairs takes polynomial time.

Q: Prove that SAT is in NP using a verifier. Does the same verifier work for 3SAT?
A: Use one bit per variable. Evaluate the formula and accept iff it is true under those values. Some assignment passes iff the formula is satisfiable. This takes polynomial time. For 3SAT, check each clause has a true literal.

Q: Prove that SAT is in NP using a nondeterministic Turing machine.
A: Guess one bit per variable, evaluate the formula, and accept iff true. Some branch accepts iff a satisfying assignment exists. Each branch guesses and evaluates in polynomial time.

Q: Prove that HAMPATH is in NP.
A: The certificate orders the graph’s vertices. Check that it starts at s, ends at t, visits every vertex exactly once, and follows directed edges. Exactly the Hamiltonian paths pass. The list length and checking time are polynomial.

Q: Assume VERTEX-COVER is NP-complete. Prove DOMINATING-SET is NP-complete. Both problems allow at most k picks.
A: Check in polynomial time that ≤k picks dominate. Drop isolates, keep k and every edge uv, and join a new tip to u and v. A cover hits every edge, dominating every tip and remaining vertex. Replace each picked tip by an endpoint to dominate its triangle. Each tip now touches a picked endpoint, so every edge is covered. One tip per edge takes polynomial time. Thus DOMINATING-SET is NP-complete.

Q: In the VERTEX-COVER reduction, a new vertex x touches only u and v, the ends of an original edge. Prove that a dominating set containing x can use u instead.
A: Replace x with u. Only x, u and v could lose domination. Picking u dominates all three because the original edge uv remains. The number of picks never increases. [[fig:exam3-triangle]]

Q: Adapt the triangle reduction from VERTEX-COVER to DOMINATING-SET when both problems require exactly k picks.
A: If k exceeds the original vertex count, return one vertex with budget 0 (no). Delete isolates. If ≤k vertices remain, they cover all edges and can be padded to k in the original graph. Return one vertex with budget 1 (yes). Otherwise apply the triangle construction with budget k. Both graphs can pad any smaller solution to k.

Q: Assume VERTEX-COVER is NP-complete. Prove that SET-COVER is NP-complete. Both problems allow at most k picks.
A: Verify in polynomial time that at most k input sets cover the universe. Use all edges as the universe and one set per vertex containing its incident edges. Keep k. The chosen sets cover every edge iff the corresponding vertices touch every edge. Each edge is listed twice, so the reduction is polynomial. Thus SET-COVER is NP-complete.

Q: Give a polynomial-time reduction from DOMINATING-SET to SET-COVER. Both problems allow at most k picks.
A: Use all vertices as the universe. For each vertex make a set containing it and its neighbors. Keep k. Up to k vertices dominate iff their sets cover every vertex. One set per vertex and two neighbor entries per edge take polynomial time.

Q: Give a polynomial-time reduction from SET-COVER to DOMINATING-SET. Both problems allow at most k picks.
A: Join all set vertices pairwise. Join each element vertex to its containing sets. Keep k. Map an empty universe to a fixed yes, an element in no set to a fixed no. Otherwise a cover dominates all vertices. Replace each picked element by a neighboring set, preserving domination. The remaining sets cover all elements. The graph takes polynomial time to build.

Q: Assume P = NP. Give a polynomial-time algorithm that returns a satisfying assignment for a Boolean formula or reports that none exists.
A: P = NP gives a polynomial-time SAT decider. If it rejects, report unsatisfiable. Try fixing each variable to true with earlier choices fixed. Keep true if SAT still says yes, otherwise keep false. Each choice keeps a satisfying completion. For m variables, at most m+1 calls on polynomial-size formulas give the assignment in polynomial time.

Q: Apply the SAT decision-to-search algorithm to (¬x) ∧ (x ∨ y), trying true first for each variable.
A: Trying x = true makes ¬x false. Set x = false. The remaining formula is y, so y = true succeeds. Return (false, true).

Q: Prove that directed PATH is in P.
A: Run breadth-first search from s along outgoing edges. Accept iff it reaches t. The search marks exactly the reachable vertices in O(|V|+|E|) time with adjacency lists, so PATH is in P.

Q: A SAT algorithm tests all assignments for a formula of length n with m variables. It stores the current m bits and reuses O(n) cells to evaluate each assignment. Bound its space.
A: Store m assignment bits and reuse O(n) evaluation cells for all assignments. Since m ≤ n, the total space is O(m+n) = O(n).

Q: Given a polynomial-time algorithm that finds a minimum vertex cover, show that VERTEX-COVER is in P. Why is finding a minimum vertex cover called NP-hard?
A: Find a minimum cover and accept iff its size is ≤k. One polynomial-time call and a comparison decide VERTEX-COVER. This NP-complete decision problem reduces to finding a minimum cover, so that optimization is NP-hard.

Q: A fixed number of heads share one tape. The highest-numbered head wins conflicting writes. Simulate t(n) ≥ n steps with one head.
A: Mark every head on one shared tape. Read all marked symbols, compute the move, apply the highest-numbered write at each collision, then move the marks. For fixed head count, a constant number of sweeps over O(n+t) = O(t) cells costs O(t) per step, hence O(t²) total.

Q: A write-twice TM may change each tape cell at most twice, including the input. Fill in X: every t(n)-time single-tape TM has an equivalent X-time write-twice TM.
A: X = O(t²). Keep the current symbol in control and two stacks in one log. Moving right pushes the written symbol left and pops right. Reverse for left. Each step uses two fresh cells. Save their original symbols together in one, the stack entry in the other. An empty right stack reads the next saved symbol. Write each record once and cross it out once when used. Each of t steps scans O(t) cells.

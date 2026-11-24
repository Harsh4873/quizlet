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

Q: Prove that every PSPACE-hard language is NP-hard.
A: Polynomial time bounds space on every branch, so NP ⊆ NPSPACE = PSPACE by Savitch. Every NP language therefore reduces in polynomial time to any PSPACE-hard language, proving NP-hardness.

Q: Assume every NP-hard language is PSPACE-hard. Prove NP = PSPACE.
A: SAT is NP-hard, hence PSPACE-hard by hypothesis. For any PSPACE language, reduce its input to SAT and verify a satisfying assignment in polynomial time. This gives PSPACE ⊆ NP. Conversely, polynomial time bounds branch space, so NP ⊆ NPSPACE = PSPACE by Savitch.

Q: Assume P = NP. Prove that every language A in P with at least one yes string and one no string is NP-complete.
A: Fix y ∈ A and z ∉ A. Since P = NP, decide any NP language in polynomial time. Output y on yes and z on no. This reduces every NP language to A. Since A ∈ P ⊆ NP, A is NP-complete.

Q: Prove P ⊆ NP ⊆ NPSPACE = PSPACE ⊆ EXPTIME. Can all these classes be equal?
A: **P ⊆ NP ⊆ NPSPACE.** A deterministic computation has one branch. A polynomial-time branch visits only polynomially many cells. **NPSPACE = PSPACE.** Savitch squares the space bound, still polynomial. A deterministic machine gives the reverse inclusion. **PSPACE ⊆ EXPTIME.** With q states, g symbols and s cells, there are at most q·s·g^s configurations. A deterministic decider halts before repeating one. Polynomial s gives exponential time. Since P ≠ EXPTIME, at least one inclusion is strict.

Q: How does Savitch’s algorithm test whether an f(n)-space machine accepts, for f(n) ≥ n?
A: **Bound.** Choose a power of two T = 2^(O(f(n))) bounding the number of configurations. Test whether the start reaches any accepting configuration within T moves. A shortest path has no repeats. **Base case.** R(u,v,1) holds iff u = v or one legal move takes u to v. **Recursive case.** For t > 1, try every midpoint m. Require both R(u,m,t/2) and R(m,v,t/2) for the same m. A path within t moves splits into two such halves. Conversely, the halves join at m. [[fig:exam3-midpoint]]

Q: Why does Savitch use O(f(n)²) space? Why can recording a whole branch use more?
A: **Savitch.** Each call stores two endpoints, a midpoint and a binary step bound in O(f(n)) cells. The halves run sequentially and reuse space. Halving the bound gives O(f(n)) levels, so total space is O(f(n)²). **Branch addresses.** An address stores one choice per step. A polynomial-space branch can run for exponentially many steps, so one address can already take exponential space.

Q: Simulate t(n) ≥ n steps using one tape. What changes for several tapes versus several heads on one tape?
A: **Storage.** For multiple tapes, separate them into blocks and mark each head. For multiple heads on one tape, store that tape once and give each head its own mark. **One move.** Read all marked symbols, compute the transition, write, then move the marks. Shift a block if it grows. On a shared tape, the highest-numbered writer wins each collision. **Time.** A fixed number of heads reaches O(n+t) = O(t) cells. A constant number of sweeps costs O(t) per move and O(t²) overall. [[fig:exam2-multitape]]

Q: Show that a nondeterministic TM running in time t(n) ≥ n has a deterministic simulation running in time 2^(O(t(n))).
A: Explore branches by increasing length. Accept if any accepts, otherwise reject when all halt. Fixed branching and depth t give 2^(O(t)) nodes. Replaying each takes polynomial time in t, hence 2^(O(t)) total.

Q: Show that one writable tape and a read-only input tape plus one work tape define the same SPACE(f(n)) class for f(n) ≥ n.
A: Copy the input onto the work tape and simulate there. In reverse, one tape stores input and work symbols on separate tracks with both heads marked. Each simulation uses O(n + f(n)) = O(f(n)) cells.

Q: Prove the assigned closure properties for P, NP and PSPACE.
A: **P · union, complement, concatenation.** Run both deciders and accept if either accepts for union. Flip the answer for complement. For concatenation try all n+1 cuts, including empty ends. Accept if both pieces pass at one cut. Polynomially many polynomial-time tests suffice. **NP · union and concatenation.** For union, guess which machine to run. For concatenation, guess a cut and run both machines on their respective pieces, accepting if both accept. Some branch succeeds exactly on yes inputs. Each branch takes polynomial time. **PSPACE · union, complement, star.** For union run the two deciders in sequence, reusing workspace. For complement flip the answer. For star accept ε, otherwise try every partition into nonempty pieces. Accept if all pieces in one partition pass. The n−1 cut bits and one reusable workspace take polynomial space.

## Examples

Q: Show that Vertex Cover, Dominating Set, CLIQUE, SAT or HAMPATH is in NP. What does the verifier check?
A: **Vertex Cover.** Given (G,k), check that the list names exactly k distinct graph vertices and every edge has a listed endpoint. **Dominating Set.** Check exactly k distinct graph vertices and a listed neighbor for every unlisted vertex. **CLIQUE.** Check k distinct graph vertices and an edge between every pair. **SAT / 3SAT.** Check one truth value per variable and evaluate the formula. For 3SAT, every clause must have a true literal. **HAMPATH.** Check that the list goes from s to t, visits every vertex exactly once and follows each directed edge in order. **Conclusion for any row.** The certificate has polynomial length, and these scans take polynomial time. A list passes exactly on yes instances. For the NTM version, guess the certificate and run that row’s checks. For vertex subsets, pick or skip each vertex once.

Q: Prove Dominating Set is NP-complete using Vertex Cover. How does the construction handle exactly k?
A: **At most k.** Membership is the Dominating Set check with ≤k picks. Delete isolated vertices, keep k and every original edge uv, and add a new tip touching just u and v. **Why it works.** A cover picks an endpoint per edge, dominating every tip and remaining vertex. Replace each picked tip by an endpoint: it dominates the entire triangle. Every tip now touches a chosen endpoint, so the picks cover all edges. One tip per edge takes polynomial time. Therefore Dominating Set is NP-complete. **Exactly k only.** If k exceeds the original vertex count, output one vertex with budget 0 (no). If at most k vertices survive deletion, they cover all edges and can be padded in the original graph: output one vertex with budget 1 (yes). Otherwise both graphs have room to pad to k. [[fig:exam3-triangle]]

Q: Assume VERTEX-COVER is NP-complete. Prove that SET-COVER is NP-complete. Both problems allow at most k picks.
A: Verify in polynomial time that at most k input sets cover the universe. Use all edges as the universe and one set per vertex containing its incident edges. Keep k. The chosen sets cover every edge iff the corresponding vertices touch every edge. Each edge is listed twice, so the reduction is polynomial. Thus SET-COVER is NP-complete.

Q: Give a polynomial-time reduction from DOMINATING-SET to SET-COVER. Both problems allow at most k picks.
A: Use all vertices as the universe. For each vertex make a set containing it and its neighbors. Keep k. Up to k vertices dominate iff their sets cover every vertex. One set per vertex and two neighbor entries per edge take polynomial time.

Q: Give a polynomial-time reduction from SET-COVER to DOMINATING-SET. Both problems allow at most k picks.
A: Join all set vertices pairwise. Join each element vertex to its containing sets. Keep k. Map an empty universe to a fixed yes, an element in no set to a fixed no. Otherwise a cover dominates all vertices. Replace each picked element by a neighboring set, preserving domination. The remaining sets cover all elements. The graph takes polynomial time to build.

Q: Assume P = NP. Give a polynomial-time algorithm that returns a satisfying assignment for a Boolean formula or reports that none exists.
A: P = NP gives a polynomial-time SAT decider. If it rejects, report unsatisfiable. Try fixing each variable to true with earlier choices fixed. Keep true if SAT still says yes, otherwise keep false. Each choice keeps a satisfying completion. For m variables, at most m+1 calls on polynomial-size formulas give the assignment in polynomial time.

Q: Prove that directed PATH is in P.
A: Run breadth-first search from s along outgoing edges. Accept iff it reaches t. The search marks exactly the reachable vertices in O(|V|+|E|) time with adjacency lists, so PATH is in P.

Q: A SAT algorithm tests all assignments for a formula of length n with m variables. It stores the current m bits and reuses O(n) cells to evaluate each assignment. Bound its space.
A: Store m assignment bits and reuse O(n) evaluation cells for all assignments. Since m ≤ n, the total space is O(m+n) = O(n).

Q: Given a polynomial-time algorithm that finds a minimum vertex cover, show that VERTEX-COVER is in P. Why is finding a minimum vertex cover called NP-hard?
A: Find a minimum cover and accept iff its size is ≤k. One polynomial-time call and a comparison decide VERTEX-COVER. This NP-complete decision problem reduces to finding a minimum cover, so that optimization is NP-hard.

Q: A write-twice TM may change each tape cell at most twice, including the input. Fill in X: every t(n)-time single-tape TM has an equivalent X-time write-twice TM.
A: X = O(t²). Keep the current symbol in control and two stacks in one log. Moving right pushes the written symbol left and pops right. Reverse for left. Each step uses two fresh cells. Save their original symbols together in one, the stack entry in the other. An empty right stack reads the next saved symbol. Write each record once and cross it out once when used. Each of t steps scans O(t) cells.

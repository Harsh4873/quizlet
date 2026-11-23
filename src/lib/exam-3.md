# Exam 3

## Terms

Q: Define PSPACE-hard and PSPACE-complete using polynomial-time mapping reductions.
A: A language B is PSPACE-hard if, for every language A in PSPACE, there is a polynomial-time function f such that x ∈ A exactly when f(x) ∈ B. If B is also decidable in polynomial space, then B is PSPACE-complete.

Q: Define SPACE(f(n)), NSPACE(f(n)), PSPACE and NPSPACE.
A: SPACE(f(n)) contains the languages decided by deterministic machines using O(f(n)) cells on inputs of length n. NSPACE(f(n)) allows nondeterministic machines with this space bound on every branch. PSPACE and NPSPACE allow any polynomial space bound in the respective models.

Q: Define the running time of a nondeterministic decider. What determines whether it accepts an input?
A: On inputs of length n, its running time is the largest number of steps taken by any branch on any such input. The decider accepts an input if at least one branch accepts. It rejects if every branch rejects. A polynomial-time bound must hold even for the longest rejecting branch.

## Theorems

Q: State the Cook–Levin theorem.
A: SAT is NP-complete. SAT is in NP, and for every language L in NP there is a polynomial-time mapping reduction from L to SAT.

Q: Suppose A ≤ₚ B and B is in P. Prove that A is in P.
A: Let f be the polynomial-time reduction. On input w, compute f(w) and run the polynomial-time decider for B on it. This gives the correct answer because w belongs to A exactly when f(w) belongs to B. The length of f(w) is bounded by its polynomial construction time, so both computations together take polynomial time in |w|.

Q: Let A be NP-hard. Suppose B is in NP and A ≤ₚ B. Prove that B is NP-complete.
A: Take any language L in NP. Since A is NP-hard, L reduces to A in polynomial time. Compose this map with the reduction from A to B. Both maps preserve yes and no, and the first writes only polynomially many symbols, so their composition is polynomial time. Every NP language therefore reduces to B. Together with B ∈ NP, this proves B is NP-complete.

Q: Prove that P = NP if and only if some NP-complete language belongs to P.
A: If P = NP, SAT belongs to P because SAT is in NP, and Cook–Levin gives that SAT is NP-complete. Conversely, suppose an NP-complete language B is in P. Every language in NP reduces to B in polynomial time. Composing its reduction with the decider for B gives a polynomial-time decider for that language. Thus NP ⊆ P. Since P ⊆ NP, the classes are equal.

Q: Prove that a language has a polynomial-time verifier if and only if a nondeterministic TM decides it in polynomial time.
A: Given a verifier, an NTM guesses a certificate up to its polynomial length bound and runs the verifier. Each branch takes polynomial time, and some branch accepts exactly when a certificate passes. Conversely, use the choices of one NTM branch as a certificate. Fixed branching and polynomial time give a polynomial-length list. Replaying it takes polynomial time, and it passes exactly if that branch accepts.

Q: Let V be a polynomial-time verifier for L. Construct a polynomial-time nondeterministic TM that decides L.
A: Let p bound certificate length. On input w, each branch guesses a certificate of length at most p(|w|) and runs V on w and that certificate. If w belongs to L, some guess passes. Otherwise every guess fails. Writing one guess and checking it take polynomial time on every branch.

Q: Let N be a polynomial-time nondeterministic TM for L. Construct a polynomial-time verifier for L.
A: The certificate lists the choices on one branch of N. Each step has a fixed bound on its choices, so a polynomial-time branch needs only polynomially many bits. The verifier follows the listed moves, rejects invalid or missing choices, and accepts if the branch accepts. Replaying one branch takes polynomial time. A passing list exists exactly for inputs in L.

Q: Prove that every PSPACE-hard language is NP-hard.
A: Let B be PSPACE-hard and let A be any language in NP. A polynomial-time branch visits only polynomially many tape cells, so A belongs to NPSPACE, which equals PSPACE by Savitch’s theorem. Thus A reduces to B in polynomial time. This holds for every A in NP, so B is NP-hard.

Q: Assume every NP-hard language is PSPACE-hard. Prove NP = PSPACE.
A: SAT is NP-hard, so by hypothesis every A in PSPACE reduces to SAT in polynomial time. On input w, a verifier computes the reduced formula and checks a proposed satisfying assignment. Some assignment passes iff w ∈ A, proving PSPACE ⊆ NP. In reverse, polynomial time bounds space on every branch, so NP ⊆ NPSPACE = PSPACE by Savitch.

Q: Assume P = NP. Prove that every language A in P with at least one yes string and one no string is NP-complete.
A: Fix y ∈ A and z ∉ A. For any B in NP, P = NP gives a polynomial-time decider for B. Map w to y if that decider accepts, and to z otherwise. This polynomial-time map outputs a string in A iff w ∈ B, so A is NP-hard. Since A ∈ P ⊆ NP, A is NP-complete.

Q: Use Savitch’s theorem to prove NPSPACE = PSPACE.
A: Let a nondeterministic decider use polynomial space p(n), increasing the bound to at least n if necessary. Savitch gives NSPACE(p(n)) ⊆ SPACE(p(n)²). Since p(n)² is polynomial, NPSPACE ⊆ PSPACE. Every deterministic decider is also a nondeterministic machine with a single branch, so PSPACE ⊆ NPSPACE.

Q: Justify P ⊆ NP ⊆ NPSPACE = PSPACE ⊆ EXPTIME. Can all these classes coincide?
A: A deterministic computation has one branch. Each polynomial-time branch visits only polynomially many cells. Savitch converts polynomial nondeterministic space to polynomial deterministic space, and the reverse inclusion is immediate. A halting deterministic polynomial-space machine cannot repeat one of its exponentially many configurations. Since P ≠ EXPTIME, some inclusion is strict.

Q: Prove PSPACE ⊆ EXPTIME by counting the configurations of a deterministic one-tape decider.
A: With q states, g tape symbols and s cells, a configuration has q choices of state, s head positions and g^s possible tape contents. That gives at most q × s × g^s configurations. A deterministic decider must halt before repeating one, since a repeat would loop forever. For polynomial s, the running time is at most 2 raised to a polynomial in n.

Q: Express acceptance of an f(n)-space nondeterministic machine as a bounded reachability question. Assume f(n) ≥ n.
A: Arrange that acceptance clears the work tape and returns the head to the start, giving one accepting configuration. Let T be a power of two bounding the 2^(O(f(n))) possible configurations. The machine accepts iff its start configuration reaches the accepting one within T moves. A shortest accepting path cannot repeat a configuration, since the loop could be removed.

Q: Let R(u,v,t) mean that configuration u can reach configuration v within t moves. Give and justify the base case for t = 1.
A: R(u,v,1) is true if u = v or one legal transition sends u to v. Equality gives a path of length zero, and a legal transition gives a path of length one. These exhaust the paths allowed by the bound.

Q: Give the midpoint recurrence for reachability within t moves, where t > 1 is a power of two. Prove it is correct.
A: Let R(u,v,t) mean u reaches v within t moves. Try each configuration m. Accept if both R(u,m,t/2) and R(m,v,t/2) hold for the same m. A path of length at most t can be split at its middle so each half uses at most t/2 moves. Conversely, two successful halves join at m to make a path of length at most t. [[fig:exam3-midpoint]]

Q: Savitch’s algorithm starts with T = 2^O(f(n)) moves. Prove that its recursion uses O(f(n)²) space.
A: Each active call stores its endpoints, one candidate midpoint and the move bound in binary, using O(f(n)) cells. It checks the halves in sequence and reuses the first half’s space for the second. Halving the bound gives O(log T) = O(f(n)) active levels, so total space is O(f(n)²).

Q: Explain why enumerating nondeterministic branch addresses, as in the deterministic time simulation, does not prove NPSPACE = PSPACE.
A: The simulator records one choice for each step of the branch it will replay. A polynomial-space machine can run for exponentially many steps on a branch. Even one branch address can therefore require exponentially many cells, so this simulation does not give a polynomial-space bound.

Q: A deterministic TM has a fixed number of tapes and runs for t(n) ≥ n steps. Prove that one tape suffices in O(t(n)²) time.
A: Store the tapes in blocks separated by delimiters and mark each head. For each move, scan to read all marked symbols, compute the transition, then update the symbols and head marks, shifting blocks if needed. In t moves the encoding uses O(n+t) = O(t) cells. A constant number of sweeps per move costs O(t), so all t moves cost O(t²). [[fig:exam2-multitape]]

Q: Show that a nondeterministic TM running in time t(n) ≥ n has a deterministic simulation running in time 2^(O(t(n))).
A: Explore the tree level by level, replaying the choices leading to each node. Accept if any branch accepts and reject when the tree is exhausted. With branching bounded by a constant b ≥ 2 and depth t, at most 1 + b + ⋯ + bᵗ nodes occur. This is 2^(O(t)). Each replay takes polynomial time in t, so the total is still 2^(O(t)).

Q: Show that one writable tape and a read-only input tape plus one work tape define the same SPACE(f(n)) class for f(n) ≥ n.
A: With two tapes, copy the input to the work tape and simulate the one-tape machine there. In reverse, one tape stores the input and work symbols on separate tracks and marks both head positions. Scans update both tracks for each simulated move. Each simulation uses O(n + f(n)) = O(f(n)) cells.

Q: Prove that PSPACE is closed under union and complement.
A: For A and B in PSPACE, run their deciders on the original input in sequence, reusing workspace. Accept if either accepts. This decides A ∪ B in polynomial space. To decide the complement of A, run its decider and reverse its answer. This always halts and uses the same space.

Q: Prove that PSPACE is closed under Kleene star.
A: Let L be in PSPACE. Accept the empty string. Otherwise enumerate all ways to split the input into nonempty pieces. Accept iff every piece belongs to L for some split, exactly the condition for membership in L∗. A length-n input needs n − 1 bits to record one cut pattern, and the L decider’s polynomial workspace is reused for every piece.

## Examples

Q: Prove VERTEX-COVER is in NP using both a verifier and a nondeterministic Turing machine. Use exactly k vertices.
A: Given a graph G, a number k and a proposed list C, my verifier checks that C names k distinct vertices of G and every edge has an endpoint in C. My nondeterministic machine guesses the picks and performs the same two checks on each branch. A list passes, or a branch accepts, exactly when a cover of size k exists. The list length and the time on each branch are polynomial.

Q: Prove that VERTEX-COVER with exactly k vertices is in NP using a verifier.
A: Given a graph G, a number k and a list C, the verifier checks that C lists exactly k distinct vertices of G and every edge has an endpoint in C. A list passes exactly when its vertices form a cover of size k. The list has at most one name per vertex, and both checks take polynomial time.

Q: Prove that VERTEX-COVER with exactly k vertices is in NP using a nondeterministic Turing machine.
A: On input (G,k), each branch picks or skips each vertex of G. It accepts if it picks exactly k vertices and every edge touches a picked vertex. A cover gives an accepting branch. If no cover of size k exists, every branch rejects. Each branch makes one choice per vertex and checks the edges in polynomial time.

Q: Prove that DOMINATING-SET with exactly k vertices is in NP using a verifier.
A: Given a graph G, a number k and a list S, the verifier checks that S lists exactly k distinct vertices of G and every vertex outside S has a neighbor in S. A list passes exactly when it is a dominating set of size k. The list has polynomial length and checking the neighbors takes polynomial time.

Q: Prove that DOMINATING-SET with exactly k vertices is in NP using a nondeterministic Turing machine.
A: On input (G,k), each branch picks or skips each vertex of the graph G. It accepts if it picks exactly k vertices and every unpicked vertex has a picked neighbor. Some branch accepts exactly when a dominating set of size k exists. Each branch makes one choice per vertex and checks neighbors in polynomial time.

Q: Prove that CLIQUE is in NP using a polynomial-time verifier.
A: Given a graph G and integer k, reject if k exceeds the number of vertices. The certificate lists k vertices of G. Check that they are distinct, belong to G, and that each pair shares an edge. At most k(k−1)/2 pairs are checked, so verification takes polynomial time. A list passes exactly when its vertices form a k-clique.

Q: Prove that SAT is in NP using a verifier. Does the same verifier work for 3SAT?
A: The certificate gives one truth value per variable. Evaluate the formula with these values and accept exactly if it is true. A passing assignment exists exactly when the formula is satisfiable. The certificate has polynomial length and evaluation takes polynomial time. The same verifier works for 3SAT by checking that every clause has a true literal.

Q: Prove that SAT is in NP using a nondeterministic Turing machine.
A: On input a formula, each branch guesses one bit per variable, evaluates the formula on its assignment, and accepts if the result is true. A satisfying assignment gives an accepting branch. An unsatisfiable formula makes every branch reject. Guessing and evaluation take polynomial time on every branch, so SAT is in NP.

Q: Prove that HAMPATH is in NP.
A: Given G and endpoints s and t, the certificate lists the vertices in order. Check that it starts at s, ends at t, lists every vertex of G exactly once, and follows a directed edge at each step. Exactly the Hamiltonian paths pass, and the list and checks are polynomial in the input length.

Q: Assume VERTEX-COVER is NP-complete. Prove DOMINATING-SET is NP-complete. Both problems allow at most k picks.
A: Check at most k distinct vertices and a picked neighbor for each unpicked vertex in polynomial time. From VERTEX-COVER, delete isolated vertices, keep k and each edge, and add a tip joined to its ends. A cover dominates every tip and remaining vertex. Conversely, replace each picked tip by an endpoint. Each tip now touches a pick, so the picks cover all edges. One tip per edge gives a polynomial reduction.

Q: In the VERTEX-COVER reduction, a new vertex x touches only u and v, the ends of an original edge. Prove that a dominating set containing x can use u instead.
A: Let S be the dominating set. Replace x by u. The only vertices that x could dominate were x, u and v. Now u is picked and touches both x and v because the original edge uv remains. The new set dominates every vertex and has at most as many picks as S. [[fig:exam3-triangle]]

Q: Adapt the triangle reduction from VERTEX-COVER to DOMINATING-SET when both problems require exactly k picks.
A: If k exceeds the original vertex count, return one vertex with budget 0 (no). Otherwise remove isolated vertices. If at most k vertices remain, they cover all edges and can be padded to k in the original graph, so return one vertex with budget 1 (yes). Otherwise keep k and add a tip joined to both ends of each edge. Both graphs have room to pad any smaller solution to k.

Q: Assume VERTEX-COVER is NP-complete. Prove that SET-COVER is NP-complete. Both problems allow at most k picks.
A: A verifier checks in polynomial time that at most k input sets cover the universe. From VERTEX-COVER, use the edges as the universe. Each vertex gives one set of its incident edges. Keep k. A vertex cover gives sets containing every edge. Conversely, any covering sets name vertices touching every edge. Each edge is listed twice, so the reduction takes polynomial time.

Q: Give a polynomial-time reduction from DOMINATING-SET to SET-COVER. Both problems allow at most k picks.
A: Use the graph’s vertices as the universe. For each vertex make a set containing itself and its neighbors. Keep k. Dominating vertices give sets covering the universe. Conversely, a cover by these sets gives vertices that dominate every vertex in their union, which is the whole graph. Listing each vertex and both ends of each edge takes polynomial time.

Q: Give a polynomial-time reduction from SET-COVER to DOMINATING-SET. Both problems allow at most k picks.
A: Join every pair of set vertices. Join each element vertex only to sets containing it. Keep k. For an empty universe return a fixed yes instance, and for an element in no set return a fixed no. Otherwise a cover dominates all vertices. Replacing any picked element by a neighboring set preserves domination. The remaining sets cover all elements. Building the graph takes polynomial time.

Q: Assume P = NP. Give a polynomial-time algorithm that returns a satisfying assignment for a Boolean formula or reports that none exists.
A: Since SAT is in NP and P = NP, SAT has a polynomial-time decider D. If D rejects the formula, report unsatisfiable. Otherwise fix one variable at a time. Try true with all earlier choices fixed. If D accepts, keep true. Otherwise set it false. Each choice preserves a satisfying completion, so the final assignment works. For m variables, at most m+1 tests on polynomial-size formulas take polynomial time.

Q: Apply the SAT decision-to-search algorithm to (¬x) ∧ (x ∨ y), trying true first for each variable.
A: The formula is satisfiable. Trying x = true makes ¬x false, so that test fails. Fix x = false. The remaining formula is y, whose test passes with y = true. Thus the algorithm returns x = false and y = true.

Q: Prove that directed PATH is in P.
A: Given a directed graph G and vertices s and t, mark s. Scan the edges repeatedly, marking v whenever an edge leads from a marked vertex to v. When a scan adds no mark, accept iff t is marked. Marks follow paths from s, and after i scans all vertices within i edges are marked. Each productive scan adds a vertex, so at most as many scans as vertices suffice. The algorithm is polynomial time.

Q: A SAT algorithm tests all assignments for a formula of length n with m variables. It stores the current m bits and reuses O(n) cells to evaluate each assignment. Bound its space.
A: Only the current assignment and evaluation workspace are stored at once. Incrementing the m-bit assignment reuses the same cells, so the algorithm uses O(m + n) = O(n) space because m ≤ n. Trying all 2^m assignments increases time while leaving this space bound unchanged.

Q: Given a polynomial-time algorithm that finds a minimum vertex cover, show that VERTEX-COVER is in P. Why is finding a minimum vertex cover called NP-hard?
A: On a graph G and number k, find a minimum cover C and accept exactly when C has at most k vertices. A cover of size at most k exists exactly then, and one polynomial-time call plus a comparison take polynomial time. VERTEX-COVER is NP-complete, so a polynomial-time optimizer would give P = NP. That is why the optimization version is called NP-hard.

Q: A fixed number of heads share one tape. The highest-numbered head wins conflicting writes. Simulate t(n) ≥ n steps with one head.
A: Store the shared tape and mark each head's position. Scan to read all marked symbols before writing. Compute the move, apply the highest-numbered writer's symbol at each shared cell, then move all marks using temporary marks. This reproduces the simultaneous step. A fixed number of sweeps over O(n+t) = O(t) cells costs O(t) per step, hence O(t²) total.

Q: A write-twice TM may change each tape cell at most twice, including the input. Fill in X: every t(n)-time single-tape TM has an equivalent X-time write-twice TM.
A: X = O(t²). Keep the current symbol in the control and the cells left and right of the head as two piles, nearest on top, stored in one list after the input. A push writes a fresh cell. A pop crosses out that pile’s newest live entry, so no cell changes more than twice. An empty right pile takes the next unread input cell. The list has O(t) cells, so each step scans O(t) cells and t steps take O(t²).

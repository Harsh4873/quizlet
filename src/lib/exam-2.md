# Exam 2

## Rules

Q: A recognizer loops on 000. Does that prove its language is undecidable?
A: No. That particular machine is not a decider. The language is decidable if ANY correct machine always halts on it. A recognizer accepts members and may reject or loop on nonmembers; a decider must answer every input correctly and halt.

Q: What must I show for each language-classification answer?
A: Decidable: give an algorithm and explain why it always halts. Recognizable but undecidable: give a recognizer AND an undecidability proof. Not recognizable: use an appropriate impossibility proof, often a reduction from a known unrecognizable language. Rice alone proves only undecidability.

Q: To prove target B undecidable, which way does the reduction go?
A: Known undecidable A → target B: A ≤m B. Build a total computable function f with w ∈ A iff f(w) ∈ B. If B had a decider, computing f(w) and running that decider would decide A, a contradiction. Use a starting problem permitted by the question.

Q: A reduction outputs a new machine T. Must it wait for the simulated machine to finish?
A: No. The reduction writes T's finite description and halts. The potentially endless simulation runs later, inside T. Check BOTH cases: the original machine accepts, or it does not accept (rejects OR loops). A mapping reduction needs a membership iff, not merely one implication.

## Theorems

Q: Prove every multitape TM has an equivalent single-tape TM. [Lectures 14–15]
A: Let M have k tapes. Store them in # separated sections; mark each head. Initialize input in section 1 and blanks elsewhere. Scan marked symbols, remember them in the finite state, then update symbols, marks and simulated state using M's rule. Shift contents to add blanks as needed. Repeat; accept/reject when M does. Same accepted language. [[fig:exam2-multitape]]

Q: Why can a single-tape simulator remember k read symbols but not arbitrary head positions in its state?
A: k is fixed and the tape alphabet is finite, so the tuples of read symbols form a finite set. Head positions can grow without bound, so one state for every position would require infinitely many states. Record positions with marks ON THE TAPE instead.

Q: Prove every nondeterministic TM has an equivalent deterministic TM. [Lecture 16]
A: Deterministically explore the computation tree breadth-first. Use three tapes: unchanged input; current simulated branch; branch-choice address. Restart from the input for each address; simulate only its finite choices. Accept if a branch accepts. Every accepting finite path is eventually reached; no infinite path blocks the search. Multitape equivalence gives one tape. [[fig:exam2-ntm]]

Q: In the NTM simulation, how does the address tape advance?
A: Let b be the maximum number of choices per step. Enumerate addresses by length, then lexicographically. For b = 2: ε, 1, 2, 11, 12, 21, 22, 111, ... . Address 21 means take choice 2, then choice 1. Reset the simulation each time; skip a missing choice or ended branch. Never run one address forever.

Q: Prove decidable languages are closed under complement. [Lecture 18]
A: Let D decide L. Build a machine that runs D on its input and swaps accept and reject. D always halts, so the new machine always halts and decides the complement of L. Swapping a recognizer's answers is insufficient: looping inputs still loop.

Q: Prove L is decidable iff L and its complement are recognizable. [Lecture 18]
A: Forward: a decider and its accept/reject-swapped version recognize both sides. Reverse: alternate one step of an L-recognizer and one of a complement-recognizer on the input. If the first accepts, accept; if the second accepts, reject. Every input belongs to exactly one side, so one recognizer eventually accepts and the procedure halts.

Q: Prove the set of Turing machines is countable. [Lecture 20]
A: Every TM has a finite description over a fixed finite alphabet. List all finite strings by length, then lexicographically, retaining valid TM descriptions. Every TM appears in this list, so there are countably many. The reason is finite ENCODINGS, not that each machine has a finite tape.

Q: Prove the set of all languages over {0,1} is uncountable. [Lecture 20]
A: List strings s₁, s₂, ... . Suppose all languages are L₁, L₂, ... . Let row i record membership in Lᵢ. Define D = {sᵢ : sᵢ ∉ Lᵢ}; this flips the diagonal bit. D differs from every Lᵢ on sᵢ, so D is missing from the supposed complete list. Contradiction. [[fig:exam2-counting]]

Q: Why must some languages be unrecognizable? [Past Exam 2]
A: TMs are countable because they have finite encodings. Each TM recognizes exactly one language, so recognizable languages are at most countable. All languages over {0,1} are uncountable. Therefore some languages have no recognizer. This proves existence, not a particular example.

Q: If A ≤m B and B is decidable, prove A is decidable. What is the contrapositive?
A: On input w, compute f(w), run B's decider, and return its answer. f is total and the decider halts, so this decides A. Contrapositive: if A is undecidable and A ≤m B, then B is undecidable. These are lecture 24's first two facts.

Q: If A ≤m B and A is not recognizable, prove B is not recognizable. [Past Exam 3]
A: Suppose B had a recognizer R. On w, compute f(w) and simulate R on f(w). The membership iff makes this a recognizer for A, a contradiction. Thus B is not recognizable. The same construction proves: B recognizable and A ≤m B imply A recognizable. These are lecture 24's last two facts.

Q: Prove A ≤m B iff complement(A) ≤m complement(B). [Lecture 24]
A: Use the SAME total computable function f. The statement w ∈ A iff f(w) ∈ B is equivalent to w ∉ A iff f(w) ∉ B. That is exactly membership in both complements. Apply the same argument again for the reverse direction. Complement BOTH sides, not just one.

Q: State Rice's theorem and the two checks needed to apply it. [Lectures 22–23]
A: Every nontrivial property determined solely by a TM's recognized language is undecidable. Semantic: machines with the same language agree on the property. Nontrivial: give one recognizable language with it and one without it. The direct input is one encoded TM. A machine's state count, runtime or writing actions need not be language properties.

Q: Rice proof, setup: what do we do if the empty language has property P?
A: Prove the result for the opposite property instead. The opposite is also semantic and nontrivial; deciding it would decide P by swapping answers. Thus assume the empty language does NOT have P. By nontriviality choose a recognizer N whose language DOES have P. Now reduce A_TM to the property problem.

Q: Rice proof, construction: what machine do we build from ⟨M,w⟩? [Lecture 22]
A: Build T: on x, simulate M on w; if M accepts, simulate N on x and follow its answer. If M rejects, reject; if it loops, loop. Acceptance gives L(T)=L(N), which has P; nonacceptance gives L(T)=∅, which lacks P. A decider for P would decide A_TM, impossible. Constructing T's description always halts.

Q: CFL pumping proof: why must a variable repeat? [Lecture 11]
A: Let m be the number of grammar variables, b ≥ 2 bound every rule length, and p=b^(m+1). A height-h tree yields at most b^h symbols. For |s|≥p, choose a parse tree with fewest nodes; a longest path has at least m+1 variables. Among its lowest m+1 variables, some variable R repeats. [[fig:exam2-cfl-tree]]

Q: CFL pumping proof: how does the repeated variable give uv^i x y^i z?
A: The upper R generates vxy; the lower R generates x. Outside the upper subtree lie u and z. The steps between the repeated R's give R ⇒⋯⇒ vRy. Repeat these steps i times, then generate x: uv^i x y^i z stays in the language for every i≥0. Removing them gives uxz (i=0). [[fig:exam2-cfl-tree]]

Q: CFL pumping proof: why |vy|>0 and |vxy|≤p?
A: If v and y were both empty, removing the repeated section would yield the same s with fewer nodes, contradicting our choice. Thus |vy|>0. Choosing the repeated variable among the lowest m+1 variables on a longest path makes the upper subtree height ≤m+1. Its yield vxy has length ≤b^(m+1)=p.

## Examples

Q: Lecture 15's two-tape rule reads (0,1), writes (x,1), and moves (L,R). Apply it.
A: Use the pictured starting positions. Tape 1's marked 0 becomes x and its mark moves left onto 1. Tape 2 keeps its 1 and moves its mark right onto 0. The single physical head makes these updates by visiting both stored sections. Each mark records a simulated head, not another physical head. [[fig:exam2-multitape-step]]

Q: One NTM branch rejects, one loops, and one accepts. Does the NTM accept?
A: Yes. At least ONE accepting branch is enough. A simulator that follows one branch to completion may get stuck on the looping branch. Breadth-first search visits finite levels, so it eventually reaches the accepting branch. Do not require every branch to accept. [[fig:exam2-ntm]]

Q: Show A_DFA = {⟨D,w⟩ : DFA D accepts w} is decidable. [Lecture 18]
A: Reject malformed encodings. Simulate D on w, one symbol at a time. When the input ends, accept iff the final state is accepting; otherwise reject. The input is finite and each DFA step finishes, so the algorithm always halts.

Q: Show E_DFA = {⟨D⟩ : L(D)=∅} is decidable. [Past Exam 2; lecture 19]
A: Mark D's start state. Repeatedly mark every state reachable by one transition from a marked state, until no new marks appear. Accept iff no accepting state is marked; otherwise reject. There are finitely many states, so marking terminates. Empty language means NO reachable accepting state.

Q: Give recognizers for A_TM and HALT_TM. [Lectures 19–21; past Exam 2]
A: On ⟨M,w⟩, simulate M on w. For A_TM, accept only if M accepts; if M rejects, reject. For HALT_TM, accept whenever M halts, whether it accepts OR rejects. If M loops, either recognizer loops. A_TM asks about acceptance; HALT_TM asks about stopping.

Q: Prove A_TM is undecidable directly. [Lecture 19]
A: Assume H decides whether M accepts w. Build D on ⟨M⟩: run H on ⟨M,⟨M⟩⟩ and swap accept/reject. D halts since H does. On ⟨D⟩, D accepts iff H predicts D rejects, and rejects iff H predicts D accepts. Either answer is wrong. Hence H cannot exist.

Q: Prove HALT_TM is undecidable directly. [Posted halting handout; past Exam 2]
A: Assume H decides halting. Build S on ⟨M⟩: ask H whether M halts on ⟨M⟩. If YES, loop; if NO, accept (halt). Ask what S does on ⟨S⟩. A YES prediction makes S loop; a NO prediction makes S halt. Contradiction. The flip is HALT/LOOP, not accept/reject. [[fig:exam2-halting]]

Q: Why is the halting contradiction a diagonalization argument?
A: Rows are machines Mᵢ; columns are inputs ⟨Mⱼ⟩. Diagonal entry i asks whether Mᵢ halts on its OWN encoding. S flips every diagonal outcome. But S is one of the listed machines; at S's own entry it would have to halt iff it does not halt. The hypothetical halting decider makes the flip executable. [[fig:exam2-halting]]

Q: Prove HALT_TM undecidable using an assumed halting decider. [Lecture 21]
A: Suppose R decides HALT_TM. To decide A_TM on ⟨M,w⟩, run R. If it says M never halts, reject. If it says M halts, simulate M on w and return its accept/reject result; this simulation now must finish. This decides A_TM, a contradiction. This is a decider-style reduction, not a claimed identity mapping.

Q: Prove E_TM = {⟨M⟩ : L(M)=∅} undecidable by reduction. [Lecture 21]
A: From ⟨M,w⟩ build T: on x≠w reject; on x=w simulate M on w and follow its result. If M accepts w, L(T)={w}; otherwise L(T)=∅. Thus A_TM ≤m complement(E_TM). A decider for E_TM could be flipped to decide its complement and then A_TM. Do not forget the answer flip.

Q: Prove EQ_TM = {⟨M,N⟩ : L(M)=L(N)} undecidable. [Past Exam 3]
A: Reduce E_TM to EQ_TM. Given ⟨M⟩, output ⟨M,R⟩ where R rejects every input. L(R)=∅, so L(M)=∅ iff L(M)=L(R). An EQ_TM decider would decide E_TM. This is a pair of machines, so do not simply write “Rice.” Assume E_TM only if the question permits it.

Q: Classify {⟨M⟩ : M does not halt on any input}. [Past Exam 3]
A: Undecidable. Given ⟨M,w⟩, build T that ignores its own input and simulates M on w, then halts if M halts. T never halts on any input iff M never halts on w. Thus complement(HALT_TM) ≤m this language. Its source is undecidable too: a decider for the complement would decide HALT_TM by flipping.

Q: Use Rice to prove E_TM undecidable. [Lecture 23]
A: Property: L(M)=∅. Semantic: equal languages agree on whether they are empty. Nontrivial: a reject-all machine has empty language; an accept-all machine does not. Therefore Rice's theorem makes E_TM undecidable. An always-looping machine also has empty language.

Q: Classify {⟨M⟩ : M accepts 001}. [Past Exam 3]
A: Undecidable by Rice. Whether the fixed string 001 belongs to L(M) depends only on that language. Nontrivial: an accept-all machine accepts 001; a reject-all machine does not. This asks whether it EVER accepts, not whether it accepts within a fixed number of steps.

Q: Classify {⟨M⟩ : L(M) is infinite}. [Past Exam 3; lecture 22]
A: Undecidable by Rice. Semantic: equal languages have the same size. Nontrivial: an accept-all machine has infinite language; a reject-all machine has empty, hence finite, language. Therefore no decider can always answer this property correctly.

Q: Classify {⟨M⟩ : M has at most 10 states}. [Past Exam 3]
A: Decidable: inspect the finite machine description, count its states, and accept iff the count is at most 10. This always halts. Rice does not apply: state count is about the machine's description, not solely its recognized language.

Q: Can Rice prove “M writes a 0 during execution on some input” undecidable? [Lecture 23]
A: Not directly: it is not a language property. One machine immediately rejects without writing; another writes 0, then rejects. Both recognize ∅, but only the second has the property. Failure of Rice does NOT prove decidability; it only means this theorem cannot settle the question directly.

Q: Can Rice apply to “L(M) is recognized by SOME TM with an even number of states”? [Lecture 23]
A: No: the property is trivial. Add an unused state when necessary to make the state count even without changing the language. Every TM-recognizable language therefore qualifies. “Recognized by some even-state machine” differs from “this machine has an even number of states.”

Q: Can Rice apply to “L(M) is recognized by SOME TM with ≤37 states and ≤37 tape symbols”? [Lecture 23]
A: Yes. Semantic: it asks whether the same language has any small recognizer. Nontrivial: ∅ has one. Up to renaming, only finitely many such bounded machines exist, but infinitely many recognizable languages exist, so some language has no such machine. Rice gives undecidability. Contrast counting states of the GIVEN machine.

Q: Why is complement(A_TM) not recognizable? [Lecture 24]
A: A_TM is recognizable by simulation but undecidable by diagonalization. If its complement were recognizable too, alternating the two recognizers would decide A_TM. Contradiction. Need BOTH facts about A_TM; undecidability alone does not imply an unrecognizable complement.

Q: Prove EQ_TM is NOT recognizable. [Lecture 24]
A: Reduce complement(A_TM) to EQ_TM. Given ⟨M,w⟩, let R reject all inputs. Let T on any x simulate M on w, accepting x only if M accepts w. If M does not accept w, both languages are ∅; if it accepts, L(T)=Σ∗ differs from L(R). Thus nonacceptance iff equality. The source is unrecognizable, so EQ_TM is too.

Q: Prove complement(EQ_TM) is NOT recognizable. [Lecture 24]
A: Reduce complement(A_TM) to complement(EQ_TM). Let U accept every input. Let T on any x simulate M on w, accepting only if M accepts w. If M does not accept, L(T)=∅ differs from L(U)=Σ∗. If M accepts, both languages are Σ∗. Thus nonacceptance iff inequality. The unrecognizable source proves the target unrecognizable.

Q: Show {0^n1^n : n≥0} is context-free. [Past Exam 2]
A: Give the CFG S → 0S1 | ε. Every use of 0S1 adds one 0 on the left and one 1 on the right. After n uses, choose ε to finish as 0^n1^n. Conversely every generated string has this form. Example: S ⇒ 0S1 ⇒ 00S11 ⇒ 0011.

Q: Prove {a^n b^n c^n : n≥0} is not context-free. [Lecture 11; past Exam 2]
A: Assume CFL; let p be its pumping length. Choose s=a^p b^p c^p. For ANY valid split uvxyz, |vxy|≤p prevents touching both a and c blocks. Pump i=0. Since |vy|>0, at least one count decreases, while an untouched block stays at p. Counts are unequal, so the result leaves the language. Contradiction. [[fig:exam2-cfl-blocks]]

Q: Can L and its complement both be unrecognizable? Can just one be decidable? [Past Exam 2]
A: Both unrecognizable: YES, EQ_TM and its complement. Both decidable: YES, ∅ and Σ∗. Exactly one decidable: NO, since decidability is closed under complement. Both recognizable but undecidable: NO, by the two-recognizer theorem. Exactly one recognizable: YES, A_TM and its complement.

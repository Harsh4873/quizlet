# Exam 1

Q: What is an alphabet?
A: A nonempty finite set of symbols. Sipser writes it as Sigma. Example: {0, 1}.

Q: What is a string?
A: A finite sequence of symbols from the alphabet. 01001 is a string. 2 is not, if Sigma is {0, 1}.

Q: What is |w|?
A: The length of string w: how many symbols it has. |01001| = 5. |w| is not the string itself.

Q: What is epsilon?
A: The empty string. Length 0. It is a string, not the number 0, and not a language.

Q: What is a language?
A: A set of strings. Example: A = {0, 11}.

Q: What is the empty language?
A: empty set: the language with zero strings. It does not contain epsilon.

Q: What is {epsilon}?
A: The language whose only string is the empty string. One string, not zero.

Q: What does a finite automaton do?
A: It reads a string one symbol at a time and accepts or rejects. It is always in exactly one state.

Q: What is the start state?
A: The state before any symbol is read. Drawn with an arrow in from nowhere.

Q: What is an accept state?
A: A state where, if the input is finished, the machine accepts. Drawn as a double circle.

Q: What is L(M)?
A: The language of machine M: exactly the strings M accepts.

Q: What is a DFA 5-tuple?
A: M = (Q, Sigma, delta, q0, F). Q is the states, Sigma the alphabet, delta the arrows, q0 the start, F the accept states.

Q: What is a sink?
A: A reject state you cannot leave. A missing DFA arrow is an implicit sink, not extra power.

Q: What is a regular language?
A: A language such that some DFA accepts exactly its strings.

Q: DFA for strings ending in 1?
A: q0 start, q1 accept. 0 stays, 1 goes to q1. From q1, 1 stays and 0 returns to q0.

Q: DFA for strings ending in 0?
A: q0 start, q1 accept. 1 stays at q0, 0 goes to q1. From q1, 0 stays and 1 returns to q0.

Q: DFA for at least one 1?
A: q0 start. q1 accept with a loop on 0 and 1. q0 loops on 0 and goes to q1 on 1.

Q: DFA for an even number of 1s?
A: q0 is start and accept. 0 loops. 1 flips between q0 and q1. q1 is not accept.

Q: How do you get the odd-number-of-1s DFA from the even one?
A: Keep the same arrows. Swap which states are accept.

Q: What is the complement of a DFA language?
A: Same states and arrows. Swap accept and non-accept. The machine must be complete (sink included) or the swap is wrong.

Q: Product DFA: even length AND odd number of 1s. Which state accepts?
A: Four states. q0 even/even start. q1 odd/odd. q2 even/odd accept. q3 odd/even. On 1, q0 swaps with q1 and q2 swaps with q3. On 0, q0 swaps with q3 and q1 swaps with q2.

Q: How many states for k yes/no facts?
A: 2 to the k. Two facts give 4 states. Three facts give 8.

Q: AND versus OR on a product?
A: AND: double-circle only the state where every fact holds. OR: double-circle every state where at least one fact holds. Only the all-false state rejects.

Q: Can a PDA replace a requested DFA?
A: The language can, by ignoring the stack (label 0, epsilon to epsilon). If the question says DFA, turn in the DFA. The stack does not make a finite-memory language shorter.

Q: What is an NFA?
A: Arrows can be missing, or many, for one letter. Accept if at least one run ends in an accept state. A dead branch does not reject the string by itself.

Q: What is an epsilon-transition?
A: A jump that reads nothing. Used to glue machines, as in union: new start, epsilon into each old start.

Q: NFA union of N1 and N2?
A: New start state, epsilon arrow into N1's start and epsilon arrow into N2's start. Accept if either machine would accept.

Q: What are the three regex operations?
A: A letter is a pattern. A union B means or. A-star means zero or more copies of A. Writing patterns next to each other means "then".

Q: Regex for at least three 1s?
A: 0-star 1 0-star 1 0-star 1 (0 union 1)-star. 11 does not match. 01011 does.

Q: Regex for odd length over {0, 1}?
A: (0 union 1) ((0 union 1)(0 union 1))-star. One symbol, then pairs. 00 does not match.

Q: Regex for the empty language?
A: The empty-set symbol. Not epsilon. Epsilon-star is {epsilon}, which is different.

Q: What is a CFG?
A: A 4-tuple (V, Sigma, R, S). V variables, Sigma terminals, R rules, S the start variable. A language with a CFG is a CFL.

Q: Palindrome CFG over {0, 1}?
A: S to 0S0, S to 1S1, S to 0, S to 1, S to epsilon. Wrap matching ends, or stop on one symbol, or stop on empty.

Q: What is a PDA arrow label?
A: read, pop, then push. Example: 1, A to B means read 1, pop A, push B. epsilon, epsilon to epsilon reads nothing and does not touch the stack.

Q: Why plant a dollar sign on the stack?
A: Sipser accepts by final state, and a transition cannot test "stack empty". Dollar is the bottom marker. Accept only when dollar is on top, so leftover stack symbols block a cheat accept.

Q: 2.5(a) at least three 1s?
A: Four states q0 to q3. 1 moves forward. 0 loops. q3 is accept and stays on 0 or 1. Stack unused. Same idea as the old DFA, with epsilon-to-epsilon labels.

Q: 2.5(b) same first and last symbol?
A: Remember the first symbol in the state. Guess that a later matching symbol is last, and jump to a dead accept (no arrows out). Stack unused. Epsilon the string is out.

Q: 2.5(c) odd length?
A: Two states. q0 even, start, not accept. q1 odd, accept. Every letter flips. Stack unused. 00 rejects.

Q: 2.5(d) odd length and middle symbol 0?
A: Push dollar, push X for each first-half symbol, guess a middle 0, pop one X per second-half symbol, pop dollar to accept. 101 accepts. 0001 dies because an X is still on top.

Q: 2.5(e) palindrome PDA?
A: Push dollar, push the actual letters, guess the middle (epsilon if even, eat one letter if odd), pop only a matching letter, pop dollar to accept. Epsilon is in, via epsilon moves to the accept state.

Q: 2.5(f) empty set PDA?
A: One start state, not a double circle, no arrows. A path of epsilon into an accept state would accept {epsilon}, which is wrong.

Q: What does an informal PDA description mean?
A: One or two English sentences above the diagram: what you remember, what you push, when you accept. Exercise 2.5 asks for that plus the state diagram.

Q: Pumping lemma, three rules?
A: If A is regular there is a pumping length p. Any s in A with |s| at least p splits as xyz with |xy| at most p, |y| > 0, and xy^i z in A for every i at least 0.

Q: Who picks p?
A: The lemma. You do not solve for it. A concrete p such as 4 is only so the letters can be written.

Q: Pumping is one-way. What does that mean?
A: Showing a pump that leaves the language proves not regular. Showing that some strings pump does not prove regular. 0-star pumps and is regular.

Q: Exercise 1.30, what is the error?
A: The fake proof pumps 0^p 1^p against {0^n 1^n} (Example 1.73). The language under test is 0-star 1-star, where counts need not match. 000001111 is still in 0-star 1-star.

Q: 1.29(a) idea?
A: A1 = {0^n 1^n 2^n}. s = 0^p 1^p 2^p. |xy| at most p forces y into the front zeros. i = 2 adds zeros and breaks the equal counts.

Q: Are CFLs closed under intersection?
A: No. A = {a^m b^n c^n} and B = {a^n b^n c^m} are CFLs. Their intersection is {a^n b^n c^n}, which Example 2.36 says is not a CFL. Cite 2.36. Do not prove it with CFL pumping.

Q: Are CFLs closed under complement?
A: No. They are closed under union. If they were also closed under complement, DeMorgan would make intersection a CFL, contradicting 2.2(a).

Q: What CFL operations are closed?
A: Union, concatenation, star, and intersection with a regular language. Not general intersection. Not complement.

Q: Is CFL pumping on Exam 1?
A: No. Theorem 2.34 was started and cut off on Sep 17, with no example. Sep 22 finishes it after the cutoff. Do not study uvxyz casework.

Q: Is Exercise 2.6 on Exam 1?
A: No. It is not assigned. Skip more-a's-than-b's and the # reverse grammars.

Q: Is Exercise 2.4 assigned?
A: No. HW2 assigns 2.5, the PDAs for those languages. A CFG is still a valid exam answer when a PDA would do, unless the question says draw a diagram. Practice cares about middle-0 and palindrome grammars.

Q: Exam 1 cutoff?
A: Thu Sep 24, in class. Content through the Sep 17 lecture. Sep 22 is not on it. Both HW1 and HW2 are on it.

Q: When is a CFG an acceptable exam answer?
A: When the question is "show this is context-free." She said a grammar is usually shorter than a PDA. "Draw a state diagram" still requires the picture.

Q: Theorem 2.20?
A: A language is context-free if and only if some PDA recognizes it. The theorem is usable. Its proof is not tested.

Q: What is a DPDA, in one line?
A: Definition 2.39: at most a definition question. Exactly one legal move in each situation. Do not study the DK-test or LR(k).

Q: Sipser PDA accept mode for this course?
A: Accept state after the input is read (Definition 2.13). Not accept-by-empty-stack. That is why the dollar marker is used.

Q: HW2 2.2(a) CFG for language A?
A: S to XY. X to aX or epsilon (any a's). Y to bYc or epsilon (equal b's and c's).

Q: HW2 2.2(a) CFG for language B?
A: S to XY. X to aXb or epsilon (equal a's and b's). Y to cY or epsilon (any c's).

Q: m and n in 2.2(a)?
A: Dummy names inside one set only. The n in A is not the n in B. A requires b = c. B requires a = b.

Q: What is mapping that stays off this deck?
A: GNFA elimination (Theorem 1.54's proof), Chomsky normal form, ambiguity, and CFL pumping applications.

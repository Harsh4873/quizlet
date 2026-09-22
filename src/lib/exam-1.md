# Exam 1

Q: What is an alphabet?
A: A nonempty finite set of symbols. Example: {0, 1}.

Q: What is a string, and what is its length?
A: A finite list of symbols from the alphabet. |w| is how many symbols w has. The empty string ε has length 0.

Q: What is a language?
A: A set of strings. The empty language has no strings. {ε} has one string, the empty string.

Q: What is a DFA?
A: A machine that reads one symbol at a time and is always in one state. It accepts if it ends in a double circle. Form: (Q, Σ, δ, q0, F).

Q: What is L(M)?
A: The set of strings the machine accepts.

Q: State the three regular pumping rules.
A: Split s = xyz with |xy| ≤ p, |y| > 0, and xy^i z still in the language for every i ≥ 0.

Q: What does the pumping length p mean, and why can a worked example use p = 4?
A: In a not-regular proof, the lemma hands you some p and you do not solve for it. p = 4 is only a stand-in so the letters can be written. Thursday's exam is not a minimum-pumping-length drill.

Q: What are the two directions of the pumping lemma?
A: Regular implies the three rules. The other direction is false. A language can satisfy the rules and still not be regular. Use the lemma by contradiction to show not regular. Satisfying the rules does not prove regular.

Q: Is the minimum pumping length on Exam 1?
A: Not expected. She grouped it with homework that was not in the lecture, along with Myhill–Nerode. A past exam had a minimum length. Do not drill it before the classification proof, the lemma proof, closure, or a PDA diagram.

Q: What is the difference between p and n?
A: p is the pumping length. n is a count inside a language, like the n in 0^n 1^n. Setting that count equal to p makes a legal long string. They are not the same variable.

Q: Pumping is one-way. Name a language that can be pumped and is regular.
A: Showing a pumped string leaves the language proves it is not regular. The other direction fails. 0∗ can be pumped and is regular.

Q: Use pumping to show {0^n 1^n 2^n} is not regular.
A: Take s = 0^p 1^p 2^p. |xy| ≤ p forces y into the leading 0s. Pumping to i = 2 adds 0s and the three counts no longer match.

Q: What counts as three copies of one block over {a, b}?
A: Pick one block w and glue it three times. w = a gives aaa. w = ab gives ababab. abab is only two copies, so it is out.

Q: Where is the error in a proof that 0∗1∗ is not regular?
A: The proof pumps 0^p 1^p and says it cannot be pumped. That failure is for the equal-count language {0^n 1^n}, not for 0∗1∗. In 0∗1∗ the counts need not match, and 000001111 is still in.

Q: What does closed under intersection mean?
A: If you take any two languages in the family, their overlap is still in the family.

Q: Can Exam 1 ask you to prove a language is not context-free?
A: No. The context-free pumping lemma is not on this exam. You can show context-free but not regular: pumping for not regular, then a pushdown automaton. You cannot show "not context-free."

Q: Will she ask you to write a context-free grammar?
A: No. A grammar is allowed only if you choose it to show a language is context-free. The question she described is a PDA state diagram. Know that a language is context-free exactly when some nondeterministic PDA accepts it.

Q: Even length: which state is start, and which is accept?
A: q0 is start and accept, because the empty string has even length. q1 is odd and not accept. Every symbol flips. [[fig:even-len]]

Q: Odd length: which state is start, and which is accept?
A: Same flip arrows. q0 is start and not accept. q1 is accept. [[fig:pda-odd]]

Q: Product machine for even length and an odd number of 1s. How many states, and what does each remember?
A: Four states, one for each pair of facts. q0 even/even, start. q1 odd/odd. q2 even/odd. q3 odd/even. A 1 flips both facts. A 0 flips only the length. [[fig:product]]

Q: On that product, which states accept for AND, and which for OR?
A: AND accepts only q2, the state where both facts hold. OR accepts every state except the one where both facts fail.

Q: If a question says give a DFA, is a PDA an acceptable drawing?
A: No. Draw the DFA with plain 0 and 1 arrows. A PDA that ignores the stack is the same idea in the wrong costume.

Q: What does an arrow label read, pop → push mean?
A: Read that symbol (or ε for none), pop the named stack symbol, then push the named stack symbol.

Q: What is the difference between ε on an arrow and the string ε?
A: On an arrow, ε means read nothing or pop nothing or push nothing. The string ε is the empty input. A machine can use ε-arrows and still reject the empty string.

Q: When does a pop arrow fail to fire?
A: When the symbol it needs is not on top of the stack. That branch dies. If every branch dies, the string is rejected.

Q: What is $ for on the stack?
A: A bottom marker. Accept only when $ is on top, so leftover symbols block a fake accept. It stands in for a test the machine does not have: stack empty.

Q: PDA for at least three 1s. Does it use the stack?
A: No. Count 1s in the state up to three. 0s stay put. The accept state stays on 0 or 1. Labels are 1, ε → ε. [[fig:pda-3]]

Q: PDA for strings that start and end with the same symbol.
A: Remember the first symbol in the state. Later, guess that a matching symbol is the last one and jump to an accept state with no arrows out. The stack is unused. The empty string is out. [[fig:pda-ends]]

Q: PDA for odd length.
A: Flip between even and odd on every symbol. Accept only the odd state. The stack is unused. [[fig:pda-odd]]

Q: PDA for odd length whose middle symbol is 0.
A: Push $, push one X per first-half symbol, read a 0 as the middle, pop one X per second-half symbol, then pop $ to accept. [[fig:pda-mid]]

Q: PDA for palindromes.
A: Push $, push the actual first-half symbols, guess the middle (ε if the length is even, eat one symbol if odd), pop only a match, then pop $ to accept. [[fig:pda-pal]]

Q: PDA for the empty set. How is that different from a machine that accepts only ε?
A: One start state, not accept, and no arrows. Nothing is accepted. An ε-arrow into an accept state would accept the empty string, which is a different language. [[fig:pda-empty]]

Q: What has to be written above each PDA diagram?
A: A short informal description: what the machine remembers, what it pushes, and when it accepts.

Q: What are the three regex operations?
A: A letter is a pattern. A ∪ B means or. A∗ means zero or more copies. Patterns written next to each other mean then.

Q: Regex for at least three 1s.
A: 0∗10∗10∗1(0 ∪ 1)∗. A regular expression is a legal way to prove a language is regular. She will not require one, and she will not ask for a grammar.

Q: Regex for strings that start and end with the same symbol.
A: 0 ∪ 1 ∪ 0(0 ∪ 1)∗0 ∪ 1(0 ∪ 1)∗1. Length 1 is the first two pieces. She gave this language as a classification example: it is regular, so give an expression or a DFA.

Q: Regex for even length and an odd number of 1s.
A: Cut the string into pairs. E = 00 ∪ 11 keeps the 1-count even. O = 01 ∪ 10 flips it. The pattern (E∗ O E∗ O)∗ E∗ O E∗ has an odd number of flips.

Q: When is B equal to one-or-more copies of B?
A: B = B+ exactly when BB ⊆ B. One copy is always in B+. If two copies stay inside B, longer concatenations stay inside too.

Q: What goes wrong if a proof only says three copies equal two copies?
A: That is not the subset condition BB ⊆ B, and it is not true of an arbitrary B. It does not prove either direction.

Q: What are the three different empty things?
A: ε is one string, the empty string, length 0. ∅ is a language with no strings. {ε} is a language with exactly one string, and that string is ε.

Q: When does a DFA accept ε?
A: Only if the start state is an accept state. No symbol has been read yet, so the machine is still at the start.

Q: Draw a DFA for the empty language.
A: The start state is not accept, and it has no arrows out. ε dies, and so does every other string. [[fig:dfa-empty]]

Q: Draw a DFA whose only string is ε.
A: The start state is accept. Any real symbol leaves into a rejecting sink and stays there. [[fig:dfa-eps]]

Q: On an NFA, is an ε-arrow the same as accepting the empty string?
A: No. An ε-arrow is a free jump that reads nothing. The NFA accepts ε only when some path of those jumps reaches an accept state before any symbol is read.

Q: Does gluing two NFAs with ε-arrows put ε in the union?
A: Not by itself. The new ε-arrows only choose a machine. ε is in the union only if it was already accepted by one of the two machines.

Q: Which of these accept the empty string: even length, odd length, at least three 1s, same first and last, middle 0, palindrome, empty set?
A: Even length accepts ε, because length 0 is even. Palindromes accept ε. The others reject it. The empty set rejects every string, including ε.

Q: How do you draw a PDA that accepts only ε?
A: Take an ε-arrow from the start into an accept state, and give real symbols no accepting run. That language is {ε}, not the empty set. The empty-set drawing has no accept state and no arrows.

Q: Does a star in a regex include the empty string?
A: Yes. A∗ means zero or more copies, and zero copies is ε. The empty-set regex matches nothing, not even ε.

Q: How do you complement a DFA?
A: Keep every state and every arrow. Swap which states are accept. The DFA must be complete, because a missing arrow is a hidden reject sink and has to be swapped too.

Q: What is the complement of the empty language, and of {ε}?
A: The complement of ∅ is every string. The complement of {ε} is every nonempty string.

Q: Are regular languages closed under union?
A: Yes. If A and B are regular, A ∪ B is regular.

Q: Are regular languages closed under concatenation?
A: Yes. If A and B are regular, the strings of A followed by strings of B are regular.

Q: Are regular languages closed under star?
A: Yes. If A is regular, A∗ is regular. That includes the empty string, because star allows zero copies.

Q: Are regular languages closed under intersection?
A: Yes. You may use that when you classify. She is unlikely to ask you to prove it, because the closure she builds in class is union, concatenation, or star.

Q: Are regular languages closed under complement?
A: Yes, by swapping accept states on a complete DFA. You may use it when you classify. She will not make an untaught closure the intended easy path.

Q: Which closure is she most likely to ask you to prove?
A: One from class, often union. Default proof: an NFA picture, new start, ε into each old start, plus a sentence. If she says DFAs only, use the product and do not cite NFA equivalence. A false claim dies by one counterexample.

Q: Over {0, 1}, which of these are strings: 0, 01001, ε, 11, 2, and 0, 1, 0?
A: 0, 01001, ε, and 11 are strings. |01001| = 5 and |ε| = 0. The symbol 2 is not in the alphabet. A list with commas is not one string. |w| is the length. w is the string itself. ε is not the number 0.

Q: What is a sink?
A: A reject state you cannot leave. On a DFA, a missing arrow is a hidden sink, not extra power.

Q: What is a regular language?
A: A language for which some DFA accepts exactly those strings, and no others.

Q: What does a DFA remember?
A: Only its current state. The number of states is finite and fixed. It does not keep a copy of the symbols it already read.

Q: Why does a PDA have a stack?
A: The stack is extra memory for symbols already read. You push a marker, then pop it later. A DFA cannot do that.

Q: DFA for strings ending in 1.
A: q0 is start. q1 is accept. 0 stays at q0, 1 goes to q1. From q1, 1 stays and 0 returns to q0. [[fig:end-1]]

Q: DFA for strings ending in 0.
A: q0 is start. q1 is accept. 1 stays at q0, 0 goes to q1. From q1, 0 stays and 1 returns to q0. [[fig:end-0]]

Q: DFA for strings with at least one 1.
A: q0 loops on 0. The first 1 goes to q1, which is accept and loops on 0 and 1. [[fig:one-1]]

Q: DFA for an even number of 1s.
A: q0 is start and accept. 0 loops on both states. 1 flips between q0 and q1. q1 is not accept. [[fig:even-ones]]

Q: DFA for an odd number of 1s.
A: Same arrows as the even machine. Swap the accept state, so q1 is accept and q0 is not. Flipping the condition is a swap of the double circles. [[fig:odd-ones]]

Q: How many states do you need for k yes-or-no facts?
A: 2 to the k. Two facts give 4 states. Three facts give 8. Name the states first, then draw the arrows.

Q: What is an NFA?
A: One letter may have no arrow, one arrow, or many arrows. Accept if at least one run ends in an accept state. A missing arrow kills only that branch.

Q: How do you build an NFA for the union of two NFAs?
A: Add a new start state. Draw an ε-arrow from it into each old start. Accept if either machine would accept. [[fig:nfa-union]]

Q: When does an NFA accept, and when does it reject?
A: It accepts if at least one path ends in an accept state. It rejects only if every path fails. One successful path is enough to accept. Rejection needs all of them.

Q: If a k-state NFA accepts anything, how short an accepted string can you guarantee?
A: Some accepted string has length at most k. Take a shortest accepted string and one accepting path. If a state repeats, the section between the two visits is a loop. Delete it and you still accept, but the string is shorter, which cannot happen. So the path never repeats a state. At most k states means at most k symbols. A loop-free path is actually at most k minus 1 symbols. The bound you need is at most k.

Q: Does that same length-k guarantee work for the shortest rejected string?
A: No. You cannot prove rejection by following one path, because every path has to fail. A 3-state NFA can accept every string of length at most 3 and reject a string of length 4. Then the shortest rejected string is longer than k.

Q: How can a 3-state NFA first reject at length 4?
A: Make every state accepting, and start in q1. On a1 a2 a3 a4 the reachable sets are {q1}, then {q2, q3}, then {q2}, then {q3}, then empty. A nonempty set means some path is still in an accept state, so that prefix is accepted. The empty set is the first reject. No shorter string reaches it, so the shortest rejected string has length 4, and k is 3.

Q: Why doesn't swapping accept states complement an NFA?
A: NFA acceptance means some path accepts. Swapping the double circles does not turn that into every path rejects. A DFA has exactly one path, so swapping accept states does complement a DFA.

Q: If an NFA has k states, how many states can the subset DFA have?
A: At most 2 to the k. Each NFA state is either in the current set or out of it. For k = 3 that is 8. For k = 4 that is 16.

Q: If a k-state NFA rejects something, how short a rejected string can you guarantee?
A: Some rejected string has length at most 2 to the k. Build the subset DFA. It has at most 2 to the k states and accepts the same language. Swap its accept states to get a DFA for the complement. The short-accepted-string fact then applies to that DFA.

Q: Can the shortest rejected string really be exponential in the number of NFA states?
A: Yes, up to about 2 to the k. She told the class not to worry about that blowup on this exam, and not to spend the review building a machine of size 2 to the k. Low priority for Thursday.

Q: What are the steps of a regular pumping proof?
A: You pick a string s that is in the language and has length at least p. The other side picks any legal cut s = xyz. You must show that every such cut can be pumped, with some i, out of the language. If one legal cut stays in, the proof is dead.

Q: What does a legal cut mean?
A: The cut is allowed by the rules: y is not empty, and xy is at most p symbols long. Legal does not mean the cut breaks the language.

Q: Who picks the cut?
A: Not you. You pick the string. They may pick any legal cut in the front p symbols. You have to win against all of those cuts, not just the one that helps you.

Q: Why does a string of only b's fail for three copies of one block?
A: With p = 4, twelve b's is www with w = bbbb. Cutting one b and copying it makes 13 b's, which is not three equal blocks. Cutting three b's and copying them makes 15 b's, which is still www as five, five, five. They are allowed to pick the three-b cut, so this string cannot carry the proof.

Q: Why can a marked string work when all identical letters do not?
A: 000011110000 is four 0s, four 1s, four 0s. Every legal cut sits in the front 0s and breaks the three matching blocks. All b's has no marker, so a cut whose length is a multiple of 3 can stay in.

Q: What is the identical-letters trap?
A: If every symbol is the same, the other side can hide the cut inside a block that still matches after pumping. Put a marker in the string, such as a different letter, so every short front cut is forced to break the pattern.

Q: What is a context-free grammar, and what is a CFL?
A: A grammar has variables, terminals, rules, and a start variable. She will not ask you to write one on Exam 1. For this exam, context-free means some nondeterministic pushdown automaton accepts it. A grammar is only an optional shortcut.

Q: Read the PDA label 1, A → B. What is X on a stack?
A: Read 1, pop A, push B. X is a stack symbol you chose as a marker. It is not an input letter.

Q: Use regular pumping on {a^n b^n c^n}. What is the cut, and which i breaks it?
A: s = a^p b^p c^p, for example aabbcc when p = 2. |xy| ≤ p puts y in the a's. i = 0 deletes those a's, so the counts no longer match. This shows the language is not regular. It is not a context-free pumping argument, and that lemma is not on Exam 1.

Q: Name the five parts of a DFA.
A: (Q, Σ, δ, q0, F). Q is the states, Σ the alphabet, δ the transition function, q0 the start, F the accept states. She will not print this. A question may ask for the tuple, or a proof may need it. If she does not say DFA or NFA, either is fine, because an NFA can be simulated by a DFA.

Q: How do you prove a string is accepted, using the definition of computation?
A: Write the string as w1 through wn. List states r0 through rn. r0 is the start. Each next state is δ of the previous state and the next symbol. Accept when rn is in F. She might ask this instead of "write the definition."

Q: How do you prove the regular pumping lemma at class level?
A: Take a DFA and set p to its number of states. On a string of length at least p, the first p+1 states in the run cannot all be different, so some state repeats. x is the part before that repeat, y is the loop, z is the rest. Say why |y| > 0, why |xy| ≤ p, and why repeating the loop stays in the language. A state diagram is enough. Explain the repeat. Do not only say "pigeonhole."

Q: What are the six parts of the pushdown automaton she will ask about?
A: The nondeterministic one: (Q, Σ, Γ, δ, q0, F). Γ is the stack alphabet. δ can offer several moves, including ε. She will not ask about a deterministic PDA. The question is a state diagram, and she might also want the tuple.

Q: How do you classify a language on this exam?
A: Regular: give a DFA, an NFA, a regular expression, or a closure argument. Not regular: pumping lemma, by contradiction. Context-free but not regular: pumping, then a PDA. You cannot be asked to prove "not context-free." {0^n 1^n} is the basic example of that middle case.

Q: What does a nondeterministic computation tree show?
A: Every branch of an NFA on one input. A branch dies when a symbol has no arrow. The string is accepted if any leaf is an accept state. The subset-construction state after that input is the set of states still alive. One tree is not the whole subset DFA.

Q: Is the construction enough, or do you also prove the machine correct?
A: The construction is the proof. A picture plus a short description is enough for a closure she did in class, such as union: a new start with an ε-arrow into each old start. She does not want a separate correctness essay.

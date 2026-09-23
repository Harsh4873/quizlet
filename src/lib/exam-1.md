# Exam 1

## Terms

Q: What is an alphabet?
A: A nonempty finite set of symbols. Example: {0, 1}.

Q: What is a string, and what is its length?
A: A finite list of symbols from the alphabet. |w| is how many symbols w has. The empty string ε has length 0.

Q: Over {0, 1}, which of these are strings: 0, 01001, ε, 11, 2, and 0, 1, 0?
A: 0, 01001, ε, and 11 are strings. |01001| = 5 and |ε| = 0. The symbol 2 is not in the alphabet. A list with commas is not one string. |w| is the length. w is the string itself. ε is not the number 0.

Q: What are the three different empty things?
A: ε is one string, the empty string, length 0. ∅ is a language with no strings. {ε} is a language with exactly one string, and that string is ε.

Q: What is a language?
A: A set of strings. The empty language has no strings. {ε} has one string, the empty string.

Q: What is L(M)?
A: The set of strings the machine accepts.

Q: What is a regular language?
A: A language for which some DFA accepts exactly those strings, and no others.

Q: What is a DFA?
A: A machine that reads one symbol at a time and is always in one state. It accepts if it ends in a double circle. Form: (Q, Σ, δ, q0, F).

Q: Name the five parts of a DFA.
A: (Q, Σ, δ, q0, F). Q is the states, Σ the alphabet, δ the transition function, q0 the start, F the accept states. She will not print this. A question may ask for the tuple, or a proof may need it. If she does not say DFA or NFA, either is fine, because an NFA can be simulated by a DFA.

Q: What is a transition chart, and what does a blank cell mean?
A: A table of δ: one row per state and one column per input symbol. For a PDA the columns are input and stack-top pairs. Each cell says where that move goes. In a PDA chart a blank cell means no move.

Q: What does a DFA remember?
A: Only its current state. The number of states is finite and fixed. It does not keep a copy of the symbols it already read.

Q: What is a sink?
A: A reject state you cannot leave. On a DFA, a missing arrow is a hidden sink, not extra power.

Q: What is an accepting path?
A: A walk that starts at the start state, follows arrows whose labels spell the string, and ends on an accept state. ε-arrows read nothing. The string is just the letters on the arrows you used.

Q: What is an NFA?
A: One letter may have no arrow, one arrow, or many arrows. Accept if at least one run ends in an accept state. A missing arrow kills only that branch.

Q: What does deterministic mean in this course, and what does nondeterministic mean?
A: Deterministic: each state has exactly one move for each symbol, so a string has exactly one path. That is a DFA. Nondeterministic: a symbol can have zero, one, or many moves, plus ε-moves, and the machine accepts if some path accepts. That is an NFA, and it is also the default PDA in this course.

Q: What does a nondeterministic computation tree show?
A: Every branch of an NFA on one input. A branch dies when a symbol has no arrow. The string is accepted if any leaf is an accept state. The subset-construction state after that input is the set of states still alive. One tree is not the whole subset DFA.

Q: What is a product machine?
A: One DFA that runs two DFAs at once. Each state is a pair: where the first machine is, and where the second is. On every symbol both parts move. 2 states times 3 states gives 6 pairs. Accept when both parts accept for intersection, and when either part accepts for union.

Q: What is the complement of a language?
A: Every string over the alphabet that is not in the language. If a machine accepts A, the complement is the pile of strings it rejects.

Q: What is the complement of the empty language, and of {ε}?
A: The complement of ∅ is every string. The complement of {ε} is every nonempty string.

Q: What does closed under intersection mean?
A: If you take any two languages in the family, their overlap is still in the family.

Q: What are the three regex operations?
A: A letter is a pattern. A ∪ B means or. A∗ means zero or more copies. Patterns written next to each other mean then.

Q: What is a perfect shuffle of two languages?
A: Take a1 … ak from A and b1 … bk from B, the same length, and zip them one symbol at a time: a1 b1 a2 b2 … ak bk. The odd spots spell the A string and the even spots spell the B string. Different lengths give no perfect shuffle.

Q: Perfect shuffle of 00 from A and 11 from B? Why is 01 with 10 a bad test?
A: 00 with 11 zips to 0101. Gluing them would give 0011, so this pair shows zip and glue are different. 01 with 10 zips to 0110, which is also what gluing gives, so that pair cannot tell you whether you zipped.

Q: What is a shuffle of two languages?
A: Any merge of a string from A with a string from B that keeps each string's own letter order. Pieces can be any length, even empty, so the lengths need not match. 00 and 11 shuffle to 0011, 0101, 0110, 1001, 1010, and 1100. Only 0101 is their perfect shuffle.

Q: What does the pumping length p mean, and why can a worked example use p = 4?
A: In a not-regular proof, the lemma hands you some p and you do not solve for it. p = 4 is only a stand-in so the letters can be written. Thursday's exam is not a minimum-pumping-length drill.

Q: What is the difference between p and n?
A: p is the pumping length. n is a count inside a language, like the n in 0^n 1^n. Setting that count equal to p makes a legal long string. They are not the same variable.

Q: What does a legal cut mean?
A: The cut is allowed by the rules: y is not empty, and xy is at most p symbols long. Legal does not mean the cut breaks the language.

Q: Why does a PDA have a stack?
A: The stack is extra memory for symbols already read. You push a marker, then pop it later. A DFA cannot do that.

Q: What are the six parts of the pushdown automaton she will ask about?
A: The nondeterministic one: (Q, Σ, Γ, δ, q0, F). Γ is the stack alphabet. δ can offer several moves, including ε. She will not ask about a deterministic PDA. The question is a state diagram, and she might also want the tuple.

Q: What does an arrow label read, pop → push mean?
A: Read that symbol (or ε for none), pop the named stack symbol, then push the named stack symbol.

Q: Read the PDA label 1, A → B. What is X on a stack?
A: Read 1, pop A, push B. X is a stack symbol you chose as a marker. It is not an input letter.

Q: What is $ for on the stack?
A: A bottom marker. Accept only when $ is on top, so leftover symbols block a fake accept. It stands in for a test the machine does not have: stack empty.

Q: What is the difference between ε on an arrow and the string ε?
A: On an arrow, ε means read nothing or pop nothing or push nothing. The string ε is the empty input. A machine can use ε-arrows and still reject the empty string.

Q: What is a context-free grammar, and what is a CFL?
A: A grammar has variables, terminals, rules, and a start variable. She will not ask you to write one on Exam 1. For this exam, context-free means some nondeterministic pushdown automaton accepts it. A grammar is only an optional shortcut.

## Rules

Q: When does a DFA accept ε?
A: Only if the start state is an accept state. No symbol has been read yet, so the machine is still at the start.

Q: Which of these accept the empty string: even length, odd length, at least three 1s, same first and last, middle 0, palindrome, empty set?
A: Even length accepts ε, because length 0 is even. Palindromes accept ε. The others reject it. The empty set rejects every string, including ε.

Q: Does a star in a regex include the empty string?
A: Yes. A∗ means zero or more copies, and zero copies is ε. The empty-set regex matches nothing, not even ε.

Q: How do you complement a DFA?
A: Keep every state and every arrow. Swap which states are accept. The DFA must be complete, because a missing arrow is a hidden reject sink and has to be swapped too.

Q: When does an NFA accept, and when does it reject?
A: It accepts if at least one path ends in an accept state. It rejects only if every path fails. One successful path is enough to accept. Rejection needs all of them.

Q: On an NFA, is an ε-arrow the same as accepting the empty string?
A: No. An ε-arrow is a free jump that reads nothing. The NFA accepts ε only when some path of those jumps reaches an accept state before any symbol is read.

Q: Does gluing two NFAs with ε-arrows put ε in the union?
A: Not by itself. The new ε-arrows only choose a machine. ε is in the union only if it was already accepted by one of the two machines.

Q: Why doesn't swapping accept states complement an NFA?
A: An NFA says yes if some path ends in an accept state. Say reading a gives one path to an accept state and one to a plain state, so the NFA accepts a. After swapping, the plain state is accept, so the new NFA still accepts a. A DFA has exactly one path per string, so swapping does complement a DFA. Convert the NFA to a DFA first.

Q: How do you build an NFA for the union of two NFAs?
A: Add a new start state. Draw an ε-arrow from it into each old start. Accept if either machine would accept. [[fig:nfa-union]]

Q: How many states do you need for k yes-or-no facts?
A: 2 to the k. Two facts give 4 states. Three facts give 8. Name the states first, then draw the arrows.

Q: What does a 2^k bound next to a k-state NFA usually mean?
A: Turn the NFA into a DFA whose states are sets of NFA states. Each NFA state is in or out of the set, so there are at most 2^k sets. Needing the complement of an NFA's language means the same move. A 2^n inside a language, like a^(2^n), is only a string length, and that is a pumping problem.

Q: A path visits m different states and repeats none. How many letters can it read?
A: At most m − 1. The first state costs no letter, and each arrow reads at most one. Six states in a row, P0 through P5, have five arrows between them. A sixth letter would need a seventh visit, so some state would repeat.

Q: When do you open a proof with "assume it is regular"?
A: Only when you are showing a language is not regular: assume it, then pump or intersect until something breaks. To show a language is regular, build it: a DFA, an NFA, a regular expression, or closure from pieces you already know are regular. Closure runs forward only. A regular intersection does not make the other piece regular.

Q: How do you classify a language on this exam?
A: Regular: give a DFA, an NFA, a regular expression, or a closure argument. Not regular: pumping lemma, by contradiction. Context-free but not regular: pumping, then a PDA. You cannot be asked to prove "not context-free." {0^n 1^n} is the basic example of that middle case.

Q: What are the steps of a regular pumping proof?
A: You pick a string s that is in the language and has length at least p. The other side picks any legal cut s = xyz. You must show that every such cut can be pumped, with some i, out of the language. If one legal cut stays in, the proof is dead.

Q: Who picks the cut?
A: Not you. You pick the string. They may pick any legal cut in the front p symbols. You have to win against all of those cuts, not just the one that helps you.

Q: How do you avoid picking a string that has a safe cut?
A: Before you write a cut, hunt for one yourself. Try every y the first p letters allow, deleting it and copying it. If any legal cut stays in the language, throw that string out. In the one-a language, aabbccc fails: deleting both a's leaves bbccc, which is still in.

Q: What is the identical-letters trap?
A: If every symbol is the same, the other side can hide the cut inside a block that still matches after pumping. Put a marker in the string, such as a different letter, so every short front cut is forced to break the pattern.

Q: How do you shrink a language before pumping it?
A: Intersect it with a regular language that fixes the shape, like exactly one a, then b's, then c's. If the original were regular, the intersection would be regular too: run both machines as a product and accept only when both accept. Then pump the smaller language, where no legal cut can switch a rule off.

Q: In a language like 0^k 1 u 0^k, does choosing u add symbols?
A: No. u only labels symbols already in the string. In 000001000, five leading 0s force k = 5, and only three 0s come after the 1, so no choice of u leaves five 0s at the end. u can soak up extra 0s after the 1, which is why pumping down can stay in: 01000 is 0, 1, u = 00, 0.

Q: How do you prove a string is accepted, using the definition of computation?
A: Write the string as w1 through wn. List states r0 through rn. r0 is the start. Each next state is δ of the previous state and the next symbol. Accept when rn is in F. She might ask this instead of "write the definition."

Q: When does a pop arrow fail to fire?
A: When the symbol it needs is not on top of the stack. That branch dies. If every branch dies, the string is rejected.

Q: What has to be written above each PDA diagram?
A: A short informal description: what the machine remembers, what it pushes, and when it accepts.

Q: If a question says give a DFA, is a PDA an acceptable drawing?
A: No. Draw the DFA with plain 0 and 1 arrows. A PDA that ignores the stack is the same idea in the wrong costume.

Q: Is the construction enough, or do you also prove the machine correct?
A: The construction is the proof. A picture plus a short description is enough for a closure she did in class, such as union: a new start with an ε-arrow into each old start. She does not want a separate correctness essay.

Q: Which closure is she most likely to ask you to prove?
A: One from class, often union. Default proof: an NFA picture, new start, ε into each old start, plus a sentence. If she says DFAs only, use the product and do not cite NFA equivalence. A false claim dies by one counterexample.

Q: Can Exam 1 ask you to prove a language is not context-free?
A: No. The context-free pumping lemma is not on this exam. You can show context-free but not regular: pumping for not regular, then a pushdown automaton. You cannot show "not context-free."

Q: Will she ask you to write a context-free grammar?
A: No. A grammar is allowed only if you choose it to show a language is context-free. The question she described is a PDA state diagram. Know that a language is context-free exactly when some nondeterministic PDA accepts it.

Q: Is the minimum pumping length on Exam 1?
A: Not expected. She grouped it with homework that was not in the lecture, along with Myhill–Nerode. A past exam had a minimum length. Do not drill it before the classification proof, the lemma proof, closure, or a PDA diagram.

## Theorems

Q: State the three regular pumping rules.
A: Split s = xyz with |xy| ≤ p, |y| > 0, and xy^i z still in the language for every i ≥ 0.

Q: What are the two directions of the pumping lemma?
A: Regular implies the three rules. The other direction is false: a language can pass the rules and still not be regular, like a's, then b's, then c's, where exactly one a forces equal b's and c's. Use the lemma by contradiction to show not regular. Passing the rules proves nothing.

Q: How do you prove the regular pumping lemma at class level?
A: Take a DFA and set p to its number of states. On a string of length at least p, the first p+1 states in the run cannot all be different, so some state repeats. x is the part before that repeat, y is the loop, z is the rest. Say why |y| > 0, why |xy| ≤ p, and why repeating the loop stays in the language. A state diagram is enough. Explain the repeat. Do not only say "pigeonhole."

Q: What does the NFA-to-DFA theorem say, and how is the DFA built?
A: Every NFA has a DFA for the same language. Each DFA state is the set of NFA states you could be in, with ε-arrows followed. The start is the start state plus its ε-reach. On a symbol, move every state in the set, then follow ε-arrows. A set accepts if it holds an NFA accept state. k NFA states give at most 2^k sets.

Q: If an NFA has k states, how many states can the subset DFA have?
A: At most 2 to the k. Each NFA state is either in the current set or out of it. For k = 3 that is 8. For k = 4 that is 16.

Q: Are deterministic and nondeterministic machines equally powerful?
A: For finite automata, yes: every NFA has a DFA for the same language, with up to 2^k states. For pushdown automata, no: nondeterministic PDAs recognize more, and a machine like the palindrome one guesses the middle. Deterministic PDAs are not on Exam 1.

Q: What does the regular expression theorem say?
A: A language is regular exactly when some regular expression describes it. Use it to prove a language is regular. She will not require an expression, and she will not ask you to reproduce the proof.

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

Q: Why is the perfect shuffle of two regular languages regular?
A: Run DFAs for A and B together with a turn bit. A state is (p, q, turn). On A's turn only p moves, and the turn passes to B. On B's turn only q moves, and the turn passes back. Start at both start states on A's turn. Accept when p and q both accept and it is A's turn again, so both read the same number of symbols.

Q: Why is the shuffle of two regular languages regular?
A: Use a product NFA with states (p, q) and no turn bit. On each symbol, guess which machine reads it: move p or move q. Start at both start states. Accept when both parts accept. Nondeterminism does the choosing.

Q: When is B equal to one-or-more copies of B?
A: B = B+ exactly when BB ⊆ B. One copy is always in B+. If two copies stay inside B, longer concatenations stay inside too.

Q: What goes wrong if a proof only says three copies equal two copies?
A: That is not the subset condition BB ⊆ B, and it is not true of an arbitrary B. It does not prove either direction.

Q: If a k-state NFA accepts anything, how short an accepted string can you guarantee?
A: Some accepted string has length at most k. Take a shortest accepted string and one accepting path. If a state repeats, the section between the two visits is a loop. Delete it and you still accept, but the string is shorter, which cannot happen. So the path never repeats a state. At most k states means at most k symbols. A loop-free path is actually at most k minus 1 symbols. The bound you need is at most k.

Q: Does "some accepted string has length at most k" limit every accepted string?
A: No. It promises one short yes. The same machine can accept longer strings too. A 2-state machine that accepts a, ab, abb, and so on passes, because a has length 1.

Q: Does the length-k guarantee also work for the shortest rejected string?
A: No. One path can prove a yes, but a no needs every path to fail. An 8-state NFA can accept every string up to length 10 and first reject at length 11, which is longer than k.

Q: If a k-state NFA rejects something, how short a rejected string can you guarantee?
A: Some rejected string has length at most 2 to the k. Build the subset DFA. It has at most 2 to the k states and accepts the same language. Swap its accept states to get a DFA for the complement. The short-accepted-string fact then applies to that DFA.

Q: Can the shortest rejected string really be exponential in the number of NFA states?
A: Yes. The one 8-state machine only shows k is too small. A family of machines, one for every k, can push the first rejected string to exponential length, so the 2 to the k bound is about the right size. She said not to worry about this blowup on Thursday. Low priority.

Q: Two DFAs have k1 and k2 states. If their union accepts something, how short a member is guaranteed?
A: Shorter than the larger of k1 and k2. One of the machines accepts something, so its shortest accepted string has fewer letters than it has states, and that string is in the union. Low priority: this problem is not in the posted solutions.

Q: Two DFAs have k1 and k2 states. If their union misses some string, how short a missed string is guaranteed?
A: Shorter than k1 times k2. Run both DFAs together as pairs. A missed string ends on a pair where both reject. The shortest missed string repeats no pair, so it has at most k1 times k2 minus 1 letters. Low priority: not in the posted solutions.

## Examples

Q: Even length: which state is start, and which is accept?
A: q0 is start and accept, because the empty string has even length. q1 is odd and not accept. Every symbol flips. [[fig:even-len]]

Q: Odd length: which state is start, and which is accept?
A: Same flip arrows. q0 is start and not accept. q1 is accept. [[fig:pda-odd]]

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

Q: DFA for strings that start and end with the same symbol.
A: Five states. From the start, 0 goes to the 0-side and 1 goes to the 1-side. Each side has two states: the last symbol matches the first (accept) or it does not. Every symbol moves you to the state for the symbol just read. The start is not accept, so ε is out, while 0 and 1 are in.

Q: Product machine for even length and an odd number of 1s. How many states, and what does each remember?
A: Four states, one for each pair of facts. q0 even/even, start. q1 odd/odd. q2 even/odd. q3 odd/even. A 1 flips both facts. A 0 flips only the length. [[fig:product]]

Q: On that product, which states accept for AND, and which for OR?
A: AND accepts only q2, the state where both facts hold. OR accepts every state except the one where both facts fail.

Q: Draw a DFA for the empty language.
A: The start state is not accept, and it has no arrows out. ε dies, and so does every other string. [[fig:dfa-empty]]

Q: Draw a DFA whose only string is ε.
A: The start state is accept. Any real symbol leaves into a rejecting sink and stays there. [[fig:dfa-eps]]

Q: Write the 5-tuple of the DFA that simulates an NFA (Q, Σ, δ, q0, F).
A: States: every subset of Q. Start: q0 plus every state it reaches by ε-arrows. On symbol a from a set R: every state reachable from some state in R by reading a, then following ε-arrows. Accept: every subset that contains a state of F. She may hand you the power set so this stays short.

Q: Build an NFA whose shortest rejected string is longer than its number of states.
A: Over {a}: a start state with ε-arrows into a 3-cycle and a 4-cycle, 8 states. Only the last state of each cycle rejects, so the 3-cycle says no at lengths 2, 5, 8, 11, and so on, and the 4-cycle at 3, 7, 11, and so on. The NFA accepts if either cycle says yes, so the first length where both say no is 11. a^11 is longer than 8.

Q: Regex for at least three 1s.
A: 0∗10∗10∗1(0 ∪ 1)∗. A regular expression is a legal way to prove a language is regular. She will not require one, and she will not ask for a grammar.

Q: Regex for strings that start and end with the same symbol.
A: 0 ∪ 1 ∪ 0(0 ∪ 1)∗0 ∪ 1(0 ∪ 1)∗1. Length 1 is the first two pieces. She gave this language as a classification example: it is regular, so give an expression or a DFA.

Q: Regex for even length and an odd number of 1s.
A: Cut the string into pairs. E = 00 ∪ 11 keeps the 1-count even. O = 01 ∪ 10 flips it. The pattern (E∗ O E∗ O)∗ E∗ O E∗ has an odd number of flips.

Q: Is {0^k u 0^k : k ≥ 1, u any string} regular?
A: Yes. k may be 1, so it is every string that starts with 0, ends with 0, and has length at least 2: 0(0 ∪ 1)∗0. 00 and 010 are in. 0 and 01 are out. The posted answer 0+(0 ∪ 1)∗0+ is the same language.

Q: Write the 5-tuple for the perfect shuffle DFA.
A: From DFAs (QA, Σ, δA, sA, FA) and (QB, Σ, δB, sB, FB): states QA × QB × {A, B}, start (sA, sB, A), accept FA × FB × {A}. δ((p, q, A), c) = (δA(p, c), q, B). δ((p, q, B), c) = (p, δB(q, c), A). ε is in exactly when both start states accept.

Q: Classify {0^n 1^n} and prove both halves.
A: Context-free, not regular. Not regular: take s = 0^p 1^p. |xy| ≤ p puts y in the 0s, and i = 2 gives more 0s than 1s. Context-free: a PDA pushes $, pushes a 0 for each 0, pops one for each 1, then pops $ and accepts.

Q: Use pumping to show {0^n 1^n 2^n} is not regular.
A: Take s = 0^p 1^p 2^p. |xy| ≤ p forces y into the leading 0s. Pumping to i = 2 adds 0s and the three counts no longer match.

Q: Use regular pumping on {a^n b^n c^n}. What is the cut, and which i breaks it?
A: s = a^p b^p c^p, for example aabbcc when p = 2. |xy| ≤ p puts y in the a's. i = 0 deletes those a's, so the counts no longer match. This shows the language is not regular. It is not a context-free pumping argument, and that lemma is not on Exam 1.

Q: Show {a^(2^n) : n ≥ 0} is not regular.
A: Take s = a^(2^p), which is long enough. y is t a's with 1 ≤ t ≤ p. i = 2 gives length 2^p + t. Since t ≤ p < 2^p, that length is strictly between 2^p and 2^(p+1), so it is not a power of two and the string leaves.

Q: Is {0^k 1 u 0^k : k ≥ 1, u any string} regular?
A: No. The 1 right after the leading 0s pins k to the number of leading 0s, and the string must end with that many 0s. Take s = 0^p 1 0^p, so y is some leading 0s. i = 2 gives more leading 0s than there are symbols after the 1, so it leaves. Do not use i = 0: 01000 is still in as 0, 1, u = 00, 0.

Q: Why isn't 01(0 ∪ 1)∗0 a regular expression for {0^k 1 u 0^k : k ≥ 1}?
A: It locks the leading block at one 0, which is only the k = 1 slice. 00100 is in the language with k = 2, and the expression cannot make it, because its second letter has to be 1.

Q: What counts as three copies of one block over {a, b}?
A: Pick one block w and glue it three times. w = a gives aaa. w = ab gives ababab. abab is only two copies, so it is out.

Q: Why does a string of only b's fail for three copies of one block?
A: With p = 4, twelve b's is www with w = bbbb. Cutting one b and copying it makes 13 b's, which is not three equal blocks. Cutting three b's and copying them makes 15 b's, which is still www as five, five, five. They are allowed to pick the three-b cut, so this string cannot carry the proof.

Q: Why can a marked string work when all identical letters do not?
A: 000011110000 is four 0s, four 1s, four 0s. Every legal cut sits in the front 0s and breaks the three matching blocks. All b's has no marker, so a cut whose length is a multiple of 3 can stay in.

Q: Where is the error in a proof that 0∗1∗ is not regular?
A: The proof pumps 0^p 1^p and says it cannot be pumped. That failure is for the equal-count language {0^n 1^n}, not for 0∗1∗. In 0∗1∗ the counts need not match, and 000001111 is still in.

Q: Show the one-a language is not regular: a's, then b's, then c's, where exactly one a forces equal b's and c's.
A: Intersect with exactly one a, then b's, then c's, which is regular. What survives is a b^n c^n. Take s = a b^p c^p. Every legal y sits in the first p letters, so it is only b's or it holds the a. Copy only b's and there are more b's than c's. Delete the a and no a is left. Both leave, so the small language is not regular, and neither is the big one.

Q: Why does the one-a language still pass the pumping rules? Use p = 2.
A: Here you pick p and one cut per string. No a's: y is the first symbol. One a: y is the a, and deleting or adding a's turns the match rule off. Two a's: y is both a's, so the count never hits 1. Three or more: y is one a. Every pumped string stays in. p = 1 fails on aab: the only cut deletes an a and leaves ab.

Q: Why is the complement of {0^m 1^n : m ≠ n} not {0^n 1^n}?
A: Strings out of order, like 10, are in neither language. The repair: if the m ≠ n language were regular, its complement would be regular, and that complement intersected with 0∗1∗ is exactly {0^n 1^n}, which is not regular.

Q: PDA for {0^n 1^n}, the class machine.
A: q1 is start and accept, so ε is in. q1 to q2 on ε, ε → $. q2 loops on 0, ε → 0. q2 to q3 on 1, 0 → ε, and q3 loops on 1, 0 → ε. q3 to q4 on ε, $ → ε, and q4 is accept.

Q: PDA for a^i b^j c^k with i = j or i = k.
A: Push $, then push one marker per a. Guess a branch with an ε-arrow. Branch one: pop a marker per b, pop $, then read any c's and accept. Branch two: read the b's without touching the stack, then pop a marker per c, pop $, and accept.

Q: PDA for palindromes.
A: Push $, push the actual first-half symbols, guess the middle (ε if the length is even, eat one symbol if odd), pop only a match, then pop $ to accept. [[fig:pda-pal]]

Q: PDA for ww^R. How is it different from the palindrome machine?
A: Same machine: push $, push the first half, guess the middle, pop only a match, pop $. The only change is the middle guess. Here it is only an ε-move and never eats a symbol, so odd-length strings are rejected.

Q: PDA for at least three 1s. Does it use the stack?
A: No. Count 1s in the state up to three. 0s stay put. The accept state stays on 0 or 1. Labels are 1, ε → ε. [[fig:pda-3]]

Q: PDA for strings that start and end with the same symbol.
A: Remember the first symbol in the state. Later, guess that a matching symbol is the last one and jump to an accept state with no arrows out. The stack is unused. The empty string is out. [[fig:pda-ends]]

Q: PDA for odd length.
A: Flip between even and odd on every symbol. Accept only the odd state. The stack is unused. [[fig:pda-odd]]

Q: PDA for odd length whose middle symbol is 0.
A: Push $, push one X per first-half symbol, read a 0 as the middle, pop one X per second-half symbol, then pop $ to accept. [[fig:pda-mid]]

Q: PDA for the empty set. How is that different from a machine that accepts only ε?
A: One start state, not accept, and no arrows. Nothing is accepted. An ε-arrow into an accept state would accept the empty string, which is a different language. [[fig:pda-empty]]

Q: How do you draw a PDA that accepts only ε?
A: Take an ε-arrow from the start into an accept state, and give real symbols no accepting run. That language is {ε}, not the empty set. The empty-set drawing has no accept state and no arrows.

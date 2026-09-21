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
A: In a not-regular proof, the lemma hands you some p and you do not solve for it. p = 4 is only a stand-in so the letters can be written. A minimum-pumping-length question is different: you compute the smallest p yourself.

Q: What are the two uses of the pumping lemma?
A: Same three rules, two goals. To show a language is not regular, every legal cut must leave the language for some i. To find the minimum pumping length of a regular language, you need a cut that stays in for every i. Pumping does not break regular languages. It proves some languages are not regular.

Q: What is a pumping length, and what is the minimum one?
A: p is a pumping length if every string in the language of length at least p has a cut xyz with |y| ≥ 1, |xy| ≤ p, and xy^i z still in the language for every i ≥ 0. The minimum pumping length is the smallest such p. Strings shorter than p do not have to pump.

Q: How do you find a minimum pumping length?
A: Find the longest string in the language that has no friendly cut. The minimum p is one more than that length. A friendly cut stays in for every i. A cut that leaves the language is one you do not pick.

Q: Why is 3 not a pumping length for 0001∗?
A: 000 has length 3 and is in the language. Every nonempty y is made of 0s, so i = 0 has fewer than three leading 0s and i = 2 has more. Both are out. A pumping length of 3 would have to pump 000. It cannot.

Q: Why is the minimum pumping length of 0001∗ equal to 4?
A: 000 is the longest string in the language that cannot pump, so the minimum is one more than its length. At p = 4, 000 is too short to care. Every longer string has a 1. Cut x = 000, y = the first 1, z = the rest. Pumping only changes how many 1s there are, and that stays in 0001∗.

Q: On 000111, why doesn't a bad cut of the 0s kill p = 3?
A: You only need one friendly cut on that string. x = 0, y = 00, z = 111 gives 0111 when i = 0, so throw that cut away. x = 000, y = 1, z = 11 stays in for every i. 000111 can pump. The string that kills p = 3 is 000, which has no 1 to pump.

Q: Why is the minimum pumping length of 0∗1∗ equal to 1?
A: Every nonempty string has a 0 or a 1 you can repeat and stay in 0∗1∗. ε has length 0, so p = 1 does not have to pump it. p = 0 would require pumping ε, and ε has no nonempty y.

Q: If you union 001 onto 0∗1∗, what is the minimum pumping length?
A: 001 is already in 0∗1∗, so the union is the same language. The minimum pumping length stays 1.

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

Q: Why are context-free languages not closed under intersection?
A: A = {a^m b^n c^n} and B = {a^n b^n c^m} are context-free. Their overlap is {a^n b^n c^n}, which is not context-free. One counterexample pair is enough.

Q: In those two languages, are m and n shared across both?
A: No. m and n are dummy names inside one set. A asks for b = c. B asks for a = b.

Q: Why are context-free languages not closed under complement?
A: They are closed under union. If they were also closed under complement, DeMorgan's law would make the intersection context-free, which it is not.

Q: May you cite that {a^n b^n c^n} is not context-free without proving it?
A: Yes. Use it as a known fact. Do not rebuild the proof.

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

Q: What does a grammar rule capital → … mean?
A: The capital is a variable, a kind of string. The arrow says it may be rewritten as the right-hand side. A bar means or.

Q: Regex or grammar for at least three 1s.
A: Regex: 0∗10∗10∗1(0 ∪ 1)∗. Grammar: S → R1R1R1R and R → 0R | 1R | ε. Either one is enough. The stack is not needed.

Q: Grammar for strings that start and end with the same symbol.
A: S → 0 | 1 | 0A0 | 1A1, and A → ε | 0A | 1A. The empty string is out. One symbol is in, because it starts and ends with itself.

Q: Grammar for odd length. Why must a recursive variable grow by a pair?
A: S → 0 | 1 | 0S0 | 0S1 | 1S0 | 1S1. Adding one symbol each time would also build even lengths. A pair keeps the length odd.

Q: Grammar for odd length whose middle symbol is 0. Why is the center 0 rather than ε?
A: S → 0 | 0S0 | 0S1 | 1S0 | 1S1. The base string is the single symbol 0. ε has no middle symbol, so it cannot be the center.

Q: Grammar for palindromes over {0, 1}.
A: S → ε | 0 | 1 | 0S0 | 1S1. Wrap a matching symbol on both ends, or stop on empty or one symbol.

Q: Grammar for the empty set. How is that different from the grammar for {ε}?
A: The empty set has a start variable and no rule that builds a string. {ε} is the one rule S → ε.

Q: Regex or grammar for even length and an odd number of 1s.
A: Cut the string into pairs. E = 00 ∪ 11 keeps the 1-count even. O = 01 ∪ 10 flips it. The pattern (E∗ O E∗ O)∗ E∗ O E∗ has an odd number of flips. A grammar can use one variable for even 1s so far and one for odd 1s so far.

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

Q: Grammar rule S → ε versus a grammar with no useful rule.
A: S → ε builds the language {ε}. A start variable with no rule that builds a string builds the empty language. Writing ε on the right-hand side is not the same as having no strings.

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
A: Yes. If A and B are regular, A ∩ B is regular. Context-free languages are not closed under intersection with each other.

Q: Are regular languages closed under complement?
A: Yes. Swap the accept states on a complete DFA. Context-free languages are not closed under complement.

Q: Closure list: regular versus context-free.
A: Regular: closed under union, concatenation, star, intersection, and complement. Context-free: closed under union, concatenation, star, and intersection with a regular language. Not closed under intersection of two context-free languages. Not closed under complement.

Q: Which operations keep context-free languages context-free?
A: Union, concatenation, star, and intersection with a regular language. Not intersection of two context-free languages. Not complement.

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
A: A grammar is variables V, terminals Σ, rules R, and a start variable. A CFL is a language some such grammar generates.

Q: Read the PDA label 1, A → B. What is X on a stack?
A: Read 1, pop A, push B. X is a stack symbol you chose as a marker. It is not an input letter.

Q: Use regular pumping on {a^n b^n c^n}. What is the cut, and which i breaks it?
A: s = a^p b^p c^p, for example aabbcc when p = 2. |xy| ≤ p puts y in the a's. i = 0 deletes those a's, so the counts no longer match. This shows the language is not regular. It is not the five-piece context-free pumping argument.

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
A: p is some length the lemma hands you if the language is regular. You do not solve for it. p = 4 is only a stand-in so the letters can be written.

Q: What is the difference between p and n?
A: p is the pumping length. n is a count inside a language, like the n in 0^n 1^n. Setting that count equal to p makes a legal long string. They are not the same variable.

Q: Pumping is one-way. Name a language that can be pumped and is regular.
A: Showing a pumped string leaves the language proves it is not regular. The other direction fails. 0* can be pumped and is regular.

Q: Use pumping to show {0^n 1^n 2^n} is not regular.
A: Take s = 0^p 1^p 2^p. |xy| ≤ p forces y into the leading 0s. Pumping to i = 2 adds 0s and the three counts no longer match.

Q: What counts as three copies of one block over {a, b}?
A: Pick one block w and glue it three times. w = a gives aaa. w = ab gives ababab. abab is only two copies, so it is out.

Q: Where is the error in a proof that 0*1* is not regular?
A: The proof pumps 0^p 1^p and says it cannot be pumped. That failure is for the equal-count language {0^n 1^n}, not for 0*1*. In 0*1* the counts need not match, and 000001111 is still in.

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
A: A letter is a pattern. A ∪ B means or. A* means zero or more copies. Patterns written next to each other mean then.

Q: What does a grammar rule capital → … mean?
A: The capital is a variable, a kind of string. The arrow says it may be rewritten as the right-hand side. A bar means or.

Q: Regex or grammar for at least three 1s.
A: Regex: 0*10*10*1(0 ∪ 1)*. Grammar: S → R1R1R1R and R → 0R | 1R | ε. Either one is enough. The stack is not needed.

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
A: Cut the string into pairs. E = 00 ∪ 11 keeps the 1-count even. O = 01 ∪ 10 flips it. The pattern (E* O E* O)* E* O E* has an odd number of flips. A grammar can use one variable for even 1s so far and one for odd 1s so far.

Q: When is B equal to one-or-more copies of B?
A: B = B+ exactly when BB ⊆ B. One copy is always in B+. If two copies stay inside B, longer concatenations stay inside too.

Q: What goes wrong if a proof only says three copies equal two copies?
A: That is not the subset condition BB ⊆ B, and it is not true of an arbitrary B. It does not prove either direction.

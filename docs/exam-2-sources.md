# Exam 2 recall deck

47 cards. Four answer-pattern rules, 18 theorem/proof cards, and 25 worked-example cards. Answers fit the app's 420-character limit; no glossary-only section. These are short recall answers, not a claim that every proof fits on one card. Linked proof stages are named in their questions. The CFL proof spans three cards; Rice's proof spans two.

Sources: posted course lecture notes 10–24 (17 intentionally absent), the October 27 exam review, the two-page halting diagonalization handout, Sipser's Introduction to the Theory of Computation (third edition), and the prior offering's official Exam 2 and Exam 3 with rubrics. No unofficial solution website used. Question wording is normalized for card length; source tags identify the lecture/past-paper result, not a prediction of an exact future question.

## Card-to-source map

| Cards | Source / recall task |
|---|---|
| 1–2 | Lecture 13: recognizer/decider and classification proof obligations |
| 3–4 | Lectures 21/24: reduction direction, total mapping versus the machine it outputs |
| 5–6 | Lectures 14–15, Sipser Theorem 3.13: multitape simulation, finite control |
| 7–8 | Lectures 15–16, Theorem 3.16: BFS, three tapes, address enumeration |
| 9–10 | Lecture 18, Theorem 4.22: complement and two recognizers |
| 11–13 | Lecture 20 and old Exam 2 Q3: counting/characteristic sequence diagonalization |
| 14–16 | Lecture 24, §5.3; old Exam 3 Q3: mapping closure/contrapositives/complements |
| 17–19 | Lectures 22–23: Rice checks, empty-language case, proof construction |
| 20–22 | Lecture 11, Theorem 2.34: repeated variable and all three pumping conditions |
| 23 | Lecture 15 page 2: (0,1) → (x,1), (L,R), with a concrete starting arrangement |
| 24 | Lecture 15 page 4: exists-accepting-path rule, illustrated by three branches |
| 25–26 | Lectures 18–19; old Exam 2 Q2: DFA acceptance and emptiness |
| 27–30 | Lectures 19–21; old Exam 2 Q2; halting handout: recognizers and direct diagonals |
| 31–32 | Lecture 21: HALT and E_TM reduction proofs |
| 33–34 | Old Exam 3 Q1(a),(d): equality and never-halting |
| 35 | Lecture 23: E_TM by Rice |
| 36–38 | Old Exam 3 Q1(e),(c),(b): fixed string 001, infinite language, at most 10 states |
| 39–41 | Lecture 23: writes 0, some even-state recognizer, some bounded-size recognizer |
| 42–44 | Lecture 24, Theorem 5.30: complement(A_TM) and both sides of EQ_TM |
| 45–46 | Old Exam 2 Q1; lecture 11: 0^n1^n grammar and a^nb^nc^n pumping |
| 47 | Old Exam 2 Q4 and lectures 18/24: possible language/complement class pairs |

## Corrections retained

- CFL pumping proof: choose a tree with the fewest nodes, not just minimum height; p=b^(m+1), with b at least 2. Both nonempty and bounded-window conditions are justified.
- The E_TM lecture construction has a complemented target; flip the answer in a decider proof. Never label it A_TM ≤m E_TM without fixing the construction/direction.
- The never-halting example maps complement(HALT_TM), not HALT_TM, to the target under the displayed iff.
- Rice requires a property of the recognized language; reject-all versus write-then-reject is a counterexample for the writes-0 property. The older handwritten membership labels were reversed.
- An older paper waived semantic/nontrivial explanations. Current cards include both, following the new review guidance.
- The EQ_TM result is not merely undecidability: the lecture proves neither side recognizable.
- The a^nb^nc^n card uses pumping down for all valid splits. This is a complete alternative to the book's two pumping-up cases, not a claim to reproduce that case split verbatim.

## Selection

Lecture proofs and relevant old-paper tasks take priority. Excluded: oracle reducibility, time/space complexity, the old read-only-input simulation proof, most CFG/PDA homework drills, and a general definition catalogue. None of these omissions implies the in-scope definitions need not be understood.

Seven lightweight SVG figures support the tape representation, exact lecture transition, NTM branches, halting contradiction, language diagonal, parse tree, and pumping blocks. Updates ship as a separate bundled exam-2-627 set; existing Exam 1 and private decks retain their content and progress. The account's normal Sync access is unchanged.

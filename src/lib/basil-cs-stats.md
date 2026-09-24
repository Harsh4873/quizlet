# Basil CS/stats

## MCMC

Q: Define MCMC in one sentence, and why it matters for Basil.
A: Markov Chain Monte Carlo is a family of algorithms that draw samples from a hard posterior by walking a Markov chain whose stationary distribution is that posterior. Basil’s 1-pop and 2-pop analyses are Bayesian codon models fit with MCMC (same family as GenomegaMap-style inference). You need long enough chains, burn-in, and diagnostics so lineage contrasts are not noise.

## Markov chain

Q: What is a Markov chain (foundation of MCMC)?
A: A Markov chain is a sequence of random states where the next state depends only on the current state (Markov property), not the full history. MCMC builds such a chain so that, after burn-in, the visited states are approximate draws from the posterior. Standard CS/stats meaning used when reading Basil/GenomegaMap; not a Tom quote.

## Markov property

Q: State the Markov property in one sentence.
A: The future state is independent of past states given the present state, memoryless given the current position. That property lets Metropolis-Hastings / MCMC proposals work as a chain whose long-run distribution can match the target posterior. Standard meaning for reading this stack; not a Tom quote.

## Monte Carlo

Q: What does “Monte Carlo” mean in MCMC, and why did the ASR say Mont / Montclair?
A: Monte Carlo means estimating quantities by random sampling (averages over simulated draws) instead of closed-form integrals. In MCMC, posterior summaries (means, credible intervals on ω, etc.) are Monte Carlo estimates from chain samples. ASR “Mont / Montclair” → Monte Carlo.

## Metropolis-Hastings (link to MCMC)

Q: How does Metropolis-Hastings relate to MCMC?
A: Metropolis-Hastings is a classic MCMC algorithm: propose a move, accept or reject with a ratio that keeps the chain’s stationary distribution equal to the target posterior. Many codon / ω samplers are MH or MH-like. Short stack card for reading Basil/GenomegaMap; not a Tom quote.

## Bayesian inference

Q: Define Bayesian inference for the Basil / GenomegaMap setting.
A: Bayesian inference updates a prior over parameters (e.g. ω, Dirichlet-process structure) with the data likelihood to get a posterior. GenomegaMap-style codon models and Basil report posterior uncertainty, not just a point dN/dS. Meeting method talk: lineage contrasts should rest on this formal machinery, not informal PNPS screens.

## Prior

Q: What is a prior, and which priors show up in this stack?
A: A prior is the probability distribution over parameters before seeing the data. In this lineage project the method story is GenomegaMap → DPD (Dirichlet process prior) → Basil; ω priors also matter because long omega tails can distort inference and may need tweaks. Meeting theme, not invented dialogue.

## Dirichlet distribution

Q: Define the Dirichlet distribution (ASR: Durchet).
A: The Dirichlet is a distribution over probability vectors (simplex); it is the conjugate prior for categorical / multinomial proportions. It is the finite building block people mean when they say “Dirichlet prior.” ASR “Durchet” → Dirichlet. Stack meaning for reading this stack; not a Tom quote.

## Dirichlet process / DPD

Q: What is DPD in the Basil / GenomegaMap method story?
A: DPD here means Dirichlet process prior (recap theme: GenomegaMap → DPD → Basil). A Dirichlet process prior lets the model place flexible structure on mixture / category complexity instead of fixing a tiny parametric ω grid. Meeting method talk names DPD as the prior step between GenomegaMap-style modeling and Basil’s joint lineage application.

## Posterior

Q: Define the posterior in one sentence for Basil.
A: The posterior is the distribution of parameters after combining prior and likelihood, what MCMC samples target. For Basil, posterior draws on ω (and related parameters) are what you summarize after burn-in to decide whether lineages differ. Meeting method talk.

## Burn-in

Q: What is burn-in, and how does it show up in Basil plans?
A: Burn-in is the early MCMC iterations discarded because the chain has not yet mixed near the posterior. Recap next steps: run longer Basil trajectories (~100k iterations) and judge burn-in from plots before trusting lineage contrasts. Meeting method talk.

## ~100k iterations

Q: Why ~100k iterations for Basil?
A: Recap next steps call for longer Basil trajectories around ~100k iterations so chains can mix and burn-in can be assessed from trace plots. Short runs risk under-mixed posteriors and false lineage differences. Scale with HPRC / parallel as tests grow. Meeting method talk.

## HPRC / parallel

Q: What is HPRC’s role for Basil?
A: HPRC is the high-performance resource for running longer / many Basil MCMC jobs in parallel as lineage tests scale (one-vs-rest L1-L4 on ~12k isolates). Recap: HPRC / parallel alongside ~100k-iter trajectories. Meeting method talk.

## GenomegaMap

Q: What is GenomegaMap in this project?
A: GenomegaMap is the reference Bayesian codon / ω MCMC method Basil reimplements in spirit (1-pop and 2-pop). The first sanity check is Basil vs GenomegaMap on a comparable single-pop setup. Reasonable means similar, not identical. Rif manuscript stays GenomegaMap-only (no Basil). Meeting method talk.

## Basil

Q: What is Basil? (ASR: Bacillus)
A: Basil is the lab’s Bayesian GenomegaMap-style MCMC tool for 1-pop and 2-pop codon / selection analyses, aimed at rigorous lineage contrasts on large MTB panels. ASR “Bacillus” → Basil. Method story in recap: GenomegaMap → DPD → Basil joint 2-pop + lineage application.

## Basil 1-pop vs 2-pop

Q: What is 1-pop vs 2-pop in Basil, and what order does the meeting suggest?
A: 1-pop fits one population’s codon / ω model; 2-pop fits two groups for contrast (e.g. lineage vs rest). Recap path: match Basil to GenomegaMap first (start single-pop combined), then 2-pop, then lineage contrasts. Meeting method talk.

## Single-pop sanity check vs GenomegaMap

Q: Why compare Basil single-pop to GenomegaMap before lineage tests?
A: If Basil’s 1-pop posterior / ω summaries do not roughly track GenomegaMap on the same combined set, lineage 2-pop contrasts are not trustworthy. Recap Card 3: compare first; similar is enough, not identical. Meeting method talk.

## Codon model

Q: What is a codon model in the GenomegaMap / Basil sense?
A: A codon model treats evolution at the codon level so synonymous vs nonsynonymous changes inform selection (ω-style parameters) rather than only nucleotide or amino-acid counts. Basil reimplements GenomegaMap-style codon MCMC for 1-pop/2-pop. Meeting method talk.

## ω / omega (selection parameter)

Q: What is ω (omega) here?
A: ω is the selection parameter in the codon model, dN/dS-style relative rate of nonsynonymous to synonymous change. Basil / GenomegaMap posteriors over ω (and related structure via DPD) are the objects you compare across lineages. Meeting method talk.

## Long omega tails

Q: Why do long omega tails matter, and what might you do?
A: Heavy / long tails in the ω posterior (or prior predictive) can hurt inference and DPD behavior. Recap: consider prior tweaks if long omega tails hurt DPD before trusting big lineage screens. Meeting method talk.

## Differential selection across lineages

Q: What is the next research project in one sentence?
A: Find genes with different selection across MTB lineages 1-4 on a large balanced panel (~12k isolates), using Basil Bayesian MCMC plus multiple-test correction, not informal PNPS screens. Literature nominates candidates; Basil’s job is rigorous contrasts. Meeting method talk.

## pN/pS (PNPS) point estimate vs formal contrast

Q: Why are PNPS / pN/pS point estimates not enough?
A: Ioerger’s critique in the recap: PNPS point estimates or informal screens do not prove lineage differences are statistically significant. Plan is Basil Bayesian MCMC contrasts with multiple-test correction. Meeting method talk.

## One-vs-rest lineage contrasts

Q: What is the active initial lineage-contrast design (Tom email Sep 24)?
A: One-vs-rest: L1 vs L2-L4, L2 vs others, L3 vs others, L4 vs others, “simplify things initially.” This supersedes Monday’s all-pairwise start for the initial analysis. Still after GenomegaMap match → Basil 2-pop → multiple-test. Meeting + Sep 24 email.

## All-pairwise lineage contrasts (historical)

Q: What did Monday suggest that Sep 24 superseded?
A: Monday discussion suggested all pairwise lineage tests (L1 vs L2, L1 vs L3, …, L2 vs L4, etc.), with early focus wording like L2 vs L4. Tom’s Sep 24 email supersedes that for the initial analysis in favor of one-vs-rest. Keep as historical context only. Meeting method talk.

## Multiway / ANOVA-like contrast

Q: What is the multiway / ANOVA-like contrast in the plan?
A: Recap keeps a multiway / ANOVA-like contrast “in mind” as a fuller design after simpler steps, not the first analysis. Active first lineage design is one-vs-rest (Sep 24). ANOVA here is analogy for multi-group contrast, not “Tom assigned ANOVA homework.” Meeting method talk.

## Multiple-test correction / FDR-BH

Q: Why multiple-test correction (FDR / BH) for lineage gene screens?
A: Testing thousands of genes for lineage differential selection creates many false positives if you threshold raw p-values or informal scores. Recap plan: Basil MCMC contrasts plus multiple-test correction (think FDR / Benjamini-Hochberg-style control in practice). Meeting method talk; BH naming is stack shorthand for that family, not a Tom quote.

## Lineage-specific alleles

Q: Why watch lineage-specific alleles in Basil contrasts?
A: Alleles private (or nearly private) to one lineage can drive apparent ω / selection differences that are really population structure / allele presence, not shared selective regime. Recap Card 3: watch lineage-specific alleles while doing 2-pop / lineage tests. Meeting method talk.

## Homoplasy

Q: What is homoplasy here, and what is the action item?
A: Homoplasy = same mutation arising independently on different branches (parallel evolution), used in screens like Holt EsxW-style logic. Recap lists a homoplasy calc on the 10k/12k set as a should-do (no hard date), concept card only, not paper gene results. Meeting method talk.

## Sequential MCMC

Q: What is “sequential MCMC” in the open issues?
A: Recap lists optional sequential MCMC as an open issue with Ioerger after baseline Basil vs GenomegaMap matches, not a specified algorithm in the notes. Treat as “future method tweak / proposal,” not something to invent details for. Meeting method talk.

## Likelihood (stack)

Q: What is the likelihood in Bayesian codon MCMC?
A: Likelihood is the probability of the observed sequence / polymorphism data given parameters (ω, tree or population assumptions, etc.). Posterior ∝ likelihood × prior; MCMC explores that product. Standard meaning for reading Basil/GenomegaMap; not a Tom quote.

## Stationary distribution (stack)

Q: Why do MCMC people care about the stationary distribution?
A: A well-built MCMC chain has a stationary distribution equal to the target posterior; after burn-in, samples behave like draws from that posterior. If the chain has not reached stationarity, ω summaries and lineage contrasts are unreliable. Standard meaning; not a Tom quote.

## Credible interval vs p-value (stack)

Q: How do Bayesian credible intervals differ from a frequentist p-value (high level)?
A: A credible interval summarizes posterior probability mass for a parameter (e.g. ω or a contrast); a p-value is a frequentist tail probability under a null. Basil’s language is posterior / MCMC; multiple-test correction still matters when screening many genes. Standard contrast for reading this stack; not a Tom quote.

## dN/dS vs ω (stack)

Q: How does classical dN/dS relate to ω in GenomegaMap / Basil?
A: Classical dN/dS is often a point estimate of nonsynonymous vs synonymous rates; ω in codon MCMC is the model parameter whose full posterior you sample. Meeting critique: point PNPS / informal dN/dS-like screens ≠ formal lineage contrast. Stack bridge card; not a Tom quote.

## Trace plot / mixing (stack)

Q: What should you look for on MCMC trace plots for Basil?
A: Trace plots show parameter values vs iteration. You want movement that mixes across the posterior after burn-in (not a stuck flat line or a long one-way drift). Recap: judge burn-in from plots on longer (~100k) runs. Stack diagnostic language tied to meeting next steps.

## Why Bayesian MCMC over informal PNPS for lineages?

Q: In one breath: why Basil Bayesian MCMC for lineage differential selection?
A: Prior papers nominate genes; PNPS point estimates do not prove lineage differences are significant. Basil’s GenomegaMap-style Bayesian MCMC (with DPD prior story, 2-pop contrasts, multiple-test correction) is the planned rigorous screen on ~12k isolates. Meeting method talk.

## Method story chain

Q: Recite the method story: GenomegaMap → DPD → Basil.
A: GenomegaMap provides the Bayesian codon / ω MCMC reference; DPD (Dirichlet process prior) is the prior theme in the stack; Basil is the lab reimplementation for joint 1-pop/2-pop and lineage application. Sanity-check Basil against GenomegaMap before large one-vs-rest screens. Meeting themes.

## ANOVA vs MCMC (ASR NOAA ambiguity)

Q: ASR said “NOAA”, what should you prefer, and what else stays?
A: Prefer MCMC as the primary ASR target (recap is Bayesian MCMC throughout). Multiway / ANOVA-like contrast remains a secondary “kept in mind” design idea, not the first analysis and not the main NOAA expansion. See terms-index for the ambiguity note.

## GLM (demoted)

Q: Should GLM be a Tom study priority for this pack?
A: Generalized linear models are standard stats (exponential-family regression with a link). Ioerger-bot labeling: GLM is weak for this list, demoted; do not treat as Tom “study this” for Basil. Optional stack awareness only if someone contrasts classical GLMs with Bayesian codon MCMC. Not a meeting curriculum item.

## Proposal / prior tweaks (open)

Q: What open method tweaks sit after baseline match?
A: After Basil vs GenomegaMap baseline looks reasonable: prior / proposal tweaks (especially if long omega tails hurt DPD) and optional sequential MCMC, both open with Ioerger. Do not invent algorithm details beyond the recap. Meeting method talk.

## ~12k isolates / four lineages

Q: What data scale is planned for lineage contrasts?
A: Roughly ~12k isolates, more or less balanced over MTB lineages 1-4, for Basil Bayesian MCMC lineage contrasts with multiple-test correction. Meeting Card 1 method talk.

## Rif vs Basil (boundary)

Q: Does Basil go into the RifTnSeq manuscript?
A: No. Recap: Rif paper figures/writing now with GenomegaMap only, keep Basil out of that manuscript. Basil is for the lineage-selection project. Meeting method talk (boundary card, not gene facts).

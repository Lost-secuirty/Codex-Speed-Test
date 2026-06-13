# Where 2026 Is Actually Heading — and What These Repos Already Capture

**A sober, source-backed mapping for skeptical readers**
Compiled 2026-06-13. Author's framing; external claims cited to primary sources.

---

## 0. How to read this (and its limits)

- **What this is:** a ranking of real 2026 directional "vectors" (each backed by a primary or near-primary source), and a per-repo map of the concrete *things* five repos capture against those vectors. It is **not** a market-size pitch and **not** a claim that these repos are products. It argues alignment with where the field is going, nothing more.
- **Verification caveat (important, stated up front):** the research for this report ran in an environment where automated full-page fetch (`WebFetch`) was **HTTP-403 blocked on every primary domain** (arXiv, FDA.gov, EUR-Lex, OWASP, NIST, Nature, etc.). Claims were therefore confirmed via **search-engine excerpts that quote the primary source**, cross-checked across independent results, plus stable identifiers (DOIs, NeurIPS/ACL proceedings URLs, established arXiv IDs). Items are marked **[primary-confirmed]** (≥2 independent sources agree on the exact text/number, or a DOI/proceedings record exists), **[secondary]** (single aggregator), or **[moving]** (a count that changes over time). Before using any single number "court-of-record," re-pull it from an unblocked client. **— UPDATE 2026-06-13:** that re-pull is now done under full web egress (see testing-kits `docs/RESEARCH_CLAIM_VERIFICATION_2026-06-13.md`); the load-bearing numbers read clean from primary sources, and the one substantive correction — the FDA CDS item — is folded into V3/V12 below.
- **"Mapping confidence"** in the repo tables is separate from source confidence: **Strong** = the repo's thing is a near-literal instance of the vector; **Moderate** = clear but partial; **Inferred** = my analogy, not a published equivalence.
- **Dates matter:** several regulatory vectors are *imminent, not hypothetical* — EU AI Act Articles 12/14/50 apply **2 Aug 2026** (weeks out from this writing).

---

## 1. Thesis (one paragraph)

As AI generation becomes cheap and ubiquitous, the scarce — and increasingly *mandated* — layer is **verification, provenance, and human-gated judgment**. Independently, across code-test auditing, slot math, autonomous-agent capability, game dev, and clinical tooling, these repos instantiate one consistent stance: *don't trust AI output by default — verify it, log it, gate it on a human, and surface evidence rather than assert conclusions.* Every one of those moves now has a primary-source 2026 vector behind it: **regulation** (EU AI Act Arts. 12/14/50; FDA clinical-decision-support guidance), **security consensus** (OWASP LLM Top 10 2025; NIST AI 600-1), **measurement** (METR; USENIX; Veracode), and **standards** (C2PA; AGENTS.md; OpenSSF/CISA SBOM). The portfolio isn't ahead of a hype wave — it's aligned with the part of the field that *outlasts* the hype: the trust-and-verification layer. The frontier labs now say this in their own words: Anthropic's **"When AI builds itself"** (2026-06-04) frames it as **Amdahl's law for AI R&D** — once AI makes generation cheap (their figure: ~8× code shipped per engineer-quarter), the binding constraint shifts to *"can humans review and choose fast enough?"*, and the **new bottleneck is verification systems** (their Figure 3). That is exactly the layer these repos build. (Treat the 8× as Anthropic's self-report, not an independent audit.)

---

## 2. The 2026 directional vectors, ranked by evidence strength + momentum

Ranked so the best-evidenced, most binding directions come first.

| # | Vector | Strongest evidence (dated) | Status |
|---|---|---|---|
| **V1** | **Agentic AI is mainstreaming while trust *declines*** — the verification gap | Stack Overflow 2025 Dev Survey: 84% use AI, but **46% distrust accuracy vs 33% trust** [primary-confirmed]; GitHub Octoverse 2025: **1.1M repos** import an LLM SDK (+178% YoY), 1M Copilot PRs [secondary]; Gartner: <5%→**40%** of enterprise apps with task-specific agents by end-2026 [secondary, forecast]; **Anthropic "When AI builds itself" (2026-06-04)** frames the gap as Amdahl's law → "new bottleneck: verification systems" (Fig 3) [secondary, self-report] | Mainstream + measured |
| **V2** | **AI-generated code carries measurable security/quality debt** | USENIX Security 2025 "We Have a Package for You!": **19.7%** of AI code samples reference hallucinated packages (205,474 unique) [primary-confirmed, peer-reviewed]; Veracode 2025: **~45%** of AI code introduced an OWASP-class vuln, *no improvement with model scale* [secondary, defined-task]; GitGuardian: **23.8M** secrets leaked to public GitHub 2024, **~40% higher** leak rate in AI-assisted repos [secondary, vendor] | Corroborated across independent methods |
| **V3** | **Human oversight of high-risk AI is now law** | EU AI Act **Article 14** requires effective human oversight and *explicitly names automation bias* + override (applies **2 Aug 2026**) [primary-confirmed]; FDA Clinical-Decision-Support guidance: the provider-review criterion (Cures Act §3060) — the final guidance (**6 Jan 2026**) *softened* the old "independent review" bright line, now allowing a single recommendation [secondary] | Binding / imminent |
| **V4** | **Agent/LLM security has a consensus threat model** | OWASP **Top 10 for LLM Apps 2025**: prompt injection = **#1 (LLM01)**, "LLMs don't segregate instructions from data" → treat untrusted content as data; **LLM06 Excessive Agency** = least-privilege [primary-confirmed]; NIST **AI 600-1** GenAI Profile (2024-07-26) [primary-confirmed] | Consensus |
| **V5** | **Auditability / traceability / logging is required** | EU AI Act **Article 12**: high-risk AI must enable **automatic event logging over the system lifetime** [primary-confirmed]; OpenTelemetry **GenAI semantic conventions** for agent spans [secondary] | Binding + standardizing |
| **V6** | **Verification is professionalizing into a discipline (evals)** | Documented **LLM-as-judge biases** — position, verbosity, **self-preference** (NeurIPS 2023 MT-Bench; NeurIPS 2024) [primary-confirmed]; construct-validity critiques of benchmarks (NeurIPS 2021; arXiv 2511.04703) [secondary] | Rising / maturing |
| **V7** | **Reproducibility/determinism + adequacy testing** | Nondeterminism persists **at temperature 0** — a systems (batch-invariance) problem (Thinking Machines, 2025-09-11) [secondary, 2 corroborations]; **mutation testing > coverage** at Google scale (ICSE/TSE 2021) [primary-confirmed]; **metamorphic testing** for the oracle problem (ACM CSUR, DOI 10.1145/3143561) [primary-confirmed] | Established + freshly re-energized |
| **V8** | **Content provenance/authenticity is standardizing + regulated** | **C2PA / Content Credentials** open standard; CAI passed **5,000 members** (mid-2025) → **6,000+** (Jan 2026), with capture-at-source camera silicon [primary-confirmed/moving]; EU AI Act **Article 50** machine-readable AI-content marking (applies **2 Aug 2026**) [primary-confirmed] | Standardizing + regulatory tailwind |
| **V9** | **Software supply-chain provenance → baseline** | CISA **2025 SBOM Minimum Elements** draft adds mandatory component **cryptographic hash** (comment closed 2025-10-03) [secondary, gov primary]; SLSA/in-toto/Sigstore (OpenSSF) [secondary] | Regulatory + tooling |
| **V10** | **Agent instructions converging on an open standard** | **AGENTS.md** (released Aug 2025, reported **60k+ repos**, now under the Agentic AI Foundation / Linux Foundation) [primary-confirmed format; moving count] | Cross-vendor convergence |
| **V11** | **Context engineering / agentic RAG / per-agent memory** | arXiv **2503.15231**: doc-RAG lifts code-gen **83–220%** *for unfamiliar libraries*, driven by **example code** (not prose) [secondary; **conditional finding**]; Anthropic "context engineering" framing (Sept 2025) [secondary]; Agentic-RAG survey (arXiv 2501.09136) [primary-confirmed] | Rising (partly rebranding a real problem) |
| **V12** | **Clinical AI = decision support, not autonomous diagnosis** | FDA CDS provider-review criterion (Cures Act §3060; 2026 final guidance softened the "independent review" bright line) [secondary]; npj Digital Medicine taxonomy: **1,016** FDA authorizations, **88.2%** radiology — still narrow-task [primary-confirmed]; JAMA: automation-bias *harm* in CDS [primary-confirmed] | Regulatory + evidence-based |
| **V13** | **Behavioral/addictive-design ethics → regulated category** | Near-miss recruits win circuitry (Clark, *Neuron* 2009) & losses-disguised-as-wins (Dixon, *Addiction* 2010) [primary-confirmed]; UK design limits — autoplay ban, **2.5s** min spin, LDW ban (eff. 31 Oct 2021) [secondary]; EU **DSA Art. 25** dark-pattern ban (eff. 2024-02-17) → **Digital Fairness Act** scoping "addictive design," proposal targeted **Q4 2026** [primary-confirmed] | Rising EU/UK; contested US |
| **V14** | **Self-improving-but-human-gated / "no-runaway" governance** | NIST AI RMF critiqued for **not grading by autonomy** (the "agentic-fitness gap") [secondary]; policy-as-code research (arXiv 2509.23994) [primary-confirmed paper] | Emerging, least standardized |

---

## 3. Per-repo maps (≥10 ranked "things" each)

> Source confidence is per the legend in §0; full citations in §6. Vector refs are to §2.

### 3.1 `testing-kits` — *verify AI's work before you trust it*

| Rank | Thing it captures | Vector | Anchor source | Mapping |
|---|---|---|---|---|
| 1 | **AI code is not trusted by default** (explicit policy) | V1, V2 | SO 2025 distrust>trust; Veracode 45%; USENIX 19.7% | **Strong** — the policy *is* the verification-gap stance |
| 2 | **Proof-test standard**: every harness must pass-on-safe **and** fail-on-planted-bad | V7 | Mutation testing at Google (ICSE/TSE 2021) | **Strong** — this is mutation-testing logic |
| 3 | **Secret/PII scan gate** (pre-commit + CI) | V2 | GitGuardian 23.8M secrets; +40% in AI repos | **Strong** |
| 4 | **AI failure-mode mapping** (catalog of how AI code fails) | V2, V6 | USENIX/Veracode/Apiiro convergence | **Strong** |
| 5 | **Verified-vs-assumed evidence labeling** | V6, V12 | Benchmark construct-validity critique; clinical "surface, don't assert" | Moderate — epistemic-honesty mapping |
| 6 | **Governance-as-code** (`control_audit` vs `control-policy.json`) | V14, V4 | Policy-as-code (arXiv 2509.23994); NIST | Moderate |
| 7 | **Supply-chain minimalism** (zero runtime deps) | V9, V2 | CISA SBOM; OWASP LLM03 supply chain | Moderate — blunt but real mitigation |
| 8 | **Deterministic test discipline** (4,364 tests, order/clock-stable) | V7 | NeurIPS reproducibility checklist | Moderate |
| 9 | **Harness engineering** — rules live in files/hooks, not model memory | V11 | Anthropic context engineering; AGENTS.md | Moderate |
| 10 | **Cross-repo instruction standard authorship** (the shared core) | V10 | AGENTS.md → Linux Foundation | Moderate — you built a cross-tool standard independently |
| 11 | **Domain wording guardrails** (no clinical/capability over-claims) | V12, V8 | FDA transparency; EU Art. 50 | Moderate |

### 3.2 `demo-math-slot-test-only` — *prove the math, audit the claims, gate the human*

| Rank | Thing it captures | Vector | Anchor source | Mapping |
|---|---|---|---|---|
| 1 | **Drift audit** — reconcile *claimed* intent vs *actual* diff | V1, V6 | METR perception-vs-reality (−19% RCT); evals discipline | **Strong** — a literal trust-gap instrument |
| 2 | **Mutation testing + "vacuous green" detection** (tests that pass while inert) | V7 | Mutation testing at Google (ICSE/TSE 2021) | **Strong** — names the exact adequacy problem |
| 3 | **Metamorphic-invariant testing** of the slot math | V7 | Metamorphic testing (ACM CSUR, DOI 10.1145/3143561) | **Strong** — literal metamorphic testing |
| 4 | **Gambling-psychology mechanism catalog** (near-miss, losses-disguised-as-wins) with *honest-counter / declined* framing | V13 | Clark *Neuron* 2009; Dixon *Addiction* 2010; UK LDW ban; EU Digital Fairness Act | **Strong** — you catalogued exactly what regulators now target, and declined it |
| 5 | **RTP/RNG statistical verification + deterministic reel engine** | V7 | Nondeterminism-at-temp-0 (2025); reproducibility | **Strong** |
| 6 | **Self-improving audit loop with HARD human gates** + longitudinal auditor memory + propose-only meta-audit | V3, V14, V11 | EU AI Act Art. 14; NIST agentic-fitness gap | Strong (human-gate) / Moderate (self-improve) |
| 7 | **AGENTS.md-canonical convention** | V10 | AGENTS.md standard | **Strong** — adopted/anticipated the convergence |
| 8 | **Audit-history log** (append-only NDJSON of auditor performance) | V5, V11 | EU AI Act Art. 12 lifetime logging | Moderate |
| 9 | **Factual-wording policy** (no cert/audit claims) | V8, V12 | EU Art. 50; FDA transparency | Moderate |
| 10 | **Property-based testing** (`test:proof`) | V7 | Metamorphic/PBT lineage (ACM CSUR) | Moderate |
| 11 | **Subagent roles** (auditor/explorer/planner) | V1, V6 | Agentic mainstreaming; LLM-as-judge (auditor) | Moderate |
| 12 | **Security full-stop inherited by subagents** | V4 | OWASP LLM01/LLM06 | Moderate |

### 3.3 `codex-speed-test` — *measure autonomous capability; make the gates bite*

| Rank | Thing it captures | Vector | Anchor source | Mapping |
|---|---|---|---|---|
| 1 | **Measuring autonomous one-prompt agent capability** | V1 | METR time-horizon (arXiv 2503.14499; ~50 min @50%, doubling ~7 mo); SWE-bench | **Strong** — capability-measurement, METR-style |
| 2 | **Self-audit-before-push loop** | V1, V6 | METR; evals discipline | **Strong** |
| 3 | **Canary: "gates must still bite" on known-bad input** | V7 | Mutation testing (ICSE/TSE 2021) | **Strong** — meta-mutation: proves the gate detects faults |
| 4 | **Portable M2M knowledge base + per-agent journals + evidence grades** | V11 | arXiv 2503.15231 (**example-code-driven**, conditional); Agentic-RAG survey (2501.09136) | **Strong** — your example-heavy crib sheets are *exactly* what the paper says drives the gain |
| 5 | **Security full-stop + treat-untrusted-content-as-data** | V4 | OWASP LLM01 2025 (root-cause framing); NIST AI 600-1 | **Strong** — verbatim alignment with OWASP |
| 6 | **Determinism gate** (clock/order invariance) | V7 | Nondeterminism-at-temp-0 (Thinking Machines, 2025) | **Strong** |
| 7 | **sha256 freeze of safety machinery** (file-guard) | V9, V5 | CISA SBOM crypto-hash; SLSA attestation | Moderate — attestation-like integrity |
| 8 | **Domain-specific static analysis** (footgun lint plugins) | V2 | Veracode; OWASP LLM05 output handling | Moderate |
| 9 | **Visual-regression testing** (committed baselines) | V6, V7 | Evals discipline | Moderate |
| 10 | **GitHub hardening checklist** | V9, V4 | OpenSSF Scorecard; CISA | Moderate |
| 11 | **Pure-vs-render separation** (logic stays testable) | V7 | Metamorphic/PBT | Moderate |
| 12 | **Web Audio psychoacoustics / "juice"** (Shepard tone, missing fundamental) | V13 (design side) | Sensory-reward design; cross-link to responsible-design awareness | Inferred — domain craft with ethical awareness |

### 3.4 `lostsouls-game` — *proportional governance; keep the human where judgment is subjective*

| Rank | Thing it captures | Vector | Anchor source | Mapping |
|---|---|---|---|---|
| 1 | **"Verified by playing, not CI"** — human eval where automated judgment is unreliable | V3, V6 | LLM-as-judge limits (MT-Bench/NeurIPS 2024); human-oversight | **Strong** — keeps a human exactly where automated judges fail |
| 2 | **Hybrid fast+governed proportionality** (ADR-0005) | V3, V14 | EU AI Act Art. 14 oversight "commensurate with autonomy"; NIST agentic-fitness gap | **Strong** — closes the gap NIST is critiqued for leaving open |
| 3 | **OpenSSF Scorecard / supply-chain** | V9 | OpenSSF/SLSA | **Strong** — literal adoption |
| 4 | **ADR-driven decision provenance** | V5 | EU AI Act Art. 12 record-keeping | Moderate |
| 5 | **Asset-licensing hygiene** (CC0, `ASSETS.md`) | V8, V9 | C2PA provenance ethos; CISA SBOM license field | Moderate |
| 6 | **Prod health-check / smoke proofs** ("runs ≠ works") | V6, V1 | Verify-before-claim; evals | Moderate |
| 7 | **Pure-logic unit testing** of game math | V7 | Reproducibility/determinism | Moderate |
| 8 | **Server hardening** (rate-limit) | V4 | OWASP | Moderate |
| 9 | **Procedural zero-asset fallback** (graceful degradation) | V2, V9 | Supply-chain resilience | Moderate |
| 10 | **Testable NPC decision logic** | V1, V6 | Agentic behavior eval | Moderate |
| 11 | **Light governance documented as an explicit decision** (ADR-0005) | V14 | NIST agentic-fitness gap | Moderate |

### 3.5 `health-prototype` — *surface, don't diagnose; the human supplies judgment*

| Rank | Thing it captures | Vector | Anchor source | Mapping |
|---|---|---|---|---|
| 1 | **The "librarian rule"** — surface/count/cite, **never** score/rank/diagnose; human supplies judgment | V12, V3 | FDA CDS provider-review criterion (§3060; 2026 guidance softened the old "independent review" bright line); EU AI Act Art. 14(4)(b) *names automation bias*; JAMA automation-bias harm | **Strong** — implements the FDA CDS provider-review *intent* (transparency + human-as-decider) + Art. 14 mitigation. *The strongest repo→regulation map in the portfolio* — the principle, not a verbatim rule. |
| 2 | **Audit-trail standards** | V5 | EU AI Act Art. 12 lifetime logging | **Strong** — literal alignment |
| 3 | **Evidence-level tagging + research gate** (graded, source→test→status) | V6, V12 | Construct-validity critique; FDA transparency/model cards | **Strong** |
| 4 | **PHI safety / zero-real-PHI / privacy-by-architecture** (local-only) | V2, V8 | HIPAA; on-prem-inference trend; local de-id ~99% [secondary] | **Strong** |
| 5 | **Human-in-the-loop / stop-first / operator-decides** | V3 | EU AI Act Art. 14 (binding 2 Aug 2026) | **Strong** |
| 6 | **Pattern surfacing without interpretation** (recurrence engine) | V12 | FDA CDS; automation-bias literature | **Strong** — engine-level librarian rule |
| 7 | **Temporal-relations clinical modeling** | V12 | TIMER (arXiv 2503.04176, npj Digital Medicine) | **Strong** — on a named 2025 research front |
| 8 | **LLM working-limits / degradation engineering** (finite context window) | V11 | Anthropic context engineering (Sept 2025) | **Strong** — engineered around the reality Anthropic later formalized |
| 9 | **DOC_DISCIPLINE** (doc-drift control, source-of-truth ownership) | V6, V5 | Eval/drift; Art. 12 | Moderate |
| 10 | **Mixture-of-Experts clinical rollout** | V12 | Med-MoE (arXiv 2404.10237, EMNLP 2024) | Moderate |
| 11 | **AI-verification methods** (research) | V6 | Evals; LLM-judge limits | Moderate |
| 12 | **Data minimization** (chat-only diary, read-only session close) | V8 | HIPAA minimization | Moderate |
| 13 | **MoE deliberation** (multi-expert decision, human-decides) | V1, V3 | Agentic/multi-agent + human oversight | Moderate |

---

## 4. Cross-repo: what you can most credibly claim (ranked)

1. **"AI output is not trusted by default" — verification-before-trust is your spine, and it's the best-evidenced 2026 direction.** (V1/V2.) testing-kits' not-trusted policy + demo-math's drift audit + codex's self-audit + health's evidence-grading all instantiate it. *Strongest, multi-source (SO survey, METR, USENIX, Veracode).*
2. **Human-gated, oversight-by-design AI — and you match binding law.** (V3.) health-prototype's librarian rule implements the FDA-CDS provider-review intent + EU Art. 14 (which even names automation bias; the 2026 FDA guidance softened the old bright line, so cite the principle); demo-math's hard-human-gate loop; never-auto-merge everywhere. *Regulation-anchored, imminent (2 Aug 2026).*
3. **"Green that means something" — mutation/metamorphic adequacy.** (V7.) demo-math + codex canary + testing-kits proof-test = Google-scale mutation logic + metamorphic testing. "Vacuous green" is a real, named problem. *Mature CS.*
4. **Auditability/traceability/drift.** (V5/V6.) Art. 12 lifetime logging + OTel agent observability; demo-math audit-history, health audit-trail, DOC_DISCIPLINE. *Binding + standardizing.*
5. **You independently run a cross-tool agent-instruction standard** that the industry converged on as **AGENTS.md** (Linux Foundation). (V10.) *Strong validation signal.*
6. **Provenance + supply-chain integrity.** (V8/V9.) codex sha256 freeze, lostsouls OpenSSF/CC0, testing-kits zero-dep. *Moderate-strong.*
7. **Context engineering done right** — codex's example-heavy kb matches the *actual* (conditional) finding of arXiv 2503.15231; health's working-limits engineering. (V11.) *Moderate; note the conditional.*
8. **Responsible-/anti-addictive-design posture** — demo-math catalogued the exact mechanisms (near-miss, LDW) the UK/EU now regulate, and *declined* them. (V13.) *Strong ethics posture — but see the gap below.*

---

## 5. What a skeptic will say (and the honest answers)

- **"These are prototypes/scaffolding, not deployed, benchmarked products."** True. This report claims *directional alignment*, not traction or validated efficacy. Don't oversell it as the latter.
- **"Some mappings are analogies."** Correct — e.g., "canary = mutation testing" and "librarian rule = FDA CDS" are *conceptual* equivalences (marked Strong/Inferred), not published certifications. They're defensible, not audited.
- **"Half your security/quality numbers come from vendors who sell the fix."** Yes — Snyk, Apiiro, Veracode, GitGuardian all have motivated framing. Lean on the **least-conflicted anchors**: USENIX (peer-reviewed), METR (RCT), CISA (gov), EU AI Act (law), and the peer-reviewed clinical/eval papers.
- **"Does responsible design actually reduce harm?"** Under-evidenced — a z-curve replicability review (PMC8057587) found only *limited* support for safer-design interventions. Claim the *posture*, not proven harm-reduction.
- **"Your docs-in-context premise was wrong."** Partly — arXiv 2503.15231 is **conditional** (unfamiliar libraries; example code carries the gain) and a **preprint**. The honest version actually *strengthens* the codex kb design (example-heavy), but state it as conditional.
- **"Self-improving audit loops are hand-wavy."** The "no-runaway / human-gated self-improvement" area (V14) is the **least standardized**; even NIST's RMF is critiqued for not grading by autonomy. This is your most speculative vector.
- **"Determinism is not fully in your control."** Right — true temp-0 nondeterminism is a server-side batch-invariance problem (Thinking Machines, 2025). Your determinism gates are good *test* hygiene, not a guarantee about model inference.
- **"How verified is this report?"** Originally snippet-verified under a 403 block — **re-pulled from primary sources on 2026-06-13** under full egress (see testing-kits `docs/RESEARCH_CLAIM_VERIFICATION_2026-06-13.md`). The load-bearing numbers read clean; the one substantive correction was the FDA CDS bright-line softening (now reflected in V3/V12). Remaining **[moving]** counts (C2PA 6,000+, AGENTS.md 60k) keep drifting — re-pull before adversarial use.

---

## 6. Sources (grouped; dates as found)

**Adoption / trust gap (V1)**
- Stack Overflow 2025 Developer Survey — https://survey.stackoverflow.co/2025/ai (2025)
- GitHub Octoverse 2025 — https://github.blog/news-insights/octoverse/ (2025-10)
- Gartner, task-specific agents forecast — https://www.gartner.com/en/newsroom/press-releases/2025-08-26-... (2025-08-26)
- Anthropic, "When AI builds itself" (The Anthropic Institute; Favaro & Clark) — https://www.anthropic.com/institute/recursive-self-improvement (2026-06-04) — Fig 3 Amdahl → "verification systems" bottleneck; the 8×/80% figures are Anthropic self-report, not an independent audit

**AI code security/quality (V2)**
- Spracklen et al., "We Have a Package for You!" USENIX Security 2025 — https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen ; arXiv:2406.10279
- Veracode 2025 GenAI Code Security Report — https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/ (2025-07-30)
- Apiiro, "4x Velocity, 10x Vulnerabilities" — https://apiiro.com/blog/ (2025-09)
- GitGuardian State of Secrets Sprawl 2025 — https://blog.gitguardian.com/the-state-of-secrets-sprawl-2025/ (2025); 2026 ed. — /the-state-of-secrets-sprawl-2026/

**Human oversight / clinical (V3, V12)**
- EU AI Act Art. 14 — https://artificialintelligenceact.eu/article/14/ (Reg. 2024/1689; applies 2026-08-02)
- FDA, AI-Enabled Device Software Functions draft guidance — https://www.federalregister.gov/documents/2025/01/07/2024-31543/... (2025-01-07)
- FDA CDS guidance / revised takeaways — https://www.cov.com/.../2026/01/5-key-takeaways-... (2026-01-06 — final guidance softened the "independent review" bright line); Cures Act §3060
- npj Digital Medicine, taxonomy of 1,016 FDA AI authorizations — https://www.nature.com/articles/s41746-025-01800-1 (2025)
- JAMA, "Automation Bias and Assistive AI" — https://pubmed.ncbi.nlm.nih.gov/38112824/ (2023); Goddard et al. JAMIA 2012 — /21685142/
- JAMIA scoping review (mixed CDS effects) — https://academic.oup.com/jamia/article/33/5/1054/8493185 (2026)
- TIMER (temporal clinical) — arXiv:2503.04176 / npj s41746-025-01965-9 (2025)
- Med-MoE — arXiv:2404.10237 (EMNLP 2024)

**Agent/LLM security (V4)**
- OWASP Top 10 for LLM Apps 2025 — https://genai.owasp.org/llmrisk/llm01-prompt-injection/ ; PDF v2025 (2024-11-14)
- NIST AI 600-1 GenAI Profile — https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf (2024-07-26)
- Policy-as-Prompt — arXiv:2509.23994 (2025)

**Auditability / evals / reproducibility (V5–V7)**
- EU AI Act Art. 12 — https://artificialintelligenceact.eu/article/12/
- OpenTelemetry GenAI semantic conventions — https://opentelemetry.io/docs/specs/semconv/gen-ai/ (2025)
- MT-Bench / LLM-as-judge — arXiv:2306.05685 (NeurIPS 2023); position bias arXiv:2406.07791 (2024); self-preference NeurIPS 2024 (Panickssery et al.)
- Construct validity — Raji et al. NeurIPS 2021; arXiv:2511.04703 (2025-11)
- Thinking Machines, "Defeating Nondeterminism in LLM Inference" — https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/ (2025-09-11)
- ML reproducibility — Gundersen & Kjensmo AAAI 2018; arXiv:2204.07610; NeurIPS reproducibility program arXiv:2003.12206
- Metamorphic testing — ACM CSUR, DOI 10.1145/3143561 (2018)
- Mutation testing at Google — Petrović et al. IEEE TSE 2021 & ICSE 2021

**Provenance / supply chain / standards (V8–V10)**
- C2PA / Content Credentials — https://contentauthenticity.org/how-it-works ; https://spec.c2pa.org/ ; CAI 5,000 (mid-2025) → 6,000+ (Jan 2026)
- EU AI Act Art. 50 — https://artificialintelligenceact.eu/article/50/ (applies 2026-08-02)
- CISA 2025 SBOM Minimum Elements — https://www.cisa.gov/resources-tools/resources/2025-minimum-elements-software-bill-materials-sbom (2025-08)
- SLSA — https://slsa.dev/ ; Sigstore (OpenSSF)
- AGENTS.md — https://agents.md/ ; Agentic AI Foundation — https://openai.com/index/agentic-ai-foundation/ (Aug 2025)

**Context engineering (V11)**
- "When LLMs Meet API Documentation…" — arXiv:2503.15231 (2025; **conditional, example-code-driven**)
- Anthropic, "Effective context engineering for AI agents" — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents (Sept 2025)
- Agentic RAG survey — arXiv:2501.09136 (2025-01)

**Behavioral/addictive-design ethics (V13)**
- Clark et al., near-miss — *Neuron* 2009 — https://pubmed.ncbi.nlm.nih.gov/19217383/
- Chase & Clark, midbrain/severity — *J. Neuroscience* 2010 — https://pubmed.ncbi.nlm.nih.gov/20445043/
- Dixon et al., losses-disguised-as-wins — *Addiction* 2010/2014 — https://pubmed.ncbi.nlm.nih.gov/24198088/
- UKGC slot design rules (autoplay ban, 2.5s, LDW ban) — Feb 2021, eff. 2021-10-31; DCMS White Paper CP 835 (2023); stake caps £5/£2 (2024)
- EU DSA Art. 25 (dark patterns, eff. 2024-02-17); Digital Fairness Act consultation (2025; proposal targeted Q4 2026) — EPRS briefing
- FTC, "Bringing Dark Patterns to Light" — https://www.ftc.gov/reports/bringing-dark-patterns-light (2022-09-15); Click-to-Cancel rule (2024) vacated (2025), ANPRM (2026)
- Responsible-design replicability — PMC8057587 (~2021)

**Governance / "no-runaway" (V14)**
- NIST AI RMF 1.0 (AI 100-1, 2023) + agentic-fitness-gap critique (2025); policy-as-code (arXiv 2509.23994)

---

*Prepared as a directional artifact, not a certification. Where a claim is load-bearing for an outside reader, re-verify the cited primary source from an unblocked network — the few [moving]/[secondary] figures are flagged inline.*

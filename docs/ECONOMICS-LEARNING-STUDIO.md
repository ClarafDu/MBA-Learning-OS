# Economics learning studio · 2026-11-03

Economics is a static second-level section at `/MBA-Learning-OS/economics/`, deployed with the existing GitHub Pages workflow. Home quick access, the Economics course page, selected course-map panel and human/XML sitemaps link to it. Concept and case URLs support direct loading, refresh and history. No source PDFs or user records are published.

## Learning design and source coverage

The four supplied `03Economics/Module 1 of ME.pdf` through `Module 4 of ME.pdf` contain 48, 106, 106 and 65 pages (325 total). References use PDF file page order, starting at 1. The site has 40 bilingual concepts and 80 authored exercises, consolidating repeated slide builds and closely related topics rather than reproducing each slide.

| Module | Concepts | Coverage |
| --- | ---: | --- |
| 1 | 8 | Economic system and decision framework; demand, supply, equilibrium, elasticity, related goods and income, shocks, market coordination |
| 2 | 12 | Costs; scale, scope and learning; opportunity/sunk cost; surplus; taxes, price caps and rent seeking; monopoly; markups; two-part tariffs; segmentation; self-selection/cannibalization; bundling; platforms |
| 3 | 12 | Game elements, dominance, Nash/coordination/mixed strategies, sequential games, credible commitment, bargaining, repeated games, Cournot, Stackelberg, Bertrand, differentiation/location, attrition |
| 4 | 8 | Adverse selection, conditional acquisition values, appraisal/screening, signals/reputation, moral hazard, principal-agent diagnosis, compensation, decision rights |

Each concept has intuition, symbols, an assumption-aware formula or framework, an original worked example, a misconception, prerequisite links, a visual model, relevant case links, two practice questions and local notes. Supplemental explanations and simplified models are study aids, not instructor answer keys or confirmed exam scope.

Twelve cases combine four connected original café scenarios with adapted slide cases (theater, airfare, entry, acquisition, used cars, inventory chips, franchising) and a platform simulation. Cards label adaptations versus simulations; many adaptations use new numbers. No unverified contemporary business-news claims are used. Open decisions are not automatically graded. Initial choice and reasoning, revised choice and reasoning, and a transfer response are saved locally.

## Models and visual design

Twelve synchronous interactive models cover supply/demand, pricing, surplus, tax incidence, two-part pricing, bundling, payoff matrices, entry trees, oligopoly comparisons, acquisition selection, incentives and location. Model assumptions and numerical text accompany all charts. Matrix best responses and entry-tree solutions can be revealed; no animation autoplays. Reset replaces the input handler, avoiding duplicated events.

After user feedback, the design uses a soft blue background, blue-gray text, a gold dollar sign and restrained amber accents. Wide screens have a sidebar; narrow and portrait tablet layouts have bottom navigation.

The pricing case passes its own demand/cost parameters into the model: café `P=50−0.5Q`, theater `P=60−0.2Q`. Other independent experiments state their own teaching parameters explicitly. Revenue/profit, conditional/ex-ante payoff, producer surplus/profit and mixed/pure equilibrium distinctions are maintained.

## Records and export

No database, login or cloud sync is added. Economics uses `mba-economics-learning-v1`, separate from Accounting and DMD; the existing interface-language preference is shared. Wrong and hinted-correct exercises enter review; later independent success remains available for optional spaced retesting. Records are not a mastery or exam prediction.

JSON includes notes, deletion markers, attempts, status and case decisions. Merge validates the Economics schema and keeps newer matching edits. Markdown exports notes and decision reasoning for reading. User text is escaped. Browser clearing, private browsing and device changes can lose records; backup guidance is visible in the UI. This release does not promise offline support.

## Verification

- 71 Node tests pass, including 8 Economics tests. All 40 numeric exercise answers independently recomputed. Source page bounds, bilingual parity, prerequisite DAGs and concept/case/model references checked.
- Economic checks include tax/welfare identities across parameter ranges, participation thresholds, revenue versus profit, pure Nash counts, entry credibility, output comparisons, acquisition conditioning, incentives and location shares.
- Browser: all 40 concepts in both languages (80 checks), two exercises and a rendered model per concept, no English teaching-body Chinese leakage or page errors.
- Browser: all 12 cases in both languages (24 checks), complete choice controls and model output.
- All 12 models opened; 42 slider boundary cases produced finite outputs and SVG paths; reset and reveal controls exercised.
- 70 representative bilingual layout checks at 320, 390, 768, 1024 and 1440 CSS pixels found no horizontal overflow. These are browser viewport checks, not physical-device certification. Final pale-blue desktop and mobile screenshots visually reviewed.
- Case input survives language switching and reload. Hinted success enters review and can be retried independently. Notes render markup literally. JSON download/clear/import restores notes, attempts and decisions; Markdown contains both notes and decisions.
- Source validation, lint, TypeScript/production build and exported-link checks pass. Lint retains only the pre-existing unused-variable warning in Accounting. Export contains 210 HTML pages and 5,007 checked internal links/assets.

Build/export commands use `GITHUB_REPOSITORY=ClarafDu/MBA-Learning-OS`. `scripts/build-economics.mjs` copies allowlisted Economics files and pre-renders bilingual concepts and cases. Notes, review, practice and continue pages are noindex.

# DMD learning studio

DMD is a second-level section at `/MBA-Learning-OS/dmd/`, deployed with the existing GitHub Pages site. It uses the Chinese mark 数 and English mark Math. Enter through the DMD knowledge-map panel; no new sidebar entry or separate standalone website is created. The human and XML sitemaps include its concept pages.

## Sources and scope

Primary materials are the files in the workspace's `05DMD` folder: Lectures 1–7, including the revised 47-page Lecture 6. Source references count PDF pages from 1. The supplied textbooks and existing reviewed course framework provide context; lecture-based concepts remain distinct from textbook extensions. Original slides, textbook files, student data and personal records are excluded from publication.

The site contains 37 bilingual concepts and 74 original questions: essential foundations, decision analysis, probability, discrete and continuous distributions, dependence and combinations, CLT, sampling, estimation, confidence intervals and hypothesis testing. Lecture 7 is marked preparation for November 5. This is coverage of major concepts, not a slide-by-slide reproduction or a confirmed exam scope. Simulation/regression/optimization textbook directions are placeholders. Optional distribution references are labeled and are not represented as completed lessons.

Each concept has prerequisite links, an original explanation, a formula with symbol definitions, an explicit-assumption visual experiment, a four-step worked example, pitfalls, two questions and a local note form. Numeric and conceptual questions use three hint levels. Hint-assisted success and wrong answers enter review; later independent success remains available for optional spaced recall. User study status is self-reported, not a mastery or exam-score prediction.

## Visual experiments

11 accessible SVG experiments cover proportions, center/spread, decision trees, Bayes, binomial probabilities, uniform probability, normal area, correlation/combined risk, CLT, confidence coverage and z-test tails. Parameters are keyboard-operable and numerical descriptions accompany the graphics. Normal shading handles two tails as separate regions. Normal and uniform comparisons use fixed scales; CLT panels share their x scale and show frequency maxima. The CLT population remains exponential; only the distribution of means changes. CI simulation explicitly assumes a normal population and known sigma; t formulas and assumptions are taught separately.

Normal notation is `N(μ,σ²)` with variance as the second parameter. The site notes differing slide conventions and the Lecture 3 p43/Lecture 6 revised p46 formula issues at the relevant concepts. The normal CDF uses a standard polynomial approximation (absolute error below 8e-8); extreme tails can round away. Binomial probabilities are exact within floating-point arithmetic.

## Videos and slide references

8 selected videos have bilingual watch guides and follow-up questions. All 10 educational reference URLs extracted from the slides are retained, including optional distribution and CLT variants. Cards distinguish videos, interactive demonstrations and the illustrated MathWorld Galton reference. Provider, language, slide provenance, companion links and verification limits are explicit per card. Official Chinese/bilingual alternatives are provided for standard deviation, Bayes, CLT and hypothesis testing where verified.

Original provider/index pages and video titles were checked on 2026-11-02. Wolfram pages may render JavaScript/cloud controls; some checks could confirm only a page response rather than complete interactive behavior. Full video playback and every caption menu were not verified. Chinese captions are not asserted unless supported by an official bilingual edition or Chinese transcript. YouTube embeds load only on an explicit user click; there is no autoplay. Local experiments do not depend on external media availability.

## Data and integration

No backend, login or database is introduced. Records use a separate `mba-dmd-learning-v1` browser storage key; the existing site's language preference is shared. Language changes preserve note text, answer drafts and current lab parameters. JSON exports support validated merge restore; newer matching edits and deletion markers are retained. Markdown is for reading. Browser clearing or private browsing can lose records. Source-file updates must preserve concept and question IDs.

`integrations/dmd/` contains the buildless source. `scripts/build-dmd.mjs` copies the reviewed assets and pre-renders both languages for each concept. Notes, review and mixed-practice utility pages are noindex. The normal GitHub build exports DMD before XML sitemap generation. No third-party runtime dependencies were added.

## Verification (2026-11-02)

- 62 Node tests passed, including bilingual parity, source page bounds, prerequisite DAGs, resource references, probability reference values, simulation moments/coverage, backup merges and review behavior.
- All 37 numerical questions independently recomputed using Python.
- Existing source validation, TypeScript/production build and export checks passed. Lint has no new errors; the pre-existing accounting unused-variable warning remains untouched.
- All 37 concept routes opened in both languages: two questions and at least one graph each, no Chinese teaching-body leakage in English and no horizontal overflow in the tested viewport.
- All 11 lab types opened; 42 slider minimum/maximum checks produced finite results/paths. Normal parameter changes update probability and persist through language switching. Two-sided p-value shading renders as two separate regions.
- Responsive iframe viewport checks at 320, 390, 768, 1024 and 1440 CSS pixels on map, lesson, videos, notes and labs: no horizontal overflow or clipped navigation. These are browser viewport checks, not physical-device certification.
- Wrong and hinted-correct answers enter review. Local notes survive reload and markup-like text remains escaped. No note text enters the URL.

Run production checks with a consistent repository environment:

```sh
npm test
npm run validate
npm run lint
GITHUB_REPOSITORY=ClarafDu/MBA-Learning-OS npm run build:github
GITHUB_REPOSITORY=ClarafDu/MBA-Learning-OS npm run check:export
```

## Dynamic demonstrations and navigation update (2026-11-02)

- All 11 experiments now have explicit play/pause, single-step, reset and speed controls; none autoplays. Hidden pages and route changes stop active timers. Remounting a lab removes its previous event handlers.
- The Galton board advances each Bernoulli step and accumulates 24 observed landings beside exact binomial probabilities. CLT playback adds five repeated sample means per step without changing the individual distribution; CI playback reveals one interval per step. Other demonstrations sweep one labeled parameter while holding the others at their current values.
- A single navigation element becomes a fixed left sidebar on wide/landscape layouts and a five-item bottom bar on narrow or tablet-portrait layouts. Safe-area padding keeps the final content clear of the bottom bar.
- Long chart descriptions are HTML figure captions with wrapping. Card/button/formula text is not truncated; select labels fit their boxes. Small screens use shorter experiment-menu labels with the full title retained in the experiment.
- 63 Node tests pass, including Bernoulli path and sweep-boundary checks. Browser checks cover play, pause, step, reset and all 11 lab types. A 60-case bilingual viewport matrix (320×800, 390×844, 768×1024, 1024×768, 1440×900, 844×390; five representative routes each) reports no horizontal overflow, clipped text or truncated selected labels. Portrait tablet uses bottom navigation; landscape desktop uses the sidebar.

### Bilingual terminology glossary — 2026-11-04

Added `/dmd/glossary/` with 60 course-linked Chinese–English terms, notation, plain explanations and memory/confusion cues. Search covers both languages, symbols and explanations; module filtering and language switching preserve the current filter. Navigation includes Terms on desktop and mobile. Narrow layouts show full term cards rather than clipped table columns. The static export includes every term and lesson link for direct loading without JavaScript.

Validation: 77 tests passed; content validation, lint on changed JavaScript, GitHub build and export checks passed (212 HTML pages, 5,219 internal links/assets). Browser checks covered search, empty results, reset, module filtering, bilingual switching, lesson navigation and 320px/1440px layouts with no horizontal overflow.

### Formula explanations — 2026-11-05

Added `/dmd/formulas/` directly after Visual labs in navigation. Reuses the 37 bilingual concept records for formulas/model expressions, notation, reasoning and conditions, four-step worked examples, pitfalls and PDF references. Search and module filters persist across interface language switching. Relevant cards link to the embedded lesson experiment. Full bilingual explanations are included in static exports.

Validation: 78 tests passed; changed-file lint, full build, content validation and export checks passed (213 HTML pages and 5,380 internal references). Browser checks passed for search, empty/reset states, module filters, English/Chinese switching, experiment deep links and 320px mobile navigation/formula wrapping.

### Formula explanations moved inside Visual labs — 2026-11-05

Removed the separate Formulas item from primary navigation. Visual labs now has two bilingual section links: interactive labs and formula explanations. Both routes select Visual labs in the main navigation; existing formula URLs remain valid. Bottom navigation returns to six items. Verified both section directions, language switching, formula search and 320px layouts; all 78 tests and export checks passed.

### Step-by-step derivations and calculation problems — 2026-11-05

Added a shared bilingual derivation dataset for all 37 formula/model entries: 175 derivation steps and 37 numerical problems with 150 worked solution steps. Explanations distinguish definitions and modeling choices from derived identities, and exact results from approximations. Includes the n−1 sample-variance correction, covariance terms, normal-density normalization, the finite-variance iid CLT characteristic-function argument with stated analytical prerequisites, normal-sample orthogonal decomposition for Student t, confidence-interval inversion and null-based proportion-test SEs.

The formula hub and each concept's Formula & symbols section use the same escaped renderer; static exports contain both languages in full. Search includes derivations and calculations. References identify NIST mean-confidence limits and NYU limit-theorem lecture notes; source PDF page references remain beside each concept.

Validation: 82 tests passed, including all-entry bilingual coverage, independent normal/t quadrature and exact binomial sums against worked results, renderer escaping, and complete static hub/lesson exports. Full GitHub build, changed-file lint, content validation and export checks passed. Browser checks confirmed 37 derivation/problem blocks, searchable content, lesson expansion, and unclipped Chinese/English advanced proofs at 320px.

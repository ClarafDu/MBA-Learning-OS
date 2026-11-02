# Accounting integration · 2026-11-02

Accounting is a real second-level static section at `/MBA-Learning-OS/accounting/`, exported in the same GitHub Pages deployment as the Next.js site. It has its own focused study interface with an explicit return link to MBA Learning OS. No iframe or cross-site redirect is required.

## Entry points and URLs

- Home quick access and the existing utility navigation.
- Financial Accounting course page and its selected course-map panel.
- Human-readable `/sitemap/`, containing all seven lectures and 70 concept links.
- Each concept: `/accounting/learn/<stable-id>/`; reload, browser back/forward, copied URLs and old accounting hash links are supported.
- `/sitemap.xml` lists real public HTML URLs, including all70 concept pages. Private-workspace utilities and hash fragments are excluded. The project-level `robots.txt` advertises that XML address; it does not control the parent domain’s root robots file.

## Content and records

The reviewed source snapshot is in `integrations/accounting/`, with repository, exact source commit and allowlisted files in `origin.json`. Original slides and private records are never synchronized. The existing accounting storage key is preserved; the standalone and embedded versions share records in the same browser when hosted on the same HTTPS origin. MBA workspace records use their original separate storage.

Build-time transformations adapt URL routing, asset paths, canonical URLs, return navigation and the service-worker cache namespace. Learning content and the note-submit privacy fix remain intact. Service-worker cleanup is restricted to this integration’s own cache prefix, preserving standalone accounting caches.

The exporter pre-renders Chinese and English explanations and examples for crawlers and no-JavaScript reading. Interactive practice and local notes use the same accounting app. A database is not introduced.

To refresh a reviewed source snapshot, commit the upstream site first, run `npm run sync:accounting -- /absolute/path/to/accounting-learning`, then run all checks. Newly introduced upstream source files require review and addition to the explicit allowlist before synchronization. The original site remains independently deployable.

## Verification

- Existing and new Node tests, source validation, lint and production build.
- Export checking: 106 HTML files, 3376 links/assets before the final XML-link addition; all resolved under the repository base path.
- All70 pre-rendered concept pages opened with JavaScript disabled: one main element, full Chinese explanations and an English section on every page. Literal dollar amounts are retained during template insertion.
- Browser flow: home → accounting → concept → reload → English → local note → map → browser back → return to MBA.
- Human sitemap exposes70 concept links. XML parses without errors and lists95 public URLs with no hashes.
- Tested390px mobile layout without horizontal overflow, same-origin record reuse, offline deep links and non-interference between standalone/integrated caches.

Search-engine indexing is not guaranteed by providing a sitemap; the XML can be submitted using its full public URL.

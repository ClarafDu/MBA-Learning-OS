# Calendar loading optimization

Scope: preserve the existing GitHub Pages deployment, course content, layout and private workspace behavior.

- Keep the original class artwork. Use a 6,514-byte WebP for the small navigation logo, a 2,881-byte favicon and a separate touch icon instead of requesting the 2,256,931-byte original for both display and favicon.
- Request the public search module on opening search (including the keyboard shortcut), with loading, retry and local-private-note filtering retained. Full public topic/case text remains searchable after loading.
- Mount course, campus and tools panels on their first visit. Keep visited panels mounted so course filters, calendar mode and in-progress interactions survive switching tabs. Preserve section hash entry points.
- Disable automatic route prefetch in the shell and calendar/task link lists. Actual link navigation remains available.

Verification:

- `npm run check`: 86 tests, public-content validation, lint, TypeScript/static build and export checks pass. One pre-existing unused-variable warning in the standalone accounting integration remains unchanged.
- Desktop 1440×1000 and mobile 390×844: no document-level horizontal overflow, no JavaScript page errors. The month grid retains its existing internal horizontal-scroll design.
- Browser checks: all four tabs open, calendar mode survives switching away and back, `#all-courses` opens the proper tab on direct navigation, Cmd+K opens search and a confidence query returns seven results.
- Initial local preview: non-active course/campus panels contain only their anchor; tools has no child content. Logo/favicon requests use the small assets. Screenshots inspected for both screen sizes.

Network timings vary across hosts, cache states and connections. Asset-size reductions are verifiable; local-preview timings are not presented as a guaranteed production speedup.

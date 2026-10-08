# Archived Marp presentation

Snapshot of the Marp inputs before the Slidev migration on October 4, 2026. This directory is excluded from Jekyll publishing and is not used by active builds.

The source deck contains 26 slides. `projects/presentations/` preserves its Markdown, shared theme, six images, generated HTML, and PDF baseline (when export succeeds). The root package.json and package-lock.json preserve the original site's dependency state, including Marp CLI. `.marprc.yml` and `.vscode/` preserve the build and editor configuration.

To reproduce it, work from this archive directory with Node 22.14 (the runtime used for the snapshot):

```sh
npm ci
npm run slides
npx marp projects/presentations/presentation.md --pdf --allow-local-files -o projects/presentations/presentation.pdf
```

PDF export requires a supported browser such as Chrome. The theme loads DM Mono from Google Fonts. The archived package contains historical site scripts; use only the slide commands here.

The active deck is now `../../projects/presentations/presentation.md`, with its Slidev layout and styles next to it. Existing SVG diagrams were retained to preserve the presentation content.

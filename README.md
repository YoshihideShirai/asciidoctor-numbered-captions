# asciidoctor-numbered-captions

[日本語版はこちら](./README.ja.md)

An Asciidoctor.js extension plugin that includes chapter numbers in figure, table, and equation captions.

Examples:

- Figure `1-1`
- Table `2-3`
- Equation `4-2`

## Installation

Install directly from the GitHub repository:

```bash
npm install YoshihideShirai/asciidoctor-numbered-captions
```

## Usage

```js
const asciidoctor = require('asciidoctor')()
const numberedCaptions = require('asciidoctor-numbered-captions')

const registry = asciidoctor.Extensions.create()
numberedCaptions.register(registry)

const html = asciidoctor.convert(
  `= Document

== Chapter A

.Sample Figure
image::sample.png[]
`,
  {
    extension_registry: registry,
    attributes: { sectnums: '', stem: 'latexmath' }
  }
)
```

## Default targets

- `image` → `Figure`
- `table` → `Table`
- `stem` → `Equation`

## Options

`register(registry, options)`

Header attribute example (Asciidoc):

```adoc
= Document
:numbered-captions-chapter-level: 1
:figure-caption: Figure
:table-caption: Table
:equation-caption: Equation
```

Priority: `register(registry, options)` > Asciidoc header attributes > defaults.

This extension uses Asciidoctor standard caption attributes:

- image: `:figure-caption:`
- table: `:table-caption:`
- stem: `:equation-caption:` (or `:stem-caption:`)

By default, this extension stays inactive and Asciidoctor standard numbering is used. The extension behavior is enabled when either header attributes or JS options are provided.

- `chapterLevel` (default: `1`)
  - Section level treated as chapter (`1` = `==`, `2` = `===`, ...).
- `labels`
  - Override caption labels.

- `targets` (default: `image/table/stem`)
  - `Array<string>`: use only selected built-in targets.
  - `Object`: enable/disable built-ins and define custom targets.
  - Unknown targets are ignored by default. Set `targets.onUnknown: 'error'` to throw an explicit error.

Custom target example:

```js
numberedCaptions.register(registry, {
  chapterLevel: 1,
  labels: {
    image: 'Figure',
    listing: 'Listing'
  },
  targets: {
    image: true,
    table: true,
    stem: true,
    listing: {
      context: 'listing',
      labelAttribute: 'listing-caption',
      counter: 'listing'
    },
    onUnknown: 'error'
  }
})
```

Example:

```js
numberedCaptions.register(registry, {
  chapterLevel: 1,
  labels: {
    image: 'Figure',
    table: 'Table',
    stem: 'Equation'
  }
})
```

With Asciidoc nested sections and `chapterLevel: 2`, captions are numbered by each `===` section.

If no section exists at the configured `chapterLevel`, captions are treated as chapter `1` (for example: preamble-only content or documents without chapter headings).

## Development

```bash
npm run lint
npm run format:check
npm test
```

To apply formatting changes:

```bash
npm run format
```

## CI/CD

This repository uses GitHub Actions.

- **CI** (`.github/workflows/ci.yml`)
  - Runs on pushes to `main` and pull requests.
  - Verifies `lint`, `format:check`, and `test` on Node.js 20 and 24.
- **Release** (`.github/workflows/release.yml`)
  - Runs when a tag like `v1.2.3` is pushed.
  - Re-runs quality checks and creates a GitHub Release.

- **Pages** (`.github/workflows/pages.yml`)
  - Runs on pushes to `main` (and manual dispatch).
  - Executes `npm ci` and `npm run build:demo`.
  - Publishes `docs/` to GitHub Pages using `configure-pages` / `upload-pages-artifact` / `deploy-pages`.

The release uploads the `npm pack` tarball as a release asset.

## GitHub Pages setup

After adding `.github/workflows/pages.yml`, switch the repository Pages source to **GitHub Actions**:

1. Open the repository on GitHub.
2. Go to **Settings** → **Pages**.
3. In **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually) and confirm deployment succeeds in the **Actions** tab.

## Lighthouse quick-check points

When validating demo updates locally (especially `docs/index.html`), run a quick Lighthouse pass and verify:

- **Mobile layout stability**: no overlapping/overflow on narrow screens; the page switches from wide-screen 2-column to stacked layout cleanly.
- **Interaction latency**: typing in source/options/header textareas remains responsive (rendering is debounced at ~300ms to reduce heavy re-renders).
- **CDN failure UX**: when external CDN assets fail, a fallback status message is visible and known preset previews remain readable.

## Demo verification checklist

After deployment, verify the demo page with these points:

- The **Share** button generates a URL that includes the current Asciidoc source + plugin option subset (`chapterLevel`, `labels`), so opening the link reproduces the same demo state.
- Preset **Default**: verifies baseline chapter numbering (`chapterLevel: 1`) for figure/table/equation captions.
- Preset **日本語ラベル**: verifies label priority (`register(..., options).labels` overrides Asciidoc header caption attributes).
- Preset **chapterLevel=2**: verifies chapter boundaries switch to `===` sections and numbering resets at each level-3 section.
- Figure, table, and equation captions are numbered with chapter prefix (for example `Figure 1-1`, `Table 1-1`, `Equation 1-1`).
- Numbering resets when chapter changes.
- Changing `chapterLevel` (for example from `1` to `2`) updates the chapter unit used for caption numbering.
- Content outside configured chapter sections is treated as chapter `1` as expected.
- **Error panel / invalid Asciidoc**: enter intentionally broken Asciidoc (for example, an invalid block macro syntax) and confirm the error message is displayed in the on-screen error panel.
- **Error panel / invalid `chapterLevel`**: set `options` JSON to `{"chapterLevel": 0}` (or a non-integer such as `"abc"`) and confirm `Invalid chapterLevel: must be an integer >= 1.` is shown.
- Toggle **Debug表示ON/OFF** and confirm the debug section shows current effective settings as JSON (`chapterLevel`, `labels`, `headerAttributes`).

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

The release uploads the `npm pack` tarball as a release asset.

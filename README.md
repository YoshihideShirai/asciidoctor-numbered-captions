# asciidoctor-numbered-captions

[日本語版はこちら](./README.ja.md)

An Asciidoctor.js extension plugin that includes chapter numbers in figure, table, and equation captions.

Examples:

- Figure `1-1`
- Table `2-3`
- Equation `4-2`

## Installation

```bash
npm install asciidoctor-numbered-captions
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
:numbered-captions-label-image: Figure
:numbered-captions-label-table: Table
:numbered-captions-label-stem: Equation
```

Priority: `register(registry, options)` > Asciidoc header attributes > defaults.

By default, this extension stays inactive and Asciidoctor standard numbering is used. The extension behavior is enabled when either header attributes or JS options are provided.

- `chapterLevel` (default: `1`)
  - Section level treated as chapter.
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

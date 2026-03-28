# asciidoctor-numbered-captions

[English version](./README.md)

Asciidoctor.js の拡張プラグインです。図・表・式のキャプション番号にチャプター番号を含めます。

例:

- Figure `1-1`
- Table `2-3`
- Equation `4-2`

## インストール

```bash
npm install asciidoctor-numbered-captions
```

## 使い方

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

## デフォルト対象

- `image` → `Figure`
- `table` → `Table`
- `stem` → `Equation`

## オプション

`register(registry, options)`

ヘッダー属性での設定例（Asciidoc）:

```adoc
= Document
:numbered-captions-chapter-level: 1
:numbered-captions-label-image: 図
:numbered-captions-label-table: 表
:numbered-captions-label-stem: 式
```

優先順位: `register(registry, options)` > Asciidocヘッダー属性 > デフォルト値。

- `chapterLevel` (default: `1`)
  - どのセクションレベルをチャプターとして扱うか。
- `labels`
  - ラベルの上書き。

例:

```js
numberedCaptions.register(registry, {
  chapterLevel: 1,
  labels: {
    image: '図',
    table: '表',
    stem: '式'
  }
})
```

## 開発

```bash
npm run lint
npm run format:check
npm test
```

フォーマットを適用する場合:

```bash
npm run format
```

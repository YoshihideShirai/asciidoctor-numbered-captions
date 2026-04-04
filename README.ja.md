# asciidoctor-numbered-captions

[English version](./README.md)

Asciidoctor.js の拡張プラグインです。図・表・式のキャプション番号にチャプター番号を含めます。

例:

- Figure `1-1`
- Table `2-3`
- Equation `4-2`

## インストール

GitHub リポジトリから直接インストールします。

```bash
npm install YoshihideShirai/asciidoctor-numbered-captions
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
:figure-caption: 図
:table-caption: 表
:equation-caption: 式
```

優先順位: `register(registry, options)` > Asciidocヘッダー属性 > デフォルト値。

この拡張は Asciidoctor 標準のキャプション属性を参照します。

- image: `:figure-caption:`
- table: `:table-caption:`
- stem: `:equation-caption:`（または `:stem-caption:`）

デフォルトではこの拡張は無効のままで、Asciidoctor標準のナンバリングが使われます。Asciidocヘッダー属性またはJS optionsを指定した場合にのみ、この拡張の挙動が有効になります。

- `chapterLevel` (default: `1`)
  - どのセクションレベルをチャプターとして扱うか（`1` = `==`, `2` = `===`, ...）。
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

Asciidoc の入れ子セクションで `chapterLevel: 2` を指定すると、`===` ごとに番号が振られます。

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

## CI/CD

このリポジトリでは GitHub Actions を利用しています。

- **CI** (`.github/workflows/ci.yml`)
  - `main` への push と pull request で実行されます。
  - Node.js 20 / 24 で `lint`、`format:check`、`test` を検証します。
- **Release** (`.github/workflows/release.yml`)
  - `v1.2.3` のようなタグ push をトリガーに実行されます。
  - 品質チェックを再実行したうえで GitHub Release を作成します。

リリースには `npm pack` で生成した tarball をアセットとして添付します。

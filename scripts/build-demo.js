const fs = require('node:fs')
const path = require('node:path')
const asciidoctor = require('asciidoctor')()
const prettier = require('prettier')
const NumberedCaptions = require('../src')

const PRESET_CONFIGS = [
  {
    id: 'default',
    name: 'Default',
    description:
      'Basic chapter-based numbering with the plugin defaults used from JS options.',
    source: `= Default preset demo

== Chapter A

.Sample figure in chapter A
image::https://dummyimage.com/420x120/f3f4f6/111827.png&text=Figure+A[Demo image,420,120]

.Sample table in chapter A
|===
|Key |Value

|alpha |1
|beta |2
|===

.Sample equation in chapter A
[stem]
++++
a^2 + b^2 = c^2
++++

== Chapter B

.Sample figure in chapter B
image::https://dummyimage.com/420x120/e0f2fe/111827.png&text=Figure+B[Demo image,420,120]

.Sample table in chapter B
|===
|Key |Value

|gamma |3
|delta |4
|===

.Sample equation in chapter B
[stem]
++++
\\int_0^1 x^2 dx = 1/3
++++`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath'
    },
    options: {
      chapterLevel: 1,
      labels: {
        image: 'Figure',
        table: 'Table',
        stem: 'Equation'
      }
    }
  },
  {
    id: 'ja-labels',
    name: '日本語ラベル',
    description:
      'Shows label priority: JS options override header caption labels for image/table/stem.',
    source: `= 日本語ラベルプリセット

== 第1章

.図のサンプル
image::https://dummyimage.com/420x120/f3f4f6/111827.png&text=図+A[デモ画像,420,120]

.表のサンプル
|===
|項目 |値

|alpha |1
|beta |2
|===

.式のサンプル
[stem]
++++
a^2 + b^2 = c^2
++++

== 第2章

.図のサンプル
image::https://dummyimage.com/420x120/e0f2fe/111827.png&text=図+B[デモ画像,420,120]

.表のサンプル
|===
|項目 |値

|gamma |3
|delta |4
|===

.式のサンプル
[stem]
++++
\\int_0^1 x^2 dx = 1/3
++++`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath',
      'figure-caption': 'ヘッダー図',
      'table-caption': 'ヘッダー表',
      'equation-caption': 'ヘッダー式'
    },
    options: {
      chapterLevel: 1,
      labels: {
        image: '図',
        table: '表',
        stem: '式'
      }
    }
  },
  {
    id: 'chapter-level-2',
    name: 'chapterLevel=2',
    description:
      'Uses level-3 sections as chapter boundaries so numbering resets per === section.',
    source: `= chapterLevel=2 preset demo

== Part A

=== Unit A-1

.Sample figure in unit A-1
image::https://dummyimage.com/420x120/f3f4f6/111827.png&text=Unit+A-1[Demo image,420,120]

.Sample table in unit A-1
|===
|Key |Value

|alpha |1
|beta |2
|===

=== Unit A-2

.Sample equation in unit A-2
[stem]
++++
a^2 + b^2 = c^2
++++

== Part B

=== Unit B-1

.Sample figure in unit B-1
image::https://dummyimage.com/420x120/e0f2fe/111827.png&text=Unit+B-1[Demo image,420,120]

.Sample table in unit B-1
|===
|Key |Value

|gamma |3
|delta |4
|===`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath',
      'numbered-captions-chapter-level': '1'
    },
    options: {
      chapterLevel: 2,
      labels: {
        image: 'Figure',
        table: 'Table',
        stem: 'Equation'
      }
    }
  },
  {
    id: 'preamble-and-reset',
    name: 'Preamble + reset',
    description:
      'Shows preamble content treated as chapter 1, then per-target counters continuing/resetting across later chapters.',
    source: `= Preamble and reset demo

.Preamble figure before any chapter
image::https://dummyimage.com/420x120/fef3c7/111827.png&text=Preamble[Demo image,420,120]

== Chapter One

.First figure in chapter one
image::https://dummyimage.com/420x120/dcfce7/111827.png&text=Chapter+1+Figure+1[Demo image,420,120]

.Second figure in chapter one
image::https://dummyimage.com/420x120/bbf7d0/111827.png&text=Chapter+1+Figure+2[Demo image,420,120]

.Table in chapter one
|===
|Metric |Value

|requests |128
|errors |0
|===

== Chapter Two

.Equation in chapter two
[stem]
+++
f(x) = x^3 - 2x + 1
+++

.Figure in chapter two
image::https://dummyimage.com/420x120/fee2e2/111827.png&text=Chapter+2+Figure+1[Demo image,420,120]

.Table in chapter two
|===
|Metric |Value

|requests |256
|errors |3
|===`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath',
      'numbered-captions-chapter-level': '1'
    },
    options: {
      labels: {
        image: 'Figure',
        table: 'Table',
        stem: 'Equation'
      }
    }
  },
  {
    id: 'header-attributes-only',
    name: 'Header attrs only',
    description:
      'Enables chaptered numbering using only Asciidoc header attributes, including standard caption label attributes.',
    source: `= Header attributes only demo
:numbered-captions-chapter-level: 1
:figure-caption: Diagram
:table-caption: Matrix
:equation-caption: Formula

== Overview

.Architecture sketch
image::https://dummyimage.com/420x120/e0e7ff/111827.png&text=Architecture[Demo image,420,120]

.Input mapping
|===
|Source |Destination

|queue |worker
|worker |store
|===

.Scoring rule
[stem]
+++
score = \\frac{passed}{total}
+++

== Details

.Sequence sketch
image::https://dummyimage.com/420x120/fce7f3/111827.png&text=Sequence[Demo image,420,120]

.Retry matrix
|===
|Attempt |Delay

|1 |0s
|2 |5s
|===`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath',
      'numbered-captions-chapter-level': '1',
      'figure-caption': 'Diagram',
      'table-caption': 'Matrix',
      'equation-caption': 'Formula'
    },
    options: {}
  },
  {
    id: 'custom-listing-target',
    name: 'Custom listing target',
    description:
      'Demonstrates extending the plugin to number source listings alongside the built-in figure/table/stem targets.',
    source: `= Custom listing target demo

== Pipeline

.Worker bootstrap
[source,javascript]
----
function startWorker(queue) {
  return queue.connect({ retry: 3 })
}
----

.Pipeline figure
image::https://dummyimage.com/420x120/dbeafe/111827.png&text=Pipeline[Demo image,420,120]

.Configuration table
|===
|Key |Value

|retry |3
|timeout |5000
|===

== Verification

.Assertion example
[source,javascript]
----
assert.equal(result.status, 'ok')
----

.Expectation formula
[stem]
+++
latency_{avg} < 100ms
+++`,
    headerAttributes: {
      sectnums: '',
      stem: 'latexmath',
      'listing-caption': 'Listing'
    },
    options: {
      chapterLevel: 1,
      labels: {
        image: 'Figure',
        table: 'Table',
        stem: 'Equation',
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
        }
      }
    }
  }
]

function toAsciidoctorAttributes(headerAttributes = {}) {
  return Object.fromEntries(
    Object.entries(headerAttributes).map(([name, value]) => [
      name,
      value === '' ? '' : String(value)
    ])
  )
}

function toHeaderAttributesBlock(headerAttributes = {}) {
  const entries = Object.entries(headerAttributes)
  if (!entries.length) {
    return '(none)'
  }

  return entries
    .map(([name, value]) => {
      if (value === '') {
        return `:${name}:`
      }
      return `:${name}: ${value}`
    })
    .join('\n')
}

function renderPreset(preset) {
  const convertOptions = {
    safe: 'safe',
    backend: 'html5',
    attributes: toAsciidoctorAttributes(preset.headerAttributes)
  }

  const defaultHtml = asciidoctor.convert(preset.source, convertOptions)

  const registry = asciidoctor.Extensions.create()
  NumberedCaptions.register(registry, preset.options)

  const pluginHtml = asciidoctor.convert(preset.source, {
    ...convertOptions,
    extension_registry: registry
  })

  return {
    ...preset,
    headerAttributesText: toHeaderAttributesBlock(preset.headerAttributes),
    optionsText: JSON.stringify(preset.options, null, 2),
    defaultHtml,
    pluginHtml
  }
}

const presets = PRESET_CONFIGS.map(renderPreset)

const outDir = path.join(process.cwd(), 'docs')
const vendorDir = path.join(outDir, 'vendor')
const indexPath = path.join(outDir, 'index.html')
const presetsPath = path.join(outDir, 'demo-presets.js')
const asciidoctorBrowserPath = path.join(
  process.cwd(),
  'node_modules',
  '@asciidoctor',
  'core',
  'dist',
  'browser',
  'asciidoctor.js'
)
const asciidoctorVendorPath = path.join(vendorDir, 'asciidoctor.js')
const asciidoctorStylesheetPath = path.join(
  process.cwd(),
  'node_modules',
  '@asciidoctor',
  'core',
  'dist',
  'css',
  'asciidoctor.css'
)
const asciidoctorStylesheetVendorPath = path.join(vendorDir, 'asciidoctor.css')

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(vendorDir, { recursive: true })

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>asciidoctor-numbered-captions demo</title>
    <link rel="stylesheet" href="./vendor/asciidoctor.css" />
    <style>
      :root {
        color-scheme: light;
      }

      body {
        font-family: system-ui, sans-serif;
        margin: 2rem auto;
        max-width: 1400px;
        line-height: 1.6;
        padding: 0 1rem;
        color: #111827;
      }

      .meta {
        color: #4b5563;
        font-size: 0.95rem;
      }

      .control-panel {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .control-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .control-row select {
        min-width: 220px;
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        font: inherit;
      }

      .control-row button {
        padding: 0.4rem 0.7rem;
        border-radius: 6px;
        border: 1px solid #9ca3af;
        background: #f9fafb;
        font: inherit;
        cursor: pointer;
      }

      .preset-description {
        margin: 0.65rem 0 0;
        color: #374151;
      }

      .share-status {
        margin: 0.45rem 0 0;
        font-size: 0.9rem;
        color: #374151;
      }

      .render-status {
        margin: 0.35rem 0 0;
        font-size: 0.9rem;
        color: #374151;
      }

      .math-status {
        margin: 0.35rem 0 0;
        font-size: 0.9rem;
        color: #374151;
      }

      .error-status {
        margin: 0.35rem 0 0;
        font-size: 0.9rem;
        color: #b91c1c;
        white-space: pre-wrap;
      }

      .inputs-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .input-panel {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 0.6rem;
        background: #f9fafb;
      }

      .input-panel h3 {
        margin: 0 0 0.4rem;
        font-size: 0.95rem;
      }

      .input-panel textarea {
        width: 100%;
        min-height: 190px;
        resize: vertical;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0.5rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.85rem;
        background: #ffffff;
      }

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
        align-items: start;
      }

      .preview-panel {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        background: #ffffff;
        min-width: 0;
      }

      .preview-panel h2 {
        margin: 0;
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      }

      .preview-body {
        padding: 1rem;
        overflow-x: auto;
      }


      @media (max-width: 1080px) {
        .inputs-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 960px) {
        .preview-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <h1>asciidoctor-numbered-captions demo</h1>
    <p class="meta">
      Generated by <code>npm run build:demo</code>. Select a preset to apply Asciidoc source,
      plugin options, and header attributes together, then re-render both outputs instantly.
    </p>

    <section class="control-panel">
      <div class="control-row">
        <label for="preset-select"><strong>Preset</strong></label>
        <select id="preset-select" aria-label="Preset selector"></select>
        <button id="reset-button" type="button">Reset</button>
        <button id="share-button" type="button">Share</button>
      </div>
      <p id="share-status" class="share-status"></p>
      <p id="render-status" class="render-status"></p>
      <p id="math-status" class="math-status"></p>
      <p id="error-status" class="error-status"></p>
      <p id="preset-description" class="preset-description"></p>
      <div class="inputs-grid">
        <section class="input-panel">
          <h3>Asciidoc source</h3>
          <textarea id="source-view"></textarea>
        </section>
        <section class="input-panel">
          <h3>Plugin options</h3>
          <textarea id="options-view"></textarea>
        </section>
        <section class="input-panel">
          <h3>Header attributes</h3>
          <textarea id="header-view"></textarea>
        </section>
      </div>
    </section>

    <div class="preview-grid">
      <section class="preview-panel">
        <h2>Default Asciidoctor output</h2>
        <div id="default-preview" class="preview-body"></div>
      </section>
      <section class="preview-panel">
        <h2>With asciidoctor-numbered-captions</h2>
        <div id="plugin-preview" class="preview-body"></div>
      </section>
    </div>

    <script src="./demo-presets.js"></script>
    <script type="module">
      import Asciidoctor from './vendor/asciidoctor.js'

      window.MathJax = {
        tex: {
          displayMath: [['\\\\[', '\\\\]']],
          inlineMath: [['\\\\(', '\\\\)']]
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        }
      }

      const demoPresets = window.demoPresets || []

      const presetSelect = document.getElementById('preset-select')
      const presetDescription = document.getElementById('preset-description')
      const sourceView = document.getElementById('source-view')
      const optionsView = document.getElementById('options-view')
      const headerView = document.getElementById('header-view')
      const resetButton = document.getElementById('reset-button')
      const shareButton = document.getElementById('share-button')
      const shareStatus = document.getElementById('share-status')
      const renderStatus = document.getElementById('render-status')
      const mathStatus = document.getElementById('math-status')
      const errorStatus = document.getElementById('error-status')
      const defaultPreview = document.getElementById('default-preview')
      const pluginPreview = document.getElementById('plugin-preview')

      const URL_SIZE_LIMIT = 5000
      const RENDER_DEBOUNCE_MS = 300
      let mathJaxReady = false
      let renderTimer = null
      const asciidoctor = Asciidoctor()

      const DEFAULT_LABELS = {
        image: 'Figure',
        table: 'Table',
        stem: 'Equation'
      }

      const ATTRIBUTE_NAMES = {
        chapterLevel: 'numbered-captions-chapter-level',
        numbering: 'numbered-captions-numbering',
        standardLabels: {
          image: 'figure-caption',
          table: 'table-caption',
          stem: ['equation-caption', 'stem-caption']
        }
      }

      const NUMBERING_MODES = {
        chaptered: 'chaptered',
        standard: 'standard'
      }

      const NUMBERING_MODE_ALIASES = {
        plugin: NUMBERING_MODES.chaptered,
        asciidoctor: NUMBERING_MODES.standard
      }

      const RESERVED_TARGET_OPTIONS = new Set(['onUnknown'])

      function firstDefined(...values) {
        return values.find((value) => value !== undefined && value !== null)
      }

      function toValidChapterLevel(value, fallback = 1) {
        const parsed = Number.parseInt(String(value), 10)
        if (!Number.isInteger(parsed) || parsed < 1) {
          return fallback
        }
        return parsed
      }

      function normalizeNumberingMode(value) {
        if (value === undefined || value === null) {
          return undefined
        }

        const normalized = String(value).trim().toLowerCase()
        if (normalized === NUMBERING_MODES.chaptered) {
          return NUMBERING_MODES.chaptered
        }
        if (normalized === NUMBERING_MODES.standard) {
          return NUMBERING_MODES.standard
        }
        return NUMBERING_MODE_ALIASES[normalized]
      }

      function firstDocumentAttribute(document, names = []) {
        for (const name of names) {
          const value = document.getAttribute(name)
          if (value !== undefined && value !== null) {
            return value
          }
        }
        return undefined
      }

      function hasAnyHeaderAttribute(document) {
        return [ATTRIBUTE_NAMES.chapterLevel].some(
          (name) => document.getAttribute(name) !== undefined
        )
      }

      function hasAnyOptions(options) {
        return (
          options.chapterLevel !== undefined ||
          options.targets !== undefined ||
          options.labels?.image !== undefined ||
          options.labels?.table !== undefined ||
          options.labels?.stem !== undefined
        )
      }

      function resolveChapterSection(block, chapterLevel) {
        let node = block
        while (node) {
          if (
            node.getContext?.() === 'section' &&
            node.getLevel?.() === chapterLevel
          ) {
            return node
          }
          node = node.getParent?.()
        }
        return null
      }

      function resolveEffectiveChapter(chapterSection, chapterNumbers) {
        if (!chapterSection) {
          return 1
        }
        return chapterNumbers.get(chapterSection)
      }

      function resolveChapterNumber(chapterSection, fallbackNumber) {
        if (!chapterSection) {
          return '1'
        }

        const numerals = []
        let node = chapterSection
        while (node && node.getContext?.() === 'section') {
          const numeral = node.getNumeral?.()
          if (typeof numeral === 'string' && numeral.length > 0) {
            numerals.push(numeral)
          }
          node = node.getParent?.()
        }

        if (numerals.length > 0) {
          return numerals.reverse().join('.')
        }

        return String(fallbackNumber)
      }

      function createContextMatcher(context, titled = true) {
        return (node) => {
          if (node.getContext?.() !== context) {
            return false
          }
          return titled ? Boolean(node.getTitle?.()) : true
        }
      }

      function applyCaption(block, label, numbering) {
        block.setCaption(\`\${label} \${numbering}. \`)
      }

      function applyTitle(block, label, numbering) {
        block.setTitle(
          \`\${label} \${numbering}. \${block.getTitle() ?? ''}\`.trim()
        )
      }

      function normalizeLabelAttributes(value, fallback = []) {
        if (value === undefined) {
          return fallback
        }
        if (value === null) {
          return []
        }
        return Array.isArray(value) ? value : [value]
      }

      function defaultLabelFor(name) {
        if (DEFAULT_LABELS[name]) {
          return DEFAULT_LABELS[name]
        }
        return name.charAt(0).toUpperCase() + name.slice(1)
      }

      const DEFAULT_TARGETS = {
        image: {
          counterKey: 'image',
          match: createContextMatcher('image', true),
          labelAttributeNames: [ATTRIBUTE_NAMES.standardLabels.image],
          defaultLabel: DEFAULT_LABELS.image,
          apply: applyCaption
        },
        table: {
          counterKey: 'table',
          match: createContextMatcher('table', true),
          labelAttributeNames: [ATTRIBUTE_NAMES.standardLabels.table],
          defaultLabel: DEFAULT_LABELS.table,
          apply: applyCaption
        },
        stem: {
          counterKey: 'stem',
          match: createContextMatcher('stem', true),
          labelAttributeNames: ATTRIBUTE_NAMES.standardLabels.stem,
          defaultLabel: DEFAULT_LABELS.stem,
          apply: applyTitle
        }
      }

      function buildTargetDefinition(name, definition, baseDefinition) {
        const merged = {
          ...(baseDefinition ?? {}),
          ...(definition ?? {})
        }

        const match =
          merged.match ??
          (merged.context
            ? createContextMatcher(merged.context, merged.titled !== false)
            : null)

        if (typeof match !== 'function') {
          return null
        }

        const apply =
          typeof merged.apply === 'function'
            ? merged.apply
            : merged.mode === 'title'
              ? applyTitle
              : applyCaption

        return {
          counterKey:
            merged.counterKey ??
            merged.counter ??
            baseDefinition?.counterKey ??
            name,
          match,
          labelAttributeNames: normalizeLabelAttributes(
            firstDefined(merged.labelAttributeNames, merged.labelAttribute),
            baseDefinition?.labelAttributeNames ?? []
          ),
          defaultLabel:
            merged.defaultLabel ?? merged.label ?? defaultLabelFor(name),
          apply
        }
      }

      function resolveTargets(optionTargets) {
        if (optionTargets === undefined) {
          return { ...DEFAULT_TARGETS }
        }

        if (Array.isArray(optionTargets)) {
          const targets = {}
          for (const name of optionTargets) {
            if (DEFAULT_TARGETS[name]) {
              targets[name] = { ...DEFAULT_TARGETS[name] }
            }
          }
          return targets
        }

        if (optionTargets && typeof optionTargets === 'object') {
          const targets = {}
          const onUnknown = optionTargets.onUnknown

          for (const [name, definition] of Object.entries(optionTargets)) {
            if (RESERVED_TARGET_OPTIONS.has(name)) {
              continue
            }

            const baseDefinition = DEFAULT_TARGETS[name]

            if (definition === false || definition === null) {
              continue
            }

            if (definition === true) {
              if (baseDefinition) {
                targets[name] = { ...baseDefinition }
                continue
              }
              if (onUnknown === 'error') {
                throw new Error(\`Unknown target: \${name}\`)
              }
              continue
            }

            if (!definition || typeof definition !== 'object') {
              if (onUnknown === 'error') {
                throw new Error(\`Invalid target definition: \${name}\`)
              }
              continue
            }

            const resolvedDefinition = buildTargetDefinition(
              name,
              definition,
              baseDefinition
            )

            if (resolvedDefinition) {
              targets[name] = resolvedDefinition
            } else if (onUnknown === 'error') {
              throw new Error(\`Unknown target: \${name}\`)
            }
          }

          return targets
        }

        return { ...DEFAULT_TARGETS }
      }

      function registerNumberedCaptions(registry, options = {}) {
        registry.treeProcessor(function () {
          this.process(function (document) {
            const numberingMode = firstDefined(
              normalizeNumberingMode(
                document.getAttribute(ATTRIBUTE_NAMES.numbering)
              ),
              normalizeNumberingMode(options.defaultNumbering)
            )

            if (numberingMode === NUMBERING_MODES.standard) {
              return document
            }

            const pluginEnabled =
              numberingMode === NUMBERING_MODES.chaptered ||
              hasAnyOptions(options) ||
              hasAnyHeaderAttribute(document)

            if (!pluginEnabled) {
              return document
            }

            const chapterLevel = toValidChapterLevel(
              firstDefined(
                options.chapterLevel,
                document.getAttribute(ATTRIBUTE_NAMES.chapterLevel),
                1
              ),
              1
            )

            const targets = resolveTargets(options.targets)
            const targetEntries = Object.entries(targets)
            const labels = {}

            for (const [name, target] of targetEntries) {
              labels[name] =
                firstDefined(
                  options.labels?.[name],
                  firstDocumentAttribute(document, target.labelAttributeNames),
                  target.defaultLabel
                ) ?? target.defaultLabel
            }

            const chapterNumbers = new Map()
            let chapterIndex = 0
            const countersByChapter = new Map()
            const targetBlocks = document.findBy((node) =>
              targetEntries.some(([, target]) => target.match(node))
            )

            for (const block of targetBlocks) {
              const targetEntry = targetEntries.find(([, target]) =>
                target.match(block)
              )
              if (!targetEntry) {
                continue
              }

              const [targetName, target] = targetEntry
              const chapterSection = resolveChapterSection(block, chapterLevel)
              if (chapterSection && !chapterNumbers.has(chapterSection)) {
                chapterIndex += 1
                chapterNumbers.set(chapterSection, chapterIndex)
              }

              const effectiveChapter = resolveEffectiveChapter(
                chapterSection,
                chapterNumbers
              )
              const chapterNumber = resolveChapterNumber(
                chapterSection,
                effectiveChapter
              )

              if (!countersByChapter.has(chapterNumber)) {
                countersByChapter.set(chapterNumber, {})
              }

              const counters = countersByChapter.get(chapterNumber)
              const counterKey = target.counterKey
              counters[counterKey] = (counters[counterKey] ?? 0) + 1
              const numbering = \`\${chapterNumber}-\${counters[counterKey]}\`

              target.apply(block, labels[targetName], numbering)
            }

            return document
          })
        })
      }

      function setMathStatus(message) {
        mathStatus.textContent = message
      }

      function setRenderStatus(message) {
        renderStatus.textContent = message
      }

      function clearRenderError() {
        errorStatus.textContent = ''
      }

      function setRenderError(message) {
        errorStatus.textContent = message
      }

      function loadMathJax() {
        setMathStatus('Loading MathJax for latexmath rendering...')

        const script = document.createElement('script')
        script.src =
          'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
        script.async = true
        script.addEventListener('load', () => {
          mathJaxReady = true
          setMathStatus('latexmath rendering is enabled.')
          renderMath()
        })
        script.addEventListener('error', () => {
          setMathStatus(
            'MathJax failed to load from CDN. Falling back to raw latexmath source.'
          )
        })
        document.head.append(script)
      }

      function renderMath() {
        if (!mathJaxReady || !window.MathJax?.typesetPromise) {
          return
        }

        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([defaultPreview, pluginPreview])
        }

        window.MathJax.typesetPromise([defaultPreview, pluginPreview]).catch(
          () => {
            setMathStatus(
              'MathJax loaded, but some expressions could not be rendered.'
            )
          }
        )
      }

      function parseHeaderAttributes(text) {
        const attributes = {}
        for (const rawLine of text.split('\\n')) {
          const line = rawLine.trim()
          if (!line || !line.startsWith(':')) {
            continue
          }

          const secondColonIndex = line.indexOf(':', 1)
          if (secondColonIndex === -1) {
            continue
          }

          const name = line.slice(1, secondColonIndex).trim()
          const value = line.slice(secondColonIndex + 1).trim()
          attributes[name] = value
        }
        return attributes
      }

      function parseOptionsText(text) {
        const trimmed = text.trim()
        if (!trimmed) {
          return {}
        }
        return JSON.parse(trimmed)
      }

      function renderPreviews() {
        if (!asciidoctor) {
          setRenderError('Asciidoctor browser runtime failed to load.')
          setRenderStatus('Rendering is unavailable.')
          return
        }

        try {
          clearRenderError()

          const source = sourceView.value
          const headerAttributes = parseHeaderAttributes(headerView.value)
          const options = parseOptionsText(optionsView.value)

          const convertOptions = {
            safe: 'safe',
            backend: 'html5',
            attributes: headerAttributes
          }

          const defaultHtml = asciidoctor.convert(source, convertOptions)
          const registry = asciidoctor.Extensions.create()
          registerNumberedCaptions(registry, options)
          const pluginHtml = asciidoctor.convert(source, {
            ...convertOptions,
            extension_registry: registry
          })

          defaultPreview.innerHTML = defaultHtml
          pluginPreview.innerHTML = pluginHtml
          setRenderStatus('Rendered from current editor contents.')
          renderMath()
        } catch (error) {
          defaultPreview.innerHTML = ''
          pluginPreview.innerHTML = ''
          setRenderStatus('Rendering failed.')
          setRenderError(error?.message ?? String(error))
        }
      }

      function scheduleRender() {
        window.clearTimeout(renderTimer)
        renderTimer = window.setTimeout(renderPreviews, RENDER_DEBOUNCE_MS)
      }

      function currentEditorState() {
        return {
          source: sourceView.value,
          optionsText: optionsView.value,
          headerText: headerView.value
        }
      }

      for (const preset of demoPresets) {
        const option = document.createElement('option')
        option.value = preset.id
        option.textContent = preset.name
        presetSelect.append(option)
      }

      function applyPreset(id) {
        const preset = demoPresets.find((entry) => entry.id === id) ?? demoPresets[0]

        sourceView.value = preset.source
        optionsView.value = preset.optionsText
        headerView.value = preset.headerAttributesText
        presetDescription.textContent = preset.description
        scheduleRender()
      }

      function readShareState() {
        return {
          source: sourceView.value,
          optionsText: optionsView.value,
          headerText: headerView.value
        }
      }

      function buildShareUrl(state) {
        const params = new URLSearchParams()
        params.set('src', state.source)
        params.set('opt', state.optionsText)
        params.set('hdr', state.headerText)
        const query = params.toString()
        return \`\${window.location.origin}\${window.location.pathname}?\${query}\`
      }

      async function copyShareUrl(url) {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url)
          return true
        }
        return false
      }

      function findPresetByShareState(state) {
        return demoPresets.find((preset) => {
          return (
            preset.source === state.source &&
            preset.optionsText === state.optionsText &&
            preset.headerAttributesText === state.headerText
          )
        })
      }

      function parseShareStateFromQuery() {
        const params = new URLSearchParams(window.location.search)
        if (!params.has('src')) {
          return null
        }

        return {
          source: params.get('src') ?? '',
          optionsText: params.get('opt') ?? '',
          headerText: params.get('hdr') ?? ''
        }
      }

      presetSelect.addEventListener('change', (event) => {
        shareStatus.textContent = ''
        applyPreset(event.target.value)
      })

      resetButton.addEventListener('click', () => {
        shareStatus.textContent = ''
        applyPreset(presetSelect.value)
      })

      for (const field of [sourceView, optionsView, headerView]) {
        field.addEventListener('input', () => {
          shareStatus.textContent = ''
          setRenderStatus('Editing... rendering shortly.')
          scheduleRender()
        })
      }

      shareButton.addEventListener('click', async () => {
        const state = readShareState()
        const shareUrl = buildShareUrl(state)

        if (shareUrl.length > URL_SIZE_LIMIT) {
          shareStatus.textContent =
            'Share URL is too long. Reduce Asciidoc input size or switch to a shorter preset.'
          return
        }

        try {
          const copied = await copyShareUrl(shareUrl)
          shareStatus.textContent = copied
            ? 'Share URL copied to clipboard.'
            : \`Share URL: \${shareUrl}\`
        } catch (error) {
          shareStatus.textContent = \`Share URL: \${shareUrl}\`
        }
      })

      const initialShareState = parseShareStateFromQuery()
      if (!initialShareState) {
        applyPreset(demoPresets[0]?.id)
      } else {
        const preset = findPresetByShareState(initialShareState)
        if (preset) {
          presetSelect.value = preset.id
          applyPreset(preset.id)
          shareStatus.textContent =
            'Loaded from shared query and re-rendered automatically.'
        } else {
          applyPreset(demoPresets[0]?.id)
          sourceView.value = initialShareState.source
          optionsView.value = initialShareState.optionsText
          headerView.value = initialShareState.headerText
          scheduleRender()
          shareStatus.textContent =
            'Query loaded into the editors and rendered as custom content.'
        }
      }

      loadMathJax()
    </script>
  </body>
</html>
`

const presetsModule = `globalThis.demoPresets = ${JSON.stringify(presets, null, 2)}\n`

async function writeFormattedDemoAssets() {
  const indexPrettierConfig =
    (await prettier.resolveConfig(indexPath, { editorconfig: true })) ?? {}
  const presetsPrettierConfig =
    (await prettier.resolveConfig(presetsPath, { editorconfig: true })) ?? {}
  const formattedPage = await prettier.format(page, {
    ...indexPrettierConfig,
    filepath: indexPath
  })
  const formattedPresetsModule = await prettier.format(presetsModule, {
    ...presetsPrettierConfig,
    filepath: presetsPath
  })
  const pageWithTrailingNewline = formattedPage.endsWith('\n')
    ? formattedPage
    : `${formattedPage}\n`
  const presetsWithTrailingNewline = formattedPresetsModule.endsWith('\n')
    ? formattedPresetsModule
    : `${formattedPresetsModule}\n`

  fs.writeFileSync(indexPath, pageWithTrailingNewline)
  fs.writeFileSync(presetsPath, presetsWithTrailingNewline)
  fs.copyFileSync(asciidoctorBrowserPath, asciidoctorVendorPath)
  fs.copyFileSync(asciidoctorStylesheetPath, asciidoctorStylesheetVendorPath)

  console.log(`Demo site generated: ${indexPath}`)
  console.log(`Preset module generated: ${presetsPath}`)
  console.log(`Vendor runtime copied: ${asciidoctorVendorPath}`)
  console.log(`Vendor stylesheet copied: ${asciidoctorStylesheetVendorPath}`)
}

writeFormattedDemoAssets().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

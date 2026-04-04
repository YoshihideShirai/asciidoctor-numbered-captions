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
const indexPath = path.join(outDir, 'index.html')
const presetsPath = path.join(outDir, 'demo-presets.js')

fs.mkdirSync(outDir, { recursive: true })

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>asciidoctor-numbered-captions demo</title>
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

      .preset-description {
        margin: 0.65rem 0 0;
        color: #374151;
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

      .preview-body img {
        border: 1px solid #d1d5db;
        border-radius: 6px;
      }

      .preview-body table {
        border-collapse: collapse;
      }

      .preview-body th,
      .preview-body td {
        border: 1px solid #d1d5db;
        padding: 0.4rem 0.6rem;
      }

      .preview-body .imageblock > .title,
      .preview-body .tableblock > .title,
      .preview-body .stemblock > .title {
        background: #fff7cc;
        border-radius: 4px;
        padding: 0.1rem 0.35rem;
        display: inline-block;
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
      </div>
      <p id="preset-description" class="preset-description"></p>
      <div class="inputs-grid">
        <section class="input-panel">
          <h3>Asciidoc source</h3>
          <textarea id="source-view" readonly></textarea>
        </section>
        <section class="input-panel">
          <h3>Plugin options</h3>
          <textarea id="options-view" readonly></textarea>
        </section>
        <section class="input-panel">
          <h3>Header attributes</h3>
          <textarea id="header-view" readonly></textarea>
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
    <script>
      const demoPresets = window.demoPresets || []

      const presetSelect = document.getElementById('preset-select')
      const presetDescription = document.getElementById('preset-description')
      const sourceView = document.getElementById('source-view')
      const optionsView = document.getElementById('options-view')
      const headerView = document.getElementById('header-view')
      const defaultPreview = document.getElementById('default-preview')
      const pluginPreview = document.getElementById('plugin-preview')

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

        defaultPreview.innerHTML = preset.defaultHtml
        pluginPreview.innerHTML = preset.pluginHtml
      }

      presetSelect.addEventListener('change', (event) => {
        applyPreset(event.target.value)
      })

      applyPreset(demoPresets[0]?.id)
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

  console.log(`Demo site generated: ${indexPath}`)
  console.log(`Preset module generated: ${presetsPath}`)
}

writeFormattedDemoAssets().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

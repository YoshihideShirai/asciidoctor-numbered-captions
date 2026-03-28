'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const asciidoctor = require('asciidoctor')()
const { register } = require('../dist/index')

function convertWithPlugin(source, options = {}) {
  const registry = asciidoctor.Extensions.create()
  register(registry, options)

  return asciidoctor.convert(source, {
    safe: 'safe',
    extension_registry: registry,
    attributes: {
      stem: 'latexmath',
      sectnums: '',
      ...options.attributes
    }
  })
}

test('keeps Asciidoctor default numbering when no plugin config is provided', () => {
  const input = `= Sample

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input)

  assert.match(html, /Figure 1\. Figure One/)
  assert.doesNotMatch(html, /Figure 1-1\./)
})

test('numbers image/table/equation captions as chapter-counter from header attributes', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1
:numbered-captions-label-image: Figure
:numbered-captions-label-table: Table
:numbered-captions-label-stem: Equation

== Chapter One

.Figure One
image::one.png[]

.Table One
|===
|A |B
|===

.Einstein
[stem]
++++
E = mc^2
++++

== Chapter Two

.Figure Two
image::two.png[]

.Table Two
|===
|C |D
|===

.Newton
[stem]
++++
F = ma
++++
`

  const html = convertWithPlugin(input)

  assert.match(html, /Figure 1-1\./)
  assert.match(html, /Table 1-1\./)
  assert.match(html, /Equation 1-1\./)
  assert.match(html, /Figure 2-1\./)
  assert.match(html, /Table 2-1\./)
  assert.match(html, /Equation 2-1\./)
})

test('supports Asciidoc header attributes when options are not provided', () => {
  const input = `= Sample
:numbered-captions-chapter-level: invalid
:numbered-captions-label-image: 図
:numbered-captions-label-table: 表
:numbered-captions-label-stem: 式

== Chapter One

.Sample Figure
image::one.png[]

.Sample Table
|===
|A |B
|===

.Sample Equation
[stem]
++++
a = b
++++
`

  const html = convertWithPlugin(input)

  assert.match(html, /図 1-1\./)
  assert.match(html, /表 1-1\./)
  assert.match(html, /式 1-1\./)
})

test('prefers register(registry, options) over Asciidoc header attributes', () => {
  const input = `= Sample
:numbered-captions-label-image: 図

== Chapter One

.Sample Figure
image::one.png[]
`

  const html = convertWithPlugin(input, {
    labels: {
      image: 'Figure'
    }
  })

  assert.match(html, /Figure 1-1\./)
  assert.doesNotMatch(html, /図 1-1\./)
})

'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const asciidoctor = require('asciidoctor')()
const { register } = require('../src/index')

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

test('numbers image/table/equation captions as chapter-counter', () => {
  const input = `= Sample

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

test('resets counters per chapter and per block type', () => {
  const input = `= Sample

== Chapter One

.First Figure
image::one.png[]

.Second Figure
image::two.png[]

== Chapter Two

.Third Figure
image::three.png[]
`

  const html = convertWithPlugin(input)

  assert.match(html, /Figure 1-1\./)
  assert.match(html, /Figure 1-2\./)
  assert.match(html, /Figure 2-1\./)
})

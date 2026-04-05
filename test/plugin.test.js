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

function extractNumbering(html, label) {
  return [...html.matchAll(new RegExp(`${label} ([\\d.]+-\\d+)\\.`, 'g'))].map(
    ([, numbering]) => numbering
  )
}

test('keeps Asciidoctor default numbering when no plugin config is provided', () => {
  const input = `= Sample

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input)

  assert.match(html, /Figure 1\. Figure One/)
  assert.deepEqual(extractNumbering(html, 'Figure'), [])
})

test('uses plugin numbering when defaultNumbering=plugin is set in options', () => {
  const input = `= Sample

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, { defaultNumbering: 'plugin' })

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1'])
})

test('uses Asciidoctor numbering when defaultNumbering=asciidoctor is set in options', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, { defaultNumbering: 'asciidoctor' })

  assert.match(html, /Figure 1\. Figure One/)
  assert.deepEqual(extractNumbering(html, 'Figure'), [])
})

test('allows header attribute to force plugin numbering', () => {
  const input = `= Sample
:numbered-captions-numbering: plugin

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, { defaultNumbering: 'asciidoctor' })

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1'])
})

test('allows header attribute to force Asciidoctor numbering', () => {
  const input = `= Sample
:numbered-captions-numbering: asciidoctor
:numbered-captions-chapter-level: 1

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, { defaultNumbering: 'plugin' })

  assert.match(html, /Figure 1\. Figure One/)
  assert.deepEqual(extractNumbering(html, 'Figure'), [])
})

test('ignores invalid defaultNumbering values without enabling plugin numbering', () => {
  const input = `= Sample

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, { defaultNumbering: 'invalid-mode' })

  assert.match(html, /Figure 1\. Figure One/)
  assert.deepEqual(extractNumbering(html, 'Figure'), [])
})

test('ignores invalid numbering header values without enabling plugin numbering', () => {
  const input = `= Sample
:numbered-captions-numbering: invalid-mode

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input)

  assert.match(html, /Figure 1\. Figure One/)
  assert.deepEqual(extractNumbering(html, 'Figure'), [])
})

test('numbers image/table/equation captions as chapter-counter from header attributes', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1

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

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1', '2-1'])
  assert.deepEqual(extractNumbering(html, 'Table'), ['1-1', '2-1'])
  assert.deepEqual(extractNumbering(html, 'Equation'), ['1-1', '2-1'])
})

test('supports Asciidoctor standard caption attributes when options are not provided', () => {
  const input = `= Sample
:numbered-captions-chapter-level: invalid
:figure-caption: 図
:table-caption: 表
:equation-caption: 式

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

  assert.deepEqual(extractNumbering(html, '図'), ['1-1'])
  assert.deepEqual(extractNumbering(html, '表'), ['1-1'])
  assert.deepEqual(extractNumbering(html, '式'), ['1-1'])
})

test('uses Asciidoctor standard figure/table caption attributes as fallback labels', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1
:figure-caption: 図
:table-caption: 表

== Chapter One

.Sample Figure
image::one.png[]

.Sample Table
|===
|A |B
|===
`

  const html = convertWithPlugin(input)

  assert.deepEqual(extractNumbering(html, '図'), ['1-1'])
  assert.deepEqual(extractNumbering(html, '表'), ['1-1'])
})

test('uses Asciidoctor standard equation/stem caption attributes as fallback labels', () => {
  const equationCaptionInput = `= Sample
:numbered-captions-chapter-level: 1
:equation-caption: Eq

== Chapter One

.Sample Equation
[stem]
++++
a = b
++++
`

  const stemCaptionInput = `= Sample
:numbered-captions-chapter-level: 1
:stem-caption: Stem

== Chapter One

.Sample Equation
[stem]
++++
a = b
++++
`

  const htmlWithEquationCaption = convertWithPlugin(equationCaptionInput)
  const htmlWithStemCaption = convertWithPlugin(stemCaptionInput)

  assert.deepEqual(extractNumbering(htmlWithEquationCaption, 'Eq'), ['1-1'])
  assert.deepEqual(extractNumbering(htmlWithStemCaption, 'Stem'), ['1-1'])
})

test('prefers register(registry, options) over Asciidoc header attributes', () => {
  const input = `= Sample
:figure-caption: 図

== Chapter One

.Sample Figure
image::one.png[]
`

  const html = convertWithPlugin(input, {
    labels: {
      image: 'Figure'
    }
  })

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1'])
  assert.deepEqual(extractNumbering(html, '図'), [])
})

test('supports chapterLevel=2 from JS options with section-based chapter numbering', () => {
  const input = `= Sample

== Part One

=== Chapter One

.Figure One
image::one.png[]

.Table One
|===
|A |B
|===

=== Chapter Two

.Figure Two
image::two.png[]
`

  const html = convertWithPlugin(input, {
    chapterLevel: 2,
    labels: {
      image: 'Figure',
      table: 'Table'
    }
  })

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1.1-1', '1.2-1'])
  assert.deepEqual(extractNumbering(html, 'Table'), ['1.1-1'])
})

test('supports chapterLevel=2 from Asciidoc header attributes with section-based chapter numbering', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 2

== Part One

=== Chapter One

.Figure One
image::one.png[]

=== Chapter Two

.Figure Two
image::two.png[]
`

  const html = convertWithPlugin(input)

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1.1-1', '1.2-1'])
})

test('treats preamble captions as chapter 1 and keeps numbering continuous into first chapter', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1

.Preamble Figure
image::one.png[]

== Chapter One

.Chapter Figure
image::two.png[]
`

  const html = convertWithPlugin(input)

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1', '1-2'])
})

test('treats blocks as chapter 1 when only shallower or deeper sections exist', () => {
  const shallowOnlyInput = `= Sample
:numbered-captions-chapter-level: 2

== Part One

.Figure One
image::one.png[]
`

  const deepOnlyInput = `= Sample
:numbered-captions-chapter-level: 1

=== Deep Section

.Figure One
image::one.png[]
`

  const shallowOnlyHtml = convertWithPlugin(shallowOnlyInput)
  const deepOnlyHtml = convertWithPlugin(deepOnlyInput)

  assert.deepEqual(extractNumbering(shallowOnlyHtml, 'Figure'), ['1-1'])
  assert.deepEqual(extractNumbering(deepOnlyHtml, 'Figure'), ['1-1'])
})

test('treats captions as chapter 1 in a document without chapter headings', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1

.Figure One
image::one.png[]

.Figure Two
image::two.png[]
`

  const html = convertWithPlugin(input)

  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1', '1-2'])
})

test('handles chapters with multiple tables and without figures', () => {
  const input = `= Sample
:numbered-captions-chapter-level: 1

== Chapter One

.Table One
|===
|A |B
|===

.Table Two
|===
|C |D
|===

== Chapter Two

.Chapter Two Equation
[stem]
++++
x = y
++++

.Table Three
|===
|E |F
|===

== Chapter Three

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input)

  assert.deepEqual(extractNumbering(html, 'Table'), ['1-1', '1-2', '2-1'])
  assert.deepEqual(extractNumbering(html, 'Equation'), ['2-1'])
  assert.deepEqual(extractNumbering(html, 'Figure'), ['3-1'])
})

test('supports custom targets with options.targets object while keeping default targets', () => {
  const input = `= Sample

== Chapter One

.Sample Listing
[source,javascript]
----
console.log('hello')
----

.Sample Figure
image::one.png[]
`

  const html = convertWithPlugin(input, {
    chapterLevel: 1,
    targets: {
      image: true,
      table: true,
      stem: true,
      listing: {
        context: 'listing',
        label: 'Listing',
        counter: 'listing',
        labelAttribute: 'listing-caption'
      }
    }
  })

  assert.deepEqual(extractNumbering(html, 'Listing'), ['1-1'])
  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1'])
})

test('ignores unknown targets by default and can fail explicitly', () => {
  const input = `= Sample

== Chapter One

.Figure One
image::one.png[]
`

  const html = convertWithPlugin(input, {
    chapterLevel: 1,
    targets: ['image', 'unknown-target']
  })
  assert.deepEqual(extractNumbering(html, 'Figure'), ['1-1'])

  assert.throws(
    () =>
      convertWithPlugin(input, {
        chapterLevel: 1,
        targets: {
          image: true,
          'unknown-target': true,
          onUnknown: 'error'
        }
      }),
    /Unknown target: unknown-target/
  )
})

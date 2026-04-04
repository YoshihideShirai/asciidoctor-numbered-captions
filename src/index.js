'use strict'

const DEFAULT_LABELS = {
  image: 'Figure',
  table: 'Table',
  stem: 'Equation'
}

const ATTRIBUTE_NAMES = {
  chapterLevel: 'numbered-captions-chapter-level',
  standardLabels: {
    image: 'figure-caption',
    table: 'table-caption',
    stem: ['equation-caption', 'stem-caption']
  }
}

function toValidChapterLevel(value, fallback = 1) {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }
  return parsed
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null)
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

function register(registry, options = {}) {
  registry.treeProcessor(function () {
    this.process(function (document) {
      const pluginEnabled =
        hasAnyOptions(options) || hasAnyHeaderAttribute(document)

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

      const labels = {
        image:
          firstDefined(
            options.labels?.image,
            document.getAttribute(ATTRIBUTE_NAMES.standardLabels.image),
            DEFAULT_LABELS.image
          ) ?? DEFAULT_LABELS.image,
        table:
          firstDefined(
            options.labels?.table,
            document.getAttribute(ATTRIBUTE_NAMES.standardLabels.table),
            DEFAULT_LABELS.table
          ) ?? DEFAULT_LABELS.table,
        stem:
          firstDefined(
            options.labels?.stem,
            firstDocumentAttribute(
              document,
              ATTRIBUTE_NAMES.standardLabels.stem
            ),
            DEFAULT_LABELS.stem
          ) ?? DEFAULT_LABELS.stem
      }

      const chapterNumbers = new Map()
      let chapterIndex = 0
      const countersByChapter = new Map()
      const targetBlocks = document.findBy((node) => {
        const context = node.getContext?.()
        return (
          (context === 'image' || context === 'table' || context === 'stem') &&
          Boolean(node.getTitle?.())
        )
      })

      for (const block of targetBlocks) {
        const context = block.getContext()
        const chapterSection = resolveChapterSection(block, chapterLevel)
        if (chapterSection && !chapterNumbers.has(chapterSection)) {
          chapterIndex += 1
          chapterNumbers.set(chapterSection, chapterIndex)
        }

        const effectiveChapter = chapterSection
          ? chapterNumbers.get(chapterSection)
          : 1

        if (!countersByChapter.has(effectiveChapter)) {
          countersByChapter.set(effectiveChapter, {
            image: 0,
            table: 0,
            stem: 0
          })
        }

        const counters = countersByChapter.get(effectiveChapter)
        counters[context] += 1
        const numbering = `${effectiveChapter}-${counters[context]}`
        if (context === 'stem') {
          block.setTitle(
            `${labels[context]} ${numbering}. ${block.getTitle() ?? ''}`.trim()
          )
        } else {
          block.setCaption(`${labels[context]} ${numbering}. `)
        }
      }

      return document
    })
  })
}

module.exports = { register, DEFAULT_LABELS }

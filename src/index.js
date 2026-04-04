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

const RESERVED_TARGET_OPTIONS = new Set(['onUnknown'])

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
  // If no section exists at chapterLevel (e.g., preamble-only or documents without headings),
  // treat the block as chapter 1 so numbering remains stable as `1-n`.
  if (!chapterSection) {
    return 1
  }
  return chapterNumbers.get(chapterSection)
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
  block.setCaption(`${label} ${numbering}. `)
}

function applyTitle(block, label, numbering) {
  block.setTitle(`${label} ${numbering}. ${block.getTitle() ?? ''}`.trim())
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
      merged.counterKey ?? merged.counter ?? baseDefinition?.counterKey ?? name,
    match,
    labelAttributeNames: normalizeLabelAttributes(
      firstDefined(merged.labelAttributeNames, merged.labelAttribute),
      baseDefinition?.labelAttributeNames ?? []
    ),
    defaultLabel: merged.defaultLabel ?? merged.label ?? defaultLabelFor(name),
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
          throw new Error(`Unknown target: ${name}`)
        }
        continue
      }

      if (!definition || typeof definition !== 'object') {
        if (onUnknown === 'error') {
          throw new Error(`Invalid target definition: ${name}`)
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
        throw new Error(`Unknown target: ${name}`)
      }
    }

    return targets
  }

  return { ...DEFAULT_TARGETS }
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

        if (!countersByChapter.has(effectiveChapter)) {
          countersByChapter.set(effectiveChapter, {})
        }

        const counters = countersByChapter.get(effectiveChapter)
        const counterKey = target.counterKey
        counters[counterKey] = (counters[counterKey] ?? 0) + 1
        const numbering = `${effectiveChapter}-${counters[counterKey]}`

        target.apply(block, labels[targetName], numbering)
      }

      return document
    })
  })
}

module.exports = { register, DEFAULT_LABELS }

'use strict'

type CaptionKind = 'image' | 'table' | 'stem'

interface NumberedCaptionLabels {
  image?: string
  table?: string
  stem?: string
}

interface RegisterOptions {
  chapterLevel?: number | string
  labels?: NumberedCaptionLabels
}

interface AsciidoctorDocument {
  getAttribute(name: string): string | undefined
}

interface AsciidoctorRegistry {
  postprocessor(
    callback: (this: {
      process: (
        processor: (document: AsciidoctorDocument, output: string) => string
      ) => void
    }) => void
  ): void
}

const DEFAULT_LABELS: Required<NumberedCaptionLabels> = {
  image: 'Figure',
  table: 'Table',
  stem: 'Equation'
}

const ATTRIBUTE_NAMES = {
  chapterLevel: 'numbered-captions-chapter-level',
  labels: {
    image: 'numbered-captions-label-image',
    table: 'numbered-captions-label-table',
    stem: 'numbered-captions-label-stem'
  }
} as const

function toValidChapterLevel(
  value: number | string | undefined,
  fallback = 1
): number {
  const parsed = Number.parseInt(String(value), 10)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }
  return parsed
}

function firstDefined<T>(
  ...values: Array<T | undefined | null>
): T | undefined {
  return values.find((value) => value !== undefined && value !== null)
}

function hasAnyHeaderAttribute(document: AsciidoctorDocument): boolean {
  return [
    ATTRIBUTE_NAMES.chapterLevel,
    ATTRIBUTE_NAMES.labels.image,
    ATTRIBUTE_NAMES.labels.table,
    ATTRIBUTE_NAMES.labels.stem
  ].some((name) => document.getAttribute(name) !== undefined)
}

function hasAnyOptions(options: RegisterOptions): boolean {
  return (
    options.chapterLevel !== undefined ||
    options.labels?.image !== undefined ||
    options.labels?.table !== undefined ||
    options.labels?.stem !== undefined
  )
}

function register(
  registry: AsciidoctorRegistry,
  options: RegisterOptions = {}
): void {
  registry.postprocessor(function () {
    this.process(function (document, output) {
      const pluginEnabled =
        hasAnyOptions(options) || hasAnyHeaderAttribute(document)

      if (!pluginEnabled) {
        return output
      }

      const chapterLevel = toValidChapterLevel(
        firstDefined(
          options.chapterLevel,
          document.getAttribute(ATTRIBUTE_NAMES.chapterLevel),
          1
        ),
        1
      )

      const labels: Required<NumberedCaptionLabels> = {
        image:
          firstDefined(
            options.labels?.image,
            document.getAttribute(ATTRIBUTE_NAMES.labels.image),
            DEFAULT_LABELS.image
          ) ?? DEFAULT_LABELS.image,
        table:
          firstDefined(
            options.labels?.table,
            document.getAttribute(ATTRIBUTE_NAMES.labels.table),
            DEFAULT_LABELS.table
          ) ?? DEFAULT_LABELS.table,
        stem:
          firstDefined(
            options.labels?.stem,
            document.getAttribute(ATTRIBUTE_NAMES.labels.stem),
            DEFAULT_LABELS.stem
          ) ?? DEFAULT_LABELS.stem
      }

      const lines = output.split('\n')

      let chapter = 0
      const counters: Record<CaptionKind, number> = {
        image: 0,
        table: 0,
        stem: 0
      }
      let blockContext: CaptionKind | null = null

      const resetCounters = () => {
        counters.image = 0
        counters.table = 0
        counters.stem = 0
      }

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]

        if (line.includes(`<div class="sect${chapterLevel}">`)) {
          chapter += 1
          resetCounters()
          blockContext = null
          continue
        }

        if (line.includes('<div class="imageblock">')) {
          blockContext = 'image'
          continue
        }

        if (line.includes('<table class="tableblock')) {
          blockContext = 'table'
          continue
        }

        if (line.includes('<div class="stemblock">')) {
          blockContext = 'stem'
          continue
        }

        if (blockContext === 'image' && line.includes('<div class="title">')) {
          counters.image += 1
          const effectiveChapter = chapter || 1
          lines[i] = line.replace(
            /<div class="title">.*?\.\s*/,
            `<div class="title">${labels.image} ${effectiveChapter}-${counters.image}. `
          )
          blockContext = null
          continue
        }

        if (
          blockContext === 'table' &&
          line.includes('<caption class="title">')
        ) {
          counters.table += 1
          const effectiveChapter = chapter || 1
          lines[i] = line.replace(
            /<caption class="title">.*?\.\s*/,
            `<caption class="title">${labels.table} ${effectiveChapter}-${counters.table}. `
          )
          blockContext = null
          continue
        }

        if (blockContext === 'stem' && line.includes('<div class="title">')) {
          counters.stem += 1
          const effectiveChapter = chapter || 1
          lines[i] = line.replace(
            /<div class="title">/,
            `<div class="title">${labels.stem} ${effectiveChapter}-${counters.stem}. `
          )
          blockContext = null
          continue
        }
      }

      return lines.join('\n')
    })
  })
}

export { register, DEFAULT_LABELS }

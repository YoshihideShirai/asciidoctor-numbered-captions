'use strict'

const DEFAULT_LABELS = {
  image: 'Figure',
  table: 'Table',
  stem: 'Equation'
}

function register(registry, options = {}) {
  const chapterLevel = Number.isInteger(options.chapterLevel)
    ? options.chapterLevel
    : 1
  const labels = { ...DEFAULT_LABELS, ...(options.labels || {}) }

  registry.postprocessor(function () {
    this.process(function (_document, output) {
      const lines = output.split('\n')

      let chapter = 0
      const counters = {
        image: 0,
        table: 0,
        stem: 0
      }
      let blockContext = null

      const resetCounters = () => {
        counters.image = 0
        counters.table = 0
        counters.stem = 0
      }

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i]

        if (chapterLevel === 1 && line.includes('<div class="sect1">')) {
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

module.exports = {
  register,
  DEFAULT_LABELS
}

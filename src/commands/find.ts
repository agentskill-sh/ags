import * as readline from 'readline'
import pc from 'picocolors'
import { apiFetch } from '../api.js'
import { truncate, ORANGE, DIM } from '../ui.js'
import type { SearchResponse, SearchResult } from '../types.js'

const DEBOUNCE_MS = 300
const MAX_RESULTS = 10

function scoreLabel(score: number | null): string {
  if (score == null) return pc.dim('n/a')
  if (score >= 70) return pc.green(String(score))
  if (score >= 30) return pc.yellow(String(score))
  return pc.red(String(score))
}

function renderResults(
  results: SearchResult[],
  selectedIndex: number,
  query: string,
): string[] {
  const lines: string[] = []

  if (!results.length && query.length > 0) {
    lines.push(pc.dim('  No results'))
    return lines
  }

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const isSelected = i === selectedIndex
    const prefix = isSelected ? ORANGE('\u276f ') : '  '
    const name = isSelected ? pc.bold(ORANGE(r.name)) : r.name
    const owner = DIM(`@${r.owner}`)
    const security = scoreLabel(r.securityScore)
    const desc = truncate(r.description || '', 40)

    lines.push(`${prefix}${name} ${owner} ${DIM('sec:')}${security} ${DIM(desc)}`)
  }

  return lines
}

function clearLines(count: number): void {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1b[1A\x1b[2K')
  }
}

export async function findCommand(args: string[]): Promise<void> {
  // Non-interactive mode: just search and print
  if (!process.stdin.isTTY) {
    const query = args.filter((a) => !a.startsWith('--')).join(' ')
    if (!query) {
      console.error('Usage: ags find <query>')
      process.exit(1)
    }
    const params = new URLSearchParams({ q: query, limit: String(MAX_RESULTS) })
    const data = await apiFetch<SearchResponse>(`/agent/search?${params}`)
    for (const r of data.results) {
      console.log(`${r.slug}\t${r.owner}\t${r.securityScore ?? 'n/a'}\t${r.description || ''}`)
    }
    return
  }

  // Interactive fzf-style search
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  })

  // Enable raw mode for key-by-key input
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true)
  }
  process.stdin.resume()

  let query = args.filter((a) => !a.startsWith('--')).join(' ')
  let results: SearchResult[] = []
  let selectedIndex = 0
  let lastRenderedLines = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let fetching = false

  function render(): void {
    if (lastRenderedLines > 0) {
      clearLines(lastRenderedLines)
    }

    const lines: string[] = []
    lines.push(`${ORANGE('\u276f')} ${pc.bold('Find a skill:')} ${query}${fetching ? DIM(' ...') : ''}`)

    const resultLines = renderResults(results, selectedIndex, query)
    lines.push(...resultLines)

    if (results.length > 0) {
      lines.push(DIM('  \u2191\u2193 navigate  \u21b5 install  esc quit'))
    }

    process.stdout.write(lines.join('\n') + '\n')
    lastRenderedLines = lines.length
  }

  async function search(): Promise<void> {
    if (!query.trim()) {
      results = []
      selectedIndex = 0
      render()
      return
    }

    fetching = true
    render()

    try {
      const params = new URLSearchParams({ q: query, limit: String(MAX_RESULTS) })
      const data = await apiFetch<SearchResponse>(`/agent/search?${params}`)
      results = data.results
      selectedIndex = 0
    } catch {
      results = []
    }

    fetching = false
    render()
  }

  function scheduleSearch(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(search, DEBOUNCE_MS)
  }

  // Initial render
  render()

  // If there's an initial query, search immediately
  if (query) {
    await search()
  }

  return new Promise<void>((resolve) => {
    process.stdin.on('data', async (data: Buffer) => {
      const key = data.toString()

      // Escape or Ctrl+C: quit
      if (key === '\x1b' || key === '\x03') {
        if (lastRenderedLines > 0) {
          clearLines(lastRenderedLines)
        }
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(false)
        }
        rl.close()
        resolve()
        return
      }

      // Enter: install selected
      if (key === '\r' || key === '\n') {
        if (results.length > 0 && results[selectedIndex]) {
          const selected = results[selectedIndex]
          if (lastRenderedLines > 0) {
            clearLines(lastRenderedLines)
          }
          if (process.stdin.setRawMode) {
            process.stdin.setRawMode(false)
          }
          rl.close()

          console.log(`\nInstalling ${ORANGE(selected.name)}...\n`)
          const { installCommand } = await import('./install.js')
          await installCommand([selected.slug])
          resolve()
        }
        return
      }

      // Up arrow
      if (key === '\x1b[A') {
        if (selectedIndex > 0) {
          selectedIndex--
          render()
        }
        return
      }

      // Down arrow
      if (key === '\x1b[B') {
        if (selectedIndex < results.length - 1) {
          selectedIndex++
          render()
        }
        return
      }

      // Backspace
      if (key === '\x7f' || key === '\b') {
        if (query.length > 0) {
          query = query.slice(0, -1)
          scheduleSearch()
          render()
        }
        return
      }

      // Regular character input
      if (key.length === 1 && key >= ' ') {
        query += key
        scheduleSearch()
        render()
      }
    })
  })
}

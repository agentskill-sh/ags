import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiFetch } from '../api.js'
import { truncate, padEnd, ORANGE, DIM } from '../ui.js'
import type { SearchResponse } from '../types.js'

export async function searchCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const limitIdx = args.indexOf('--limit')

  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) || 5 : 5

  // Collect query words (skip flags and their values)
  const skipNext = new Set<number>()
  if (limitIdx !== -1) skipNext.add(limitIdx + 1)
  const query = args
    .filter((a, i) => !a.startsWith('--') && !skipNext.has(i))
    .join(' ')

  if (!query) {
    p.log.error('Usage: ags search <query> [--json] [--limit N]')
    process.exit(1)
  }

  const params = new URLSearchParams({ q: query, limit: String(limit) })

  let data: SearchResponse

  if (jsonFlag) {
    data = await apiFetch<SearchResponse>(`/agent/search?${params}`)
    console.log(JSON.stringify(data, null, 2))
    return
  }

  const s = p.spinner()
  s.start(`Searching for "${query}"`)

  try {
    data = await apiFetch<SearchResponse>(`/agent/search?${params}`)
  } catch (err) {
    s.error('Search failed')
    throw err
  }

  s.stop(`Found ${data.total} result${data.total !== 1 ? 's' : ''}`)

  if (!data.results.length) {
    p.log.warn(`No skills found for "${query}".`)
    p.log.info(`Browse skills at ${pc.underline('https://agentskill.sh')}`)
    return
  }

  // Build table rows
  const rows = data.results.map((r) => ({
    slug: r.slug,
    name: r.name,
    owner: `@${r.owner}`,
    desc: truncate(r.description || '', 50),
    quality: r.contentQualityScore != null ? `${r.contentQualityScore}/100` : pc.dim('n/a'),
    security: r.securityScore != null ? `${r.securityScore}/100` : pc.dim('n/a'),
  }))

  const cols = {
    name: Math.max(4, ...rows.map((r) => r.name.length)),
    owner: Math.max(6, ...rows.map((r) => r.owner.length)),
    quality: Math.max(7, 7),
    security: Math.max(8, 8),
  }

  console.log()
  console.log(
    `  ${padEnd(pc.bold('Name'), cols.name)}  ${padEnd(pc.bold('Author'), cols.owner)}  ${padEnd(pc.bold('Quality'), cols.quality)}  ${padEnd(pc.bold('Security'), cols.security)}  ${pc.bold('Description')}`,
  )
  console.log(
    `  ${pc.dim('\u2500'.repeat(cols.name))}  ${pc.dim('\u2500'.repeat(cols.owner))}  ${pc.dim('\u2500'.repeat(cols.quality))}  ${pc.dim('\u2500'.repeat(cols.security))}  ${pc.dim('\u2500'.repeat(11))}`,
  )

  for (const r of rows) {
    console.log(
      `  ${padEnd(ORANGE(r.name), cols.name)}  ${padEnd(DIM(r.owner), cols.owner)}  ${padEnd(r.quality, cols.quality)}  ${padEnd(r.security, cols.security)}  ${r.desc}`,
    )
  }
  console.log()

  // Offer to install
  const options = rows.map((r) => ({
    value: r.slug,
    label: r.name,
    hint: r.owner,
  }))

  options.push({ value: '__none__', label: 'Skip', hint: '' })

  const selected = await p.select({
    message: 'Install a skill?',
    options,
  })

  if (p.isCancel(selected) || selected === '__none__') {
    return
  }

  // Dynamic import to avoid circular dependency
  const { installCommand } = await import('./install.js')
  await installCommand([selected as string])
}

import { apiFetch } from '../api.js'

interface SearchResult {
  slug: string
  name: string
  owner: string
  description: string
  installCount: number
  securityScore: number | null
  contentQualityScore: number | null
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  hasMore: boolean
}

export async function searchCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const limitIdx = args.indexOf('--limit')
  const platformIdx = args.indexOf('--platform')

  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) || 5 : 5
  const platform = platformIdx !== -1 ? args[platformIdx + 1] : undefined

  // Collect query words (skip flags and their values)
  const skipNext = new Set<number>()
  if (limitIdx !== -1) skipNext.add(limitIdx + 1)
  if (platformIdx !== -1) skipNext.add(platformIdx + 1)
  const query = args
    .filter((a, i) => !a.startsWith('--') && !skipNext.has(i))
    .join(' ')

  if (!query) {
    console.error('Usage: agentskill search <query> [--json] [--limit N] [--platform NAME]')
    process.exit(1)
  }

  const params = new URLSearchParams({ q: query, limit: String(limit) })
  if (platform) params.set('platform', platform)

  const data = await apiFetch<SearchResponse>(`/agent/search?${params}`)

  if (jsonFlag) {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  if (!data.results.length) {
    console.log(`No skills found for "${query}".`)
    console.log('Browse skills at https://agentskill.sh')
    return
  }

  console.log(`\nSkills matching "${query}" (${data.total} results)\n`)

  // Calculate column widths
  const rows = data.results.map(s => ({
    name: s.name,
    owner: `@${s.owner}`,
    installs: s.installCount.toLocaleString(),
    quality: s.contentQualityScore != null ? `${s.contentQualityScore}/100` : '\u2014',
    security: s.securityScore != null ? `${s.securityScore}/100` : '\u2014',
  }))

  const cols = {
    name: Math.max(4, ...rows.map(r => r.name.length)),
    owner: Math.max(6, ...rows.map(r => r.owner.length)),
    installs: Math.max(8, ...rows.map(r => r.installs.length)),
    quality: Math.max(7, ...rows.map(r => r.quality.length)),
    security: Math.max(8, ...rows.map(r => r.security.length)),
  }

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))

  console.log(`  ${pad('Name', cols.name)}  ${pad('Author', cols.owner)}  ${pad('Installs', cols.installs)}  ${pad('Quality', cols.quality)}  ${pad('Security', cols.security)}`)
  console.log(`  ${'-'.repeat(cols.name)}  ${'-'.repeat(cols.owner)}  ${'-'.repeat(cols.installs)}  ${'-'.repeat(cols.quality)}  ${'-'.repeat(cols.security)}`)

  for (const r of rows) {
    console.log(`  ${pad(r.name, cols.name)}  ${pad(r.owner, cols.owner)}  ${pad(r.installs, cols.installs)}  ${pad(r.quality, cols.quality)}  ${pad(r.security, cols.security)}`)
  }

  console.log(`\nInstall: agentskill install <slug>`)
}

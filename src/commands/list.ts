import { readdir, readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { detectSkillDir } from '../platform.js'

interface InstalledSkill {
  slug: string
  owner: string
  contentSha: string
  installed: string
  dir: string
}

function parseHeader(content: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const lines = content.split('\n')
  let inHeader = false
  for (const line of lines) {
    if (line.trim() === '# --- agentskill.sh ---') { inHeader = true; continue }
    if (line.trim() === '# ---') break
    if (inHeader && line.startsWith('# ')) {
      const match = line.match(/^# (\w+): (.+)$/)
      if (match) meta[match[1]] = match[2]
    }
  }
  return meta
}

export async function listCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const baseDir = detectSkillDir()

  if (!existsSync(baseDir)) {
    if (jsonFlag) {
      console.log(JSON.stringify({ skills: [], dir: baseDir }))
    } else {
      console.log('No skills installed.')
    }
    return
  }

  const skills: InstalledSkill[] = []

  async function scanDir(dir: string, depth: number): Promise<void> {
    if (depth > 2) return // max owner/slug nesting
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const entryPath = join(dir, entry.name)
      const skillMdPath = join(entryPath, 'SKILL.md')
      if (existsSync(skillMdPath)) {
        try {
          const content = await readFile(skillMdPath, 'utf-8')
          const meta = parseHeader(content)
          if (meta.slug) {
            const dirStat = await stat(skillMdPath)
            skills.push({
              slug: meta.slug,
              owner: meta.owner || '',
              contentSha: meta.contentSha || '',
              installed: meta.installed || dirStat.mtime.toISOString(),
              dir: entryPath,
            })
          }
        } catch {
          // Skip unreadable files
        }
      } else {
        // Check subdirectories (owner/slug pattern)
        await scanDir(entryPath, depth + 1)
      }
    }
  }

  await scanDir(baseDir, 0)

  if (jsonFlag) {
    console.log(JSON.stringify({ skills, dir: baseDir }, null, 2))
    return
  }

  if (!skills.length) {
    console.log('No skills installed.')
    console.log(`\nSearch: learn-skills search <query>`)
    return
  }

  console.log(`\nInstalled Skills (${skills.length})\n`)

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))
  const cols = {
    slug: Math.max(4, ...skills.map(s => s.slug.length)),
    owner: Math.max(5, ...skills.map(s => (s.owner ? `@${s.owner}` : '').length)),
  }

  console.log(`  ${pad('Slug', cols.slug)}  ${pad('Owner', cols.owner)}  Installed`)
  console.log(`  ${'-'.repeat(cols.slug)}  ${'-'.repeat(cols.owner)}  ---------`)

  for (const s of skills) {
    const date = new Date(s.installed).toLocaleDateString()
    console.log(`  ${pad(s.slug, cols.slug)}  ${pad(s.owner ? `@${s.owner}` : '', cols.owner)}  ${date}`)
  }

  console.log(`\nDirectory: ${baseDir}`)
}

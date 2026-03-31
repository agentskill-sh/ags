import * as p from '@clack/prompts'
import pc from 'picocolors'
import { readdirSync, readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'
import { readLock } from '../skill-lock.js'
import { agents, getAgentDisplayName } from '../agents.js'
import { ORANGE, DIM, padEnd } from '../ui.js'
import type { SkillLockEntry } from '../types.js'

interface InstalledSkill {
  slug: string
  owner: string
  contentSha: string
  installed: string
  agents: string[]
  dirs: string[]
}

function parseHeader(content: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const lines = content.split('\n')
  let inHeader = false
  for (const line of lines) {
    if (line.trim() === '# --- agentskill.sh ---') {
      inHeader = true
      continue
    }
    if (line.trim() === '# ---') break
    if (inHeader && line.startsWith('# ')) {
      const match = line.match(/^# (\w+): (.+)$/)
      if (match) meta[match[1]] = match[2]
    }
  }
  return meta
}

/** Scan filesystem for installed skills across all agent directories */
function scanFilesystem(): Map<string, { dirs: string[]; owner: string; contentSha: string; installed: string }> {
  const found = new Map<string, { dirs: string[]; owner: string; contentSha: string; installed: string }>()

  for (const [, config] of Object.entries(agents)) {
    const dirs = [
      join(process.cwd(), config.skillsDir),
      config.globalSkillsDir,
    ]

    for (const baseDir of dirs) {
      if (!existsSync(baseDir)) continue
      scanDir(baseDir, 0, found, baseDir)
    }
  }

  return found
}

function scanDir(
  dir: string,
  depth: number,
  found: Map<string, { dirs: string[]; owner: string; contentSha: string; installed: string }>,
  baseDir: string,
): void {
  if (depth > 2) return
  let names: string[]
  try {
    names = readdirSync(dir)
  } catch {
    return
  }
  for (const name of names) {
    const entryPath = join(dir, name)
    try {
      if (!statSync(entryPath).isDirectory()) continue
    } catch {
      continue
    }
    const skillMdPath = join(entryPath, 'SKILL.md')
    if (existsSync(skillMdPath)) {
      try {
        const content = readFileSync(skillMdPath, 'utf-8')
        const meta = parseHeader(content)
        if (meta.slug) {
          const existing = found.get(meta.slug)
          if (existing) {
            if (!existing.dirs.includes(entryPath)) {
              existing.dirs.push(entryPath)
            }
          } else {
            const st = statSync(skillMdPath)
            found.set(meta.slug, {
              dirs: [entryPath],
              owner: meta.owner || '',
              contentSha: meta.contentSha || '',
              installed: meta.installed || st.mtime.toISOString(),
            })
          }
        }
      } catch {
        // Skip unreadable
      }
    } else {
      scanDir(entryPath, depth + 1, found, baseDir)
    }
  }
}

export async function listCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')

  // Merge lock file data with filesystem scan
  const lock = readLock()
  const fsSkills = scanFilesystem()

  const skills: InstalledSkill[] = []

  // Start with lock file entries
  for (const [slug, entry] of Object.entries(lock.skills)) {
    const fs = fsSkills.get(slug)
    skills.push({
      slug,
      owner: fs?.owner || '',
      contentSha: entry.contentSha,
      installed: entry.installedAt,
      agents: entry.agents,
      dirs: fs?.dirs || [],
    })
    fsSkills.delete(slug)
  }

  // Add filesystem-only entries (not in lock file)
  for (const [slug, data] of fsSkills) {
    skills.push({
      slug,
      owner: data.owner,
      contentSha: data.contentSha,
      installed: data.installed,
      agents: [],
      dirs: data.dirs,
    })
  }

  if (jsonFlag) {
    console.log(JSON.stringify({ skills }, null, 2))
    return
  }

  if (!skills.length) {
    p.log.warn('No skills installed.')
    p.log.info(`Search for skills: ${pc.dim('ags search <query>')}`)
    return
  }

  p.log.step(`${pc.bold(`Installed Skills`)} (${skills.length})`)
  console.log()

  const cols = {
    slug: Math.max(4, ...skills.map((s) => s.slug.length)),
    owner: Math.max(5, ...skills.map((s) => (s.owner ? `@${s.owner}` : '').length)),
  }

  console.log(
    `  ${padEnd(pc.bold('Slug'), cols.slug)}  ${padEnd(pc.bold('Owner'), cols.owner)}  ${pc.bold('Agents')}`,
  )
  console.log(
    `  ${pc.dim('\u2500'.repeat(cols.slug))}  ${pc.dim('\u2500'.repeat(cols.owner))}  ${pc.dim('\u2500'.repeat(20))}`,
  )

  for (const s of skills) {
    const ownerStr = s.owner ? DIM(`@${s.owner}`) : ''
    const agentStr = s.agents.length
      ? s.agents.map((a) => getAgentDisplayName(a)).join(', ')
      : DIM('(filesystem only)')

    console.log(
      `  ${padEnd(ORANGE(s.slug), cols.slug)}  ${padEnd(ownerStr, cols.owner)}  ${agentStr}`,
    )
  }

  console.log()
}

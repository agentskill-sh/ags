import { readdir, readFile, rm, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { apiFetch } from '../api.js'
import { detectSkillDir } from '../platform.js'
import { installCommand } from './install.js'

interface InstalledSkill {
  slug: string
  owner: string
  contentSha: string
  dir: string
}

interface VersionEntry {
  slug: string
  contentSha: string
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

async function scanInstalled(baseDir: string): Promise<InstalledSkill[]> {
  const skills: InstalledSkill[] = []

  async function scan(dir: string, depth: number): Promise<void> {
    if (depth > 2) return
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
            skills.push({
              slug: meta.slug,
              owner: meta.owner || '',
              contentSha: meta.contentSha || '',
              dir: entryPath,
            })
          }
        } catch {
          // Skip unreadable
        }
      } else {
        await scan(entryPath, depth + 1)
      }
    }
  }

  await scan(baseDir, 0)
  return skills
}

export async function updateCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const baseDir = detectSkillDir()

  if (!existsSync(baseDir)) {
    if (jsonFlag) {
      console.log(JSON.stringify({ updated: [], upToDate: 0 }))
    } else {
      console.log('No skills installed.')
    }
    return
  }

  const installed = await scanInstalled(baseDir)
  if (!installed.length) {
    if (jsonFlag) {
      console.log(JSON.stringify({ updated: [], upToDate: 0 }))
    } else {
      console.log('No skills installed.')
    }
    return
  }

  // Batch version check
  const slugs = installed.map((s) => s.slug).join(',')
  const remote = await apiFetch<VersionEntry[]>(
    `/agent/skills/version?slugs=${encodeURIComponent(slugs)}`,
  )

  const remoteMap = new Map(remote.map((r) => [r.slug, r.contentSha]))
  const outdated = installed.filter(
    (s) => remoteMap.has(s.slug) && remoteMap.get(s.slug) !== s.contentSha,
  )

  if (!outdated.length) {
    if (jsonFlag) {
      console.log(JSON.stringify({ updated: [], upToDate: installed.length }))
    } else {
      console.log(`All ${installed.length} skill(s) are up to date.`)
    }
    return
  }

  if (!jsonFlag) {
    console.log(`\n${outdated.length} update(s) available:\n`)
    for (const s of outdated) {
      console.log(`  - ${s.slug}`)
    }
    console.log('')
  }

  const updated: string[] = []
  for (const s of outdated) {
    try {
      // Remove old version
      await rm(s.dir, { recursive: true, force: true })
      // Re-install via the install command
      await installCommand([s.slug, '--json'])
      updated.push(s.slug)
      if (!jsonFlag) {
        console.log(`  Updated: ${s.slug}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (!jsonFlag) {
        console.error(`  Failed to update ${s.slug}: ${msg}`)
      }
    }
  }

  if (jsonFlag) {
    console.log(JSON.stringify({
      updated,
      upToDate: installed.length - outdated.length,
    }, null, 2))
  } else {
    console.log(`\nDone. ${updated.length} updated, ${installed.length - outdated.length} already current.`)
  }
}

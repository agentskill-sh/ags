import * as p from '@clack/prompts'
import pc from 'picocolors'
import { rmSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { readLock, removeFromLock } from '../skill-lock.js'
import { agents, getAgentDisplayName } from '../agents.js'
import { ORANGE } from '../ui.js'
import { sanitizeName } from '../installer.js'

export async function removeCommand(args: string[]): Promise<void> {
  const yesFlag = args.includes('--yes') || args.includes('-y')
  let slug = args.find((a) => !a.startsWith('--'))

  const lock = readLock()
  const installedSlugs = Object.keys(lock.skills)

  // If no slug provided, show interactive multiselect
  if (!slug) {
    if (!installedSlugs.length) {
      p.log.warn('No skills installed.')
      return
    }

    const selected = await p.multiselect({
      message: 'Select skills to remove:',
      options: installedSlugs.map((s) => ({
        value: s,
        label: s,
        hint: lock.skills[s].agents.map((a) => getAgentDisplayName(a)).join(', '),
      })),
      required: true,
    })

    if (p.isCancel(selected)) {
      p.cancel('Cancelled.')
      return
    }

    const slugs = selected as string[]

    if (!yesFlag) {
      const confirm = await p.confirm({
        message: `Remove ${slugs.length} skill${slugs.length !== 1 ? 's' : ''}?`,
      })

      if (p.isCancel(confirm) || !confirm) {
        p.cancel('Cancelled.')
        return
      }
    }

    for (const s of slugs) {
      removeSkill(s, lock.skills[s]?.agents || [])
      removeFromLock(s)
      p.log.success(`Removed ${ORANGE(s)}`)
    }

    return
  }

  // Single slug removal
  const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug

  if (!yesFlag) {
    const confirm = await p.confirm({
      message: `Remove "${cleanSlug}"?`,
    })

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Cancelled.')
      return
    }
  }

  const entry = lock.skills[cleanSlug]
  const agentsToClean = entry?.agents || []

  removeSkill(cleanSlug, agentsToClean)
  removeFromLock(cleanSlug)

  p.log.success(`Removed ${ORANGE(cleanSlug)}`)
}

function removeSkill(slug: string, agentTypes: string[]): void {
  const safeName = sanitizeName(slug)

  // Remove from each agent's skill directory
  if (agentTypes.length) {
    for (const agentType of agentTypes) {
      const config = agents[agentType]
      if (!config) continue

      const dirs = [
        join(process.cwd(), config.skillsDir, safeName),
        join(config.globalSkillsDir, safeName),
      ]

      for (const dir of dirs) {
        if (existsSync(dir)) {
          rmSync(dir, { recursive: true, force: true })
          cleanupEmptyParent(dir)
        }
      }
    }
  } else {
    // No agents recorded: try all known agent directories
    for (const [, config] of Object.entries(agents)) {
      const dirs = [
        join(process.cwd(), config.skillsDir, safeName),
        join(config.globalSkillsDir, safeName),
      ]

      for (const dir of dirs) {
        if (existsSync(dir)) {
          rmSync(dir, { recursive: true, force: true })
          cleanupEmptyParent(dir)
        }
      }
    }
  }
}

function cleanupEmptyParent(dir: string): void {
  const parent = join(dir, '..')
  try {
    const remaining = readdirSync(parent)
    if (remaining.length === 0) {
      rmSync(parent, { recursive: true, force: true })
    }
  } catch {
    // Ignore
  }
}

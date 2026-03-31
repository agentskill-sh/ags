import * as p from '@clack/prompts'
import pc from 'picocolors'
import { rmSync, existsSync } from 'fs'
import { apiFetch } from '../api.js'
import { readLock, addToLock } from '../skill-lock.js'
import { installToAgents } from '../installer.js'
import { getAgentDisplayName } from '../agents.js'
import { ORANGE } from '../ui.js'
import type { InstallResponse } from '../types.js'

interface VersionEntry {
  slug: string
  contentSha: string
}

export async function updateCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')

  const lock = readLock()
  const installed = Object.values(lock.skills).filter((sk) => sk.slug && sk.contentSha)

  if (!installed.length) {
    if (jsonFlag) {
      console.log(JSON.stringify({ updated: [], upToDate: 0 }))
    } else {
      p.log.warn('No skills installed.')
    }
    return
  }

  const s = p.spinner()
  s.start('Checking for updates...')

  let remote: VersionEntry[]
  try {
    const slugs = installed.map((sk) => sk.slug).join(',')
    remote = await apiFetch<VersionEntry[]>(
      `/agent/skills/version?slugs=${encodeURIComponent(slugs)}`,
    )
  } catch (err) {
    s.error('Failed to check versions')
    throw err
  }

  const remoteMap = new Map(remote.map((r) => [r.slug, r.contentSha]))
  const outdated = installed.filter(
    (sk) => remoteMap.has(sk.slug) && remoteMap.get(sk.slug) !== sk.contentSha,
  )

  if (!outdated.length) {
    s.stop(`All ${installed.length} skill${installed.length !== 1 ? 's' : ''} up to date`)
    if (jsonFlag) {
      console.log(JSON.stringify({ updated: [], upToDate: installed.length }))
    }
    return
  }

  s.stop(`${outdated.length} update${outdated.length !== 1 ? 's' : ''} available`)

  if (jsonFlag) {
    // In JSON mode, proceed without confirmation
    const updated: string[] = []
    for (const sk of outdated) {
      try {
        const data = await apiFetch<InstallResponse>(
          `/agent/skills/${encodeURIComponent(sk.slug)}/install`,
        )
        const results = installToAgents(data, sk.agents)
        const successful = results.filter((r) => r.success)
        if (successful.length) {
          addToLock(data.slug, data.contentSha || '', sk.agents)
          updated.push(sk.slug)
        }
      } catch {
        // Skip failed
      }
    }
    console.log(
      JSON.stringify({
        updated,
        upToDate: installed.length - outdated.length,
      }, null, 2),
    )
    return
  }

  // Show what will be updated
  for (const sk of outdated) {
    const agentNames = sk.agents.map((a) => getAgentDisplayName(a)).join(', ')
    p.log.info(`${ORANGE(sk.slug)} ${pc.dim(`(${agentNames})`)}`)
  }

  const proceed = await p.confirm({
    message: `Update ${outdated.length} skill${outdated.length !== 1 ? 's' : ''}?`,
  })

  if (p.isCancel(proceed) || !proceed) {
    p.cancel('Update cancelled.')
    return
  }

  // Update each skill
  const updated: string[] = []

  for (const sk of outdated) {
    const spin = p.spinner()
    spin.start(`Updating ${sk.slug}...`)

    try {
      const data = await apiFetch<InstallResponse>(
        `/agent/skills/${encodeURIComponent(sk.slug)}/install`,
      )

      // Reinstall to the same agents
      const results = installToAgents(data, sk.agents)
      const successful = results.filter((r) => r.success)

      if (successful.length) {
        addToLock(data.slug, data.contentSha || '', sk.agents)
        updated.push(sk.slug)
        spin.stop(`Updated ${ORANGE(sk.slug)}`)
      } else {
        spin.error(`Failed to update ${sk.slug}`)
      }
    } catch (err) {
      spin.error(`Failed to update ${sk.slug}`)
      p.log.error(err instanceof Error ? err.message : String(err))
    }
  }

  console.log()
  p.log.success(
    `${updated.length} updated, ${installed.length - outdated.length} already current.`,
  )
}

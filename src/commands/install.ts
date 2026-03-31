import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiFetch } from '../api.js'
import { installToAgents } from '../installer.js'
import { addToLock, readLock, getLastSelectedAgents } from '../skill-lock.js'
import { detectInstalledAgents, getAgentDisplayName } from '../agents.js'
import { ORANGE } from '../ui.js'
import type { InstallResponse } from '../types.js'

const GITHUB_URL_RE = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/

function scoreColor(score: number): string {
  if (score >= 70) return pc.green(`${score}/100`)
  if (score >= 30) return pc.yellow(`${score}/100`)
  return pc.red(`${score}/100`)
}

export async function installCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')

  const slugOrUrl = args.find((a) => !a.startsWith('--'))

  if (!slugOrUrl) {
    p.log.error('Usage: ags install <slug|github-url> [--json]')
    process.exit(1)
  }

  let data: InstallResponse

  if (jsonFlag) {
    data = await fetchSkillData(slugOrUrl)
    if (!data.skillMd) {
      console.error(`Skill has no SKILL.md content.`)
      process.exit(1)
    }
    const installed = await detectInstalledAgents()
    const lastAgents = getLastSelectedAgents()
    const agentsToUse = lastAgents.length ? lastAgents : installed.length ? installed : ['claude-code']
    const results = installToAgents(data, agentsToUse)
    addToLock(data.slug, data.contentSha || '', agentsToUse)
    trackInstall(data.slug)
    console.log(
      JSON.stringify(
        {
          slug: data.slug,
          name: data.name,
          owner: data.owner,
          agents: results.filter((r) => r.success).map((r) => r.agent),
          dirs: results.filter((r) => r.success).map((r) => r.dir),
          securityScore: data.securityScore,
          contentQualityScore: data.contentQualityScore,
        },
        null,
        2,
      ),
    )
    return
  }

  const s = p.spinner()

  // Handle GitHub URL: submit first, then install
  if (GITHUB_URL_RE.test(slugOrUrl)) {
    s.start('Importing from GitHub...')
    try {
      const submitted = await apiFetch<{ slug: string }>('/skills/submit', {
        method: 'POST',
        body: JSON.stringify({ url: slugOrUrl }),
      })
      s.stop(`Imported as ${ORANGE(submitted.slug)}`)
      s.start('Fetching skill data...')
      data = await apiFetch<InstallResponse>(
        `/agent/skills/${encodeURIComponent(submitted.slug)}/install`,
      )
      s.stop('Skill data fetched')
    } catch (err) {
      s.error('Import failed')
      throw err
    }
  } else {
    s.start(`Fetching "${slugOrUrl}"...`)
    try {
      data = await fetchSkillData(slugOrUrl)
    } catch (err) {
      s.error('Fetch failed')
      throw err
    }
    s.stop(`Fetched ${ORANGE(data.name)}`)
  }

  if (!data.skillMd) {
    p.log.error(`Skill "${slugOrUrl}" has no SKILL.md content.`)
    process.exit(1)
  }

  // Show security score
  if (data.securityScore != null) {
    p.log.info(`Security: ${scoreColor(data.securityScore)}`)
  }
  if (data.contentQualityScore != null) {
    p.log.info(`Quality: ${scoreColor(data.contentQualityScore)}`)
  }

  // Require confirmation for low security scores
  if (data.securityScore != null && data.securityScore < 30) {
    p.log.warn(
      `This skill has a low security score (${pc.red(String(data.securityScore))}/100).`,
    )
    const proceed = await p.confirm({
      message: 'Install anyway?',
      initialValue: false,
    })
    if (p.isCancel(proceed) || !proceed) {
      p.cancel('Installation cancelled.')
      return
    }
  }

  // Determine which agents to install to
  const installed = await detectInstalledAgents()
  const lastAgents = getLastSelectedAgents()
  const agentsToUse =
    lastAgents.length ? lastAgents : installed.length ? installed : ['claude-code']

  // Install to agents
  const results = installToAgents(data, agentsToUse)

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  for (const r of successful) {
    p.log.success(
      `Installed to ${pc.bold(getAgentDisplayName(r.agent))} ${pc.dim(r.dir)}`,
    )
  }
  for (const r of failed) {
    p.log.error(
      `Failed for ${pc.bold(getAgentDisplayName(r.agent))}: ${r.error}`,
    )
  }

  // Track in lock file
  if (successful.length) {
    addToLock(data.slug, data.contentSha || '', agentsToUse)
  }

  // Track install (fire and forget)
  trackInstall(data.slug)

  if (successful.length) {
    p.log.step(
      `${ORANGE(data.name)} is ready. Restart your agent or reload skills to use it.`,
    )
  }
}

async function fetchSkillData(slugOrUrl: string): Promise<InstallResponse> {
  const cleanSlug = slugOrUrl.startsWith('@') ? slugOrUrl.slice(1) : slugOrUrl
  const apiPath = `/agent/skills/${encodeURIComponent(cleanSlug)}/install`
  return apiFetch<InstallResponse>(apiPath)
}

function trackInstall(slug: string): void {
  apiFetch(`/skills/${encodeURIComponent(slug)}/install`, {
    method: 'POST',
    body: JSON.stringify({
      platform: 'ags',
      agentName: 'ags',
      sessionId: `cli-${Date.now()}`,
    }),
  }).catch(() => {})
}

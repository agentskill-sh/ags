import * as p from '@clack/prompts'
import pc from 'picocolors'
import { apiFetch } from '../api.js'
import { ORANGE } from '../ui.js'
import {
  detectInstalledAgents,
  getUniversalAgents,
  getNonUniversalAgents,
  getAgentDisplayName,
} from '../agents.js'
import { installToAgents } from '../installer.js'
import { addToLock, saveSelectedAgents } from '../skill-lock.js'
import type { InstallResponse } from '../types.js'

const OFFICIAL_SKILLS = ['agentskill-sh/learn', 'agentskill-sh/review-skill']

export async function setupCommand(_args: string[]): Promise<void> {

  // Detect installed agents
  const s = p.spinner()
  s.start('Detecting installed agents...')

  const installedAgents = await detectInstalledAgents()

  if (!installedAgents.length) {
    s.stop('No agents detected')
    p.log.warn('No AI agents detected on this machine.')
    p.log.info(
      `We will install to ${pc.bold('Claude Code')} by default. You can change this later.`,
    )
    installedAgents.push('claude-code')
  } else {
    s.stop(
      `Found ${installedAgents.length} agent${installedAgents.length !== 1 ? 's' : ''}`,
    )
  }

  // Show agent selection
  const universal = getUniversalAgents().filter((a) => installedAgents.includes(a))
  const nonUniversal = getNonUniversalAgents().filter((a) => installedAgents.includes(a))

  // Build options
  const options = [
    ...universal.map((a) => ({
      value: a,
      label: `${getAgentDisplayName(a)} ${pc.dim('(.agents/skills)')}`,
      hint: 'universal',
    })),
    ...nonUniversal.map((a) => ({
      value: a,
      label: getAgentDisplayName(a),
    })),
  ]

  let selectedAgents: string[]

  if (options.length > 1) {
    const selected = await p.multiselect({
      message: 'Select agents to install skills to:',
      options,
      initialValues: installedAgents,
      required: true,
    })

    if (p.isCancel(selected)) {
      p.cancel('Setup cancelled.')
      process.exit(0)
    }

    selectedAgents = selected as string[]
  } else {
    selectedAgents = installedAgents
    p.log.step(
      `Installing to ${pc.bold(getAgentDisplayName(installedAgents[0]))}`,
    )
  }

  // Save selected agents
  saveSelectedAgents(selectedAgents)

  // Install official skills
  p.log.step(
    `Installing ${OFFICIAL_SKILLS.length} official skill${OFFICIAL_SKILLS.length !== 1 ? 's' : ''}...`,
  )

  for (const slug of OFFICIAL_SKILLS) {
    const spin = p.spinner()
    spin.start(`Fetching ${slug}...`)

    try {
      const data = await apiFetch<InstallResponse>(
        `/agent/skills/${encodeURIComponent(slug)}/install`,
      )

      if (!data.skillMd) {
        spin.error(`${slug} has no SKILL.md`)
        continue
      }

      spin.stop(`Fetched ${ORANGE(data.name)}`)

      const results = installToAgents(data, selectedAgents)
      const successful = results.filter((r) => r.success)

      if (successful.length) {
        addToLock(data.slug, data.contentSha || '', selectedAgents)
        p.log.success(
          `${ORANGE(data.name)} installed to ${successful.length} agent${successful.length !== 1 ? 's' : ''}`,
        )
      }

      const failed = results.filter((r) => !r.success)
      for (const r of failed) {
        p.log.warn(`Failed for ${getAgentDisplayName(r.agent)}: ${r.error}`)
      }
    } catch (err) {
      spin.error(`Failed to install ${slug}`)
      p.log.error(err instanceof Error ? err.message : String(err))
    }
  }

  // Offer to install globally
  console.log()
  const installGlobal = await p.confirm({
    message: 'Install ags globally? (npm install -g @agentskill.sh/cli)',
    initialValue: false,
  })

  if (!p.isCancel(installGlobal) && installGlobal) {
    const gs = p.spinner()
    gs.start('Installing globally...')
    try {
      const { execSync } = await import('child_process')
      execSync('npm install -g @agentskill.sh/cli', { stdio: 'pipe' })
      gs.stop('Installed globally')
      p.log.success('You can now use `ags` from anywhere.')
    } catch {
      gs.error('Global install failed')
      p.log.info('You can install manually: npm install -g @agentskill.sh/cli')
    }
  }

  console.log()
  p.outro(pc.green('Setup complete! Restart your agent to use the new skills.'))
}

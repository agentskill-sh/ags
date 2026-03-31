import { writeFileSync, mkdirSync, symlinkSync, copyFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import type { AgentType, InstallResponse, InstallMode } from './types.js'
import { agents } from './agents.js'

export interface InstallOptions {
  global?: boolean
  mode?: InstallMode
}

export interface InstallResult {
  agent: string
  dir: string
  files: string[]
  success: boolean
  error?: string
}

/**
 * Sanitize a skill name into a filesystem-safe slug.
 * Strips @owner/ prefix, lowercases, replaces non-alphanumeric with hyphens.
 */
export function sanitizeName(name: string): string {
  return name
    .replace(/^@[^/]+\//, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Resolve the target directory for a skill given an agent and scope.
 */
function resolveSkillDir(agentType: AgentType, slug: string, global: boolean): string {
  const config = agents[agentType]
  if (!config) throw new Error(`Unknown agent: ${agentType}`)
  const baseDir = global ? config.globalSkillsDir : join(process.cwd(), config.skillsDir)
  return join(baseDir, sanitizeName(slug))
}

/**
 * Write SKILL.md and supporting files to a target directory.
 */
function writeSkillFiles(targetDir: string, skillData: InstallResponse): string[] {
  mkdirSync(targetDir, { recursive: true })

  writeFileSync(join(targetDir, 'SKILL.md'), skillData.skillMd, 'utf-8')
  const written = ['SKILL.md']

  if (skillData.skillFiles?.length) {
    for (const file of skillData.skillFiles) {
      if (file.path && file.content) {
        const filePath = join(targetDir, file.path)
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, file.content, 'utf-8')
        written.push(file.path)
      }
    }
  }

  return written
}

/**
 * Recursively copy all files from source to target directory.
 */
function copyDir(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true })
  for (const entry of readdirSync(sourceDir)) {
    const src = join(sourceDir, entry)
    const dst = join(targetDir, entry)
    if (statSync(src).isDirectory()) {
      copyDir(src, dst)
    } else {
      copyFileSync(src, dst)
    }
  }
}

/**
 * Install a skill to a single agent directory.
 * Returns the path where the skill was installed.
 */
export function installSkillToAgent(
  skillData: InstallResponse,
  agentType: AgentType,
  options: InstallOptions = {},
): InstallResult {
  const dir = resolveSkillDir(agentType, skillData.slug, options.global ?? false)
  try {
    const files = writeSkillFiles(dir, skillData)
    return { agent: agentType, dir, files, success: true }
  } catch (err) {
    return {
      agent: agentType,
      dir,
      files: [],
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Install a skill to multiple agents.
 *
 * Strategy:
 *   1. First agent gets the canonical (full) copy of all files.
 *   2. Remaining agents get a directory symlink pointing to the canonical copy.
 *   3. If symlink creation fails (permissions, cross-device, Windows), falls back to a full copy.
 *
 * Set options.mode = 'copy' to skip symlinks entirely.
 */
export function installToAgents(
  skillData: InstallResponse,
  agentTypes: AgentType[],
  options: InstallOptions = {},
): InstallResult[] {
  if (agentTypes.length === 0) {
    throw new Error('At least one agent must be specified')
  }

  const mode = options.mode ?? 'symlink'
  const results: InstallResult[] = []

  // First agent: canonical full copy
  const canonical = installSkillToAgent(skillData, agentTypes[0], options)
  results.push(canonical)

  if (!canonical.success) return results

  // Remaining agents: symlink or copy
  for (let i = 1; i < agentTypes.length; i++) {
    const agentType = agentTypes[i]
    const targetDir = resolveSkillDir(agentType, skillData.slug, options.global ?? false)

    if (mode === 'symlink') {
      try {
        mkdirSync(dirname(targetDir), { recursive: true })
        symlinkSync(canonical.dir, targetDir)
        results.push({
          agent: agentType,
          dir: targetDir,
          files: canonical.files,
          success: true,
        })
      } catch {
        // Symlink failed, fall back to full copy
        try {
          copyDir(canonical.dir, targetDir)
          results.push({
            agent: agentType,
            dir: targetDir,
            files: canonical.files,
            success: true,
          })
        } catch (err) {
          results.push({
            agent: agentType,
            dir: targetDir,
            files: [],
            success: false,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    } else {
      // Copy mode: write full copy for each agent
      results.push(installSkillToAgent(skillData, agentType, options))
    }
  }

  return results
}

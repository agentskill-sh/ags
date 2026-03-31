import { existsSync } from 'fs'
import { join } from 'path'

export const PLATFORM_SKILL_DIRS: Record<string, string> = {
  'claude-code': '.claude/skills',
  'claude': '.claude/skills',
  'claude-cowork': '.claude/skills',
  'claude-desktop': '.claude/skills',
  'cursor': '.cursor/skills',
  'copilot': '.github/copilot/skills',
  'github-copilot': '.github/copilot/skills',
  'codex': '.codex/skills',
  'chatgpt': '.chatgpt/skills',
  'windsurf': '.windsurf/skills',
  'cline': '.cline/skills',
  'vscode': '.vscode/skills',
  'opencode': '.opencode/skills',
  'aider': '.aider/skills',
  'gemini-cli': '.gemini/skills',
  'amp': '.amp/skills',
  'goose': '.goose/skills',
  'roo-code': '.roo-code/skills',
  'trae': '.trae/skills',
  'hermes': '.hermes/skills',
}

/** Detect the skill directory by checking which platform dirs exist in cwd */
export function detectSkillDir(platformOverride?: string): string {
  const cwd = process.cwd()

  if (platformOverride && PLATFORM_SKILL_DIRS[platformOverride]) {
    return join(cwd, PLATFORM_SKILL_DIRS[platformOverride])
  }

  for (const [, dir] of Object.entries(PLATFORM_SKILL_DIRS)) {
    // Check if the parent platform dir exists (e.g. .claude/, .cursor/)
    const parentDir = dir.split('/')[0]
    if (existsSync(join(cwd, parentDir))) {
      return join(cwd, dir)
    }
  }

  // Default to Claude Code
  return join(cwd, '.claude/skills')
}

/** Detect the platform name from cwd */
export function detectPlatform(): string {
  const cwd = process.cwd()

  const checks: [string, string][] = [
    ['claude-code', '.claude'],
    ['cursor', '.cursor'],
    ['copilot', '.github/copilot'],
    ['windsurf', '.windsurf'],
    ['cline', '.cline'],
    ['codex', '.codex'],
    ['opencode', '.opencode'],
    ['aider', '.aider'],
    ['gemini-cli', '.gemini'],
    ['amp', '.amp'],
    ['goose', '.goose'],
    ['roo-code', '.roo-code'],
    ['trae', '.trae'],
  ]

  for (const [name, dir] of checks) {
    if (existsSync(join(cwd, dir))) return name
  }

  return 'claude-code'
}

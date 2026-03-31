import { homedir } from 'os'
import { join } from 'path'
import { existsSync } from 'fs'
import type { AgentConfig, AgentType } from './types.js'

const home = homedir()
const configHome = process.env.XDG_CONFIG_HOME || join(home, '.config')
const codexHome = process.env.CODEX_HOME?.trim() || join(home, '.codex')
const claudeHome = process.env.CLAUDE_CONFIG_DIR?.trim() || join(home, '.claude')

export const agents: Record<AgentType, AgentConfig> = {
  // Universal agents (use .agents/skills)
  amp: {
    name: 'amp',
    displayName: 'Amp',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(configHome, 'agents/skills'),
    detectInstalled: async () => existsSync(join(configHome, 'amp')),
  },
  antigravity: {
    name: 'antigravity',
    displayName: 'Antigravity',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.gemini/antigravity/skills'),
    detectInstalled: async () => existsSync(join(home, '.gemini/antigravity')),
  },
  cline: {
    name: 'cline',
    displayName: 'Cline',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.agents/skills'),
    detectInstalled: async () => existsSync(join(home, '.cline')),
  },
  codex: {
    name: 'codex',
    displayName: 'Codex',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(codexHome, 'skills'),
    detectInstalled: async () => existsSync(codexHome) || existsSync('/etc/codex'),
  },
  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.cursor/skills'),
    detectInstalled: async () => existsSync(join(home, '.cursor')),
  },
  deepagents: {
    name: 'deepagents',
    displayName: 'Deep Agents',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.deepagents/agent/skills'),
    detectInstalled: async () => existsSync(join(home, '.deepagents')),
  },
  firebender: {
    name: 'firebender',
    displayName: 'Firebender',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.firebender/skills'),
    detectInstalled: async () => existsSync(join(home, '.firebender')),
  },
  'gemini-cli': {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.gemini/skills'),
    detectInstalled: async () => existsSync(join(home, '.gemini')),
  },
  'github-copilot': {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.copilot/skills'),
    detectInstalled: async () => existsSync(join(home, '.copilot')),
  },
  'kimi-cli': {
    name: 'kimi-cli',
    displayName: 'Kimi Code CLI',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(configHome, 'agents/skills'),
    detectInstalled: async () => existsSync(join(home, '.kimi')),
  },
  opencode: {
    name: 'opencode',
    displayName: 'OpenCode',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(configHome, 'opencode/skills'),
    detectInstalled: async () => existsSync(join(configHome, 'opencode')),
  },
  warp: {
    name: 'warp',
    displayName: 'Warp',
    skillsDir: '.agents/skills',
    globalSkillsDir: join(home, '.agents/skills'),
    detectInstalled: async () => existsSync(join(home, '.warp')),
  },

  // Non-universal agents (agent-specific skill dirs)
  augment: {
    name: 'augment',
    displayName: 'Augment',
    skillsDir: '.augment/skills',
    globalSkillsDir: join(home, '.augment/skills'),
    detectInstalled: async () => existsSync(join(home, '.augment')),
  },
  bob: {
    name: 'bob',
    displayName: 'IBM Bob',
    skillsDir: '.bob/skills',
    globalSkillsDir: join(home, '.bob/skills'),
    detectInstalled: async () => existsSync(join(home, '.bob')),
  },
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    skillsDir: '.claude/skills',
    globalSkillsDir: join(claudeHome, 'skills'),
    detectInstalled: async () => existsSync(claudeHome),
  },
  openclaw: {
    name: 'openclaw',
    displayName: 'OpenClaw',
    skillsDir: 'skills',
    globalSkillsDir: join(home, '.openclaw/skills'),
    detectInstalled: async () =>
      existsSync(join(home, '.openclaw')) ||
      existsSync(join(home, '.clawdbot')) ||
      existsSync(join(home, '.moltbot')),
  },
  codebuddy: {
    name: 'codebuddy',
    displayName: 'CodeBuddy',
    skillsDir: '.codebuddy/skills',
    globalSkillsDir: join(home, '.codebuddy/skills'),
    detectInstalled: async () => existsSync(join(home, '.codebuddy')),
  },
  'command-code': {
    name: 'command-code',
    displayName: 'Command Code',
    skillsDir: '.commandcode/skills',
    globalSkillsDir: join(home, '.commandcode/skills'),
    detectInstalled: async () => existsSync(join(home, '.commandcode')),
  },
  continue: {
    name: 'continue',
    displayName: 'Continue',
    skillsDir: '.continue/skills',
    globalSkillsDir: join(home, '.continue/skills'),
    detectInstalled: async () => existsSync(join(home, '.continue')),
  },
  cortex: {
    name: 'cortex',
    displayName: 'Cortex Code',
    skillsDir: '.cortex/skills',
    globalSkillsDir: join(home, '.snowflake/cortex/skills'),
    detectInstalled: async () => existsSync(join(home, '.snowflake/cortex')),
  },
  crush: {
    name: 'crush',
    displayName: 'Crush',
    skillsDir: '.crush/skills',
    globalSkillsDir: join(configHome, 'crush/skills'),
    detectInstalled: async () => existsSync(join(configHome, 'crush')),
  },
  droid: {
    name: 'droid',
    displayName: 'Droid',
    skillsDir: '.factory/skills',
    globalSkillsDir: join(home, '.factory/skills'),
    detectInstalled: async () => existsSync(join(home, '.factory')),
  },
  goose: {
    name: 'goose',
    displayName: 'Goose',
    skillsDir: '.goose/skills',
    globalSkillsDir: join(configHome, 'goose/skills'),
    detectInstalled: async () => existsSync(join(configHome, 'goose')),
  },
  junie: {
    name: 'junie',
    displayName: 'Junie',
    skillsDir: '.junie/skills',
    globalSkillsDir: join(home, '.junie/skills'),
    detectInstalled: async () => existsSync(join(home, '.junie')),
  },
  'iflow-cli': {
    name: 'iflow-cli',
    displayName: 'iFlow CLI',
    skillsDir: '.iflow/skills',
    globalSkillsDir: join(home, '.iflow/skills'),
    detectInstalled: async () => existsSync(join(home, '.iflow')),
  },
  kilo: {
    name: 'kilo',
    displayName: 'Kilo Code',
    skillsDir: '.kilocode/skills',
    globalSkillsDir: join(home, '.kilocode/skills'),
    detectInstalled: async () => existsSync(join(home, '.kilocode')),
  },
  'kiro-cli': {
    name: 'kiro-cli',
    displayName: 'Kiro CLI',
    skillsDir: '.kiro/skills',
    globalSkillsDir: join(home, '.kiro/skills'),
    detectInstalled: async () => existsSync(join(home, '.kiro')),
  },
  kode: {
    name: 'kode',
    displayName: 'Kode',
    skillsDir: '.kode/skills',
    globalSkillsDir: join(home, '.kode/skills'),
    detectInstalled: async () => existsSync(join(home, '.kode')),
  },
  mcpjam: {
    name: 'mcpjam',
    displayName: 'MCPJam',
    skillsDir: '.mcpjam/skills',
    globalSkillsDir: join(home, '.mcpjam/skills'),
    detectInstalled: async () => existsSync(join(home, '.mcpjam')),
  },
  'mistral-vibe': {
    name: 'mistral-vibe',
    displayName: 'Mistral Vibe',
    skillsDir: '.vibe/skills',
    globalSkillsDir: join(home, '.vibe/skills'),
    detectInstalled: async () => existsSync(join(home, '.vibe')),
  },
  mux: {
    name: 'mux',
    displayName: 'Mux',
    skillsDir: '.mux/skills',
    globalSkillsDir: join(home, '.mux/skills'),
    detectInstalled: async () => existsSync(join(home, '.mux')),
  },
  openhands: {
    name: 'openhands',
    displayName: 'OpenHands',
    skillsDir: '.openhands/skills',
    globalSkillsDir: join(home, '.openhands/skills'),
    detectInstalled: async () => existsSync(join(home, '.openhands')),
  },
  pi: {
    name: 'pi',
    displayName: 'Pi',
    skillsDir: '.pi/skills',
    globalSkillsDir: join(home, '.pi/agent/skills'),
    detectInstalled: async () => existsSync(join(home, '.pi/agent')),
  },
  qoder: {
    name: 'qoder',
    displayName: 'Qoder',
    skillsDir: '.qoder/skills',
    globalSkillsDir: join(home, '.qoder/skills'),
    detectInstalled: async () => existsSync(join(home, '.qoder')),
  },
  'qwen-code': {
    name: 'qwen-code',
    displayName: 'Qwen Code',
    skillsDir: '.qwen/skills',
    globalSkillsDir: join(home, '.qwen/skills'),
    detectInstalled: async () => existsSync(join(home, '.qwen')),
  },
  roo: {
    name: 'roo',
    displayName: 'Roo Code',
    skillsDir: '.roo/skills',
    globalSkillsDir: join(home, '.roo/skills'),
    detectInstalled: async () => existsSync(join(home, '.roo')),
  },
  trae: {
    name: 'trae',
    displayName: 'Trae',
    skillsDir: '.trae/skills',
    globalSkillsDir: join(home, '.trae/skills'),
    detectInstalled: async () => existsSync(join(home, '.trae')),
  },
  'trae-cn': {
    name: 'trae-cn',
    displayName: 'Trae CN',
    skillsDir: '.trae/skills',
    globalSkillsDir: join(home, '.trae-cn/skills'),
    detectInstalled: async () => existsSync(join(home, '.trae-cn')),
  },
  windsurf: {
    name: 'windsurf',
    displayName: 'Windsurf',
    skillsDir: '.windsurf/skills',
    globalSkillsDir: join(home, '.codeium/windsurf/skills'),
    detectInstalled: async () => existsSync(join(home, '.codeium/windsurf')),
  },
  zencoder: {
    name: 'zencoder',
    displayName: 'Zencoder',
    skillsDir: '.zencoder/skills',
    globalSkillsDir: join(home, '.zencoder/skills'),
    detectInstalled: async () => existsSync(join(home, '.zencoder')),
  },
  neovate: {
    name: 'neovate',
    displayName: 'Neovate',
    skillsDir: '.neovate/skills',
    globalSkillsDir: join(home, '.neovate/skills'),
    detectInstalled: async () => existsSync(join(home, '.neovate')),
  },
  pochi: {
    name: 'pochi',
    displayName: 'Pochi',
    skillsDir: '.pochi/skills',
    globalSkillsDir: join(home, '.pochi/skills'),
    detectInstalled: async () => existsSync(join(home, '.pochi')),
  },
  adal: {
    name: 'adal',
    displayName: 'AdaL',
    skillsDir: '.adal/skills',
    globalSkillsDir: join(home, '.adal/skills'),
    detectInstalled: async () => existsSync(join(home, '.adal')),
  },
  hermes: {
    name: 'hermes',
    displayName: 'Hermes',
    skillsDir: '.hermes/skills',
    globalSkillsDir: join(home, '.hermes/skills'),
    detectInstalled: async () => existsSync(join(home, '.hermes')),
  },
}

/** Detect all agents installed on the machine */
export async function detectInstalledAgents(): Promise<AgentType[]> {
  const results = await Promise.all(
    Object.entries(agents).map(async ([type, config]) => ({
      type,
      installed: await config.detectInstalled(),
    })),
  )
  return results.filter((r) => r.installed).map((r) => r.type)
}

/** Agents that use the universal .agents/skills directory */
export function getUniversalAgents(): AgentType[] {
  return Object.entries(agents)
    .filter(([, config]) => config.skillsDir === '.agents/skills' && config.showInUniversalList !== false)
    .map(([type]) => type)
}

/** Agents that need their own skill directory */
export function getNonUniversalAgents(): AgentType[] {
  return Object.entries(agents)
    .filter(([, config]) => config.skillsDir !== '.agents/skills')
    .map(([type]) => type)
}

export function isUniversalAgent(type: AgentType): boolean {
  return agents[type]?.skillsDir === '.agents/skills'
}

export function getAgentDisplayName(type: AgentType): string {
  return agents[type]?.displayName || type
}

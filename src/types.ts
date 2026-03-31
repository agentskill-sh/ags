export interface AgentConfig {
  name: string
  displayName: string
  /** Project-level skill directory (relative to cwd) */
  skillsDir: string
  /** Global skill directory (absolute path) */
  globalSkillsDir: string
  /** Whether to show in the universal agents list */
  showInUniversalList?: boolean
  /** Detect if this agent is installed on the machine */
  detectInstalled: () => Promise<boolean>
}

export type AgentType = string

export interface SearchResult {
  slug: string
  name: string
  owner: string
  description: string
  installCount: number
  securityScore: number | null
  contentQualityScore: number | null
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  hasMore: boolean
}

export interface InstallResponse {
  slug: string
  name: string
  owner: string
  description: string
  skillMd: string
  skillFiles: { path: string; content: string }[]
  skillFolder: string
  installPath: string
  contentSha: string | null
  securityScore: number | null
  contentQualityScore: number | null
  score: number
  ratingCount: number
  installCount: number
}

export interface SkillLockEntry {
  slug: string
  contentSha: string
  installedAt: string
  agents: string[]
}

export interface SkillLockFile {
  version: number
  skills: Record<string, SkillLockEntry>
  lastSelectedAgents?: string[]
}

export type InstallMode = 'symlink' | 'copy'

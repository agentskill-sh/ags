import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'
import type { SkillLockFile, SkillLockEntry } from './types.js'

export const LOCK_VERSION = 1

/**
 * Resolve the path to .skill-lock.json.
 * Uses XDG_STATE_HOME if set, otherwise falls back to ~/.agents/.skill-lock.json.
 */
export function getLockPath(): string {
  const stateHome = process.env.XDG_STATE_HOME
  if (stateHome) {
    return join(stateHome, 'agentskill', '.skill-lock.json')
  }
  return join(homedir(), '.agents', '.skill-lock.json')
}

/** Read and parse the lock file. Returns an empty lock if the file is missing or corrupt. */
export function readLock(): SkillLockFile {
  const lockPath = getLockPath()
  if (!existsSync(lockPath)) {
    return { version: LOCK_VERSION, skills: {} }
  }
  try {
    const raw = readFileSync(lockPath, 'utf-8')
    return JSON.parse(raw) as SkillLockFile
  } catch {
    return { version: LOCK_VERSION, skills: {} }
  }
}

/** Write the lock file to disk (creates parent directories if needed). */
export function writeLock(lock: SkillLockFile): void {
  const lockPath = getLockPath()
  mkdirSync(dirname(lockPath), { recursive: true })
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8')
}

/** Add or update a skill entry in the lock file. */
export function addToLock(slug: string, contentSha: string, agents: string[]): void {
  const lock = readLock()
  lock.skills[slug] = {
    slug,
    contentSha,
    installedAt: new Date().toISOString(),
    agents,
  }
  writeLock(lock)
}

/** Remove a skill entry from the lock file. */
export function removeFromLock(slug: string): void {
  const lock = readLock()
  delete lock.skills[slug]
  writeLock(lock)
}

/** Get the last saved agent selection (for remembering user choice across runs). */
export function getLastSelectedAgents(): string[] {
  const lock = readLock()
  return lock.lastSelectedAgents ?? []
}

/** Save the current agent selection to the lock file. */
export function saveSelectedAgents(agents: string[]): void {
  const lock = readLock()
  lock.lastSelectedAgents = agents
  writeLock(lock)
}

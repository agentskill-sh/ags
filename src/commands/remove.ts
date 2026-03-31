import { rm } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { detectSkillDir } from '../platform.js'

export async function removeCommand(args: string[]): Promise<void> {
  const slug = args.find(a => !a.startsWith('--'))

  if (!slug) {
    console.error('Usage: ags remove <slug>')
    process.exit(1)
  }

  const baseDir = detectSkillDir()
  // Handle both "slug" and "owner/slug" formats
  const cleanSlug = slug.startsWith('@') ? slug.slice(1) : slug
  const skillDir = join(baseDir, cleanSlug)

  if (!existsSync(skillDir)) {
    console.error(`Skill "${slug}" is not installed.`)
    console.error(`Directory not found: ${skillDir}`)
    process.exit(1)
  }

  await rm(skillDir, { recursive: true })

  // Clean up empty owner directory if it was a nested path
  if (cleanSlug.includes('/')) {
    const ownerDir = join(baseDir, cleanSlug.split('/')[0])
    try {
      const { readdir } = await import('fs/promises')
      const remaining = await readdir(ownerDir)
      if (remaining.length === 0) await rm(ownerDir, { recursive: true })
    } catch { /* ignore */ }
  }

  console.log(`Removed "${cleanSlug}" from installed skills.`)
}

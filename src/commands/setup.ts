import { installCommand } from './install.js'

// Official skills bundled with the ags CLI
const OFFICIAL_SKILLS = [
  'agentskill-sh/learn',
  'agentskill-sh/review-skill',
]

export async function setupCommand(args: string[]): Promise<void> {
  const jsonFlag = args.includes('--json')
  const results: { slug: string; status: string }[] = []

  if (!jsonFlag) {
    console.log(`\nInstalling ${OFFICIAL_SKILLS.length} official skills...\n`)
  }

  // Temporarily suppress console.log from installCommand --json output
  const origLog = console.log
  for (const slug of OFFICIAL_SKILLS) {
    try {
      console.log = () => {} // suppress install JSON output
      await installCommand([slug, '--json'])
      console.log = origLog
      results.push({ slug, status: 'installed' })
      if (!jsonFlag) {
        console.log(`  Installed: ${slug}`)
      }
    } catch (err) {
      console.log = origLog
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ slug, status: `failed: ${msg}` })
      if (!jsonFlag) {
        console.error(`  Failed: ${slug} - ${msg}`)
      }
    }
  }

  if (jsonFlag) {
    console.log(JSON.stringify({ skills: results }, null, 2))
  } else {
    console.log(`\nDone. ${results.filter((r) => r.status === 'installed').length}/${OFFICIAL_SKILLS.length} skills installed.`)
    console.log('Restart your agent or open a new session to activate.')
  }
}

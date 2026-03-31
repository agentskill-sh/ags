#!/usr/bin/env node

import { searchCommand } from './commands/search.js'
import { installCommand } from './commands/install.js'
import { listCommand } from './commands/list.js'
import { removeCommand } from './commands/remove.js'
import { feedbackCommand } from './commands/feedback.js'
import { updateCommand } from './commands/update.js'

const VERSION = '1.0.0'

const HELP = `ags v${VERSION} — search, install, and manage AI agent skills

Usage:
  ags search <query> [--json] [--limit N] [--platform NAME]
  ags install <slug>  [--json] [--platform NAME]
  ags list            [--json]
  ags remove <slug>
  ags feedback <slug> <1-5> [comment]
  ags update
  ags --version
  ags --help

Commands:
  search    Search for skills on agentskill.sh
  install   Install a skill to your project
  list      Show installed skills
  remove    Uninstall a skill
  feedback  Rate a skill (1-5) with optional comment
  update    Check for and apply skill updates

Examples:
  ags search react
  ags install seo-optimizer
  ags install @anthropics/react-best-practices
  ags list --json
  ags remove seo-optimizer
  ags feedback seo-optimizer 5 "Worked perfectly"
  ags update

More info: https://agentskill.sh/docs
`

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP)
    return
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION)
    return
  }

  const command = args[0]
  const commandArgs = args.slice(1)

  try {
    switch (command) {
      case 'search':
      case 's':
        await searchCommand(commandArgs)
        break
      case 'install':
      case 'i':
        await installCommand(commandArgs)
        break
      case 'list':
      case 'ls':
        await listCommand(commandArgs)
        break
      case 'remove':
      case 'rm':
      case 'uninstall':
        await removeCommand(commandArgs)
        break
      case 'feedback':
      case 'rate':
        await feedbackCommand(commandArgs)
        break
      case 'update':
      case 'upgrade':
        await updateCommand(commandArgs)
        break
      default:
        console.error(`Unknown command: ${command}`)
        console.error('Run "ags --help" for usage.')
        process.exit(1)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${message}`)
    process.exit(1)
  }
}

main()

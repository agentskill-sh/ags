#!/usr/bin/env node

import { searchCommand } from './commands/search.js'
import { installCommand } from './commands/install.js'
import { listCommand } from './commands/list.js'
import { removeCommand } from './commands/remove.js'
import { feedbackCommand } from './commands/feedback.js'
import { updateCommand } from './commands/update.js'

const VERSION = '0.2.0'

const HELP = `learn-skills v${VERSION} — search, install, and manage AI agent skills

Usage:
  learn-skills search <query> [--json] [--limit N] [--platform NAME]
  learn-skills install <slug>  [--json] [--platform NAME]
  learn-skills list            [--json]
  learn-skills remove <slug>
  learn-skills feedback <slug> <1-5> [comment]
  learn-skills update
  learn-skills --version
  learn-skills --help

Commands:
  search    Search for skills on agentskill.sh
  install   Install a skill to your project
  list      Show installed skills
  remove    Uninstall a skill
  feedback  Rate a skill (1-5) with optional comment
  update    Check for and apply skill updates

Examples:
  learn-skills search react
  learn-skills install seo-optimizer
  learn-skills install @anthropics/react-best-practices
  learn-skills list --json
  learn-skills remove seo-optimizer
  learn-skills feedback seo-optimizer 5 "Worked perfectly"
  learn-skills update

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
        console.error('Run "learn-skills --help" for usage.')
        process.exit(1)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`Error: ${message}`)
    process.exit(1)
  }
}

main()

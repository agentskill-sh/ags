#!/usr/bin/env node

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pc from 'picocolors'
import { showLogo, ORANGE, DIM } from './ui.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))
const VERSION: string = pkg.version

const CMD = 'npx @agentskill.sh/cli'

function printHelp(): void {
  showLogo()
  console.log(`  ${DIM('The package manager for AI agent skills')}  ${DIM('v' + VERSION)}`)
  console.log()
  console.log(`  ${pc.bold('Usage:')}`)
  console.log(`    ${DIM('$')} ${CMD} ${ORANGE('<command>')} ${DIM('[options]')}`)
  console.log()
  console.log(`  ${pc.bold('Commands:')}`)
  console.log(`    ${ORANGE('search')}   ${DIM('s')}      Search for skills on agentskill.sh`)
  console.log(`    ${ORANGE('install')}  ${DIM('i')}      Install a skill to your project`)
  console.log(`    ${ORANGE('setup')}             Install all official agentskill.sh skills`)
  console.log(`    ${ORANGE('find')}     ${DIM('f')}      Browse and discover skills interactively`)
  console.log(`    ${ORANGE('init')}              Scaffold a new SKILL.md`)
  console.log(`    ${ORANGE('list')}     ${DIM('ls')}     Show installed skills`)
  console.log(`    ${ORANGE('remove')}   ${DIM('rm')}     Uninstall a skill`)
  console.log(`    ${ORANGE('feedback')} ${DIM('rate')}   Rate a skill (1-5) with optional comment`)
  console.log(`    ${ORANGE('update')}            Update installed skills to latest versions`)
  console.log()
  console.log(`  ${pc.bold('Examples:')}`)
  console.log(`    ${DIM('$')} ${CMD} setup`)
  console.log(`    ${DIM('$')} ${CMD} search react`)
  console.log(`    ${DIM('$')} ${CMD} install seo-optimizer`)
  console.log(`    ${DIM('$')} ${CMD} install @anthropics/react-best-practices`)
  console.log(`    ${DIM('$')} ${CMD} list`)
  console.log(`    ${DIM('$')} ${CMD} feedback seo-optimizer 5 "Worked perfectly"`)
  console.log()
  console.log(`  ${DIM('More info:')} ${pc.underline('https://agentskill.sh/install')}`)
  console.log()
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // No args: show full banner with commands
  if (args.length === 0) {
    printHelp()
    return
  }

  // Flags that bypass command routing
  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    return
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(VERSION)
    return
  }

  // Show logo on interactive commands (skip for --json)
  if (!args.includes('--json')) {
    showLogo()
  }

  const command = args[0]
  const commandArgs = args.slice(1)

  try {
    switch (command) {
      case 'search':
      case 's': {
        const { searchCommand } = await import('./commands/search.js')
        await searchCommand(commandArgs)
        break
      }
      case 'install':
      case 'i': {
        const { installCommand } = await import('./commands/install.js')
        await installCommand(commandArgs)
        break
      }
      case 'setup': {
        const { setupCommand } = await import('./commands/setup.js')
        await setupCommand(commandArgs)
        break
      }
      case 'init': {
        const { initCommand } = await import('./commands/init.js')
        await initCommand(commandArgs)
        break
      }
      case 'find':
      case 'f': {
        const { findCommand } = await import('./commands/find.js')
        await findCommand(commandArgs)
        break
      }
      case 'list':
      case 'ls': {
        const { listCommand } = await import('./commands/list.js')
        await listCommand(commandArgs)
        break
      }
      case 'remove':
      case 'rm': {
        const { removeCommand } = await import('./commands/remove.js')
        await removeCommand(commandArgs)
        break
      }
      case 'feedback':
      case 'rate': {
        const { feedbackCommand } = await import('./commands/feedback.js')
        await feedbackCommand(commandArgs)
        break
      }
      case 'update': {
        const { updateCommand } = await import('./commands/update.js')
        await updateCommand(commandArgs)
        break
      }
      default:
        console.log(`  ${pc.red('Unknown command:')} ${command}`)
        console.log()
        console.log(`  Run ${DIM(`${CMD} --help`)} for usage.`)
        console.log()
        process.exit(1)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.log()
    console.log(`  ${pc.red('Error:')} ${message}`)
    console.log()
    process.exit(1)
  }
}

main()

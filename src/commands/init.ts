import * as p from '@clack/prompts'
import pc from 'picocolors'
import { writeFileSync, existsSync } from 'fs'
import { join, basename } from 'path'
import { ORANGE } from '../ui.js'

export async function initCommand(args: string[]): Promise<void> {
  const cwd = process.cwd()
  const defaultName = basename(cwd)

  // Get skill name from args or use directory name
  let name = args.find((a) => !a.startsWith('--')) || ''

  if (!name) {
    const input = await p.text({
      message: 'Skill name:',
      placeholder: defaultName,
      defaultValue: defaultName,
      validate: (val) => {
        if (!val || !val.trim()) return 'Skill name is required'
        if (!/^[a-z0-9-]+$/.test(val.trim())) {
          return 'Use lowercase letters, numbers, and hyphens only'
        }
        return undefined
      },
    })

    if (p.isCancel(input)) {
      p.cancel('Cancelled.')
      return
    }

    name = input as string
  }

  // Get description
  const description = await p.text({
    message: 'Description:',
    placeholder: 'What does this skill do?',
    validate: (val) => {
      if (!val || !val.trim()) return 'Description is required'
      return undefined
    },
  })

  if (p.isCancel(description)) {
    p.cancel('Cancelled.')
    return
  }

  const skillMdPath = join(cwd, 'SKILL.md')

  if (existsSync(skillMdPath)) {
    const overwrite = await p.confirm({
      message: 'SKILL.md already exists. Overwrite?',
      initialValue: false,
    })

    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Cancelled.')
      return
    }
  }

  const content = `---
name: ${name}
description: >
  ${(description as string).trim()}
metadata:
  author: ""
  version: "1.0"
compatibility: Requires Node.js 18+
---

# ${name}

${(description as string).trim()}

## Usage

<!-- Describe how an AI agent should use this skill -->

## Examples

<!-- Provide examples of when and how to use this skill -->
`

  writeFileSync(skillMdPath, content, 'utf-8')

  p.log.success(`Created ${ORANGE('SKILL.md')} for ${pc.bold(name)}`)
  p.log.info(`Edit ${pc.dim(skillMdPath)} to customize your skill.`)
  p.log.info(
    `Publish: ${pc.dim('Push to GitHub and submit at https://agentskill.sh/submit')}`,
  )
}

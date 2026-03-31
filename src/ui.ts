import pc from 'picocolors'

// Brand orange: #E8613C approximated as 256-color (208 is closest)
// picocolors doesn't support 256-color directly, so we use ANSI escape
const ORANGE_CODE = '\x1b[38;5;208m'
const RESET = '\x1b[0m'

export const ORANGE = (str: string): string => `${ORANGE_CODE}${str}${RESET}`
export const DIM = pc.dim
export const TEXT = (str: string): string => str
export const BOLD = pc.bold
export const GREEN = pc.green

// Gradient grays from bright to dim for the ASCII logo
const g1 = (s: string) => `\x1b[38;5;255m${s}${RESET}` // brightest white
const g2 = (s: string) => `\x1b[38;5;250m${s}${RESET}`
const g3 = (s: string) => `\x1b[38;5;245m${s}${RESET}`
const g4 = (s: string) => `\x1b[38;5;240m${s}${RESET}`
const g5 = (s: string) => `\x1b[38;5;236m${s}${RESET}` // dimmest

export const LOGO = [
  g1('                          _        _    _  _  _        _'),
  g2('   __ _   __ _   ___  _ _| |_  ___| | _(_)| || |  ___ | |_'),
  g3('  / _` | / _` | / _ \\| \'_ \\  _|(_-<| / / || || |_(_-< | \' \\'),
  g4('  \\__,_| \\__, | \\___/|_||_\\__|/__/|_\\_\\_||_||_|__/__/ |_||_|'),
  g5('         |___/'),
].join('\n')

export function showLogo(): void {
  console.log()
  console.log(LOGO)
  console.log()
}

export function showBanner(): void {
  showLogo()
  console.log(
    `  ${DIM('The package manager for AI agent skills')}`,
  )
  console.log()
  console.log(`  ${BOLD('Commands:')}`)
  console.log(`    ${ORANGE('search')} ${DIM('<query>')}        Search for skills`)
  console.log(`    ${ORANGE('install')} ${DIM('<slug>')}        Install a skill`)
  console.log(`    ${ORANGE('setup')}                 Install official skills`)
  console.log(`    ${ORANGE('find')}                  Browse and discover skills`)
  console.log(`    ${ORANGE('list')}                  Show installed skills`)
  console.log(`    ${ORANGE('remove')} ${DIM('<slug>')}         Uninstall a skill`)
  console.log(`    ${ORANGE('feedback')} ${DIM('<slug> <1-5>')} Rate a skill`)
  console.log(`    ${ORANGE('update')}                Update installed skills`)
  console.log()
  console.log(`  ${DIM('Run')} npx @agentskill.sh/cli ${DIM('<command> for more info')}`)
  console.log()
}

/**
 * Truncate a string to a max length, appending ellipsis if needed.
 * Ignores ANSI escape codes when measuring length.
 */
export function truncate(str: string, max: number): string {
  const stripped = stripAnsi(str)
  if (stripped.length <= max) return str

  // Walk the original string, counting only visible characters
  let visible = 0
  let i = 0
  while (i < str.length && visible < max - 1) {
    if (str[i] === '\x1b') {
      // Skip ANSI escape sequence
      const end = str.indexOf('m', i)
      if (end !== -1) {
        i = end + 1
        continue
      }
    }
    visible++
    i++
  }
  return str.slice(0, i) + '\u2026'
}

/**
 * Pad a string to a target width, ignoring ANSI escape codes.
 */
export function padEnd(str: string, width: number): string {
  const visibleLength = stripAnsi(str).length
  if (visibleLength >= width) return str
  return str + ' '.repeat(width - visibleLength)
}

/** Strip ANSI escape codes from a string */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

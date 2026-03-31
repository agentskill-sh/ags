<p align="center">
  <img src="https://agentskill.sh/agentskill-og.jpg" alt="agentskill.sh" width="100%">
</p>

<h1 align="center">learn-skills</h1>

<p align="center">
  <b>Search, install, and manage AI agent skills from <a href="https://agentskill.sh">agentskill.sh</a>.</b>
</p>

<p align="center">
  <i>Like apt-get, but for AI agents.</i>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/learn-skills"><img src="https://img.shields.io/npm/v/learn-skills" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/learn-skills"><img src="https://img.shields.io/npm/dm/learn-skills" alt="npm downloads"></a>
  <img src="https://img.shields.io/badge/platforms-15+-blue" alt="15+ platforms">
  <a href="https://github.com/agentskill-sh/learn/blob/main/LICENSE"><img src="https://img.shields.io/github/license/agentskill-sh/learn?color=blue" alt="License"></a>
  <a href="https://github.com/agentskill-sh/learn/stargazers"><img src="https://img.shields.io/github/stars/agentskill-sh/learn" alt="GitHub stars"></a>
</p>

<br />

---

## What is this?

This repo contains two things:

| What | Description |
|------|-------------|
| **`learn-skills` CLI** | Terminal tool to search, install, list, update, remove, and rate skills. Published to npm as [`learn-skills`](https://www.npmjs.com/package/learn-skills). |
| **`/learn` skill** | An agent skill (SKILL.md) that gives your AI agent the same capabilities mid-conversation. It uses the CLI under the hood. |

Both connect to [agentskill.sh](https://agentskill.sh), a directory of 44,000+ skills for Claude Code, Cursor, Copilot, Codex, Windsurf, Gemini CLI, and 10+ other platforms.

---

## Quick Start

### Use the CLI

```bash
npx learn-skills search "react best practices"
npx learn-skills install seo-optimizer
```

Or install globally:

```bash
npm install -g learn-skills
learn-skills search react
```

### Use the /learn skill (in-agent)

Paste this into your agent:

```
Install the learn skill from https://github.com/agentskill-sh/learn
```

Or install via the plugin marketplace (Claude Code):

```bash
/plugin marketplace add https://agentskill.sh/marketplace.json
/plugin install learn@agentskill-sh
```

Once installed, your agent can search and install skills mid-conversation:

```
/learn seo
/learn @vercel/nextjs-expert
/learn list
```

---

## CLI Commands

```bash
learn-skills search <query>              # Search 44,000+ skills
learn-skills install <slug>              # Install a skill
learn-skills install @owner/skill-name   # Install from specific author
learn-skills list                        # Show installed skills
learn-skills update                      # Check for and apply updates
learn-skills remove <slug>               # Uninstall a skill
learn-skills feedback <slug> <1-5> [msg] # Rate a skill
```

All commands support `--json` for structured output. Useful for piping or agent consumption.

---

## /learn Commands

When using the skill inside your agent:

| Command | What it does |
|---------|--------------|
| `/learn <query>` | Search for skills, interactive install |
| `/learn @owner/slug` | Install a specific skill |
| `/learn skillset:<slug>` | Install a curated bundle |
| `/learn` | Context-aware recommendations based on your project |
| `/learn trending` | Show trending skills |
| `/learn list` | Show installed skills |
| `/learn update` | Check for updates |
| `/learn remove <slug>` | Uninstall a skill |
| `/learn feedback <slug> <1-5>` | Rate a skill |

---

## Examples

```bash
# Find SEO skills
learn-skills search "programmatic seo"

# Install a specific skill from an author
learn-skills install @anthropics/react-best-practices

# Install for Cursor instead of Claude Code
learn-skills install seo-optimizer --platform cursor

# Rate a skill you used
learn-skills feedback seo-optimizer 5 "Excellent keyword clustering"

# Update all installed skills
learn-skills update

# List installed skills as JSON
learn-skills list --json
```

---

## How It Works

1. **Search** queries the agentskill.sh API
2. **Install** writes the skill to your platform's skill directory (e.g., `.claude/skills/`)
3. **Metadata header** is injected for version tracking and auto-review
4. **Auto-review**: after using a skill, your agent rates it automatically (1-5 scale)
5. **Update** compares local content hashes against the registry and re-installs outdated skills

Every installed skill includes a metadata header:

```
# --- agentskill.sh ---
# slug: seo-optimizer
# owner: anthropic
# contentSha: a3f8c2e
# installed: 2026-03-31T10:30:00Z
# source: https://agentskill.sh/seo-optimizer
# ---
```

---

## Supported Platforms

The CLI auto-detects your platform from the working directory. Override with `--platform <name>`.

| Platform | Skill directory | Flag |
|----------|----------------|------|
| Claude Code | `.claude/skills/` | `claude-code` |
| Cursor | `.cursor/skills/` | `cursor` |
| GitHub Copilot | `.github/copilot/skills/` | `copilot` |
| Codex | `.codex/skills/` | `codex` |
| Windsurf | `.windsurf/skills/` | `windsurf` |
| Gemini CLI | `.gemini/skills/` | `gemini-cli` |
| Amp | `.amp/skills/` | `amp` |
| Goose | `.goose/skills/` | `goose` |
| Aider | `.aider/skills/` | `aider` |
| Cline | `.cline/skills/` | `cline` |
| Roo Code | `.roo-code/skills/` | `roo-code` |
| Trae | `.trae/skills/` | `trae` |
| Hermes | `~/.hermes/skills/` | `hermes` |
| OpenCode | `.opencode/skills/` | `opencode` |
| ChatGPT | `.chatgpt/skills/` | `chatgpt` |

---

## Security

Every skill on agentskill.sh has a security score (0-100). The CLI shows scores during search and install. Skills below 30 trigger a warning before installation.

The `/learn` skill includes a [security pattern library](references/SECURITY.md) for detecting prompt injection, data exfiltration, obfuscated code, and other threats.

---

## Repo Structure

```
.
├── README.md              # This file
├── SKILL.md               # The /learn agent skill
├── references/
│   └── SECURITY.md        # Security scanning patterns
├── .claude-plugin/        # Claude plugin marketplace metadata
├── package.json           # npm package (learn-skills)
├── tsconfig.json
├── src/                   # CLI source
│   ├── index.ts           # Entry point and command router
│   ├── api.ts             # API client
│   ├── platform.ts        # Platform detection
│   └── commands/
│       ├── search.ts
│       ├── install.ts
│       ├── list.ts
│       ├── remove.ts
│       ├── feedback.ts
│       └── update.ts
└── LICENSE
```

---

## Contributing

Found a bug? Want to add a platform? PRs welcome.

For creating and publishing your own skills, see the [skill creation guide](https://agentskill.sh/readme#how-to-create-a-skill).

---

## Learn More

- [Browse 44,000+ skills](https://agentskill.sh)
- [What is an Agent Skill?](https://agentskill.sh/readme)
- [Create your own skill](https://agentskill.sh/readme#how-to-create-a-skill)
- [Installation guide](https://agentskill.sh/install)

---

## License

MIT

---

<p align="center">
  Built by <a href="https://agentskill.sh">agentskill.sh</a>
</p>

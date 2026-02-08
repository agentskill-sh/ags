# /learn — Find & Install Agent Skills

Discover, install, and manage AI agent skills from [agentskill.sh](https://agentskill.sh).

Turn your AI agent into a self-improving system that finds capabilities it lacks, installs them mid-session, and provides feedback after use.

Works with **Claude Code**, **Cursor**, **Copilot**, **Windsurf**, and **Cline**.

## Install

### Claude Code

```bash
# Clone to your global skills
git clone https://github.com/agentskill-sh/learn.git ~/.claude/skills/learn
```

Or copy the [SKILL.md](./SKILL.md) file to `.claude/skills/learn/SKILL.md` in any project.

### Cursor

```bash
git clone https://github.com/agentskill-sh/learn.git ~/.cursor/skills/learn
```

### Other Platforms

Copy `SKILL.md` to your platform's skill directory.

## Usage

### Search for skills

```
/learn programmatic seo
/learn frontend react components
/learn marketing email sequences
```

Returns the top 5 matching skills with name, description, score, install count, and security score.

### Install a specific skill

```
/learn @anthropic/seo-optimizer
/learn @vercel/nextjs-expert
/learn https://agentskill.sh/seo-optimizer
```

### Get context-aware recommendations

```
/learn
```

Analyzes your project (package.json, file types, git branch) and suggests relevant skills.

### Show trending skills

```
/learn trending
```

### Rate a skill after using it

```
/learn feedback seo-optimizer 5 "Excellent keyword clustering"
/learn feedback wiki-architect 2 "Instructions unclear for monorepo"
```

Score is 1-5. Comment is optional.

### Manage installed skills

```
/learn list              # Show all installed skills
/learn update            # Check for updates (SHA-based)
/learn remove <slug>     # Uninstall a skill
```

## How It Works

1. **Search** — Queries the [agentskill.sh](https://agentskill.sh) API for matching skills
2. **Preview** — Shows name, description, score, install count, and security score before installing
3. **Install** — Writes the skill file to your platform's skill directory with a version-tracking metadata header
4. **Track** — Reports the install to agentskill.sh (platform, agent name) for usage analytics
5. **Feedback** — After using a skill, rate it 1-5 to help others find the best skills
6. **Self-update** — Before each run, checks if `/learn` itself is up to date via content SHA comparison

## Version Tracking

Every installed skill includes a metadata header:

```
# --- agentskill.sh ---
# slug: seo-optimizer
# owner: anthropic
# contentSha: a3f8c2e
# installed: 2025-01-15T10:30:00Z
# source: https://agentskill.sh/seo-optimizer
# ---
```

`/learn update` compares the local `contentSha` against the API to detect changes — no timestamps, no version numbers, just deterministic content hashing.

## Security

- Skills with a security score below 50 show a warning
- Skills below 30 require explicit user confirmation before install
- All security scores are computed by [agentskill.sh](https://agentskill.sh) static analysis

## API

This skill uses the agentskill.sh public API. No API key required.

| Endpoint | Purpose |
|----------|---------|
| `GET /api/agent/search` | Search skills |
| `GET /api/agent/skills/:slug/install` | Get skill content |
| `GET /api/agent/skills/:slug/version` | Version check |
| `POST /api/skills/:slug/install` | Track install |
| `POST /api/skills/:slug/agent-feedback` | Submit feedback |

Rate limits: 60 searches/min, 10 installs/min, 5 feedbacks/min per IP.

## License

MIT

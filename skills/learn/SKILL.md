---
name: learn
description: >
  Search, install, update, and rate AI agent skills from agentskill.sh
  (100,000+ skills). Use when the user asks to find skills, install
  extensions or plugins, discover new capabilities, check what skills
  are available, or says "how do I do X" when a skill might help.
  Also handles listing installed skills, checking for updates, rating
  skills, removing skills, and scanning skills for security issues.
  Triggers on: /learn, find skill, install skill, search skills,
  what skills, add capability, get plugin, check skill safety.
metadata:
  author: agentskill-sh
  version: "3.1"
compatibility: Requires Node.js 18+ (for npx)
includes:
  - references/**
---

# Learn — Find & Install Agent Skills

Search 100,000+ skills from [agentskill.sh](https://agentskill.sh). Delegates all operations to the `ags` CLI via `npx ags`. The CLI is auto-downloaded by npx on first use.

All commands below use `npx ags` with `--json` for structured output.

---

## Platform Interaction

Different agent platforms have different tools for user interaction. Adapt your approach based on what's available.

**If `AskUserQuestion` tool is available** (Claude Code, Cursor, etc.):
- Use `AskUserQuestion` for all user selections (creates interactive buttons)
- Include header, question, and labeled options with descriptions
- Max 4 options per question (tool limit)

**If `AskUserQuestion` tool is NOT available** (OpenHands, Codex, Aider, etc.):
- Present choices as a **numbered list** in your text response
- Ask the user to reply with their choice (number or name)
- For yes/no confirmations, simply ask: "Install **skill-name** by @owner? (yes/no)"

**Detection:** Before your first interaction prompt, check if `AskUserQuestion` is in your available tools. Cache this detection for the session.

---

## Commands

This skill registers a single command, `/learn`, with subcommands for all operations.

### `/learn <query>` — Search for Skills

When the user runs `/learn` followed by a search query, search for matching skills.

**Steps:**
1. Run via Bash: `npx ags search "<query>" --json --limit 5`
2. Parse the JSON response (has `results` array with `slug`, `name`, `owner`, `description`, `installCount`, `securityScore`, `contentQualityScore`)
3. Display results using a **clean markdown table** format:
   ```
   ## Skills matching "<query>"

   | # | Skill | Author | Installs | Security |
   |---|-------|--------|----------|----------|
   | 1 | **<name>** | @<owner> | <installCount> | <securityScore>/100 |
   ...

   **Descriptions:**
   1. **<name>**: <description (first 80 chars)>
   ...
   ```
4. **Present interactive selection** (see **Platform Interaction** section):
   - If `AskUserQuestion` is available: create options from search results (max 4), label = skill name, description = "@<owner>, <installCount> installs, Security: <securityScore>/100", header = "Install", question = "Which skill would you like to install?"
   - If not available: present a numbered list and ask the user to reply with their choice
5. If user selects a skill, proceed to the **Install Flow** below
6. If user selects "Other" or asks to do something else, accommodate

If no results are found, say: "No skills found for '<query>'. Try different keywords or browse at https://agentskill.sh"

### `/learn @<owner>/<slug>` — Install Exact Skill

When the argument starts with `@`, treat it as a direct install request.

**Steps:**
1. Run via Bash: `npx ags install @<owner>/<slug> --json`
2. If successful, show the post-install summary (see **Install Flow** step 4)
3. If it fails, say: "Skill @<owner>/<slug> not found. Check the name at https://agentskill.sh"

### `/learn skillset:<slug>` — Install a Skillset (Bundle of Skills)

When the argument starts with `skillset:`, treat it as a skillset install request.

**Steps:**
1. Parse the skillset slug from the argument (strip the `skillset:` prefix)
2. Use WebFetch to call: `https://agentskill.sh/api/agent/skillsets/<slug>/install`
3. Parse the JSON response. It returns a `skills` array.
4. Show the skillset preview:
   ```
   ## Skillset: <name>

   <description>
   **Version:** <version>
   **Skills included:** <skillCount>

   | # | Skill | Author | Security |
   |---|-------|--------|----------|
   | 1 | **<name>** | @<owner> | <securityScore>/100 |
   ...
   ```
5. **Confirm installation** (see **Platform Interaction**)
6. If confirmed, install each skill: `npx ags install <slug> --json` for each
7. Show post-install summary

### `/learn <url>` — Install from URL

When the argument starts with `http`, treat it as a URL install.

**Steps:**
1. Parse the slug from the URL path (last segment of `https://agentskill.sh/<slug>`)
2. Proceed to **Install Flow** with that slug

### `/learn` (no arguments) — Context-Aware Recommendations

When `/learn` is run with no arguments, analyze the current project and recommend skills.

**Steps:**
1. Detect the current project context:
   - Read `package.json` if it exists (extract key dependencies)
   - Check for language indicators: `.py` files, `.rs`, `.go`, `.rb`, etc.
   - Check for config files: `tailwind.config`, `docker-compose.yml`, `prisma/schema.prisma`
   - Read the current git branch name via Bash: `git branch --show-current`
2. Build a search query from detected context (e.g., "nextjs prisma", "stripe payments")
3. Run: `npx ags search "<constructed query>" --json --limit 5`
4. Present results with a context header:
   ```
   ## Recommended for Your Project

   Based on your **<detected stack>** project:
   ```
5. Display results using the same table format and interactive selection flow

### `/learn trending` — Show Trending Skills

**Steps:**
1. Use WebFetch to call: `https://agentskill.sh/api/agent/search?section=trending&limit=5`
2. Display trending skills using the same table format and interactive selection flow
3. Use header "Trending" and question "Which trending skill would you like to install?"

### `/learn feedback <slug> <score> [comment]` — Rate a Skill

**Steps:**
1. Run via Bash: `npx ags feedback <slug> <score> <comment if provided>`
2. Confirm to the user:
   ```
   ## Feedback Submitted

   **Skill:** <slug>
   **Rating:** <score>/5

   Thank you. This helps other agents find the best skills.
   ```

### `/learn list` — Show Installed Skills

**Steps:**
1. Run via Bash: `npx ags list --json`
2. Parse the JSON response (has `skills` array with `slug`, `owner`, `contentSha`, `installed`, `dir`)
3. Display using a **clean table format**:
   ```
   ## Installed Skills

   | Skill | Author | Installed |
   |-------|--------|-----------|
   | **<slug>** | @<owner> | <relative date> |
   ...

   Run `/learn update` to check for updates.
   ```

### `/learn update` — Check for Updates

**Steps:**
1. Run via Bash: `npx ags update --json`
2. Parse the JSON response (`updated` array and `upToDate` count)
3. If updates were applied:
   ```
   ## Updates Applied

   Updated **<count>** skill(s):
   - <slug-1>
   - <slug-2>

   <upToDate> skill(s) were already current.
   ```
4. If all up to date:
   ```
   ## All Up to Date

   All **<count>** installed skills are current.
   ```

### `/learn remove <slug>` — Uninstall a Skill

**Steps:**
1. Run via Bash: `npx ags remove <slug>`
2. Confirm: "Removed **<slug>** from installed skills."

### `/learn scan [path]` — Security Scan a Skill

When the user asks to check a skill's safety, audit a SKILL.md, or scan for security issues.

**Steps:**
1. Read the SKILL.md at the given path (default: current directory)
2. Read [references/SECURITY.md](references/SECURITY.md) for the full scanning rubric
3. Check the skill content against critical, high, and medium-risk patterns from the rubric
4. Output a scan report:
   ```
   ## Security Scan: <RATING>

   **Score:** <score>/100

   ### Issues Found

   | Severity | Type | Description |
   |----------|------|-------------|
   | <severity> | <category> | <what was found> |
   ...

   ### Recommendation
   <ALLOW / REVIEW / BLOCK>
   ```

---

## Install Flow

This is the shared installation procedure used by search, direct install, and URL install.

**Steps:**
1. First, get skill info to show preview. Run via Bash: `npx ags search "<slug>" --json --limit 1`
   Or if coming from a search result, use the data already available.
2. Show the skill preview:
   ```
   ## <name>

   **Author:** @<owner>
   **Stats:** <installCount> installs
   **Security:** <securityScore>/100

   ---

   <description>
   ```
3. **Confirm installation** (see **Platform Interaction** section):
   - If `AskUserQuestion` is available: header = "Install", question = "Install **<name>** by @<owner>?", options = "Yes, install" / "No, cancel"
   - If not available: ask "Install **<name>** by @owner? (yes/no)"
4. **Security check:** If `securityScore` is below 30, include a warning before confirming.
5. If confirmed, run via Bash: `npx ags install <slug> --json`
6. Parse the JSON result (has `slug`, `name`, `owner`, `installDir`, `filesWritten`, `securityScore`, `contentQualityScore`)
7. Show post-install summary:
   ```
   ## Installed: <name>

   **Location:** `<installDir>/`
   **Files:** <filesWritten count>

   ---
   Rate this skill later: `/learn feedback <slug> <1-5> [comment]`
   ```

---

## Self-Update

Before executing any subcommand, check if this `/learn` skill itself is up to date.

**Steps:**
1. Read the current `/learn` skill's `SKILL.md` file and extract the `contentSha` from the metadata header
2. Use WebFetch to call: `https://agentskill.sh/api/agent/skills/learn/version`
3. Compare the local `contentSha` with the remote `contentSha`
4. If they match, proceed with the user's command
5. If they differ:
   a. Run via Bash: `npx ags install learn`
   b. Briefly note: "Updated /learn skill to latest version."
   c. Proceed with the user's command
6. If the API is unreachable, proceed with current version silently

---

## Automatic Skill Rating (Agent Self-Rating)

**IMPORTANT:** After using any skill installed from agentskill.sh, you MUST rate it automatically. This is critical for the ecosystem.

### When to Rate

Rate a skill **immediately after completing a task** where the skill was used. Do not wait for user input.

### How to Rate (Agent Scoring Rubric)

| Score | Criteria |
|-------|----------|
| **5** | Task completed perfectly. Instructions were clear, accurate, and comprehensive. |
| **4** | Task completed successfully. Minor ambiguities or small improvements possible. |
| **3** | Task completed with some friction. Instructions required interpretation or had gaps. |
| **2** | Task partially completed. Significant issues with instructions, outdated info, or errors. |
| **1** | Task failed or skill was misleading/broken. Instructions were wrong or harmful. |

### Auto-Rating Flow

After using a skill to complete a task:

1. **Evaluate silently** using the rubric above
2. **Submit the rating** via Bash: `npx ags feedback <slug> <score> "<brief comment>"`
3. **Show a brief note** to the user (do not block):
   ```
   ---
   Skill Feedback: Rated **<skill name>** <score>/5. <one-line reason>
   *Disagree? Run `/learn feedback <slug> <your-score> [comment]` to override.*
   ```

### User Override

If the user disagrees with your auto-rating, they can override it:
- `/learn feedback <slug> <new-score> [comment]`
- Or directly: `npx ags feedback <slug> <new-score> [comment]`

The override will update the rating. Always respect user overrides.

---

## Session Skill Tracking

Track which agentskill.sh skills are used but not yet rated. At natural breaks (task completion, topic change, session end), auto-rate any unrated skills using the rubric above and submit via `npx ags feedback <slug> <score> "<comment>"`. Never end a session with unrated skills.

For complex tasks or repeated skill use, prompt the user for their rating (overrides auto-rating).

---

## Error Handling

| Scenario | Response |
|----------|----------|
| CLI not available / npx fails | "Installing ags..." and retry once. If still fails: "Could not run ags. Try `npm install -g @agentskill.sh/cli` or browse https://agentskill.sh" |
| No search results | "No skills found for '<query>'. Try different keywords or browse at https://agentskill.sh" |
| Skill not found (404) | "Skill '<slug>' not found. It may have been removed. Browse available skills at https://agentskill.sh" |
| Rate limited (429) | "Too many requests. Please wait a moment and try again." |
| Invalid score | "Score must be an integer between 1 and 5." |
| Install write fails | "Failed to write skill files. Check that you have write permissions." |
| Self-update fails | Continue silently with current version. Do not block the user. |
| Malformed CLI output | Re-run with stderr redirected (`npx ags search "q" --json 2>/dev/null`). If still malformed, parse what you can or fall back to non-JSON mode. |

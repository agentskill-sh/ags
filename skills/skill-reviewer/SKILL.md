---
name: skill-reviewer
description: >
  Review and improve AI agent skills (SKILL.md files) against best practices
  from the Agent Skills specification and Anthropic's authoring guidelines.
  Scores skills on 10 quality dimensions, identifies specific issues, and
  rewrites problem areas. Use when creating, editing, auditing, or improving
  agent skills. Triggers on: review skill, improve skill, audit SKILL.md,
  check skill quality, skill best practices, optimize skill description.
metadata:
  author: agentskill-sh
  version: "1.0"
includes:
  - references/**
---

# Skill Reviewer

Review agent skills against best practices and rewrite weak areas.

## When to Use

- After writing or editing a SKILL.md
- Before publishing a skill to agentskill.sh or sharing with a team
- When a skill underperforms (low ratings, poor triggering, inconsistent output)
- When asked to audit, review, or improve a skill

## Review Process

### Step 1: Read the Skill

Read the full SKILL.md and all referenced files (references/, scripts/, assets/).
Note the skill's purpose, target audience, and complexity.

### Step 2: Score Against 10 Dimensions

Evaluate each dimension on a 1-5 scale using the rubric in [references/rubric.md](references/rubric.md).

```
Skill Review: <skill-name>

| # | Dimension              | Score | Key Issue                        |
|---|------------------------|-------|----------------------------------|
| 1 | Frontmatter            | ?/5   |                                  |
| 2 | Description Quality    | ?/5   |                                  |
| 3 | Conciseness            | ?/5   |                                  |
| 4 | Structure              | ?/5   |                                  |
| 5 | Instruction Clarity    | ?/5   |                                  |
| 6 | Freedom Calibration    | ?/5   |                                  |
| 7 | Error Handling         | ?/5   |                                  |
| 8 | Progressive Disclosure | ?/5   |                                  |
| 9 | Scripts Quality        | ?/5   |                                  |
|10 | Completeness           | ?/5   |                                  |

Overall: ?/50
```

### Step 3: List Specific Issues

For each dimension scoring 3 or below, list concrete issues:

```
### Issues

1. [D2] Description is 15 characters, too vague to trigger reliably
2. [D3] Lines 45-80 explain what a CSV is; the agent already knows this
3. [D6] Three PDF libraries listed as equal options; pick a default
```

### Step 4: Rewrite Problem Areas

For each issue, show the current text and a rewritten version.
Apply changes directly if the user asks for it, otherwise present as suggestions.

```
### Fix: [D2] Description too vague

BEFORE:
description: Helps with PDFs.

AFTER:
description: >
  Extract text and tables from PDF files, fill PDF forms, merge
  documents. Use when working with PDF files or when the user
  mentions PDFs, forms, or document extraction.
```

### Step 5: Estimate Token Impact

Count approximate tokens for the full SKILL.md body (excluding frontmatter).
Flag if over 5,000 tokens with specific sections to move to references/.

## Scoring Reference

The full rubric with examples is in [references/rubric.md](references/rubric.md).

Quick thresholds:
- **40-50/50**: Production-ready. Minor polish at most.
- **30-39/50**: Good foundation. Address flagged issues before publishing.
- **20-29/50**: Needs significant work. Multiple dimensions require rewriting.
- **Below 20/50**: Fundamental issues. Consider restructuring from scratch.

## Common Fixes (Quick Reference)

| Problem | Fix |
|---------|-----|
| Description too vague | Add what it does + when to use it + trigger keywords |
| Description uses first/second person | Rewrite in third person imperative |
| Explains things the agent already knows | Delete. Only add what the agent lacks. |
| Multiple equal options presented | Pick a default, mention alternatives briefly |
| No examples provided | Add 1-2 input/output pairs |
| Deeply nested file references | Flatten to one level from SKILL.md |
| SKILL.md over 500 lines | Move reference material to references/ |
| Magic numbers in scripts | Add comments explaining why each value |
| Scripts fail silently | Add explicit error messages with guidance |
| No validation step in workflow | Add a validate-then-proceed loop |
| Time-sensitive information | Remove dates, use "current" / "legacy" sections |
| Inconsistent terminology | Pick one term per concept, use throughout |
| No frontmatter name field | Add name (lowercase, hyphens, max 64 chars) |
| No frontmatter description | Add description (max 1024 chars) |
| Windows-style paths | Replace backslashes with forward slashes |

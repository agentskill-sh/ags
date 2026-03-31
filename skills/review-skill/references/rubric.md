# Skill Review Rubric

Evaluate each dimension on a 1-5 scale. Score honestly. A 3 is acceptable, not a failure.

---

## D1: Frontmatter (Spec Compliance)

Does the YAML frontmatter follow the Agent Skills specification?

| Score | Criteria |
|-------|----------|
| **5** | `name` and `description` present and valid. Optional fields (`license`, `compatibility`, `metadata`, `includes`) used where appropriate. Name matches directory, lowercase-hyphens only, no reserved words. |
| **4** | Required fields valid. One minor issue (e.g., name doesn't match directory, missing useful optional field). |
| **3** | Required fields present but one has issues (description too short, name uses uppercase). |
| **2** | Missing one required field, or name/description violate constraints. |
| **1** | No frontmatter, or both required fields missing/invalid. |

**Checks:**
- `name`: 1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens
- `description`: 1-1024 chars, non-empty
- No XML tags in name or description
- Name must not contain "anthropic" or "claude"
- `metadata` values should be strings

---

## D2: Description Quality (Triggering)

Will agents select this skill for the right tasks?

| Score | Criteria |
|-------|----------|
| **5** | States what the skill does AND when to use it. Includes trigger keywords and edge-case contexts. Third-person imperative voice. Under 1024 chars. Would trigger reliably on relevant prompts and not trigger on adjacent-but-different tasks. |
| **4** | Good coverage of what and when. Minor gap in trigger keywords or slightly broad scope. |
| **3** | Describes what but not when (or vice versa). Or uses first/second person. Or too generic to distinguish from similar skills. |
| **2** | Vague ("helps with files"), too short to be useful, or would false-trigger on unrelated tasks. |
| **1** | Empty, single word, or actively misleading. |

**Key rules:**
- Third person imperative: "Extracts text from PDFs" not "I can help you extract text"
- Include both what it does and when to use it
- Include trigger keywords the user might say
- Be specific enough to distinguish from similar skills
- Stay under 1024 characters

---

## D3: Conciseness (Token Efficiency)

Does every token justify its context window cost?

| Score | Criteria |
|-------|----------|
| **5** | No unnecessary explanations. Only includes what the agent wouldn't know without the skill. Every paragraph passes the "does the agent really need this?" test. |
| **4** | Mostly concise. One or two sections could be trimmed without losing value. |
| **3** | Some bloat. Explains concepts the agent already knows (what a PDF is, how HTTP works, what a database migration does). |
| **2** | Significant bloat. Multiple paragraphs of unnecessary background or obvious explanations. |
| **1** | Mostly filler. More explanation than instruction. |

**Red flags:**
- Defining common terms (PDF, API, CSV, JSON)
- Explaining how well-known libraries work
- Repeating the same instruction in different words
- Long introductory paragraphs before useful content
- "In this section, we will..." preamble text

---

## D4: Structure (Progressive Disclosure)

Is the skill organized for efficient context loading?

| Score | Criteria |
|-------|----------|
| **5** | SKILL.md under 500 lines / 5000 tokens. Reference material in separate files. File references one level deep. Clear table of contents for files over 100 lines. Descriptive file names. |
| **4** | Good structure. One issue (e.g., SKILL.md slightly long, one deeply nested reference). |
| **3** | SKILL.md is 500-800 lines, or reference material mixed into SKILL.md that could be split out. |
| **2** | SKILL.md over 800 lines, or deeply nested references (A links to B links to C). |
| **1** | Everything in one massive SKILL.md with no structure. |

**Rules:**
- SKILL.md body under 500 lines, ideally under 5000 tokens
- Split large content into references/, scripts/, assets/
- File references should be one level deep from SKILL.md
- Reference files over 100 lines should have a table of contents
- Use descriptive file names: `form_validation_rules.md` not `doc2.md`
- Use forward slashes in all paths (no backslashes)

---

## D5: Instruction Clarity

Can the agent follow the instructions without ambiguity?

| Score | Criteria |
|-------|----------|
| **5** | Steps are clear, sequential, and unambiguous. Input/output examples provided. Edge cases addressed. Consistent terminology throughout. |
| **4** | Clear instructions with minor ambiguity in one area. |
| **3** | Generally understandable but requires interpretation in places. Inconsistent terminology or missing examples. |
| **2** | Ambiguous instructions that could be followed multiple ways. Key steps missing. |
| **1** | Instructions are contradictory, incomplete, or incomprehensible. |

**Checks:**
- One term per concept, used consistently (not "API endpoint" + "URL" + "API route")
- Concrete examples, not abstract descriptions
- No time-sensitive information (dates, "before August 2025")
- Templates for output format where format matters
- Checklists for multi-step workflows

---

## D6: Freedom Calibration

Is each part of the skill appropriately prescriptive for its fragility?

| Score | Criteria |
|-------|----------|
| **5** | Fragile operations (database migrations, file deletions) have exact commands. Flexible tasks (code review, analysis) give direction without over-constraining. Defaults provided, alternatives mentioned briefly. |
| **4** | Generally well-calibrated. One area slightly over/under-constrained. |
| **3** | Presents multiple equal options where a default would be better. Or over-constrains flexible tasks. |
| **2** | Fragile operations lack guardrails, or flexible tasks are rigidly scripted. |
| **1** | No awareness of task fragility. Everything treated the same. |

**Key rules:**
- Pick defaults, don't present menus of equal options
- Fragile/destructive operations: exact commands, no flexibility
- Analysis/creative tasks: direction and criteria, not rigid scripts
- Explain "why" for rigid rules so the agent can adapt in edge cases

---

## D7: Error Handling

Does the skill handle failure gracefully?

| Score | Criteria |
|-------|----------|
| **5** | Scripts handle errors explicitly with helpful messages. Validation loops (do work, validate, fix, repeat). Error table or section covering common failures. |
| **4** | Good error handling in most paths. One gap in error coverage. |
| **3** | Some error handling but gaps. Scripts may fail silently or with unhelpful messages. |
| **2** | Minimal error handling. Scripts punt errors to the agent without guidance. |
| **1** | No error handling. Scripts crash on edge cases. |

**For skills with scripts:**
- Scripts should handle errors explicitly, not punt to the agent
- Error messages should say what went wrong, what was expected, and what to try
- Include a validation step before destructive operations
- Constants should be documented (no magic numbers)

**For skills without scripts:**
- Include an error handling section or table
- Address common failure modes
- Provide fallback approaches

---

## D8: Progressive Disclosure

Does the skill load context efficiently?

| Score | Criteria |
|-------|----------|
| **5** | SKILL.md is a concise overview. Detailed material in separate files loaded only when needed. Clear signals telling the agent when to load each file ("Read references/api-errors.md if the API returns non-200"). |
| **4** | Good separation. One file could benefit from being split or loaded conditionally. |
| **3** | Some material in SKILL.md that should be in references. Or references exist but SKILL.md doesn't guide when to load them. |
| **2** | Most content in SKILL.md. References exist but are poorly signaled. |
| **1** | Everything in SKILL.md. No separate files despite the skill being complex. |

**Rules:**
- SKILL.md = overview + navigation
- references/ = detailed material loaded on demand
- Tell the agent WHEN to load each file, not just that it exists
- "Read references/api-errors.md if the API returns a non-200 status" > "See references/ for details"

---

## D9: Scripts Quality

Are bundled scripts well-designed for agentic use?

Score N/A if the skill has no scripts.

| Score | Criteria |
|-------|----------|
| **5** | Scripts are self-contained with inline dependencies. No interactive prompts. Clear --help output. Structured output (JSON/CSV). Meaningful exit codes. Idempotent where possible. Error messages include what went wrong and what to try. |
| **4** | Good scripts. One minor issue (missing --help, one script not idempotent). |
| **3** | Scripts work but have design issues (interactive prompts, unstructured output, poor error messages). |
| **2** | Scripts have significant issues (crash on edge cases, require undocumented setup, output is unparseable). |
| **1** | Scripts are broken, dangerous, or require extensive agent workarounds. |

**Checks:**
- No interactive prompts (agents can't respond to TTY input)
- --help documents usage, flags, and examples
- Structured output (JSON preferred) on stdout, diagnostics on stderr
- Meaningful exit codes for different failure types
- Dependencies declared inline (PEP 723 for Python, npm: for Deno, etc.)
- Idempotent operations (create-if-not-exists, not create-and-fail-on-duplicate)
- --dry-run for destructive operations

---

## D10: Completeness

Does the skill cover its stated scope?

| Score | Criteria |
|-------|----------|
| **5** | All features mentioned in the description are covered. Gotchas section captures non-obvious issues. Edge cases addressed. The skill is a coherent unit (not too narrow, not too broad). |
| **4** | Covers the stated scope with one minor gap. |
| **3** | Missing coverage for part of the described scope. Or scope is too broad/narrow for the content. |
| **2** | Significant gaps between description and content. Or skill tries to do too much. |
| **1** | Description promises features the skill doesn't deliver. |

**Checks:**
- Every capability in the description has corresponding instructions
- Gotchas section for non-obvious issues (environment-specific facts, naming inconsistencies, etc.)
- Scope is a coherent unit of work (not too broad, not too narrow)
- Procedures generalize rather than solving one specific instance

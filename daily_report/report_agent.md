---
name: daily-progress-report
description: Generate and maintain daily_progress_report.md from repo changes and finished tasks. Use at task or session end, or when the user asks for a daily report or non-developer summary. Do not use for code changes.
---

# Daily Progress Report

Maintain a readable `daily_progress_report.md` that records what changed in the repository and why. This skill writes documentation only — never edit application code while running it.

> Project context: LearnStream is a **Vite + Vue 3** app (Composition API) using Vue Router and `@nuxt/ui`, with sources under `src/`. It is **not a git repository**, so change detection falls back to files modified since midnight.

## Triggers

Produce or update the report when any of these happen:

1. A development task finishes.
2. A paired-programming session ends.
3. The user asks for a `"daily report"` or a `"summary for non-developers"`.

## Workflow

1. Get the date in `[Month] [Day], [Year] ([Day of week])` form.
2. Detect what changed:
   - `git status --short` for modified, added and untracked files.
   - `git diff --stat` and `git diff --cached --stat` for unstaged and staged changes.
   - If the repository has no commits yet, list the new files instead.
   - Also include files created or edited earlier in this session when they are not yet committed.
   - If `git` is unavailable, fall back to the session's edit history and recently modified files.
3. Read the existing `daily_progress_report.md` in the `daily_report/` folder, if present.
4. Group the changes by file, classify each, then write 1–2 specific bullets naming the functions, sections or features affected.
5. Update the report using the exact template below.
6. Report the path you wrote back to the user.

## Automation

`daily_report/generate_daily_report.sh` runs steps 2–5 automatically (git when available, otherwise files modified since midnight) and writes a dated report:

```bash
./daily_report/generate_daily_report.sh
```

## Output template

The report file MUST match this structure exactly. Keep the emoji, labels and blank lines — only replace the bracketed placeholders.

```markdown
📋 Daily Progress Report : [Project Name]
Date: [Month] [Day], [Year] ([Day of week])

🔎 Summary: [Factual summary paragraph describing the session's focus and key milestones.]

Detailed File Changes ᝰ✍🏻 .ᐟ

♻️ [STATUS] | [Type Label] |
📁 File: `[relative/path/to/file]`
[1–3 with (Bulleted List sentences) describing exactly what was added, edited, or removed. Be specific — name functions, sections, or features affected.] 

Link:
🔗 [Link]([remote_repository_url])
```

## Report rules

- Keep the skill files together in `daily_report/`: `report_agent.md`, `generate_daily_report.sh`, the canonical `daily_progress_report.md` and the dated reports.
- One report per day. The script writes `daily_report/report_YYYY-MM-DD.md`; if today's dated report already exists, update it in place instead of starting a new section.
- Show the newest entries first so the latest work is easiest to scan.
- Use one of these statuses next to `♻️`: `[ADDED]`, `[UPDATED]`, `[FIXED]`, `[REFACTORED]`, `[REMOVED]`, `[DOCS]`.
- Pair each status with a matching type label, for example `Feature`, `Bug fix`, `Refactor`, `Documentation`, `Config`.
- Always use repository-relative paths inside backticks.
- For the `Link:` line, use the remote repository URL from `git remote -v`. If no remote exists, write `(no remote configured)`.
- Report only changes you verified. Never invent files, functions, or links.
- Write the `🔎 Summary` for a non-developer — describe the outcome, not the syntax.
- Never include secrets, API keys, tokens, or `.env` values.
- Keep bullets concise: 1–2 per file.

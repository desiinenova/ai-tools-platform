# Prompts for future development

Example prompts for directing an AI coding agent (Claude Code or otherwise) to continue work on this project the same way it's been built so far. These aren't magic incantations — they work because they invoke the conventions in [`CLAUDE.md`](../CLAUDE.md) and [`AI_AGENTS.md`](./AI_AGENTS.md): explain before implementing, verify before claiming done, ask when a decision is ambiguous.

## Starting a new feature or milestone

> "I want to add [feature]. Before writing any code, explain your implementation plan, which files it will touch, whether it needs a database migration, and any risks. Wait for my approval before implementing."

> "Propose a design for [feature] and flag any decisions that affect business rules or security so I can weigh in before you write code."

## Fixing a reported bug

> "[Describe the observed behavior and how to reproduce it.] Investigate the root cause before changing anything — don't assume it's related to the most recent change without checking. Tell me what you find before fixing it."

## Auditing the project

> "Perform a complete audit of the current codebase against [the README / the original assignment]. Only mark something as done if you've actually inspected the code — don't assume something exists because it's supposed to."

This is exactly what surfaced most of this project's real milestones — several rounds of "audit what's actually implemented vs. what's claimed" found genuine gaps (missing 2FA, an unedited framework README, a Dashboard that was still a placeholder) that a surface-level glance would have missed.

## Before committing anything

> "Show me exactly what changed, how you verified it (tests you ran, manual checks you performed, and anything you could *not* verify), and wait for my approval before committing."

## Verifying a claim, not just the code

> "Don't just tell me the tests pass — show me you actually ran [the specific command/flow] against the real running app, not just the automated suite."

This project's history has concrete examples of why this matters: an automated test suite passing did not catch a real login regression that only a manual HTTP-level check against the live database surfaced (see `AI_AGENTS.md`).

## Project history (chronological)

A condensed record of how this project actually got built, for context on what each of the above prompt patterns produced in practice:

1. Docker environment, backend foundation, typed API client, and the AI Tools list page.
2. Server-side, Policy-based authorization for tools, categories, and tags (originally missing entirely — enforcement lived only in the frontend).
3. Tool approval workflow (status, auto-approval for Owner, visibility scoping) — promoted from "optional" to mandatory scope.
4. Owner-only Admin Panel: pending-tools moderation queue and Category/Tag management.
5. Tool form redesigned around a single Markdown documentation field, replacing a description/usage/examples split, with existing tool data migrated forward rather than discarded.
6. Dashboard rebuilt with real content (personal stats, "My AI Tools," role-recommended tools), refined through several rounds of real manual-testing feedback (a redirect that should have been an in-page expand, a self-recommendation bug, a misleading "—" for first-time login).
7. Category/Tag delete-confirmation UX improved, and a shared-mutation-state bug in the Admin Panel's approve/reject buttons fixed.
8. Duplicate tool prevention (case-insensitive name matching, URL normalization, database-level constraints as a race-condition safety net).
9. Two-factor authentication (TOTP), backend and frontend, including a same-session regression (session cookie renamed by an unrelated `APP_NAME` change) found and fixed before it shipped.
10. Profile page completed; root README and this documentation written — with the documented commands actually run and verified, not just written down.

Cleanup (removing an unused dependency, and other small tech debt) remains as the last planned milestone as of this writing.

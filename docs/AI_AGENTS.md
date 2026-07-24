# AI Agents

This document describes the workflow, conventions and lessons learned while developing this project with AI agents. It is intended to help future developers or AI assistants continue development consistently and avoid repeating previously resolved issues.

This project was built collaboratively with Claude Code (Anthropic's CLI coding agent), under the operating rules in the root [`CLAUDE.md`](../CLAUDE.md). What follows is how that collaboration actually worked in practice — not a generic "how to use AI" guide, but what happened on this specific project.

## Tooling: more than one AI in the loop

Claude Code was the agent that actually implemented, tested, and verified changes against this codebase, but it wasn't the only AI tool used. ChatGPT was used alongside it — to help draft and refine the prompts given to Claude Code, and to review Claude's output and results. A future contributor working this way should keep the same separation of concerns in mind: whichever tool is used for planning or reviewing prompts, the agent actually touching the repository should still be held to the verification standard described below, rather than having its claims taken at face value by either the human or the other AI.

## The core discipline: verify, don't assume

The single most important pattern in this project's history is that **passing an automated check is not the same as being correct** — several real bugs only surfaced because of a stricter standard than "the tests pass":

- The 2FA login flow's automated test suite passed cleanly, but a manual end-to-end check against the real dev database caught a `500` error on login that the SQLite-backed test suite could never have exposed (Sanctum's stateful-request detection behaves differently without a browser-realistic `Origin`/`Referer` header).
- That same work surfaced a follow-on regression: logout started failing with a CSRF mismatch. The root cause was an unrelated earlier change (`APP_NAME`) silently renaming the session cookie — found by tracing Laravel's own source (`Illuminate\Session\Store::regenerate()`), not by guessing.
- A "the documented command works" claim was checked literally before it shipped: while writing the README, the command it was about to document (`npx tsc --noEmit`) was actually run, and it failed. Investigating properly — rather than repeating an earlier, incorrect assumption that the failing config was dead cruft — found it was genuinely load-bearing (`next dev` doesn't use Turbopack, so the webpack config it needed to fix actually mattered), and the real fix was two lines, not a deletion.

The pattern to carry forward: **run the thing you're about to claim works.** For changes touching auth, sessions, or permissions, that means an actual HTTP-level check (`curl`, or a real browser) — not just `php artisan test`. For frontend changes, that means an actual compile/type-check/lint pass, not "the code looks right."

## Milestone-based workflow

Work proceeded in small, named milestones, each following the same shape:

1. **Explain the plan before writing code.** For anything touching authorization, schema, or the login flow, a design was proposed — including open decisions that needed input — before any file was edited.
2. **Ask when a decision is genuinely ambiguous or affects business rules**, rather than picking silently. Examples from this project: which 2FA method and library to use, where to render the QR code, whether disabling 2FA should require re-confirmation, whether recovery codes should be regenerable.
3. **Implement, then verify — both automated and manual.** Every milestone ran the full backend test suite and, for frontend work, a type-check and lint pass, before being presented as complete.
4. **Report exactly what changed and how it was verified**, including what was *not* verified. No browser automation was available for most of this project's frontend work, and that limitation was stated explicitly each time rather than glossed over.
5. **Wait for explicit approval before committing.** Commits were never made speculatively "while at it."

## Commit discipline

- One logical change per commit, in Conventional Commits format (`feat(scope): ...`, `fix(scope): ...`, `docs: ...`).
- When two unrelated things were found and fixed close together (e.g. the Category/Tag delete-confirmation UX and the per-row Approve/Reject loading-state bug), they were split into separate commits even though discovered in the same review pass.
- Bug fixes discovered *while verifying* a feature were folded into that feature's commit only when they were genuinely part of making that feature correct (e.g. an `Auth::login()` guard-resolution bug found while testing 2FA). Fixes unrelated to the milestone at hand got their own commit instead.

## Architectural deviations were decisions, not oversights

The original project brief describes a many-roles-per-user model and a `Tool belongsTo Category` relationship. The actual implementation has **one role per user** and **Tool↔Category as many-to-many** — both deliberate, both confirmed explicitly during development, both documented in the root README's Role System section rather than left for a future reader to misdiagnose as bugs. If you're auditing this codebase against the original brief, check the README first — an early audit pass over this project's own history made exactly that mistake before being corrected by the project owner.

Similarly, some items the original brief lists as "Optional/Bonus" — the Admin Panel and the tool approval workflow — were explicitly promoted to mandatory scope partway through development, at the project owner's direction. Don't assume required-vs-optional status from the original brief alone; check whether a later decision superseded it.

## Where the real operating rules live

This document explains *how things happened*. The actual rules an AI agent must follow on this repository — coding conventions, when to ask before acting, security requirements, Docker/git conventions — are in [`CLAUDE.md`](../CLAUDE.md) at the project root. Read that first.

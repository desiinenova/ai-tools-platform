# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Tools Platform is a university project: an internal platform that lets an organization's teams discover, organize, share, and recommend AI tools based on user roles. It is being built from scratch as a learning exercise in full-stack architecture, not bootstrapped from any starter kit or template.

Because this is a from-scratch build, the repository will start empty and grow incrementally. **Do not assume any file, folder, package, or configuration exists until you have verified it** (via `ls`/`Glob`/`Read`). Never invent directory structure, model names, routes, or components that aren't actually present — if something is missing that you'd expect, say so and propose adding it rather than assuming it's elsewhere.

## Goals of the Application

- Provide a single internal system where employees can browse and search a catalog of AI tools.
- Let users organize tools (categories, tags, collections) and share them with teammates.
- Support recommendations tailored to a user's role (e.g., a Backend Developer sees different suggested tools than a Designer).
- Serve as a clean, well-architected reference project demonstrating Laravel + Next.js best practices for academic evaluation.

## Planned Technology Stack

- **Backend:** Laravel 12, PHP 8.3+
- **Frontend:** Next.js 15, React, TypeScript
- **Database:** MySQL
- **Infrastructure:** Docker Compose, Nginx
- **Architecture style:** Laravel as a decoupled API backend, Next.js as a separate frontend application communicating over HTTP/JSON (not Laravel Blade/Inertia views).

No starter kits (e.g., Laravel Breeze/Jetstream, `create-next-app` templates beyond the bare CLI scaffold, admin panel generators) should be introduced without explicit discussion — the point of the project is to build the pieces deliberately.

## User Roles

The platform is role-aware. Known roles:

- **Owner** — top-level administrative control over the platform.
- **Backend Developer**
- **Frontend Developer**
- **QA**
- **Project Manager**
- **Designer**

Role definitions, permissions, and how they map to Laravel's authorization layer (policies/gates) should be treated as an evolving design — confirm current implementation in code (migrations, seeders, policies) rather than assuming a fixed permission matrix, and raise questions when a new feature's role behavior isn't yet specified.

## Development Workflow

- Work in small, reviewable increments. Prefer several focused changes over one large change.
- Before modifying many files or introducing a new architectural piece (a new service layer, a new module, a schema change affecting multiple tables), **explain the implementation plan first** and get agreement before writing code.
- Do not generate large amounts of code in one shot without approval — scaffold incrementally (e.g., migration → model → policy → controller → route → test, confirming as you go) rather than producing an entire feature at once.
- When requirements are ambiguous (role permissions, data shape, UI behavior), ask a clarifying question instead of guessing.

## Collaboration Workflow

This project is being developed by a student together with Claude Code.

Claude should act as a senior full-stack software engineer and technical mentor.

For every non-trivial task:

1. Explain the implementation plan before writing code.
2. Wait for approval before making significant changes.
3. Implement the feature incrementally.
4. Summarize what was changed.
5. Explain how the implementation can be verified.

Never surprise the developer with large code changes.

Optimize for learning, maintainability and clean architecture rather than only speed.

## Decision Making

Whenever multiple implementation approaches are possible:

- explain the trade-offs;
- recommend one approach;
- briefly explain why it is recommended.

Avoid making architectural decisions silently.

## Before Running Commands

Before executing commands that may significantly affect the project, briefly explain why they are necessary.

This includes commands that:

- install packages;
- modify Docker configuration;
- run migrations;
- modify the database;
- delete files;
- overwrite configuration files.

Routine read-only commands (ls, cat, git status, etc.) do not require confirmation.

## Teaching Mode

Whenever appropriate, briefly explain important architectural decisions so the student understands the reasoning behind them.

Keep explanations concise and practical.

## Coding Principles

- Write maintainable, production-quality code — this is a portfolio/academic project, not throwaway code.
- Prefer composition over duplication: extract shared logic into reusable services, hooks, or components once a real duplication appears — don't pre-build abstractions for hypothetical future needs.
- Keep functions and components small and single-purpose.
- Name things after what they are, not what they're for in the current task.
- No dead code, no commented-out blocks, no speculative feature flags.

## Architecture Principles

- Laravel and Next.js are separate applications with a clear boundary: Laravel owns data, business logic, and authorization; Next.js owns presentation and client-side interaction, talking to Laravel only through its API.
- Keep controllers thin; push business logic into services/actions and validation into Form Requests as the backend grows.
- On the frontend, keep data-fetching, state, and presentation concerns separated as the app grows past trivial pages.
- Avoid tight coupling between layers (e.g., no frontend code reaching into Laravel internals, no backend code assuming a specific frontend shape beyond the documented API contract).
- Any cross-cutting architectural decision (auth strategy, API versioning, caching) should be discussed and documented before being implemented broadly.

## Git Workflow

- Commit in small, logical units with clear messages describing *why*, not just *what*.
- Never commit `backend/vendor/`, `backend/.env`, `frontend/node_modules/`, or `frontend/.next/` (already covered in `.gitignore`).
- Do not amend or force-push shared history. Create new commits for fixes.
- Only commit when explicitly asked to.

## Docker Conventions

- All services (backend, frontend, MySQL, Nginx) are orchestrated via Docker Compose — keep `docker-compose.yml` (and any per-service Dockerfiles) as the single source of truth for how the stack runs locally.
- Keep Docker configuration minimal and clean: no unused services, no leftover volumes/ports from experiments.
- Environment-specific values (DB credentials, API URLs) belong in `.env` files, never hardcoded into Dockerfiles or compose config.
- Nginx should be configured as a reverse proxy in front of the Laravel API (and optionally the Next.js app); keep its config focused and documented inline only where behavior is non-obvious.

## Laravel Conventions

- Target Laravel 12 / PHP 8.3+ idioms: constructor property promotion, enums where appropriate, typed properties everywhere.
- Use Eloquent models with explicit relationships; avoid raw queries unless there's a concrete performance reason.
- Validate input via Form Request classes, not inline in controllers.
- Use Policies/Gates for role-based authorization tied to the user roles listed above.
- Use migrations for all schema changes — never hand-edit the database.
- Write feature/unit tests alongside new backend functionality using Laravel's testing tools (PHPUnit/Pest, whichever the project settles on first — check `composer.json` before assuming).

## Next.js Conventions

- Target Next.js 15 with the App Router and TypeScript throughout — no implicit `any`.
- Keep server/client component boundaries intentional: default to server components, opt into `"use client"` only where interactivity is needed.
- Co-locate a feature's components, hooks, and types rather than scattering by generic type (avoid premature global `components/`/`utils/` dumping grounds).
- Centralize API communication with the Laravel backend through a single, typed API client layer rather than ad hoc `fetch` calls scattered across components.
- Keep styling/component choices consistent once established early in the project — check existing patterns before introducing a new library or convention.

## Security Guidelines

- All authorization decisions (what a role can see/do) are enforced server-side in Laravel, never trusted from the frontend alone.
- Sanitize and validate all user input server-side, even if the frontend also validates.
- Use Laravel's built-in CSRF/auth/session or token (Sanctum) mechanisms rather than custom auth schemes.
- Keep secrets (DB passwords, API keys, app keys) only in `.env` files and Docker secrets — never in committed code, migrations, or seeders.
- Apply the principle of least privilege when designing role permissions — a role should only get access explicitly required by its responsibilities.

## Rules for Working with Claude Code

- Never invent project structure, files, models, routes, or components that don't exist — verify with the actual filesystem/codebase first.
- Never generate large amounts of code without prior approval; prefer small incremental changes and explain the plan before touching many files.
- Follow the Laravel and Next.js conventions above; if a needed convention isn't decided yet, ask rather than assume.
- If a requirement is unclear (role behavior, data model, UI/UX detail), ask a clarifying question instead of making an assumption.
- Keep Docker, Laravel, and Next.js configuration clean and minimal at all times — flag and remove cruft rather than letting it accumulate.
